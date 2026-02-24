const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

async function dump() {
    try {
        console.log('Connecting to:', MONGODB_URI);
        await mongoose.connect(MONGODB_URI);
        console.log('Connected!');

        const FoodListing = mongoose.models.FoodListing || mongoose.model('FoodListing', new mongoose.Schema({}, { strict: false }));

        const listings = await FoodListing.find({});
        console.log('Found', listings.length, 'listings.');

        listings.forEach(l => {
            console.log(`ID: ${l._id} | Title: ${l.title} | User: ${l.user}`);
        });

        await mongoose.disconnect();
        console.log('Done!');
    } catch (error) {
        console.error('FAILED:');
        console.error(error);
        process.exit(1);
    }
}

dump();
