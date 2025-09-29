# Three.js Scroll Animation Landing Page

A professional landing page featuring scroll-driven 3D storytelling with Three.js and GSAP ScrollTrigger. The experience tells a visual story: forest scene with fireflies → camera zooms into orange → orange morphs into company logo.

## 🚀 Quick Start

### Option 1: Direct HTML (Recommended)

1. Open `index_new.html` in your browser
2. The page loads all dependencies from CDN
3. Assets are served locally from the project folder
4. **No build process required!**

### Option 2: Local Development Server

If you prefer a development server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js (if you have it)
npx serve

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000/index_new.html`

## 📁 Project Structure

```
threejs-scroll-animation-demo-main/
├── index_new.html          # Main HTML file with CDN imports
├── styles_new.css          # Complete responsive styling
├── src/
│   ├── main.js            # Main application controller
│   ├── loader.js          # Asset loading system
│   ├── fireflies.js       # Particle system
│   └── animations.js      # GSAP ScrollTrigger logic
├── assets/
│   └── models/            # Your 3D models (.glb/.gltf)
│       ├── forest.glb     # Forest scene model
│       ├── orange.glb     # Orange 3D model
│       └── logo.glb       # Company logo model
└── README.md              # This file
```

## 🎨 Asset Setup

### Required 3D Models

Place your `.glb` or `.gltf` files in the `assets/models/` folder:

- **`forest.glb`** - Forest scene with trees and environment
- **`orange.glb`** - 3D orange model for transformation
- **`logo.glb`** - Your company logo as 3D model

### Model Requirements

- **Format**: `.glb` (preferred) or `.gltf`
- **Size**: Keep under 10MB per model for web performance
- **Scale**: Models should be reasonably sized (1-5 units)
- **Origin**: Models should be centered at origin (0,0,0)

### Creating Models in Blender

#### Basic Model Setup:

1. Create your model in Blender
2. Apply all transforms: `Ctrl+A` → All Transforms
3. Set origin to center: `Shift+Ctrl+Alt+C` → Origin to Center of Mass
4. Export as `.glb`: File → Export → glTF 2.0

#### For Orange → Logo Morph:

If you want smooth morphing (advanced):

1. Create orange model as base mesh
2. Duplicate and modify to create logo shape
3. Add Shape Key: Properties → Object Data → Shape Keys
4. Set logo shape as shape key target
5. Export with shape keys enabled

Otherwise, the system will use crossfade transition automatically.

## 🎬 Animation Timeline

The scroll-driven story unfolds in 4 sections:

1. **Forest Scene (0-25%)** - Initial forest view with fireflies
2. **Zoom to Orange (25-50%)** - Camera focuses on the orange
3. **Orange Focus (50-75%)** - Close-up of rotating orange
4. **Logo Transform (75-100%)** - Orange morphs/transitions to logo

## ⚙️ Customization

### Changing Models

Edit `src/main.js` and update the file paths:

```javascript
// Update these paths in loadAssets()
const forestModel = await this.loader.loadGLTF(
  "./assets/models/your-forest.glb"
);
const orangeModel = await this.loader.loadGLTF(
  "./assets/models/your-orange.glb"
);
const logoModel = await this.loader.loadGLTF("./assets/models/your-logo.glb");
```

### Adjusting Animation Timing

Modify `src/animations.js`:

```javascript
// Change section percentages in setupScrollAnimations()
// Current: 0-25%, 25-50%, 50-75%, 75-100%
// Example: Make orange section longer
mainTimeline.to(
  this.camera.position,
  {
    duration: 2, // Increased duration
    // ... rest of animation
  },
  1
);
```

### Styling Updates

Edit `styles_new.css` for:

- Color schemes
- Typography
- Button styles
- Responsive breakpoints
- Loading screen animations

## 🔧 Technical Features

- **Zero Build Process**: Direct HTML with CDN imports
- **Responsive Design**: Mobile and desktop optimized
- **Loading Screen**: Progress indicator for asset loading
- **Particle System**: Custom firefly effects with canvas textures
- **Scroll Sync**: GSAP ScrollTrigger for smooth animations
- **Fallback Support**: Automatic crossfade if morph targets unavailable
- **Performance**: Device pixel ratio limiting for mobile

## 📱 Browser Support

- ✅ Chrome 60+
- ✅ Firefox 60+
- ✅ Safari 12+
- ✅ Edge 79+
- ⚠️ Mobile: iOS Safari 12+, Chrome Mobile 60+

WebGL is required for 3D rendering.

## 🛠️ Development

### Adding New Animations

1. Create new methods in `ScrollAnimations` class
2. Register them in `setupScrollAnimations()`
3. Use GSAP timeline for complex sequences

### Performance Optimization

- Use `.glb` format (smaller than `.gltf`)
- Optimize textures (1024x1024 max recommended)
- Limit polygon count (10K triangles per model max)
- Test on mobile devices

### Debugging

Open browser DevTools and look for:

- ✅ "🎮 Three.js app initialized"
- ✅ "📦 All assets loaded successfully"
- ✅ "📜 Scroll animations initialized"

## 🎯 Deployment

### GitHub Pages

1. Push to your repository
2. Enable GitHub Pages in Settings
3. Set source to main branch
4. Your page will be available at `https://username.github.io/repo-name/index_new.html`

### Custom Domain

1. Add `CNAME` file with your domain
2. Update DNS settings to point to GitHub Pages
3. Enable HTTPS in repository settings

## 🤝 Credits

- **Three.js** - 3D graphics library
- **GSAP** - Animation library with ScrollTrigger
- **Vite** - Development server (optional)

Built with ❤️ for immersive web experiences.
npm run dev

```

```
