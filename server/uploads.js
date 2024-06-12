const multer = require('multer');
const { storageInstance } = require('./firebase-admin');

const bucket = storageInstance.bucket();

const upload = multer({
  storage: multer.memoryStorage(), // Use memory storage to store the file in memory
});

module.exports = upload.single('image');