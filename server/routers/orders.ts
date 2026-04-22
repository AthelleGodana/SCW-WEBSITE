import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import {
  getOrdersByUserId,
  getOrderById,
  getAllOrders,
  createOrder,
  updateOrder,
  getOrderItems,
  createOrderItem,
  getCartItems,
  clearUserCart,
  getProductById,
} from "../db";

const createOrderInputSchema = z.object({
  shippingAddressStreet: z.string(),
  shippingAddressCity: z.string(),
  shippingAddressPostalCode: z.string(),
  shippingAddressCountry: z.string(),
  shippingAddressPhone: z.string(),
  billingAddressStreet: z.string().optional(),
  billingAddressCity: z.string().optional(),
  billingAddressPostalCode: z.string().optional(),
  billingAddressCountry: z.string().optional(),
  billingAddressPhone: z.string().optional(),
  paymentMethod: z.enum(["mpesa", "card", "bank_transfer"]).default("mpesa"),
});

function createAdminProcedure(procedure: typeof protectedProcedure) {
  return procedure.use(({ ctx, next }) => {
    if (ctx.user?.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
    }
    return next({ ctx });
  });
}

export const ordersRouter = router({
  getMyOrders: protectedProcedure.query(async ({ ctx }) => {
    try {
      const orders = await getOrdersByUserId(ctx.user.id);
      return orders;
    } catch (error) {
      console.error("Error fetching user orders:", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),

  getOrderDetail: protectedProcedure
    .input(z.object({ orderId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const order = await getOrderById(input.orderId);
        if (!order) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
        }

        if (order.userId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
        }

        const items = await getOrderItems(input.orderId);
        return { ...order, items };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error fetching order detail:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  create: protectedProcedure
    .input(createOrderInputSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const cartItems = await getCartItems(ctx.user.id);

        if (cartItems.length === 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Cart is empty",
          });
        }

        let totalPrice = 0;
        for (const cartItem of cartItems) {
          const product = await getProductById(cartItem.productId);
          if (!product) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: `Product ${cartItem.productId} not found`,
            });
          }
          totalPrice += parseFloat(product.price as unknown as string) * cartItem.quantity;
        }

        const order = await createOrder({
          userId: ctx.user.id,
          userEmail: ctx.user.email,
          totalPrice: totalPrice.toString(),
          status: "pending",
          paymentMethod: input.paymentMethod,
          paymentStatus: "pending",
          shippingAddressStreet: input.shippingAddressStreet,
          shippingAddressCity: input.shippingAddressCity,
          shippingAddressPostalCode: input.shippingAddressPostalCode,
          shippingAddressCountry: input.shippingAddressCountry,
          shippingAddressPhone: input.shippingAddressPhone,
          billingAddressStreet: input.billingAddressStreet,
          billingAddressCity: input.billingAddressCity,
          billingAddressPostalCode: input.billingAddressPostalCode,
          billingAddressCountry: input.billingAddressCountry,
          billingAddressPhone: input.billingAddressPhone,
        });

        const orderId = (order as any).insertId || order;

        for (const cartItem of cartItems) {
          const product = await getProductById(cartItem.productId);
          if (product) {
            await createOrderItem({
              orderId: orderId as number,
              productId: cartItem.productId,
              productName: product.name,
              quantity: cartItem.quantity,
              price: product.price as unknown as string,
              customizationSize: cartItem.customizationSize,
              customizationColor: cartItem.customizationColor,
              customizationNotes: cartItem.customizationNotes,
            });
          }
        }

        await clearUserCart(ctx.user.id);

        return { orderId, totalPrice };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error creating order:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  getAllOrders: createAdminProcedure(protectedProcedure).query(async () => {
    try {
      const orders = await getAllOrders();
      return orders;
    } catch (error) {
      console.error("Error fetching all orders:", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),

  updateStatus: createAdminProcedure(protectedProcedure)
    .input(
      z.object({
        orderId: z.number(),
        status: z.enum(["pending", "confirmed", "shipped", "completed", "cancelled"]),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const order = await getOrderById(input.orderId);
        if (!order) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
        }

        await updateOrder(input.orderId, { status: input.status });
        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error updating order status:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
});
