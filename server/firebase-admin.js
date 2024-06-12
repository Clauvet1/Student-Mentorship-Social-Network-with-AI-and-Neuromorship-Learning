const admin = require("firebase-admin");
const serviceAccount = require("./firebase.config.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://sm-website-d64fd-default-rtdb.firebaseio.com",
  storageBucket: "gs://sm-website-d64fd.appspot.com",
});

const db = admin.firestore();
const auth = admin.auth();
const storageInstance = admin.storage();

module.exports = { db, auth, storageInstance };