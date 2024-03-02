import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import Employee from './models/employees.js';
import Admin from './models/admins.js';
import Manager from './models/managers.js';
import Login from './models/userlogin.js';
import bcrypt from 'bcrypt';

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());


mongoose.connect(process.env.MONG_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  app.listen(process.env.PORT, () => {
    console.log('Listening on port ' + process.env.PORT);
    console.log("Connected to Database");
});
})
.catch((error) => {
  console.log(error);
});



app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Email:', email);

    // Find user by email
    const user = await Login.findOne({ email });

    if (!user) {
      // If user not found, respond with 401 Unauthorized
      return res.json({ status: 'failed'});
    }

    // Compare passwords using bcrypt
    const passwordMatch = await bcrypt.compare(password, user.hashedPassword);

    if (passwordMatch) {
      // Passwords match, determine user role
      let role = '';
      if (user.id.startsWith('A')) {
        role = 'admin';
      } else if (user.id.startsWith('M')) {
        role = 'manager';
      } else if (user.id.startsWith('E')) {
        role = 'employee';
      }
      console.log('Login successful');
      return res.json({ status: 'success', role });
    } else {
      // Passwords don't match, respond with 401 Unauthorized
      console.log('Login failed');
      return res.json({ status: 'failed' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// app.post('/login', async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     console.log ('asss email',email)
//     console.log('pass',password)
//     let user = await Login.findOne({ email: email, hashedPassword: password });
//     if (user) {
//       let role = '';
//       if (user.id.startsWith('A')) {
//         role = 'admin';
//       } else if (user.id.startsWith('M')) {
//         role = 'manager';
//       } else if (user.id.startsWith('E')) {
//         role = 'employee';
//       console.log('party yes correct')
//       }
//       return res.json({ status: "success", role: role });
//     }
//     console.log('party no'  );
//     // If user not found in any collection then respond with 401 Unauthorized
//     return res.json({ status: "failed"});
//   } 
//   catch (error) {
//     console.log('erorororor')
//     console.error('Error during login:', error);
//     res.status(500).json({ error: 'server error' }); // send error message for troubleshooting
//   }
// });


app.post('/viewprofile', async (req, res) => {
  try {
    const { email, role } = req.body;
    console.log(role);
    if(role === 'admin') {
      const profile = await Admin.findOne({ Email: email });
      return res.json({ status: "profile exists", profile_deets: profile });
    } else if(role === 'employee') {
      console.log(email)
      const profile = await Employee.findOne({ Email: email });
      console.log(profile);
      return res.json({ status: "profile exists", profile_deets: profile });
    } else if(role === 'manager') {
      const profile = await Manager.findOne({ Email: email });
      return res.json({ status: "profile exists", profile_deets: profile });
    } else {
      return res.status(404).json({ error: 'User profile not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/edit_profile', async (req, res) => {
  console.log("in edit profile");
  try {
    console.log("here we do");
    const { email, role, editedProfile } = req.body;
    // console.log(editedProfile);

    let profile;
    if(role === 'admin') {
      profile = await Admin.findOne({ Email: email }, {$set: editedProfile });
    } else if(role === 'employee') {
      console.log(editedProfile);
      console.log(email)
      profile = await Employee.updateOne({ Email: email }, {$set: editedProfile });
    } else if(role === 'manager') {
      profile = await Manager.updateOne({ Email: email }, {$set: editedProfile });
    } else {
      return res.status(404).json({ error: 'User profile not found' });
    }
    console.log("profile");
    console.log(profile);
    return res.json({ status: "profile updated", profile_deets: profile });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default app;