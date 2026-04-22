import { trpc } from "@/lib/trpc";
import { useRoute, Link } from "wouter";
import { ShoppingCart, ArrowLeft, Loader2 } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

export default function ProductDetail() {
  const [, params] = useRoute("/product/:id");
  const { user, isAuthenticated } = useAuth();
  const [quantity, setQuantity] = useState(1);

  const productId = params?.id ? parseInt(params.id) : 0;
  const { data: product, isLoading } = trpc.products.getById.useQuery(
    { id: productId },
    { enabled: productId > 0 }
  );

  const addToCartMutation = trpc.cart.addItem.useMutation();

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }

    if (!product) return;

    try {
      await addToCartMutation.mutateAsync({
        productId: product.id,
        quantity,
      });
      alert("Product added to cart!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add product to cart");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-gray-600 text-lg mb-4">Product not found</p>
        <Link href="/shop">
          <a className="btn-primary">Back to Shop</a>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        {/* Back Button */}
        <Link href="/shop">
          <a className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-8">
            <ArrowLeft size={20} />
            Back to Shop
          </a>
        </Link>

        {/* Product Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Image */}
          <div className="flex items-center justify-center bg-white rounded-lg p-8">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="max-w-full h-auto max-h-96"
              />
            ) : (
              <div className="w-full h-96 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-gray-500">No image available</span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col gap-6">
            {/* Tag */}
            {product.tag && (
              <span className="inline-block w-fit px-3 py-1 text-sm font-semibold bg-blue-100 text-blue-800 rounded">
                {product.tag}
              </span>
            )}

            {/* Name */}
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <p className="text-gray-600">{product.category}</p>
            </div>

            {/* Price */}
            <div className="text-3xl font-bold text-blue-600">
              KES {parseFloat(product.price as unknown as string).toFixed(2)}
            </div>

            {/* Description */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
              <p className="text-gray-600 leading-relaxed">
                {product.description || "No description available"}
              </p>
            </div>

            {/* Stock */}
            <div className="flex items-center gap-4">
              <span className="text-gray-600">
                {product.stock > 0 ? (
                  <span className="text-green-600 font-semibold">{product.stock} in stock</span>
                ) : (
                  <span className="text-red-600 font-semibold">Out of stock</span>
                )}
              </span>
            </div>

            {/* Quantity and Add to Cart */}
            {product.stock > 0 && (
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 text-center border-l border-r border-gray-300 py-2"
                    min="1"
                    max={product.stock}
                  />
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={addToCartMutation.isPending}
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={20} />
                  {addToCartMutation.isPending ? "Adding..." : "Add to Cart"}
                </button>
              </div>
            )}

            {/* Featured Badge */}
            {product.featured === "true" && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 font-semibold">⭐ Featured Product</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
