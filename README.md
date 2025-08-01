# Family Photo Album Timeline 📸

A premium, responsive static website to showcase your family's precious moments through a sophisticated interactive timeline. Built with cutting-edge vanilla HTML, CSS, and JavaScript featuring glass morphism design, advanced animations, and virtual scrolling for optimal performance.

## ✨ Premium Features

- 🎯 **Modern Interactive Timeline**: Glass morphism design with parallax effects and smooth animations
- 🔍 **Advanced Smart Filtering**: Multi-criteria filtering by year, tags, and time with real-time updates
- 🖼️ **Enhanced Gallery Experience**: Multiple images per moment with lightbox navigation and thumbnails
- 📱 **Ultra-Responsive Design**: Optimized for all devices with touch-friendly interactions
- 🎨 **Premium Visual Design**: Glass morphism, backdrop blur, gradient overlays, and micro-interactions
- ⚡ **High-Performance**: Virtual scrolling, intersection observer, and optimized for 50+ moments
- 🏷️ **Intelligent Tag System**: Multi-select with AND logic and animated feedback
- 📊 **Real-time Analytics**: Dynamic moment count and scroll progress indicator
- 🎭 **Advanced Animations**: Intersection observer-based reveals, staggered animations, and smooth transitions
- 🗓️ **Google Photos Style Navigator**: Vertical scroll indicator with period markers and click-to-scroll functionality
- 🌐 **Production-Ready**: Optimized for GitHub Pages with modern browser features

📋 **For Complete Feature List**: See [FEATURES.md](FEATURES.md) for detailed implementation status and technical specs.

## 💻 How to Run Locally

### Option 1: HTTP Server (Recommended)
```bash
# Clone this repository
git clone <your-repo-url>
cd LifeLine

# Start local server to avoid CORS issues
python3 -m http.server 8000

# Open in browser
# Visit: http://localhost:8000
```

### Option 2: Direct File Access
1. Clone this repository
2. Open `index.html` directly in your browser
3. Note: May have CORS limitations with JSON loading

## 🌐 How to Deploy (GitHub Pages)

1. **Enable GitHub Pages**:
   - Go to repo → Settings → Pages
   - Select `main` branch, root folder
   - Save settings

2. **Access Your Site**:
   - Visit: `https://vaagul.github.io/LifeLine/`
   - Your live Family Photo Timeline!

3. **Custom Domain** (Optional):
   - Add `CNAME` file with your domain
   - Configure DNS settings

## 📁 Project Structure

```
LifeLine/
├── index.html              # Main HTML file
├── css/
│   └── styles.css          # All styling and responsive design
├── js/
│   └── script.js           # Timeline functionality and interactions
├── data/
│   └── moments.json        # Family moments data
├── README.md               # This file
├── FEATURES.md            # Complete feature tracking and implementation details
└── copilot-instructions.md # Development guidelines
```

## 📝 Adding New Moments

Edit `data/moments.json` and add new entries with the enhanced format:

```json
{
  "title": "Your Event Title",
  "date": "2024-12-25",
  "description": "Description of this special moment...",
  "images": [
    {
      "url": "https://your-image-url.com/photo1.jpg",
      "caption": "Caption for first image"
    },
    {
      "url": "https://your-image-url.com/photo2.jpg", 
      "caption": "Caption for second image"
    }
  ],
  "tags": ["family", "holiday", "celebration"]
}
```

**Enhanced Features**:
- **Multiple Images**: Support for image galleries with individual captions
- **Backward Compatibility**: Still supports single `"image": "url"` format
- **Smart Gallery**: Automatic grid layout for multiple images
- **Lightbox Navigation**: Browse through image collections seamlessly
- **Dynamic Filtering**: Tags and years automatically appear in filter UI
- **Virtual Scrolling**: Optimized for large datasets (50+ moments)

## 🎨 Customization

### **Visual Customization**
- **Modern Design System**: Edit CSS custom properties in `:root` section of `styles.css`
- **Glass Morphism**: Adjust transparency, blur, and backdrop effects
- **Color Schemes**: Modify gradient variables for different themes
- **Typography**: Change Google Fonts link in `index.html` for custom fonts
- **Animations**: Customize timing and easing functions in CSS animations

### **Layout Customization**
- **Responsive Breakpoints**: Modify media queries for different screen sizes
- **Timeline Layout**: Adjust spacing, alternating positions, and visual hierarchy
- **Virtual Scrolling**: Configure intersection observer settings for performance
- **Space Utilization**: Optimize layouts for ultra-wide screens (1400px+)

### **Content Management**
- **Data Structure**: Update moments in `data/moments.json` with enhanced image format
- **Performance Optimization**: Configure image hosting and CDN settings
- **Accessibility**: Customize reduced motion preferences and keyboard navigation

## 📊 Technical Details

### **Modern Architecture**
- **Zero Dependencies**: Pure vanilla JavaScript with modern ES6+ features
- **Advanced Browser Support**: Utilizes cutting-edge CSS and JavaScript APIs
- **Performance Optimized**: Virtual scrolling, intersection observer, CSS containment
- **Accessibility First**: Reduced motion support, keyboard navigation, semantic HTML

### **Premium Design Features**
- **Glass Morphism**: Backdrop blur, transparency layers, and depth perception
- **Advanced Animations**: Intersection observer-based reveals, micro-interactions
- **CSS Custom Properties**: Comprehensive design system with theme variables
- **Responsive Excellence**: Mobile-first approach with touch-optimized interactions

### **Scalability & Performance**
- **Virtual Scrolling**: Handles 50+ moments efficiently
- **Smart Loading**: Optimized DOM manipulation and image lazy loading
- **Modern CSS**: Grid, flexbox, containment, and will-change optimizations
- **Progressive Enhancement**: Graceful degradation for older browsers

For detailed technical implementation, see [FEATURES.md](FEATURES.md).

## 🚀 Live Demo

**🌐 View Live Site**: [https://vaagul.github.io/LifeLine/](https://vaagul.github.io/LifeLine/)

*Note: It may take 5-10 minutes for initial deployment after enabling GitHub Pages*

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

**Quick Links**:
- 📋 [Complete Features List](FEATURES.md)
- 🔧 [Development Guidelines](copilot-instructions.md)
- 📊 [Sample Data](data/moments.json)
