import express from 'express';
import dotenv from 'dotenv';
import mongoose, { get } from 'mongoose';
import cors from 'cors';
import Employee from './models/employees.js';
import Admin from './models/admins.js';
import Manager from './models/managers.js';
import Login from './models/userlogin.js';
import Encryption from './models/encryption.js';
import bcrypt from 'bcrypt';
import CryptoJS from 'crypto-js';
import crypto from 'crypto';
import multer from 'multer';
import MedicalInfo from './models/medical_info.js'; 
import FinancialInfo from './models/financial_info.js';
import Log from './models/logs.js'
import path from 'path';
import Regulation from './models/regulations.js';
import axios from 'axios'
import otpGenerator from 'otp-generator'
import expressWinston from 'express-winston'
import winston from 'winston'
import winstonMongoDB from 'winston-mongodb';
import Announcement from './models/announcements.js';
import Todo from './models/todo.js'

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
const conn = mongoose.connection;
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
  // console.log("data",data)
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
        // console.log("key",key,"Value",profile[key],"type",typeof (profile[key]));
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
      return null;
    }
    return encryptionData.encryptionMethod;
  } catch (error) {
    console.error("Error while fetching encryption data:", error);
  }
}

app.post('/empsignup',async(req,res)=>
{
  const {firstname,lastname,email,password,confpassword,age,phone,securityQ,address,selectedDate,department,employeeStatus,encryption} = req.body;
  const emailExists= await Login.findOne({email:email}) 

  //check for valid password entry to ensure a strong password
  if(password.length<8 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) 
  { 
      res.json("pass problem")
  }

  //check to make sure confirm password and password are the same
  else if (password!==confpassword)
  {
    logger.warn(`Sign up attempt with incorrect password for account ${email}`)
    res.json("password mismatch")
  }

  else if (emailExists)
  {
    logger.warn(`Sign up attempt for existing account ${email}`)
    res.json("email exists")
  }

  //ensuring if encryption mehtod has been selected
  else if(encryption==="default" || encryption.length===0)
  {
    console.log(encryption)
    res.json("choose encryption")
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
    const encryptionData =
    {
      id: finalId,
      encryptionMethod: encryption,
    }
    

    try
    {
      //inserting the data recieved in the login table, as well as the user table, according to the role of the user.
      await Encryption.insertMany(encryptionData)

      
      const encryptionMethod = await getEncryptionMethodById(finalId);
      console.log("encryptionMethod retrieved from table", encryptionMethod);
      await Login.insertMany(data)
      console.log("Table Made");

      const medicalData=
      {
      id: finalId,
      email: email,
      bloodType: encryptProfile("Not Specefied",encryptionMethod),
      allergies: encryptProfile("Not Specefied",encryptionMethod),
      medicalHistory: "Not Specefied",
      emergencyContact: encryptProfile("1122",encryptionMethod),
      leaveRequest: encryptProfile("No Leave Requested",encryptionMethod),
      currentLeaveStatus: encryptProfile("Undefined",encryptionMethod),
      }
      await MedicalInfo.insertMany(medicalData)
      console.log("Medical data inserted:", medicalData);
      const financialData = {
        id: finalId,
        email: email,
        salary: 0,
        bonuses: 0,
        commissions: 0,
        benefits: "",
        expenses: 0,
        bankInformation: {bankName: "", ibanNum: ""},//if problem check this
      };
      
      // await FinancialInfo.insertMany(financialData);
      // console.log("Financial data inserted:", financialData);
      
      //pass id to function encryptionMethod to get encryption method
      if(employeeStatus==="employee")
      {
        const empData = {
          First_Name: firstname,
          Last_Name: lastname,
          Email: email,
          Age: age,
          Phone_Number: encryptProfile(phone,encryptionMethod),
          Address: encryptProfile(address,encryptionMethod),
          Employee_ID: finalId,
          Department: encryptProfile(department,encryptionMethod),
          Profile_Image: "default.png", // Assuming you want to encrypt this value as well
          Date_of_Birth: selectedDate, // Assuming selectedDate is a string
        };
        await Employee.insertMany(empData)
        await FinancialInfo.insertMany(financialData);
        console.log("Financial data inserted:", financialData);
  
      }
      else if (employeeStatus==="admin")
      {
        const empData=
        {
            First_Name: firstname,
            Last_Name: lastname,
            Email: email,
            Age: age,
            Phone_Number: encryptProfile(phone,encryptionMethod),
            Address: encryptProfile(address,encryptionMethod),
            Admin_ID: finalId,
            Department: encryptProfile(department,encryptionMethod),
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
            Phone_Number: encryptProfile(phone,encryptionMethod),
            Address: encryptProfile(address,encryptionMethod),
            Manager_ID: finalId,
            Department: encryptProfile(department,encryptionMethod),
            Profile_Image: "default.png",
            Date_of_Birth: selectedDate,
            
        }
        await Manager.insertMany(empData)
        await FinancialInfo.insertMany(financialData);
        console.log("Financial data inserted:", financialData);

      }
      res.json("yay")
    }
    catch(e)
    {
      console.log("smth happened",e)
      res.json("ohooo")
    }
    }
});

app.post('/sendemail', async(req,res) => {
  const { email, password, confpassword } = req.body;
  const emailExists= await Login.findOne({email:email}) 
  if (emailExists)
  {
    logger.warn(`Sign up attempt for existing account ${email}`)
    return res.json("email exists")
  }
  else if(password.length<8 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) 
  { 
      return res.json("pass problem")
  }
  else if (password!==confpassword)
  {
    logger.warn(`Sign up attempt with incorrect password for account ${email}`)
    return res.json("password mismatch")
  }
  async function sendEmail(props) {
    var data = {
      service_id: 'service_vz1qsgw',
      template_id: 'template_1jmnnzn',
      user_id: 'kY-x6uhNcEt4VJyde',
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
  // const {email} = req.body
  console.log(otp, email)
  sendEmail({otp: otp, email: email})
});

app.post('/sendotp', async(req,res) => {
  console.log("pls");
  async function sendEmail(props) {
    var data = {
      service_id: 'service_vz1qsgw',
      template_id: 'template_1jmnnzn',
      user_id: 'kY-x6uhNcEt4VJyde',
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
  const { email } = req.body;
  const otp = otpGenerator.generate(4, { digits: true, upperCase: false, specialChars: false });
  console.log(otp, email)
  sendEmail({otp: otp, email: email})
})

// app.post('/login', async (req, res) => {
//   try {
//     console.log("bhere")
//     const { email, password } = req.body;
//     console.log('Email:', email);

//     // Find user by email
//     const user = await Login.findOne({ email });

//     if (!user) {
//       // If user not found, respond with 401 Unauthorized
//       return res.json({ status: 'failed'});
//     }

//     // Compare passwords using bcrypt
//     console.log('Password', password);
//     const passwordMatch = await bcrypt.compare(password, user.hashedPassword);

//     if (passwordMatch) {
//       // Passwords match, determine user role
//       let role = '';
//       if (user.id.startsWith('ADM')) {
//         role = 'admin';
//       } else if (user.id.startsWith('MNR')) {
//         role = 'manager';
//       } else if (user.id.startsWith('EMP')) {
//         role = 'employee';
//       }
//       console.log('Login successful');
//       return res.json({ status: 'success', userrole: role });
//     } else {
//       // Passwords don't match, respond with 401 Unauthorized
//       console.log('Login failed');
//       return res.json({ status: 'failed' });
//     }
//   } catch (error) {
//     console.error('Error during login:', error);
//     return res.status(500).json({ error: 'Server error' });
//   }
// });
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
      logger.info(`Successful Login by ${email}`);
      return res.json({ status: 'success', userrole: role, hashcheck: user.hashedPassword});
    } else {
      // Passwords don't match, respond with 401 Unauthorized
      console.log('Login failed');
      logger.warn('Failed login attempt (password mismatch) by ' + email);
      return res.json({ status: 'failed' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    logger.warn('Error during login: ' + error);
    return res.status(500).json({ error: 'Server error' });
  }
});


app.post('/edit_profile', async (req, res) => {
  console.log("in edit profile");
  try {
    console.log("here we do");
    const { email, role, editedProfile } = req.body;
    logger.warn(`Edit Profile attempt by ${email}`)
    console.log("edit:",editedProfile);
    //call encrypt on each field in editted profile
    /////CHECK whats wrong with date of birth
    const fieldsToExcludeFromEncryption = ['First_Name', 'Last_Name', 'Email', 'Employee_ID', 'Admin_ID', 'Manager_ID', 'Date_of_Birth','Age','Profile_Image'];
    const encryptedProfile = {};
    const getId= await Login.findOne({email:email});
    console.log("id",getId.id);
    const encryptionMethod = await getEncryptionMethodById(getId.id);
    Object.keys(editedProfile).forEach(key => {
      if (!fieldsToExcludeFromEncryption.includes(key)) {
        encryptedProfile[key] = encryptProfile(editedProfile[key],encryptionMethod);
      } else {
        encryptedProfile[key] = editedProfile[key]; // Keep the field as it is
      }
    });
    console.log("Encrpted edit",encryptedProfile);
    let profile;
    if(role === 'admin') {
      profile = await Admin.updateOne({ Email: email }, {$set: encryptedProfile });
    } else if(role === 'employee') {
      profile = await Employee.updateOne({ Email: email }, {$set: encryptedProfile });
    } else if(role === 'manager') {
      profile = await Manager.updateOne({ Email: email }, {$set: encryptedProfile });
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
        //CHECK THIS CANT MATCH DEPT CAUSE DEPT IS ENCRYPTED?????
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

    // Concatenate all matching profiles
    const allProfiles = adminProfiles.concat(employeeProfiles, managerProfiles);
    console.log("allProf");
    console.log(allProfiles);
    logger.info(`Search for ${searchTerm}`)
    return res.json({ profiles: allProfiles });
  } catch (error) {
    console.error('Error searching profiles:', error);
    logger.error(`Server Error`)
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/viewprofile', async (req, res) => {
  try {
    const { email, role } = req.body;
    console.log(role);
    let profile;

    if (role === 'admin') {
      profile = await Admin.findOne({ Email: email });
    } else if (role === 'employee') {
      console.log(email);
      profile = await Employee.findOne({ Email: email });
      console.log(profile);
    } else if (role === 'manager') {
      profile = await Manager.findOne({ Email: email });
    } else {
      // Handle other roles if necessary
    }

    if (!profile) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    const getId= await Login.findOne({email:email});
    const encryptionMethod = await getEncryptionMethodById(getId.id);
    // console.log("encryption method in view profile %s for email: %s", encryptionMethod, email);
    

    const decryptedProfile = decryptProfile(profile, encryptionMethod);
    return res.json({ status: "profile exists", profile_deets: decryptedProfile });

  } catch (error) {
    console.error(error);
    logger.error(`Server Error`)
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/viewsearchprofile', async (req, res) => {
  try {
    const { email } = req.body;
    console.log("result search");
    const getId= await Login.findOne({email:email});
    console.log("id",getId.id);
    const encryptionMethod = await getEncryptionMethodById(getId.id);
    console.log("encryption method",encryptionMethod);

    // Search in Admin table
    let profile = await Admin.findOne({ Email: email });
    if (profile) {
      const decryptedProfile = decryptProfile(profile,encryptionMethod);
      return res.json({ status: "profile exists", profile_deets: decryptedProfile });
    }

    // If not found in Admin, search in Employee table
    profile = await Employee.findOne({ Email: email });
    if (profile) {
      const decryptedProfile = decryptProfile(profile,encryptionMethod);
      return res.json({ status: "profile exists", profile_deets: decryptedProfile });
    }

    // If not found in Employee, search in Manager table
    profile = await Manager.findOne({ Email: email });
    if (profile) {
      const decryptedProfile = decryptProfile(profile,encryptionMethod);
      return res.json({ status: "profile exists", profile_deets: decryptedProfile });
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

app.post('/update-medical-info', async (req, res) => {
  try {
    console.log("request body",req.body)
    const { email, role, editedProfile } = req.body;
    logger.info(`Updated medical info for ${email}`)
    console.log("in update medical info",editedProfile)
    const getId= await Login.findOne({email:email});
    console.log("id",getId.id);
    const encryptionMethod = await getEncryptionMethodById(getId.id);
    const encryptedProfile = {};
    const fieldsToExcludeFromEncryption = ['First_Name', 'Last_Name', 'Email', 'Employee_ID', 'Admin_ID', 'Manager_ID', 'Date_of_Birth','Age','Profile_Image','id','medicalHistory'];
    Object.keys(editedProfile).forEach(key => {
      if (!fieldsToExcludeFromEncryption.includes(key)) {
        encryptedProfile[key] = encryptProfile(editedProfile[key],encryptionMethod);
      } else {
        encryptedProfile[key] = editedProfile[key]; // Keep the field as it is
      }
    });
    console.log("in update medical info encrypted",encryptProfile)
    await MedicalInfo.updateOne({ email: email }, {$set: encryptedProfile});;
    //save file against medical history???
    return res.status(200).json({ message: 'Medical information updated successfully' });
  } catch (error) {
    console.error('Error updating medical information:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/get-medical-info', async (req, res) => {
  console.log("here");
  try {
    const { email, role } = req.body;
    console.log("med info",email);
    logger.info(`View medical info by ${email}`)
    const medProfile = await MedicalInfo.findOne({ email: email });
    console.log("med profile before decryption:", medProfile);
    const getId= await Login.findOne({email:email});
    console.log("id",getId.id);
    const encryptionMethod = await getEncryptionMethodById(getId.id);
    console.log("encryption method in view profile %s for email: %s", encryptionMethod, email);
    const decryptedProfile = decryptProfile(medProfile, encryptionMethod);
    console.log("med profile after decryption:", decryptedProfile);
   
    console.log("med profile",decryptedProfile)
    if (!medProfile) {
      console.log('Medical profile not found');
      return res.status(404).json({ error: 'Medical profile not found' });

    }
    res.json({ status: "profile exists", profile_deets: decryptedProfile });
  } catch (error) {
    console.error('Error fetching medical profile:', error);
    res.status(500).json({ error: 'Internal server error' });

  }
});


app.post('/update-financial-info', async (req, res) => {
  try {
    const { email, editedProfile } = req.body;
    logger.info(`Updated financial info for ${email}`)    
    // Check if Financial profile already exists for the given email
    await FinancialInfo.updateOne({ email: email }, { $set: editedProfile });

    return res.status(200).json({ message: 'Financial information updated successfully' });
  } catch (error) {
    console.error('Error updating Financial information:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/get-financial-info', async (req, res) => {
  try {
    console.log("in get financial info",req.body);
    const { email } = req.body;
    logger.info(`View financial info for ${email}`)
    const financeProfile = await FinancialInfo.findOne({ email: email });
    if (!financeProfile) {
      console.log('Financial profile not found');
      return res.status(404).json({ error: 'Financial profile not found' });
    }
    res.json({ status: "profile exists", profile_deets: financeProfile });
  } catch (error) {
    console.error('Error fetching financial profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.post('/financialprofiles', async (req, res) => {
  try {
    const allProfiles = await FinancialInfo.find({});
    return res.json({ profiles: allProfiles });
  } catch (error) {
    console.error('Error fetching financial profiles:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

let path_of_file = ""; // Initialize path_of_file variable
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "../frontend/public/med_files"); // Set destination folder for uploaded files
  },
  filename: function (req, file, cb) {
    const randomNumber = Math.floor(Math.random() * 10000); // Generate a random number between 0 and 999
    // Construct the file path and set it to path_of_file variable
    path_of_file = path.join("../frontend/public/med_files", `${randomNumber}_${file.originalname}`);
    console.log("path_of_file in filename",path_of_file);
    cb(null, `${randomNumber}_${file.originalname}`); // Set filename for the uploaded file
  }
})
const upload = multer({ storage });

app.post('/update-medical-history', upload.any('medicalHistory'), (req, res) => {
  console.log("file uploaded", path_of_file); // Make sure path_of_file is properly scoped
  console.log("body", req.body);
  logger.info(`Updated medical history`)
  return res.status(200).json({ message: 'Path Set', filePath: path_of_file });
});

//Hajrs
app.get('/logs', async (req, res) => {
  const email = req.query.email || null;
  try {
    let logs = await Log.find({});
    logger.warn('Audit Logs fetched by ' + email);
    return res.json(logs);
  } catch {
    logger.error('Server Error');
    res.status(500).json({ error: 'Server error' });
  }
});

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

app.post('/changepassword', async (req, res) => {
  try {
      const { email, newPassword } = req.body;
      // Hash the new password
      console.log("email:", email);
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      // Check if the provided password is the same as the current password
      const user = await Login.findOne({ email });
      if (!user) {
        console.log("not found");
        return res.status(404).json({ message: 'User not found' });
      }
      // Update the user's password in the database
      const result = await Login.updateOne({ email }, { $set: { hashedPassword: hashedNewPassword } });
      // Check if the update was successful
      // if (result.nModified > 0) {
      logger.warn(`Change password by ${email}`);
      console.log("Password changed successfully");
          return res.json({ message: 'success' });
      // } else {
          // console.log("Password not changed");
          // return res.json({ message: 'failure' }); // Or handle the failure as needed
      // }
  } catch (error) {
      console.error('Error changing password:', error);
      return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/checkingemail', async (req, res) => {
  try {
    console.log("bhere")
    const { email } = req.body; // Removed password from destructuring
    console.log('Email:', email);

    // Find user by email
    const user = await Login.findOne({ email });

    if (!user) {
      // If user not found, respond with 404 Not Found
      return res.json({ status: 'failed'});
    } else 
    {
      console.log("MILL GAYA EMAIL")
      // If user found, respond with 200 OK
      return res.json({ status: 'success'});
    }
  } catch (error) {
    console.error('Error during checking:', error);
    logger.warn(`Error during checking: ${error}`);
    return res.json("error");
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


/////End of Hajra's code

//Maria Code Starting
// Function to retrieve regualtions from the DB
app.get('/regulations', async (req, res) => {
  try {
    logger.info("Regulations viewed")
    const regulations = await Regulation.find();
    if (!regulations) {
      // Handle the case when regulations is undefined
      console.error('No regulations found');
      res.json('No regulations found');
    }
    res.json({reg:regulations})
  } catch (error) {
    console.error('Error fetching regulations:', error);
    res.json({ message: 'Internal Server Error' });
  }
});

// Fucntion to add a regualtion to the DB
app.post('/regulations', async (req, res) => {
  try
  {
    
    const { name, description } = req.body;
      // Create a new regulation
    const newRegulation = new Regulation({
        name: name,
        description: description
    });

      // Save the new regulation to the database
      await newRegulation.save();
      logger.info(`Regulation ${name} added successfully`)
      return res.status(201).json({ message: 'Regulation added successfully' });
  }
  catch(error)
  {
    console.error('Error fetching regulations:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }

})
app.delete('/regulations', async (req, res) => {
  try
  {
    console.log("in delete", req.query.id)
    const id = req.query.id;
    const deletedreg = await Regulation.findByIdAndDelete(id)
    if(!deletedreg)
    {
      res.json({message:"no regualtion found"})
    }
    else
    {
      res.json({message:"delete successful"})
    }

  }
  catch(error)
  {
    console.error('Error deleting regulation:', error);
    res.status(500).json({ message: 'Error Deleting' });
  }
})

app.get('/violations', async (req, res)=> {
  try {
    // count to keep track of the number of violations taking place 

    let violation_count=0;
    // AGE VIOLATION CHECK
    // Finding employees who are either younger than 18 or older than 60
    console.log("in violations")
    const age_violations = await Employee.find({
      $or: [
        { Age: { $lt: 18 } }, // Employees younger than 18
        { Age: { $gt: 60 } }  // Employees older than 60
      ]
    });
    // Formatting the violations data
    let violationsData = age_violations.map(employee => ({
      name: 'Employee ID: ' + employee.Employee_ID,
      description: 'Age: ' + employee.Age + ' years. Violation: Employees must be between 18 and 60 years of age.'
    }));

    //getting admin age violations
    const adminAgeViolations = await Admin.find({
      $or: [
        { Age: { $lt: 18 } }, // Admins younger than 18
        { Age: { $gt: 60 } }  // Admins older than 60
      ]
    });
    
    // Formatting the violations data for admins
    violationsData = violationsData.concat(adminAgeViolations.map(admin => ({
      name: `Admin ID: ${admin.Admin_ID}`,
      description: `Age: ${admin.Age} years. Violation: Admins must be between 18 and 60 years of age.`
    })));
    
    // Find age violations for managers
    const managerAgeViolations = await Manager.find({
      $or: [
        { Age: { $lt: 18 } }, // Managers younger than 18
        { Age: { $gt: 60 } }  // Managers older than 60
      ]
    });
    
    // Formatting the violations data for managers and concatenating with the rest
    violationsData = violationsData.concat(managerAgeViolations.map(manager => ({
      name: `Manager ID: ${manager.Manager_ID}`,
      description: `Age: ${manager.Age} years. Violation: Managers must be between 18 and 60 years of age.`
    })));

    // if age violation takes place, increase the count.
    if (age_violations.length>0 || adminAgeViolations.length>0 || managerAgeViolations.length>0)
    {
      violation_count=violation_count+1;
    }

    // MIN WAGE VIOLATION CHECK
    const wage_violations = await FinancialInfo.find({ salary: { $lt: 32000 } ,});

    // Formatting the violations data
    violationsData = violationsData.concat(wage_violations.map(employee => ({
      name: `Employee ID: ${employee.id}`,
      description: `Wage: ${employee.salary}. Violation: Employers must adhere to minimum wage regulations and pay their employees at least 32,000 per month`
    })));
    
    // if wage violation takes place, increase the count.
    if (wage_violations.length > 0) {
      violation_count = violation_count + 1;
    }
    

    // Checking if medical certificates are uploaded on the site. 
    const medical_cert= await MedicalInfo.find ({ medicalHistory: ""})
    violationsData = violationsData.concat(medical_cert.map(employee => ({
      name: `Employee ID: ${employee.id}`,
      description: "Violation: Employee medical certificates must be uploaded."
    })));

    // if medical certificates not uploaded, increase the count.
    if (medical_cert.length>0 )
    {
      violation_count=violation_count+1;
    }
    

    // Checking if emergency contacts have been updated on the site
    const medical_contact= await MedicalInfo.find ({ emergencyContact: ""})
    violationsData = violationsData.concat(medical_contact.map(employee => ({
      name: `Employee ID: ${employee.id}`,
      description: "Violation: Employee Emergency contact must be listed on the Employee Medical Page."
    })));

    // if emergency contacts not uploaded, increase the count.
    if (medical_contact.length > 0) {
      violation_count = violation_count + 1;
    }

    // Checking if emloyees have access to medical leave requests
    const NoLeaveRequest = await MedicalInfo.find({ leaveRequest: { $exists: false } });
    violationsData = violationsData.concat(NoLeaveRequest.map(employee => ({
      name: `Employee ID: ${employee.id}`,
      description: "Violation: All employees need to have access to medical leave requests"
    })));

    // if no leave request given to an employee, increase the count
    if (NoLeaveRequest.length>0 )
    {
      violation_count=violation_count+1
    }

    console.log("count", violation_count)
    let percentage = ((7-violation_count)/ 7)*100
    percentage = Math.round(percentage);
    console.log("percentage", percentage)
    logger.info(`Violations fetched`)
    res.json({violations: violationsData, percentage: percentage});

  } catch (error) {
    console.error('Error fetching violations:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
})

//End of Maria's code

app.post('/addannouncement', async (req, res) => {
  try {
      const { eventTitle, eventDescription, eventDate, eventTime } = req.body;
      const newAnnouncement = new Announcement({
          title: eventTitle,
          description: eventDescription,
          date: eventDate,
          time: eventTime,
      });
      await Announcement.insertMany(newAnnouncement);
      res.status(201).json(newAnnouncement);
  } catch (error) {
      console.error('Error adding announcement:', error);
      res.status(500).json({ error: 'Server error' });
  }
});

app.get('/getannouncements', async (req, res) => {
  console.log("there")
  try {
      const announcements = await Announcement.find({});
      res.json(announcements);
  } catch (error) {
      console.error('Error fetching announcements:', error);
      res.status(500).json({ error: 'Server error' });
  }
});

app.post('/validcheck', async (req, res) => {
  const { email, hashp, role, requiredRole } = req.body;

  try {
      // Find the user in the database based on the email
      const user = await Login.findOne({ email });
      console.log("user,",user)

      if (user==null) {
          console.log("1")
          return res.json({ message: 'User not found' });
      }
      
      // Compare the provided hashp with the stored hashed password
      if (user.hashedPassword.replace(/\//g, '') !== hashp) {
        console.log("2")
        return res.json({ message: 'Invalid password' });
    }

      // Check if the user's role matches the provided role (admin)
      console.log(user.id.substring(0, 3),requiredRole)
      if(requiredRole!=role )
      {
        console.log("3")
        return res.json({ message: 'User is not the right role' });
      }
      // If email, hashp, and role are associated with the same entry, send success
      return res.json({ message: 'success' });
  } catch (error) {
      console.error('Error:', error.message);
      return res.json({ message: 'Internal server error' });
  }
});

export default app;
