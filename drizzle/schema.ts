import { decimal, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Products table
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  category: varchar("category", { length: 100 }).default("Apparel").notNull(),
  image: text("image"),
  tag: varchar("tag", { length: 50 }),
  stock: int("stock").default(0).notNull(),
  featured: mysqlEnum("featured", ["true", "false"]).default("false").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

// Orders table
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  userEmail: varchar("userEmail", { length: 320 }),
  totalPrice: decimal("totalPrice", { precision: 10, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["pending", "confirmed", "shipped", "completed", "cancelled"]).default("pending").notNull(),
  paymentMethod: mysqlEnum("paymentMethod", ["mpesa", "card", "bank_transfer"]).default("mpesa").notNull(),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "processing", "completed", "failed"]).default("pending").notNull(),
  mpesaReceiptNumber: varchar("mpesaReceiptNumber", { length: 100 }),
  checkoutRequestId: varchar("checkoutRequestId", { length: 255 }),
  shippingCost: decimal("shippingCost", { precision: 10, scale: 2 }).default("0").notNull(),
  discount: decimal("discount", { precision: 10, scale: 2 }).default("0").notNull(),
  notes: text("notes"),
  shippingAddressStreet: varchar("shippingAddressStreet", { length: 255 }),
  shippingAddressCity: varchar("shippingAddressCity", { length: 100 }),
  shippingAddressPostalCode: varchar("shippingAddressPostalCode", { length: 20 }),
  shippingAddressCountry: varchar("shippingAddressCountry", { length: 100 }),
  shippingAddressPhone: varchar("shippingAddressPhone", { length: 20 }),
  billingAddressStreet: varchar("billingAddressStreet", { length: 255 }),
  billingAddressCity: varchar("billingAddressCity", { length: 100 }),
  billingAddressPostalCode: varchar("billingAddressPostalCode", { length: 20 }),
  billingAddressCountry: varchar("billingAddressCountry", { length: 100 }),
  billingAddressPhone: varchar("billingAddressPhone", { length: 20 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

// Order items table
export const orderItems = mysqlTable("orderItems", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  productId: int("productId").notNull(),
  productName: varchar("productName", { length: 255 }).notNull(),
  quantity: int("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  customizationSize: varchar("customizationSize", { length: 50 }),
  customizationColor: varchar("customizationColor", { length: 50 }),
  customizationNotes: text("customizationNotes"),
});

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

// Cart items table
export const cartItems = mysqlTable("cartItems", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  productId: int("productId").notNull(),
  quantity: int("quantity").notNull().default(1),
  customizationSize: varchar("customizationSize", { length: 50 }),
  customizationColor: varchar("customizationColor", { length: 50 }),
  customizationNotes: text("customizationNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = typeof cartItems.$inferInsert;