import mongoose, { Schema, Document } from 'mongoose';

export enum UserRole {
    SENDER = 'sender',
    RECEIVER = 'receiver',
}

export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    image?: string;
    location?: {
        type: string;
        coordinates: [number, number]; // [longitude, latitude]
    };
    phoneNumber?: string;
    ratings?: number;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String }, // Optional for OAuth if added later
        role: {
            type: String,
            enum: ['sender', 'receiver'],
            default: 'sender',
        },
        image: { type: String },
        location: {
            type: {
                type: String,
                enum: ['Point'],
            },
            coordinates: {
                type: [Number],
            },
        },
        phoneNumber: { type: String },
        ratings: { type: Number, default: 0 },
    },
    { timestamps: true }
);

// UserSchema.index({ location: '2dsphere' }); // Removed for now to avoid insertion issues when coordinates are missing

// In development, clear the model from mongoose to allow changes to the schema
if (process.env.NODE_ENV === 'development') {
    delete mongoose.models.User;
}

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
