// app/routes/AuthRoutes.js
const express = require("express");
const router = express.Router();
const {
    registration,
    login,
    home

} = require('../controller/AuthController'); // Ensure the correct function name
router.post("/register", registration); // Correct route
router.post("/login", login); // Correct route
router.get("/home", home); // Correct route
module.exports = router;
