const express = require("express");
const bodyParser = require("body-parser");
const admin = require("./src/firebaseService");

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());

const validateNotificationData = (data) => {
    return data && data.isVideo && data.type && data.roomId;
};
const sanitizeData = (data) => {
    const sanitizedData = {};
    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            sanitizedData[key] = String(data[key]);
        }
    }
    return sanitizedData;
};
const sendNotification = async (tokens, payload, data) => {
    const messaging = admin.messaging();
    const sanitizedData = sanitizeData(data);
    try {
        const sendPromises = tokens.map(token =>
            messaging.send({ notification: payload, token, data: sanitizedData })
        );
        await Promise.all(sendPromises);
        return true;
    } catch (error) {
        console.error("Erreur lors de l'envoi de la notification:", error);
        throw error;
    }
};
// Route pour envoyer des notifications
app.post("/send-notification", async (req, res) => {
    const { senderId, receiverIds, data } = req.body;
    console.log('senderId ', senderId);
    console.log('receiverIds ', receiverIds);
    console.log('data ', data);
    // Validation des données
    if (!senderId || !receiverIds || !validateNotificationData(data)) {
        return res.status(400).send("Tous les champs (senderId, receiverIds, et données valides) sont nécessaires.");
    }

    const payload = {
        title: ' Rasoa ',
        body: `Appel ${data.isVideo ? 'video' : 'audio'} entrant`,
    };

    // Simule les tokens des récepteurs (ici il faut les récupérer depuis la base de données)
    const receiverTokens = [
        'dollRlGgRBqhpV6kquSGXW:APA91bFGkg2RBixvT_I5I1zP18aSYd1VmqKhRLH1RHHR8KBXdulPr9vlE-_flGLwyCwF9-VT9OEnZsRV7-OVI8B5XdeNf_O-tFNqsCqKrN_kRvshScFkFVg',
        'f0h_yZkOQSeQwmJr7KRQy-:APA91bECDe5D9LaOgoh0ep067rXYtUE5zYxAjx3AHyCcgwE2oC1agzx8-JEw1cWfx06N-d9FaAkI56lrHzO-BvkSj0UJv_KBaGiRkba3VQqPmryQTC_zydQ'
    ];

    try {
        await sendNotification(receiverTokens, payload, data);
        res.status(200).send("Notifications envoyées avec succès.");
    } catch (error) {
        res.status(500).send("Erreur lors de l'envoi de la notification.");
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
