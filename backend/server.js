import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import Employee from './models/employees.js';
import Admin from './models/admins.js';
import Manager from './models/managers.js';
import Login from './models/userlogin.js';
import Log from './models/logs.js'
import Encryption from './models/encryption.js';
import bcrypt from 'bcrypt';
import CryptoJS from 'crypto-js';
import crypto from 'crypto';
import multer from 'multer';
import nodemailer from 'nodemailer'
import otpGenerator from 'otp-generator'
import expressWinston from 'express-winston'
import winston from 'winston'
import winstonMongoDB from 'winston-mongodb';
import Todo from './models/todo.js';
dotenv.config();

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

/* Custom Message Logging 
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

const ENCRYPTION_KEY_AES = 'H@pP!Ly5tr0nG&SecuREkEy123!#@%*';

function encrypt_aes(text) {
  return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY_AES).toString();
}

function decrypt_aes(ciphertext) {
  const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY_AES);
  return bytes.toString(CryptoJS.enc.Utf8);
}


const key = crypto.createHash('sha256').update('YourSecretKey').digest('base64').substr(0, 32); // Adjust the length as needed

function encrypt_aes_cbc(data) {
  console.log("data",data)
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
  let encryptedData = cipher.update(data, 'utf-8', 'hex');
  encryptedData += cipher.final('hex');
  return iv.toString('hex') + ':' + encryptedData;
}

function decrypt_aes_cbc(encryptedData) {
  // console.log("encryptedData",encryptedData)
  const parts = encryptedData.split(':');
  const iv = Buffer.from(parts.shift(), 'hex');
  const encryptedText = Buffer.from(parts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
  let decryptedData = decipher.update(encryptedText, 'hex', 'utf-8');
  decryptedData += decipher.final('utf-8');
  return decryptedData;
}
// AES ECB Encryption
function encrypt_aes_ecb(data) {
  const cipher = crypto.createCipheriv('aes-256-ecb', Buffer.from(key), null);
  let encryptedData = cipher.update(data, 'utf-8', 'hex');
  encryptedData += cipher.final('hex');
  return encryptedData;
}

// AES ECB Decryption
function decrypt_aes_ecb(encryptedData) {
  const decipher = crypto.createDecipheriv('aes-256-ecb', Buffer.from(key), null);
  let decryptedData = decipher.update(encryptedData, 'hex', 'utf-8');
  decryptedData += decipher.final('utf-8');
  return decryptedData;
}

function decryptProfile(profile, method_encryption) {
  const fieldsToExcludeFromDecryption = ['First_Name', 'Last_Name', 'Email','email', 'Employee_ID', 'Admin_ID', 'Manager_ID', 'Date_of_Birth', 'Age','createdAt','updatedAt','Profile_Image','id','medicalHistory'];
  let decryptedProfile = {};
  
  if (method_encryption === "AES-CBC") {
    decryptedProfile = {};
    Object.keys(profile._doc).forEach(key => {
      if (['_id', '__v', ...fieldsToExcludeFromDecryption].includes(key)) {
        decryptedProfile[key] = profile[key];
      } else {
        console.log("key",key,"Value",profile[key],"type",typeof (profile[key]));
        decryptedProfile[key] = decrypt_aes_cbc(profile[key]);
      }
    });
  } else if (method_encryption === "AES-GCM") {
    decryptedProfile = {};
    Object.keys(profile._doc).forEach(key => {
      if (['_id', '__v', ...fieldsToExcludeFromDecryption].includes(key)) {
        decryptedProfile[key] = profile[key];
      } else {
        console.log("key",key,"Value",profile[key],"type",typeof (profile[key]));
        decryptedProfile[key] = decrypt_aes_ecb(profile[key]);
      }
    });
  } else if (method_encryption === "AES") {
    decryptedProfile = {};
    Object.keys(profile._doc).forEach(key => {
      if (['_id', '__v', ...fieldsToExcludeFromDecryption].includes(key)) {
        decryptedProfile[key] = profile[key];
      } else {
        console.log("key",key,"Value",profile[key],"type",typeof (profile[key]));
        decryptedProfile[key] = decrypt_aes(profile[key]);
      }
    });
  } else {
    decryptedProfile = profile;
  }
  
  return decryptedProfile;
}
function encryptProfile(element, method_encryption) {
  if (method_encryption === "AES-CBC") 
  {return encrypt_aes_cbc(element);} 
  else if (method_encryption === "AES-GCM") 
  {return encrypt_aes_ecb(element);} 
  else if (method_encryption === "AES") 
  {return encrypt_aes(element);}
}

async function getEncryptionMethodById(id) {
  try {
    const encryptionData = await Encryption.findOne({ id: id });
    if (!encryptionData) {
      // console.log("Encryption data not found for ID:", id);
      return null;
    }
    // console.log("Encryption data found:", encryptionData);
    return encryptionData.encryptionMethod;
  } catch (error) {
    console.error("Error while fetching encryption data:", error);
  }
}


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
  async function sendEmail(props) {
    var data = {
      service_id: 'service_ght1pvl',
      template_id: 'template_o3fo23l',
      user_id: 'hMDaxOh2b9hIQhZ_5',
      accessToken: process.env.EMAILJS_PRIVATE,
      template_params: {
        'to_send': props.email,
        'otp': props.otp,
      }
    } 
    try {
      const response = await axios.post('https://api.emailjs.com/api/v1.0/email/send', data)
      if (response.status == 200)
      {
        console.log('Email sent');
        logger.info(`OTP Verification email sent to ${email}`)
        const hashedOTP = bcrypt.hashSync(otp, 10);
        res.send(hashedOTP)
      }
      else {
        res.status(500).send('1 Failed to send OTP');
      }
    }
    catch (error) {
      console.log(error)
      res.status(500).send('2 Failed to send OTP');
    }
  }

  const otp = otpGenerator.generate(4, { digits: true, upperCase: false, specialChars: false });
  const {email} = req.body
  console.log(otp, email)
  sendEmail({otp: otp, email: email, url:'http://localhost:3001/otp'})
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
      return res.json({ status: 'success', userrole: role, hashcheck : user.hashedPassword });
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
  const email = req.query.email || null
  try {
    let logs = await Log.find({})
    logger.warn(`Audit Logs fetched by ${email}`)
    return res.json(logs)
  } catch {
    logger.error(`Server Error`)
    res.status(500).json({ error: 'Server error' });
  }
});

/* //dev route to delete particular logs
app.post('/dellogs', async (req, res) => {
  try {
    let ans = await Log.deleteMany({ message: "Audit Logs fetched by undefined" })
    return res.status(200)
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});  */

app.get('/birthdays-today', async (req, res) => {
  try {
    const aaa = new Date();
    aaa.setUTCHours(0, 0, 0, 0);
    const specificDate = aaa.toISOString();
    //const specificDate = new Date("2024-03-12T19:00:00.000Z"); //for testing
    
    const aggregationPipeline = [
      {
        $match: {
          Date_of_Birth: specificDate
        }
      }
    ];

    // Aggregate from all three collections
    const results = await Promise.all([
      Admin.aggregate(aggregationPipeline),
      Manager.aggregate(aggregationPipeline),
      Employee.aggregate(aggregationPipeline)
    ]);

    const combinedResults = [].concat(...results);

    res.json(combinedResults);
  } catch (err) {
    console.error('Error fetching birthdays:', err);
    res.status(500).send('Error fetching birthdays');
  }
});

app.post('/gettodo', async (req, res) => {
  console.log("wow")
  try {
      const { email } = req.body;
      const todoList = await Todo.find({ email });
      console.log("here", todoList)
      res.json(todoList);
  } catch (error) {
      console.error('Error fetching to-do list:', error);
      res.status(500).json({ error: 'Server error' });
  }
});

app.post('/addtodo', async (req, res) => {
  try {
      const { email, task} = req.body;
      if(task ==='' || task === null)
      {
        return res.status(201).json();
      }
      const newTodo = new Todo({
          email: email,
          task: task,
      });
      console.log(newTodo)
      await Todo.insertMany(newTodo);
      res.status(201).json(newTodo);
  } catch (error) {
      console.error('Error adding to-do:', error);
      res.status(500).json({ error: 'Server error' });
  }
});
app.delete('/removetodo/:id', async (req, res) => {
  try {
      const { id } = req.params;
      await Todo.findByIdAndDelete(id);
      res.status(204).json();
  } catch (error) {
      console.error('Error removing to-do:', error);
      res.status(500).json({ error: 'Server error' });
  }
});
export default app;