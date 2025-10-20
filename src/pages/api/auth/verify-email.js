import prisma from "@/prisma/index";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { email, token } = req.body;

        if (!email || !token) {
            return res.status(400).json({ message: 'Email and token are required' });
        }

        // Find user with matching token
        const user = await prisma.user.findFirst({
            where: {
                email: email,
                verificationToken: token
            }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired verification token' });
        }

        // Update user to mark email as verified
        await prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerified: new Date(),
                verificationToken: null
            }
        });

        res.status(200).json({
            success: true,
            message: 'Email verified successfully'
        });

    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}