// Featured Travel Destinations Carousel Functionality
document.addEventListener('DOMContentLoaded', function() {
    initFeaturedCarousel();
    initHeroBanner();
    initLoginModal();
    initMapFunctionality();
    initSmoothScroll();
    initHeaderScroll();
});

function initFeaturedCarousel() {
    const track = document.getElementById('featuredCarouselTrack');
    const slides = Array.from(track.children);
    const nextButton = document.getElementById('featuredCarouselNext');
    const prevButton = document.getElementById('featuredCarouselPrev');
    const navContainer = document.getElementById('featuredCarouselNav');
    
    if (!track || slides.length === 0) {
        console.error('Featured carousel elements not found');
        return;
    }
    
    let currentIndex = 0;
    let autoSlideInterval;
    
    // Create navigation dots
    slides.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('carousel-dot');
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(index));
        navContainer.appendChild(dot);
    });
    
    const dots = Array.from(navContainer.children);
    
    // Set initial position
    updateSlidePosition();
    
    // Next button click
    nextButton.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % slides.length;
        updateSlidePosition();
        resetAutoSlide();
    });
    
    // Previous button click
    prevButton.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + slides.length) % slides.length;
        updateSlidePosition();
        resetAutoSlide();
    });
    
    // Update slide position
    function updateSlidePosition() {
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
        
        // Update active dot
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    }
    
    // Go to specific slide
    function goToSlide(index) {
        currentIndex = index;
        updateSlidePosition();
        resetAutoSlide();
    }
    
    // Auto slide functionality
    function startAutoSlide() {
        autoSlideInterval = setInterval(() => {
            currentIndex = (currentIndex + 1) % slides.length;
            updateSlidePosition();
        }, 4000); // Change slide every 4 seconds
    }
    
    function resetAutoSlide() {
        clearInterval(autoSlideInterval);
        startAutoSlide();
    }
    
    // Start auto sliding
    startAutoSlide();
    
    // Pause auto slide on hover
    const carousel = document.querySelector('.photo-carousel-small');
    carousel.addEventListener('mouseenter', () => {
        clearInterval(autoSlideInterval);
    });
    
    carousel.addEventListener('mouseleave', () => {
        startAutoSlide();
    });
    
    // Touch swipe support for mobile
    let startX = 0;
    let endX = 0;
    
    carousel.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        clearInterval(autoSlideInterval);
    }, { passive: true });
    
    carousel.addEventListener('touchmove', (e) => {
        endX = e.touches[0].clientX;
    }, { passive: true });
    
    carousel.addEventListener('touchend', (e) => {
        const diff = startX - endX;
        
        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                // Swipe left - next slide
                nextButton.click();
            } else {
                // Swipe right - previous slide
                prevButton.click();
            }
        }
        resetAutoSlide();
    }, { passive: true });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            prevButton.click();
        } else if (e.key === 'ArrowRight') {
            nextButton.click();
        }
    });
}

// Hero Banner Auto-Slide Functionality
function initHeroBanner() {
    const radioButtons = document.querySelectorAll('.slide-radio');
    let currentSlide = 0;
    let heroAutoSlideInterval;

    function startHeroAutoSlide() {
        heroAutoSlideInterval = setInterval(() => {
            currentSlide = (currentSlide + 1) % radioButtons.length;
            radioButtons[currentSlide].checked = true;
        }, 5000); // Change slide every 5 seconds
    }

    function resetHeroAutoSlide() {
        clearInterval(heroAutoSlideInterval);
        startHeroAutoSlide();
    }

    // Start auto sliding
    startHeroAutoSlide();

    // Reset auto slide when user manually selects a slide
    radioButtons.forEach((radio, index) => {
        radio.addEventListener('change', () => {
            currentSlide = index;
            resetHeroAutoSlide();
        });
    });

    // Pause auto slide on hover
    const heroBanner = document.querySelector('.home');
    heroBanner.addEventListener('mouseenter', () => {
        clearInterval(heroAutoSlideInterval);
    });

    heroBanner.addEventListener('mouseleave', () => {
        startHeroAutoSlide();
    });

    console.log('Hero banner auto-slide initialized');
}

function initLoginModal() {
    const loginBtn = document.querySelector('.login-btn');
    const loginModal = document.getElementById('loginModal');
    const loginIframe = document.getElementById('loginIframe');

    if (!loginBtn || !loginModal) return;

    function openModal() {
        loginIframe.src = 'login/login.html';
        loginModal.classList.add('show');
        loginModal.setAttribute('aria-hidden','false');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        loginModal.classList.remove('show');
        loginModal.setAttribute('aria-hidden','true');
        if (loginIframe) loginIframe.src = 'about:blank';
        document.body.style.overflow = '';
    }

    loginBtn.addEventListener('click', function(e) {
        e.preventDefault();
        openModal();
    });

    window.addEventListener('click', function(event) {
        if (event.target === loginModal) closeModal();
    });

    window.addEventListener('message', function(event) {
        if (event.data && event.data.type === 'closeLogin') closeModal();
    });
}

function initMapFunctionality() {
    const mapsNav = document.getElementById('mapsNav');
    const mapModal = document.getElementById('mapModal');
    const mapClose = document.getElementById('mapClose');

    if (!mapsNav || !mapModal) return;

    mapsNav.addEventListener('click', function(e) {
        e.preventDefault();
        mapModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    });

    if (mapClose) {
        mapClose.addEventListener('click', function() {
            mapModal.style.display = 'none';
            document.body.style.overflow = '';
        });
    }

    // Close map modal when clicking outside
    mapModal.addEventListener('click', function(e) {
        if (e.target === this) {
            this.style.display = 'none';
            document.body.style.overflow = '';
        }
    });
}

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

function initHeaderScroll() {
    const header = document.querySelector('.header');
    if (!header) return;
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Vivas Trip website loaded successfully');
    
    // Initialize all components
    initHeroBanner();
    initLoginModal();
    initMapFunctionality();
    initSmoothScroll();
    initHeaderScroll();
    
    // Initialize map if needed
    if (typeof initMap === 'function') {
        initMap();
    }
});