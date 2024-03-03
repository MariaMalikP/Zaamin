import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import Employee from './models/employees.js';
import Admin from './models/admins.js';
import Manager from './models/managers.js';
import bcrypt from 'bcryptjs';
import Login from './models/logins.js';
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
      finalId=`EMP${newId}`
    }
    else if (employeeStatus==="admin")
    {
      finalId=`ADM${newId}`
    }
    else if(employeeStatus==="manager")
    {
      finalId=`MNR${newId}`
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
export default app;