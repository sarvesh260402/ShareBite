import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import FoodListing from '@/models/FoodListing';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;
        console.log('GETTING LISTING BY ID:', id);
        const listing = await FoodListing.findById(id).populate('user', 'name role ratings');
        if (!listing) {
            return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
        }
        return NextResponse.json(listing);
    } catch (error: any) {
        console.error(`ERROR FETCHING LISTING:`, error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await req.json();
        await dbConnect();
        const { id } = await params;

        const listing = await FoodListing.findOneAndUpdate(
            { _id: id, user: (session.user as any).id },
            data,
            { new: true }
        );

        if (!listing) {
            return NextResponse.json({ error: 'Listing not found or unauthorized' }, { status: 404 });
        }

        return NextResponse.json(listing);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const { id } = await params;

        const listing = await FoodListing.findOneAndDelete({
            _id: id,
            user: (session.user as any).id,
        });

        if (!listing) {
            return NextResponse.json({ error: 'Listing not found or unauthorized' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Listing deleted successfully' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
