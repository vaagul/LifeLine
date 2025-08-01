# Family Photo Album Timeline 📸

A beautiful, responsive static website to showcase your family's precious moments through an interactive timeline. Built with vanilla HTML, CSS, and JavaScript for maximum compatibility and performance.

## ✨ Features

- 🎯 **Interactive Timeline**: Chronological display with alternating layout on desktop
- 🔍 **Advanced Filtering**: Filter by year and tags with real-time updates
- 🖼️ **Lightbox Gallery**: Click any image for full-size viewing with details
- 📱 **Fully Responsive**: Beautiful on desktop, tablet, and mobile devices
- 🎨 **Modern Design**: Glass morphism effects, smooth animations, and professional styling
- ⚡ **Fast Performance**: Lazy loading, optimized images, and minimal dependencies
- 🏷️ **Tag System**: Organize moments with custom tags for easy discovery
- 📄 **JSON-Powered**: Easy content management through simple JSON file

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

Edit `data/moments.json` and add new entries:

```json
{
  "title": "Your Event Title",
  "date": "2024-12-25",
  "description": "Description of this special moment...",
  "image": "https://your-image-url.com/photo.jpg",
  "tags": ["family", "holiday", "celebration"]
}
```

**Tips**:
- Use Cloudinary, GitHub, or any CDN for hosting images
- Tags automatically appear in the filter UI
- Dates should be in YYYY-MM-DD format
- New years automatically appear in year filter

## 🎨 Customization

- **Colors**: Edit CSS variables in `styles.css`
- **Fonts**: Change Google Fonts link in `index.html`
- **Layout**: Modify responsive breakpoints and spacing
- **Content**: Update moments in `data/moments.json`

## 📊 Technical Details

- **Dependencies**: Zero runtime dependencies
- **Browser Support**: Modern browsers (ES6+ required)
- **Performance**: Optimized with lazy loading and efficient DOM manipulation
- **Architecture**: Modular ES6 classes with proper error handling

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
