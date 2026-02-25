import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function check() {
    try {
        console.log('Connecting to:', process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI as string);
        const db = mongoose.connection.db;
        if (!db) {
            throw new Error('Database connection failed - db is undefined');
        }
        const listings = await db.collection('foodlistings').find({}).toArray();
        console.log(`Found ${listings.length} listings total.`);
        listings.forEach(l => {
            console.log(`- Title: ${l.title}, Status: ${l.status}, User: ${l.user}, Expiry: ${l.expiryTime}`);
        });
        process.exit(0);
    } catch (err) {
        console.error('ERROR:', err);
        process.exit(1);
    }
}
check();
