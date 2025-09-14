
// Auto-generated update script for about section
// Generated at: 2025-09-14T19:49:11.041Z

const aboutContent = {
  "story": "From the baseball diamond to the boardroom, my journey demonstrates how athletic discipline transforms into business excellence.",
  "differentiators": [
    "Unique athletic-to-business trajectory",
    "Proven performance under pressure",
    "Data-driven analytical approach",
    "Team leadership experience",
    "Systematic optimization mindset"
  ],
  "approach": "Systematic, data-driven methodology with competitive edge",
  "results": "Proven track record of performance optimization and team leadership"
};

// Update DOM elements
document.addEventListener('DOMContentLoaded', function() {
  const sectionElement = document.querySelector('[data-section="about"]');
  if (sectionElement) {
    updateSectionContent(sectionElement, aboutContent);
  }
});

function updateSectionContent(element, content) {
  // Dynamic content update logic
  console.log('Updating about with:', content);
  
  // Add specific update logic based on section type
  
        if (content.story) {
          const storyEl = element.querySelector('.story');
          if (storyEl) storyEl.textContent = content.story;
        }
        if (content.differentiators) {
          updateDifferentiators(element, content.differentiators);
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

