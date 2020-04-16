const functions = require('firebase-functions');
const admin = require('firebase-admin');
const app = require('express')();

admin.initializeApp();

const config = {
    apiKey: "AIzaSyDUwXK_tOHVeidcJZ9jahJoFhE8uF6CLEg",
    authDomain: "socialape-54d3c.firebaseapp.com",
    databaseURL: "https://socialape-54d3c.firebaseio.com",
    projectId: "socialape-54d3c",
    storageBucket: "socialape-54d3c.appspot.com",
    messagingSenderId: "133406317230",
    appId: "1:133406317230:web:88c751bf867fb6047feb3f",
    measurementId: "G-TTWQZT416T"
  };

const firebase = require ('firebase');
firebase.initializeApp(config)

const db = admin.firestore();

app.get('/screams', (req, res) => {
    db
    .collection('screams')
    .orderBy('createdAt', 'desc')
    .get()
    .then((data) => {
      let screams = [];
      data.forEach((doc) => {
        screams.push({
          screamID: doc.id,
          body: doc.data().body,
          userHandle: doc.data().userHandle,
          createdAt: doc.data().createAt,
          commentCount: doc.data().commentCount,
          likeCount: doc.data().likeCount
        });
      });
      return res.json(screams);
    })
    .catch((err) => console.error(err));
})

app.post('/scream', (req, res) => {
  const newScream = {
    body: req.body.body,
    userHandle: req.body.userHandle,
    createdAt: new Date().toISOString()
  };

    db
    .collection('screams')
    .add(newScream)
    .then((doc) => {
      res.json({ message: `document ${doc.id} created successfully`})
    })

    .catch((err) => {
      res.status(500).json({ error: 'something went wrong'});
      console.error(err)
    });
});

//Signup route
app.post('/signup', (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle
  };
  //TODO: validate data
  db.doc(`/users/${newUser.handle}`).get()
    .then(doc => {
      if(doc.exists){
        return res.status(400).json({ handle: 'this handle is already taken'})
      } else {
         return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password)
      }
    })
    .then(data => {
      return data.user.getIDToken();
    })
    .then(token => {
      return res.status(201).json({ token });
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
});


exports.api = functions.https.onRequest(app);
