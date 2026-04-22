import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState } from "react";
import { z, ZodIssue } from "zod";

const checkoutSchema = z.object({
  shippingAddressStreet: z.string().min(1, "Street is required"),
  shippingAddressCity: z.string().min(1, "City is required"),
  shippingAddressPostalCode: z.string().min(1, "Postal code is required"),
  shippingAddressCountry: z.string().min(1, "Country is required"),
  shippingAddressPhone: z.string().min(1, "Phone is required"),
  billingAddressStreet: z.string().optional(),
  billingAddressCity: z.string().optional(),
  billingAddressPostalCode: z.string().optional(),
  billingAddressCountry: z.string().optional(),
  billingAddressPhone: z.string().optional(),
  paymentMethod: z.enum(["mpesa", "card", "bank_transfer"]).default("mpesa"),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState<CheckoutFormData>({
    shippingAddressStreet: "",
    shippingAddressCity: "",
    shippingAddressPostalCode: "",
    shippingAddressCountry: "Kenya",
    shippingAddressPhone: "",
    paymentMethod: "mpesa",
  });

  const [useSameAddress, setUseSameAddress] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createOrderMutation = trpc.orders.create.useMutation();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const finalData = {
        ...formData,
        ...(useSameAddress && {
          billingAddressStreet: formData.shippingAddressStreet,
          billingAddressCity: formData.shippingAddressCity,
          billingAddressPostalCode: formData.shippingAddressPostalCode,
          billingAddressCountry: formData.shippingAddressCountry,
          billingAddressPhone: formData.shippingAddressPhone,
        }),
      };

      checkoutSchema.parse(finalData);

      const result = await createOrderMutation.mutateAsync(finalData);
      setLocation(`/order-confirmation/${result.orderId}`);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        (error as z.ZodError).issues.forEach((issue: z.ZodIssue) => {
          const path = issue.path[0];
          if (path) newErrors[path as string] = issue.message;
        });
        setErrors(newErrors);
      } else {
        console.error("Checkout error:", error);
        alert("Failed to create order");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <Link href="/cart">
          <a className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-8">
            <ArrowLeft size={20} />
            Back to Cart
          </a>
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-8">Preorder Checkout</h1>

        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                You are placing a <strong>preorder</strong>. We will contact you once the items are ready for shipment.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Shipping Address */}
              <div className="card">
                <div className="card-header">
                  <h2 className="font-semibold text-lg">Shipping Address</h2>
                </div>

                <div className="card-body space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      name="shippingAddressStreet"
                      value={formData.shippingAddressStreet}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.shippingAddressStreet && (
                      <p className="text-red-600 text-sm mt-1">{errors.shippingAddressStreet}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        name="shippingAddressCity"
                        value={formData.shippingAddressCity}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {errors.shippingAddressCity && (
                        <p className="text-red-600 text-sm mt-1">{errors.shippingAddressCity}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Postal Code *
                      </label>
                      <input
                        type="text"
                        name="shippingAddressPostalCode"
                        value={formData.shippingAddressPostalCode}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {errors.shippingAddressPostalCode && (
                        <p className="text-red-600 text-sm mt-1">{errors.shippingAddressPostalCode}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country *
                      </label>
                      <input
                        type="text"
                        name="shippingAddressCountry"
                        value={formData.shippingAddressCountry}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {errors.shippingAddressCountry && (
                        <p className="text-red-600 text-sm mt-1">{errors.shippingAddressCountry}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        name="shippingAddressPhone"
                        value={formData.shippingAddressPhone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {errors.shippingAddressPhone && (
                        <p className="text-red-600 text-sm mt-1">{errors.shippingAddressPhone}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Billing Address */}
              <div className="card">
                <div className="card-header">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useSameAddress}
                      onChange={(e) => setUseSameAddress(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <span className="font-semibold">Billing address same as shipping</span>
                  </label>
                </div>

                {!useSameAddress && (
                  <div className="card-body space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Street Address
                      </label>
                      <input
                        type="text"
                        name="billingAddressStreet"
                        value={formData.billingAddressStreet || ""}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        name="billingAddressCity"
                        placeholder="City"
                        value={formData.billingAddressCity || ""}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        name="billingAddressPostalCode"
                        placeholder="Postal Code"
                        value={formData.billingAddressPostalCode || ""}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        name="billingAddressCountry"
                        placeholder="Country"
                        value={formData.billingAddressCountry || ""}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="tel"
                        name="billingAddressPhone"
                        placeholder="Phone"
                        value={formData.billingAddressPhone || ""}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div className="card">
                <div className="card-header">
                  <h2 className="font-semibold text-lg">Payment Method</h2>
                </div>

                <div className="card-body space-y-3">
                  <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="mpesa"
                      checked={formData.paymentMethod === "mpesa"}
                      onChange={handleInputChange}
                      className="w-4 h-4"
                    />
                    <span className="font-medium">M-Pesa</span>
                  </label>

                  <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={formData.paymentMethod === "card"}
                      onChange={handleInputChange}
                      className="w-4 h-4"
                    />
                    <span className="font-medium">Credit/Debit Card</span>
                  </label>

                  <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank_transfer"
                      checked={formData.paymentMethod === "bank_transfer"}
                      onChange={handleInputChange}
                      className="w-4 h-4"
                    />
                    <span className="font-medium">Bank Transfer</span>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={createOrderMutation.isPending}
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                {createOrderMutation.isPending ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Processing...
                  </>
                ) : (
                  "Place Preorder"
                )}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card sticky top-24">
              <div className="card-header">
                <h2 className="font-semibold text-lg">Order Summary</h2>
              </div>

              <div className="card-body space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">KES 0.00</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold">KES 0.00</span>
                </div>
                <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
                  <span className="font-semibold text-lg">Total</span>
                  <span className="font-bold text-2xl text-blue-600">KES 0.00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
