import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";
import { ShoppingCart, Zap, Shield, Truck } from "lucide-react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Premium Brand Merchandise
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Discover our exclusive collection of high-quality apparel, accessories, and more.
            </p>
            <div className="flex gap-4">
              <Link href="/shop">
                <a className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 font-bold rounded-lg hover:bg-gray-100 transition-colors">
                  <ShoppingCart size={20} />
                  Shop Now
                </a>
              </Link>
              {!isAuthenticated && (
                <Link href="/orders">
                  <a className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white text-white font-bold rounded-lg hover:bg-white hover:text-blue-600 transition-colors">
                    View Orders
                  </a>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">Why Choose Us</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card">
              <div className="card-body text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-blue-100 rounded-lg">
                    <Zap className="text-blue-600" size={32} />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Fast Shipping</h3>
                <p className="text-gray-600">
                  Quick and reliable delivery to your doorstep within 3-5 business days.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="card">
              <div className="card-body text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-green-100 rounded-lg">
                    <Shield className="text-green-600" size={32} />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure Payment</h3>
                <p className="text-gray-600">
                  Multiple payment options including M-Pesa, cards, and bank transfers.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="card">
              <div className="card-body text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-purple-100 rounded-lg">
                    <Truck className="text-purple-600" size={32} />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Quality Assured</h3>
                <p className="text-gray-600">
                  Premium materials and craftsmanship in every product we offer.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">Featured Products</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Product Card 1 */}
            <div className="card hover:shadow-lg transition-shadow">
              <div className="w-full h-48 bg-gray-300 rounded-t-lg flex items-center justify-center">
                <span className="text-gray-500">Product Image</span>
              </div>
              <div className="card-body">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">Premium T-Shirt</h3>
                <p className="text-gray-600 text-sm mb-4">
                  High-quality cotton t-shirt with custom branding
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-blue-600">KES 1,500</span>
                  <span className="text-sm text-gray-600">In Stock</span>
                </div>
              </div>
              <div className="card-footer">
                <Link href="/shop">
                  <a className="w-full btn-primary block text-center">View Details</a>
                </Link>
              </div>
            </div>

            {/* Product Card 2 */}
            <div className="card hover:shadow-lg transition-shadow">
              <div className="w-full h-48 bg-gray-300 rounded-t-lg flex items-center justify-center">
                <span className="text-gray-500">Product Image</span>
              </div>
              <div className="card-body">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">Branded Cap</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Stylish adjustable cap with embroidered logo
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-blue-600">KES 800</span>
                  <span className="text-sm text-gray-600">In Stock</span>
                </div>
              </div>
              <div className="card-footer">
                <Link href="/shop">
                  <a className="w-full btn-primary block text-center">View Details</a>
                </Link>
              </div>
            </div>

            {/* Product Card 3 */}
            <div className="card hover:shadow-lg transition-shadow">
              <div className="w-full h-48 bg-gray-300 rounded-t-lg flex items-center justify-center">
                <span className="text-gray-500">Product Image</span>
              </div>
              <div className="card-body">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">Hoodie Jacket</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Comfortable hoodie with premium fleece lining
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-blue-600">KES 2,500</span>
                  <span className="text-sm text-gray-600">In Stock</span>
                </div>
              </div>
              <div className="card-footer">
                <Link href="/shop">
                  <a className="w-full btn-primary block text-center">View Details</a>
                </Link>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link href="/shop">
              <a className="btn-primary inline-flex items-center gap-2">
                <ShoppingCart size={20} />
                Browse All Products
              </a>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Shop?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Browse our collection and find your favorite items today.
          </p>
          <Link href="/shop">
            <a className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 font-bold rounded-lg hover:bg-gray-100 transition-colors">
              <ShoppingCart size={20} />
              Start Shopping
            </a>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold mb-4">About Us</h3>
              <p className="text-sm">
                SCW Brand is your premier destination for high-quality merchandise and apparel.
              </p>
            </div>

            <div>
              <h3 className="text-white font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/shop">
                    <a className="hover:text-white transition-colors">Shop</a>
                  </Link>
                </li>
                <li>
                  <Link href="/orders">
                    <a className="hover:text-white transition-colors">Orders</a>
                  </Link>
                </li>
                {isAuthenticated && user?.role === "admin" && (
                  <li>
                    <Link href="/admin">
                      <a className="hover:text-white transition-colors">Admin</a>
                    </Link>
                  </li>
                )}
              </ul>
            </div>

            <div>
              <h3 className="text-white font-bold mb-4">Contact</h3>
              <p className="text-sm">Email: info@scwbrand.com</p>
              <p className="text-sm">Phone: +254 712 345 678</p>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2026 SCW Brand. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
