const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '.env') });

const BASE_URL = 'http://localhost:8888';
const REDIRECT_URI = process.env.REDIRECT_URI;

// Function to test a URL and print the status code
const testUrl = async (url) => {
  try {
    const response = await axios.get(url);
    console.log(`Testing ${url} -> Status: ${response.status}`);
  } catch (error) {
    if (error.response) {
      console.log(`Testing ${url} -> Status: ${error.response.status}`);
    } else {
      console.log(`Testing ${url} -> Error: ${error.message}`);
    }
  }
};

const runTests = async () => {
  console.log('Testing Setup Page');
  await testUrl(`${BASE_URL}/setup`);

  console.log('Testing GitHub Auth URL');
  await testUrl(`${BASE_URL}/auth/github`);

  console.log('Testing YouTube Auth URL');
  await testUrl(`${BASE_URL}/auth/youtube`);

  console.log('Testing Callback URL for GitHub');
  await testUrl(`${REDIRECT_URI}?code=example_code&state=github`);

  console.log('Testing Callback URL for YouTube');
  await testUrl(`${REDIRECT_URI}?code=example_code&state=youtube`);
};

runTests();