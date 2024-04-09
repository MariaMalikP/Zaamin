import mongoose from 'mongoose';

const regulationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
      },
      description: {
        type: String,
        required: true,
        unique: true
      },
});

const Regulation = mongoose.model('Regulation', regulationSchema);

export default Regulation;