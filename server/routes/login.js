const express = require('express');
var app = express();  
const router = express.Router();
const { db, auth } = require("../firebase-admin"); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // Used for decoding the JWT



app.use(express.json());

router.post("/", async (req, res) => {
  const { email, password, userType } = req.body;

  try {
    const snapshot = await db.collection(userType).get();

    let userId = null;
    let userPassword = null;

    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.email === email) {
        userId = doc.id;
        userPassword = data.password;
        userName = data.fullName; 
     
      }
    });
    console.log(userName, userId);

    if (!userId) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, userPassword);
    if (!isPasswordValid) {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    // Generate a custom token for the user
    const customToken = await auth.createCustomToken(userId, { userName, userType, email }); 

    // Decode the custom token to check its structure
    const decodedToken = jwt.decode(customToken);

    // Log the decoded token for debugging purposes
    console.log('Decoded Token:', decodedToken);

    // Check if the token contains the expected data
    if (!decodedToken || !decodedToken.uid || decodedToken.uid !== userId) {
      return res.status(500).json({ success: false, message: "Failed to generate a valid token" });
    }

 

    // Send the token and user data back to the client
    res.json({ success: true, token: customToken, message: "Logged in successfully, cookies set" });
  } catch (error) {
    console.log("Error in login endpoint:", error);
    res.status(500).json({ success: false, message: "An error occurred while logging in. Please try again later." });
  }
});



  module.exports = router;