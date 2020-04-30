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


//edit scream
exports.editScream = (req, res) => {

    const editScream = {
        body: req.body.body,
        name: req.body.name,
        price: req.body.price,
        busyDates: req.body.busyDates,
		screamId: req.params.screamId
    };

    const{valid, errors} = validatePostAdding(editScream);

    if (!valid)
        return res.status(400).json(errors);


    db.doc(`/screams/${req.params.screamId}`).get()
    .then(doc => {
        if(!doc.exists){
            return res.status(404).json({error: 'Scream not found'});
        }
        return doc.ref.update({body: editScream.body, name: editScream.name, price: editScream.price, busyDates: editScream.busyDates});
    })
    .then(() => {
        res.json(editScream);
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({error: "Something went wrong"});
    });
};

//book scream
exports.bookScream = (req, res) => {

    let transformDate = new Date(req.body.date);
    transformDate.setHours(12,0,0,0);
    transformDate = transformDate.toISOString();

    const bookScream = {
        username: req.body.username,
        date: transformDate,
        screamId: req.params.screamId,
        createdAt: new Date().toISOString(),
    };

    db.doc(`/screams/${req.params.screamId}`).get()
    .then(doc => {
        if(!doc.exists){
            return res.status(404).json({error: 'Post not found'});
        }
        bookScream.usernameProvider = doc.data().username;
        db
        .collection('bookings')
        .add(bookScream)
        .then((doc) => {
            const resBooking = bookScream;
            resBooking.bookingId = doc.id;
            return resBooking;
        })
        .then((resBooking) => {
            db.doc(`/screams/${req.params.screamId}`).get()
            .then(doc => {
                const busyDates = doc.data().busyDates;
                busyDates.push(transformDate);
                resBooking.date = transformDate;
                res.json(resBooking);
                return doc.ref.update({busyDates: busyDates});
            })
        })
        .catch((err) => {
            res.status(500).json({error: 'something went wrong'});
            console.error(err);
        });

    })
    .catch((err) => {
        res.status(500).json({error: 'something went wrong'});
        console.error(err);
    });
};

//Get all bookings
exports.getAllBookings = (req, res) => {
    db
    .collection('bookings')
    .orderBy('createdAt', 'desc')
    .get()
    .then(data => {
        let bookings = [];
        data.forEach(doc => {
            bookings.push({
                bookingId: doc.id,
                username: doc.data().username,
                date: doc.data().date,
                screamId: doc.data().screamId,
                createdAt: doc.data().createdAt
            });
        });
        return res.json(bookings);
    })
    .catch(err => console.error(err));
}

function compare( a, b ) {
    if ( a.price < b.price ){
      return -1;
    }
    if ( a.price > b.price ){
      return 1;
    }
    return 0;
}

countBookings = (bookings, screamId) => {
    let count = 0;
    bookings.forEach(booking => {
        if (booking.screamId === screamId)
            count += 1;
    })
    return count;
}

suggestAlgo = (screams, bookings) => {
    
    let winnerScream = {};
    let allCoeff = -1;

    screams.forEach(scream => {
        let coefficient = 0;
        coefficient += scream.likeCount * 0.25;
        coefficient += scream.commentCount * 0.25;
        coefficient += countBookings(bookings, scream.screamId) * 0.5;
        if (coefficient > allCoeff){
            allCoeff = coefficient;
            winnerScream = scream;
        }
        if (coefficient === allCoeff){
            if(parseInt(scream.price) < parseInt(winnerScream.price)){
                winnerScream = scream;
            }
        }
    })
    return winnerScream;
    
}

//suggest scream algorithm
exports.suggestScreams = (req, res) => {

    const date = req.body.date.split('T');

    let categories = [];
    if (req.body.location) categories.push('EventHall');
    if (req.body.music) categories.push('Music');
    if (req.body.photo) categories.push('Photo & Video');
    if (req.body.entertainment) categories.push('Entertainment');
    if (req.body.others) categories.push('Others');

    if(req.body.price === ''){
        req.body.price = Number.MAX_SAFE_INTEGER;
    }

    db
    .collection('screams')
    .get()
    .then(data => {
        let screams = {};
        categories.forEach(ctg => {
            screams[ctg] = [];
        })
        data.forEach(doc => {
            let good = true;
            doc.data().busyDates.forEach(busyDate => {
                let bDate = busyDate.split('T');
                if (date[0] === bDate[0])
                    good = false;
            })
            if (parseInt(req.body.price) < parseInt(doc.data().price))
                good = false;
            
            if (!categories.includes(doc.data().category))
                good = false;

            if (good){
                let scream = doc.data();
                scream.screamId = doc.id;
                screams[doc.data().category].push(scream);
            }
        });
        return screams;
    })
    .then(screams => { 
        let bookings = [];
        db
        .collection('bookings')
        .get()
        .then(data => {
            data.forEach(doc => {
                bookings.push(doc.data());
            });
            return bookings;
        })
        .then(bookings => {
            let goodScreams = [];
            console.log(categories);
            console.log(screams);
            categories.forEach(category => {
                screams[category].sort(compare);
                if (req.body.suggestionType === 'low'){
                    goodScreams.push(screams[category][0]);
                }
                else if (req.body.suggestionType === 'high'){
                    goodScreams.push(screams[category][screams[category].length - 1]);
                }
                else{
                    let scream = suggestAlgo(screams[category], bookings);
                    if (Object.keys(scream).length != 0)
                        goodScreams.push(scream);
                }
            })
            return res.json(goodScreams);
        })
        .catch(err => {
            res.status(500).json({error: 'something went wrong'});
            console.error(err)}
        );
    })
    .catch(err => {
        res.status(500).json({error: 'something went wrong'});
        console.error(err)}
    );
   
};

function cartesian(arg) {
    var r = [], max = arg.length - 1;
    function helper(arr, i) {
        for (var j = 0, l = arg[i].length; j < l; j++) {
            var a = arr.slice(0); // clone arr
            a.push(arg[i][j])
            if (i == max) {
                r.push(a);
            } else
                helper(a, i+1);
        }
    }
    helper([], 0);
    return r;
};

checkIfInPrice = (screamArray, total) => {
    cost = 0;
    screamArray.forEach(scream => {
        cost += parseInt(scream.price);
    })
    return (cost <= total);
}  

calculateCost = (screamArray) => {
    costArray = []
    screamArray.forEach(combination => {
        cost = 0;
        combination.forEach(scream => {
            cost += parseInt(scream.price);
        })
        costArray.push(cost);
    })
    return costArray;
}

checkCombinationsUnique = (comb1, comb2) => {
    unique = true;
    for(post = 0; post < comb1.length; post++){
        if (comb1[post] === comb2[post]){
            unique = false;
            break;
        }
    }
    return unique;
}


calculate2Min = (costArray, combinations) => {
    var clone = costArray.slice(0); // clone arr
    min1 = Math.min(...clone);
    const index = clone.indexOf(min1);
    clone.splice(index, 1);
    let ok = true;
    let index2 = -1;
    while(ok){
        min2 = Math.min(...clone);
        index2 = costArray.indexOf(min2);
        if (index2 === -1){
            ok = false;
            break;
        }
        if(checkCombinationsUnique(combinations[index], combinations[index2]))
            ok = false;
        const indexClone = clone.indexOf(min2);
        clone.splice(indexClone, 1);
    }
    return [index, index2];
}

calculate2Max = (costArray, combinations) => {
    var clone = costArray.slice(0); // clone arr
    max1 = Math.max(...clone);
    const index = clone.indexOf(max1);
    clone.splice(index, 1);
    let ok = true;
    let index2 = -1;
    while(ok){
        max2 = Math.max(...clone);
        index2 = costArray.indexOf(max2);
        if (index2 === -1){
            ok = false;
            break;
        }
        if(checkCombinationsUnique(combinations[index], combinations[index2]))
            ok = false;
        const indexClone = clone.indexOf(max2);
        clone.splice(indexClone, 1);
    }
    return [index, index2];
}

calculateCoeff = (combinations, bookings) => {
    allCoeff = [];
    combinations.forEach(combination => {
        coeffCombination = 0;
        combination.forEach(scream => {
            coeffCombination += scream.likeCount * 0.25;
            coeffCombination += scream.commentCount * 0.25;
            coeffCombination += countBookings(bookings, scream.screamId) * 0.5;
        })
        allCoeff.push(coeffCombination)
    })
    return allCoeff;
}


//suggest scream algorithm
exports.suggestPackage = (req, res) => {

    const date = req.body.date.split('T');
    let categories = [];
    if (req.body.location) categories.push('EventHall');
    if (req.body.music) categories.push('Music');
    if (req.body.photo) categories.push('Photo & Video');
    if (req.body.entertainment) categories.push('Entertainment');
    if (req.body.others) categories.push('Others');
    
    if(req.body.price === ''){
        req.body.price = Number.MAX_SAFE_INTEGER;
    }

    db
    .collection('screams')
    .get()
    .then(data => {
        let screams = {};
        categories.forEach(ctg => {
            screams[ctg] = [];
        })
        data.forEach(doc => {
            let good = true;
            doc.data().busyDates.forEach(busyDate => {
                let bDate = busyDate.split('T');
                if (date[0] === bDate[0])
                    good = false;
            })
            if (parseInt(req.body.price) < parseInt(doc.data().price))
                good = false;
            
            if (!categories.includes(doc.data().category))
                good = false;

            if (good){
                let scream = doc.data();
                scream.screamId = doc.id;
                screams[doc.data().category].push(scream);
            }
        });
        return screams;
    })
    .then(screams => { 
        let screamArray = [];
        categories.forEach(category => {
            screamArray.push(screams[category]);
        })
        let allCombinations = cartesian(screamArray);
        let inPriceCombinations = [];
        allCombinations.forEach(combination => {
            if(checkIfInPrice(combination, parseInt(req.body.price)))
                inPriceCombinations.push(combination);
        })
        if (inPriceCombinations.length >= 1)
            return inPriceCombinations;
        else
            return res.status(500).json({error: 'Try to improve searching!'});
    })
    .then(inPriceCombinations => {
        let costs = calculateCost(inPriceCombinations);
        goodScreams = [];
        if (req.body.suggestionType === 'low'){
            [index1, index2] = calculate2Min(costs, inPriceCombinations);
            goodScreams.push(inPriceCombinations[index1]);
            if (index2 !== -1)
                goodScreams.push(inPriceCombinations[index2]);
            return res.json(goodScreams);
        }
        else if (req.body.suggestionType === 'high'){
            [index1, index2] = calculate2Max(costs, inPriceCombinations);
            goodScreams.push(inPriceCombinations[index1]);
            if (index2 !== -1)
                goodScreams.push(inPriceCombinations[index2]);
            return res.json(goodScreams);
        }
        else {
            db
            .collection('bookings')
            .get()
            .then(data => {
                let bookings = [];
                data.forEach(doc => {
                    bookings.push(doc.data());
                });
                return bookings;
            })
            .then(bookings => {
                coeff = calculateCoeff(inPriceCombinations, bookings);
                [index1, index2] = calculate2Max(coeff, inPriceCombinations);
                goodScreams.push(inPriceCombinations[index1]);
                if (index2 !== -1)
                    goodScreams.push(inPriceCombinations[index2]);
                return res.json(goodScreams);
            })
        }
    })
    .catch(err => {
        res.status(500).json({error: 'No package found'});
        //console.error(err)
	});
   
};