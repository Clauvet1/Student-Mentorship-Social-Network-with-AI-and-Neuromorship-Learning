const express = require('express');
const router = express.Router();
const { db } = require("../firebase-admin");
const jwt = require('jsonwebtoken');

router.get('/', async (req, res) => {
  try {
    // Extract the token from the request headers
    const token = req.headers.authorization.split(' ')[1]; // Assuming the token is sent in the "Authorization" header

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Decode the token to extract the UID
    const decodedToken = jwt.decode(token);
    if (!decodedToken || !decodedToken.uid) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Use the UID to query the Firestore database
    const userType = 'mentors'; 
    const uid = decodedToken.uid;
    const snapshot = await db.collection(userType).doc(uid).get();

    if (!snapshot.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = {
      id: snapshot.id,
      fullName: snapshot.data().fullName,
      bio: snapshot.data().bio,
      specialty: snapshot.data().specialty,
      school: snapshot.data().school,
      location: snapshot.data().location,
      phone: snapshot.data().phone,
      email: snapshot.data().email,
      department: snapshot.data().department,
      language: snapshot.data().language,
      skills: snapshot.data().skills
    };

    res.json(userData);
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



module.exports = router;