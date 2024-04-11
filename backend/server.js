import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import Employee from './models/employees.js';
import Admin from './models/admins.js';
import Manager from './models/managers.js';
import Login from './models/userlogin.js';
import Log from './models/logs.js'
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer'
import otpGenerator from 'otp-generator'
dotenv.config();
import expressWinston from 'express-winston'
import winston from 'winston'
import winstonMongoDB from 'winston-mongodb';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const logger = winston.createLogger({
  transports: [
    new winston.transports.MongoDB({
      level : 'verbose', 
      db : process.env.MONG_URI,
      collection:'logs',
      options: {
        useUnifiedTopology: true
      }
    })
  ],
  format: winston.format.combine (
    winston.format.json(),
    winston.format.timestamp(),
    winston.format.metadata(),
  )
})

/* 
app.use(expressWinston.logger({
  transports: [
    new winston.transports.MongoDB({
      level : 'info', 
      db : process.env.MONG_URI,
      collection:'logs'
    })
  ],
  format: winston.format.combine (
    winston.format.json(),
    winston.format.timestamp(),
    winston.format.metadata(),
    winston.format.prettyPrint()
  )
}))
*/

/* Custom Message Logging 
Exposing if used as middleware
app.logger = expressWinston.logger

// Log an info message
logger.info('This is an informational message.');

// Log a warning message
logger.warn('This is a warning message.');

// Log an error message
logger.error('This is an error message.', { error: new Error('Something went wrong') });

*/

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

app.post('/empsignup',async(req,res)=>
{
  const {firstname,lastname,email,password,confpassword,age,phone,securityQ,address,selectedDate,department,employeeStatus} = req.body;

  //Checking to see if email already exists
  const emailExists= await Login.findOne({email:email}) 

  //check for valid password entry to ensure a strong password
  if(password.length<8 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) 
  { 
      res.json("pass problem")
  }

  //check to make sure confirm password and password are the same
  else if (password!==confpassword)
  {
    res.json("password mismatch")
  }
  else if (emailExists)
  {
    logger.warn(`Sign up attempt for existing account ${email}`)
    res.json("email exists")
  }

  else
  {
    const hashedPassword = bcrypt.hashSync(password, 10);

    //finding the max id number, and assiging a new id accordingly, by incrementing the id value
    const allIds = await Login.find({}).select('id').lean();
    const ids = allIds.map(item => item.id);
    const numericParts = ids
      .map(id => (id.match(/\d+/) || [])[0])  //Extracting numeric part using regex
      .filter(Boolean)  
      .map(Number); 
    const maxNumericPart = Math.max(...numericParts);

    let newId;
    if(maxNumericPart.length===0|| maxNumericPart===-Infinity)
    {
      newId='1';
    }
    else
    {
      newId= (maxNumericPart+1).toString()
    }

    //id assigned according to the role of the user
    let finalId;
    if(employeeStatus==="employee")
    {
      finalId=`EMP${newId}`;
    }
    else if (employeeStatus==="admin")
    {
      finalId=`ADM${newId}`;
    }
    else if(employeeStatus==="manager")
    {
      finalId=`MNR${newId}`;
    }

    const data=
    {
        email: email,
        hashedPassword: hashedPassword,
        id:finalId,
    }

    try
    {
      //inserting the data recieved in the login table, as well as the user table, according to the role of the user.
      await Login.insertMany(data)
      if(employeeStatus==="employee")
      {
        const empData=
        {
            First_Name: firstname,
            Last_Name: lastname,
            Email: email,
            Age: age,
            Phone_Number: phone,
            Address: address,
            Employee_ID: finalId,
            Department: department,
            Profile_Image: "default.png",
            Date_of_Birth: selectedDate,
        }
        await Employee.insertMany(empData)
      }
      else if (employeeStatus==="admin")
      {
        const empData=
        {
            First_Name: firstname,
            Last_Name: lastname,
            Email: email,
            Age: age,
            Phone_Number: phone,
            Address: address,
            Admin_ID: finalId,
            Department: department,
            Profile_Image: "default.png",
            Date_of_Birth: selectedDate,
        }
        await Admin.insertMany(empData)
      }
      else if(employeeStatus==="manager")
      {
        const empData=
        {
            First_Name: firstname,
            Last_Name: lastname,
            Email: email,
            Age: age,
            Phone_Number: phone,
            Address: address,
            Manager_ID: finalId,
            Department: department,
            Profile_Image: "default.png",
            Date_of_Birth: selectedDate,
        }
        await Manager.insertMany(empData)
      }
      logger.info(`Successful signup for ${email}`)
      res.json("yay")
    }
    catch(e)
        {
            logger.error(`Sign up failed for ${email}`)
            console.log("smth happened",e)
            res.json("ohooo")
        }
    }
});

app.post('/sendemail', async(req,res) => {
    function sendEmail(props) {
      const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
              user: process.env.USER,
              pass: process.env.APP_PASSWORD
          }
      });

      const mailOptions = {
          from: "Zaamin Admin <donotreply@email.com>",
          to: props.email,
          subject: 'Your OTP',
          html: `<p style="font-size: 16px; color: #333; margin-bottom: 10px;"> Your one-time password (OTP) is: <h2 style="font-size: 24px; color: #F18550;">${props.otp}</h2> Do not share this OTP with anyone. </p>`
      };

      transporter.sendMail(mailOptions, function(error, info){
          if (error) {
              console.log(error);
              res.status(500).send('Failed to send OTP');
          } else {
              console.log('Email sent: ' + info.response);
              const hashedOTP = bcrypt.hashSync(otp, 10);
              res.send(hashedOTP)
          }
      });
  }

  const otp = otpGenerator.generate(4, { digits: true, upperCase: false, specialChars: false });
  const {email} = req.body
  console.log(otp, email)
  sendEmail({otp: otp, email: email, url:'http://localhost:3001/otp'})
  logger.info(`OTP Verification email sent to ${email}`)
})

app.post('/login', async (req, res) => {
  try {
    console.log("bhere")
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
      if (user.id.startsWith('ADM')) {
        role = 'admin';
      } else if (user.id.startsWith('MNR')) {
        role = 'manager';
      } else if (user.id.startsWith('EMP')) {
        role = 'employee';
      }
      console.log('Login successful');
      logger.info(`Successful Login by ${email}`)
      return res.json({ status: 'success', userrole: role });
    } else {
      // Passwords don't match, respond with 401 Unauthorized
      console.log('Login failed');
      logger.warn(`Failed login attempt (password mismatch) by ${email}`)
      return res.json({ status: 'failed' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    logger.warn(`Error during login: ${error}`)
    return res.status(500).json({ error: 'Server error' });
  }
});

app.post('/viewprofile', async (req, res) => {
  try {
    const { email, role } = req.body;
    console.log(role);
    logger.info(`View profile attempt by ${email}`)
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
      logger.warn(`View profile by nonexistent user`)
      return res.status(404).json({ error: 'User profile not found' });
    }
  } catch (error) {
    console.error(error);
    logger.error(`Server Error`)
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/edit_profile', async (req, res) => {
  console.log("in edit profile");
  try {
    console.log("here we do");
    const { email, role, editedProfile } = req.body;
    // console.log(editedProfile);

    logger.warn(`Edit Profile attempt by ${email}`)
    let profile;
    if(role === 'admin') {
      profile = await Admin.updateOne({ Email: email }, {$set: editedProfile });
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
    logger.warn(`Error updating profile by ${email}: ${error}`)
    console.error('Error updating profile:', error);
    logger.error(`Server Error`)
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/getname', async (req, res) => {
  try {
    const { email, role } = req.body;
    console.log(role);
    let profile;
    if(role === 'admin') {
      profile = await Admin.findOne({ Email: email });
    } else if(role === 'employee') {
      profile = await Employee.findOne({ Email: email });
    } else if(role === 'manager') {
      profile = await Manager.findOne({ Email: email });
    } else {
      return res.status(404).json({ error: 'Invalid role' });
    }
    if (profile === null) {
      return res.json({ status: "profile not found"});
    }
    return res.json({ status: "profile exists", firstname: profile.First_Name, lastname: profile.Last_Name });
  } catch (error) {
    console.error(error);
    logger.error(`Server Error`)
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/searchres', async (req, res) => {
  try {
    const { searchTerm } = req.body;
    const regex = new RegExp(searchTerm, 'i'); // Create regex for case-insensitive search

    const adminProfiles = await Admin.find({
      $or: [
        { First_Name: regex }, // Match first name
        { Last_Name: regex }, // Match last name
        { Department: regex }, // Match department
      ]
    });

    const employeeProfiles = await Employee.find({
      $or: [
        { First_Name: regex }, // Match first name
        { Last_Name: regex }, // Match last name
        { Department: regex }, // Match department
      ]
    });

    const managerProfiles = await Manager.find({
      $or: [
        { First_Name: regex }, // Match first name
        { Last_Name: regex }, // Match last name
        { Department: regex }, // Match department
      ]
    });
    logger.info(`Search for ${searchTerm}`)
    // Concatenate all matching profiles
    const allProfiles = adminProfiles.concat(employeeProfiles, managerProfiles);
    console.log("allProf");
    console.log(allProfiles);
    return res.json({ profiles: allProfiles });
  } catch (error) {
    console.error('Error searching profiles:', error);
    logger.error(`Server Error`)
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/viewsearchprofile', async (req, res) => {
  try {
    const { email } = req.body;
    console.log("ressssssssultssssssss")
    // Search in Admin table
    let profile = await Admin.findOne({ Email: email });
    if (profile) {
      console.log(profile);

      return res.json({ status: "profile exists", profile_deets: profile });

    }

    // If not found in Admin, search in Employee table
    profile = await Employee.findOne({ Email: email });
    if (profile) {
      console.log(profile);

      return res.json({ status: "profile exists", profile_deets: profile });

    }

    logger.info(`View Search Profile by ${email}`)

    // If not found in Employee, search in Manager table
    profile = await Manager.findOne({ Email: email });
    if (profile) {
      console.log(profile);

      return res.json({ status: "profile exists", profile_deets: profile });

    }

    // If not found in any table, return not found error
    return res.status(404).json({ error: 'User profile not found' });
  } catch (error) {
    console.error(error);
    logger.error(`Server Error`)
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/findrole', async (req, res) => {
  try {
    const { email } = req.body;
    console.log("ressssssssultssssssss rollig")
    let role = '';
    let profile = await Admin.findOne({ Email: email });
    if (profile) {
      role="admin";
      console.log(role);
      return res.json(role);

    }

    // If not found in Admin, search in Employee table
    profile = await Employee.findOne({ Email: email });
    if (profile) {
      role="employee";
      console.log(role);
      return res.json(role);
    }

    // If not found in Employee, search in Manager table
    profile = await Manager.findOne({ Email: email });
    if (profile) {
      role="manager";
      console.log(role);
      return res.json(role);
    }

    // If not found in any table, return not found error
    return res.status(404).json({ error: 'User profile not found' });
  } catch (error) {
    console.error(error);
    logger.error(`Server Error`)
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/logs', async (req, res) => {
  logger.warn(`Audit Logs fetched`)
  try {
    let logs = await Log.find({})
    return res.json(logs)
  } catch {
    logger.error(`Server Error`)
    res.status(500).json({ error: 'Server error' });
  }
});

/* dev to delete particular logs
app.post('/dellogs', async (req, res) => {
  try {
    let ans = await Log.deleteMany({ message: "Audit Logs fetched" })
    return res.status(200)
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
}); 
*/


export default app;