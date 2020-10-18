const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');
require('dotenv').config()
const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.o2wak.mongodb.net/burjAlArab?retryWrites=true&w=majority`;
const app = express()
app.use(cors());
app.use(bodyParser.json());


const serviceAccount = require("./configs/burj-al-arab-72503-firebase-adminsdk-880cr-1c8834d85b.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "process.env.FIRE_DB"
});


const port = 5000




const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const booking = client.db("burjAlArab").collection("booking");
  app.post('/addBooking', (req, res) => {
    const newBooking = req.body;
    booking.insertOne(newBooking)
      .then(result => {
        res.send(result.insertedCount > 0)
      })
    console.log(newBooking);
  })

  app.get('/bookings', (req, res) => {
    const bearer = req.headers.authorization;
    if (bearer && bearer.startsWith('Bearer ')) {
      const idToken = bearer.split(' ')[1];
      admin.auth().verifyIdToken(idToken)
        .then(function (decodedToken) {
          const tokenEmail = decodedToken.email;
          if (tokenEmail == req.query.email) {
            booking.find({ email: req.query.email })
              .toArray((err, documents) => {
                res.send(documents);
              })
          }
           else{
            res.status(401).send("un-authorized");
           }
        }).catch(function (error) {
          res.status(401).send("un-authorized");
        });
    }
    else{
      res.status(401).send("un-authorized");
    }
  })
});


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port);