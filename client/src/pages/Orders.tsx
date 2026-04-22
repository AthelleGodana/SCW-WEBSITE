import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Loader2, ChevronRight } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

export default function Orders() {
  const { isAuthenticated } = useAuth();
  const { data: orders, isLoading } = trpc.orders.getMyOrders.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-gray-600 text-lg mb-4">Please log in to view your orders</p>
        <a href={getLoginUrl()} className="btn-primary">
          Login
        </a>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">View and manage your orders</p>
        </div>

        {orders && orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link key={order.id} href={`/order-confirmation/${order.id}`}>
                <a className="card hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="card-body">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                      {/* Order ID */}
                      <div>
                        <p className="text-sm text-gray-600">Order ID</p>
                        <p className="font-semibold text-lg">#{order.id}</p>
                      </div>

                      {/* Date */}
                      <div>
                        <p className="text-sm text-gray-600">Date</p>
                        <p className="font-semibold">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Amount */}
                      <div>
                        <p className="text-sm text-gray-600">Amount</p>
                        <p className="font-semibold text-blue-600">
                          KES {parseFloat(order.totalPrice as unknown as string).toFixed(2)}
                        </p>
                      </div>

                      {/* Status */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Status</p>
                          <div className="flex gap-2 mt-1">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
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
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                order.paymentStatus === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : order.paymentStatus === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {order.paymentStatus === "pending"
                                ? "Unpaid"
                                : order.paymentStatus === "completed"
                                ? "Paid"
                                : "Failed"}
                            </span>
                          </div>
                        </div>

                        <ChevronRight className="text-gray-400" />
                      </div>
                    </div>
                  </div>
                </a>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">You haven't placed any orders yet</p>
            <Link href="/shop">
              <a className="btn-primary">Start Shopping</a>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
