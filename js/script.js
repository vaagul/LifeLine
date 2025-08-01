// Fetch data/moments.json and render a vertical timeline into the DOM
// Use createElement to dynamically add each moment as a div block
// Include image, title, description, and formatted date

class FamilyTimeline {
    constructor() {
        this.moments = [];
        this.filteredMoments = [];
        this.selectedTags = new Set();
        this.selectedYear = 'all';
        this.sortOrder = 'newest'; // Default to newest first
        this.timelineContainer = document.getElementById('timeline');
        this.loadingElement = document.getElementById('loading');
        this.noResultsElement = document.getElementById('no-results');
        this.yearFilter = document.getElementById('year-filter');
        this.sortFilter = document.getElementById('sort-filter');
        this.tagFilter = document.getElementById('tag-filter');
        this.lightbox = document.getElementById('lightbox');
        
        // Gallery state
        this.currentGallery = [];
        this.currentImageIndex = 0;
        this.currentMoment = null;
        
        // Virtual scrolling state
        this.visibleEntries = new Set();
        this.intersectionObserver = null;
        
        // Scroll navigator state
        this.scrollNavigator = document.getElementById('scroll-navigator');
        this.scrollNavigatorThumb = document.querySelector('.scroll-navigator__thumb');
        this.scrollNavigatorMarkers = document.querySelector('.scroll-navigator__markers');
        this.currentPeriodLabel = document.getElementById('current-period');
        this.periodSections = [];
        this.currentVisiblePeriod = null;
        
        this.init();
    }

    async init() {
        try {
            await this.loadMoments();
            this.setupFilters();
            this.setupEventListeners();
            this.setupIntersectionObserver();
            this.setupScrollProgress();
            this.setupScrollNavigator();
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

        // Sort filter change
        this.sortFilter.addEventListener('change', (e) => {
            this.sortOrder = e.target.value;
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

        // Scroll navigator click handler
        this.scrollNavigator?.addEventListener('click', (e) => {
            console.log('Navigator clicked:', e.target, e.target.classList);
            
            if (e.target.classList.contains('scroll-navigator__marker')) {
                const periodLabel = e.target.dataset.period;
                console.log('Marker clicked, period:', periodLabel);
                this.scrollToPeriod(periodLabel);
            } else if (e.target.classList.contains('scroll-navigator__markers')) {
                // Handle clicks on the markers container - find the closest marker
                const rect = e.target.getBoundingClientRect();
                const clickY = e.clientY - rect.top;
                const percentage = clickY / rect.height;
                const targetPeriodIndex = Math.round(percentage * (this.periodSections.length - 1));
                
                console.log('Markers container clicked, percentage:', percentage, 'targetIndex:', targetPeriodIndex);
                
                if (this.periodSections[targetPeriodIndex]) {
                    const periodLabel = this.periodSections[targetPeriodIndex].label;
                    console.log('Markers container clicked, jumping to period:', periodLabel);
                    this.scrollToPeriod(periodLabel);
                }
            } else if (e.target.classList.contains('scroll-navigator__track')) {
                // Handle clicks on the track itself
                const rect = e.target.getBoundingClientRect();
                const clickY = e.clientY - rect.top;
                const percentage = clickY / rect.height;
                const targetPeriodIndex = Math.round(percentage * (this.periodSections.length - 1));
                
                console.log('Track clicked, percentage:', percentage, 'targetIndex:', targetPeriodIndex);
                
                if (this.periodSections[targetPeriodIndex]) {
                    const periodLabel = this.periodSections[targetPeriodIndex].label;
                    console.log('Track clicked, jumping to period:', periodLabel);
                    this.scrollToPeriod(periodLabel);
                }
            } else if (e.target.classList.contains('scroll-navigator') || e.target.id === 'scroll-navigator') {
                // Handle clicks anywhere on the navigator
                const markersContainer = this.scrollNavigatorMarkers;
                if (markersContainer) {
                    const rect = markersContainer.getBoundingClientRect();
                    const clickY = e.clientY - rect.top;
                    const percentage = Math.max(0, Math.min(1, clickY / rect.height));
                    const targetPeriodIndex = Math.round(percentage * (this.periodSections.length - 1));
                    
                    console.log('Navigator clicked, percentage:', percentage, 'targetIndex:', targetPeriodIndex);
                    
                    if (this.periodSections[targetPeriodIndex]) {
                        const periodLabel = this.periodSections[targetPeriodIndex].label;
                        console.log('Navigator clicked, jumping to period:', periodLabel);
                        this.scrollToPeriod(periodLabel);
                    }
                }
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

        // Update results summary
        this.updateResultsSummary(this.filteredMoments.length);

        this.renderTimeline();
    }

    setupIntersectionObserver() {
        const options = {
            root: null,
            rootMargin: '50px',
            threshold: 0.1
        };

        this.intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('observed');
                    entry.target.style.setProperty('--entry-index', 
                        Array.from(this.timelineContainer.children).indexOf(entry.target));
                } else {
                    entry.target.classList.remove('observed');
                }
            });
        }, options);
    }

    setupScrollProgress() {
        const progressBar = document.querySelector('.scroll-progress__bar');
        if (!progressBar) return;

        const updateProgress = () => {
            const scrollTop = window.pageYOffset;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;
            progressBar.style.width = Math.min(scrollPercent, 100) + '%';
        };

        window.addEventListener('scroll', updateProgress, { passive: true });
        updateProgress(); // Initialize
    }

    setupScrollNavigator() {
        if (!this.scrollNavigator) return;

        const updateScrollNavigator = () => {
            this.updateScrollNavigatorPosition();
            this.updateCurrentPeriod();
        };

        window.addEventListener('scroll', updateScrollNavigator, { passive: true });
        
        // Show/hide navigator based on content
        const showNavigator = () => {
            if (this.filteredMoments.length > 3) {
                this.scrollNavigator.classList.add('visible');
            } else {
                this.scrollNavigator.classList.remove('visible');
            }
        };

        // Initial setup
        setTimeout(() => {
            this.buildPeriodSections();
            this.updateScrollNavigatorMarkers();
            showNavigator();
            updateScrollNavigator();
        }, 100);
    }

    buildPeriodSections() {
        if (!this.filteredMoments.length) return;

        console.log('Building period sections for', this.filteredMoments.length, 'moments');

        // First, sort the filtered moments to match the current sort order
        const sortedMoments = [...this.filteredMoments];
        if (this.sortOrder === 'newest') {
            sortedMoments.sort((a, b) => new Date(b.date) - new Date(a.date));
        } else {
            sortedMoments.sort((a, b) => new Date(a.date) - new Date(b.date));
        }

        // Group moments by year and month
        const periods = {};
        sortedMoments.forEach((moment, index) => {
            const date = new Date(moment.date);
            const year = date.getFullYear();
            const month = date.getMonth();
            const periodKey = `${year}-${String(month + 1).padStart(2, '0')}`;
            
            if (!periods[periodKey]) {
                periods[periodKey] = {
                    year,
                    month,
                    label: date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
                    moments: [],
                    startIndex: index,
                    endIndex: index
                };
            }
            periods[periodKey].moments.push(moment);
            periods[periodKey].endIndex = index;
        });

        this.periodSections = Object.values(periods).sort((a, b) => {
            if (this.sortOrder === 'newest') {
                return b.year - a.year || b.month - a.month;
            } else {
                return a.year - b.year || a.month - b.month;
            }
        });

        console.log('Period sections created:', this.periodSections.map(p => p.label));
    }

    updateScrollNavigatorMarkers() {
        if (!this.scrollNavigatorMarkers || !this.periodSections.length) return;

        console.log('Updating scroll navigator markers for periods:', this.periodSections.map(p => p.label));

        this.scrollNavigatorMarkers.innerHTML = '';
        
        this.periodSections.forEach((period, index) => {
            const marker = document.createElement('div');
            marker.className = 'scroll-navigator__marker';
            marker.dataset.period = period.label;
            marker.title = period.label; // Add tooltip
            
            // Position marker based on the period's position in the timeline
            const position = this.periodSections.length === 1 ? 50 : (index / (this.periodSections.length - 1)) * 100;
            marker.style.top = `${Math.min(position, 95)}%`;
            
            console.log(`Created marker for ${period.label} at position ${position}%`);
            
            this.scrollNavigatorMarkers.appendChild(marker);
        });
    }

    updateScrollNavigatorPosition() {
        if (!this.scrollNavigatorThumb) return;

        const scrollTop = window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = Math.min((scrollTop / docHeight) * 100, 100);
        
        const trackHeight = 300; // Height of the track
        const thumbPosition = (scrollPercent / 100) * (trackHeight - 20); // 20 is thumb height
        
        this.scrollNavigatorThumb.style.top = `${thumbPosition}px`;
    }

    updateCurrentPeriod() {
        if (!this.periodSections.length || !this.currentPeriodLabel) return;

        const timelineEntries = this.timelineContainer.querySelectorAll('.timeline-entry');
        if (!timelineEntries.length) return;

        const viewportTop = window.pageYOffset;
        const viewportCenter = viewportTop + (window.innerHeight / 2);

        let currentPeriod = null;
        let closestDistance = Infinity;

        // Find the entry closest to the center of the viewport
        timelineEntries.forEach((entry, index) => {
            const entryTop = entry.offsetTop;
            const entryCenter = entryTop + (entry.offsetHeight / 2);
            const distance = Math.abs(viewportCenter - entryCenter);

            if (distance < closestDistance && index < this.filteredMoments.length) {
                closestDistance = distance;
                const moment = this.filteredMoments[index];
                const date = new Date(moment.date);
                currentPeriod = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
            }
        });

        if (currentPeriod && currentPeriod !== this.currentVisiblePeriod) {
            this.currentVisiblePeriod = currentPeriod;
            this.currentPeriodLabel.textContent = currentPeriod;
            
            // Show label temporarily
            const label = document.querySelector('.scroll-navigator__label');
            if (label) {
                label.classList.add('visible');
                clearTimeout(this.labelTimeout);
                this.labelTimeout = setTimeout(() => {
                    label.classList.remove('visible');
                }, 2000);
            }

            // Update active marker
            const markers = this.scrollNavigatorMarkers.querySelectorAll('.scroll-navigator__marker');
            markers.forEach(marker => {
                marker.classList.toggle('active', marker.dataset.period === currentPeriod);
            });
        }
    }

    scrollToPeriod(periodLabel) {
        console.log('Attempting to scroll to period:', periodLabel);
        console.log('Available period sections:', this.periodSections?.map(p => p.label) || 'none');
        console.log('Current sort order:', this.sortOrder);
        
        const timelineEntries = this.timelineContainer.querySelectorAll('.timeline-entry');
        if (!timelineEntries.length) {
            console.log('No timeline entries found');
            return;
        }

        console.log('Timeline entries found:', timelineEntries.length);
        console.log('Filtered moments count:', this.filteredMoments.length);

        // Get the sorted moments to match the timeline order
        const sortedMoments = [...this.filteredMoments];
        if (this.sortOrder === 'newest') {
            sortedMoments.sort((a, b) => new Date(b.date) - new Date(a.date));
        } else {
            sortedMoments.sort((a, b) => new Date(a.date) - new Date(b.date));
        }

        console.log('Sorted moments:', sortedMoments.map(m => `${m.title} (${m.date})`));

        // Find the first entry that matches the period
        let foundMatch = false;
        for (let i = 0; i < sortedMoments.length && i < timelineEntries.length; i++) {
            const moment = sortedMoments[i];
            const date = new Date(moment.date);
            const momentPeriod = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
            
            console.log(`Checking moment ${i}: ${moment.title}, period: ${momentPeriod}, target: ${periodLabel}`);
            
            if (momentPeriod === periodLabel) {
                const entry = timelineEntries[i];
                const offsetTop = entry.offsetTop - 150; // Account for sticky header and some padding
                
                console.log(`Found matching period! Scrolling to entry ${i}, offset: ${offsetTop}`);
                
                window.scrollTo({
                    top: Math.max(0, offsetTop),
                    behavior: 'smooth'
                });
                
                // Show the period label temporarily
                const label = document.querySelector('.scroll-navigator__label');
                if (label) {
                    this.currentPeriodLabel.textContent = periodLabel;
                    label.classList.add('visible');
                    clearTimeout(this.labelTimeout);
                    this.labelTimeout = setTimeout(() => {
                        label.classList.remove('visible');
                    }, 3000);
                }
                foundMatch = true;
                break;
            }
        }
        
        if (!foundMatch) {
            console.log('No matching period found for:', periodLabel);
            console.log('Available periods in moments:', 
                sortedMoments.map(m => new Date(m.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }))
            );
        }
    }

    observeTimelineEntries() {
        if (!this.intersectionObserver) return;
        
        const entries = this.timelineContainer.querySelectorAll('.timeline-entry');
        entries.forEach(entry => {
            this.intersectionObserver.observe(entry);
        });
    }

    unobserveTimelineEntries() {
        if (!this.intersectionObserver) return;
        
        const entries = this.timelineContainer.querySelectorAll('.timeline-entry');
        entries.forEach(entry => {
            this.intersectionObserver.unobserve(entry);
        });
    }

    updateResultsSummary(count) {
        const momentCountElement = document.getElementById('moment-count');
        if (momentCountElement) {
            momentCountElement.textContent = count;
        }
    }

    renderTimeline() {
        // Clear existing timeline and unobserve entries
        this.unobserveTimelineEntries();
        this.timelineContainer.innerHTML = '';

        if (this.filteredMoments.length === 0) {
            this.showNoResults();
            return;
        }

        this.hideNoResults();

        // Sort moments before rendering
        const sortedMoments = [...this.filteredMoments];
        if (this.sortOrder === 'newest') {
            sortedMoments.sort((a, b) => new Date(b.date) - new Date(a.date));
        } else {
            sortedMoments.sort((a, b) => new Date(a.date) - new Date(b.date));
        }

        // Update results summary
        this.updateResultsSummary(sortedMoments.length);

        // Create timeline entries with staggered animation
        sortedMoments.forEach((moment, index) => {
            const timelineEntry = this.createTimelineEntry(moment, index);
            
            // Add year data attribute for floating labels
            const year = new Date(moment.date).getFullYear();
            timelineEntry.setAttribute('data-year', year);
            
            // Set CSS custom property for animation delay
            timelineEntry.style.setProperty('--entry-index', index);
            
            this.timelineContainer.appendChild(timelineEntry);
        });

        // Observe new entries for intersection animations
        requestAnimationFrame(() => {
            this.observeTimelineEntries();
        });

        // Update scroll navigator after timeline is rendered
        setTimeout(() => {
            this.buildPeriodSections();
            this.updateScrollNavigatorMarkers();
            
            // Show/hide navigator based on content
            if (this.filteredMoments.length > 3) {
                this.scrollNavigator?.classList.add('visible');
            } else {
                this.scrollNavigator?.classList.remove('visible');
            }
        }, 100);
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
