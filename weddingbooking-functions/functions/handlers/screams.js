const {db, admin} = require('../utils/admin');
const {validatePostAdding} = require('../utils/validators');

const config = require('../utils/config')



exports.getAllScreams = (req, res) => {
    db
    .collection('screams')
    .orderBy('createdAt', 'desc')
    .get()
    .then(data => {
        let screams = [];
        data.forEach(doc => {
            screams.push({
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
            });
        });
        return res.json(screams);
    })
    .catch(err => console.error(err));
}

//Upload multiple photos for a post
exports.uploadPostPhotos = (req, res) => {
    const BusBoy = require('busboy');
    const path = require('path');
    const os = require('os');
    const fs = require('fs');

    const busboy = new  BusBoy({headers: req.headers, limits: {files: 5}});

    let imageFileName = {}
    let imagesToUpload = []
    let imageToAdd = {}
    //This triggers for each file type that comes in the form data
    busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
        if (mimetype !== "image/jpeg" && mimetype !== "image/png") {
            return res.status(400).json({ error: "Wrong file type submitted!" });
        }
        // Getting extension of any image
        const imageExtension = filename.split(".")[filename.split(".").length - 1];
        // Setting filename
        imageFileName = `${Math.round(Math.random() * 1000000000)}.${imageExtension}`;
        // Creating path
        const filePath = path.join(os.tmpdir(), imageFileName);
        imageToAdd = { imageFileName, filePath, mimetype };
        file.pipe(fs.createWriteStream(filePath));
        //Add the image to the array
        imagesToUpload.push(imageToAdd);
   });

    busboy.on("finish", () => {
        let imageUrls = []
        imagesToUpload.forEach(imageToBeUploaded => { 
            imageUrls.push(`https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageToBeUploaded.imageFileName}?alt=media`);
            db.doc(`/screams/${req.params.screamId}`).update({photos: imageUrls});
            admin.storage().bucket(config.storageBucket).upload(imageToBeUploaded.filePath, {
                    resumable: false,
                    metadata: {
                        metadata: {
                            contentType: imageToBeUploaded.mimetype
                        }
                    }
                })
                .catch(err => {
                    console.error(err);
                    return res.status(500).json({error: err.code});
                })
            })
    });
    busboy.end(req.rawBody);
    return res.json({message: 'Photos uploaded successfully'});
}

exports.postOneScream = (req, res) => {

    const newScream = {
        name: req.body.name,
        body: req.body.body,
        category: req.body.category,
        price: req.body.price,
        busyDates: req.body.busyDates,
        photos: [],
        username: req.user.username,
        userImage: req.user.imageUrl,
        createdAt: new Date().toISOString(),
        likeCount: 0,
        commentCount: 0
    };

    const{valid, errors} = validatePostAdding(newScream);

    if (!valid)
        return res.status(400).json(errors);

    
    db
    .collection('screams')
    .add(newScream)
    .then((doc) => {
        const resScream = newScream;
        resScream.screamId = doc.id;
        res.json(resScream);
    })
    .catch((err) => {
        res.status(500).json({error: 'something went wrong'});
        console.error(err);
    });
}

// get one scream by id
exports.getScream = (req, res) => {
    let screamData = {};
    db.doc(`/screams/${req.params.screamId}`).get()
    .then(doc => {
        if(!doc.exists){
            return res.status(404).json({error: 'Post not found'});
        }
        screamData = doc.data();
        screamData.screamId = doc.id;
        return db.collection('comments').orderBy('createdAt', 'desc').where('screamId', '==', req.params.screamId).get();
    })
    .then(data => {
        screamData.comments = [];
        data.forEach(doc => {
            screamData.comments.push(doc.data());
        });
        return res.json(screamData);
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({error: err.code});
    });
};

//comment on a scream
exports.commentOnScream = (req, res) => {
    if(req.body.body.trim() === '') return res.status(400).json({comment:'Must not be empty'});

    const newComment = {
        body: req.body.body,
        createdAt: new Date().toISOString(),
        screamId: req.params.screamId,
        username: req.user.username,
        userImage: req.user.imageUrl,
    };

    db.doc(`/screams/${req.params.screamId}`).get()
    .then(doc => {
        if(!doc.exists){
            return res.status(404).json({error: 'Scream not found'});
        }
        newComment.commentCount = doc.data().commentCount + 1;
        return doc.ref.update({commentCount: doc.data().commentCount + 1});
    })
    .then(() => {
        return db.collection('comments').add(newComment);

    })
    .then(() => {
        res.json(newComment);
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({error: "Something went wrong"});
    });
};

exports.likeScream = (req, res) => {
    const likeDocument = db.collection('likes').where('username', '==', req.user.username)
    .where('screamId', '==', req.params.screamId).limit(1);

    const screamDocument = db.doc(`/screams/${req.params.screamId}`);

    let screamData = {};

    screamDocument.get()
    .then(doc => {
        if(doc.exists){
            screamData = doc.data();
            screamData.screamId = doc.id;
            return likeDocument.get();
        }
        else{
            return res.status(404).json({error: "Scream not found"});
        }
    })
    .then(data => {
        if(data.empty){
            return db.collection('likes').add({
                screamId: req.params.screamId,
                username: req.user.username
            })
            .then(() => {
                screamData.likeCount++;
                return screamDocument.update({likeCount: screamData.likeCount});
            })
            .then(() =>{
                return res.json(screamData);
            })
        }
        else{
            //there is already liked so it cant be liked anymore
            return res.status(400).json({error: "Scream already liked"});
        }
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({error: err.code});
    })
};

exports.unlikeScream = (req, res) => {
    const likeDocument = db.collection('likes')
    .where('username', '==', req.user.username)
    .where('screamId', '==', req.params.screamId)
    .limit(1);

    const screamDocument = db.doc(`/screams/${req.params.screamId}`);

    let screamData = {};

    screamDocument.get()
    .then(doc => {
        if(doc.exists){
            screamData = doc.data();
            screamData.screamId = doc.id;
            return likeDocument.get();
        }
        else{
            return res.status(404).json({error: "Scream not found"});
        }
    })
    .then(data => {
        if(data.empty){
            return res.status(400).json({error: "Scream not liked"});
        }
        else{
            return db.doc(`/likes/${data.docs[0].id}`).delete()
            .then(() => {
                screamData.likeCount--;
                return screamDocument.update({likeCount: screamData.likeCount});
            })
            .then(() => {
                return res.json(screamData);
            })
        }
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({error: err.code});
    })
};

//Delete scream
exports.deleteScream = (req, res) => {
    const document = db.doc(`/screams/${req.params.screamId}`);
    document.get()
    .then(doc => {
        if(!doc.exists){
            return res.status(404).json({error: 'Post not found'});
        }
        if(doc.data().username !== req.user.username){
            return res.status(403).json({error:'Unauthorized'});
        }
        else{
            return document.delete();
        }
    })
    .then(() => {
        res.json({message: 'Post deleted successfully'});
    })
    .catch(err => {
        console.error(err);
        return res.status(500).json({error: err.code});
    });
};