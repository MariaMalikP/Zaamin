import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import Employee from './models/employees.js';
import Admin from './models/admins.js';
import Manager from './models/managers.js';
import Login from './models/userlogin.js';
import Encryption from './models/encryption.js';
import bcrypt from 'bcrypt';
import CryptoJS from 'crypto-js';

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

const ENCRYPTION_KEY = 'H@pP!Ly5tr0nG&SecuREkEy123!#@%*';

function encrypt(text) {
  return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
}

function decrypt(ciphertext) {
  const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}

function decryptProfile(profile) {
  const fieldsToExcludeFromDecryption = ['First_Name', 'Last_Name', 'Email', 'Employee_ID', 'Admin_ID', 'Manager_ID', 'Date_of_Birth', 'Age'];
  const decryptedProfile = {};
  Object.keys(profile._doc).forEach(key => {
    if (['id', '_v', ...fieldsToExcludeFromDecryption].includes(key)) {
      decryptedProfile[key] = profile[key];
    } else {
      decryptedProfile[key] = decrypt(profile[key]);
    }
  });
  return decryptedProfile;
}
/*
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
      finalId=EMP${newId};
    }
    else if (employeeStatus==="admin")
    {
      finalId=ADM${newId};
    }
    else if(employeeStatus==="manager")
    {
      finalId=MNR${newId};
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
      res.json("yay")
    }
    catch(e)
        {
            console.log("smth happened",e)
            res.json("ohooo")
        }
    }
});*/
app.post('/empsignup',async(req,res)=>
{
  const {firstname,lastname,email,password,confpassword,age,phone,securityQ,address,selectedDate,department,employeeStatus,encryption} = req.body;

  // console.log("here", req.body)
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
    res.json("email exists")
  }

  //ensuring if encryption mehtod has been selected
  else if(encryption==="default" || encryption.length===0)
  {
    console.log("encryptnf")
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
      await Login.insertMany(data)
      await Encryption.insertMany(encryptionData)
      if(employeeStatus==="employee")
      {
        const empData = {
          First_Name: firstname,
          Last_Name: lastname,
          Email: email,
          Age: age,
          Phone_Number: encrypt(phone),
          Address: encrypt(address),
          Employee_ID: finalId,
          Department: encrypt(department),
          Profile_Image: encrypt("default.png"), // Assuming you want to encrypt this value as well
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
            Phone_Number: encrypt(phone),
            Address: encrypt(address),
            Admin_ID: finalId,
            Department: encrypt(department),
            Profile_Image: encrypt("default.png"),
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
            Phone_Number: encrypt(phone),
            Address: encrypt(address),
            Manager_ID: finalId,
            Department: encrypt(department),
            Profile_Image: encrypt("default.png"),
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
    const fieldsToExcludeFromEncryption = ['First_Name', 'Last_Name', 'Email', 'Employee_ID', 'Admin_ID', 'Manager_ID', 'Date_of_Birth','Age','Department'];
    const encryptedProfile = {};
    Object.keys(editedProfile).forEach(key => {
      if (!fieldsToExcludeFromEncryption.includes(key)) {
        encryptedProfile[key] = encrypt(editedProfile[key]);
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
/*
app.post('/viewprofile', async (req, res) => {
  try {
    const { email, role } = req.body;
    console.log(role);
    let profile;
    if(role === 'admin') {
      profile = await Admin.findOne({ Email: email });
    } else if(role === 'employee') {
      console.log(email)
      profile = await Employee.findOne({ Email: email });
      console.log(profile);
    } else if(role === 'manager') {
      profile = await Manager.findOne({ Email: email });
    } else {
    }
    if (!profile) {
      return res.status(404).json({ error: 'User profile not found' });
    }
    console.log("profilebfr",profile)
    const fieldsToExcludeFromDecryption = ['First_Name', 'Last_Name', 'Email', 'Employee_ID', 'Admin_ID', 'Manager_ID', 'Date_of_Birth', 'Age','Department'];
    const decryptedProfile = {};

    Object.keys(profile._doc).forEach(key => {
      if (['id', '_v', ...fieldsToExcludeFromDecryption].includes(key)) {
        decryptedProfile[key] = profile[key];
      } else {
        decryptedProfile[key] = decrypt(profile[key]);
      }
    });
    console.log("profiledecrypt",decryptedProfile)
    return res.json({ status: "profile exists", profile_deets: decryptedProfile });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});*/
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

    const decryptedProfile = decryptProfile(profile);
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

    // Search in Admin table
    let profile = await Admin.findOne({ Email: email });
    if (profile) {
      const decryptedProfile = decryptProfile(profile);
      console.log("profile decrypt search result:", decryptedProfile);
      return res.json({ status: "profile exists", profile_deets: decryptedProfile });
    }

    // If not found in Admin, search in Employee table
    profile = await Employee.findOne({ Email: email });
    if (profile) {
      const decryptedProfile = decryptProfile(profile);
      console.log("profile decrypt search result:", decryptedProfile);
      return res.json({ status: "profile exists", profile_deets: decryptedProfile });
    }

    // If not found in Employee, search in Manager table
    profile = await Manager.findOne({ Email: email });
    if (profile) {
      const decryptedProfile = decryptProfile(profile);
      console.log("profile decrypt search result:", decryptedProfile);
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



export default app;