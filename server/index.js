const { db, auth } = require("./firebase-admin");
const express = require('express');
const cors = require('cors');
const app = express();
const port = 3001;



app.use(cors({origin:'http://localhost:3000'}));
// Middleware to parse JSON bodies
app.use(express.json());

// For Signup

const signup = require('./routes/signup');
app.use('/api/signup', signup);


// For Login
const login = require('./routes/login');
app.use('/api/login', login);

//For Mentors

const mentors = require('./routes/mentors');
app.use('/api/mentors', mentors);

// For MentorEditProfile
const editMProfile = require('./routes/editMProfile');
app.use('/api/editMProfile', editMProfile);

const editMenteeProfile = require('./routes/editMenteeProfile');
app.use('/api/editMenteeProfile', editMenteeProfile);

//For Mentee
const mentees = require('./routes/mentees');
app.use('/api/mentees', mentees);



// profile
const mentorProfile = require('./routes/mentorProfile');
app.use('/api/mentor-profile', mentorProfile);

const menteeProfile = require('./routes/menteeProfile');
app.use('/api/mentee-profile', menteeProfile);

//  View profile
const mentorProfileView = require('./routes/mentorProfileView');
app.use('/api/mentor-profile-view', mentorProfileView);

const menteeProfileView = require('./routes/menteeProfileView');
app.use('/api/mentee-profile-view', menteeProfileView);

// For logout
const logout = require('./routes/logout');
app.use('/api/logout', logout);


// Get user's sent messages
app.get('/api/messages/sent/:userId', (req, res) => {
  const userId = req.params.userId;
  db.collection('messages')
   .where('senderId', '==', userId)
   .get()
   .then((querySnapshot) => {
      const sentMessages = querySnapshot.docs.map((doc) => doc.data());
      res.send(sentMessages);
    });
});

// Get user's received messages
const receiveMessage = require('./routes/messaging/receiveMessage');
app.use('/api/messages/received', receiveMessage);

// Create a new message
const sendMessage = require('./routes/messaging/sendMessage');
app.use('/api/messages', sendMessage);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

module.exports = app;