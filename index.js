
const express = require("express");
const cors = require("cors");
const app = express();
const port = 3000;

app.use(express.json());

// Enable CORS
app.use(
  cors({
    origin: "https://landmarkrealty-attendance-system.netlify.app/", // Allow requests from frontend
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization",
  })
);

const authRoute = require("./app/routes/AuthRoutes.js"); // Correctly required route
const DBConn = require("./app/utils/DBConnection.js");

app.use("/api/v1/auth", authRoute);

// Ensure the DB connection is established before starting the server
DBConn()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("Error connecting to the database:", err);
  });
