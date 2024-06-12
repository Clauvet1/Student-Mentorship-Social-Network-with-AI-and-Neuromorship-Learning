const express = require('express');
const router = express.Router();
const { db, auth } = require("../firebase-admin");
const bcrypt = require('bcryptjs');

// Function to hash a password
const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(10); // Generate salt with 10 rounds
    const hashedPassword = await bcrypt.hash(password, salt); // Hash password with generated salt
    return hashedPassword;
  } catch (error) {
    console.error('Error hashing password:', error);
    throw error; // Throw error for handling further up the call stack
  }
};

router.post('/', async (req, res) => {
  const { userType, fullName, email, password, specialty } = req.body;
  console.log('Received user data:', req.body);
  const hashedPassword = await hashPassword(password);

  const userData = {
    fullName,
    email,
    password: hashedPassword,
    timestamp: new Date(),
  };

  if (userType === 'mentor') {
    userData.specialty = specialty;
    try {
      const mentorRef = await db.collection('mentors').add(userData);
      console.log(`Mentor document created with ID: ${mentorRef.id} in mentors collection`);
      res.send(`Mentor data received successfully in mentors collection`);
    } catch (error) {
      console.error(`Error adding mentor data to mentors collection:`, error);
      res.status(500).send(`Error adding mentor data to mentors collection: ${error}`);
    }
  } else if (userType === 'mentee') {
    try {
      const menteeRef = await db.collection('mentees').add(userData);
      console.log(`Mentee document created with ID: ${menteeRef.id} in mentees collection`);
      res.send(`Mentee data received successfully in mentees collection`);
    } catch (error) {
      console.error(`Error adding mentee data to mentees collection:`, error);
      res.status(500).send(`Error adding mentee data to mentees collection: ${error}`);
    }
  } else {
    res.status(400).send('Invalid userType');
  }
});

module.exports = router;