const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env.local') });

async function check() {
    try {
        console.log('Connecting to:', process.env.MONGODB_URI);
        if (!process.env.MONGODB_URI) {
            console.error('MONGODB_URI is not defined in .env.local');
            process.exit(1);
        }
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        const db = mongoose.connection.db;
        if (!db) {
            throw new Error('Database connection failed - db is undefined');
        }
        const listings = await db.collection('foodlistings').find({}).toArray();

        console.log(`\nTOTAL LISTINGS: ${listings.length}\n`);

        listings.forEach(l => {
            console.log(`[${l._id}]`);
            console.log(`  Title: ${l.title}`);
            console.log(`  Status: ${l.status}`);
            console.log(`  User: ${l.user}`);
            console.log(`  Expiry: ${l.expiryTime}`);
            console.log(`  Created: ${l.createdAt}`);
            console.log('-------------------');
        });

        process.exit(0);
    } catch (err) {
        console.error('DIAGNOSTIC ERROR:', err);
        process.exit(1);
    }
}
check();
