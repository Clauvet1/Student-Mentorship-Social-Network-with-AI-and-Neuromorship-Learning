// firebase-storage.js
const { Storage } = require('@google-cloud/storage');

// Initialize Firebase Storage
const storage = new Storage({
  projectId: 'sm-website-d64fd',
  keyFilename: 'path/to/your/firebase-credentials.json',
});

const bucket = storage.bucket('your-firebase-storage-bucket-url');

module.exports = bucket;