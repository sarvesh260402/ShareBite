import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Claim, { ClaimStatus } from '@/models/Claim';
import FoodListing, { FoodStatus } from '@/models/FoodListing';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { listingId, message } = await req.json();
        await dbConnect();

        // Check if already claimed or reserved
        const existingListing = await FoodListing.findById(listingId);
        if (!existingListing || existingListing.status !== FoodStatus.AVAILABLE) {
            return NextResponse.json({ error: 'Food is no longer available' }, { status: 400 });
        }

        // Mock Delivery Partner and Bill Information
        const deliveryInfo = {
            name: "Rahul Kumar",
            phone: "+91 98765 43210",
        };
        // Generate a random bill amount between 20 and 50 INR for packaging/delivery
        const generatedBillAmount = Math.floor(Math.random() * 30) + 20;

        console.log("Creating claim with payload:", {
            listing: listingId,
            claimant: (session.user as any).id,
            message,
            deliveryInfo,
            billAmount: generatedBillAmount,
            status: ClaimStatus.APPROVED
        });

        const claim = await Claim.create({
            listing: listingId,
            claimant: (session.user as any).id,
            message,
            deliveryInfo,
            billAmount: generatedBillAmount,
            status: ClaimStatus.APPROVED // Auto-approving for this flow per requirements
        });

        console.log("Claim successfully created:", claim._id);

        // Update Listing Status so it doesn't show as available anymore
        existingListing.status = FoodStatus.RESERVED;
        await existingListing.save();

        console.log("Listing successfully updated to RESERVED");

        return NextResponse.json(claim, { status: 201 });
    } catch (error: any) {
        console.error("CRITICAL ERROR IN CLAIM POST:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const userId = (session.user as any).id;

        // 1. Get claims where the user is the claimant (receiver role actions)
        const myClaims = await Claim.find({ claimant: userId }).populate({
            path: 'listing',
            populate: { path: 'user', select: 'name email phoneNumber role' }
        }).populate('claimant', 'name email phoneNumber role');

        // 2. Get claims made on the user's food listings (sender role actions)
        const senderListings = await FoodListing.find({ user: userId }).select('_id');
        const listingIds = senderListings.map(l => l._id);
        const claimsOnMyFood = await Claim.find({ listing: { $in: listingIds } }).populate({
            path: 'listing',
            populate: { path: 'user', select: 'name email phoneNumber role' }
        }).populate('claimant', 'name email phoneNumber role');

        // Combine unique claims
        const claimsMap = new Map();
        myClaims.forEach(c => claimsMap.set(c._id.toString(), c));
        claimsOnMyFood.forEach(c => claimsMap.set(c._id.toString(), c));

        const claims = Array.from(claimsMap.values());

        // Sort descending by creation date
        claims.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return NextResponse.json(claims);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
