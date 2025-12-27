// Custom JavaScript for n8n MCP Workflow Builder Documentation

// Add copy button feedback
document.addEventListener('DOMContentLoaded', function() {
  // Add click event listeners to all copy buttons
  document.querySelectorAll('.md-clipboard').forEach(function(button) {
    button.addEventListener('click', function() {
      // Show copied feedback
      const originalTitle = button.getAttribute('title');
      button.setAttribute('title', 'Copied!');

      // Reset after 2 seconds
      setTimeout(function() {
        button.setAttribute('title', originalTitle);
      }, 2000);
    });
  });

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href !== '#') {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  });

  // Add external link indicators
  document.querySelectorAll('a[href^="http"]').forEach(function(link) {
    if (!link.hostname.includes('github.io')) {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    }
  });

  // Track outbound links (if analytics is enabled)
  if (typeof gtag !== 'undefined') {
    document.querySelectorAll('a[href^="http"]').forEach(function(link) {
      link.addEventListener('click', function() {
        gtag('event', 'click', {
          'event_category': 'outbound',
          'event_label': this.href,
          'transport_type': 'beacon'
        });
      });
    });
  }

  // Add version selector functionality (if needed in future)
  // This is a placeholder for mike version provider
  console.log('n8n MCP Workflow Builder Documentation - v0.9.1');
});

// Add keyboard shortcut for search (/)
document.addEventListener('keydown', function(e) {
  if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
    e.preventDefault();
    const searchInput = document.querySelector('.md-search__input');
    if (searchInput) {
      searchInput.focus();
    }
  }
});

// Add dark mode toggle persistence
document.addEventListener('DOMContentLoaded', function() {
  const toggle = document.querySelector('[data-md-color-scheme]');
  if (toggle) {
    toggle.addEventListener('click', function() {
      const currentScheme = document.body.getAttribute('data-md-color-scheme');
      localStorage.setItem('preferredColorScheme', currentScheme);
    });
  }

  // Restore preferred color scheme
  const preferredScheme = localStorage.getItem('preferredColorScheme');
  if (preferredScheme) {
    document.body.setAttribute('data-md-color-scheme', preferredScheme);
  }
});
