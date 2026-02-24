import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import FoodListing from '@/models/FoodListing';

export async function GET() {
    try {
        await dbConnect();
        const listings = await FoodListing.find({});
        return NextResponse.json(listings.map(l => ({ id: l._id, title: l.title })));
    } catch (err: any) {
        return NextResponse.json({ error: err.message });
    }
}
