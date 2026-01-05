// ===== Chill Air Main JavaScript =====

document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initScrollEffects();
    initReviewsSlider();
    initContactForm();
    initSmoothScroll();
    initGalleryLightbox();
});

// ===== Navigation =====
function initNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const navClose = document.getElementById('nav-close');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav__link');
    const header = document.getElementById('header');

    // Mobile menu toggle - using event delegation for reliability
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            navMenu.classList.add('active');
            document.body.style.overflow = 'hidden';
            console.log('Menu opened'); // Debug
        });
    }

    if (navClose && navMenu) {
        navClose.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
            console.log('Menu closed'); // Debug
        });
    }

    // Close menu on link click
    navLinks.forEach(function(link) {
        link.addEventListener('click', function() {
            if (navMenu) {
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });

    // Close menu on outside click
    document.addEventListener('click', function(e) {
        if (navMenu && navMenu.classList.contains('active')) {
            if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
    });

    // Header scroll effect
    if (header) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // Active link on scroll
    const sections = document.querySelectorAll('section[id]');
    
    window.addEventListener('scroll', function() {
        const scrollY = window.scrollY;
        
        sections.forEach(function(section) {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 150;
            const sectionId = section.getAttribute('id');
            const navLink = document.querySelector('.nav__link[href="#' + sectionId + '"]');
            
            if (navLink) {
                if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                    navLinks.forEach(function(link) {
                        link.classList.remove('active');
                    });
                    navLink.classList.add('active');
                }
            }
        });
    });
}

// ===== Scroll Effects =====
function initScrollEffects() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.service-card, .about__content, .about__image').forEach(function(el) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// ===== Reviews Slider - Completely Rebuilt =====
function initReviewsSlider() {
    const slider = document.getElementById('reviews-slider');
    if (!slider) return;

    const track = slider.querySelector('.reviews__track');
    const cards = slider.querySelectorAll('.review-card');
    const prevBtn = document.getElementById('reviews-prev');
    const nextBtn = document.getElementById('reviews-next');
    const dotsContainer = document.getElementById('reviews-dots');

    if (!track || cards.length === 0) return;

    let currentSlide = 0;
    let autoPlayInterval;
    
    // Calculate slides based on viewport
    function getCardsPerView() {
        if (window.innerWidth <= 768) return 1;
        if (window.innerWidth <= 1024) return 2;
        return 3;
    }
    
    function getTotalSlides() {
        const cardsPerView = getCardsPerView();
        return Math.ceil(cards.length / cardsPerView);
    }

    // Create navigation dots
    function createDots() {
        if (!dotsContainer) return;
        dotsContainer.innerHTML = '';
        const totalSlides = getTotalSlides();
        
        for (let i = 0; i < totalSlides; i++) {
            const dot = document.createElement('div');
            dot.classList.add('reviews__dot');
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', function() {
                goToSlide(i);
            });
            dotsContainer.appendChild(dot);
        }
    }

    // Update slider position
    function updateSlider() {
        const cardsPerView = getCardsPerView();
        const gap = 24; // matches CSS gap
        const cardWidth = cards[0].offsetWidth;
        const moveAmount = (cardWidth + gap) * cardsPerView;
        const offset = currentSlide * moveAmount;
        
        track.style.transform = 'translateX(-' + offset + 'px)';
        
        // Update dots
        const dots = dotsContainer ? dotsContainer.querySelectorAll('.reviews__dot') : [];
        dots.forEach(function(dot, i) {
            if (i === currentSlide) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    // Go to specific slide
    function goToSlide(index) {
        const totalSlides = getTotalSlides();
        currentSlide = Math.max(0, Math.min(index, totalSlides - 1));
        updateSlider();
    }

    // Next slide
    function nextSlide() {
        const totalSlides = getTotalSlides();
        currentSlide = (currentSlide + 1) % totalSlides;
        updateSlider();
    }

    // Previous slide
    function prevSlide() {
        const totalSlides = getTotalSlides();
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        updateSlider();
    }

    // Auto-play
    function startAutoPlay() {
        stopAutoPlay();
        autoPlayInterval = setInterval(nextSlide, 5000);
    }

    function stopAutoPlay() {
        if (autoPlayInterval) {
            clearInterval(autoPlayInterval);
        }
    }

    // Event listeners
    if (prevBtn) {
        prevBtn.addEventListener('click', function(e) {
            e.preventDefault();
            prevSlide();
            stopAutoPlay();
            startAutoPlay();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', function(e) {
            e.preventDefault();
            nextSlide();
            stopAutoPlay();
            startAutoPlay();
        });
    }

    // Touch/Swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    track.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
        stopAutoPlay();
    }, { passive: true });

    track.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
        startAutoPlay();
    }, { passive: true });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (diff > swipeThreshold) {
            nextSlide();
        } else if (diff < -swipeThreshold) {
            prevSlide();
        }
    }

    // Pause on hover
    slider.addEventListener('mouseenter', stopAutoPlay);
    slider.addEventListener('mouseleave', startAutoPlay);

    // Handle resize
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            createDots();
            currentSlide = 0;
            updateSlider();
        }, 250);
    });

    // Initialize
    createDots();
    updateSlider();
    startAutoPlay();
}

// ===== Contact Form =====
function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Simple validation
        if (!data.name || !data.email || !data.message) {
            showNotification('Please fill in all required fields.', 'error');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            showNotification('Please enter a valid email address.', 'error');
            return;
        }

        // Show success message
        showNotification('Thanks for your message! We\'ll be in touch soon.', 'success');
        form.reset();
    });
}

// Notification helper
function showNotification(message, type) {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = 'notification notification--' + type;
    notification.innerHTML = '<span>' + message + '</span><button onclick="this.parentElement.remove()">×</button>';
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(function() {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// ===== Smooth Scroll =====
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ===== Gallery Lightbox =====
function initGalleryLightbox() {
    const lightbox = document.getElementById('gallery-lightbox');
    if (!lightbox) return;
    
    const lightboxImg = lightbox.querySelector('.gallery__lightbox-img');
    const closeBtn = lightbox.querySelector('.gallery__lightbox-close');
    const galleryItems = document.querySelectorAll('.gallery__item[data-src]');

    // Open lightbox
    galleryItems.forEach(function(item) {
        item.addEventListener('click', function() {
            const src = this.getAttribute('data-src');
            if (src && lightboxImg) {
                lightboxImg.src = src;
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    // Close lightbox
    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeLightbox);
    }

    // Close on backdrop click
    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // Close on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });
}

// ===== Portal Functions (if on portal page) =====
if (document.querySelector('.portal-body')) {
    initPortal();
}

function initPortal() {
    // Tab switching for admin login
    const tabs = document.querySelectorAll('.login-tab');
    const forms = document.querySelectorAll('.login-form-container');
    
    tabs.forEach(function(tab) {
        tab.addEventListener('click', function() {
            const target = this.dataset.tab;
            
            // Update tabs
            tabs.forEach(function(t) {
                t.classList.remove('active');
            });
            this.classList.add('active');
            
            // Update forms
            forms.forEach(function(form) {
                if (form.id === target + '-form') {
                    form.classList.add('active');
                } else {
                    form.classList.remove('active');
                }
            });
        });
    });
}
