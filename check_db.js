const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const db = mongoose.connection.db;
        if (!db) {
            throw new Error('Database connection failed - db is undefined');
        }
        const listings = await db.collection('foodlistings').find({}).toArray();
        console.log(`Found ${listings.length} listings:`);
        listings.forEach(l => console.log(l._id.toString()));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
