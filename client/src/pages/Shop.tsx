import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { ShoppingCart, Loader2 } from "lucide-react";
import { useState } from "react";

export default function Shop() {
  const { data: products, isLoading } = trpc.products.list.useQuery();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredProducts = selectedCategory
    ? products?.filter((p) => p.category === selectedCategory)
    : products;

  const categories = Array.from(new Set(products?.map((p) => p.category) || []));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Shop</h1>
          <p className="text-gray-600">Browse our collection of premium merchandise</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Categories */}
          <div className="lg:col-span-1">
            <div className="card">
              <div className="card-header">
                <h2 className="font-semibold text-lg">Categories</h2>
              </div>
              <div className="card-body flex flex-col gap-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`text-left px-4 py-2 rounded-lg transition-colors ${
                    selectedCategory === null
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  All Products
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`text-left px-4 py-2 rounded-lg transition-colors ${
                      selectedCategory === category
                        ? "bg-blue-600 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content - Products Grid */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-blue-600" size={32} />
              </div>
            ) : filteredProducts && filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <Link key={product.id} href={`/product/${product.id}`}>
                    <a className="group card hover:shadow-lg transition-shadow">
                      {/* Product Image */}
                      <div className="w-full h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-300">
                            <span className="text-gray-500">No image</span>
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="card-body">
                        {/* Tag */}
                        {product.tag && (
                          <span className="inline-block px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded mb-2">
                            {product.tag}
                          </span>
                        )}

                        {/* Name */}
                        <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                          {product.name}
                        </h3>

                        {/* Description */}
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {product.description || "No description available"}
                        </p>

                        {/* Price and Stock */}
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-blue-600">
                            KES {parseFloat(product.price as unknown as string).toFixed(2)}
                          </span>
                          <span className="text-sm text-gray-600">
                            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                          </span>
                        </div>
                      </div>

                      {/* Add to Cart Button */}
                      <div className="card-footer">
                        <button
                          className="w-full btn-primary flex items-center justify-center gap-2"
                          disabled={product.stock === 0}
                        >
                          <ShoppingCart size={18} />
                          Add to Cart
                        </button>
                      </div>
                    </a>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No products found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
