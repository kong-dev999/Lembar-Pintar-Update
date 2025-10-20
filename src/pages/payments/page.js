'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function MidtransPaymentPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [paymentData, setPaymentData] = useState(null);

    // Get payment data from URL params or props
    useEffect(() => {
        const amount = searchParams.get('amount');
        const product = searchParams.get('product');

        if (amount && product) {
            setPaymentData({
                gross_amount: parseInt(amount),
                item_details: [{
                    id: 'ITEM01',
                    price: parseInt(amount),
                    quantity: 1,
                    name: product
                }],
                customer_details: {
                    first_name: 'John',
                    last_name: 'Doe',
                    email: 'john@example.com',
                    phone: '081234567890'
                }
            });
        }
    }, [searchParams]);

    // Load Midtrans Snap script
    useEffect(() => {
        const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;
        const isProduction = process.env.NODE_ENV === 'production';

        const snapScript = isProduction
            ? 'https://app.midtrans.com/snap/snap.js'
            : 'https://app.sandbox.midtrans.com/snap/snap.js';

        const script = document.createElement('script');
        script.src = snapScript;
        script.setAttribute('data-client-key', clientKey);
        document.head.appendChild(script);

        return () => {
            document.head.removeChild(script);
        };
    }, []);

    // Get Snap Token
    const getSnapToken = async (paymentData) => {
        setLoading(true);
        try {
            const response = await fetch('/api/payments/midtrans/snap-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(paymentData)
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error);
            }

            return data.token;
        } catch (error) {
            console.error('Error getting snap token:', error);
            alert('Error: ' + error.message);
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Handle Snap Popup
    const handleSnapPopup = async () => {
        if (!paymentData) return;

        const token = await getSnapToken(paymentData);
        if (!token) return;

        window.snap?.pay(token, {
            onSuccess: function (result) {
                console.log('Payment Success:', result);
                router.push(`/payments/midtrans/success?order_id=${result.order_id}`);
            },
            onPending: function (result) {
                console.log('Payment Pending:', result);
                router.push(`/payments/midtrans/pending?order_id=${result.order_id}`);
            },
            onError: function (result) {
                console.log('Payment Error:', result);
                router.push(`/payments/midtrans/error?order_id=${result.order_id}`);
            },
            onClose: function () {
                console.log('Payment popup closed');
            }
        });
    };

    // Handle Snap Redirect
    const handleSnapRedirect = async () => {
        if (!paymentData) return;

        const token = await getSnapToken(paymentData);
        if (!token) return;

        const isProduction = process.env.NODE_ENV === 'production';
        const redirectUrl = isProduction
            ? `https://app.midtrans.com/snap/v2/vtweb/${token}`
            : `https://app.sandbox.midtrans.com/snap/v2/vtweb/${token}`;

        window.location.href = redirectUrl;
    };

    if (!paymentData) {
        return (
            <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
                <h1 className="text-2xl font-bold mb-4">Loading Payment Data...</h1>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-6 text-center">Midtrans Payment</h1>

            {/* Order Summary */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold mb-2">Order Summary</h3>
                <div className="space-y-1">
                    <p><span className="text-gray-600">Product:</span> {paymentData.item_details[0].name}</p>
                    <p><span className="text-gray-600">Amount:</span> Rp {paymentData.gross_amount.toLocaleString('id-ID')}</p>
                </div>
            </div>

            {/* Payment Buttons */}
            <div className="space-y-3">
                <button
                    onClick={handleSnapPopup}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                >
                    {loading ? 'Processing...' : '💳 Pay with Popup'}
                </button>

                <button
                    onClick={handleSnapRedirect}
                    disabled={loading}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
                >
                    {loading ? 'Processing...' : '🌐 Pay with Redirect'}
                </button>

                <button
                    onClick={() => router.back()}
                    className="w-full bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600"
                >
                    ← Back
                </button>
            </div>
        </div>
    );
}
