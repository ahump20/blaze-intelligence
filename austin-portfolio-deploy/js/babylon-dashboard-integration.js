/**
 * BABYLON.JS DASHBOARD INTEGRATION
 * Connects championship graphics engine with existing Blaze Intelligence dashboards
 * Provides real-time 3D visualizations for Cardinals, Titans, Longhorns, Grizzlies
 */

class BabylonDashboardIntegration {
    constructor() {
        this.engines = new Map();
        this.activeVisualizations = new Map();
        this.dataStreams = new Map();

        // SportsDataIO integration
        this.apiEndpoint = '/.netlify/functions/sportsdataio-proxy';
        this.updateInterval = 10000; // 10 seconds for real-time updates

        // Team configurations
        this.teams = {
            cardinals: {
                sport: 'mlb',
                colors: { primary: '#C41E3A', secondary: '#0C2340' },
                venue: 'busch',
                visualizations: ['field', 'trajectory', 'heatmap', 'lineup']
            },
            titans: {
                sport: 'nfl',
                colors: { primary: '#0C2340', secondary: '#418FDE' },
                venue: 'nissan',
                visualizations: ['field', 'routes', 'pressure', 'formation']
            },
            longhorns: {
                sport: 'ncaa',
                colors: { primary: '#BF5700', secondary: '#FFFFFF' },
                venue: 'dkr',
                visualizations: ['field', 'recruiting', 'nil', 'analytics']
            },
            grizzlies: {
                sport: 'nba',
                colors: { primary: '#5D76A9', secondary: '#12173F' },
                venue: 'fedexforum',
                visualizations: ['court', 'shotchart', 'movement', 'matchup']
            }
        };
    }

    /**
     * Initialize 3D visualization for a dashboard
     */
    async initializeDashboard(containerId, team, visualizationType = 'field') {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container ${containerId} not found`);
            return null;
        }

        // Create canvas for Babylon.js
        const canvas = document.createElement('canvas');
        canvas.className = 'babylon-3d-canvas';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        container.appendChild(canvas);

        // Initialize Babylon engine
        const engine = new BlazeGraphicsEngine(canvas.id || 'babylon-' + Date.now());
        await engine.initialize();

        // Store engine reference
        this.engines.set(containerId, engine);

        // Load team-specific venue
        await this.loadTeamVenue(engine, team);

        // Start visualization
        await this.startVisualization(engine, team, visualizationType);

        // Connect to real-time data
        this.connectDataStream(containerId, team);

        return engine;
    }

    /**
     * Load procedural venue for team
     */
    async loadTeamVenue(engine, teamKey) {
        const team = this.teams[teamKey];
        if (!team) {
            console.error(`Team ${teamKey} not configured`);
            return;
        }

        switch (team.sport) {
            case 'mlb':
                await engine.generateMLBPark(teamKey);
                this.setupBaseballVisualizations(engine);
                break;

            case 'nfl':
            case 'ncaa':
                await engine.generateNFLStadium(teamKey);
                this.setupFootballVisualizations(engine);
                break;

            case 'nba':
                await this.generateNBAArena(engine, teamKey);
                this.setupBasketballVisualizations(engine);
                break;
        }

        // Apply team colors
        this.applyTeamBranding(engine, team);
    }

    /**
     * Generate NBA arena (extending base engine)
     */
    async generateNBAArena(engine, team) {
        const scene = engine.scene;

        // Create basketball court
        const court = BABYLON.MeshBuilder.CreateGround("court", {
            width: 94, // NBA court dimensions in feet
            height: 50,
            subdivisions: 32
        }, scene);

        // Court material with team colors
        const courtMat = new BABYLON.PBRMaterial("courtMat", scene);
        courtMat.albedoTexture = this.generateCourtTexture(engine, team);
        courtMat.metallic = 0.1;
        courtMat.roughness = 0.3;

        if (engine.rtEngine) {
            courtMat.enableRayTracedReflections = true;
        }

        court.material = courtMat;

        // Add hoops
        this.addBasketballHoops(scene);

        // Generate arena seating
        const arena = BABYLON.MeshBuilder.CreateCylinder("arena", {
            height: 100,
            diameterTop: 200,
            diameterBottom: 150,
            tessellation: 64
        }, scene);

        arena.position.y = 50;

        // Setup camera for court view
        const camera = new BABYLON.UniversalCamera("courtCam",
            new BABYLON.Vector3(0, 80, -100), scene);
        camera.setTarget(BABYLON.Vector3.Zero());
        camera.attachControl(engine.canvas, true);
        engine.camera = camera;
    }

    /**
     * Generate dynamic court texture
     */
    generateCourtTexture(engine, team) {
        const dynamicTexture = new BABYLON.DynamicTexture("courtTexture",
            {width: 2048, height: 1024}, engine.scene);

        const ctx = dynamicTexture.getContext();

        // Wood floor base
        ctx.fillStyle = '#D2691E';
        ctx.fillRect(0, 0, 2048, 1024);

        // Court lines
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 8;

        // Center circle
        ctx.beginPath();
        ctx.arc(1024, 512, 120, 0, Math.PI * 2);
        ctx.stroke();

        // Three-point lines
        ctx.beginPath();
        ctx.arc(256, 512, 280, -Math.PI/2, Math.PI/2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(1792, 512, 280, Math.PI/2, 3*Math.PI/2);
        ctx.stroke();

        // Team logo at center
        if (team === 'grizzlies') {
            ctx.fillStyle = '#5D76A9';
            ctx.font = 'bold 120px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('GRIZZLIES', 1024, 512);
        }

        dynamicTexture.update();
        return dynamicTexture;
    }

    /**
     * Add basketball hoops to scene
     */
    addBasketballHoops(scene) {
        const hoopPositions = [
            { x: -41, y: 10, z: 0 },
            { x: 41, y: 10, z: 0 }
        ];

        hoopPositions.forEach((pos, i) => {
            // Backboard
            const backboard = BABYLON.MeshBuilder.CreateBox(`backboard${i}`, {
                width: 6,
                height: 3.5,
                depth: 0.25
            }, scene);

            backboard.position = new BABYLON.Vector3(pos.x, pos.y + 2, pos.z);

            const backboardMat = new BABYLON.StandardMaterial(`backboardMat${i}`, scene);
            backboardMat.diffuseColor = new BABYLON.Color3(1, 1, 1);
            backboardMat.specularColor = new BABYLON.Color3(0, 0, 0);
            backboard.material = backboardMat;

            // Rim
            const rim = BABYLON.MeshBuilder.CreateTorus(`rim${i}`, {
                diameter: 1.5,
                thickness: 0.075,
                tessellation: 32
            }, scene);

            rim.position = new BABYLON.Vector3(pos.x + (i === 0 ? 1.5 : -1.5), pos.y, pos.z);
            rim.rotation.z = Math.PI / 2;

            const rimMat = new BABYLON.StandardMaterial(`rimMat${i}`, scene);
            rimMat.diffuseColor = new BABYLON.Color3(1, 0.5, 0);
            rimMat.specularColor = new BABYLON.Color3(1, 1, 1);
            rim.material = rimMat;

            // Net (simplified)
            const net = BABYLON.MeshBuilder.CreateCylinder(`net${i}`, {
                diameterTop: 1.5,
                diameterBottom: 1.2,
                height: 1.5,
                tessellation: 8
            }, scene);

            net.position = new BABYLON.Vector3(pos.x + (i === 0 ? 1.5 : -1.5), pos.y - 0.75, pos.z);

            const netMat = new BABYLON.StandardMaterial(`netMat${i}`, scene);
            netMat.diffuseColor = new BABYLON.Color3(1, 1, 1);
            netMat.alpha = 0.7;
            net.material = netMat;
        });
    }

    /**
     * Setup baseball-specific visualizations
     */
    setupBaseballVisualizations(engine) {
        const viz = {
            pitchTracker: new PitchTracker(engine),
            heatmapGenerator: new HeatmapGenerator(engine),
            sprayChart: new SprayChart(engine),
            lineupVisualizer: new LineupVisualizer(engine)
        };

        this.activeVisualizations.set(engine, viz);
        return viz;
    }

    /**
     * Setup football-specific visualizations
     */
    setupFootballVisualizations(engine) {
        const viz = {
            routeTree: new RouteTreeVisualizer(engine),
            pressureMap: new PressureMapGenerator(engine),
            formationAnalyzer: new FormationAnalyzer(engine),
            fieldPosition: new FieldPositionTracker(engine)
        };

        this.activeVisualizations.set(engine, viz);
        return viz;
    }

    /**
     * Setup basketball-specific visualizations
     */
    setupBasketballVisualizations(engine) {
        const viz = {
            shotChart: new ShotChartVisualizer(engine),
            playerMovement: new MovementTracker(engine),
            courtHeatmap: new CourtHeatmap(engine),
            matchupAnalyzer: new MatchupAnalyzer(engine)
        };

        this.activeVisualizations.set(engine, viz);
        return viz;
    }

    /**
     * Apply team colors and branding
     */
    applyTeamBranding(engine, team) {
        const scene = engine.scene;

        // Update fog color to team primary
        scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
        scene.fogColor = BABYLON.Color3.FromHexString(team.colors.primary);
        scene.fogStart = 200;
        scene.fogEnd = 500;

        // Update ambient light to team colors
        const lights = scene.lights;
        lights.forEach(light => {
            if (light instanceof BABYLON.HemisphericLight) {
                light.groundColor = BABYLON.Color3.FromHexString(team.colors.secondary);
            }
        });
    }

    /**
     * Start specific visualization type
     */
    async startVisualization(engine, team, type) {
        const viz = this.activeVisualizations.get(engine);
        if (!viz) return;

        switch (type) {
            case 'trajectory':
                if (viz.pitchTracker) {
                    viz.pitchTracker.start();
                }
                break;

            case 'heatmap':
                if (viz.heatmapGenerator) {
                    viz.heatmapGenerator.generate();
                } else if (viz.courtHeatmap) {
                    viz.courtHeatmap.generate();
                }
                break;

            case 'routes':
                if (viz.routeTree) {
                    viz.routeTree.visualize();
                }
                break;

            case 'shotchart':
                if (viz.shotChart) {
                    viz.shotChart.render();
                }
                break;

            default:
                console.log(`Visualization type ${type} not implemented yet`);
        }
    }

    /**
     * Connect to real-time data stream
     */
    connectDataStream(containerId, team) {
        // Fetch initial data
        this.fetchTeamData(team).then(data => {
            this.updateVisualization(containerId, data);
        });

        // Setup periodic updates
        const intervalId = setInterval(() => {
            this.fetchTeamData(team).then(data => {
                this.updateVisualization(containerId, data);
            });
        }, this.updateInterval);

        this.dataStreams.set(containerId, intervalId);
    }

    /**
     * Fetch team data from SportsDataIO
     */
    async fetchTeamData(team) {
        const teamConfig = this.teams[team];
        if (!teamConfig) return null;

        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    league: teamConfig.sport === 'ncaa' ? 'ncaaf' : teamConfig.sport,
                    endpoint: 'scores/json/TeamGameStats',
                    params: { team }
                })
            });

            if (response.ok) {
                const result = await response.json();
                return result.data;
            }
        } catch (error) {
            console.error('Failed to fetch team data:', error);
        }

        // Return mock data for demo
        return this.getMockTeamData(team);
    }

    /**
     * Update visualization with new data
     */
    updateVisualization(containerId, data) {
        const engine = this.engines.get(containerId);
        if (!engine || !data) return;

        const viz = this.activeVisualizations.get(engine);
        if (!viz) return;

        // Update based on available visualizers
        Object.values(viz).forEach(visualizer => {
            if (visualizer && visualizer.updateData) {
                visualizer.updateData(data);
            }
        });

        // Update PixiJS overlay with stats
        if (engine.pixiOverlay) {
            this.updateStatsOverlay(engine.pixiOverlay, data);
        }
    }

    /**
     * Update 2D stats overlay
     */
    updateStatsOverlay(pixiApp, data) {
        // Clear previous overlay
        pixiApp.stage.removeChildren();

        // Create stats container
        const container = new PIXI.Container();

        // Stats text style
        const style = new PIXI.TextStyle({
            fontFamily: 'JetBrains Mono',
            fontSize: 18,
            fill: '#BF5700',
            stroke: '#000000',
            strokeThickness: 2,
            dropShadow: true,
            dropShadowBlur: 4,
            dropShadowDistance: 2
        });

        // Display key stats
        let yPos = 10;
        if (data.score) {
            const scoreText = new PIXI.Text(`Score: ${data.score}`, style);
            scoreText.x = 10;
            scoreText.y = yPos;
            container.addChild(scoreText);
            yPos += 30;
        }

        if (data.stats) {
            Object.entries(data.stats).slice(0, 5).forEach(([key, value]) => {
                const statText = new PIXI.Text(`${key}: ${value}`, style);
                statText.x = 10;
                statText.y = yPos;
                container.addChild(statText);
                yPos += 30;
            });
        }

        pixiApp.stage.addChild(container);
    }

    /**
     * Get mock team data for demo
     */
    getMockTeamData(team) {
        const mockData = {
            cardinals: {
                score: 'STL 7 - CHC 4',
                stats: {
                    'Hits': 11,
                    'Runs': 7,
                    'Errors': 0,
                    'LOB': 6,
                    'Batting Avg': '.287'
                }
            },
            titans: {
                score: 'TEN 24 - HOU 21',
                stats: {
                    'Passing Yards': 287,
                    'Rushing Yards': 134,
                    'Total Yards': 421,
                    'First Downs': 22,
                    'Time of Possession': '31:45'
                }
            },
            longhorns: {
                score: 'TEX 45 - OU 38',
                stats: {
                    'Total Offense': 567,
                    'Pass Completion': '68.2%',
                    'Rushing TDs': 3,
                    'Turnovers': 1,
                    'Third Down %': '46.7%'
                }
            },
            grizzlies: {
                score: 'MEM 118 - LAL 108',
                stats: {
                    'Field Goal %': '48.3%',
                    '3-Point %': '38.5%',
                    'Rebounds': 45,
                    'Assists': 28,
                    'Steals': 9
                }
            }
        };

        return mockData[team] || null;
    }

    /**
     * Cleanup and dispose
     */
    dispose(containerId) {
        // Clear data stream
        const intervalId = this.dataStreams.get(containerId);
        if (intervalId) {
            clearInterval(intervalId);
            this.dataStreams.delete(containerId);
        }

        // Dispose engine
        const engine = this.engines.get(containerId);
        if (engine) {
            engine.dispose();
            this.engines.delete(containerId);
        }

        // Clear visualizations
        this.activeVisualizations.delete(engine);
    }
}

/**
 * Pitch Tracker Visualization for Baseball
 */
class PitchTracker {
    constructor(engine) {
        this.engine = engine;
        this.scene = engine.scene;
        this.pitches = [];
        this.maxPitches = 50;
    }

    start() {
        // Initialize strike zone
        this.createStrikeZone();
    }

    createStrikeZone() {
        const zoneWidth = 1.4167; // 17 inches in feet
        const zoneHeight = 2.5; // Average zone height

        const zone = BABYLON.MeshBuilder.CreatePlane("strikeZone", {
            width: zoneWidth,
            height: zoneHeight
        }, this.scene);

        zone.position = new BABYLON.Vector3(0, 3, 0);

        const zoneMat = new BABYLON.StandardMaterial("zoneMat", this.scene);
        zoneMat.diffuseColor = new BABYLON.Color3(1, 1, 1);
        zoneMat.alpha = 0.2;
        zoneMat.wireframe = true;
        zone.material = zoneMat;
    }

    trackPitch(pitchData) {
        // Use ray-traced physics to show pitch path
        if (this.engine.ballPhysics) {
            const trajectory = this.engine.ballPhysics.tracePitchPath(
                pitchData.releasePoint,
                pitchData.velocity,
                pitchData.spinRate,
                pitchData.spinAxis
            );

            this.visualizePitch(trajectory, pitchData.type);
        }
    }

    visualizePitch(trajectory, pitchType) {
        const color = this.getPitchColor(pitchType);

        const points = trajectory.map(t => t.position);
        const pitch = BABYLON.MeshBuilder.CreateLines(`pitch${Date.now()}`, {
            points: points,
            updatable: false
        }, this.scene);

        const pitchMat = new BABYLON.StandardMaterial("pitchMat", this.scene);
        pitchMat.emissiveColor = color;
        pitch.material = pitchMat;

        this.pitches.push(pitch);

        // Limit number of visible pitches
        if (this.pitches.length > this.maxPitches) {
            const oldPitch = this.pitches.shift();
            oldPitch.dispose();
        }
    }

    getPitchColor(type) {
        const colors = {
            'Fastball': new BABYLON.Color3(1, 0, 0),
            'Curveball': new BABYLON.Color3(0, 1, 0),
            'Slider': new BABYLON.Color3(0, 0, 1),
            'Changeup': new BABYLON.Color3(1, 1, 0),
            'Knuckleball': new BABYLON.Color3(1, 0, 1)
        };
        return colors[type] || new BABYLON.Color3(1, 1, 1);
    }

    updateData(data) {
        if (data.lastPitch) {
            this.trackPitch(data.lastPitch);
        }
    }
}

/**
 * Heatmap Generator
 */
class HeatmapGenerator {
    constructor(engine) {
        this.engine = engine;
        this.scene = engine.scene;
        this.heatmapMesh = null;
    }

    generate(data = null) {
        if (this.heatmapMesh) {
            this.heatmapMesh.dispose();
        }

        // Create heatmap plane
        this.heatmapMesh = BABYLON.MeshBuilder.CreatePlane("heatmap", {
            width: 10,
            height: 10
        }, this.scene);

        this.heatmapMesh.position.y = 0.1;
        this.heatmapMesh.rotation.x = Math.PI / 2;

        // Generate heatmap texture
        const texture = this.generateHeatmapTexture(data);

        const heatmapMat = new BABYLON.StandardMaterial("heatmapMat", this.scene);
        heatmapMat.diffuseTexture = texture;
        heatmapMat.emissiveTexture = texture;
        heatmapMat.alpha = 0.7;

        this.heatmapMesh.material = heatmapMat;
    }

    generateHeatmapTexture(data) {
        const dynamicTexture = new BABYLON.DynamicTexture("heatmapTex",
            {width: 512, height: 512}, this.scene);

        const ctx = dynamicTexture.getContext();

        // Generate gradient heatmap
        const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
        gradient.addColorStop(0, 'rgba(255, 0, 0, 1)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 0, 0.7)');
        gradient.addColorStop(1, 'rgba(0, 0, 255, 0.3)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 512);

        dynamicTexture.update();
        return dynamicTexture;
    }

    updateData(data) {
        if (data.heatmapData) {
            this.generate(data.heatmapData);
        }
    }
}

// Placeholder classes for other visualizers
class SprayChart {
    constructor(engine) { this.engine = engine; }
    updateData(data) { /* Implementation */ }
}

class LineupVisualizer {
    constructor(engine) { this.engine = engine; }
    updateData(data) { /* Implementation */ }
}

class RouteTreeVisualizer {
    constructor(engine) { this.engine = engine; }
    visualize() { /* Implementation */ }
    updateData(data) { /* Implementation */ }
}

class PressureMapGenerator {
    constructor(engine) { this.engine = engine; }
    updateData(data) { /* Implementation */ }
}

class FormationAnalyzer {
    constructor(engine) { this.engine = engine; }
    updateData(data) { /* Implementation */ }
}

class FieldPositionTracker {
    constructor(engine) { this.engine = engine; }
    updateData(data) { /* Implementation */ }
}

class ShotChartVisualizer {
    constructor(engine) { this.engine = engine; }
    render() { /* Implementation */ }
    updateData(data) { /* Implementation */ }
}

class MovementTracker {
    constructor(engine) { this.engine = engine; }
    updateData(data) { /* Implementation */ }
}

class CourtHeatmap {
    constructor(engine) { this.engine = engine; }
    generate() { /* Implementation */ }
    updateData(data) { /* Implementation */ }
}

class MatchupAnalyzer {
    constructor(engine) { this.engine = engine; }
    updateData(data) { /* Implementation */ }
}

// Export for use in dashboards
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BabylonDashboardIntegration;
}

// Auto-initialize on dashboard pages
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on a dashboard page
    const dashboardContainers = [
        { id: 'cardinals-3d-viz', team: 'cardinals', type: 'trajectory' },
        { id: 'titans-3d-viz', team: 'titans', type: 'routes' },
        { id: 'longhorns-3d-viz', team: 'longhorns', type: 'heatmap' },
        { id: 'grizzlies-3d-viz', team: 'grizzlies', type: 'shotchart' }
    ];

    const integration = new BabylonDashboardIntegration();

    dashboardContainers.forEach(config => {
        const container = document.getElementById(config.id);
        if (container) {
            integration.initializeDashboard(config.id, config.team, config.type)
                .then(() => {
                    console.log(`✅ 3D visualization initialized for ${config.team}`);
                })
                .catch(error => {
                    console.error(`Failed to initialize ${config.team} viz:`, error);
                });
        }
    });
});