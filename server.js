'use strict';

// ####################################################### //
// ########### Server Setup for UserList API ############# //
// ###########        Eranda 300379041       ############# //
// ####################################################### //

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Initialize Express app
const app = express();

// Define the port
const port = process.env.PORT || 3000;

// Middleware setup
app.use(cors());
app.use(express.json());

// MongoDB Atlas connection
mongoose.connect('mongodb+srv://era:admin@cluster0.wdptt1n.mongodb.net/UserList', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('Connected to MongoDB Atlas');
    app.listen(port, () => {
        console.log('API Server is running on port -> ' + port);
    });
})
.catch((error) => {
    console.error('Error connecting to MongoDB : ', error);
});

const Schema = mongoose.Schema;

// Define User schema
const userSchema = new Schema({
    id: { type: Number, required: true, unique: true },
    email: { type: String, required: true },
    username: { type: String }
});

// Create model
const User = mongoose.model('User', userSchema);

const router = express.Router();
app.use('/api/users', router);

// GET /api/users
router.route('/').get((req, res) => {
    console.log("Fetching all users...");
    User.find()
        .then(users => res.json(users))
        .catch(err => res.status(400).json("Error: " + err));
});

// GET /api/users/user/:id
router.route('/user/:id').get((req, res) => {
    User.findOne({ id: req.params.id })
        .then(user => {
            if (!user) return res.status(404).json({ message: "User not found" });
            res.json(user);
        })
        .catch(err => res.status(400).json("Error: " + err));
});


// POST /api/users/newuser
router.route('/newuser').post((req, res) => {
    const { id, email, username } = req.body;

    if (!id || !email) {
        return res.status(400).json({ message: "id and email required" });
    }

    const newUser = new User({ id, email, username });

    newUser.save()
        .then(() => res.json("New user added..."))
        .catch(err => {
            if (err.code === 11000) {
                res.status(400).json({ message: "User with this id already exists" });
            } else {
                res.status(400).json("Error: " + err);
            }
        });
});


// PUT /api/users/modify/:id
router.route('/modify/:id').put((req, res) => {
    User.findOne({ id: req.params.id })
        .then(user => {
            if (!user) return res.status(404).json({ message: "User not found" });

            user.username = req.body.username || user.username;
            user.email = req.body.email || user.email;

            user.save()
                .then(() => res.json("User updated..."))
                .catch(err => res.status(400).json("Error: " + err));
        })
        .catch(err => res.status(400).json("Error: " + err));
});


// DELETE /user/delete/:id
router.route('/delete/:id').delete((req, res) => {
    User.findOneAndDelete({ id: req.params.id })
        .then(deleted => {
            if (!deleted) return res.status(404).json({ message: "User not found" });
            res.json("User deleted...");
        })
        .catch(err => res.status(400).json("Error: " + err));
});


// GET /api/users/getrandomuser
router.route('/getrandomuser').get(async (req, res) => {
    try {
        const count = await User.countDocuments();
        const random = Math.floor(Math.random() * count);
        const user = await User.findOne().skip(random);
        if (!user) return res.status(404).json({ message: "No users found" });
        res.json(user);
    } catch (err) {
        res.status(500).json("Error: " + err);
    }
});
