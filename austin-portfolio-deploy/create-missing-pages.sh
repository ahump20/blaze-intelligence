#!/bin/bash

# Create Missing Pages Script for Blaze Intelligence Platform
# This script creates placeholder pages for all broken links

echo "🔥 Creating missing pages for Blaze Intelligence Platform..."

# List of pages that need to be created
pages=(
    "analytics.html"
    "nil-calculator-advanced.html"
    "sec-nil-analytics.html"
    "performance-monitor.html"
    "sec-football-enhanced.html"
    "championship-ai-analytics.html"
    "digital-combine.html"
    "deep-south-sports-authority.html"
    "cardinals-intelligence-dashboard.html"
    "perfect-game-enhanced.html"
    "pricing.html"
    "roi-calculator.html"
    "contact.html"
    "demo.html"
    "login.html"
    "signup.html"
    "about.html"
    "privacy.html"
    "terms.html"
    "api-docs.html"
    "blog.html"
    "careers.html"
    "character-assessment.html"
)

# Template for placeholder pages
create_page() {
    local filename=$1
    local title=$2
    local description=$3

    cat > "$filename" << EOF
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>$title | Blaze Intelligence</title>
    <style>
        :root {
            --primary-orange: #BF5700;
            --championship-gold: #FFD700;
            --bg-primary: #0a0e27;
            --text-primary: #e0e6ed;
        }

        body {
            font-family: 'Inter', -apple-system, sans-serif;
            background: linear-gradient(135deg, #0a0e27, #1a1a2e);
            color: #e0e6ed;
            margin: 0;
            padding: 0;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }

        .container {
            text-align: center;
            max-width: 800px;
            padding: 2rem;
        }

        h1 {
            font-size: 3rem;
            background: linear-gradient(135deg, #BF5700, #FFD700);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 1rem;
        }

        p {
            font-size: 1.2rem;
            color: #8892b0;
            margin-bottom: 2rem;
        }

        .btn {
            display: inline-block;
            background: linear-gradient(135deg, #BF5700, #FFD700);
            color: white;
            padding: 1rem 2rem;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            transition: transform 0.3s ease;
        }

        .btn:hover {
            transform: translateY(-2px);
        }

        .nav-links {
            margin-top: 3rem;
            display: flex;
            gap: 2rem;
            justify-content: center;
            flex-wrap: wrap;
        }

        .nav-links a {
            color: #9BCBEB;
            text-decoration: none;
            transition: color 0.3s ease;
        }

        .nav-links a:hover {
            color: #FFD700;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>$title</h1>
        <p>$description</p>
        <a href="/" class="btn">Return to Home</a>

        <div class="nav-links">
            <a href="/realtime-multimodal-dashboard.html">RTI Dashboard</a>
            <a href="/sports-intelligence-dashboard.html">Sports Intelligence</a>
            <a href="/enhanced-index.html">Enhanced Platform</a>
        </div>
    </div>
</body>
</html>
EOF

    echo "✅ Created: $filename"
}

# Create each missing page
create_page "analytics.html" "Advanced Analytics" "Deep performance insights and data visualization for championship-level sports intelligence."
create_page "nil-calculator-advanced.html" "NIL Calculator" "Advanced Name, Image, and Likeness valuation tool with 2025-26 program data."
create_page "sec-nil-analytics.html" "SEC NIL Analytics" "Conference-specific NIL analytics for SEC programs and athletes."
create_page "performance-monitor.html" "Performance Monitor" "Real-time system performance monitoring and analytics."
create_page "sec-football-enhanced.html" "SEC Football Analytics" "Elite college football analytics for SEC conference teams."
create_page "championship-ai-analytics.html" "Championship AI" "AI-powered championship predictions and performance modeling."
create_page "digital-combine.html" "Digital Combine™" "Virtual athlete assessment platform with biomechanical analysis."
create_page "deep-south-sports-authority.html" "Deep South Sports Authority" "Regional sports intelligence for Deep South athletics."
create_page "cardinals-intelligence-dashboard.html" "Cardinals Intelligence" "St. Louis Cardinals MLB analytics dashboard."
create_page "perfect-game-enhanced.html" "Perfect Game Baseball" "Youth baseball analytics and player development platform."
create_page "pricing.html" "Pricing Plans" "Flexible subscription options for teams and organizations."
create_page "roi-calculator.html" "ROI Calculator" "Calculate your return on investment with Blaze Intelligence."
create_page "contact.html" "Contact Us" "Get in touch with the Blaze Intelligence team."
create_page "demo.html" "Request Demo" "Schedule a personalized demo of our platform."
create_page "login.html" "Login" "Access your Blaze Intelligence account."
create_page "signup.html" "Sign Up" "Create your Blaze Intelligence account."
create_page "about.html" "About Us" "Learn about Blaze Intelligence and our mission."
create_page "privacy.html" "Privacy Policy" "Our commitment to protecting your data."
create_page "terms.html" "Terms of Service" "Terms and conditions for using Blaze Intelligence."
create_page "api-docs.html" "API Documentation" "Developer documentation for Blaze Intelligence APIs."
create_page "blog.html" "Blog" "Latest insights and updates from Blaze Intelligence."
create_page "careers.html" "Careers" "Join the Blaze Intelligence team."
create_page "character-assessment.html" "Character Assessment" "Advanced micro-expression and biomechanical analysis."

echo "🏆 All missing pages created successfully!"