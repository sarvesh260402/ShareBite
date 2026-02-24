import mongoose from 'mongoose';
import Claim from './src/models/Claim';

async function check() {
    await mongoose.connect(process.env.MONGODB_URI as string);
    const claims = await Claim.find({});
    console.log('All Claims in DB:');
    console.log(JSON.stringify(claims, null, 2));
    process.exit(0);
}
check();
