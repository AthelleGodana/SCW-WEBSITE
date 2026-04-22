import { z } from "zod";
import { publicProcedure, router, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../db";

const productInputSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  category: z.string().optional(),
  image: z.string().optional(),
  tag: z.string().optional(),
  stock: z.number().int().min(0, "Stock cannot be negative").optional(),
  featured: z.boolean().optional(),
});

function createAdminProcedure(procedure: typeof protectedProcedure) {
  return procedure.use(({ ctx, next }) => {
    if (ctx.user?.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
    }
    return next({ ctx });
  });
}

export const productsRouter = router({
  list: publicProcedure.query(async () => {
    try {
      const products = await getAllProducts();
      return products;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      try {
        const product = await getProductById(input.id);
        if (!product) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
        }
        return product;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error fetching product:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  create: createAdminProcedure(protectedProcedure)
    .input(productInputSchema)
    .mutation(async ({ input }) => {
      try {
        const result = await createProduct({
          name: input.name,
          description: input.description,
          price: input.price.toString(),
          category: input.category || "Apparel",
          image: input.image,
          tag: input.tag,
          stock: input.stock || 0,
          featured: input.featured ? "true" : "false",
        });
        return result;
      } catch (error) {
        console.error("Error creating product:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  update: createAdminProcedure(protectedProcedure)
    .input(
      z.object({
        id: z.number(),
        data: productInputSchema.partial(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const product = await getProductById(input.id);
        if (!product) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
        }

        const updateData: Record<string, unknown> = {};
        if (input.data.name !== undefined) updateData.name = input.data.name;
        if (input.data.description !== undefined) updateData.description = input.data.description;
        if (input.data.price !== undefined) updateData.price = input.data.price.toString();
        if (input.data.category !== undefined) updateData.category = input.data.category;
        if (input.data.image !== undefined) updateData.image = input.data.image;
        if (input.data.tag !== undefined) updateData.tag = input.data.tag;
        if (input.data.stock !== undefined) updateData.stock = input.data.stock;
        if (input.data.featured !== undefined)
          updateData.featured = input.data.featured ? "true" : "false";

        await updateProduct(input.id, updateData);
        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error updating product:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  delete: createAdminProcedure(protectedProcedure)
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      try {
        const product = await getProductById(input.id);
        if (!product) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
        }

        await deleteProduct(input.id);
        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error deleting product:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
});
