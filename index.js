// Cloudflare Worker for Nellyn Avaruusmatikka
// Simple static file server

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Handle CORS
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': 'public, max-age=3600'
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Serve static files
      return await serveStaticFile(request, pathname, corsHeaders);
    } catch (error) {
      return new Response('Server Error: ' + error.message, {
        status: 500,
        headers: corsHeaders
      });
    }
  }
};

async function serveStaticFile(request, pathname, corsHeaders) {
  // Default to index.html for root
  if (pathname === '/') {
    pathname = '/index.html';
  }

  // Try to fetch the file from the origin (GitHub or similar)
  const assetUrl = `https://raw.githubusercontent.com/lamminpaa/nellyn-avaruusmatikka/main${pathname}`;
  
  try {
    const response = await fetch(assetUrl);
    
    if (!response.ok) {
      return new Response('Not Found', {
        status: 404,
        headers: corsHeaders
      });
    }

    const content = await response.text();
    
    // Determine content type
    let contentType = 'text/html';
    if (pathname.endsWith('.js')) {
      contentType = 'application/javascript';
    } else if (pathname.endsWith('.css')) {
      contentType = 'text/css';
    } else if (pathname.endsWith('.json')) {
      contentType = 'application/json';
    }

    return new Response(content, {
      headers: {
        'Content-Type': contentType + '; charset=utf-8',
        ...corsHeaders
      }
    });
  } catch (error) {
    // Fallback - serve a minimal version if GitHub is not accessible
    if (pathname === '/index.html') {
      return new Response(getMinimalHTML(), {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          ...corsHeaders
        }
      });
    }
    
    return new Response('Asset not found', {
      status: 404,
      headers: corsHeaders
    });
  }
}

function getMinimalHTML() {
  return `<!DOCTYPE html>
<html lang="fi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Avaruusmatikka - 3D Tähtikarttaseikkailu</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Arial', sans-serif;
            background: linear-gradient(135deg, #0c1445 0%, #1a2980 50%, #26d0ce 100%);
            min-height: 100vh;
            color: white;
            overflow-x: hidden;
        }
        #game-container {
            display: flex;
            flex-direction: column;
            min-height: 100vh;
        }
        header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px;
            background: rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(10px);
        }
        header h1 {
            font-size: 2.5rem;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
        }
        #score, #level {
            font-size: 1.2rem;
            background: rgba(255, 255, 255, 0.1);
            padding: 10px 15px;
            border-radius: 20px;
            border: 2px solid rgba(255, 255, 255, 0.2);
        }
        #mindmap-container {
            flex: 1;
            display: flex;
            justify-content: center;
            align-items: center;
            position: relative;
            padding: 20px;
            background: transparent;
        }
        #three-scene {
            width: 100%;
            height: 500px;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }
        #game-panel {
            background: rgba(0, 0, 0, 0.4);
            padding: 30px;
            border-top: 3px solid rgba(255, 255, 255, 0.2);
        }
        #problem-container {
            text-align: center;
            margin-bottom: 30px;
        }
        #problem-container h2 {
            font-size: 1.5rem;
            margin-bottom: 20px;
            color: #87CEEB;
        }
        #problem {
            font-size: 2rem;
            margin: 20px 0;
            padding: 20px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            border: 2px solid rgba(135, 206, 235, 0.5);
        }
        #answer-input {
            font-size: 1.5rem;
            padding: 15px;
            margin: 10px;
            border: none;
            border-radius: 10px;
            background: rgba(255, 255, 255, 0.9);
            color: #333;
            text-align: center;
            width: 200px;
        }
        #submit-answer {
            font-size: 1.2rem;
            padding: 15px 30px;
            margin: 10px;
            background: linear-gradient(45deg, #FF6B6B, #4ECDC4);
            color: white;
            border: none;
            border-radius: 25px;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        #submit-answer:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        }
        #feedback {
            text-align: center;
            font-size: 1.3rem;
            margin: 20px 0;
            padding: 15px;
            border-radius: 10px;
            transition: all 0.3s ease;
        }
        .feedback-correct {
            background: rgba(76, 175, 80, 0.3);
            border: 2px solid #4CAF50;
            color: #A5D6A7;
        }
        .feedback-wrong {
            background: rgba(244, 67, 54, 0.3);
            border: 2px solid #f44336;
            color: #FFCDD2;
        }
        #progress-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-top: 30px;
        }
        #gravity-legend, #pirate-info {
            background: rgba(0, 0, 0, 0.3);
            padding: 20px;
            border-radius: 15px;
            border: 2px solid rgba(255, 255, 255, 0.1);
        }
        #gravity-legend h3, #pirate-info h3 {
            color: #87CEEB;
            margin-bottom: 15px;
            font-size: 1.2rem;
        }
        .legend-item {
            margin: 10px 0;
            font-size: 1rem;
            opacity: 0.9;
        }
        @media (max-width: 768px) {
            #progress-info {
                grid-template-columns: 1fr;
            }
            header {
                flex-direction: column;
                gap: 10px;
            }
            header h1 {
                font-size: 2rem;
            }
        }
    </style>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
</head>
<body>
    <div id="game-container">
        <header>
            <h1>🚀 Avaruusmatikka</h1>
            <div id="score">Pisteet: <span id="score-value">0</span></div>
            <div id="level">Taso: <span id="level-value">1</span></div>
        </header>
        
        <div id="mindmap-container">
            <div id="three-scene"></div>
        </div>
        
        <div id="game-panel">
            <div id="problem-container">
                <h2>Ratkaise tehtävä päästäksesi eteenpäin:</h2>
                <div id="problem">Ladataan...</div>
                <input type="number" id="answer-input" placeholder="Vastaus">
                <button id="submit-answer">Lähetä vastaus</button>
            </div>
            
            <div id="feedback"></div>
            
            <div id="progress-info">
                <div id="gravity-legend">
                    <h3>Gravitaatio näyttää vaikeusasteen:</h3>
                    <div class="legend-item">🟢 Vihreä = Helppo</div>
                    <div class="legend-item">🟡 Keltainen = Keskitaso</div>
                    <div class="legend-item">🟠 Oranssi = Haastava</div>
                    <div class="legend-item">🔴 Punainen = Vaikea</div>
                    <div class="legend-item">🟣 Violetti = Mestari</div>
                </div>
                <div id="pirate-info">
                    <h3>🏴‍☠️ Avaruusmerirosvot:</h3>
                    <div class="legend-item">💎 Syövät planeettojen älypölyä</div>
                    <div class="legend-item">⚔️ Vaikeuttavat peliä lähestyessään</div>
                    <div class="legend-item">🛡️ Älypöly pakenee merirosvoilta</div>
                </div>
            </div>
        </div>
    </div>
    
    <div id="version-info">v1.1.0</div>
    
    <script src="https://cdnjs.cloudflare.com/ajax/libs/tween.js/18.6.4/tween.umd.js"></script>
    <script>
        // Try to load the full script3d.js, fallback to simple version
        fetch('/script3d.js')
            .then(response => response.text())
            .then(script => {
                const scriptElement = document.createElement('script');
                scriptElement.textContent = script;
                document.body.appendChild(scriptElement);
            })
            .catch(() => {
                // Simple fallback game
                document.getElementById('problem').textContent = 'Avaruusmatikka latautuu...';
                console.log('Loading full 3D game...');
            });
    </script>
</body>
</html>`;
}