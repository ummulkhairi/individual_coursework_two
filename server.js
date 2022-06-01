const express = require('express')
const app = express()
const cors = require('cors')

// REQUIRED MODULES FOR STATIC FILE
var path = require("path")
var fs = require("fs")

app.use(express.json())
app.use(cors())

// LOGGER MIDDLEWARE
app.use(function (req, res, next) {
    console.log("Request URL: " + req.url);
    console.log("Request Date: " + new Date());
    next();
});

// STATIC FILE SERVER MIDDLEWARE
app.use(function (req, res, next) {
    // Uses path.join to find the path where the file should be
    var filePath = path.join(__dirname, "static", req.url);
    // Built-in fs.stat gets info about a file
    fs.stat(filePath, function (err, fileInfo) {
        if (err) {
            next();
            return;
        }
        if (fileInfo.isFile()) res.sendFile(filePath);
        else next();
    });
});

const MongoClient = require('mongodb').MongoClient;

//SELECT DATABASE
let db;
MongoClient.connect("mongodb+srv://Ummulkhairi:Ummujalo2002@cluster0.r09jh.mongodb.net/?retryWrites=true&w=majority", (err, client) => {
    db = client.db('lesson-store')
})
//SELECT COLLECTION
app.param('collectionName', (req, res, next, collectionName) => {
    req.collection = db.collection(collectionName)
    return next()
})
//DISPLAY A MESSAGE FOR ROOT PATH TO SHOW THAT API IS WORKING
app.get('/', (req, res, next) => {
    res.send('Select a collection, e.g., /collection/messages')
})
//RETRIEVE ALL THE OBJECTS FROM A COLLECTION
app.get('/collection/:collectionName', (req, res) => {
    req.collection.find({}).toArray((error, results) => {
        if (error) return next(error)
        res.send(results)
    })
})

//ADD AN OBJECT
app.post('/collection/:collectionName', (req, res, next) => {
    req.collection.insertOne(req.body, (error, results) => {
        if (error) return next(error)
        res.send(results.ops)
    })
})

//UPDATE AN OBJECT BY ID
app.put('/collection/:collectionName/:id', (req, res, next) => {
    req.collection.updateOne(
        {_id: new ObjectID(req.params.id)},
        {$set: req.body},
        {safe: true, multi: false},
        (error, result) => {
            if (error) return next(error)
            res.send((result.result.n === 1) ?
                {msg: 'success'} : { msg: 'error'})
        })
})

//DELETE AN OBJECT BY ID
app.delete('/collection/:collectionName/:id', (req, res, next) => {
    req.collection.deleteOne(
        {_id: ObjectID(req.params.id)},
        (error, result) => {
            if (error) return next(error)
            res.send((result.result.n === 1) ?
                {msg: 'success'} : {msg: 'error'})
        })
})

app.use(function (req, res) {
    // Sets the status code to 404
    res.status(404);
    // Sends the error "File not found!”
    res.send("File not found!");
});

const port = process.env.PORT || 3000
app.listen(port)
