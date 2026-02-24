import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import FoodListing from '@/models/FoodListing';

export async function GET() {
    try {
        await dbConnect();
        const id = '699c2a6671f24d01b6747cba';
        const listing1 = await FoodListing.findById(id);
        const listing2 = await FoodListing.findById(id).populate('user', 'name role ratings');
        return NextResponse.json({
            listing1,
            listing2,
            isNull1: !listing1,
            isNull2: !listing2
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message });
    }
}
