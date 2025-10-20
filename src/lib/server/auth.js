/**
 * NextAuth Configuration
 * Centralized authOptions for both local (NextAuth) and production (Cognito)
 */

import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import prisma from '@/prisma/index';
import { isCognito } from '@/lib/auth/config';

// Check if using Cognito - if yes, provide minimal NextAuth config
const useCognito = isCognito();

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-cognito-only',
  trustHost: true, // Trust any host (untuk Amplify/Vercel)
  providers: useCognito ? [] : [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log('🔐 Login attempt for:', credentials?.email);

        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required');
        }

        let user;
        try {
          user = await prisma.user.findUnique({
            where: { email: credentials.email }
          });

          console.log('👤 User found:', user ? 'YES' : 'NO');
          console.log('📧 Email verified:', user?.emailVerified);
          console.log('👔 Role:', user?.role);

          if (!user || !user.password) {
            console.log('❌ User not found or no password');
            throw new Error('Invalid credentials');
          }

          // Check if email is verified
          if (!user.emailVerified) {
            console.log('❌ Email not verified');
            throw new Error('Please verify your email first. Check your inbox or request a new verification email.');
          }
        } catch (error) {
          console.error('❌ Database error:', error.message);
          throw error;
        }

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.password
        );

        console.log('🔑 Password match:', isPasswordCorrect);

        if (!isPasswordCorrect) {
          console.log('❌ Password incorrect');
          throw new Error('Invalid credentials');
        }

        console.log('✅ Login successful for:', user.email);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      }
    })
  ].filter(Boolean),
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async redirect({ url, baseUrl }) {
      // Kalau URL sudah absolut dan dalam baseUrl, pakai itu
      if (url.startsWith(baseUrl)) return url;
      // Kalau URL relative (contoh: /admin), jadikan absolute
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Default redirect ke baseUrl
      return baseUrl;
    },
  },
  pages: {
    signIn: '/auth/login',
    signUp: '/auth/register',
    error: '/auth/error'
  },
  session: {
    strategy: 'jwt',
  },
  debug: true, // Enable untuk debug di production
};
