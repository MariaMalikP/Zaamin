import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import Employee from './models/employees.js';
import Admin from './models/admins.js';
import Manager from './models/managers.js';
import Login from './models/userlogin.js';
import bcrypt from 'bcrypt';
import Regulation from './models/regulations.js';
import FinancialInfo from './models/financial_info.js';
import MedicalInfo from './models/medical_info.js';
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

app.post('/viewsearchprofile', async (req, res) => {
  try {
    const { email } = req.body;
    // console.log("ressssssssultssssssss")
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
    res.status(500).json({ error: 'Server error' });
  }
});
app.post('/findrole', async (req, res) => {
  try {
    const { email } = req.body;
    // console.log("ressssssssultssssssss rollig")
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

app.get('/regulations', async (req, res) => {
  try {
    const regulations = await Regulation.find();
    if (!regulations) {
      // Handle the case when regulations is undefined
      console.error('No regulations found');
      res.json('No regulations found');
    }
    // console.log(regulations,"length",regulations.length);
    // return res.json({ message: 'Regulations fetched', reg: regulations });
    res.json({reg:regulations})
  } catch (error) {
    console.error('Error fetching regulations:', error);
    res.json({ message: 'Internal Server Error' });
  }
});
app.post('/regulations', async (req, res) => {
  try
  {
    // console.log("hereee")
    
    const { name, description } = req.body;
      // Create a new regulation
    const newRegulation = new Regulation({
        name: name,
        description: description
    });

      // Save the new regulation to the database
      await newRegulation.save();
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
      name: `Employee ID: ${employee.Employee_ID}`,
      description: `Age: ${employee.Age} years. Violation: Employees must be between 18 and 60 years of age.`
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
      violation_count=violation_count+1
    }

    // MIN WAGE VIOLATION CHECK
    const wage_violations = await FinancialInfo.find({ salary: { $lt: 32000 } ,});

    // Formatting the violations data
    violationsData = violationsData.concat(wage_violations.map(employee => ({
      name: `Employee ID: ${employee.id}`,
      description: `Wage: ${employee.salary}. Violation: Employers must adhere to minimum wage regulations and pay their employees at least 32,000 per month`
    })));
    
    // if wage violation takes place, increase the count.
    if (wage_violations.length>0 )
    {
      violation_count=violation_count+1
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
      violation_count=violation_count+1
    }
    

    // Checking if emergency contacts have been updated on the site
    const medical_contact= await MedicalInfo.find ({ emergencyContact: ""})
    violationsData = violationsData.concat(medical_contact.map(employee => ({
      name: `Employee ID: ${employee.id}`,
      description: "Violation: Employee Emergency contact must be listed on the Employee Medical Page."
    })));

    // if emergency contacts not uploaded, increase the count.
    if (medical_contact.length>0 )
    {
      violation_count=violation_count+1
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

    res.json({violations: violationsData, percentage: percentage});

  } catch (error) {
    console.error('Error fetching violations:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
})

export default app;