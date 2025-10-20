import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const body = await req.json();

        // Verify signature
        const serverKey = process.env.MIDTRANS_SERVER_KEY;
        const orderId = body.order_id;
        const statusCode = body.status_code;
        const grossAmount = body.gross_amount;

        const signatureKey = crypto
            .createHash('sha512')
            .update(orderId + statusCode + grossAmount + serverKey)
            .digest('hex');

        if (signatureKey !== body.signature_key) {
            return NextResponse.json({
                success: false,
                message: 'Invalid signature'
            }, { status: 401 });
        }

        // Handle different transaction status
        const transactionStatus = body.transaction_status;
        const fraudStatus = body.fraud_status;

        let orderStatus = 'pending';

        if (transactionStatus === 'capture') {
            if (fraudStatus === 'challenge') {
                orderStatus = 'challenge';
            } else if (fraudStatus === 'accept') {
                orderStatus = 'paid';
            }
        } else if (transactionStatus === 'settlement') {
            orderStatus = 'paid';
        } else if (transactionStatus === 'deny') {
            orderStatus = 'denied';
        } else if (transactionStatus === 'cancel' || transactionStatus === 'expire') {
            orderStatus = 'cancelled';
        } else if (transactionStatus === 'pending') {
            orderStatus = 'pending';
        }

        // TODO: Update order status in your database
        console.log(`Order ${orderId} status: ${orderStatus}`);

        // Example database update:
        // await updateOrderStatus(orderId, orderStatus, body);

        return NextResponse.json({
            success: true,
            message: 'Webhook processed successfully'
        });

    } catch (error) {
        console.error('Webhook Error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
