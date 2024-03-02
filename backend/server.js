import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcryptjs';
// import Employee from './models/employees.js';
import Login from './models/logins.js'
dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });

mongoose.connect(process.env.MONG_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`Listening on port ${process.env.PORT}`);
    console.log("Connected to Database");
});
})
.catch((error) => {
  console.log(error);
});


const emptySchema = new mongoose.Schema({});

const Employee = mongoose.model('Employee', emptySchema, 'Employee');


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


app.post('/empsignup',async(req,res)=>
{
  console.log("hereee")
  const {firstname,lastname,email,password,confpassword,age,phone,securityQ,address,selectedDate} = req.body;
  console.log(req.body)
  // const hashedPassword = await bcrypt.hash(password, 10);
  // console.log("hereee")
  const hashedPassword = bcrypt.hashSync(password, 10);
  // const allids = await Login.find({}, 'id');
  // const ids = allids.map((id) => parseInt(id.substring(3), 10));
  // const maxId = Math.max(...ids);
  
  // console.log(ids)


// console.log(maxNumericValue);
  const data=
  {
      email: email,
      hashedPassword: hashedPassword,
      id:"7ui",
  }
  const empData=
  {
      First_Name: firstname,
      Last_Name: lastname,
      Email: email,
      Age: age,
      Phone_Number: phone,
      Address: address,
      Employee_ID: "emp123",
      Department: "idk",
      Profile_Image: "aaa"
    
  }
  console.log(hashedPassword);
  console.log(email);
try
{
  await Login.insertMany(data)
  // await Employee.insertMany(empData)
  console.log("data", data);
  res.json("yay")
}
catch(e)
    {
        console.log("smth happened")
        res.json("ohooo")
    }
});

export default app;
