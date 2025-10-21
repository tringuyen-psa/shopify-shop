import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Checkout</h1>
          <p className="text-gray-600">
            Start your checkout process by entering your session ID or shop details
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Start Checkout</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Quick Start Options */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Quick Start</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link href="/shops/sample-shop/products/sample-product">
                      <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center">
                        <span className="text-2xl mb-2">🛍️</span>
                        <span>Browse Products</span>
                      </Button>
                    </Link>
                    <Link href="/shops">
                      <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center">
                        <span className="text-2xl mb-2">🏪</span>
                        <span>View All Shops</span>
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Or Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-gray-50 text-gray-500">Or</span>
                  </div>
                </div>

                {/* Session ID Input */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Have a Checkout Session?</h3>
                  <p className="text-sm text-gray-600">
                    If you have a checkout session ID, enter it below to continue your purchase.
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter checkout session ID"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Button>Continue</Button>
                  </div>
                </div>

                {/* Sample Sessions */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Sample Checkouts</h3>
                  <p className="text-sm text-gray-600">
                    Try these sample checkout sessions to test the flow:
                  </p>
                  <div className="space-y-2">
                    {[
                      { id: "cs_sample_digital", name: "Digital Product", price: "$9.99" },
                      { id: "cs_sample_physical", name: "Physical Product", price: "$29.99" },
                      { id: "cs_sample_subscription", name: "Monthly Subscription", price: "$19.99/mo" },
                    ].map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50">
                        <div>
                          <span className="font-medium">{session.name}</span>
                          <span className="text-gray-600 ml-2">{session.price}</span>
                        </div>
                        <Link href={`/checkout/${session.id}`}>
                          <Button size="sm">Try Demo</Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}