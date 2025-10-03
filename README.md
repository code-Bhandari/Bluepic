# Bluepic - AI Image Generator

A beautiful, self-contained web application for generating images from text prompts using AI. **Now with FREE Pollinations.AI integration - no API key required!**

## Features

✨ **FREE Image Generation** - Uses Pollinations.AI (no signup, no API key needed!)
🎨 **Style Presets** - Photorealistic, Illustration, Cyberpunk, Anime, Minimal, Watercolor
⚙️ **Advanced Controls** - Seed, guidance scale, steps, negative prompts
📱 **Fully Responsive** - Works on mobile, tablet, and desktop
♿ **Accessible** - Keyboard navigation, ARIA labels, proper contrast
📥 **Easy Download** - One-click image download
🖼️ **Gallery** - View your last 6 generated images
🎯 **Prompt Helpers** - Quick-fill example prompts
🌈 **Beautiful UI** - Animated gradient background with twinkling stars

## How It Works

### FREE Image Generation with Pollinations.AI

The app is configured to use **Pollinations.AI** by default, which provides:
- ✅ **Completely FREE** image generation
- ✅ **No signup** needed
- ✅ **High quality** images using Stable Diffusion
- ✅ **Fast** generation times

Just type your prompt and click generate!

## Configuration Options

Edit the `CONFIG` object in `script.js`:

```javascript
const CONFIG = {
    // Use FREE Pollinations.AI (enabled by default)
    USE_POLLINATIONS: true,
    
    // Alternative: Use your own backend
    API_ENDPOINT: '/api/generate',
    
    // Mock mode for UI testing only
    MOCK_MODE: false,
    
    // Customize image sizes
    IMAGE_SIZES: {
        small: { width: 512, height: 512 },
        medium: { width: 1024, height: 1024 },
        large: { width: 1536, height: 1536 }
    },
    
    // Style presets
    STYLE_PRESETS: {
        photorealistic: ', photorealistic, highly detailed, 8k, professional photography',
        // ... add your own presets
    }
};
```

## Alternative APIs

### Option 1: Pollinations.AI (Default - FREE!)

**Already configured!** Just use the app as-is.

- API: `https://image.pollinations.ai/`
- Cost: FREE forever
- Signup: Not required
- Quality: High (Stable Diffusion Flux model)

### Option 2: Use Your Own Backend

If you want to use other services like Stability AI, Replicate, or OpenAI:

1. Set `USE_POLLINATIONS: false` in CONFIG
2. Create a backend proxy (see example below)
3. Set your backend URL in `API_ENDPOINT`

**Example Backend (Node.js):**

```javascript
// server.js
const express = require('express');
const fetch = require('node-fetch');
const app = express();

app.use(express.json());
app.use(express.static('public'));

app.post('/api/generate', async (req, res) => {
    try {
        const { prompt, negative_prompt, width, height } = req.body;
        
        // Example: Stability AI
        const response = await fetch('https://api.stability.ai/v1/generation/...', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.STABILITY_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text_prompts: [{ text: prompt }],
                width, height
            })
        });
        
        const data = await response.json();
        
        res.json({
            image_base64: `data:image/png;base64,${data.artifacts[0].base64}`,
            meta: {
                seed: data.artifacts[0].seed,
                width, height
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000);
```

## API Comparison

| API | Cost | Signup | Quality | Speed |
|-----|------|--------|---------|-------|
| **Pollinations.AI** | FREE | No | High | Fast |
| Stability AI | $0.002/img | Yes | Very High | Fast |
| OpenAI DALL-E | $0.02/img | Yes | High | Medium |
| Replicate | Varies | Yes | High | Varies |

## Customization

### Change Colors

Edit CSS variables in `styles.css`:

```css
:root {
    --primary-blue: #4f46e5;
    --primary-indigo: #6366f1;
    /* ... more colors */
}
```

### Add Custom Style Presets

In `script.js`:

```javascript
STYLE_PRESETS: {
    vintage: ', vintage photography, film grain, retro aesthetic',
    scifi: ', science fiction, futuristic, high tech, cinematic'
}
```

Then add buttons in `index.html`:

```html
<button type="button" class="preset-pill" data-style="vintage">Vintage</button>
<button type="button" class="preset-pill" data-style="scifi">Sci-Fi</button>
```

### Adjust Animation Speed

In `styles.css`:

```css
@keyframes gradientShift {
    /* Change 20s to your preferred speed */
}

@keyframes twinkle {
    /* Adjust star twinkle duration */
}
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Tips

- Twinkling stars use CSS-only animations (GPU accelerated)
- Gradient animation is optimized with `transform` and `opacity`
- Gallery stores images in memory (not localStorage)
- Images are cached in browser automatically

## Troubleshooting

### Images Not Generating?

1. **Check internet connection** - Pollinations.AI requires internet
2. **Check browser console** for error messages
3. **Try a different browser** if issues persist
4. **Verify the prompt** isn't empty

### Gallery Not Saving?

- Gallery uses in-memory storage (will clear on page refresh)
- This is intentional for Claude.ai compatibility
- To persist, modify code to use localStorage (if not on Claude.ai)

## Deployment

### Static Hosting (Free!)

Deploy to:
- **GitHub Pages** (free)
- **Netlify** (free tier)
- **Vercel** (free tier)
- **Cloudflare Pages** (free)

Just upload the 3 files - no build step needed!

### With Custom Backend

1. Deploy backend to Railway, Heroku, or your VPS
2. Deploy frontend to any static host
3. Update `API_ENDPOINT` in script.js

## License

Free to use and modify for personal and commercial projects.


**Happy generating! 🎨✨**.

## Connecting to a Real API

### Step 1: Choose Your Image Generation Provider

Popular options:
- **Stability AI** (Stable Diffusion): https://stability.ai/
- **Replicate**: https://replicate.com/
- **OpenAI DALL-E**: https://openai.com/dall-e-2
- **Midjourney API** (unofficial): Various providers
- **Your own model**: Deploy your own Stable Diffusion

### Step 2: Create a Backend Proxy

**⚠️ IMPORTANT: Never put API keys in client-side JavaScript!**

Create a backend server (Node.js example):

```javascript
// server.js
const express = require('express');
const fetch = require('node-fetch');
const app = express();

app.use(express.json());
app.use(express.static('public')); // Serve your HTML/CSS/JS

// API endpoint that proxies to Stability AI (example)
app.post('/api/generate', async (req, res) => {
    try {
        const { prompt, negative_prompt, width, height, steps, seed, guidance } = req.body;
        
        // Call your image generation API
        const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.STABILITY_API_KEY}` // Use environment variables!
            },
            body: JSON.stringify({
                text_prompts: [
                    { text: prompt, weight: 1 },
                    { text: negative_prompt || '', weight: -1 }
                ],
                cfg_scale: guidance,
                height: height,
                width: width,
                steps: steps,
                seed: seed || 0
            })
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Convert to format expected by frontend
        res.json({
            image_base64: `data:image/png;base64,${data.artifacts[0].base64}`,
            meta: {
                seed: data.artifacts[0].seed,
                width: width,
                height: height,
                nsfw: data.artifacts[0].finishReason === 'CONTENT_FILTERED'
            }
        });
        
    } catch (error) {
        console.error('Generation error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
```

### Step 3: Update Configuration

In `script.js`, update the configuration:

```javascript
const CONFIG = {
    API_ENDPOINT: '/api/generate', // or 'https://your-backend.com/api/generate'
    MOCK_MODE: false, // Set to false to use real API
    // ... rest of config
};
```

### Alternative: Direct API Integration (Less Secure)

If you're running locally and understand the security implications:

```javascript
async function generateImage(prompt, options) {
    const response = await fetch('https://api.stability.ai/v1/generation/...', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer YOUR_API_KEY' // NOT RECOMMENDED for production!
        },
        body: JSON.stringify({
            // your API's expected format
        })
    });
    
    // Process response...
}
```

## API Response Format

Your backend should return JSON in this format:

```json
{
  "image_base64": "data:image/png;base64,iVBORw0KGgoAAAANS...",
  "meta": {
    "seed": 123456,
    "width": 1024,
    "height": 1024,
    "nsfw": false
  }
}
```

Or alternatively:

```json
{
  "image_url": "https://your-cdn.com/generated-image.png",
  "meta": {
    "seed": 123456,
    "width": 1024,
    "height": 1024,
    "nsfw": false
  }
}
```

## Configuration Options

Edit `CONFIG` object in `script.js`:

```javascript
const CONFIG = {
    API_ENDPOINT: '/api/generate',
    MOCK_MODE: true,
    IMAGE_SIZES: {
        small: { width: 512, height: 512 },
        medium: { width: 1024, height: 1024 },
        large: { width: 1536, height: 1024 }
    },
    ASPECT_RATIOS: {
        '1:1': { width: 1, height: 1 },
        '3:2': { width: 3, height: 2 },
        '16:9': { width: 16, height: 9 },
        '2:3': { width: 2, height: 3 }
    },
    STYLE_PRESETS: {
        photorealistic: ', photorealistic, highly detailed, 8k',
        // ... customize these for your use case
    },
    MAX_GALLERY_ITEMS: 6
};
```

## Customization

### Change Colors

Edit CSS variables in `styles.css`:

```css
:root {
    --primary-blue: #4f46e5;
    --primary-indigo: #6366f1;
    /* ... more colors */
}
```

### Adjust Animations

Animation speeds can be tuned in `styles.css`:

```css
@keyframes gradientShift {
    /* Change animation duration here */
}
```

### Add More Style Presets

Add to `CONFIG.STYLE_PRESETS` in `script.js`:

```javascript
STYLE_PRESETS: {
    oil_painting: ', oil painting, canvas texture, impressionist',
    sketch: ', pencil sketch, hand drawn, black and white'
}
```

Then add corresponding buttons in `index.html`.

## License

Free to use and modify for personal and commercial projects.
---

**Need help?** Check the inline comments in the code for more details!
