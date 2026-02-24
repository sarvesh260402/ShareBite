import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { UserRole } from '@/models/User';

export async function POST(req: Request) {
    try {
        const { name, email, password, role } = await req.json();

        if (!name || !email || !password || !role) {
            return NextResponse.json(
                { message: `Missing required fields: ${!name ? 'name ' : ''}${!email ? 'email ' : ''}${!password ? 'password ' : ''}${!role ? 'role' : ''}` },
                { status: 400 }
            );
        }

        await dbConnect();

        const userExists = await User.findOne({ email });

        if (userExists) {
            return NextResponse.json(
                { message: 'User already exists' },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
        });

        return NextResponse.json(
            { message: 'User registered successfully', user: { id: newUser._id, email: newUser.email, role: newUser.role } },
            { status: 201 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { message: 'Error registering user', error: error.message },
            { status: 500 }
        );
    }
}
