'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type FormData = {
  email: string;
  customerName: string;
  phone: string;
  shippingAddress: {
    line1: string;
    line2: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  shippingMethod: string;
  customerNote: string;
};

interface InformationStepProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  onNext: () => void;
}

export default function InformationStep({ formData, setFormData, onNext }: InformationStepProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Contact Information */}
        <div>
          <h2 className="text-2xl font-semibold mb-6">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Email *</label>
              <Input
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Full Name *</label>
              <Input
                type="text"
                placeholder="Enter your full name"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Phone (optional)</label>
              <Input
                type="tel"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div>
          <h2 className="text-2xl font-semibold mb-6">Shipping Address</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Address Line 1 *</label>
              <Input
                type="text"
                placeholder="Street address"
                value={formData.shippingAddress.line1}
                onChange={(e) => setFormData({
                  ...formData,
                  shippingAddress: { ...formData.shippingAddress, line1: e.target.value }
                })}
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Address Line 2 (optional)</label>
              <Input
                type="text"
                placeholder="Apartment, suite, etc."
                value={formData.shippingAddress.line2}
                onChange={(e) => setFormData({
                  ...formData,
                  shippingAddress: { ...formData.shippingAddress, line2: e.target.value }
                })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">City *</label>
              <Input
                type="text"
                placeholder="City"
                value={formData.shippingAddress.city}
                onChange={(e) => setFormData({
                  ...formData,
                  shippingAddress: { ...formData.shippingAddress, city: e.target.value }
                })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">State *</label>
              <Input
                type="text"
                placeholder="State"
                value={formData.shippingAddress.state}
                onChange={(e) => setFormData({
                  ...formData,
                  shippingAddress: { ...formData.shippingAddress, state: e.target.value }
                })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Country *</label>
              <select
                value={formData.shippingAddress.country}
                onChange={(e) => setFormData({
                  ...formData,
                  shippingAddress: { ...formData.shippingAddress, country: e.target.value }
                })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a country</option>
                <option value="US">United States</option>
                <option value="VN">Vietnam</option>
                <option value="GB">United Kingdom</option>
                <option value="CA">Canada</option>
                <option value="AU">Australia</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Postal Code *</label>
              <Input
                type="text"
                placeholder="Postal code"
                value={formData.shippingAddress.postalCode}
                onChange={(e) => setFormData({
                  ...formData,
                  shippingAddress: { ...formData.shippingAddress, postalCode: e.target.value }
                })}
                required
              />
            </div>
          </div>
        </div>

        {/* Order Notes */}
        <div>
          <label className="block text-sm font-medium mb-2">Order Notes (optional)</label>
          <textarea
            placeholder="Special instructions for your order"
            value={formData.customerNote}
            onChange={(e) => setFormData({ ...formData, customerNote: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <Button
          type="submit"
          className="w-full md:w-auto"
        >
          Continue to Shipping
        </Button>
      </form>
    </div>
  );
}