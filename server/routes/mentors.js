const express = require('express');
const router = express.Router();
const { db } = require("../firebase-admin");
router.get('/', async (req, res) => {
    try {
      const snapshot = await db.collection('mentors').get();
      const mentorData = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        
        mentorData.push({
          id: doc.id,
          fullName: data.fullName,
          bio: data.bio,
          specialty: data.specialty,
        });
      });
  
      res.json(mentorData);
    } catch (error) {
      console.error('Error fetching mentors:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  module.exports = router;