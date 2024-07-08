const axios = require('axios');

const urls = [
    'http://localhost:8000/auth/github',
    'http://localhost:8000/auth/youtube',
    'http://localhost:8000/auth/callback?code=example_code&state=github',
    'http://localhost:8000/auth/callback?code=example_code&state=youtube'
];

urls.forEach(async (url) => {
    try {
        const response = await axios.get(url);
        console.log(`Testing ${url} -> Status: ${response.status}`);
    } catch (error) {
        console.error(`Testing ${url} -> Error: ${error.message}`);
    }
});