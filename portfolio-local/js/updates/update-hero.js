
// Auto-generated update script for hero section
// Generated at: 2025-09-10T05:38:37.011Z

const heroContent = {
  "tagline": "Memphis-raised, Texas-sharpened athlete-executive bringing systematic thinking and competitive edge to sports analytics",
  "stats": {
    "trajectory": "From .312 batting average to 95% project completion rate",
    "advantage": "Athletic mindset drives business excellence",
    "approach": "Data-driven decision making with competitive edge"
  },
  "cta": "Experience the AI-powered digital combine"
};

// Update DOM elements
document.addEventListener('DOMContentLoaded', function() {
  const sectionElement = document.querySelector('[data-section="hero"]');
  if (sectionElement) {
    updateSectionContent(sectionElement, heroContent);
  }
});

function updateSectionContent(element, content) {
  // Dynamic content update logic
  console.log('Updating hero with:', content);
  
  // Add specific update logic based on section type
  
        if (content.tagline) {
          const taglineEl = element.querySelector('.tagline');
          if (taglineEl) taglineEl.textContent = content.tagline;
        }
        if (content.stats) {
          updateStats(element, content.stats);
        }
      
}

// Section-specific update functions

function updateStats(element, stats) {
  Object.entries(stats).forEach(([key, value]) => {
    const statEl = element.querySelector(`[data-stat="${key}"]`);
    if (statEl) statEl.textContent = value;
  });
}

function updateMetrics(element, metrics) {
  const metricsContainer = element.querySelector('.metrics-container');
  if (metricsContainer) {
    metricsContainer.innerHTML = metrics.map(metric => 
      `<div class="metric-item">${metric}</div>`
    ).join('');
  }
}

function updateInsights(element, insights) {
  const insightsContainer = element.querySelector('.insights-container');
  if (insightsContainer) {
    insightsContainer.innerHTML = insights.map(insight => 
      `<div class="insight-item">${insight}</div>`
    ).join('');
  }
}

function updateDifferentiators(element, differentiators) {
  const diffContainer = element.querySelector('.differentiators-container');
  if (diffContainer) {
    diffContainer.innerHTML = differentiators.map(diff => 
      `<div class="differentiator-item">${diff}</div>`
    ).join('');
  }
}

function updateFeaturedProject(element, project) {
  const titleEl = element.querySelector('.featured-title');
  const descEl = element.querySelector('.featured-description');
  
  if (titleEl) titleEl.textContent = project.title;
  if (descEl) descEl.textContent = project.description;
}

