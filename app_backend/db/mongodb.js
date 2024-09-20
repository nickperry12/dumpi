import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected from MongoDB');
})

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB!');
  }).catch((error) => {
    console.error(`There was an error: ${error}`)
  });

// Create a mongoose model without a schema
export const Request = mongoose.model('Request', new mongoose.Schema({}, { strict: false }));

//use Request to interact with the collection
export async function saveRequestToMongo(requestPayload) {
  const request = new Request({
    payload: requestPayload
  });

  try {
    return await request.save();
  } catch (err) {
    console.error('Error saving Request: ', err);
  }
};

export async function getMongoRecord(mongoId) {
    try {
      return await Request.findById(mongoId).exec();
    } catch (err) {
      console.error('Error fetching Mongo Record: ', err)
    }
}