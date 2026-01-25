const mongoose = require('mongoose');
require('dotenv').config();

console.log('Testing connection...');

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('SUCCESS: MongoDB Connected Successfully!');
        process.exit(0);
    })
    .catch(err => {
        console.error('FAILURE: Connection Failed');
        console.error(err.message);
        process.exit(1);
    });
