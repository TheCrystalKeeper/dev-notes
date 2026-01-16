/// <summary>
/// Main JavaScript functionality for the website
/// </summary>
document.addEventListener('DOMContentLoaded', function() {
    initializeSite();
});

function initializeSite() {
    initializeTheme();
    initializeMobileNav();
    addSmoothScrolling();
    addAnimationOnScroll();
}

function initializeMobileNav() {
    const toggle = document.querySelector('[data-nav-toggle]');
    const menu = document.querySelector('[data-nav-menu]');
    if (!toggle || !menu) return;

    const root = document.documentElement;
    const setOpen = (open) => {
        root.classList.toggle('nav-open', open);
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };

    setOpen(false);

    toggle.addEventListener('click', function () {
        const open = root.classList.contains('nav-open');
        setOpen(!open);
    });

    document.addEventListener('click', function (e) {
        if (!root.classList.contains('nav-open')) return;
        if (menu.contains(e.target) || toggle.contains(e.target)) return;
        setOpen(false);
    });

    menu.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', function () {
            setOpen(false);
        });
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') setOpen(false);
    });
}

function initializeTheme() {
    const root = document.documentElement;
    const button = document.querySelector('[data-theme-toggle]');
    if (!button) return;

    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial = saved || (prefersDark ? 'dark' : 'light');

    setTheme(initial);

    button.addEventListener('click', function () {
        const current = root.getAttribute('data-theme') || initial;
        const next = current === 'dark' ? 'light' : 'dark';
        setTheme(next);
        localStorage.setItem('theme', next);
    });

    function setTheme(theme) {
        root.setAttribute('data-theme', theme);
        button.textContent = theme === 'dark' ? 'Light' : 'Dark';
        button.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    }
}

function addSmoothScrolling() {
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

function addAnimationOnScroll() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.project-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
}

