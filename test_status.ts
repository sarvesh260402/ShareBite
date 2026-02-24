import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import mongoose from 'mongoose';
import FoodListing from './src/models/FoodListing';

async function check() {
    await mongoose.connect(process.env.MONGODB_URI as string);
    const listing = await FoodListing.findById('699c2a6671f24d01b6747cba');
    console.log('Status of listing is:', listing?.status);
    process.exit(0);
}
check();
