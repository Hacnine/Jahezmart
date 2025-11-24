"use client";
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FaCheckCircle, FaTimes } from "react-icons/fa";
import { useGetSessionDetailsQuery } from '../../store/api';

export default function ThankYou() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const sessionId = searchParams.get('session_id');

    const { data: sessionDetails, isLoading, error } = useGetSessionDetailsQuery(
        sessionId,
        { skip: !sessionId }
    );

    const [countdown, setCountdown] = useState(10);

    useEffect(() => {
        if (sessionDetails?.payment_status === 'paid') {
            const timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        router.push('/account/order/orderhistory');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [sessionDetails, router]);

    if (isLoading) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orangeRed mx-auto mb-4"></div>
                    <p className="text-gray-600">Verifying payment...</p>
                </div>
            </main>
        );
    }

    if (error || !sessionDetails) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-6">
                    <FaTimes className="text-6xl text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-semibold text-gray-800 mb-2">
                        Payment Verification Failed
                    </h1>
                    <p className="text-gray-600 mb-6">
                        We couldn't verify your payment. Please contact support if you were charged.
                    </p>
                    <button
                        onClick={() => router.push('/account/cart')}
                        className="bg-orangeRed text-white px-6 py-2 rounded-md hover:bg-orange-600 transition-colors"
                    >
                        Return to Cart
                    </button>
                </div>
            </main>
        );
    }

    const isSuccess = sessionDetails.payment_status === 'paid';

    return (
        <main className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-md mx-auto text-center">
                {isSuccess ? (
                    <>
                        <FaCheckCircle className="text-6xl text-green-600 mx-auto mb-4" />
                        <h1 className="text-3xl font-semibold text-gray-800 mb-2">
                            Payment Successful!
                        </h1>
                        <p className="text-gray-600 mb-4">
                            Thank you for your order. Your payment has been processed successfully.
                        </p>
                        <div className="bg-gray-50 p-4 rounded-lg mb-6">
                            <p className="text-sm text-gray-600">
                                Amount Paid: ${(sessionDetails.amount_total / 100).toFixed(2)} {sessionDetails.currency.toUpperCase()}
                            </p>
                            <p className="text-sm text-gray-600">
                                Order will be processed and shipped soon.
                            </p>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">
                            Redirecting to order history in {countdown} seconds...
                        </p>
                        <button
                            onClick={() => router.push('/account/order/orderhistory')}
                            className="bg-orangeRed text-white px-6 py-2 rounded-md hover:bg-orange-600 transition-colors mr-4"
                        >
                            View Orders
                        </button>
                        <button
                            onClick={() => router.push('/shop')}
                            className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition-colors"
                        >
                            Continue Shopping
                        </button>
                    </>
                ) : (
                    <>
                        <FaTimes className="text-6xl text-yellow-500 mx-auto mb-4" />
                        <h1 className="text-3xl font-semibold text-gray-800 mb-2">
                            Payment Pending
                        </h1>
                        <p className="text-gray-600 mb-6">
                            Your payment is being processed. Please check back later or contact support.
                        </p>
                        <button
                            onClick={() => router.push('/account/order/orderhistory')}
                            className="bg-orangeRed text-white px-6 py-2 rounded-md hover:bg-orange-600 transition-colors"
                        >
                            Check Order Status
                        </button>
                    </>
                )}
            </div>
        </main>
    );
}