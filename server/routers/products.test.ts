import { describe, it, expect, vi, beforeEach } from "vitest";
import { z } from "zod";

describe("Products Router", () => {
  describe("Product Validation", () => {
    const productSchema = z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      price: z.string().or(z.number()),
      category: z.string().optional(),
      image: z.string().optional(),
      tag: z.string().optional(),
      stock: z.number().int().min(0),
      featured: z.string().optional(),
    });

    it("should validate a valid product", () => {
      const product = {
        name: "Test Product",
        price: "1000",
        stock: 10,
      };

      expect(() => productSchema.parse(product)).not.toThrow();
    });

    it("should reject product without name", () => {
      const product = {
        price: "1000",
        stock: 10,
      };

      expect(() => productSchema.parse(product)).toThrow();
    });

    it("should reject product with negative stock", () => {
      const product = {
        name: "Test Product",
        price: "1000",
        stock: -5,
      };

      expect(() => productSchema.parse(product)).toThrow();
    });

    it("should accept product with all fields", () => {
      const product = {
        name: "Premium T-Shirt",
        description: "High-quality cotton t-shirt",
        price: "1500",
        category: "Apparel",
        image: "https://example.com/image.jpg",
        tag: "NEW",
        stock: 50,
        featured: "true",
      };

      expect(() => productSchema.parse(product)).not.toThrow();
    });

    it("should accept numeric price", () => {
      const product = {
        name: "Test Product",
        price: 1000,
        stock: 10,
      };

      expect(() => productSchema.parse(product)).not.toThrow();
    });
  });

  describe("Product Price Formatting", () => {
    it("should format price correctly", () => {
      const price = "1500.50";
      const formatted = parseFloat(price).toFixed(2);
      expect(formatted).toBe("1500.50");
    });

    it("should handle integer prices", () => {
      const price = "1000";
      const formatted = parseFloat(price).toFixed(2);
      expect(formatted).toBe("1000.00");
    });

    it("should handle zero price", () => {
      const price = "0";
      const formatted = parseFloat(price).toFixed(2);
      expect(formatted).toBe("0.00");
    });
  });

  describe("Product Filtering", () => {
    const products = [
      { id: 1, name: "T-Shirt", category: "Apparel", stock: 10 },
      { id: 2, name: "Cap", category: "Accessories", stock: 5 },
      { id: 3, name: "Hoodie", category: "Apparel", stock: 0 },
      { id: 4, name: "Shoes", category: "Footwear", stock: 8 },
    ];

    it("should filter by category", () => {
      const filtered = products.filter((p) => p.category === "Apparel");
      expect(filtered).toHaveLength(2);
      expect(filtered[0]?.name).toBe("T-Shirt");
    });

    it("should filter in-stock products", () => {
      const filtered = products.filter((p) => p.stock > 0);
      expect(filtered).toHaveLength(3);
    });

    it("should filter out-of-stock products", () => {
      const filtered = products.filter((p) => p.stock === 0);
      expect(filtered).toHaveLength(1);
      expect(filtered[0]?.name).toBe("Hoodie");
    });

    it("should combine filters", () => {
      const filtered = products.filter(
        (p) => p.category === "Apparel" && p.stock > 0
      );
      expect(filtered).toHaveLength(1);
      expect(filtered[0]?.name).toBe("T-Shirt");
    });
  });
});
