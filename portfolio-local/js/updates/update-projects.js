
// Auto-generated update script for projects section
// Generated at: 2025-09-10T05:38:37.011Z

const projectsContent = {
  "featured": {
    "title": "Athletic Mindset in Business",
    "description": "Case study demonstrating how sports analytics principles drive business intelligence",
    "insights": [
      "Athletic discipline transfers to business execution",
      "Data-driven decision making advantage",
      "Competitive mindset drives results",
      "Systematic approach to performance optimization",
      "Team leadership from sports background"
    ],
    "impact": "Quantifiable improvement in decision-making and performance metrics"
  }
};

// Update DOM elements
document.addEventListener('DOMContentLoaded', function() {
  const sectionElement = document.querySelector('[data-section="projects"]');
  if (sectionElement) {
    updateSectionContent(sectionElement, projectsContent);
  }
});

function updateSectionContent(element, content) {
  // Dynamic content update logic
  console.log('Updating projects with:', content);
  
  // Add specific update logic based on section type
  
        if (content.featured) {
          updateFeaturedProject(element, content.featured);
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

