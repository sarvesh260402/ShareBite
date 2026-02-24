import mongoose from 'mongoose';
import FoodListing from './src/models/FoodListing';

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI as string);
        const listing = await FoodListing.findById('699c2a6671f24d01b6747cba');
        console.log('Mongoose findById:', listing);

        const allListings = await FoodListing.find({});
        console.log('Mongoose count:', allListings.length);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
