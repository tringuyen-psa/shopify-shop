'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Truck, Clock, CheckCircle } from 'lucide-react';

interface ShippingRate {
  id: string;
  name: string;
  description: string;
  price: number;
  deliveryTime: string;
  carrier?: string;
}

interface ShippingStepProps {
  shippingRates: ShippingRate[];
  selectedShippingRate: string | null;
  onShippingRateChange: (rateId: string) => void;
  onBack: () => void;
  onNext: () => void;
  isLoading?: boolean;
}

export default function ShippingStep({
  shippingRates,
  selectedShippingRate,
  onShippingRateChange,
  onBack,
  onNext,
  isLoading = false
}: ShippingStepProps) {

  const getDeliveryIcon = (deliveryTime: string) => {
    if (deliveryTime.toLowerCase().includes('express') || deliveryTime.toLowerCase().includes('same day')) {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    }
    if (deliveryTime.toLowerCase().includes('standard') || deliveryTime.toLowerCase().includes('2-3')) {
      return <Truck className="h-5 w-5 text-blue-600" />;
    }
    return <Clock className="h-5 w-5 text-gray-600" />;
  };

  const getDeliveryBadgeColor = (deliveryTime: string) => {
    if (deliveryTime.toLowerCase().includes('express') || deliveryTime.toLowerCase().includes('same day')) {
      return 'bg-green-100 text-green-800';
    }
    if (deliveryTime.toLowerCase().includes('standard')) {
      return 'bg-blue-100 text-blue-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  const handleContinue = () => {
    if (!selectedShippingRate) {
      alert('Please select a shipping method');
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      {/* Shipping Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Truck className="h-5 w-5 mr-2" />
            Shipping Method
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Calculating shipping rates...</p>
            </div>
          ) : shippingRates.length === 0 ? (
            <div className="text-center py-8">
              <Truck className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No shipping options available</h3>
              <p className="text-gray-600">Please contact the shop owner for shipping arrangements.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {shippingRates.map((rate) => (
                <label
                  key={rate.id}
                  className={`
                    block cursor-pointer
                    ${selectedShippingRate === rate.id ? 'ring-2 ring-blue-500' : ''}
                  `}
                >
                  <div className={`
                    border rounded-lg p-4 transition-all hover:shadow-md
                    ${selectedShippingRate === rate.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start flex-1">
                        <input
                          type="radio"
                          name="shipping"
                          value={rate.id}
                          checked={selectedShippingRate === rate.id}
                          onChange={(e) => onShippingRateChange(e.target.value)}
                          className="mt-1 mr-3"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-900">{rate.name}</h4>
                            <Badge className={getDeliveryBadgeColor(rate.deliveryTime)}>
                              {rate.deliveryTime}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{rate.description}</p>
                          {rate.carrier && (
                            <p className="text-sm text-gray-500">
                              <span className="font-medium">Carrier:</span> {rate.carrier}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="flex items-center gap-2">
                          {getDeliveryIcon(rate.deliveryTime)}
                          <p className="text-lg font-bold text-gray-900">
                            ${rate.price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </label>
              ))}

              {shippingRates.length > 0 && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>Note:</strong> Shipping times are estimates and may vary based on your location and current order volume.
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back to Information
        </Button>
        <Button
          onClick={handleContinue}
          disabled={!selectedShippingRate || isLoading}
          className="min-w-32"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            'Continue to Payment'
          )}
        </Button>
      </div>
    </div>
  );
}