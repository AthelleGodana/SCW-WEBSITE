import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Loader2, Package, ShoppingBag, Users, TrendingUp } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { data: products, isLoading: productsLoading } = trpc.products.list.useQuery();
  const { data: orders, isLoading: ordersLoading } = trpc.orders.getAllOrders.useQuery();

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-gray-600 text-lg mb-4">Access denied. Admin only.</p>
        <Link href="/">
          <a className="btn-primary">Go Home</a>
        </Link>
      </div>
    );
  }

  const totalProducts = products?.length || 0;
  const totalOrders = orders?.length || 0;
  const totalRevenue =
    orders?.reduce((sum, order) => sum + parseFloat(order.totalPrice as unknown as string), 0) || 0;
  const pendingOrders = orders?.filter((o) => o.status === "pending").length || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your store and orders</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Products */}
          <div className="card">
            <div className="card-body flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="text-3xl font-bold text-gray-900">{totalProducts}</p>
              </div>
            </div>
          </div>

          {/* Total Orders */}
          <div className="card">
            <div className="card-body flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <ShoppingBag className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900">{totalOrders}</p>
              </div>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="card">
            <div className="card-body flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="text-purple-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">KES {totalRevenue.toFixed(0)}</p>
              </div>
            </div>
          </div>

          {/* Pending Orders */}
          <div className="card">
            <div className="card-body flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Users className="text-yellow-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending Orders</p>
                <p className="text-3xl font-bold text-gray-900">{pendingOrders}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Management */}
          <div className="card">
            <div className="card-header flex items-center justify-between">
              <h2 className="font-semibold text-lg">Product Management</h2>
              <Package className="text-blue-600" size={20} />
            </div>

            <div className="card-body space-y-4">
              <p className="text-gray-600">
                Manage your product catalog. Add new products, edit existing ones, or remove items
                from your inventory.
              </p>

              <div className="space-y-2">
                <Link href="/admin/products">
                  <a className="block w-full btn-primary text-center">Manage Products</a>
                </Link>
              </div>

              {productsLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="animate-spin text-blue-600" size={20} />
                </div>
              ) : (
                <div className="text-sm text-gray-600">
                  <p>Total products: <span className="font-semibold">{totalProducts}</span></p>
                </div>
              )}
            </div>
          </div>

          {/* Order Management */}
          <div className="card">
            <div className="card-header flex items-center justify-between">
              <h2 className="font-semibold text-lg">Order Management</h2>
              <ShoppingBag className="text-green-600" size={20} />
            </div>

            <div className="card-body space-y-4">
              <p className="text-gray-600">
                View all orders, update their status, and manage customer payments and shipments.
              </p>

              <div className="space-y-2">
                <Link href="/admin/orders">
                  <a className="block w-full btn-primary text-center">Manage Orders</a>
                </Link>
              </div>

              {ordersLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="animate-spin text-blue-600" size={20} />
                </div>
              ) : (
                <div className="text-sm text-gray-600">
                  <p>Total orders: <span className="font-semibold">{totalOrders}</span></p>
                  <p>Pending: <span className="font-semibold text-yellow-600">{pendingOrders}</span></p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
