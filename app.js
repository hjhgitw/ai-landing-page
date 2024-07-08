require('dotenv').config();

const express = require('express');
const serverless = require('serverless-http');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the public directory

const configPath = path.join(__dirname, 'config', 'oauth-config.json');

// Function to update callback URL from environment variables
const updateCallbackURL = () => {
    const config = {
        github: {
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            redirectURI: process.env.REDIRECT_URI
        }
    };

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(`Updated callback URL to ${process.env.REDIRECT_URI}`);
};

// Middleware to update the callback URL
app.use((req, res, next) => {
    updateCallbackURL();
    next();
});

// Function to validate URLs
const validateUrls = async (urls) => {
    const results = await Promise.all(urls.map(async (url) => {
        try {
            const response = await axios.get(url);
            return { url, status: response.status };
        } catch (error) {
            return { url, status: error.response ? error.response.status : 'Network Error' };
        }
    }));

    results.forEach(result => {
        if (result.status !== 200) {
            console.error(`URL validation failed for ${result.url}: ${result.status}`);
        } else {
            console.log(`URL validation succeeded for ${result.url}: ${result.status}`);
        }
    });

    return results.every(result => result.status === 200);
};

app.get('/setup', async (req, res) => {
    const urlsToValidate = [
        'https://github.com',
        'https://accounts.google.com',
        process.env.REDIRECT_URI
    ];

    const areUrlsValid = await validateUrls(urlsToValidate);
    if (!areUrlsValid) {
        return res.status(500).send('One or more URLs are invalid. Check logs for details.');
    }

    res.sendFile(path.join(__dirname, 'public', 'setup.html')); // Ensure setup.html is served correctly
});

app.post('/setup', async (req, res) => {
    const { githubClientID, githubClientSecret, youtubeClientID, youtubeClientSecret } = req.body;
    const configData = {
        github: {
            clientId: githubClientID,
            clientSecret: githubClientSecret,
            redirectURI: process.env.REDIRECT_URI
        },
        youtube: {
            clientId: youtubeClientID,
            clientSecret: youtubeClientSecret
        }
    };

    fs.writeFileSync(configPath, JSON.stringify(configData, null, 2));
    console.log("Setup complete. Configuration saved:", configData);

    const urlsToValidate = [
        `https://github.com/login/oauth/authorize?client_id=${githubClientID}&redirect_uri=${process.env.REDIRECT_URI}&scope=repo`,
        `https://accounts.google.com/o/oauth2/auth?client_id=${youtubeClientID}&redirect_uri=${process.env.REDIRECT_URI}&scope=https://www.googleapis.com/auth/youtube.readonly&response_type=code&access_type=offline`
    ];

    const areUrlsValid = await validateUrls(urlsToValidate);
    if (!areUrlsValid) {
        return res.status(500).send('One or more OAuth URLs are invalid. Check logs for details.');
    }

    res.redirect('/');
});

app.use((req, res, next) => {
    if (!fs.existsSync(configPath) || !Object.keys(require(configPath)).length) {
        console.log("Redirecting to setup as config is missing or empty");
        res.redirect('/setup');
    } else {
        next();
    }
});

app.get('/auth/github', (req, res) => {
    const config = require(configPath);
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${config.github.clientId}&redirect_uri=${config.github.redirectURI}&scope=repo`;
    console.log(`Redirecting to GitHub OAuth: ${githubAuthUrl}`);
    res.redirect(githubAuthUrl);
});

app.get('/auth/youtube', (req, res) => {
    const config = require(configPath);
    const youtubeAuthUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${config.youtube.clientId}&redirect_uri=${config.github.redirectURI}&scope=https://www.googleapis.com/auth/youtube.readonly&response_type=code&access_type=offline`;
    console.log(`Redirecting to YouTube OAuth: ${youtubeAuthUrl}`);
    res.redirect(youtubeAuthUrl);
});

app.get('/auth/callback', async (req, res) => {
    const config = require(configPath);
    const code = req.query.code;
    const state = req.query.state;
    console.log(`OAuth callback received. Code: ${code}, State: ${state}`);

    try {
        if (state === 'github') {
            console.log('Handling GitHub OAuth callback');
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
            console.log(`GitHub access token received: ${accessToken}`);
            res.redirect(`/welcome.html?github_token=${accessToken}`);
        } else if (state === 'youtube') {
            console.log('Handling YouTube OAuth callback');
            const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
                client_id: config.youtube.clientId,
                client_secret: config.youtube.clientSecret,
                code: code,
                grant_type: 'authorization_code',
                redirect_uri: config.github.redirectURI
            });

            const accessToken = tokenResponse.data.access_token;
            console.log(`YouTube access token received: ${accessToken}`);
            res.redirect(`/welcome.html?youtube_token=${accessToken}`);
        } else {
            console.log('Unknown state received:', state);
            res.status(400).send('Invalid OAuth state');
        }
    } catch (error) {
        console.error('Error during OAuth callback:', error.response ? error.response.data : error.message);
        res.status(500).send('Authentication failed');
    }
});

app.use(express.static(path.join(__dirname, 'public')));

app.listen(8000, () => {
    console.log('Server running on http://localhost:8000');
});

module.exports.handler = serverless(app);