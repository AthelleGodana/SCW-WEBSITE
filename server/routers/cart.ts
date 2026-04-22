import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import {
  getCartItems,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearUserCart,
  getProductById,
} from "../db";

const cartItemInputSchema = z.object({
  productId: z.number(),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  customizationSize: z.string().optional(),
  customizationColor: z.string().optional(),
  customizationNotes: z.string().optional(),
});

export const cartRouter = router({
  getCart: protectedProcedure.query(async ({ ctx }) => {
    try {
      const items = await getCartItems(ctx.user.id);
      return items;
    } catch (error) {
      console.error("Error fetching cart:", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),

  addItem: protectedProcedure
    .input(cartItemInputSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const product = await getProductById(input.productId);
        if (!product) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
        }

        if (product.stock < input.quantity) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Insufficient stock available",
          });
        }

        const result = await addCartItem({
          userId: ctx.user.id,
          productId: input.productId,
          quantity: input.quantity,
          customizationSize: input.customizationSize,
          customizationColor: input.customizationColor,
          customizationNotes: input.customizationNotes,
        });

        return result;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error adding to cart:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  updateItem: protectedProcedure
    .input(
      z.object({
        cartItemId: z.number(),
        quantity: z.number().int().min(1, "Quantity must be at least 1"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const items = await getCartItems(ctx.user.id);
        const cartItem = items.find((item) => item.id === input.cartItemId);

        if (!cartItem) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Cart item not found" });
        }

        const product = await getProductById(cartItem.productId);
        if (product && product.stock < input.quantity) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Insufficient stock available",
          });
        }

        await updateCartItem(input.cartItemId, { quantity: input.quantity });
        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error updating cart item:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  removeItem: protectedProcedure
    .input(z.object({ cartItemId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const items = await getCartItems(ctx.user.id);
        const cartItem = items.find((item) => item.id === input.cartItemId);

        if (!cartItem) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Cart item not found" });
        }

        await removeCartItem(input.cartItemId);
        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error removing cart item:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  clear: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      await clearUserCart(ctx.user.id);
      return { success: true };
    } catch (error) {
      console.error("Error clearing cart:", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
});
