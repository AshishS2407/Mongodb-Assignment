const express = require('express');
const path = require('path');
const mongoose = require('mongoose');

const loginroute = express.Router();

loginroute.use(express.json());
loginroute.use(express.urlencoded({ extended: false }));
loginroute.use(express.static(path.join(__dirname, '../../public')));

mongoose.connect("mongodb://localhost:27017/Cookbook");

const database = mongoose.connection;
database.on("error", (error) => {
    console.log(error);
});
database.once("connected", () => {
    console.log("database connected");
});

const db = require('../../models/schema.js');

loginroute.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/static', 'signup.html'));
});

loginroute.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;

    console.log(username, email, password);

    // Validate input
    if (!username || !email || !password) {
        return res.status(400).send('All fields are required');
    }

    const newUser = { username, email, password };

    try {
        const exist = await db.findOne({ username });
        if (exist) {
            return res.send("User already exists. Click login");
        }

        const data = await db.create(newUser);
        req.session.username = username;
        // req.session.favourites = data.favourites;
        console.log(data)
        res.redirect('/home');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

loginroute.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/static', 'login.html'));
});

loginroute.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
        return res.status(400).send('Username and password are required');
    }

    try {
        const user = await db.findOne({ username });
        if (!user) {
            return res.send("Invalid username or password. Please signup first");
        }

        if (user.password === password) {
            req.session.username = username;
            req.session.favourites = user.favourites;
            return res.redirect('/home');
        } else {
            return res.send("Invalid username or password. Please signup first");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

loginroute.post('/add/favourites', async (req, res) => {
    const { title, image, recipeId } = req.body;
    const username = req.session.username;

    try {
        const user = await db.findOne({ username });
        if (!user) {
            return res.status(404).send('User not found');
        }

        user.favourites.push({ title, image, recipeId });
        await user.save();

        req.session.favourites = user.favourites; 

        res.json({ message: 'Recipe added to favourites' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

loginroute.get('/api/favourite', async (req, res) => {
    const username = req.session.username;

    if (!username) {
        return res.status(401).send('User not logged in');
    }

    try {
        const user = await db.findOne({ username });
        if (!user) {
            return res.status(404).send('User not found');
        }

        res.json(user.favourites);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

loginroute.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).send('Could not log out. Please try again.');
        }
        res.redirect('/');
    });
});

module.exports = loginroute;
