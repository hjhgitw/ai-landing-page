require('dotenv').config();

const express = require('express');
const serverless = require('serverless-http');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));
// Serve static files from the assets directory
//app.use('/assets', express.static(path.join(__dirname, 'assets')));

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const config = {
    github: {
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        redirectURI: process.env.REDIRECT_URI
    },
    youtube: {
        clientId: process.env.YOUTUBE_CLIENT_ID,
        clientSecret: process.env.YOUTUBE_CLIENT_SECRET
    }
};

// Middleware to get the current URL and update the callback URL
const updateCallbackURL = (callbackUrl) => {
    config.github.redirectURI = `${callbackUrl}/auth/callback`;
    console.log(`Updated callback URL to ${callbackUrl}`);
};

app.use((req, res, next) => {
    const callbackUrl = `${req.protocol}://${req.get('host')}`;
    updateCallbackURL(callbackUrl);
    next();
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/auth/github', (req, res) => {
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${config.github.clientId}&redirect_uri=${config.github.redirectURI}&scope=repo`;
    res.redirect(githubAuthUrl);
});

app.get('/auth/youtube', (req, res) => {
    const youtubeAuthUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${config.youtube.clientId}&redirect_uri=${config.github.redirectURI}&scope=https://www.googleapis.com/auth/youtube.readonly&response_type=code&access_type=offline`;
    res.redirect(youtubeAuthUrl);
});

app.get('/auth/callback', async (req, res) => {
    const code = req.query.code;
    const state = req.query.state;

    try {
        if (state === 'github') {
            const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
                client_id: config.github.clientId,
                client_secret: config.github.clientSecret,
                code: code
            }, {
                headers: {
                    'Accept': 'application/json'
                }
            });

            const accessToken = tokenResponse.data.access_token;
            res.redirect(`/welcome.html?github_token=${accessToken}`);
        } else if (state === 'youtube') {
            const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
                client_id: config.youtube.clientId,
                client_secret: config.youtubeClientSecret,
                code: code,
                grant_type: 'authorization_code',
                redirect_uri: config.github.redirectURI
            });

            const accessToken = tokenResponse.data.access_token;
            res.redirect(`/welcome.html?youtube_token=${accessToken}`);
        }
    } catch (error) {
        res.status(500).send('Authentication failed');
    }
});

app.use(express.static(path.join(__dirname, 'public')));

app.listen(8000, () => {
    console.log('Server running on http://localhost:8000');
});

module.exports.handler = serverless(app);