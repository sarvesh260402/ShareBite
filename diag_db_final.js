const mongoose = require('mongoose');
const fs = require('fs');

async function run() {
    try {
        const env = fs.readFileSync('.env.local', 'utf8');
        const uri = env.match(/MONGODB_URI=(.+)/)[1].trim();
        console.log('Connecting to:', uri);
        await mongoose.connect(uri);
        console.log('Connected.');

        // Check if the collection exists and has data
        const db = mongoose.connection.db;
        if (!db) {
            throw new Error('Database connection failed - db is undefined');
        }
        const collections = await db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name));

        const listings = await db.collection('foodlistings').find({}).toArray();
        console.log(`Found ${listings.length} listings:`);
        listings.forEach(l => {
            console.log(`- ${l.title}: Status=${l.status}, User=${l.user}, Expiry=${l.expiryTime}`);
        });

        process.exit(0);
    } catch (err) {
        console.error('DIAG ERROR:', err);
        process.exit(1);
    }
}

run();
