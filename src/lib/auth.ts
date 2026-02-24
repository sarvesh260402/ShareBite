import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from './mongodb';
import User from '@/models/User';

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                console.log('Auth request for:', credentials?.email);
                if (!credentials?.email || !credentials?.password) {
                    console.log('Auth failed: missing credentials');
                    throw new Error('Please enter an email and password');
                }

                console.log('Connecting to DB for auth...');
                await dbConnect();
                console.log('DB Connected for auth');

                console.log('Finding user...');
                const user = await User.findOne({ email: credentials.email });

                if (!user || user.password === undefined) {
                    console.log('Auth failed: user not found');
                    throw new Error('No user found with this email');
                }

                console.log('Comparing passwords...');
                const isPasswordCorrect = await bcrypt.compare(
                    credentials.password,
                    user.password
                );
                console.log('Password comparison result:', isPasswordCorrect);

                if (!isPasswordCorrect) {
                    console.log('Auth failed: incorrect password');
                    throw new Error('Incorrect password');
                }

                return {
                    id: user._id.toString(),
                    email: user.email,
                    name: user.name,
                    role: user.role,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id;
                (session.user as any).role = token.role;
            }
            return session;
        },
    },
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: 'jwt',
    },
    secret: process.env.NEXTAUTH_SECRET,
};
