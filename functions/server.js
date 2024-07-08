const express = require('express');
const serverless = require('serverless-http');
const axios = require('axios');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

const app = express();
app.use(express.urlencoded({ extended: true }));

const configPath = path.join(__dirname, '..', 'config', 'oauth-config.json');

app.get('/setup', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'setup.html'));
});

app.post('/setup', (req, res) => {
    const { githubClientID, githubClientSecret, youtubeClientID, youtubeClientSecret } = req.body;
    const configData = {
        githubClientID,
        githubClientSecret,
        youtubeClientID,
        youtubeClientSecret,
        redirectURI: process.env.REDIRECT_URI || 'http://localhost:8888/auth/callback'
    };

    fs.writeFileSync(configPath, JSON.stringify(configData, null, 2));
    res.redirect('/');
});

app.use((req, res, next) => {
    if (!fs.existsSync(configPath) || !Object.keys(require(configPath)).length) {
        res.redirect('/setup');
    } else {
        next();
    }
});

app.get('/auth/github', (req, res) => {
    const config = require(configPath);
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${config.githubClientID}&redirect_uri=${config.redirectURI}&scope=repo`;
    res.redirect(githubAuthUrl);
});

app.get('/auth/youtube', (req, res) => {
    const config = require(configPath);
    const youtubeAuthUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${config.youtubeClientID}&redirect_uri=${config.redirectURI}&scope=https://www.googleapis.com/auth/youtube.readonly&response_type=code&access_type=offline`;
    res.redirect(youtubeAuthUrl);
});

app.get('/auth/callback', async (req, res) => {
    const config = require(configPath);
    const code = req.query.code;
    const state = req.query.state;

    if (state === 'github') {
        const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
            client_id: config.githubClientID,
            client_secret: config.githubClientSecret,
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
            client_id: config.youtubeClientID,
            client_secret: config.youtubeClientSecret,
            code: code,
            grant_type: 'authorization_code',
            redirect_uri: config.redirectURI
        });

        const accessToken = tokenResponse.data.access_token;
        res.redirect(`/welcome.html?youtube_token=${accessToken}`);
    }
});

app.use(express.static(path.join(__dirname, '..', 'public')));

module.exports.handler = serverless(app);