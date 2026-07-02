/**
 * SEERAH - THE LIFE OF PROPHET MUHAMMAD (PBUH)
 * Phase 3B - JavaScript Animations, Interactions & Performance
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- CACHED SELECTORS & STATE ---
  const loader = document.getElementById('loader');
  const progressBar = document.getElementById('progressBar');
  const scrollToTopBtn = document.getElementById('scrollToTop');
  const header = document.querySelector('.header-wrapper');
  const burgerToggle = document.getElementById('burgerToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));
  const sections = Array.from(document.querySelectorAll('section, header'));
  const revealElements = Array.from(document.querySelectorAll('.reveal'));

  let scrollPending = false;
  let isMobileNavOpen = false;

  /* --- 1. LIGHTWEIGHT LOADING SCREEN --- */
  window.addEventListener('load', () => {
    if (loader) {
      loader.classList.add('fade-out');
      // Remove from accessibility tree after fade out transition completes
      setTimeout(() => {
        loader.setAttribute('aria-hidden', 'true');
        loader.style.display = 'none';
      }, 500);
    }
  });

  // Safe fallback if window load event already fired or delayed
  if (document.readyState === 'complete') {
    if (loader && !loader.classList.contains('fade-out')) {
      loader.classList.add('fade-out');
      setTimeout(() => {
        loader.setAttribute('aria-hidden', 'true');
        loader.style.display = 'none';
      }, 500);
    }
  }

  /* --- 2. PERFORMANCE-OPTIMIZED SCROLL DISPATCHER --- */
  // Throttle scroll triggers using RequestAnimationFrame for 60 FPS performance
  const onScroll = () => {
    if (!scrollPending) {
      scrollPending = true;
      requestAnimationFrame(handleScrollUpdates);
    }
  };

  const handleScrollUpdates = () => {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    
    // A. Sticky Nav Shrink State
    if (scrollY > 50) {
      header.classList.add('shrink');
    } else {
      header.classList.remove('shrink');
    }

    // B. Reading Progress Bar Updates
    if (docHeight > 0) {
      const scrollPercent = (scrollY / docHeight) * 100;
      progressBar.style.width = `${scrollPercent}%`;
    }

    // C. Scroll To Top Button Visibility & Accessibility Focus
    if (scrollY > 400) {
      if (!scrollToTopBtn.classList.contains('show')) {
        scrollToTopBtn.classList.add('show');
        scrollToTopBtn.setAttribute('tabindex', '0');
      }
    } else {
      if (scrollToTopBtn.classList.contains('show')) {
        scrollToTopBtn.classList.remove('show');
        scrollToTopBtn.setAttribute('tabindex', '-1');
      }
    }

    // D. Navigation Active Links Scroll Spy
    let currentActiveId = '';
    const isAtBottom = (window.innerHeight + scrollY) >= (document.documentElement.scrollHeight - 60);

    if (isAtBottom) {
      currentActiveId = 'references';
    } else {
      const scrollPosition = scrollY + 140; // Offset aligns with header height shrink threshold
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        
        if (scrollPosition >= sectionTop && scrollPosition < (sectionTop + sectionHeight)) {
          currentActiveId = section.getAttribute('id');
          break;
        }
      }
    }

    // Update active visual classes
    navLinks.forEach(link => {
      const linkHref = link.getAttribute('href');
      if (linkHref === `#${currentActiveId}` || (currentActiveId === 'home' && linkHref === '#home')) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    scrollPending = false;
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  handleScrollUpdates(); // Run initial status load

  /* --- 3. SCROLL TO TOP INTERACTION --- */
  scrollToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    // Return focus to logo for proper keyboard access flow
    const firstFocusable = document.querySelector('.logo');
    if (firstFocusable) {
      firstFocusable.focus();
    }
  });

  /* --- 4. SCROLL REVEAL VIA INTERSECTION OBSERVER --- */
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          // Stagger items if within a stagger-container
          const staggerContainer = entry.target.closest('.stagger-container');
          if (staggerContainer) {
            const children = staggerContainer.querySelectorAll('.reveal');
            children.forEach((child, index) => {
              child.style.transitionDelay = `${index * 0.1}s`;
            });
          }
          // Stop observing once animated to save cycles
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null, // Viewport
      threshold: 0.1, // Trigger when 10% visible
      rootMargin: '0px 0px -40px 0px' // Offset trigger point slightly from bottom edge
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    // Observer Fallback for legacy browsers: reveal everything immediately
    revealElements.forEach(el => el.classList.add('active'));
  }

  /* --- 5. ACCESSIBLE MOBILE MENU DRAWER & FOCUS MANAGEMENT --- */
  const toggleMobileMenu = () => {
    isMobileNavOpen = !isMobileNavOpen;
    burgerToggle.setAttribute('aria-expanded', isMobileNavOpen);
    burgerToggle.classList.toggle('active');
    navMenu.classList.toggle('active');

    if (isMobileNavOpen) {
      // Focus on first navigation link when drawer opens for a11y focus management
      setTimeout(() => {
        if (navLinks.length > 0) navLinks[0].focus();
      }, 300);
    } else {
      burgerToggle.focus();
    }
  };

  burgerToggle.addEventListener('click', toggleMobileMenu);

  // Close Mobile Menu on link selection
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (isMobileNavOpen) {
        toggleMobileMenu();
      }
    });
  });

  // Escape key closes mobile navigation menu
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isMobileNavOpen) {
      toggleMobileMenu();
    }
  });

  // Accessibility keyboard focus trap in mobile menu drawer
  navMenu.addEventListener('keydown', (e) => {
    if (!isMobileNavOpen || e.key !== 'Tab') return;
    
    const focusableElements = navMenu.querySelectorAll('a');
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      // If pressing Shift + Tab, loop to last item
      if (document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      }
    } else {
      // If pressing Tab, loop to first item
      if (document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  });
});
