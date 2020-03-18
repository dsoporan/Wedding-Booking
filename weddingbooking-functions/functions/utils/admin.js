const admin = require('firebase-admin');
// const serviceAccount = require('C:\\Users\\Darian\\Desktop\\Thesis\\weddingbooking-functions\\weddingbooking-e18d9-firebase-adminsdk-yrpbd-308b9df92f.json');

admin.initializeApp({
    // credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

module.exports = { admin, db };