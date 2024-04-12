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
import path from 'path';

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
  const {firstname,lastname,email,password,confpassword,age,phone,securityQ,address,selectedDate,department,employeeStatus,encryption} = req.body;
  // console.log("here", req.body)
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
    res.json("email exists")
  }

  //ensuring if encryption mehtod has been selected
  else if(encryption==="default" || encryption.length===0)
  {
    // console.log("encryptnf")
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
      // console.log("Encryption data inserted:", encryptionData);

      
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
      
      await FinancialInfo.insertMany(financialData);
      console.log("Financial data inserted:", financialData);
      


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
    console.log('Password', password);
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
      return res.json({ status: 'success', userrole: role });
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

app.post('/edit_profile', async (req, res) => {
  console.log("in edit profile");
  try {
    console.log("here we do");
    const { email, role, editedProfile } = req.body;
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
    return res.json({ profiles: allProfiles });
  } catch (error) {
    console.error('Error searching profiles:', error);
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

    console.log("profile before decryption:", profile);
    const getId= await Login.findOne({email:email});
    console.log("id",getId.id);
    const encryptionMethod = await getEncryptionMethodById(getId.id);
    console.log("encryption method in view profile %s for email: %s", encryptionMethod, email);
    

    const decryptedProfile = decryptProfile(profile, encryptionMethod);
    console.log("profile after decryption:", decryptedProfile);

    return res.json({ status: "profile exists", profile_deets: decryptedProfile });

  } catch (error) {
    console.error(error);
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
    res.status(500).json({ error: 'Server error' });
  }
});
app.post('/update-medical-info', async (req, res) => {
  try {
    console.log("request body",req.body)
    const { email, role, editedProfile } = req.body;
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
  try {
    const { email, role } = req.body;
    console.log("med info",email);
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
    const { email, role, editedProfile } = req.body;

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
    const { email, role } = req.body;
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
  return res.status(200).json({ message: 'Path Set', filePath: path_of_file });
});


export default app;