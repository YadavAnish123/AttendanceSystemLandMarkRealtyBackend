const express = require('express');
const app = express();
const port = 3000;
app.use(express.json());

const authRoute = require("./app/routes/AuthRoutes.js"); // Correctly required route
const DBConn = require('./app/utils/DBConnection.js');
app.use('/api/v1/auth', authRoute);

// Ensure the DB connection is established before starting the server
DBConn().then(() => {
    app.listen(port, () => {
        console.log(`Example app listening on port ${port}`);
    });
}).catch((err) => {
    console.error('Error connecting to the database:', err);
});
