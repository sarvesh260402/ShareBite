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
        const userId = searchParams.get('userId');
        const showAll = searchParams.get('showAll') === 'true';

        let query: any = {};

        if (!showAll) {
            query.status = FoodStatus.AVAILABLE;
            query.expiryTime = { $gt: new Date() };
        }

        if (userId) {
            query.user = userId;
        }

        // Proactively mark expired listings as EXPIRED in the background
        // (Optional: this could be moved to a cron job, but doing it on-demand is fine for low traffic)
        FoodListing.updateMany(
            { status: FoodStatus.AVAILABLE, expiryTime: { $lt: new Date() } },
            { status: FoodStatus.EXPIRED }
        ).exec().catch(err => console.error('Error auto-expiring listings:', err));

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
                .populate('user')
                .sort({ createdAt: -1 });
        }

        console.log('API /api/food: found', listings.length, 'listings for query', JSON.stringify(query));
        if (listings.length > 0) {
            console.log('API /api/food: first listing user:', listings[0].user);
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
