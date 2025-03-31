const express = require('express');
const bcrypt = require('bcrypt');
const moment = require('moment');
const jwt = require('jsonwebtoken');
JWT_SECRET_KEY = 'anish@123'

const User = require('../model/UserModel'); // Import the Mongoose User model
const Attendance = require('../model/AttendanceSchema'); // Import the Mongoose User model

//require('dotenv').config();
const registration = async (req, res) => {
  let { name, email, password, phone } = req.body;

  if (!name || !email || !password || !phone) {
    return res.status(400).json({
      status: false,
      message: "All fields are required",
      data: []
    });
  }
  try {
    // Check if the user already exists based on email
    const userExists = await User.findOne({ email: email });

    if (userExists) {
      // If user exists, send a message indicating that the email already exists
      return res.status(400).json({
        status: false,
        message: "Email already exists",
        data: []
      });
    }

    // Hash the password before storing
    const hashPassword = await bcrypt.hash(password, 10);

    // Create the new user
    const newUser = new User({
      name,
      email,
      password: hashPassword,
      phone
    });

    // Save the user to the database
    await newUser.save();

    // Generate JWT Token
    const token = jwt.sign(
      { email: newUser.email },  // Use the email as the payload
      JWT_SECRET_KEY,  // Your JWT secret key
      { expiresIn: "1h" }          // Optional: Set expiration time for the token
    );

    res
      .cookie("access_token", token, { httpOnly: true })
      .status(201)
      .json({
        status: true,
        message: "User created successfully",
        data: {
          user: {
            name: newUser.name,
            email: newUser.email,
            phone: newUser.phone
          },

        },
      });
  } catch (e) {
    console.error("Database error:", e.message);  // Log error for debugging

    res.status(500).json({
      status: false,
      message: e.message,
      data: [],
    });
  }
};

const getlastcheckInTimeANDlastcheckOutTime=(data)=>
{
  let lastCheckIn;
  let lastCheckOut;
  data.forEach((row)=>{
  if (!row.entries || row.entries.length === 0) {
    return { lastCheckIn: null, lastCheckOut: null };
  }

  // Find the last check-in (latest startTime)
   lastCheckIn = row.entries.reduce((latest, entry) =>
    entry.startTime > latest.startTime ? entry : latest
  );

  // Find the last check-out (latest endTime)
  lastCheckOut = row.entries.reduce((latest, entry) =>
    entry.endTime > latest.endTime ? entry : latest
  );
})

  return { lastCheckIn: moment(lastCheckIn.startTime).format('YYYY-MM-DD HH:mm:ss'), lastCheckOut: moment(lastCheckOut.endTime).format('YYYY-MM-DD HH:mm:ss') };
}



const login = async (req, res) => {
  let { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      status: false,
      message: "Email and password are required",
      data: [],
    });
  }

  try {
    // Check if the user exists based on email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        status: false,
        message: "Invalid credentials",
        data: [],
      });
    }

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        status: false,
        message: "Invalid credentials",
        data: [],
      });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { email: user.email },  // Use the email as the payload
      JWT_SECRET_KEY,  // Your JWT secret key
      // { expiresIn: "1h" }          // Optional: Set expiration time for the token
    );


    //get lastchekInTime and lastcheckOutTime


    let attendenceData = await Attendance.find({ userDetails: user._id })
    let laststatus=getlastcheckInTimeANDlastcheckOutTime(attendenceData)
    

    

    res
      //.cookie("access_token",token,{httpOnly:true})
      .status(200)
      .json({
        status: true,
        message: "Login successful",
        data: {
          user: {
            name: user.name,
            email: user.email,
            phone: user.phone,
            token: token,
            lastcheckInTime:laststatus.lastCheckIn,
            lastcheckOutTime:laststatus.lastCheckOut

          }
        },
      });
  } catch (e) {
    console.error("Login error:", e.message);

    res.status(500).json({
      status: false,
      message: e.message,
      data: [],
    });
  }
};

// Company Location (Replace with actual coordinates)
//22.517227028497516, 88.29904037773575
const COMPANY_LAT = 22.517227028497516; // Example Latitude
const COMPANY_LON = 88.29904037773575; // Example Longitude

// Haversine formula to calculate distance (in meters)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // Earth's radius in meters
  const toRadians = (degrees) => (degrees * Math.PI) / 180;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
    Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};



// Mark Attendance
const makeAttendanceSystem = async (req, res) => {
  try {
    // Get user email from decoded token (middleware)
    const userEmail = req.user.email;
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        status: false,
        message: "Location (latitude, longitude) is required",
      });
    }

    // Find user in database
    const user = await User.findOne({ email: userEmail });

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    // Calculate distance from company location
    const distance = calculateDistance(COMPANY_LAT, COMPANY_LON, latitude, longitude);

    if (distance > 500) {
      return res.status(403).json({
        status: false,
        message: "You are not within the 50-meter radius of the company",
      });
    }

    // Get today's date
    const today = moment(new Date()).format('YYYY-MM-DD');
    

    // Check if attendance already exists for today
    let attendance = await Attendance.findOne({
      userDetails: user._id,
      date: today,
    });

    if (!attendance) {
      // First check-in for the day
      attendance = new Attendance({
        userDetails: user._id,
        date: today,
        entries: [{ startTime:  moment(new Date()).format('YYYY-MM-DD HH:mm:ss'), location: { latitude, longitude } }],
      });
    } else {
      // Update existing attendance (mark end time if last entry has no endTime)
      const lastEntry = attendance.entries[attendance.entries.length - 1];

      if (!lastEntry.endTime) {
        lastEntry.endTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
      } else {
        attendance.entries.push({ startTime:moment(new Date()).format('YYYY-MM-DD HH:mm:ss'), location: { latitude, longitude } });
      }
    }

    await attendance.save();
    // Fetch the updated attendance with populated user details
    const updatedAttendance = await Attendance.findById(attendance._id).populate(
      "userDetails",
      "name email phone"
    );
  let d=[]
  d.push(updatedAttendance)
  let laststatus= getlastcheckInTimeANDlastcheckOutTime(d)

  

    return res.status(200).json({
      status: true,
      message: "Attendance marked successfully",
      data: {user:{lastcheckInTime:laststatus.lastCheckIn,lastcheckOutTime:laststatus.lastCheckOut}},
    });
  } catch (error) {
    console.error("Attendance error:", error.message);

    return res.status(500).json({
      status: false,
      message: "Server error. Please try again later.",
    });
  }
};




const home = (req, res) => {
  res.status(200).json({
    status: true,
    message: 200,
    data: [],
  })
}



module.exports = { registration, login, home, makeAttendanceSystem };
