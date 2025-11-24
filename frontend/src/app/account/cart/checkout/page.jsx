"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { useCreateCheckoutSessionMutation, useGetCartQuery } from '../../../../store/api';
import SummaryCard from '../../../../components/card/OrderSummaryCard';

const Checkout = () => {
  const router = useRouter();
  const { token } = useSelector((state) => state.auth);
  const { data: cartItems = [], isLoading: cartLoading } = useGetCartQuery();
  const [createCheckoutSession, { isLoading: checkoutLoading }] = useCreateCheckoutSessionMutation();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    companyName: '',
    region: '',
    streetAddress: '',
    townCity: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePlaceOrder = async () => {
    if (!token) {
      router.push('/signin');
      return;
    }

    if (cartItems.length === 0) {
      alert('Your cart is empty');
      return;
    }

    try {
      const checkoutData = {
        items: cartItems.map(item => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        successUrl: `${window.location.origin}/thank-you`,
        cancelUrl: `${window.location.origin}/account/cart`,
      };

      const result = await createCheckoutSession(checkoutData).unwrap();

      // Redirect to Stripe Checkout
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      console.error('Checkout failed:', error);
      alert('Failed to create checkout session. Please try again.');
    }
  };

  if (cartLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading cart...</div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Your cart is empty</p>
          <button
            onClick={() => router.push('/shop')}
            className="bg-orangeRed text-white px-6 py-2 rounded-md hover:bg-orange-600"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Billing Details */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Billing Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-gray-600 mb-2">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orangeRed"
                required
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-gray-600 mb-2">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orangeRed"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="companyName" className="block text-gray-600 mb-2">
              Company Name (Optional)
            </label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orangeRed"
            />
          </div>

          <div>
            <label htmlFor="region" className="block text-gray-600 mb-2">
              Region <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="region"
              name="region"
              value={formData.region}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orangeRed"
              required
            />
          </div>

          <div>
            <label htmlFor="streetAddress" className="block text-gray-600 mb-2">
              Street Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="streetAddress"
              name="streetAddress"
              value={formData.streetAddress}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orangeRed"
              required
            />
          </div>

          <div>
            <label htmlFor="townCity" className="block text-gray-600 mb-2">
              Town/City <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="townCity"
              name="townCity"
              value={formData.townCity}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orangeRed"
              required
            />
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:sticky lg:top-4">
          <SummaryCard
            children="Place Order"
            onPlaceOrder={handlePlaceOrder}
            isLoading={checkoutLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default Checkout;
