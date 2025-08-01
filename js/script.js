// Fetch data/moments.json and render a vertical timeline into the DOM
// Use createElement to dynamically add each moment as a div block
// Include image, title, description, and formatted date

class FamilyTimeline {
    constructor() {
        this.moments = [];
        this.filteredMoments = [];
        this.selectedTags = new Set();
        this.selectedYear = 'all';
        this.timelineContainer = document.getElementById('timeline');
        this.loadingElement = document.getElementById('loading');
        this.noResultsElement = document.getElementById('no-results');
        this.yearFilter = document.getElementById('year-filter');
        this.tagFilter = document.getElementById('tag-filter');
        this.lightbox = document.getElementById('lightbox');
        
        // Gallery state
        this.currentGallery = [];
        this.currentImageIndex = 0;
        this.currentMoment = null;
        
        this.init();
    }

    async init() {
        try {
            await this.loadMoments();
            this.setupFilters();
            this.setupEventListeners();
            this.renderTimeline();
            this.hideLoading();
        } catch (error) {
            console.error('Error initializing timeline:', error);
            this.showError('Failed to load family moments. Please try again later.');
        }
    }

    async loadMoments() {
        try {
            const response = await fetch('data/moments.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.moments = await response.json();
            
            // Sort moments by date (newest first)
            this.moments.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            // Initialize filtered moments
            this.filteredMoments = [...this.moments];
        } catch (error) {
            console.error('Error fetching moments:', error);
            throw error;
        }
    }

    setupFilters() {
        this.setupYearFilter();
        this.setupTagFilter();
    }

    setupYearFilter() {
        // Get unique years from moments
        const years = [...new Set(this.moments.map(moment => 
            new Date(moment.date).getFullYear()
        ))].sort((a, b) => b - a);

        // Populate year filter
        years.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            this.yearFilter.appendChild(option);
        });
    }

    setupTagFilter() {
        // Get unique tags from moments
        const allTags = new Set();
        this.moments.forEach(moment => {
            if (moment.tags && Array.isArray(moment.tags)) {
                moment.tags.forEach(tag => allTags.add(tag));
            }
        });

        // Create tag buttons
        allTags.forEach(tag => {
            const tagButton = document.createElement('button');
            tagButton.className = 'tag-button';
            tagButton.textContent = tag;
            tagButton.addEventListener('click', () => this.toggleTag(tag, tagButton));
            this.tagFilter.appendChild(tagButton);
        });
    }

    setupEventListeners() {
        // Year filter change
        this.yearFilter.addEventListener('change', (e) => {
            this.selectedYear = e.target.value;
            this.applyFilters();
        });

        // Clear tags button
        document.getElementById('clear-tags').addEventListener('click', () => {
            this.clearAllTags();
        });

        // Lightbox close events
        this.lightbox.addEventListener('click', (e) => {
            if (e.target === this.lightbox) {
                this.closeLightbox();
            }
        });

        document.querySelector('.lightbox__close').addEventListener('click', () => {
            this.closeLightbox();
        });

        // Gallery navigation
        document.getElementById('prev-btn').addEventListener('click', () => {
            this.previousImage();
        });

        document.getElementById('next-btn').addEventListener('click', () => {
            this.nextImage();
        });

        // Keyboard events
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeLightbox();
            } else if (e.key === 'ArrowLeft') {
                this.previousImage();
            } else if (e.key === 'ArrowRight') {
                this.nextImage();
            }
        });
    }

    toggleTag(tag, button) {
        if (this.selectedTags.has(tag)) {
            this.selectedTags.delete(tag);
            button.classList.remove('active');
        } else {
            this.selectedTags.add(tag);
            button.classList.add('active');
        }
        
        // Show/hide clear button
        this.updateClearButtonVisibility();
        this.applyFilters();
    }

    clearAllTags() {
        // Clear all selected tags
        this.selectedTags.clear();
        
        // Remove active class from all tag buttons
        const tagButtons = document.querySelectorAll('.tag-button');
        tagButtons.forEach(button => {
            button.classList.remove('active');
        });
        
        // Hide clear button
        this.updateClearButtonVisibility();
        this.applyFilters();
    }

    updateClearButtonVisibility() {
        const clearButton = document.getElementById('clear-tags');
        if (this.selectedTags.size > 0) {
            clearButton.style.display = 'block';
        } else {
            clearButton.style.display = 'none';
        }
    }

    applyFilters() {
        this.filteredMoments = this.moments.filter(moment => {
            // Year filter
            if (this.selectedYear !== 'all') {
                const momentYear = new Date(moment.date).getFullYear();
                if (momentYear !== parseInt(this.selectedYear)) {
                    return false;
                }
            }

            // Tag filter - AND logic: moment must have ALL selected tags
            if (this.selectedTags.size > 0) {
                if (!moment.tags || !Array.isArray(moment.tags)) {
                    return false;
                }
                // Check if moment has ALL selected tags
                const hasAllSelectedTags = [...this.selectedTags].every(selectedTag => 
                    moment.tags.includes(selectedTag)
                );
                if (!hasAllSelectedTags) {
                    return false;
                }
            }

            return true;
        });

        this.renderTimeline();
    }

    renderTimeline() {
        // Clear existing timeline
        this.timelineContainer.innerHTML = '';

        if (this.filteredMoments.length === 0) {
            this.showNoResults();
            return;
        }

        this.hideNoResults();

        // Create timeline entries
        this.filteredMoments.forEach((moment, index) => {
            const timelineEntry = this.createTimelineEntry(moment, index);
            this.timelineContainer.appendChild(timelineEntry);
        });

        // Trigger animation for new entries
        requestAnimationFrame(() => {
            const entries = this.timelineContainer.querySelectorAll('.timeline-entry');
            entries.forEach((entry, index) => {
                setTimeout(() => {
                    entry.style.animationDelay = `${index * 0.1}s`;
                }, index * 50);
            });
        });
    }

    createTimelineEntry(moment, index) {
        const entry = document.createElement('div');
        entry.className = 'timeline-entry';
        
        const content = document.createElement('div');
        content.className = 'timeline-content';
        
        // Create image gallery
        const imageGallery = document.createElement('div');
        imageGallery.className = 'timeline-image-gallery';
        
        // Handle both old format (single image) and new format (images array)
        const images = moment.images || (moment.image ? [{url: moment.image, caption: ''}] : []);
        
        if (images.length === 1) {
            // Single image - show full width
            const image = document.createElement('img');
            image.className = 'timeline-image timeline-image-single';
            image.src = images[0].url;
            image.alt = moment.title;
            image.loading = 'lazy';
            image.addEventListener('click', () => this.openLightbox(moment, 0));
            imageGallery.appendChild(image);
        } else if (images.length > 1) {
            // Multiple images - show grid with main image and thumbnails
            images.forEach((img, imgIndex) => {
                const image = document.createElement('img');
                image.className = imgIndex === 0 ? 'timeline-image timeline-image-main' : 'timeline-image';
                image.src = img.url;
                image.alt = img.caption || moment.title;
                image.loading = 'lazy';
                image.addEventListener('click', () => this.openLightbox(moment, imgIndex));
                
                // Add image count badge to the first image
                if (imgIndex === 0) {
                    const wrapper = document.createElement('div');
                    wrapper.style.position = 'relative';
                    wrapper.style.gridColumn = '1 / -1';
                    
                    const badge = document.createElement('div');
                    badge.className = 'image-count-badge';
                    badge.textContent = `${images.length} photos`;
                    
                    wrapper.appendChild(image);
                    wrapper.appendChild(badge);
                    imageGallery.appendChild(wrapper);
                } else if (imgIndex < 4) { // Show max 4 images in grid
                    imageGallery.appendChild(image);
                }
            });
        }
        
        // Create title
        const title = document.createElement('h3');
        title.className = 'timeline-title';
        title.textContent = moment.title;
        
        // Create date
        const date = document.createElement('p');
        date.className = 'timeline-date';
        date.textContent = this.formatDate(moment.date);
        
        // Create description
        const description = document.createElement('p');
        description.className = 'timeline-description';
        description.textContent = moment.description;
        
        // Create tags container
        const tagsContainer = document.createElement('div');
        tagsContainer.className = 'timeline-tags';
        
        if (moment.tags && Array.isArray(moment.tags)) {
            moment.tags.forEach(tag => {
                const tagElement = document.createElement('span');
                tagElement.className = 'timeline-tag';
                tagElement.textContent = tag;
                tagsContainer.appendChild(tagElement);
            });
        }
        
        // Append all elements
        content.appendChild(imageGallery);
        content.appendChild(title);
        content.appendChild(date);
        content.appendChild(description);
        content.appendChild(tagsContainer);
        
        entry.appendChild(content);
        
        return entry;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        return date.toLocaleDateString('en-US', options);
    }

    openLightbox(moment, imageIndex = 0) {
        this.currentMoment = moment;
        this.currentGallery = moment.images || (moment.image ? [{url: moment.image, caption: ''}] : []);
        this.currentImageIndex = imageIndex;
        
        this.updateLightboxContent();
        this.createThumbnails();
        this.updateNavigationButtons();
        
        this.lightbox.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    updateLightboxContent() {
        const lightboxImage = document.getElementById('lightbox-image');
        const lightboxTitle = document.getElementById('lightbox-title');
        const lightboxDate = document.getElementById('lightbox-date');
        const lightboxDescription = document.getElementById('lightbox-description');
        const lightboxCaption = document.getElementById('lightbox-caption');
        const imageCounter = document.getElementById('image-counter');
        
        const currentImage = this.currentGallery[this.currentImageIndex];
        
        lightboxImage.src = currentImage.url;
        lightboxImage.alt = currentImage.caption || this.currentMoment.title;
        lightboxTitle.textContent = this.currentMoment.title;
        lightboxDate.textContent = this.formatDate(this.currentMoment.date);
        lightboxDescription.textContent = this.currentMoment.description;
        lightboxCaption.textContent = currentImage.caption || '';
        
        // Update counter
        imageCounter.textContent = `${this.currentImageIndex + 1} / ${this.currentGallery.length}`;
        
        // Hide counter and caption if only one image
        if (this.currentGallery.length === 1) {
            imageCounter.style.display = 'none';
            lightboxCaption.style.display = 'none';
        } else {
            imageCounter.style.display = 'block';
            lightboxCaption.style.display = currentImage.caption ? 'block' : 'none';
        }
    }

    createThumbnails() {
        const thumbnailStrip = document.getElementById('thumbnail-strip');
        thumbnailStrip.innerHTML = '';
        
        // Hide thumbnail strip if only one image
        if (this.currentGallery.length <= 1) {
            thumbnailStrip.style.display = 'none';
            return;
        }
        
        thumbnailStrip.style.display = 'flex';
        
        this.currentGallery.forEach((image, index) => {
            const thumbnail = document.createElement('img');
            thumbnail.className = 'lightbox__thumbnail';
            thumbnail.src = image.url;
            thumbnail.alt = image.caption || this.currentMoment.title;
            
            if (index === this.currentImageIndex) {
                thumbnail.classList.add('active');
            }
            
            thumbnail.addEventListener('click', () => {
                this.currentImageIndex = index;
                this.updateLightboxContent();
                this.updateThumbnailActive();
                this.updateNavigationButtons();
            });
            
            thumbnailStrip.appendChild(thumbnail);
        });
    }

    updateThumbnailActive() {
        const thumbnails = document.querySelectorAll('.lightbox__thumbnail');
        thumbnails.forEach((thumb, index) => {
            thumb.classList.toggle('active', index === this.currentImageIndex);
        });
    }

    updateNavigationButtons() {
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        
        if (this.currentGallery.length <= 1) {
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
            return;
        }
        
        prevBtn.style.display = 'flex';
        nextBtn.style.display = 'flex';
        
        prevBtn.disabled = this.currentImageIndex === 0;
        nextBtn.disabled = this.currentImageIndex === this.currentGallery.length - 1;
    }

    nextImage() {
        if (this.currentImageIndex < this.currentGallery.length - 1) {
            this.currentImageIndex++;
            this.updateLightboxContent();
            this.updateThumbnailActive();
            this.updateNavigationButtons();
        }
    }

    previousImage() {
        if (this.currentImageIndex > 0) {
            this.currentImageIndex--;
            this.updateLightboxContent();
            this.updateThumbnailActive();
            this.updateNavigationButtons();
        }
    }

    closeLightbox() {
        this.lightbox.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    }

    hideLoading() {
        this.loadingElement.style.display = 'none';
    }

    showNoResults() {
        this.noResultsElement.style.display = 'block';
    }

    hideNoResults() {
        this.noResultsElement.style.display = 'none';
    }

    showError(message) {
        this.hideLoading();
        this.timelineContainer.innerHTML = `
            <div style="text-align: center; padding: 3rem 0; color: white;">
                <h3>Oops! Something went wrong</h3>
                <p>${message}</p>
            </div>
        `;
    }
}

// Initialize the timeline when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FamilyTimeline();
});
