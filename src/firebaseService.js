const admin = require("firebase-admin");

const serviceAccount = require("./firebase/sendbird-bd9b7-firebase-adminsdk.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
