import bcrypt from 'bcryptjs';
import prisma from "@/prisma/index";
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { fullName, email, password } = req.body;

        // Validasi input
        if (!fullName || !email || !password) {
            return res.status(400).json({ message: 'Semua field harus diisi' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password minimal 6 karakter' });
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            // Jika user sudah ada tapi belum terverifikasi, hapus dan buat baru
            if (!existingUser.emailVerified) {
                await prisma.user.delete({
                    where: { id: existingUser.id }
                });
            } else {
                return res.status(400).json({ message: 'Email sudah terdaftar' });
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create verification token
        const verificationToken = Math.random().toString(36).substring(2) + Date.now().toString(36);

        // Create user with transaction to ensure both user and workspace are created
        const result = await prisma.$transaction(async (tx) => {
            // Create user
            const user = await tx.user.create({
                data: {
                    name: fullName,
                    email,
                    password: hashedPassword,
                    emailVerified: null,
                    verificationToken,
                    userCode: Math.random().toString(36).substring(2, 15), // Generate random code
                }
            });

            // Auto-create workspace for new user
            const workspace = await tx.workspace.create({
                data: {
                    name: `${fullName}'s Workspace`,
                    slug: `workspace-${user.userCode}-${Date.now()}`, // Unique slug using userCode
                    creatorId: user.id,
                    workspaceCode: Math.random().toString(36).substring(2, 15) + Date.now().toString(36),
                    inviteCode: Math.random().toString(36).substring(2, 15) + Date.now().toString(36),
                }
            });

            console.log('✅ User and workspace created:', {
                userId: user.id,
                userEmail: user.email,
                workspaceId: workspace.id,
                workspaceName: workspace.name,
                workspaceSlug: workspace.slug
            });

            return { user, workspace };
        });

        const user = result.user;

        // Generate verification link
        const verificationLink = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;

        // Tampilkan link di console untuk development
        console.log('=== VERIFICATION LINK ===');
        console.log(verificationLink);
        console.log('=========================');

        res.status(201).json({
            success: true,
            message: 'Registrasi berhasil. Silakan cek email Anda untuk verifikasi.',
            email: email
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
}