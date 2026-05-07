# Environment Configuration Setup

## Overview

The TourTracker frontend uses environment variables to securely manage API keys and configuration. This guide explains how to set up your environment.

## Files

- **`.env.example`** - Template showing all required environment variables
- **`.env`** - Your local environment configuration (NEVER commit this to Git)
- **`.gitignore`** - Already configured to exclude `.env` files

## Setup Instructions

### 1. Get Your OpenRouteService API Key

1. Visit [OpenRouteService.org](https://openrouteservice.org/dev/#/signup)
2. Create a free account
3. Generate an API key from your dashboard
4. Copy the API key (you'll need it in step 3)

### 2. Configure Your Environment

Copy the template to create your local `.env` file:

```bash
# From the frontend directory
cp .env.example .env
```

### 3. Add Your API Key

Edit the `.env` file and paste your API key:

```env
# .env
VITE_ORS_API_KEY=your_actual_api_key_here
```

**Replace `your_actual_api_key_here` with your real API key.**

## Verification

Check that your setup is working:

```bash
# The app should load without API key errors
npm start

# Navigate to tour details to see the map load with route data
# If you see "API key not configured" error, verify your .env file is set correctly
```

## Environment File Structure

```
frontend/
├── .env                          # Local config (NEVER commit)
├── .env.example                  # Template (commit this)
├── src/
│   ├── environments/
│   │   ├── environment.ts        # Dev environment config
│   │   └── environment.prod.ts   # Production config
│   └── services/
│       └── map.service.ts        # Reads environment config
```

## How It Works

1. **Build Time**: When you run `npm start`, Vite reads `.env` variables
2. **Environment Exports**: `environment.ts` loads variables via `import.meta.env.VITE_*`
3. **MapService**: Injects environment config and uses the API key
4. **Error Handling**: If API key is missing, users see helpful error message

## For Different Environments

### Local Development
Use `.env` with your personal API key (not committed)

### CI/CD Pipeline
Set environment variables in your CI system:

```yaml
# Example: GitHub Actions
env:
  VITE_ORS_API_KEY: ${{ secrets.ORS_API_KEY }}
```

### Production Deployment
Use your hosting platform's secret management:

- **Vercel**: Add to Environment Variables in dashboard
- **Netlify**: Add to Build & Deploy → Environment
- **Docker**: Use build arguments or secrets
- **Traditional Server**: Set OS environment variables

## Variable Reference

| Variable Name | Required | Description | Example |
|---|---|---|---|
| `VITE_ORS_API_KEY` | Yes | OpenRouteService API key | `5b3ce3597851110001cf6248` |

## Troubleshooting

### "API key is not configured" Error

**Problem**: Map shows "API key not configured" message

**Solution**:
1. Verify `.env` file exists in `frontend/` directory
2. Check `VITE_ORS_API_KEY` is set and not empty
3. Restart dev server: `npm start`
4. Clear browser cache if needed

### "Unauthorized" Error

**Problem**: Map shows "Unauthorized" error, or 403 status in console

**Solution**:
1. Verify API key is correct (copy-paste from OpenRouteService)
2. Check API key hasn't expired
3. Verify API key has Geocoding and Directions APIs enabled
4. Check rate limits haven't been exceeded

### Changes to .env Not Taking Effect

**Problem**: Modified `.env` but changes don't appear

**Solution**:
1. Restart dev server: Press `Ctrl+C`, then run `npm start` again
2. Vite reads env files at startup
3. Hard refresh browser: `Ctrl+Shift+R`

## Adding More Environment Variables

To add new configuration:

1. **Add to `.env.example`**:
   ```env
   VITE_NEW_SETTING=example_value
   ```

2. **Add to `.env`**:
   ```env
   VITE_NEW_SETTING=your_value
   ```

3. **Reference in environment files**:
   ```typescript
   // environment.ts
   export const environment = {
     newSetting: import.meta.env.VITE_NEW_SETTING || 'default'
   };
   ```

4. **Use in services**:
   ```typescript
   import { environment } from '../environments/environment';
   const value = environment.newSetting;
   ```

## Further Reading

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Angular Environment Files](https://angular.io/guide/build)
- [OpenRouteService API Docs](https://openrouteservice.org/dev/#/api-docs)
