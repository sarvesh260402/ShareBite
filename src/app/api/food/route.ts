import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import FoodListing, { FoodStatus } from '@/models/FoodListing';

export async function GET(req: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const lat = searchParams.get('lat');
        const lng = searchParams.get('lng');
        const distance = searchParams.get('distance') || '10'; // Default 10km
        const category = searchParams.get('category');

        let query: any = { status: FoodStatus.AVAILABLE };

        if (category && category !== 'all') {
            query.category = category;
        }

        if (lat && lng) {
            query.location = {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(lng), parseFloat(lat)],
                    },
                    $maxDistance: parseInt(distance) * 1000, // km to meters
                },
            };
        }

        let listings;
        if (lat && lng) {
            try {
                // Ensure indexes are created for geospatial queries
                await FoodListing.createIndexes();

                // When using $near, sorting is handled by distance automatically
                listings = await FoodListing.find(query)
                    .populate('user', 'name role ratings');
            } catch (queryError: any) {
                console.warn('Geospatial query failed, falling back to basic search:', queryError.message);
                // Fallback: Remove location from query and search normally
                const fallbackQuery = { ...query };
                delete fallbackQuery.location;
                listings = await FoodListing.find(fallbackQuery)
                    .populate('user', 'name role ratings')
                    .sort({ createdAt: -1 });
            }
        } else {
            listings = await FoodListing.find(query)
                .populate('user', 'name role ratings')
                .sort({ createdAt: -1 });
        }

        return NextResponse.json(listings);
    } catch (error: any) {
        console.error('FOOD FETCH ERROR:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await req.json();
        await dbConnect();

        const listing = await FoodListing.create({
            ...data,
            user: (session.user as any).id,
        });

        return NextResponse.json(listing, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
