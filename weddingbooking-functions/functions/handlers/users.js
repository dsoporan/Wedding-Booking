const {db, admin} = require('../utils/admin');

const config = require('../utils/config')

const firebase = require('firebase');
firebase.initializeApp(config);

const {validateSignupData, validateLoginData, reduceUserDetails} = require('../utils/validators');

//Register the user
exports.signup = (req, res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        username: req.body.username,
        userType: req.body.userType,
    };
 
    const{valid, errors} = validateSignupData(newUser);

    if (!valid)
        return res.status(400).json(errors);
 
    const noImg = 'blankAvatar.jpg';
    
    let token, userId;
 
    db.doc(`/users/${newUser.username}`).get()
    .then(doc => {
        if (doc.exists){
            return res.status(400).json({ username: 'this username is already taken'});
        }
        else{
            return firebase
                 .auth()
                 .createUserWithEmailAndPassword(newUser.email, newUser.password);
            }
         })
         .then((data) => {
             userId = data.user.uid;
             return data.user.getIdToken();
         })
         .then((idtoken) => {
             token = idtoken;
             const userCredentials = {
                 username: newUser.username,
                 userType: newUser.userType,
                 email: newUser.email,
                 createdAt: new Date().toISOString(),
                 imageUrl: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}?alt=media`,
                 userId
             };
             return db.doc(`users/${newUser.username}`).set(userCredentials);    
         })
         .then(() => {
             return res.status(201).json({token});
         })
         .catch((err) => {
             console.error(err);
             if (err.code === 'auth/email-already-in-use'){
                 return res.status(400).json({email: 'Email is already in use'});
             }
             return res.status(500).json({general: "Something went wrong, please try again!"});
         })
 
 }

 //Log user in
 exports.login = (req, res) => {
    const user = {
        email: req.body.email,
        password: req.body.password
    }

    const{valid, errors} = validateLoginData(user);

    if (!valid)
        return res.status(400).json(errors);

    firebase.auth().signInWithEmailAndPassword(user.email, user.password)
    .then(data => {
        return data.user.getIdToken();
    })
    .then(token => {
        return res.json({token});
    })
    .catch(err => {
        console.error(err);
        return res.status(403).json({general: "Wrong credentials, please try again!"});
    })
}

//Add user Details
exports.addUserDetails = (req, res) => {
    let userDetails = reduceUserDetails(req.body);

    db.doc(`/users/${req.user.username}`).update(userDetails)
    .then(() => {
        return res.json({message: "Details added successfully"});
    })
    .catch(err =>{
        console.error(err);
        return res.status(500).json(err.code);
    })
}

//Get any user details
exports.getUserDetails = (req, res) => {
    let userData = {};
    db.doc(`/users/${req.params.username}`).get()
    .then(doc => {
        if(doc.exists){
            userData.user = doc.data();
            return db.collection('screams').where('username', '==', req.params.username)
            .orderBy('createdAt', 'desc')
            .get();
        }
        else {
            return res.status(404).json({error: 'User not found!'})
        }
    })
    .then(data =>{
        userData.screams = [];
        data.forEach(doc => {
            userData.screams.push({
                screamId: doc.id,
                body: doc.data().body,
                busyDates: doc.data().busyDates,
                category: doc.data().category,
                name: doc.data().name,
                price: doc.data().price,
                photos: doc.data().photos,
                username: doc.data().username,
                createdAt: doc.data().createdAt,
                commentCount: doc.data().commentCount,
                likeCount: doc.data().likeCount,
                userImage: doc.data().userImage
            })
        })
        return res.json(userData);
    })
    .catch(err => {
        console.error(err);
        return res.status(500).json({error: err.code});
    })
}

//Get user details
exports.getAuthenticatedUser = (req, res) => {
    let userData = {};
    let userType;
    db.doc(`/users/${req.user.username}`).get()
    .then(doc => {
        if(doc.exists){
            userType = doc.data().userType;
            userData.credentials = doc.data();
            return db.collection('likes').where('username', '==', req.user.username).get()
        }
    })
    .then(data => {
        userData.likes = []
        data.forEach(doc => {
            userData.likes.push(doc.data());
        });
        return db.collection('notifications').where('recipient', '==', req.user.username)
        .orderBy('createdAt', 'desc').limit(10).get();
    })
    .then(data => {
        userData.notifications = [];
        data.forEach(doc => {
            userData.notifications.push({
                recipient: doc.data().recipient,
                sender: doc.data().sender,
                createdAt: doc.data().createdAt,
                screamId: doc.data().screamId,
                type: doc.data().type,
                read: doc.data().read,
                notificationId: doc.id
            });
        });
        if (userType === 'Married To Be'){
            return db.collection('bookings').where('username', '==', req.user.username).orderBy('date', 'asc').get();
        }
        else{
            return db.collection('bookings').where('usernameProvider', '==', req.user.username).orderBy('date', 'asc').get();
        }
    })
    .then(data => {
        userData.bookings = []
        data.forEach(doc => {
            userData.bookings.push(doc.data());
        });
        return res.json(userData);
    })
    .catch(err => {
        console.error(err);
        return res.status(500).json({error: err.code});
    });
}

//Upload a profile image for user
exports.uploadImage = (req, res) => {
    const BusBoy = require('busboy');
    const path = require('path');
    const os = require('os');
    const fs = require('fs');

    const busboy = new  BusBoy({headers: req.headers});

    let imageFileName;
    let imageToBeUploaded = {};

    busboy.on('file', (fieldName, file, filename, encoding, mimetype) => {
        if (mimetype !== 'image/jpeg' && mimetype !== 'image/png'){
            return res.status(400).json({error: 'Wrong file type submitted'});
        }
        //my.image.png
        const imageExtension = filename.split('.')[filename.split('.').length - 1];
        //8723469832323435.png
        imageFileName = `${Math.round(Math.random() * 100000000000)}.${imageExtension}`;
        const filePath = path.join(os.tmpdir(), imageFileName);
        imageToBeUploaded = {filePath, mimetype};
        file.pipe(fs.createWriteStream(filePath));
    });
    busboy.on('finish', () => {
        admin.storage().bucket(config.storageBucket).upload(imageToBeUploaded.filePath, {
            resumable: false,
            metadata:  {
                metadata: {
                    contentType: imageToBeUploaded.mimetype
                }
            }
        })
        .then(() => {
            const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media`;
            return db.doc(`/users/${req.user.username}`).update({imageUrl});
        })
        .then(() => {
            return res.json({message: 'Image uploaded successfully'});
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({error: err.code});
        })
    })
    busboy.end(req.rawBody);
}

exports.markNotificationsRead = (req, res) => {
    let batch = db.batch();
    req.body.forEach(notificationId => {
        const notification = db.doc(`/notifications/${notificationId}`);
        batch.update(notification, {read: true});
    });
    batch.commit()
    .then(() => {
        return res.json({message: "Notifications marked read"});
    })
    .catch(err => {
        console.error(err);
        return res.status(500).json({error: err.code});
    });
}