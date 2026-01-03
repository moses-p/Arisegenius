// Async CSS Loader - Loads CSS without blocking render
(function() {
    const loadCSS = function(href, media) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        if (media) link.media = media;
        document.head.appendChild(link);
    };

    // Load CSS files that were preloaded
    const preloadLinks = document.querySelectorAll('link[rel="preload"][as="style"]');
    preloadLinks.forEach((link) => {
        link.onload = function() {
            this.onload = null;
            this.rel = 'stylesheet';
        };
    });
})();

