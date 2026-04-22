import { getDb, ObjectId } from "./mongodb";
import { ENV } from "./_core/env";

// Types based on the previous Drizzle schema but adapted for MongoDB
export interface User {
  _id?: ObjectId;
  id?: number; // Keep for compatibility if needed
  openId: string;
  name?: string | null;
  email?: string | null;
  loginMethod?: string | null;
  role: "user" | "admin";
  createdAt: Date;
  updatedAt: Date;
  lastSignedIn: Date;
}

export interface Product {
  _id?: ObjectId;
  id?: number;
  name: string;
  description?: string | null;
  price: string;
  category: string;
  image?: string | null;
  tag?: string | null;
  stock: number;
  featured: "true" | "false";
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  _id?: ObjectId;
  id?: number;
  userId: string; // Using string for MongoDB ID or openId
  userEmail?: string | null;
  totalPrice: string;
  status: "pending" | "confirmed" | "shipped" | "completed" | "cancelled" | "preorder";
  paymentMethod: "mpesa" | "card" | "bank_transfer";
  paymentStatus: "pending" | "processing" | "completed" | "failed";
  mpesaReceiptNumber?: string | null;
  checkoutRequestId?: string | null;
  shippingCost: string;
  discount: string;
  notes?: string | null;
  shippingAddressStreet?: string | null;
  shippingAddressCity?: string | null;
  shippingAddressPostalCode?: string | null;
  shippingAddressCountry?: string | null;
  shippingAddressPhone?: string | null;
  billingAddressStreet?: string | null;
  billingAddressCity?: string | null;
  billingAddressPostalCode?: string | null;
  billingAddressCountry?: string | null;
  billingAddressPhone?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  _id?: ObjectId;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  price: string;
  customizationSize?: string | null;
  customizationColor?: string | null;
  customizationNotes?: string | null;
}

export interface CartItem {
  _id?: ObjectId;
  userId: string;
  productId: string;
  quantity: number;
  customizationSize?: string | null;
  customizationColor?: string | null;
  customizationNotes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export async function upsertUser(user: Partial<User> & { openId: string }): Promise<void> {
  const db = await getDb();
  const users = db.collection<User>("users");

  const updateSet: any = {
    ...user,
    updatedAt: new Date(),
  };

  if (!updateSet.role && user.openId === ENV.ownerOpenId) {
    updateSet.role = "admin";
  } else if (!updateSet.role) {
    updateSet.role = "user";
  }

  if (!updateSet.lastSignedIn) {
    updateSet.lastSignedIn = new Date();
  }

  await users.updateOne(
    { openId: user.openId },
    { 
      $set: updateSet,
      $setOnInsert: { createdAt: new Date() }
    },
    { upsert: true }
  );
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  const user = await db.collection<User>("users").findOne({ openId });
  return user || undefined;
}

// Product queries
export async function getAllProducts() {
  const db = await getDb();
  return db.collection<Product>("products").find().toArray();
}

export async function getProductById(id: string | number) {
  const db = await getDb();
  const query = typeof id === "string" && ObjectId.isValid(id) 
    ? { _id: new ObjectId(id) } 
    : { id: Number(id) };
  const product = await db.collection<Product>("products").findOne(query as any);
  return product || undefined;
}

export async function createProduct(data: any) {
  const db = await getDb();
  const result = await db.collection("products").insertOne({
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return result;
}

export async function updateProduct(id: string | number, data: any) {
  const db = await getDb();
  const query = typeof id === "string" && ObjectId.isValid(id) 
    ? { _id: new ObjectId(id) } 
    : { id: Number(id) };
  return db.collection("products").updateOne(query as any, {
    $set: { ...data, updatedAt: new Date() },
  });
}

export async function deleteProduct(id: string | number) {
  const db = await getDb();
  const query = typeof id === "string" && ObjectId.isValid(id) 
    ? { _id: new ObjectId(id) } 
    : { id: Number(id) };
  return db.collection("products").deleteOne(query as any);
}

// Order queries
export async function getOrdersByUserId(userId: string | number) {
  const db = await getDb();
  return db.collection<Order>("orders").find({ userId: String(userId) }).toArray();
}

export async function getOrderById(id: string | number) {
  const db = await getDb();
  const query = typeof id === "string" && ObjectId.isValid(id) 
    ? { _id: new ObjectId(id) } 
    : { id: Number(id) };
  const order = await db.collection<Order>("orders").findOne(query as any);
  return order || undefined;
}

export async function getAllOrders() {
  const db = await getDb();
  return db.collection<Order>("orders").find().toArray();
}

export async function createOrder(data: any) {
  const db = await getDb();
  const result = await db.collection("orders").insertOne({
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return result.insertedId;
}

export async function updateOrder(id: string | number, data: any) {
  const db = await getDb();
  const query = typeof id === "string" && ObjectId.isValid(id) 
    ? { _id: new ObjectId(id) } 
    : { id: Number(id) };
  return db.collection("orders").updateOne(query as any, {
    $set: { ...data, updatedAt: new Date() },
  });
}

// Order items queries
export async function getOrderItems(orderId: string | number) {
  const db = await getDb();
  return db.collection<OrderItem>("orderItems").find({ orderId: String(orderId) }).toArray();
}

export async function createOrderItem(data: any) {
  const db = await getDb();
  return db.collection("orderItems").insertOne(data);
}

// Cart queries
export async function getCartItems(userId: string | number) {
  const db = await getDb();
  return db.collection<CartItem>("cartItems").find({ userId: String(userId) }).toArray();
}

export async function addCartItem(data: any) {
  const db = await getDb();
  return db.collection("cartItems").insertOne({
    ...data,
    userId: String(data.userId),
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

export async function updateCartItem(id: string, data: any) {
  const db = await getDb();
  return db.collection("cartItems").updateOne(
    { _id: new ObjectId(id) },
    { $set: { ...data, updatedAt: new Date() } }
  );
}

export async function removeCartItem(id: string) {
  const db = await getDb();
  return db.collection("cartItems").deleteOne({ _id: new ObjectId(id) });
}

export async function clearUserCart(userId: string | number) {
  const db = await getDb();
  return db.collection("cartItems").deleteMany({ userId: String(userId) });
}
