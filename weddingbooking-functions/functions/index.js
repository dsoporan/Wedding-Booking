const functions = require('firebase-functions');
const app = require('express')();

const FBAuth = require('./utils/fbAuth');

const cors = require('cors');
app.use(cors());

const {getAllScreams, postOneScream, getScream, commentOnScream, likeScream, unlikeScream, deleteScream, uploadPostPhotos, editScream} = require('./handlers/screams')
const {signup, login, uploadImage, addUserDetails, getAuthenticatedUser, getUserDetails, markNotificationsRead} = require('./handlers/users');
const {db} = require('./utils/admin');

// Scream Routes
app.get('/screams', getAllScreams);
app.post('/scream', FBAuth, postOneScream);
app.get('/scream/:screamId', getScream);

app.delete('/scream/:screamId', FBAuth, deleteScream);
app.get('/scream/:screamId/unlike', FBAuth, unlikeScream);
app.get('/scream/:screamId/like', FBAuth, likeScream);
app.post('/scream/:screamId/comment', FBAuth, commentOnScream);
app.post('/scream/:screamId/photos', FBAuth, uploadPostPhotos);
app.post('/scream/:screamId/edit', FBAuth, editScream);

// Users Routes
app.post('/signup', signup);
app.post('/login', login);
app.post('/user/image', FBAuth, uploadImage);
app.post('/user', FBAuth, addUserDetails);
app.get('/user', FBAuth, getAuthenticatedUser);
app.get('/user/:username', getUserDetails);
app.post('/notifications', FBAuth, markNotificationsRead);

exports.api = functions.region('europe-west1').https.onRequest(app);

exports.createNotificationOnLike = functions.region('europe-west1').firestore.document('likes/{id}')
.onCreate((snapshot) => {
    return db.doc(`/screams/${snapshot.data().screamId}`).get()
    .then(doc => {
        if(doc.exists && doc.data().username !== snapshot.data().username){
            return db.doc(`/notifications/${snapshot.id}`).set({
                createdAt: new Date().toISOString(),
                recipient: doc.data().username,
                sender: snapshot.data().username,
                type: 'like',
                read: false,
                screamId: doc.id
            });
        }
    })
    .catch(err => {
        console.error(err);
    })
});

exports.deleteNotificationOnUnLike = functions.region('europe-west1').firestore.document('likes/{id}')
.onDelete((snapshot) => {
    return db.doc(`/notifications/${snapshot.id}`).delete()
    .catch(err => {
        console.error(err);
        return;
    })
})

exports.createNotificationOnComment = functions.region('europe-west1').firestore.document('comments/{id}')
.onCreate((snapshot) => {
    return db.doc(`/screams/${snapshot.data().screamId}`).get()
    .then(doc => {
        if(doc.exists  && doc.data().username !== snapshot.data().username){
            return db.doc(`/notifications/${snapshot.id}`).set({
                createdAt: new Date().toISOString(),
                recipient: doc.data().username,
                sender: snapshot.data().username,
                type: 'comment',
                read: false,
                screamId: doc.id
            });
        }
    })
    .catch(err => {
        console.error(err);
        return;
    })
});

exports.onUserImageChange = functions.region('europe-west1').firestore.document('/users/{userId}')
    .onUpdate(change => {
        console.log(change.before.data());
        console.log(change.after.data());
        if (change.before.data().imageUrl !== change.after.data().imageUrl){
            console.log('image has changed');
            const batch = db.batch();
            return db.collection('screams').where('username', '==', change.before.data().username).get()
            .then(data => {
                data.forEach(doc => {
                    const scream = db.doc(`/screams/${doc.id}`);
                    batch.update(scream, {userImage: change.after.data().imageUrl});
                })
            return batch.commit();
        })
        }
        else return true;
    });

exports.onScreamDelete = functions.region('europe-west1').firestore.document('/screams/{screamId}')
.onDelete((snapshot, context) => {
    const screamId = context.params.screamId;
    const batch = db.batch();
    return db.collection('comments').where('screamId', '==', screamId).get()
    .then(data => {
        data.forEach(doc => {
            batch.delete(db.doc(`/comments/${doc.id}`));
        })
        return db.collection('likes').where('screamId', '==', screamId).get();
    })
    .then(data => {
        data.forEach(doc => {
            batch.delete(db.doc(`/likes/${doc.id}`));
        })
        return db.collection('notifications').where('screamId', '==', screamId).get();
    }) 
    .then(data => {
        data.forEach(doc => {
            batch.delete(db.doc(`/notifications/${doc.id}`));
        })
        return batch.commit();
    }) 
    .catch(err => {
        console.error(err);
    })
})