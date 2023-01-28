const { MongoClient } = require('mongodb');
const express = require("express");
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const path = require('path');
const { v4: uuidv4 } = require("uuid");
const app = express();
const uri = "mongodb://mongoadmin:secret@localhost:1888/?authMechanism=DEFAULT";
const client = new MongoClient(uri);

mongoose.Promise = global.Promise;
mongoose.connect(uri);

var nameSchema = new mongoose.Schema({
    id: String,
    content: String,
    location: String
});
var Task = mongoose.model("Task", nameSchema);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//express.static loads static files as styles.css or jquery and javascript dependencies
//without it, index.html is just html without any styles or functionality
app.use(express.static(path.join(__dirname, '..')));

app.listen(3000, () => {
    console.log("Server running on port 3000");
});

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.get('/getTasks', function (req, res) {
    getTasks().then(tasks => res.send(tasks)).catch(console.dir);
});

app.post('/create', function (req, res) {
    let data = new Task(req.body);
    data.id = uuidv4();
    data.save()
        .then(item => {
            res.send(item);
        })
        .catch(err => {
            res.status(400).send("unable to save to database");
        });
});

app.put('/update', async function (req, res) {
    try {
        await client.connect();
        const db = client.db('test');
        const collection = db.collection('tasks');
        const filter = {id: req.body.id};
        const updateDoc = {
            $set: {
                location: req.body.location
            }
        }
        await collection.updateOne(filter, updateDoc);
        res.send({'message': 'Task location updated correctly'});
    } finally {
        await client.close();
    }
});

app.delete('/delete', async function (req, res) {
    try {
        await client.connect();
        const db = client.db('test');
        const collection = db.collection('tasks');
        const query = {id: req.body.id};
        await collection.deleteOne(query);
        res.send({'message': 'Task deleted correctly'});
    } finally {
        await client.close();
    }
});

async function getTasks() {
    try {
        await client.connect();
        const db = client.db('test');
        const collection = db.collection('tasks');
        const cursor = collection.find();
        let tasks = [];
        await cursor.forEach(task => tasks.push(task));
        return tasks;
    } finally {
        await client.close();
    }
}
