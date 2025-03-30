// app/routes/AuthRoutes.js
const express = require("express");
const router = express.Router();
const verifyLogin= require('../utils/verifyLogin')
const {
    registration,
    login,
    home,
    makeAttendanceSystem,
   

} = require('../controller/AuthController'); // Ensure the correct function name
router.post("/register", registration); // Correct route
router.post("/login", login); // Correct route
router.get("/home", home); // Correct route
router.post("/mark-attendance",verifyLogin, makeAttendanceSystem);
module.exports = router;
