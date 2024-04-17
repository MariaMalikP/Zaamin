import mongoose from 'mongoose';

const financialInfoSchema = new mongoose.Schema({
id: {
    type: String,
    required: true,
    unique: true
    },
  email: {
    type: String,
    required: true,
    unique: true
  },
  salary: {
    type: Number,
    required: true
  },
  bonuses: {
    type: Number,
    default: 0
  },
  commissions: {
    type: Number,
    default: 0
  },
  benefits: {
    type: [String],
    default: []
  },
  expenses: {
    type: Number,
    default: 0
  },
  bankInformation: {
    type: {
      bankName: String,
      ibanNum: String,
    },
    default: {}
  },
}, { timestamps: true });

const FinancialInfo = mongoose.model('FinancialInfo', financialInfoSchema, 'FinancialInfo');

export default FinancialInfo;
