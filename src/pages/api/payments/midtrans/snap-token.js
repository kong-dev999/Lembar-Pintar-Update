export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const body = req.body;

        const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;
        const IS_PRODUCTION = process.env.NODE_ENV === 'production';

        const snapUrl = IS_PRODUCTION
            ? 'https://app.midtrans.com/snap/v1/transactions'
            : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

        const orderId = `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        const transactionData = {
            transaction_details: {
                order_id: orderId,
                gross_amount: body.gross_amount
            },
            customer_details: {
                first_name: body.customer_details?.first_name || '',
                last_name: body.customer_details?.last_name || '',
                email: body.customer_details?.email || '',
                phone: body.customer_details?.phone || ''
            },
            item_details: body.item_details || [],
            callbacks: {
                finish: `${process.env.NEXT_PUBLIC_BASE_URL}/payments/midtrans/finish`
            }
        };

        const auth = Buffer.from(MIDTRANS_SERVER_KEY + ':').toString('base64');

        const response = await fetch(snapUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Basic ${auth}`
            },
            body: JSON.stringify(transactionData)
        });

        const snapData = await response.json();

        if (!response.ok) {
            throw new Error(snapData.error_messages?.[0] || 'Failed to create transaction');
        }

        res.status(200).json({
            success: true,
            token: snapData.token,
            redirect_url: snapData.redirect_url,
            order_id: orderId
        });
    } catch (error) {
        console.error('Midtrans Snap Token Error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}