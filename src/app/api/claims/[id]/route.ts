import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Claim, { ClaimStatus } from '@/models/Claim';
import FoodListing, { FoodStatus } from '@/models/FoodListing';

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const claim = await Claim.findById(params.id)
            .populate({
                path: 'listing',
                populate: { path: 'user', select: 'name email phoneNumber location' }
            })
            .populate('claimant', 'name email phoneNumber location');

        if (!claim) {
            return NextResponse.json({ error: 'Claim not found' }, { status: 404 });
        }

        // Only allow sender or receiver involved in the claim to view details
        const userId = (session.user as any).id;
        const isClaimant = claim.claimant._id.toString() === userId;
        const isDonor = claim.listing.user._id.toString() === userId;

        if (!isClaimant && !isDonor) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        return NextResponse.json(claim);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { status, deliveryInfo, billAmount } = await req.json();
        await dbConnect();

        const claim = await Claim.findById(params.id).populate('listing');
        if (!claim) {
            return NextResponse.json({ error: 'Claim not found' }, { status: 404 });
        }

        const userId = (session.user as any).id;
        const isDonor = (claim.listing as any).user.toString() === userId;

        if (!isDonor) {
            return NextResponse.json({ error: 'Only the food donor can approve claims' }, { status: 403 });
        }

        // Update claim status and delivery info
        claim.status = status || claim.status;
        if (deliveryInfo) claim.deliveryInfo = deliveryInfo;
        if (billAmount) claim.billAmount = billAmount;
        await claim.save();

        // If approved, update listing status
        if (status === ClaimStatus.APPROVED) {
            await FoodListing.findByIdAndUpdate(claim.listing._id, { status: FoodStatus.RESERVED });

            // Reject all other pending claims for this listing
            await Claim.updateMany(
                { listing: claim.listing._id, _id: { $ne: claim._id }, status: ClaimStatus.PENDING },
                { status: ClaimStatus.REJECTED }
            );
        }

        return NextResponse.json(claim);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
