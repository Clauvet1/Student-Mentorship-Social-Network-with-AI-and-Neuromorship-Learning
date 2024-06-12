const express = require('express');
const router = express.Router();
const { db } = require("../firebase-admin");
const jwt = require('jsonwebtoken');

router.get('/:id', async (req, res) => {
  try {
    
    const id = req.params.id
    // Use the id to query the Firestore database
    const userType = 'mentees'; 
    const snapshot = await db.collection(userType).doc(id).get();

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