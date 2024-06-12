const express = require('express');
const router = express.Router();
const { db } = require("../firebase-admin");
const jwt = require('jsonwebtoken');

router.put('/', async (req, res) => {
  // Extract the token from the request headers
  const token = req.headers.authorization.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Decode the token to extract the UID
  const decodedToken = jwt.decode(token);
  if (!decodedToken || !decodedToken.uid) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const uid = decodedToken.uid;
  const userType = 'mentees';
  const { fullName, email, phone, language, school, specialty, bio, location, department, skills} = req.body;

  console.log('Received user data:', req.body);

  const userData = {};
  if (fullName) userData.fullName = fullName;
  if (email) userData.email = email;
  if (phone) userData.phone = phone;
  if (language) userData.language = language;
  if (school) userData.school = school;
  if (location) userData.location = location;
  if (specialty) userData.specialty = specialty;
  if (skills) userData.skills = skills;
  if (department) userData.department = department;
  if (bio) userData.bio = bio;

  // Add a timestamp if any field is updated
  if (Object.keys(userData).length > 0) {
    userData.timestamp = new Date();
  }

  try {
    await db.collection(userType).doc(uid).update(userData);
    console.log(`User document with ID: ${uid} updated in ${userType} collection`);
    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

    module.exports = router;
