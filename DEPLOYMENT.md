# Cloudflare Workers Deployment Guide

## Prerequisites

1. Cloudflare account
2. Domain configured in Cloudflare (tunk.io)
3. Wrangler CLI installed: `npm install -g wrangler`

## Setup

### 1. Authenticate Wrangler
```bash
wrangler auth login
```

### 2. Configure Custom Domain
Update `wrangler.toml`:
```toml
[env.production]
routes = [
  { pattern = "avaruusmatikka.tunk.io/*", zone_name = "tunk.io" }
]
```

### 3. Set up KV Namespace (Optional)
```bash
# Create KV namespace for game data
wrangler kv:namespace create "GAME_DATA"
wrangler kv:namespace create "GAME_DATA" --preview

# Update wrangler.toml with the returned IDs
```

## Deployment Commands

### Development
```bash
# Start local development server
wrangler dev

# Preview changes
wrangler preview
```

### Production
```bash
# Deploy to production
wrangler deploy --env production

# Deploy with custom domain
wrangler deploy --env production --route "avaruusmatikka.tunk.io/*"
```

## Static Site Alternative

For simple static hosting without Worker logic:

1. Use `_worker.js` instead of `index.js`
2. Upload files directly to Cloudflare Pages
3. Configure custom domain in Pages dashboard

## Environment Variables

Set in Cloudflare Workers dashboard:
- `ENVIRONMENT`: production
- `DEBUG`: false

## Monitoring

Monitor the worker at:
- Cloudflare Workers dashboard
- Analytics & Logs
- Real User Monitoring (RUM)