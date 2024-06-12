const express = require('express');
const router = express.Router();
const { db } = require("../../firebase-admin");
const jwt = require('jsonwebtoken');
const pusher = require('../../push');

router.get('/:id', (req, res) => {
  const token = req.headers.authorization.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const decodedToken = jwt.decode(token);
  if (!decodedToken || !decodedToken.uid) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const userId = decodedToken.uid;
  const recipientId = req.params.id;
  db.collection('messages')
    .where('recipientId', '==', userId)
    .where('senderId', '==', recipientId )
    .get()
    .then((querySnapshot) => {
      const receivedMessages = querySnapshot.docs.map((doc) => doc.data());
      res.send(receivedMessages);
    })
    .catch((error) => {
      console.error('Error retrieving messages:', error);
      res.status(500).json({ error: 'An error occurred while retrieving messages.' });
    });
});

module.exports = router;
