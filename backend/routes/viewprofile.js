const express = require('express');
const router = express.Router();
const Admin = require('../models/admins.js');
const Employee = require('../models/employees.js');
const Manager = require('../models/managers.js');

router.post('/', async (req, res) => { 
  try {
    console.log(req.body);
    const { email, role } = req.body;
    console.log(role); // 
    if(role === 'admin') {
      const profile = await Admin.findOne({ Email: email });
      return res.json({ status: "profile exists", profile_deets: profile });
    } else if(role === 'employee') {
      const profile = await Employee.findOne({ Email: email });
      if (profile) {
        console.log(profile);
        return res.json({ status: "profile exists", profile_deets: profile });
      } else {
        console.log("Profile not found");
        return res.status(404).json({ error: 'User profile not found' });
      }
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

module.exports = router;
