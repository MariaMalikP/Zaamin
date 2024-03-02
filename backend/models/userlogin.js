import mongoose from 'mongoose';

const loginSchema = new mongoose.Schema({
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
  hashedPassword: {
    type: String,
    required: true
  }
});

const Login = mongoose.model('Login', loginSchema);

export default Login;
