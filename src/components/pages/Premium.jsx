// src/components/pages/Premium.jsx - FINAL VERSION
import React, { useState, useEffect } from 'react';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Footer from '../Footer';
import { account } from '../../lib/appwrite'; // Your Appwrite config

const Premium = () => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  
  // Razorpay Key ID (safe to expose in frontend)
  const RAZORPAY_KEY_ID = 'rzp_test_RCMxb4YGoO59yx';
  
  // Backend API URL
  const API_URL = 'http://localhost:5000';

  const plans = [
    {
      id: 'monthly',
      name: 'Monthly',
      price: 199,
      priceDisplay: '₹199',
      features: [
        'Ad-free listening',
        'Offline playback',
        'Unlimited skips',
        'Access to premium content',
        'Priority customer support'
      ],
      duration: '1 month'
    },
    {
      id: 'quarterly',
      name: 'Quarterly',
      price: 549,
      priceDisplay: '₹549',
      features: [
        'Ad-free listening',
        'Offline playback',
        'Unlimited skips',
        'Access to premium content',
        'Priority customer support',
        'Exclusive content',
        'Early access to new releases'
      ],
      duration: '3 months',
      badge: 'Popular'
    },
    {
      id: 'half-yearly',
      name: 'Half-Yearly',
      price: 999,
      priceDisplay: '₹999',
      features: [
        'Ad-free listening',
        'Offline playback',
        'Unlimited skips',
        'Access to premium content',
        'Priority customer support',
        'Exclusive content',
        'Early access to new releases',
        'Personalized recommendations',
        'Offline listening on multiple devices'
      ],
      duration: '6 months',
      badge: 'Best Value'
    }
  ];

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => console.log('✅ Razorpay SDK loaded');
    script.onerror = () => console.error('❌ Failed to load Razorpay SDK');
    document.body.appendChild(script);

    // Get current user
    getCurrentUser();

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const getCurrentUser = async () => {
    try {
      const currentUser = await account.get();
      setUser(currentUser);
      console.log('✅ User logged in:', currentUser.name);
    } catch (error) {
      console.log('ℹ️ User not logged in');
      // Set guest user for testing
      setUser({
        $id: 'guest',
        name: 'Guest User',
        email: 'guest@playloud.com',
        phone: '9999999999'
      });
    }
  };

  const createOrder = async (plan) => {
    try {
      console.log('📝 Creating order for:', plan.name);
      
      const response = await fetch(`${API_URL}/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: plan.price * 100, // Convert to paise
          currency: 'INR',
          planId: plan.id,
          planName: plan.name,
          userId: user?.$id || 'guest'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Order created:', data.orderId);
        return data.orderId;
      } else {
        throw new Error(data.error || 'Failed to create order');
      }
    } catch (error) {
      console.error('❌ Error creating order:', error);
      throw error;
    }
  };

  const verifyPayment = async (paymentData) => {
    try {
      console.log('🔍 Verifying payment...');
      
      const response = await fetch(`${API_URL}/verify-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData)
      });

      const data = await response.json();
      console.log('Verification response:', data);
      return data.success;
    } catch (error) {
      console.error('❌ Error verifying payment:', error);
      return false;
    }
  };

  const handleSubscribe = async (plan) => {
    if (!window.Razorpay) {
      alert('Razorpay SDK not loaded. Please refresh the page.');
      return;
    }

    if (!user) {
      alert('Please login to subscribe to premium plans.');
      return;
    }

    setLoading(true);

    try {
      // Step 1: Create order from backend
      const orderId = await createOrder(plan);

      // Step 2: Razorpay checkout options
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: plan.price * 100, // Amount in paise
        currency: "INR",
        name: "PlayLoud Premium",
        description: `${plan.name} Subscription`,
        image: "https://cdn-icons-png.flaticon.com/512/3844/3844727.png", // Music icon
        order_id: orderId,
        
        // Success handler
        handler: async function (response) {
          console.log('✅ Payment successful!');
          console.log('Payment ID:', response.razorpay_payment_id);
          console.log('Order ID:', response.razorpay_order_id);
          
          // Verify payment on backend
          const paymentData = {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            planId: plan.id,
            planName: plan.name,
            amount: plan.price, // Send in rupees
            userId: user?.$id || 'guest'
          };
          
          const isVerified = await verifyPayment(paymentData);
          
          if (isVerified) {
            alert(`🎉 Payment Successful!\n\nWelcome to PlayLoud Premium!\n\nYour ${plan.name} subscription is now active.\n\nPayment ID: ${response.razorpay_payment_id}`);
            
            // Reload page to show updated subscription status
            setTimeout(() => {
              window.location.reload();
            }, 2000);
          } else {
            alert('❌ Payment verification failed. Please contact support with Payment ID: ' + response.razorpay_payment_id);
          }
          
          setLoading(false);
        },
        
        // Prefill customer information
        prefill: {
          name: user?.name || 'Guest User',
          email: user?.email || 'guest@playloud.com',
          contact: user?.phone || '9999999999'
        },
        
        // Additional notes
        notes: {
          planId: plan.id,
          planName: plan.name,
          userId: user?.$id || 'guest'
        },
        
        // Theme
        theme: {
          color: "#10b981" // Green color matching your brand
        },
        
        // Modal settings
        modal: {
          ondismiss: function() {
            console.log('ℹ️ Payment cancelled by user');
            setLoading(false);
          }
        }
      };

      // Step 3: Create Razorpay instance
      const rzp = new window.Razorpay(options);
      
      // Handle payment failure
      rzp.on('payment.failed', function (response) {
        console.error('❌ Payment failed');
        console.error('Error:', response.error);
        
        alert(`❌ Payment Failed\n\nReason: ${response.error.description}\n\nError Code: ${response.error.code}\n\nPlease try again or contact support.`);
        setLoading(false);
      });

      // Step 4: Open Razorpay checkout
      rzp.open();

    } catch (error) {
      console.error('❌ Error initiating payment:', error);
      alert(`Failed to initiate payment: ${error.message}\n\nPlease make sure the backend server is running on ${API_URL}`);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Upgrade to Premium</h1>
        <p className="text-gray-400">Get access to exclusive features and ad-free listening</p>
        
        {user && user.$id !== 'guest' && (
          <p className="text-sm text-green-500 mt-2">
            Logged in as: {user.name}
          </p>
        )}
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`bg-gray-800 rounded-lg shadow-lg p-6 hover:bg-gray-700 transition-colors relative ${
              plan.badge ? 'border-2 border-green-500' : ''
            }`}
          >
            {plan.badge && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                {plan.badge}
              </div>
            )}

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">{plan.name}</h2>
              <span className="text-sm text-gray-400">{plan.duration}</span>
            </div>

            <div className="text-3xl font-bold text-white mb-4">{plan.priceDisplay}</div>

            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center space-x-3 text-gray-300">
                  <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscribe(plan)}
              disabled={loading}
              className={`w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Processing...' : 'Subscribe Now'}
            </button>
          </div>
        ))}
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse border border-gray-700">
          <thead>
            <tr className="bg-gray-800">
              <th className="px-4 py-3 text-left text-gray-400">Feature</th>
              {plans.map((plan) => (
                <th key={plan.id} className="px-4 py-3 text-center text-white">{plan.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-4 py-3 text-gray-400 border border-gray-700">Ad-free listening</td>
              {plans.map((plan) => (
                <td key={plan.id} className="px-4 py-3 text-center border border-gray-700">
                  <CheckIcon className="w-5 h-5 text-green-500 mx-auto" />
                </td>
              ))}
            </tr>
            <tr>
              <td className="px-4 py-3 text-gray-400 border border-gray-700">Offline playback</td>
              {plans.map((plan) => (
                <td key={plan.id} className="px-4 py-3 text-center border border-gray-700">
                  <CheckIcon className="w-5 h-5 text-green-500 mx-auto" />
                </td>
              ))}
            </tr>
            <tr>
              <td className="px-4 py-3 text-gray-400 border border-gray-700">Unlimited skips</td>
              {plans.map((plan) => (
                <td key={plan.id} className="px-4 py-3 text-center border border-gray-700">
                  <CheckIcon className="w-5 h-5 text-green-500 mx-auto" />
                </td>
              ))}
            </tr>
            <tr>
              <td className="px-4 py-3 text-gray-400 border border-gray-700">Priority support</td>
              {plans.map((plan) => (
                <td key={plan.id} className="px-4 py-3 text-center border border-gray-700">
                  <CheckIcon className="w-5 h-5 text-green-500 mx-auto" />
                </td>
              ))}
            </tr>
            <tr>
              <td className="px-4 py-3 text-gray-400 border border-gray-700">Exclusive content</td>
              {plans.map((plan) => (
                <td key={plan.id} className="px-4 py-3 text-center border border-gray-700">
                  {plan.features.includes('Exclusive content') ? (
                    <CheckIcon className="w-5 h-5 text-green-500 mx-auto" />
                  ) : (
                    <XMarkIcon className="w-5 h-5 text-red-500 mx-auto" />
                  )}
                </td>
              ))}
            </tr>
            <tr>
              <td className="px-4 py-3 text-gray-400 border border-gray-700">Early access to releases</td>
              {plans.map((plan) => (
                <td key={plan.id} className="px-4 py-3 text-center border border-gray-700">
                  {plan.features.includes('Early access to new releases') ? (
                    <CheckIcon className="w-5 h-5 text-green-500 mx-auto" />
                  ) : (
                    <XMarkIcon className="w-5 h-5 text-red-500 mx-auto" />
                  )}
                </td>
              ))}
            </tr>
            <tr>
              <td className="px-4 py-3 text-gray-400 border border-gray-700">Personalized recommendations</td>
              {plans.map((plan) => (
                <td key={plan.id} className="px-4 py-3 text-center border border-gray-700">
                  {plan.features.includes('Personalized recommendations') ? (
                    <CheckIcon className="w-5 h-5 text-green-500 mx-auto" />
                  ) : (
                    <XMarkIcon className="w-5 h-5 text-red-500 mx-auto" />
                  )}
                </td>
              ))}
            </tr>
            <tr>
              <td className="px-4 py-3 text-gray-400 border border-gray-700">Multiple device offline</td>
              {plans.map((plan) => (
                <td key={plan.id} className="px-4 py-3 text-center border border-gray-700">
                  {plan.features.includes('Offline listening on multiple devices') ? (
                    <CheckIcon className="w-5 h-5 text-green-500 mx-auto" />
                  ) : (
                    <XMarkIcon className="w-5 h-5 text-red-500 mx-auto" />
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* FAQ Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Frequently Asked Questions</h2>
        <div className="space-y-2">
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-white">What is PlayLoud Premium?</h3>
            <p className="text-gray-400">PlayLoud Premium is a subscription-based service that offers ad-free listening, offline playback, and exclusive content.</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-white">How do I cancel my subscription?</h3>
            <p className="text-gray-400">You can cancel your subscription at any time from your account settings.</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-white">Is my payment information secure?</h3>
            <p className="text-gray-400">Yes, all payments are processed securely through Razorpay with industry-standard encryption.</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-white">What payment methods are accepted?</h3>
            <p className="text-gray-400">We accept all major credit/debit cards, UPI, net banking, and popular digital wallets through Razorpay.</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Premium;