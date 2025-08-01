# Project: Family Photo Album with Timeline

## 📚 Important Reference Files
- **FEATURES.md** - **ALWAYS CHECK THIS FIRST** - Complete implementation status, feature tracking, and technical details
- **README.md** - User documentation and setup instructions
- **data/moments.json** - Sample data structure and content

## Goal
Build a static photo timeline/gallery website hosted on GitHub Pages to showcase our family's top moments and milestones. It should be visually appealing, easy to navigate across years/months, and responsive across devices.

## Features
- Load family moments from a JSON file (`data/moments.json`)
- Each moment has:
  - title
  - date
  - description
  - list of image URLs (hosted on Cloudinary or GitHub)
  - tags
- Timeline view (ordered chronologically)
- Responsive UI (desktop and mobile)
- Gallery popup when an image is clicked (PhotoSwipe or similar)
- Clean, elegant, family-friendly UI
- Smooth scroll and light animations
- Ability to add more moments in the future
- Ability to show the exitsting tags and when a tag or a list of tags have been selected, only the moments with those tags should be shown
- Option to filter moments by year/month (Only if any moment was added in that year/month, it should be available for filtering)

## Folder Structure
/
├── index.html
├── css/
│   └── styles.css
├── js/
│   └── script.js
└── data/
│   └── moments.json
├── assets/
├── README.md
├── FEATURES.md          # ← IMPLEMENTATION TRACKER (CHECK FIRST!)
└── copilot-instructions.md

## UI Design Guidelines
- Vertical timeline (alternating sides) OR grid view (mobile-first)
- On mobile:
  - Full-width cards
  - Scrollable vertically
- On desktop:
  - Timeline layout with left-right alternating blocks or image grid
- Image thumbnails should open in a lightbox/gallery viewer

## Additional Functionality
- Load JSON dynamically in `script.js`
- Show loading state while images/data load
- Option to add tags or filters (future)
- Minimal animations (slide/fade-in) when scrolling

## Development Notes
⚠️ **IMPORTANT**: Before making any changes or answering questions about this project:
1. **Always reference FEATURES.md first** to understand current implementation status
2. Use FEATURES.md to track what's been built and what's missing
3. Update FEATURES.md when adding new functionality
4. Refer to the technical details and sample data in FEATURES.md

## Deployment
- Hosted via GitHub Pages from the `main` branch
- Instructions should be in `README.md`

## Run Locally
- Start HTTP server to avoid CORS issues: `python3 -m http.server 8000`
- Visit: `http://localhost:8000`
- Alternative: Open `index.html` in any browser (may have CORS limitations)


