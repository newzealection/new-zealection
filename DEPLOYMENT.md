# Netlify Deployment Guide

## Prerequisites
- A Supabase project with the required database tables
- Your Supabase project URL and anon key

## Environment Variables Setup

In your Netlify dashboard, go to **Site settings > Environment variables** and add the following:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-from-supabase-dashboard
```

## Deployment Steps

1. **Connect your repository** to Netlify
2. **Set build settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. **Add environment variables** (see above)
4. **Deploy**

## Troubleshooting

### Common Issues:

1. **Build fails**: Check that all dependencies are in `package.json`
2. **Environment variables not working**: Ensure they start with `VITE_`
3. **Routing issues**: The `netlify.toml` file handles SPA routing
4. **Supabase connection errors**: Verify your environment variables are correct

### Build Commands

- `npm run build` - Production build
- `npm run build:dev` - Development build
- `npm run preview` - Preview production build locally

## File Structure

The following files are configured for Netlify deployment:

- `netlify.toml` - Netlify configuration
- `public/_redirects` - URL redirects for SPA
- `vite.config.ts` - Build configuration
- `package.json` - Dependencies and scripts 