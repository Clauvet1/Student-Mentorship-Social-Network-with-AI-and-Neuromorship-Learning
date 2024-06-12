const express = require('express');
const router = express.Router();
const { db } = require("../../firebase-admin");
const jwt = require('jsonwebtoken');
const pusher = require('../../push');

router.post('/:id', (req, res) => {
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

  const senderId = decodedToken.uid;
  const recipientId = req.params.id;
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message text is required' });
  }

  const messageData = {
    message,
    senderId,
    recipientId,
    timestamp: new Date().toISOString(),
  };

  db.collection('messages').add(messageData)
    .then(() => {
      pusher.trigger(`messages-${recipientId}`, 'new-message', messageData);
      res.status(200).json(messageData);
    })
    .catch((error) => {
      console.error('Error sending message:', error);
      res.status(500).json({ error: 'An error occurred while sending the message.' });
    });
});

module.exports = router;
