(function() {
  async function getUserRegion() {
    try {
      const response = await fetch('https://ipinfo.io/json?token=5168a4827fc93b'); // Using the provided token
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching IP information:', error);
      return { country: 'us', region: 'California' };
    }
  }

  function getUserLanguage() {
    return navigator.language || navigator.userLanguage || 'en';
  }

  async function fetchNews(country, language) {
    try {
      const response = await fetch(`/news?country=${country}&language=${language}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching news:', error);
      return [];
    }
  }

  function createNewsComponent() {
    const newsFetcher = document.createElement('div');
    newsFetcher.id = 'news-fetcher';
    newsFetcher.classList.add('hidden');
    newsFetcher.innerHTML = `
      <div id="news-header">
        <button id="close-news">Close</button>
        <h2>Latest News</h2>
      </div>
      <div id="news-content"></div>
    `;
    document.body.appendChild(newsFetcher);

    const openNewsButton = document.createElement('button');
    openNewsButton.id = 'open-news';
    openNewsButton.textContent = 'Open News';
    document.body.appendChild(openNewsButton);

    openNewsButton.addEventListener('click', () => {
      newsFetcher.classList.remove('hidden');
      fetchNewsContent();
    });

    document.getElementById('close-news').addEventListener('click', () => {
      newsFetcher.classList.add('hidden');
    });

    // Make the news fetcher draggable
    dragElement(newsFetcher);

    async function fetchNewsContent() {
      const { country } = await getUserRegion();
      const language = getUserLanguage();
      const newsData = await fetchNews(country, language);
      const newsContent = document.getElementById('news-content');
      newsContent.innerHTML = '';
      newsData.forEach(article => {
        const articleDiv = document.createElement('div');
        articleDiv.innerHTML = `<h3>${article.title}</h3><p>${article.description}</p>`;
        newsContent.appendChild(articleDiv);
      });
    }

    function dragElement(elmnt) {
      let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
      if (document.getElementById(elmnt.id + "header")) {
        document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
      } else {
        elmnt.onmousedown = dragMouseDown;
      }

      function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
      }

      function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
      }

      function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
      }
    }
  }

  function initializeDebugWindow() {
    const debugWindow = document.createElement('div');
    debugWindow.id = 'debug-window';
    debugWindow.style.cssText = `
      position: fixed;
      bottom: 0;
      right: 0;
      width: 300px;
      height: 200px;
      background: rgba(0, 0, 0, 0.8);
      color: #0f0;
      overflow-y: auto;
      display: none;
      z-index: 1001;
      border: 1px solid #0f0;
      padding: 10px;
      font-size: 12px;
    `;
    document.body.appendChild(debugWindow);

    const debugToggle = document.createElement('button');
    debugToggle.id = 'debug-toggle';
    debugToggle.textContent = 'Debug';
    debugToggle.style.cssText = `
      position: fixed;
      bottom: 10px;
      right: 10px;
      z-index: 1002;
      background: #0f0;
      color: #000;
      border: none;
      padding: 10px;
      cursor: pointer;
    `;
    document.body.appendChild(debugToggle);

    debugToggle.addEventListener('click', () => {
      debugWindow.style.display = debugWindow.style.display === 'none' ? 'block' : 'none';
    });

    console.oldError = console.error;
    console.error = function(message) {
      const errorElement = document.createElement('div');
      errorElement.className = 'debug-error';
      errorElement.textContent = message;
      debugWindow.appendChild(errorElement);
      console.oldError.apply(console, arguments);
    };

    window.onerror = (message, source, lineno, colno, error) => {
      const errorElement = document.createElement('div');
      errorElement.className = 'debug-error';
      errorElement.textContent = `Error: ${message} at ${source}:${lineno}:${colno}`;
      debugWindow.appendChild(errorElement);
    };
  }

  createNewsComponent();
  initializeDebugWindow();
})();
