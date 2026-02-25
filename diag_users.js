const mongoose = require('mongoose');
const fs = require('fs');

async function run() {
    try {
        const env = fs.readFileSync('.env.local', 'utf8');
        const uri = env.match(/MONGODB_URI=(.+)/)[1].trim();
        await mongoose.connect(uri);

        const db = mongoose.connection.db;
        if (!db) {
            throw new Error('Database connection failed - db is undefined');
        }
        const users = await db.collection('users').find({}).toArray();
        console.log(`Found ${users.length} users:`);
        users.forEach(u => {
            console.log(`- ${u.name} (${u.email}): ID=${u._id}, Role=${u.role}`);
        });

        process.exit(0);
    } catch (err) {
        console.error('DIAG ERROR:', err);
        process.exit(1);
    }
}

run();
