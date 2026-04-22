import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Loader2, ChevronRight } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState } from "react";

export default function AdminOrders() {
  const { user } = useAuth();
  const { data: orders, isLoading, refetch } = trpc.orders.getAllOrders.useQuery();
  const updateStatusMutation = trpc.orders.updateStatus.useMutation({ onSuccess: () => refetch() });

  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

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

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await updateStatusMutation.mutateAsync({
        orderId,
        status: newStatus as "pending" | "confirmed" | "shipped" | "completed" | "cancelled",
      });
      alert("Order status updated successfully");
    } catch (error) {
      alert("Failed to update order status");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Order Management</h1>
          <p className="text-gray-600">View and manage all customer orders</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-blue-600" size={32} />
          </div>
        ) : orders && orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="card">
                <div
                  className="card-body cursor-pointer"
                  onClick={() =>
                    setExpandedOrderId(expandedOrderId === order.id ? null : order.id)
                  }
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                        {/* Order ID */}
                        <div>
                          <p className="text-sm text-gray-600">Order ID</p>
                          <p className="font-semibold">#{order.id}</p>
                        </div>

                        {/* Customer Email */}
                        <div>
                          <p className="text-sm text-gray-600">Customer</p>
                          <p className="font-semibold text-sm">{order.userEmail || "N/A"}</p>
                        </div>

                        {/* Amount */}
                        <div>
                          <p className="text-sm text-gray-600">Amount</p>
                          <p className="font-semibold text-blue-600">
                            KES {parseFloat(order.totalPrice as unknown as string).toFixed(2)}
                          </p>
                        </div>

                        {/* Status */}
                        <div>
                          <p className="text-sm text-gray-600">Status</p>
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                              order.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : order.status === "confirmed"
                                ? "bg-blue-100 text-blue-800"
                                : order.status === "shipped"
                                ? "bg-purple-100 text-purple-800"
                                : order.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>

                        {/* Toggle */}
                        <div className="flex justify-end">
                          <ChevronRight
                            className={`text-gray-400 transition-transform ${
                              expandedOrderId === order.id ? "rotate-90" : ""
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedOrderId === order.id && (
                    <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
                      {/* Shipping Address */}
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Shipping Address</h3>
                        <p className="text-sm text-gray-600">{order.shippingAddressStreet}</p>
                        <p className="text-sm text-gray-600">
                          {order.shippingAddressCity}, {order.shippingAddressPostalCode}
                        </p>
                        <p className="text-sm text-gray-600">{order.shippingAddressCountry}</p>
                        <p className="text-sm text-gray-600">Phone: {order.shippingAddressPhone}</p>
                      </div>

                      {/* Payment Info */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Payment Method</p>
                          <p className="font-semibold text-gray-900 capitalize">
                            {order.paymentMethod.replace("_", " ")}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Payment Status</p>
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                              order.paymentStatus === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : order.paymentStatus === "completed"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {order.paymentStatus.charAt(0).toUpperCase() +
                              order.paymentStatus.slice(1)}
                          </span>
                        </div>
                      </div>

                      {order.mpesaReceiptNumber && (
                        <div>
                          <p className="text-sm text-gray-600">M-Pesa Receipt</p>
                          <p className="font-semibold text-gray-900">{order.mpesaReceiptNumber}</p>
                        </div>
                      )}

                      {/* Status Update */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Update Status
                        </label>
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="shipped">Shipped</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>

                      {/* Order Date */}
                      <div className="text-sm text-gray-600">
                        <p>
                          Ordered on {new Date(order.createdAt).toLocaleDateString()} at{" "}
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No orders found</p>
          </div>
        )}
      </div>
    </div>
  );
}
