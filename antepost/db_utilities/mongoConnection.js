require('dotenv').config();
const mongoose = require('mongoose');

const establishMongoConnection = async () => {
    console.log('Connecting to MongoDB');
    try {
        await mongoose.connect(`mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DB}`, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
        });
    } catch (err) {
        throw err;
    }
    const admin = new mongoose.mongo.Admin(mongoose.connection.db);
    return new Promise((resolve, reject) => {
        admin.buildInfo((err, info) => {
            if (err) reject(err);
            console.log(`Connection to MongoDB (version ${info.version}) has been successfully established`);
            resolve();
        })
    });
};

module.exports = establishMongoConnection;
