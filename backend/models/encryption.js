import mongoose from 'mongoose';

const encryptionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  encryptionMethod: {
    type: String,
    required: true
  }
});

const Encryption = mongoose.model('Encryption', encryptionSchema);

export default Encryption;