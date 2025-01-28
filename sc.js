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
  const extname = path.extname(filePath); // Menyimpan ekstensi file (misalnya .js)
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

  // Daftar file JavaScript yang digunakan
  const jsFiles = ['main.js'];

  // Menghasilkan nama file hash untuk setiap file JS
  const hashedJsFiles = jsFiles.map(file => {
    const originalPath = path.join(process.cwd(), file);
    return generateHashedFileName(originalPath); // Nama hash file, tidak perlu membuat salinan
  });

  const cssFiles = ['style.css', 'all.min.css'];
  const hashedCssFiles = cssFiles.map((file) => {
    const filePath = path.join(process.cwd(), file); // Asumsi file berada di direktori kerja
    return generateHashedFileName(filePath);
  });

  // CSP dengan strict-dynamic
  const cspContent = [
      `style-src 'self' 'nonce-${nonce}' 'unsafe-inline' https://4211421036.github.io http://4211421036.github.io`,
      "object-src 'none'",
      "base-uri 'self'",
      "img-src 'self' data: https://4211421036.github.io http://4211421036.github.io",
      "default-src 'self' https://4211421036.github.io http://4211421036.github.io",
      `script-src 'self' 'unsafe-inline' 'nonce-${nonce}' 'strict-dynamic' ${hashedJsFiles
        .map((file) => `'sha384-${generateIntegrityHash(path.join(process.cwd(), file))}'`)
        .join(' ')} https://4211421036.github.io http://4211421036.github.io;`,
      "font-src 'self' https://4211421036.github.io http://4211421036.github.io",
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
      <link rel="manifest" href="/manifest.webmanifest">
      <link rel="canonical" href="https://4211421036.github.io/qualityair/">
      <link rel="manifest" href="manifest.webmanifest" crossorigin="use-credentials">
      <meta http-equiv="Content-Security-Policy" content="${cspContent}">
      ${hashedCssFiles
          .map(
            (file) =>
              `<link rel="stylesheet" nonce="${nonce}" href="${file}" integrity="sha384-${generateIntegrityHash(
                path.join(process.cwd(), file)
              )}" crossorigin="anonymous">`
          )
          .join('\n')}`;

  // Mengelola hashed JS files
  hashedJsFiles.forEach((file) => {
    const filePath = path.join(process.cwd(), file); // Lokasi file asli
    const hashedFileName = generateHashedFileName(filePath);
  
    // Verifikasi hash integritas
    const integrityHash = generateIntegrityHash(filePath);
    htmlContent += `
      <script src="${hashedFileName}" nonce="${nonce}" integrity="sha384-${integrityHash}" crossorigin="anonymous" defer></script>
    `;
  });
  
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
  const hashedJsFiles = ['main.js'].map(file => {
    const originalPath = path.join(process.cwd(), file);
    return generateHashedFileName(originalPath); // Get hashed file names
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
      // Dynamically add each hashed JS file to the cache list
      ${hashedJsFiles.map(file => `'/${file}'`).join(',\n')}
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
