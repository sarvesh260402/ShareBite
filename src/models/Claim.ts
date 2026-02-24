import mongoose, { Schema, Document } from 'mongoose';

export enum ClaimStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
}

export interface IClaim extends Document {
    listing: mongoose.Types.ObjectId;
    claimant: mongoose.Types.ObjectId;
    status: ClaimStatus;
    message?: string;
    deliveryInfo?: {
        name: string;
        phone: string;
    };
    billAmount?: number;
    createdAt: Date;
    updatedAt: Date;
}

const ClaimSchema: Schema = new Schema(
    {
        listing: { type: Schema.Types.ObjectId, ref: 'FoodListing', required: true },
        claimant: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        status: {
            type: String,
            enum: Object.values(ClaimStatus),
            default: ClaimStatus.PENDING,
        },
        message: { type: String },
        deliveryInfo: {
            name: { type: String },
            phone: { type: String },
        },
        billAmount: { type: Number },
    },
    { timestamps: true }
);

// In development, clear the model from mongoose to allow changes to the schema
if (process.env.NODE_ENV === 'development') {
    delete mongoose.models.Claim;
}

export default mongoose.models.Claim || mongoose.model<IClaim>('Claim', ClaimSchema);
