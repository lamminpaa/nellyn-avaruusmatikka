// Cloudflare Worker for Nellyn Avaruusmatikka
// Serves static files and handles game data storage

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Handle CORS for development
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // API endpoints for game data
      if (pathname.startsWith('/api/')) {
        return handleAPI(request, env, pathname, corsHeaders);
      }

      // Serve static files
      return serveStaticFile(pathname, corsHeaders);
    } catch (error) {
      return new Response('Server Error: ' + error.message, {
        status: 500,
        headers: corsHeaders
      });
    }
  }
};

async function handleAPI(request, env, pathname, corsHeaders) {
  const method = request.method;

  if (pathname === '/api/stats' && method === 'POST') {
    // Save player statistics
    try {
      const stats = await request.json();
      const playerId = stats.playerId || 'anonymous_' + Date.now();
      
      await env.GAME_DATA?.put(
        `player_stats_${playerId}`, 
        JSON.stringify({
          ...stats,
          timestamp: new Date().toISOString()
        })
      );

      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
  }

  if (pathname === '/api/leaderboard' && method === 'GET') {
    // Get leaderboard data
    try {
      // In a real implementation, you'd fetch and aggregate player stats
      const mockLeaderboard = [
        { name: "Tähtimatemaatikko", score: 1500, level: 8 },
        { name: "Avaruusneero", score: 1200, level: 6 },
        { name: "Planeettalaskija", score: 980, level: 5 }
      ];

      return new Response(JSON.stringify(mockLeaderboard), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
  }

  return new Response('Not Found', {
    status: 404,
    headers: corsHeaders
  });
}

function serveStaticFile(pathname, corsHeaders) {
  // Map paths to files
  const fileMap = {
    '/': getHTMLContent(),
    '/index.html': getHTMLContent(),
    '/script3d.js': getScript3DContent(),
    '/script.js': getScriptContent(),
    '/styles.css': getStylesContent()
  };

  const content = fileMap[pathname];
  
  if (!content) {
    return new Response('Not Found', {
      status: 404,
      headers: corsHeaders
    });
  }

  // Determine content type
  let contentType = 'text/html';
  if (pathname.endsWith('.js')) {
    contentType = 'application/javascript';
  } else if (pathname.endsWith('.css')) {
    contentType = 'text/css';
  }

  return new Response(content, {
    headers: {
      'Content-Type': contentType + '; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
      ...corsHeaders
    }
  });
}

// Note: In production, you'd want to store these in KV or fetch from GitHub
function getHTMLContent() {
  return `<!DOCTYPE html>
<html lang="fi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Avaruusmatikka - 3D Tähtikarttaseikkailu</title>
    <link rel="stylesheet" href="styles.css">
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
                <div id="problem"></div>
                <input type="number" id="answer-input" placeholder="Vastaus">
                <button id="submit-answer">Lähetä vastaus</button>
            </div>
            
            <div id="feedback"></div>
            
            <div id="progress-info">
                <p>Oikeat vastaukset vievät sinut uusiin tähtiin! ⭐</p>
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
    
    <script src="https://cdnjs.cloudflare.com/ajax/libs/tween.js/18.6.4/tween.umd.js"></script>
    <script src="script3d.js"></script>
</body>
</html>`;
}

function getScript3DContent() {
  // In production, you'd fetch this from your actual script3d.js file
  return '// Script3D content would be loaded here';
}

function getScriptContent() {
  return '// Script content would be loaded here';
}

function getStylesContent() {
  return '/* CSS styles would be loaded here */';
}