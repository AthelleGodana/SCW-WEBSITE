import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Trash2, ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

export default function Cart() {
  const { isAuthenticated } = useAuth();
  const { data: cartItems, isLoading, refetch } = trpc.cart.getCart.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const removeItemMutation = trpc.cart.removeItem.useMutation({
    onSuccess: () => refetch(),
  });

  const updateItemMutation = trpc.cart.updateItem.useMutation({
    onSuccess: () => refetch(),
  });

  const clearCartMutation = trpc.cart.clear.useMutation({
    onSuccess: () => refetch(),
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-gray-600 text-lg mb-4">Please log in to view your cart</p>
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

  const total =
    cartItems?.reduce((sum, item) => {
      // Calculate price from product data if available
      return sum;
    }, 0) || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link href="/shop">
            <a className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4">
              <ArrowLeft size={20} />
              Continue Shopping
            </a>
          </Link>
          <h1 className="text-4xl font-bold text-gray-900">Shopping Cart</h1>
        </div>

        {cartItems && cartItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="card">
                <div className="card-header flex items-center justify-between">
                  <h2 className="font-semibold text-lg">Items ({cartItems.length})</h2>
                  <button
                    onClick={() => clearCartMutation.mutate()}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Clear Cart
                  </button>
                </div>

                <div className="card-body divide-y">
                  {cartItems.map((item: any) => (
                    <div key={item._id || item.id} className="py-4 flex gap-4">
                      {/* Item Info */}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">Product ID: {item.productId}</h3>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        {item.customizationSize && (
                          <p className="text-sm text-gray-600">Size: {item.customizationSize}</p>
                        )}
                        {item.customizationColor && (
                          <p className="text-sm text-gray-600">Color: {item.customizationColor}</p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            updateItemMutation.mutate({
                              cartItemId: item._id || item.id,
                              quantity: Math.max(1, parseInt(e.target.value) || 1),
                            })
                          }
                          min="1"
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                        />
                        <button
                          onClick={() => removeItemMutation.mutate({ cartItemId: item._id || item.id })}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Cart Summary */}
            <div className="lg:col-span-1">
              <div className="card sticky top-24">
                <div className="card-header">
                  <h2 className="font-semibold text-lg">Order Summary</h2>
                </div>

                <div className="card-body space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">KES {total.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-semibold">KES 0.00</span>
                  </div>
                  <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
                    <span className="font-semibold text-lg">Total</span>
                    <span className="font-bold text-2xl text-blue-600">KES {total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="card-footer">
                  <Link href="/checkout">
                    <a className="w-full btn-primary block text-center">Proceed to Checkout</a>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">Your cart is empty</p>
            <Link href="/shop">
              <a className="btn-primary">Continue Shopping</a>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
