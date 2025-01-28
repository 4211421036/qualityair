import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { minify } from 'html-minifier';

function generateNonce() {
  return crypto.randomBytes(16).toString('base64');
}

function generateHashedFileName(filePath) {
  const hash = crypto.createHash('sha256');
  const fileBuffer = fs.readFileSync(filePath);
  hash.update(fileBuffer);
  const fileHash = hash.digest('hex').slice(0, 8);
  const extname = path.extname(filePath);
  const newFileName = `${fileHash}${extname}`;
  const newFilePath = path.join(process.cwd(), newFileName);

  if (!fs.existsSync(newFilePath)) {
    fs.copyFileSync(filePath, newFilePath);
  }

  return newFileName;
}

function generateIntegrityHash(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const hash = crypto.createHash('sha384');
  hash.update(fileBuffer);
  return hash.digest('base64');
}

function generateInlineScriptHash(scriptContent) {
  const hash = crypto.createHash('sha256');
  hash.update(scriptContent);
  return `'sha256-${hash.digest('base64')}'`;
}

async function generateHtml() {
  // Generate nonce untuk setiap elemen
  const nonce = generateNonce();
  const cssFiles = ['style.css'];
  const hashedCssFiles = cssFiles.map((file) => {
    const filePath = path.join(process.cwd(), file); // Asumsi file berada di direktori kerja
    return generateHashedFileName(filePath);
  });

  const cspContent = [
      `style-src 'self' 'nonce-${nonce}' 'unsafe-inline' https://4211421036.github.io http://4211421036.github.io https://cdnjs.cloudflare.com`,
      "object-src 'none'",
      "base-uri 'self'",
      "img-src 'self' data: https://4211421036.github.io http://4211421036.github.io",
      "default-src 'self' https://4211421036.github.io http://4211421036.github.io",
      `script-src 'self' 'unsafe-inline' 'nonce-${nonce}' 'strict-dynamic' ${hashedJsFiles
        .map((file) => `'sha384-${generateIntegrityHash(path.join(process.cwd(), file))}'`)
        .join(' ')} https://4211421036.github.io http://4211421036.github.io https://cdnjs.cloudflare.com`,
      "font-src 'self' https://4211421036.github.io http://4211421036.github.io https://cdnjs.cloudflare.com;",
      "media-src 'self' https://4211421036.github.io http://4211421036.github.io",
      "connect-src 'self' https://4211421036.github.io http://4211421036.github.io",
      "form-action 'self'",
      "manifest-src 'self' https://4211421036.github.io http://4211421036.github.io",
      "worker-src 'self' blob: https://4211421036.github.io http://4211421036.github.io"
  ].join('; ');

  let htmlContent = `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Air Quality Index</title>
      <meta name="description" content="Monitor the air quality index and CO levels in real-time.">
      <meta name="keywords" content="Air Quality, CO Levels, AQI, Air Pollution, Environment">
      <meta name="author" content="GALIH RIDHO UTOMO">
      <meta name="robots" content="index, follow">
      <meta name="referrer" content="origin-when-crossorigin" id="meta_referrer" />
      <meta name="bingbot" content="noarchive" />
      <link rel="alternate" media="handheld" href="https://4211421036.github.io/qualityair/" />
      <link rel="alternate" media="only screen and (max-width: 640px)" href="https://4211421036.github.io/qualityair/" />
      <link rel="canonical" href="https://4211421036.github.io/" />
      <meta property="og:locale" content="id_ID" />
      <meta property="og:title" content="Air Quality Index">
      <meta property="og:description" content="Monitor the air quality index and CO levels in real-time.">
      <meta property="og:type" content="website">
      <meta property="og:url" content="https://4211421036.github.io">
      <meta property="og:image" content="https://4211421036.github.io/image.jpg">
      <meta name="twitter:card" content="summary_large_image">
      <meta name="twitter:title" content="Air Quality Index">
      <meta name="twitter:description" content="Monitor the air quality index and CO levels in real-time.">
      <meta name="twitter:image" content="https://4211421036.github.io/image.jpg">
      <link rel="apple-touch-icon" href="apple-touch-icon.png">
      <link rel="manifest" href="/qualityair/manifest.webmanifest">
      <link rel="canonical" href="https://4211421036.github.io/qualityair/">
      <link rel="manifest" href="manifest.webmanifest" crossorigin="use-credentials">
      <link nonce="${nonce}" crossorigin="anonymous" rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
      <meta http-equiv="Content-Security-Policy" content="${cspContent}">
      <script nonce="${nonce}" crossorigin="anonymous" src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.7.0/chart.min.js" defer></script>
      ${hashedCssFiles
          .map(
            (file) =>
              `<link rel="stylesheet" nonce="${nonce}" href="${file}" integrity="sha384-${generateIntegrityHash(
                path.join(process.cwd(), file)
              )}" crossorigin="anonymous">`
          )
          .join('\n')}`;
  
  // Verifikasi file asli
  jsFiles.forEach(file => {
    const originalPath = path.join(process.cwd(), file);
    if (!fs.existsSync(originalPath)) {
      throw new Error(`File ${file} tidak ditemukan di ${originalPath}`);
    }
  });

  // Menambahkan style inline dengan nonce
  htmlContent += `
      <style nonce="${nonce}">
        body {
            margin: 0;
            overflow: hidden;
            background: adial-gradient(100% 193.51% at 100% 0%, rgb(237, 244, 248) 0%, rgb(239, 242, 250) 16.92%, rgb(250, 239, 246) 34.8%, rgb(250, 230, 242) 48.8%, rgb(250, 240, 247) 63.79%, rgb(241, 241, 251) 81.34%, rgb(240, 244, 248) 100%);;
            color: #000000;
        }
        
        @media (prefers-color-scheme: dark) {
            body {
                background: rgb(30, 30, 30);
                color: rgb(255, 255, 255);
            }
        }
      </style>
    </head>
    <body>
        <div class="app-container">
            <div class="header">
                <div>
                    <div class="greeting" id="greeting">Good Morning</div>
                    <div class="date" id="current-date"></div>
                </div>
                <button type="button" name="theme" class="theme-toggle" onclick="toggleTheme()" title="Toggle Theme">
                    <i class="fas fa-moon"></i>
                </button>
            </div>
    
            <div class="main-card">
                <div class="aqi-display">
                    <div class="aqi-circle">
                        <div class="aqi-number" id="ppm-value">--</div>
                        <div class="aqi-label">CO PPM</div>
                    </div>
                    <div class="aqi-status" id="air-quality-status">Calculating...</div>
                </div>
    
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-value" id="raw-value">--</div>
                        <div class="stat-label">Raw Value</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="timestamp">--</div>
                        <div class="stat-label">Last Updated</div>
                    </div>
                </div>
            </div>
    
            <div class="nav-bar">
                <div class="nav-item active">
                    <i class="fas fa-home"></i>
                    <span>Home</span>
                </div>
                <div class="nav-item" onclick="showModal('history-modal')">
                    <i class="fas fa-chart-line"></i>
                    <span>History</span>
                </div>
                <div class="nav-item" onclick="showModal('forecast-modal')">
                    <i class="fas fa-cloud"></i>
                    <span>Forecast</span>
                </div>
                <div class="nav-item" onclick="showModal('info-modal')">
                    <i class="fas fa-info-circle"></i>
                    <span>Info</span>
                </div>
            </div>
        </div>
    
        <!-- History Modal -->
        <div class="modal" id="history-modal">
            <div class="modal-header">
                <div class="swipe-indicator"></div>
                <div class="modal-title">CO Level History</div>
            </div>
            <div class="modal-content">
                <div class="chart-container">
                    <canvas id="historyChart"></canvas>
                </div>
            </div>
        </div>
    
        <!-- Forecast Modal -->
        <div class="modal" id="forecast-modal">
            <div class="modal-header">
                <div class="swipe-indicator"></div>
                <div class="modal-title">Air Quality Forecast</div>
            </div>
            <div class="modal-content">
                <div class="chart-container">
                    <canvas id="forecastChart"></canvas>
                </div>
                <div class="recommendations">
                    <div class="recommendation-item">
                        <div class="recommendation-title">Today's Recommendation</div>
                        <div class="recommendation-text" id="daily-recommendation">
                            Based on current CO levels...
                        </div>
                    </div>
                </div>
            </div>
        </div>
    
        <!-- Info Modal -->
        <div class="modal" id="info-modal">
            <div class="modal-header">
                <div class="swipe-indicator"></div>
                <div class="modal-title">CO Information</div>
            </div>
            <div class="recommendation-item">
                <div class="recommendation-title">CO Levels Guide</div>
                <div class="recommendation-text">
                    <ul class="no-list-style">
                        <li>🟢 0-50 PPM: Safe</li>
                        <li>🟡 51-100 PPM: Moderate</li>
                        <li>🟠 101-150 PPM: Unhealthy for Sensitive Groups</li>
                        <li>🔴 151-200 PPM: Unhealthy</li>
                        <li>🟣 >200 PPM: Very Dangerous</li>
                    </ul>
                </div>
            </div>
        </div>
      </div>
      <script nonce="${nonce}">
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.register('/qualityair/sw.js')
            .then(reg => console.log('Service worker registered'))
            .catch(err => console.log('Service worker not registered', err));
        }
        console.log('Generated automatic on: ${new Date().toLocaleString()}');
      </script>
      <script nonce="${nonce}">
        // Theme handling
        function toggleTheme() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        
            const themeIcon = document.querySelector('.theme-toggle i');
            themeIcon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
        
        // Set initial theme
        const savedTheme = localStorage.getItem('theme') ||
            (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        document.documentElement.setAttribute('data-theme', savedTheme);
        document.querySelector('.theme-toggle i').className =
            savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        
        // Charts initialization
        const historyCtx = document.getElementById('historyChart').getContext('2d');
        const historyChart = new Chart(historyCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'CO Level (PPM)',
                    data: [],
                    borderColor: '#3b82f6',
                    tension: 0.4,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: getComputedStyle(document.documentElement)
                                .getPropertyValue('--text-primary')
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: getComputedStyle(document.documentElement)
                                .getPropertyValue('--border-color')
                        },
                        ticks: {
                            color: getComputedStyle(document.documentElement)
                                .getPropertyValue('--text-secondary')
                        }
                    },
                    x: {
                        grid: {
                            color: getComputedStyle(document.documentElement)
                                .getPropertyValue('--border-color')
                        },
                        ticks: {
                            color: getComputedStyle(document.documentElement)
                                .getPropertyValue('--text-secondary')
                        }
                    }
                }
            }
        });
        
        const forecastCtx = document.getElementById('forecastChart').getContext('2d');
        const forecastChart = new Chart(forecastCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Historical',
                    data: [],
                    borderColor: '#3b82f6',
                    tension: 0.4,
                    fill: false
                },
                {
                    label: 'Forecast',
                    data: [],
                    borderColor: '#10b981',
                    borderDash: [5, 5],
                    tension: 0.4,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: getComputedStyle(document.documentElement)
                                .getPropertyValue('--text-primary')
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: getComputedStyle(document.documentElement)
                                .getPropertyValue('--border-color')
                        },
                        ticks: {
                            color: getComputedStyle(document.documentElement)
                                .getPropertyValue('--text-secondary')
                        }
                    },
                    x: {
                        grid: {
                            color: getComputedStyle(document.documentElement)
                                .getPropertyValue('--border-color')
                        },
                        ticks: {
                            color: getComputedStyle(document.documentElement)
                                .getPropertyValue('--text-secondary')
                        }
                    }
                }
            }
        });
        
        // Fungsi untuk memprediksi nilai CO berikutnya
        function predictNextValues(values, periods = 6) {
            if (values.length < 2) return Array(periods).fill(values[0] || 0);
        
            // Hitung rata-rata perubahan
            let changes = [];
            for (let i = 1; i < values.length; i++) {
                changes.push(values[i] - values[i - 1]);
            }
            const avgChange = changes.reduce((a, b) => a + b, 0) / changes.length;
        
            // Generate prediksi
            const predictions = [];
            let lastValue = values[values.length - 1];
        
            for (let i = 0; i < periods; i++) {
                lastValue += avgChange;
                // Tambahkan sedikit random noise untuk variasi
                const noise = (Math.random() - 0.5) * Math.abs(avgChange);
                predictions.push(Math.max(0, lastValue + noise));
            }
        
            return predictions;
        }
        
        // Update fungsi updateHistoryChart menjadi:
        function updateHistoryChart(timestamp, ppm, rawValue) {
            // Keep last 24 readings
            if (historicalData.times.length > 24) {
                historicalData.times.shift();
                historicalData.values.shift();
                historicalData.rawValues.shift();
            }
        
            const timeStr = new Date(timestamp).toLocaleTimeString();
            historicalData.times.push(timeStr);
            historicalData.values.push(ppm);
            historicalData.rawValues.push(rawValue);
        
            // Update history chart
            historyChart.data.labels = historicalData.times;
            historyChart.data.datasets[0].data = historicalData.values;
            historyChart.update();
        
            // Update forecast chart
            const currentTime = new Date(timestamp);
            const forecastTimes = [];
            const forecastLabels = [];
        
            // Gunakan 6 data terakhir untuk historical
            const recentTimes = historicalData.times.slice(-6);
            const recentValues = historicalData.values.slice(-6);
        
            // Generate 6 forecast points
            for (let i = 1; i <= 6; i++) {
                const futureTime = new Date(currentTime.getTime() + i * 5 * 60000); // 5 menit interval
                forecastTimes.push(futureTime);
                forecastLabels.push(futureTime.toLocaleTimeString());
            }
        
            const predictions = predictNextValues(historicalData.values, 6);
        
            forecastChart.data.labels = [...recentTimes, ...forecastLabels];
            forecastChart.data.datasets[0].data = recentValues;
            forecastChart.data.datasets[1].data = [...Array(recentTimes.length).fill(null), ...predictions];
            forecastChart.update();
        }
        
        // Tambahkan di fungsi updateChartColors:
        function updateChartColors() {
            const textColor = getComputedStyle(document.documentElement)
                .getPropertyValue('--text-primary');
            const gridColor = getComputedStyle(document.documentElement)
                .getPropertyValue('--border-color');
        
            // Update history chart colors
            historyChart.options.scales.y.grid.color = gridColor;
            historyChart.options.scales.x.grid.color = gridColor;
            historyChart.options.scales.y.ticks.color = textColor;
            historyChart.options.scales.x.ticks.color = textColor;
            historyChart.options.plugins.legend.labels.color = textColor;
        
            // Update forecast chart colors
            forecastChart.options.scales.y.grid.color = gridColor;
            forecastChart.options.scales.x.grid.color = gridColor;
            forecastChart.options.scales.y.ticks.color = textColor;
            forecastChart.options.scales.x.ticks.color = textColor;
            forecastChart.options.plugins.legend.labels.color = textColor;
        
            historyChart.update();
            forecastChart.update();
        }
        
        // Modal handling
        let activeModal = null;
        let startY = 0;
        let currentY = 0;
        
        function showModal(modalId) {
            const modal = document.getElementById(modalId);
            modal.classList.add('active');
            activeModal = modal;
        
            // Update nav items
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
                if (item.textContent.toLowerCase().includes(modalId.split('-')[0])) {
                    item.classList.add('active');
                }
            });
        }
        
        function hideModal(modal) {
            modal.classList.remove('active');
            activeModal = null;
        
            // Reactivate home nav item
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
                if (item.textContent.toLowerCase().includes('home')) {
                    item.classList.add('active');
                }
            });
        }
        
        // Touch events for modals
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('touchstart', (e) => {
                startY = e.touches[0].clientY;
            });
        
            modal.addEventListener('touchmove', (e) => {
                if (!activeModal) return;
        
                currentY = e.touches[0].clientY;
                const deltaY = currentY - startY;
        
                if (deltaY > 0) {
                    e.preventDefault();
                    modal.style.transform = `translate(-50%, ${deltaY}px)`;
                }
            });
        
            modal.addEventListener('touchend', (e) => {
                if (!activeModal) return;
        
                const deltaY = currentY - startY;
        
                if (deltaY > 100) {
                    hideModal(modal);
                }
        
                modal.style.transform = 'translateX(-50%)';
            });
        });
        
        // Data handling
        const historicalData = {
            times: [],
            values: [],
            rawValues: []
        };
        
        function updateHistoryChart(timestamp, ppm, rawValue) {
            // Keep last 24 readings
            if (historicalData.times.length > 24) {
                historicalData.times.shift();
                historicalData.values.shift();
                historicalData.rawValues.shift();
            }
        
            historicalData.times.push(new Date(timestamp).toLocaleTimeString());
            historicalData.values.push(ppm);
            historicalData.rawValues.push(rawValue);
        
            historyChart.data.labels = historicalData.times;
            historyChart.data.datasets[0].data = historicalData.values;
            historyChart.update();
        }
        
        function getAirQualityStatus(ppm) {
            if (ppm <= 50) return '🟢 Safe';
            if (ppm <= 100) return '🟡 Moderate';
            if (ppm <= 150) return '🟠 Unhealthy for Sensitive Groups';
            if (ppm <= 200) return '🔴 Unhealthy';
            return '🟣 Very Dangerous';
        }
        
        function getRecommendation(ppm) {
            if (ppm <= 50) {
                return 'Air quality is good. Perfect for outdoor activities.';
            } else if (ppm <= 100) {
                return 'Air quality is acceptable. Consider reducing prolonged outdoor activities if you are sensitive to CO.';
            } else if (ppm <= 150) {
                return 'Members of sensitive groups may experience health effects. Limit outdoor exposure.';
            } else if (ppm <= 200) {
                return 'Everyone may begin to experience health effects. Avoid outdoor activities.';
            } else {
                return 'Health alert: everyone may experience serious health effects. Stay indoors.';
            }
        }
        
        function updateGreeting() {
            const hour = new Date().getHours();
            const greeting = document.getElementById('greeting');
        
            if (hour >= 5 && hour < 12) greeting.textContent = 'Good Morning';
            else if (hour >= 12 && hour < 17) greeting.textContent = 'Good Afternoon';
            else if (hour >= 17 && hour < 21) greeting.textContent = 'Good Evening';
            else greeting.textContent = 'Good Night';
        }
        
        function formatTimestamp(timestamp) {
            const date = new Date(timestamp);
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            return `${hours}:${minutes}`;
        }
        
        async function fetchData() {
            try {
                const response = await fetch('https://raw.githubusercontent.com/4211421036/qualityair/main/data.json');
                const data = await response.json();
        
                // Update main display
                document.getElementById('ppm-value').textContent = data.data.ppm.toFixed(1);
                document.getElementById('raw-value').textContent = data.data.raw_value;
                document.getElementById('air-quality-status').textContent = getAirQualityStatus(data.data.ppm);
                document.getElementById('timestamp').textContent = formatTimestamp(data.timestamp);
                document.getElementById('daily-recommendation').textContent = getRecommendation(data.data.ppm);
        
                // Update chart
                updateHistoryChart(data.timestamp, data.data.ppm, data.data.raw_value);
        
                // Update theme-based colors
                updateChartColors();
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }
        
        function updateChartColors() {
            const textColor = getComputedStyle(document.documentElement)
                .getPropertyValue('--text-primary');
            const gridColor = getComputedStyle(document.documentElement)
                .getPropertyValue('--border-color');
        
            historyChart.options.scales.y.grid.color = gridColor;
            historyChart.options.scales.x.grid.color = gridColor;
            historyChart.options.scales.y.ticks.color = textColor;
            historyChart.options.scales.x.ticks.color = textColor;
            historyChart.options.plugins.legend.labels.color = textColor;
            historyChart.update();
        }
        
        // Set current date
        document.getElementById('current-date').textContent = new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Initial setup
        updateGreeting();
        fetchData();
        
        // Update data every 5 seconds
        setInterval(fetchData, 5000);
        
        // Update greeting every minute
        setInterval(updateGreeting, 60000);
        
        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            const newTheme = e.matches ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateChartColors();
        });
      </script>
      <!-- page generated automatic: ${new Date().toLocaleString()} -->
    </body>
  </html>`;

  try {
    // Minify HTML yang dihasilkan
    const minifiedHtml = await minify(htmlContent, {
      collapseWhitespace: true,  // Menghapus spasi dan baris kosong
      removeComments: true,      // Menghapus komentar
      removeRedundantAttributes: true, // Menghapus atribut yang tidak perlu
      useShortDoctype: true,     // Menggunakan doctype singkat
      minifyJS: true,            // Minify JS
      minifyCSS: true            // Minify CSS
    });

    // Tentukan path untuk file HTML yang akan dihasilkan
    const outputPath = path.join(process.cwd(), 'index.html');

    // Simpan HTML yang telah di-minify ke file
    fs.writeFileSync(outputPath, minifiedHtml);
    console.log('File HTML telah dibuat dan di-minify di:', outputPath);
  } catch (error) {
    console.error('Error during minification:', error);
  }
}

function generateServiceWorker() {
  const cssFiles = ['style.css', 'all.min.css'].map((file) => {
    const filePath = path.join(process.cwd(), file); // Asumsi file berada di direktori kerja
    return generateHashedFileName(filePath);
  });
  const swContent = `
  // Service Worker for offline functionality
  const CACHE_NAME = 'co';
  const ASSETS = [
      '/',
      '/index.html',
      '/manifest.webmanifest',
      '/192x192.png',
      '/512x512.png',
      '/sw.js',
      ${cssFiles.map(file => `'/${file}'`).join(',\n')}
  ];

  // Install event
  self.addEventListener('install', evt => {
    evt.waitUntil(
      caches.open(CACHE_NAME)
        .then(cache => {
          console.log('Caching shell assets');
          return cache.addAll(ASSETS);
        })
        .catch(err => {
          console.error('Error caching assets:', err);
        })
    );
  });
  
  // Activate event
  self.addEventListener('activate', evt => {
    evt.waitUntil(
      caches.keys().then(keys => {
        return Promise.all(keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
        );
      })
    );
  });
  
  // Fetch event
  self.addEventListener('fetch', evt => {
    evt.respondWith(
      caches.match(evt.request)
        .then(cacheRes => {
          return cacheRes || fetch(evt.request)
            .then(fetchRes => {
              return caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(evt.request.url, fetchRes.clone());
                  return fetchRes;
                });
            });
        })
        .catch(() => {
          // Handle fetch errors or offline state
          if (evt.request.url.indexOf('.html') > -1) {
            return caches.match('/index.html');
          }
        })
    );
  });
  `;

  const outputPath = path.join(process.cwd(), 'sw.js');
  fs.writeFileSync(outputPath, swContent.trim());
  console.log('Service Worker file sw.js telah dibuat di:', outputPath);
}

function generateManifest() {
  const manifestContent = {
    id: "co",
    name: "Selamat Ulang Tahun",
    short_name: "Ulang Tahun",
    description: "Website offline untuk ucapan ulang tahun.",
    icons: [
      {
        src: "192x192.png",
        type: "image/png",
        sizes: "192x192"
      },
      {
        src: "512x512.png",
        type: "image/png",
        sizes: "512x512"
      }
    ],
    start_url: "/",
    display: "standalone",
     "screenshots": [
        {
            "src": "/345677.png",
            "sizes": "637x436",
        },
        {
            "src": "/345677.png",
            "sizes": "637x436"
        }
    ],
    "scope": "/",
    "orientation": "portrait"
  };

  const outputPath = path.join(process.cwd(), 'manifest.webmanifest');
  fs.writeFileSync(outputPath, JSON.stringify(manifestContent, null, 2));
  console.log('Manifest file manifest.webmanifest telah dibuat di:', outputPath);
}

generateHtml();
generateServiceWorker();
generateManifest();
