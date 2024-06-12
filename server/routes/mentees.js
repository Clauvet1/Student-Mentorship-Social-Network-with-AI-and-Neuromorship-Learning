const express = require('express');
const router = express.Router();
const { db } = require("../firebase-admin");
router.get('/', async (req, res) => {
    try{
      const snapshot = await db.collection('mentees').get();
      const menteeData = [];
  
      snapshot.forEach(doc => {
        const data = doc.data();
  
        menteeData.push({
          id: doc.id,
          fullName: data.fullName,
          bio: data.bio,
          speciality: data.specialty
        });
      });
  
      res.json(menteeData);
    } catch(error){
      console.error('Error fetching mentors:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  module.exports = router;