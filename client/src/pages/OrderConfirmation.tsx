import { trpc } from "@/lib/trpc";
import { useRoute, Link } from "wouter";
import { CheckCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";

export default function OrderConfirmation() {
  const [, params] = useRoute("/order-confirmation/:id");
  const { isAuthenticated } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showMpesaForm, setShowMpesaForm] = useState(false);

  const orderId = params?.id || "";
  const { data: order, isLoading } = trpc.orders.getOrderDetail.useQuery(
    { orderId: orderId as any },
    { enabled: !!orderId && isAuthenticated }
  );

  const initiateMpesaMutation = trpc.payments.initiateMpesa.useMutation();

  const handleInitiateMpesa = async () => {
    if (!order || !phoneNumber) return;

    try {
      const result = await initiateMpesaMutation.mutateAsync({
        orderId: order.id,
        phoneNumber,
        amount: parseFloat(order.totalPrice as unknown as string),
      });

      if (result.success) {
        alert("M-Pesa prompt sent to your phone. Please enter your PIN to complete the payment.");
      } else {
        alert(`Failed to initiate payment: ${result.message}`);
      }
    } catch (error) {
      console.error("Error initiating M-Pesa:", error);
      alert("Failed to initiate M-Pesa payment");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-gray-600 text-lg mb-4">Please log in to view your order</p>
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

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-gray-600 text-lg mb-4">Order not found</p>
        <Link href="/shop">
          <a className="btn-primary">Continue Shopping</a>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        {/* Success Message */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="text-center mb-8">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Preorder Received!</h1>
            <p className="text-gray-600">Thank you for your preorder. We have received your request and will contact you soon.</p>
          </div>

          {/* Order Details */}
          <div className="card mb-8">
            <div className="card-header">
              <h2 className="font-semibold text-lg">Order Details</h2>
            </div>

            <div className="card-body space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Order Number</p>
                  <p className="font-semibold text-lg">#{order.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Order Date</p>
                  <p className="font-semibold text-lg">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm text-gray-600 mb-2">Status</p>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      order.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : order.status === "preorder"
                        ? "bg-purple-100 text-purple-800"
                        : order.status === "confirmed"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm text-gray-600 mb-2">Payment Status</p>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      order.paymentStatus === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : order.paymentStatus === "completed"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="card mb-8">
            <div className="card-header">
              <h2 className="font-semibold text-lg">Shipping Address</h2>
            </div>

            <div className="card-body">
              <p className="text-gray-700">{order.shippingAddressStreet}</p>
              <p className="text-gray-700">
                {order.shippingAddressCity}, {order.shippingAddressPostalCode}
              </p>
              <p className="text-gray-700">{order.shippingAddressCountry}</p>
              <p className="text-gray-700 mt-2">Phone: {order.shippingAddressPhone}</p>
            </div>
          </div>

          {/* Order Items */}
          {order.items && order.items.length > 0 && (
            <div className="card mb-8">
              <div className="card-header">
                <h2 className="font-semibold text-lg">Order Items</h2>
              </div>

              <div className="card-body divide-y">
                {order.items.map((item: any) => (
                  <div key={item._id || item.id} className="py-4 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{item.productName}</p>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-gray-900">
                      KES {(parseFloat(item.price as unknown as string) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="card-footer">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-lg">Total</span>
                  <span className="font-bold text-2xl text-blue-600">
                    KES {parseFloat(order.totalPrice as unknown as string).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* M-Pesa Payment Form */}
          {order.paymentMethod === "mpesa" && order.paymentStatus !== "completed" && (
            <div className="card mb-8">
              <div className="card-header">
                <h2 className="font-semibold text-lg">Complete Payment with M-Pesa</h2>
              </div>

              <div className="card-body space-y-4">
                <p className="text-gray-600">
                  Enter your M-Pesa phone number to receive a payment prompt.
                </p>

                {!showMpesaForm ? (
                  <button
                    onClick={() => setShowMpesaForm(true)}
                    className="w-full btn-primary"
                  >
                    Pay with M-Pesa
                  </button>
                ) : (
                  <div className="space-y-4">
                    <input
                      type="tel"
                      placeholder="Enter M-Pesa phone number (e.g., 0712345678)"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />

                    <div className="flex gap-4">
                      <button
                        onClick={handleInitiateMpesa}
                        disabled={!phoneNumber || initiateMpesaMutation.isPending}
                        className="flex-1 btn-primary"
                      >
                        {initiateMpesaMutation.isPending ? "Processing..." : "Send M-Pesa Prompt"}
                      </button>

                      <button
                        onClick={() => setShowMpesaForm(false)}
                        className="flex-1 btn-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Link href="/shop">
              <a className="flex-1 btn-secondary text-center">Continue Shopping</a>
            </Link>
            <Link href="/orders">
              <a className="flex-1 btn-primary text-center">View Orders</a>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
