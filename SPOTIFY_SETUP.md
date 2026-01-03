# 🎵 How to Set Up Spotify API

Follow these steps to enable music search functionality:

## Step 1: Create Spotify Developer Account

1. Go to https://developer.spotify.com/dashboard
2. Log in with your Spotify account (or create one if you don't have it)
3. Click **"Create app"**

## Step 2: Configure Your App

Fill in the app details:
- **App name:** Pegasus Music Visualizer (or any name you want)
- **App description:** Audio-reactive particle visualizer with music search
- **Redirect URIs:** `http://localhost:5175/callback`
- **Which API/SDKs are you planning to use?** Check "Web API"
- Accept the Terms of Service
- Click **"Save"**

## Step 3: Get Your Credentials

1. After creating the app, you'll see your dashboard
2. Click **"Settings"** button (top right)
3. You'll see:
   - **Client ID** - Copy this
   - **Client Secret** - Click "View client secret" and copy it

**⚠️ IMPORTANT:** Keep your Client Secret private! Never share it or commit it to Git.

## Step 4: Add Credentials to Your Project

1. In your project root (`d:\pegasus\`), create a file called `.env`
2. Add these lines (replace with your actual values):

```env
VITE_SPOTIFY_CLIENT_ID=your_client_id_here
VITE_SPOTIFY_CLIENT_SECRET=your_client_secret_here
```

**Example:**
```env
VITE_SPOTIFY_CLIENT_ID=abc123def456ghi789jkl012mno345pq
VITE_SPOTIFY_CLIENT_SECRET=xyz789uvw456rst123opq890lmn567ij
```

## Step 5: Update .gitignore

Make sure `.env` is in your `.gitignore` file so you don't accidentally commit your secrets:

1. Open `d:\pegasus\.gitignore`
2. Ensure this line exists:
```
.env
```

## Step 6: Update MusicSearch Component

Open `d:\pegasus\src\components\MusicSearch.jsx` and add the Spotify import at the top:

```javascript
import { searchSpotifyTracks } from '../api/spotify'
```

Then update the `performSearch` function (around line 70):

```javascript
const performSearch = async (query) => {
  if (!query || query.trim() === '') {
    setSearchResults([])
    setIsSearching(false)
    return
  }

  setIsSearching(true)
  
  try {
    // Search Spotify
    const results = await searchSpotifyTracks(query, 20)
    setSearchResults(results)
    console.log('[MusicSearch] Found', results.length, 'tracks')
  } catch (error) {
    console.error('[MusicSearch] Search failed:', error)
    setSearchResults([])
    alert('Failed to search Spotify. Check console for details.')
  } finally {
    setIsSearching(false)
  }
}
```

## Step 7: Restart Dev Server

1. Stop your dev server (Ctrl+C in terminal)
2. Restart it:
```bash
npm run dev
```

3. Open http://localhost:5175
4. Click "Click to Enter"
5. Type a song name in the search bar

## ✅ Testing

Search for any song, artist, or album. You should see results with:
- Song title
- Artist name
- Album artwork
- 30-second preview

**Note:** Spotify's free tier only provides 30-second previews. For full tracks, you'd need:
- Spotify Premium account
- User authentication (more complex setup)
- Backend server for token management

## 🔧 Troubleshooting

### "Spotify API credentials not configured"
- Make sure `.env` file exists in project root
- Check that variable names are exactly: `VITE_SPOTIFY_CLIENT_ID` and `VITE_SPOTIFY_CLIENT_SECRET`
- Restart dev server after creating/editing `.env`

### "Spotify auth failed: 401"
- Your Client ID or Client Secret is incorrect
- Go back to Spotify Dashboard → Settings and double-check your credentials

### No search results
- Check browser console for errors
- Make sure your Spotify app is not in "Development Mode" restrictions
- Try searching for popular artists like "Beatles" or "Drake"

### CORS errors
- This shouldn't happen with our setup, but if it does:
- Make sure you're accessing via `http://localhost:5175` (not file://)
- Check that your Spotify app has the correct redirect URI

## 📊 API Limits

Spotify free tier limits:
- **Client Credentials Flow:** Simple but only 30-second previews
- **Rate Limits:** Generous (should not hit them with normal use)
- **No authentication required:** Works immediately after setup

## 🚀 Current File Locations

Your Spotify integration files are at:
- **API Module:** `d:\pegasus\src\api\spotify.js`
- **Environment Variables:** `d:\pegasus\.env` (create this file)
- **Component:** `d:\pegasus\src\components\MusicSearch.jsx` (update this)

That's it! After following these steps, your search bar will load real Spotify tracks.
