import { z } from "zod";
import { protectedProcedure, router, publicProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { initiateMpesaPayment, queryMpesaTransactionStatus, validateMpesaCallback } from "../services/mpesa";
import { getOrderById, updateOrder } from "../db";

export const paymentsRouter = router({
  initiateMpesa: protectedProcedure
    .input(
      z.object({
        orderId: z.number(),
        phoneNumber: z.string(),
        amount: z.number().positive(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const order = await getOrderById(input.orderId);
        if (!order) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
        }

        if (order.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
        }

        const result = await initiateMpesaPayment(
          input.phoneNumber,
          input.amount,
          input.orderId,
          ctx.user.email || ""
        );

        if (result.success && result.checkoutRequestId) {
          await updateOrder(input.orderId, {
            checkoutRequestId: result.checkoutRequestId,
            paymentStatus: "processing",
          });
        }

        return result;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error initiating M-Pesa payment:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  queryStatus: protectedProcedure
    .input(
      z.object({
        orderId: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const order = await getOrderById(input.orderId);
        if (!order) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
        }

        if (order.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
        }

        if (!order.checkoutRequestId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "No payment initiated for this order",
          });
        }

        const result = await queryMpesaTransactionStatus(order.checkoutRequestId);
        return result;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error querying M-Pesa status:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  mpesaCallback: publicProcedure
    .input(z.unknown())
    .mutation(async ({ input }) => {
      try {
        const callbackResult = validateMpesaCallback(input);

        if (callbackResult.success) {
          console.log("Payment successful:", callbackResult);
          // In a real implementation, you would extract the order ID from the callback
          // and update the order status to "confirmed" and paymentStatus to "completed"
        } else {
          console.log("Payment failed:", callbackResult);
        }

        return { success: true };
      } catch (error) {
        console.error("Error processing M-Pesa callback:", error);
        return { success: false, error: "Failed to process callback" };
      }
    }),
});
