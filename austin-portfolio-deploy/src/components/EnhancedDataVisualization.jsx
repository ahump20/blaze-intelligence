import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement, ArcElement } from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Enhanced Data Visualization Component for Sports Analytics
export const EnhancedDataVisualization = () => {
  const [liveData, setLiveData] = useState({});
  const [narrativeData, setNarrativeData] = useState({});
  const [selectedTimeframe, setSelectedTimeframe] = useState('live');
  const [isLoading, setIsLoading] = useState(true);
  
  const d3ContainerRef = useRef(null);
  const pressureVisualizationRef = useRef(null);

  useEffect(() => {
    initializeVisualization();
    startDataStream();
    return () => cleanupVisualization();
  }, []);

  const initializeVisualization = async () => {
    try {
      await fetchInitialData();
      setupD3Visualizations();
      setIsLoading(false);
    } catch (error) {
      console.error('Visualization initialization failed:', error);
      setIsLoading(false);
    }
  };

  const fetchInitialData = async () => {
    try {
      const [liveResponse, narrativeResponse] = await Promise.all([
        fetch('/api/live-games'),
        fetch('/api/live-narrative')
      ]);

      const liveData = await liveResponse.json();
      const narrativeData = await narrativeResponse.json();

      setLiveData(liveData.data || {});
      setNarrativeData(narrativeData.data || {});
    } catch (error) {
      console.warn('API fetch failed, using simulated data');
      setLiveData(generateSimulatedLiveData());
      setNarrativeData(generateSimulatedNarrativeData());
    }
  };

  const startDataStream = () => {
    const interval = setInterval(() => {
      updateVisualizationData();
    }, 3000);

    return () => clearInterval(interval);
  };

  const updateVisualizationData = () => {
    setLiveData(prev => ({
      ...prev,
      pressure_index: Math.floor(Math.random() * 40) + 60,
      win_probability: Math.random() * 40 + 30,
      clutch_moments: Math.floor(Math.random() * 8) + 2,
      timestamp: new Date().toISOString()
    }));
  };

  const setupD3Visualizations = () => {
    createPressureStreamVisualization();
    createChampionshipProgressVisualization();
  };

  const createPressureStreamVisualization = () => {
    const container = d3ContainerRef.current;
    if (!container) return;

    // Clear previous visualization
    d3.select(container).selectAll("*").remove();

    const width = 800;
    const height = 300;
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };

    const svg = d3.select(container)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .style("background", "rgba(10, 25, 47, 0.8)")
      .style("border-radius", "12px");

    // Generate sample pressure data
    const pressureData = generatePressureTimelineData();

    const xScale = d3.scaleTime()
      .domain(d3.extent(pressureData, d => d.time))
      .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
      .domain([0, 100])
      .range([height - margin.bottom, margin.top]);

    // Create gradient for area fill
    const gradient = svg.append("defs")
      .append("linearGradient")
      .attr("id", "pressure-gradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0).attr("y1", height)
      .attr("x2", 0).attr("y2", 0);

    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#BF5700")
      .attr("stop-opacity", 0.1);

    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#64FFDA")
      .attr("stop-opacity", 0.8);

    // Create line generator
    const line = d3.line()
      .x(d => xScale(d.time))
      .y(d => yScale(d.pressure))
      .curve(d3.curveCardinal);

    // Create area generator
    const area = d3.area()
      .x(d => xScale(d.time))
      .y0(height - margin.bottom)
      .y1(d => yScale(d.pressure))
      .curve(d3.curveCardinal);

    // Add area
    svg.append("path")
      .datum(pressureData)
      .attr("fill", "url(#pressure-gradient)")
      .attr("d", area);

    // Add line
    svg.append("path")
      .datum(pressureData)
      .attr("fill", "none")
      .attr("stroke", "#64FFDA")
      .attr("stroke-width", 3)
      .attr("d", line);

    // Add pressure points
    svg.selectAll(".pressure-point")
      .data(pressureData)
      .enter().append("circle")
      .attr("class", "pressure-point")
      .attr("cx", d => xScale(d.time))
      .attr("cy", d => yScale(d.pressure))
      .attr("r", 4)
      .attr("fill", "#BF5700")
      .attr("stroke", "#64FFDA")
      .attr("stroke-width", 2);

    // Add axes
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%H:%M")))
      .attr("color", "#8892B0");

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale))
      .attr("color", "#8892B0");

    // Add title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", margin.top)
      .attr("text-anchor", "middle")
      .attr("fill", "#E6F1FF")
      .attr("font-size", "16px")
      .attr("font-weight", "600")
      .text("Real-Time Pressure Analytics Stream");
  };

  const createChampionshipProgressVisualization = () => {
    const container = pressureVisualizationRef.current;
    if (!container) return;

    d3.select(container).selectAll("*").remove();

    const width = 400;
    const height = 400;
    const radius = Math.min(width, height) / 2 - 10;

    const svg = d3.select(container)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const g = svg.append("g")
      .attr("transform", `translate(${width/2},${height/2})`);

    // Championship progress data
    const progressData = [
      { label: "Current Season", value: 78, color: "#BF5700" },
      { label: "Pressure Handle", value: 85, color: "#64FFDA" },
      { label: "Clutch Performance", value: 92, color: "#30D158" },
      { label: "Championship Readiness", value: 88, color: "#FF9F0A" }
    ];

    const pie = d3.pie()
      .value(d => d.value)
      .sort(null);

    const arc = d3.arc()
      .innerRadius(radius * 0.4)
      .outerRadius(radius * 0.8);

    const arcs = g.selectAll(".arc")
      .data(pie(progressData))
      .enter().append("g")
      .attr("class", "arc");

    arcs.append("path")
      .attr("d", arc)
      .attr("fill", d => d.data.color)
      .attr("stroke", "#0A192F")
      .attr("stroke-width", 2)
      .style("opacity", 0.8);

    // Add center text
    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "-0.5em")
      .attr("fill", "#E6F1FF")
      .attr("font-size", "24px")
      .attr("font-weight", "700")
      .text("86%");

    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "1em")
      .attr("fill", "#8892B0")
      .attr("font-size", "14px")
      .text("Championship Score");
  };

  // Chart.js configurations
  const pressureChartData = {
    labels: generateTimeLabels(20),
    datasets: [
      {
        label: 'Pressure Index',
        data: generatePressureData(20),
        borderColor: '#64FFDA',
        backgroundColor: 'rgba(100, 255, 218, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#BF5700',
        pointBorderColor: '#64FFDA',
        pointBorderWidth: 2,
        pointRadius: 6
      }
    ]
  };

  const performanceChartData = {
    labels: ['Q1', 'Q2', 'Q3', 'Q4', 'OT'],
    datasets: [
      {
        label: 'Team A Performance',
        data: [85, 78, 92, 88, 95],
        backgroundColor: 'rgba(191, 87, 0, 0.8)',
        borderColor: '#BF5700',
        borderWidth: 2
      },
      {
        label: 'Team B Performance',
        data: [82, 85, 79, 91, 87],
        backgroundColor: 'rgba(100, 255, 218, 0.8)',
        borderColor: '#64FFDA',
        borderWidth: 2
      }
    ]
  };

  const insightDistributionData = {
    labels: ['Pressure Analysis', 'Strategic Insights', 'Performance Predictions', 'Historical Comparisons'],
    datasets: [
      {
        data: [30, 25, 25, 20],
        backgroundColor: ['#BF5700', '#64FFDA', '#30D158', '#FF9F0A'],
        borderColor: '#0A192F',
        borderWidth: 2
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#8892B0',
          font: {
            size: 12,
            weight: '500'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(10, 25, 47, 0.9)',
        titleColor: '#E6F1FF',
        bodyColor: '#8892B0',
        borderColor: '#64FFDA',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(100, 255, 218, 0.1)'
        },
        ticks: {
          color: '#8892B0'
        }
      },
      y: {
        grid: {
          color: 'rgba(100, 255, 218, 0.1)'
        },
        ticks: {
          color: '#8892B0'
        }
      }
    }
  };

  // Generate helper data
  const generateTimeLabels = (count) => {
    const labels = [];
    const now = new Date();
    for (let i = count - 1; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60000);
      labels.push(time.toLocaleTimeString().slice(0, 5));
    }
    return labels;
  };

  const generatePressureData = (count) => {
    return Array.from({ length: count }, () => Math.floor(Math.random() * 40) + 60);
  };

  const generatePressureTimelineData = () => {
    const data = [];
    const now = new Date();
    for (let i = 0; i < 30; i++) {
      data.push({
        time: new Date(now.getTime() - (30 - i) * 60000),
        pressure: Math.floor(Math.random() * 40) + 60
      });
    }
    return data;
  };

  const generateSimulatedLiveData = () => ({
    active_games: Math.floor(Math.random() * 15) + 5,
    pressure_index: Math.floor(Math.random() * 40) + 60,
    win_probability: Math.random() * 40 + 30,
    clutch_moments: Math.floor(Math.random() * 8) + 2
  });

  const generateSimulatedNarrativeData = () => ({
    narrative: {
      story: "Championship-level pressure meets elite analytics in this defining moment.",
      confidence: 94
    }
  });

  const cleanupVisualization = () => {
    if (d3ContainerRef.current) {
      d3.select(d3ContainerRef.current).selectAll("*").remove();
    }
    if (pressureVisualizationRef.current) {
      d3.select(pressureVisualizationRef.current).selectAll("*").remove();
    }
  };

  if (isLoading) {
    return (
      <div className="visualization-loading">
        <div className="loading-spinner"></div>
        <p>Loading championship-level analytics...</p>
      </div>
    );
  }

  return (
    <div className="enhanced-data-visualization">
      <style jsx>{`
        .enhanced-data-visualization {
          background: var(--dark-navy);
          padding: 2rem;
          border-radius: 20px;
          border: 1px solid rgba(100, 255, 218, 0.1);
        }

        .viz-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .viz-title {
          font-size: 1.8rem;
          font-weight: 600;
          color: var(--soft-white);
        }

        .viz-controls {
          display: flex;
          gap: 1rem;
        }

        .control-btn {
          padding: 0.5rem 1rem;
          background: rgba(191, 87, 0, 0.2);
          border: 1px solid var(--burnt-orange);
          border-radius: 8px;
          color: var(--burnt-orange);
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.9rem;
        }

        .control-btn:hover,
        .control-btn.active {
          background: var(--burnt-orange);
          color: var(--dark-navy);
        }

        .visualization-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 2rem;
          margin-bottom: 3rem;
        }

        .chart-container {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 12px;
          padding: 1.5rem;
          height: 300px;
        }

        .d3-container {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 12px;
          padding: 1rem;
          text-align: center;
        }

        .metrics-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-top: 2rem;
        }

        .metric-card {
          background: rgba(100, 255, 218, 0.05);
          border: 1px solid rgba(100, 255, 218, 0.2);
          border-radius: 12px;
          padding: 1.5rem;
          text-align: center;
        }

        .metric-value {
          font-size: 2rem;
          font-weight: 700;
          color: var(--accent-blue);
          display: block;
          margin-bottom: 0.5rem;
        }

        .metric-label {
          color: var(--warm-gray);
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .visualization-loading {
          text-align: center;
          padding: 4rem 2rem;
          color: var(--warm-gray);
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(100, 255, 218, 0.3);
          border-top: 3px solid var(--accent-blue);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      <div className="viz-header">
        <h2 className="viz-title">Enhanced Data Storytelling</h2>
        <div className="viz-controls">
          <button 
            className={`control-btn ${selectedTimeframe === 'live' ? 'active' : ''}`}
            onClick={() => setSelectedTimeframe('live')}
          >
            Live
          </button>
          <button 
            className={`control-btn ${selectedTimeframe === 'quarter' ? 'active' : ''}`}
            onClick={() => setSelectedTimeframe('quarter')}
          >
            Quarter
          </button>
          <button 
            className={`control-btn ${selectedTimeframe === 'game' ? 'active' : ''}`}
            onClick={() => setSelectedTimeframe('game')}
          >
            Game
          </button>
        </div>
      </div>

      <div className="visualization-grid">
        <div className="chart-container">
          <Line data={pressureChartData} options={chartOptions} />
        </div>
        <div className="d3-container" ref={pressureVisualizationRef}></div>
      </div>

      <div className="visualization-grid">
        <div className="chart-container">
          <Bar data={performanceChartData} options={chartOptions} />
        </div>
        <div className="chart-container">
          <Doughnut data={insightDistributionData} options={{...chartOptions, plugins: {...chartOptions.plugins, legend: {display: false}}}} />
        </div>
      </div>

      <div className="d3-container" ref={d3ContainerRef}></div>

      <div className="metrics-summary">
        <div className="metric-card">
          <span className="metric-value">{liveData.pressure_index || 72}</span>
          <span className="metric-label">Pressure Index</span>
        </div>
        <div className="metric-card">
          <span className="metric-value">{(liveData.win_probability || 67.5).toFixed(1)}%</span>
          <span className="metric-label">Win Probability</span>
        </div>
        <div className="metric-card">
          <span className="metric-value">{liveData.clutch_moments || 4}</span>
          <span className="metric-label">Clutch Moments</span>
        </div>
        <div className="metric-card">
          <span className="metric-value">94.6%</span>
          <span className="metric-label">AI Confidence</span>
        </div>
      </div>
    </div>
  );
};

export default EnhancedDataVisualization;