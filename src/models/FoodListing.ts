import mongoose, { Schema, Document } from 'mongoose';

export enum FoodStatus {
    AVAILABLE = 'available',
    RESERVED = 'reserved',
    PICKED_UP = 'picked_up',
    EXPIRED = 'expired',
}

export enum FoodCategory {
    VEG = 'veg',
    NON_VEG = 'non-veg',
}

export interface IFoodListing extends Document {
    title: string;
    description: string;
    image: string;
    category: FoodCategory;
    quantity: string;
    expiryTime: Date;
    location: {
        type: string;
        coordinates: [number, number]; // [longitude, latitude]
    };
    status: FoodStatus;
    user: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const FoodListingSchema: Schema = new Schema(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        image: { type: String, required: true },
        category: {
            type: String,
            enum: Object.values(FoodCategory),
            required: true,
        },
        quantity: { type: String, required: true },
        expiryTime: { type: Date, required: true },
        location: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point',
            },
            coordinates: {
                type: [Number],
                required: true,
            },
        },
        status: {
            type: String,
            enum: Object.values(FoodStatus),
            default: FoodStatus.AVAILABLE,
        },
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    },
    { timestamps: true }
);

FoodListingSchema.index({ location: '2dsphere' });

// In development, clear the model from mongoose to allow changes to the schema
if (process.env.NODE_ENV === 'development') {
    delete mongoose.models.FoodListing;
}

export default mongoose.models.FoodListing ||
    mongoose.model<IFoodListing>('FoodListing', FoodListingSchema);
