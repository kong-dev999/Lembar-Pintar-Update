import prisma from '@/prisma/index';
import { getCurrentUser } from 'aws-amplify/auth';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, name, cognitoUserId, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if user already exists in database
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Hash password if provided (for backup/long-term use)
      let hashedPassword = 'COGNITO_AUTH'; // Default placeholder

      if (password) {
        hashedPassword = await bcrypt.hash(password, 10);
      }

      // Create new user in database
      user = await prisma.user.create({
        data: {
          email,
          name: name || email.split('@')[0],
          emailVerified: new Date(), // Cognito already verified the email
          // Store Cognito user ID for reference
          image: cognitoUserId, // Using image field to store Cognito ID (temporary)
          // Store hashed password for backup (optional)
          password: hashedPassword,
          // Default role - you can customize this
          role: email === process.env.ADMIN_EMAIL ? 'ADMIN' : 'USER',
        },
      });

      console.log('✅ Created new user in database:', email);
    } else {
      // Update existing user if needed
      if (!user.emailVerified) {
        user = await prisma.user.update({
          where: { email },
          data: {
            emailVerified: new Date(),
            name: name || user.name,
          },
        });

        console.log('✅ Updated existing user:', email);
      }
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('❌ Cognito sync error:', error);
    return res.status(500).json({
      error: 'Failed to sync user data',
      message: error.message,
    });
  }
}
