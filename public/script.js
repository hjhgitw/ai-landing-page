// Loader
window.addEventListener('load', function() {
    setTimeout(function() {
        document.getElementById('loader').style.display = 'none';
    }, 2000);
});

// Progress animation
let progress = 0;
const progressElement = document.getElementById('percentage');

const updateProgress = () => {
    if (progress < 100) {
        progress++;
        progressElement.textContent = `${progress}%`;
        setTimeout(updateProgress, 100);
    }
};

setTimeout(updateProgress, 2000);

// Flying GIFs
const cat = document.getElementById('cat');
const fish = document.getElementById('fish');

cat.style.backgroundImage = "url('/assets/cat.webp')";
fish.style.backgroundImage = "url('/assets/fish.gif.webp')";

const randomPosition = (element) => {
    element.style.top = Math.random() * (window.innerHeight - 100) + 'px';
    element.style.left = Math.random() * (window.innerWidth - 100) + 'px';
};

const animateFlyingGifs = () => {
    randomPosition(cat);
    randomPosition(fish);
};

let gifInterval = setInterval(animateFlyingGifs, 5000);

// Debug window
const debugWindow = document.getElementById('debug-window');
const debugToggle = document.getElementById('debug-toggle');

debugToggle.addEventListener('click', () => {
    debugWindow.style.display = debugWindow.style.display === 'none' ? 'block' : 'none';
});

const logError = (error) => {
    const errorElement = document.createElement('div');
    errorElement.textContent = error;
    debugWindow.appendChild(errorElement);
};

// Bind console.error to debug window
console.oldError = console.error;
console.error = function(message) {
    logError(message);
    console.oldError.apply(console, arguments);
};

window.onerror = (message, source, lineno, colno, error) => {
    logError(`Error: ${message} at ${source}:${lineno}:${colno}`);
};

// Control buttons
const stopButton = document.getElementById('stop-button');
const restartButton = document.getElementById('restart-button');

stopButton.addEventListener('click', () => {
    clearInterval(matrixInterval);
    clearInterval(gifInterval);
});

restartButton.addEventListener('click', () => {
    window.location.reload();
});

// Login box toggle
const loginToggle = document.getElementById('login-toggle');
const loginBox = document.getElementById('login-box');
const loginClose = document.getElementById('login-close');

loginToggle.addEventListener('click', () => {
    loginBox.style.display = loginBox.style.display === 'none' ? 'block' : 'none';
});

loginClose.addEventListener('click', () => {
    loginBox.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target == loginBox) {
        loginBox.style.display = 'none';
    }
});

// Login functionality
const loginButton = document.getElementById('login-button');
loginButton.addEventListener('click', () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    if (username === 'admin' && password === 'password') {
        alert('Login successful!');
        loginBox.style.display = 'none';
    } else {
        alert('Invalid username or password');
    }
});

// News fetcher control
const newsFetcher = document.getElementById('news-fetcher');
const openNewsButton = document.getElementById('open-news');
const closeNewsButton = document.getElementById('close-news');

openNewsButton.addEventListener('click', () => {
    newsFetcher.classList.add('visible');
});

closeNewsButton.addEventListener('click', () => {
    newsFetcher.classList.remove('visible');
});