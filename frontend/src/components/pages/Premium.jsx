// components/pages/Premium.jsx
import React from 'react';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Footer from '../Footer';
const Premium = () => {
  const plans = [
    {
      id: 'monthly',
      name: 'Monthly',
      price: '₹199',
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
      price: '₹549',
      features: [
        'Ad-free listening',
        'Offline playback',
        'Unlimited skips',
        'Access to premium content',
        'Priority customer support',
        'Exclusive content',
        'Early access to new releases'
      ],
      duration: '3 months'
    },
    {
      id: 'half-yearly',
      name: 'Half-Yearly',
      price: '₹999',
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
      duration: '6 months'
    }
  ];

  const handleSubscribe = (planId) => {
    console.log(`Subscribing to ${planId} plan`);
    // Add payment gateway integration here
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Upgrade to Premium</h1>
        <p className="text-gray-400">Get access to exclusive features and ad-free listening</p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="bg-gray-800 rounded-lg shadow-lg p-6 hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">{plan.name}</h2>
              <span className="text-sm text-gray-400">{plan.duration}</span>
            </div>

            <div className="text-3xl font-bold text-white mb-4">{plan.price}</div>

            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center space-x-3 text-gray-300">
                  <CheckIcon className="w-5 h-5 text-green-500" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscribe(plan.id)}
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Subscribe Now
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
                  {plan.features.includes('Ad-free listening') ? (
                    <CheckIcon className="w-5 h-5 text-green-500 mx-auto" />
                  ) : (
                    <XMarkIcon className="w-5 h-5 text-red-500 mx-auto" />
                  )}
                </td>
              ))}
            </tr>
            <tr>
              <td className="px-4 py-3 text-gray-400 border border-gray-700">Offline playback</td>
              {plans.map((plan) => (
                <td key={plan.id} className="px-4 py-3 text-center border border-gray-700">
                  {plan.features.includes('Offline playback') ? (
                    <CheckIcon className="w-5 h-5 text-green-500 mx-auto" />
                  ) : (
                    <XMarkIcon className="w-5 h-5 text-red-500 mx-auto" />
                  )}
                </td>
              ))}
            </tr>
            <tr>
              <td className="px-4 py-3 text-gray-400 border border-gray-700">Unlimited skips</td>
              {plans.map((plan) => (
                <td key={plan.id} className="px-4 py-3 text-center border border-gray-700">
                  {plan.features.includes('Unlimited skips') ? (
                    <CheckIcon className="w-5 h-5 text-green-500 mx-auto" />
                  ) : (
                    <XMarkIcon className="w-5 h-5 text-red-500 mx-auto" />
                  )}
                </td>
              ))}
            </tr>
            {/* Add more features here */}
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
      <Footer />
          {/* Add more FAQs here */}
        </div>
      </div>
    </div>
  );
};

export default Premium;