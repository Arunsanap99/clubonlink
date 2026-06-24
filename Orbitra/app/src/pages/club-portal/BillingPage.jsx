import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useClubPortal } from '../../contexts/ClubPortalContext';
import { 
  CreditCardIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';
import { collection, query, orderBy, onSnapshot, addDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../config/firebase';
import toast from 'react-hot-toast';

const BillingPage = () => {
  const { club, isAdmin, currentUser } = useClubPortal();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Available products/plans
  const products = [
    {
      id: 'premium_monthly',
      name: 'Premium Monthly',
      description: 'Unlock premium templates and advanced features',
      price: 9.99,
      currency: 'USD',
      interval: 'month',
      features: [
        'Premium templates',
        'Advanced customization',
        'Priority support',
        'Analytics dashboard',
        'Custom branding'
      ]
    },
    {
      id: 'premium_yearly',
      name: 'Premium Yearly',
      description: 'Save 20% with annual billing',
      price: 95.99,
      currency: 'USD',
      interval: 'year',
      features: [
        'All Premium Monthly features',
        '20% discount',
        'Priority feature requests',
        'Dedicated account manager'
      ],
      popular: true
    },
    {
      id: 'event_tickets',
      name: 'Event Tickets',
      description: 'Sell tickets for your club events',
      price: 5.00,
      currency: 'USD',
      interval: 'one-time',
      features: [
        'Secure payment processing',
        'Automated ticket generation',
        'QR code validation',
        'Attendee management'
      ]
    }
  ];

  // Load payment history
  useEffect(() => {
    if (!club?.id || !isAdmin) return;

    const paymentsRef = collection(db, 'clubs', club.id, 'payments');
    const paymentsQuery = query(paymentsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(paymentsQuery, (snapshot) => {
      const paymentsData = [];
      snapshot.forEach((doc) => {
        paymentsData.push({ id: doc.id, ...doc.data() });
      });
      setPayments(paymentsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [club?.id, isAdmin]);

  // Create Stripe Checkout Session
  const handlePurchase = async (product) => {
    if (!club?.id || !currentUser) {
      toast.error('Please ensure you are logged in and have access to this club');
      return;
    }

    setProcessing(true);
    try {
      // Call Cloud Function to create checkout session
      const createCheckoutSession = httpsCallable(functions, 'createCheckoutSession');
      
      const result = await createCheckoutSession({
        clubId: club.id,
        productId: product.id,
        quantity: 1,
        successUrl: `${window.location.origin}/clubs/${club.slug}/billing?success=true`,
        cancelUrl: `${window.location.origin}/clubs/${club.slug}/billing?canceled=true`
      });

      // Redirect to Stripe Checkout
      if (result.data.sessionUrl) {
        window.location.href = result.data.sessionUrl;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to initiate payment. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  // Handle Razorpay payment (for Indian market)
  const handleRazorpayPayment = async (product) => {
    if (!window.Razorpay) {
      toast.error('Razorpay SDK not loaded');
      return;
    }

    setProcessing(true);
    try {
      // Create order on server
      const createRazorpayOrder = httpsCallable(functions, 'createRazorpayOrder');
      
      const orderResult = await createRazorpayOrder({
        clubId: club.id,
        productId: product.id,
        amount: Math.round(product.price * 100), // Convert to paise
        currency: 'INR'
      });

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: orderResult.data.amount,
        currency: orderResult.data.currency,
        name: club.clubName,
        description: product.description,
        order_id: orderResult.data.orderId,
        handler: async (response) => {
          // Verify payment on server
          const verifyPayment = httpsCallable(functions, 'verifyRazorpayPayment');
          
          try {
            await verifyPayment({
              clubId: club.id,
              orderId: orderResult.data.orderId,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature
            });
            
            toast.success('Payment successful!');
          } catch (error) {
            console.error('Payment verification failed:', error);
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: currentUser.displayName || '',
          email: currentUser.email || ''
        },
        theme: {
          color: club.themeColor || '#6366f1'
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Razorpay error:', error);
      toast.error('Failed to initiate payment');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
      case 'paid':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'failed':
      case 'canceled':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      case 'pending':
      case 'processing':
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'failed':
      case 'canceled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'pending':
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-8 text-center">
        <CreditCardIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Access Restricted
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Only club admins can access billing information.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Billing & Payments
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          Manage your club's subscription and payment history
        </p>
      </div>

      {/* Current Plan Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Current Plan
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              {club?.premium ? 'Premium Plan' : 'Free Plan'}
            </p>
            {club?.paidUntil && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Valid until {new Date(club.paidUntil).toLocaleDateString()}
              </p>
            )}
          </div>
          
          <div className="text-right">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              club?.premium 
                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
            }`}>
              {club?.premium ? 'Premium' : 'Free'}
            </span>
          </div>
        </div>
      </div>

      {/* Available Plans */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Available Plans
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${
                product.popular ? 'ring-2 ring-indigo-500' : ''
              }`}
            >
              {product.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-indigo-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {product.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                  {product.description}
                </p>
                
                <div className="mt-4">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    ${product.price}
                  </span>
                  {product.interval !== 'one-time' && (
                    <span className="text-gray-500 dark:text-gray-400">
                      /{product.interval}
                    </span>
                  )}
                </div>
              </div>
              
              <ul className="space-y-2 mb-6">
                {product.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center text-sm">
                    <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <div className="space-y-2">
                <button
                  onClick={() => handlePurchase(product)}
                  disabled={processing}
                  className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg font-medium transition-colors"
                >
                  {processing ? 'Processing...' : 'Purchase with Stripe'}
                </button>
                
                {/* Razorpay option for Indian users */}
                <button
                  onClick={() => handleRazorpayPayment(product)}
                  disabled={processing}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors"
                >
                  Pay with Razorpay (INR)
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Payment History
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Loading payments...</p>
            </div>
          ) : payments.length === 0 ? (
            <div className="p-8 text-center">
              <CurrencyDollarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No payments yet</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Invoice
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {payment.productId || 'Unknown Product'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      ${payment.amount} {payment.currency?.toUpperCase()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(payment.status)}
                        <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                          {payment.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {payment.invoiceUrl ? (
                        <a
                          href={payment.invoiceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center"
                        >
                          <DocumentTextIcon className="w-4 h-4 mr-1" />
                          View
                          <ArrowTopRightOnSquareIcon className="w-3 h-3 ml-1" />
                        </a>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default BillingPage;

/**
 * Cloud Functions for secure payment processing:
 * 
 * // Create Stripe Checkout Session
 * exports.createCheckoutSession = functions.https.onCall(async (data, context) => {
 *   if (!context.auth) throw new functions.https.HttpsError('unauthenticated');
 *   
 *   const { clubId, productId, quantity, successUrl, cancelUrl } = data;
 *   
 *   // Verify user has admin access to club
 *   const memberDoc = await admin.firestore()
 *     .doc(`clubs/${clubId}/members/${context.auth.uid}`)
 *     .get();
 *   
 *   if (!memberDoc.exists || !['admin', 'owner'].includes(memberDoc.data().role)) {
 *     throw new functions.https.HttpsError('permission-denied');
 *   }
 *   
 *   // Create Stripe session
 *   const session = await stripe.checkout.sessions.create({
 *     payment_method_types: ['card'],
 *     line_items: [{
 *       price_data: {
 *         currency: 'usd',
 *         product_data: { name: productId },
 *         unit_amount: getProductPrice(productId) * 100
 *       },
 *       quantity
 *     }],
 *     mode: 'payment',
 *     success_url: successUrl,
 *     cancel_url: cancelUrl,
 *     metadata: { clubId, productId, userId: context.auth.uid }
 *   });
 *   
 *   // Save payment intent
 *   await admin.firestore().collection(`clubs/${clubId}/payments`).add({
 *     sessionId: session.id,
 *     amount: getProductPrice(productId),
 *     currency: 'usd',
 *     status: 'pending',
 *     productId,
 *     payerUid: context.auth.uid,
 *     createdAt: admin.firestore.FieldValue.serverTimestamp()
 *   });
 *   
 *   return { sessionUrl: session.url };
 * });
 * 
 * // Handle Stripe webhooks
 * exports.handleStripeWebhook = functions.https.onRequest(async (req, res) => {
 *   const sig = req.headers['stripe-signature'];
 *   const event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
 *   
 *   if (event.type === 'checkout.session.completed') {
 *     const session = event.data.object;
 *     const { clubId, productId } = session.metadata;
 *     
 *     // Update payment status
 *     const paymentsRef = admin.firestore().collection(`clubs/${clubId}/payments`);
 *     const paymentQuery = await paymentsRef.where('sessionId', '==', session.id).get();
 *     
 *     if (!paymentQuery.empty) {
 *       const paymentDoc = paymentQuery.docs[0];
 *       await paymentDoc.ref.update({
 *         status: 'completed',
 *         paidAt: admin.firestore.FieldValue.serverTimestamp()
 *       });
 *       
 *       // Unlock premium features
 *       await admin.firestore().doc(`clubs/${clubId}`).update({
 *         premium: true,
 *         paidUntil: getPaidUntilDate(productId)
 *       });
 *     }
 *   }
 *   
 *   res.json({ received: true });
 * });
 */
