const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json.json'); // ✅ Path to downloaded JSON

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://chattapp-847e6-default-rtdb.firebaseio.com', // ✅ Your Firebase Realtime DB URL
});

const firestore = admin.firestore();

module.exports = { admin, firestore };

