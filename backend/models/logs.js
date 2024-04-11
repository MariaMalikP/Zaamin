import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
    timestamp: Date,
    level: String,
    message: String,
    meta: {
      timestamp: Date
    }
});
  
const Log = mongoose.model('Log', logSchema);

export default Log;