// Alternative simple worker for static hosting
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Get the path from the URL
    let path = url.pathname;
    
    // Default to index.html for root
    if (path === '/') {
      path = '/index.html';
    }
    
    try {
      // Fetch the static asset from the same origin
      const asset = await env.ASSETS.fetch(request);
      
      // Add custom headers for security and caching
      const response = new Response(asset.body, {
        status: asset.status,
        statusText: asset.statusText,
        headers: {
          ...asset.headers,
          'X-Frame-Options': 'DENY',
          'X-Content-Type-Options': 'nosniff',
          'X-XSS-Protection': '1; mode=block',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
          'Cache-Control': path.includes('.') ? 'public, max-age=31536000' : 'public, max-age=3600'
        }
      });
      
      return response;
    } catch (error) {
      return new Response('Asset not found', { status: 404 });
    }
  }
};