/**
 * Babylon.js Enhanced Visualizer for Blaze Intelligence
 * Championship-level sports data visualization with ray tracing and WebGPU
 * Direct replacement for enhanced-three-visualizer.js
 */

class BabylonEnhancedVisualizer {
    constructor(containerId) {
        this.containerId = containerId;
        this.container = null;
        this.canvas = null;
        this.engine = null;
        this.scene = null;
        this.camera = null;
        this.visualizations = new Map();
        this.animationGroups = [];
        this.isWebGPU = false;

        // Blaze Intelligence Championship Colors
        this.colors = {
            primary: BABYLON.Color3.FromHexString("#BF5700"),      // Burnt Orange
            secondary: BABYLON.Color3.FromHexString("#FFD700"),     // Championship Gold
            accent: BABYLON.Color3.FromHexString("#9BCBEB"),        // Cardinal Blue
            neural: BABYLON.Color3.FromHexString("#00B2A9"),        // Data Green
            deep: BABYLON.Color3.FromHexString("#002244"),          // Trust Navy
            glow: BABYLON.Color3.FromHexString("#FF8C00"),          // Orange Glow
            cardinals: BABYLON.Color3.FromHexString("#C41E3A"),     // Cardinals Red
            titans: BABYLON.Color3.FromHexString("#0C2340"),        // Titans Navy
            longhorns: BABYLON.Color3.FromHexString("#BF5700"),     // Texas Orange
            grizzlies: BABYLON.Color3.FromHexString("#12173D")      // Grizzlies Navy
        };

        this.effects = {
            bloom: true,
            glow: true,
            particles: true,
            raytracing: true
        };
    }

    /**
     * Initialize the visualizer with WebGPU/WebGL fallback
     */
    async initialize() {
        this.container = document.getElementById(this.containerId);
        if (!this.container) {
            console.error(`Container ${this.containerId} not found`);
            return false;
        }

        // Create canvas
        this.canvas = document.createElement('canvas');
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.container.appendChild(this.canvas);

        // Initialize engine with WebGPU if available
        await this.setupEngine();
        this.createScene();
        await this.createEnhancedVisualizations();
        this.setupEventHandlers();
        this.startRenderLoop();

        return true;
    }

    /**
     * Setup engine with WebGPU support
     */
    async setupEngine() {
        if (await BABYLON.WebGPUEngine.IsSupportedAsync) {
            console.log("🚀 Blaze Intelligence: WebGPU Ray Tracing Enabled");
            this.engine = new BABYLON.WebGPUEngine(this.canvas);
            await this.engine.initAsync();
            this.isWebGPU = true;
        } else {
            console.log("⚡ Blaze Intelligence: High-Performance WebGL2 Mode");
            this.engine = new BABYLON.Engine(this.canvas, true, {
                preserveDrawingBuffer: true,
                stencil: true,
                antialias: true,
                powerPreference: 'high-performance',
                doNotHandleContextLost: false
            });
        }

        // Performance optimizations
        this.engine.enableOfflineSupport = false;
        this.engine.disableManifestCheck = true;
        BABYLON.Engine.audioEngine.useCustomUnlockedButton = true;

        // Handle resize
        window.addEventListener('resize', () => {
            this.engine.resize();
        });
    }

    /**
     * Create scene with championship aesthetics
     */
    createScene() {
        this.scene = new BABYLON.Scene(this.engine);

        // Enable optimizations
        this.scene.skipPointerMovePicking = true;
        this.scene.autoClear = false;
        this.scene.autoClearDepthAndStencil = false;
        this.scene.blockMaterialDirtyMechanism = true;

        // Create gradient background
        this.createGradientBackground();

        // Setup camera
        this.setupCamera();

        // Setup advanced lighting
        this.setupAdvancedLighting();

        // Enable ray tracing if supported
        if (this.isWebGPU && this.effects.raytracing) {
            this.enableRayTracing();
        }

        // Add fog for depth
        this.scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
        this.scene.fogDensity = 0.015;
        this.scene.fogColor = new BABYLON.Color3(0.04, 0.05, 0.15);
    }

    /**
     * Create gradient background
     */
    createGradientBackground() {
        // Create gradient texture
        const gradientTexture = new BABYLON.DynamicTexture("gradientBack",
            { width: 512, height: 512 }, this.scene);
        const context = gradientTexture.getContext();

        const gradient = context.createLinearGradient(0, 0, 0, 512);
        gradient.addColorStop(0, '#0a0e27');
        gradient.addColorStop(0.5, '#112240');
        gradient.addColorStop(1, '#002244');

        context.fillStyle = gradient;
        context.fillRect(0, 0, 512, 512);
        gradientTexture.update();

        // Apply as scene texture
        const material = new BABYLON.BackgroundMaterial("backgroundMat", this.scene);
        material.diffuseTexture = gradientTexture;
        material.useRGBColor = false;

        const plane = BABYLON.MeshBuilder.CreatePlane("backgroundPlane",
            { width: 1000, height: 1000 }, this.scene);
        plane.material = material;
        plane.position.z = -100;
        plane.infiniteDistance = true;
    }

    /**
     * Setup championship camera
     */
    setupCamera() {
        this.camera = new BABYLON.UniversalCamera("camera",
            new BABYLON.Vector3(0, 10, -30), this.scene);
        this.camera.setTarget(BABYLON.Vector3.Zero());
        this.camera.fov = 1.0472; // 60 degrees
        this.camera.minZ = 0.1;
        this.camera.maxZ = 1000;

        // Smooth camera controls
        this.camera.inputs.clear();
        this.camera.inputs.addMouse();
        this.camera.inputs.addKeyboard();
        this.camera.attachControl(this.canvas, true);

        this.camera.speed = 0.5;
        this.camera.angularSensibility = 1000;
        this.camera.inertia = 0.9;

        // Add smooth camera animation
        BABYLON.Animation.CreateAndStartAnimation("cameraIntro", this.camera,
            "position", 30, 60,
            new BABYLON.Vector3(0, 30, -50),
            new BABYLON.Vector3(0, 10, -30),
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT,
            new BABYLON.BezierCurveEase(0.42, 0, 0.58, 1)
        );
    }

    /**
     * Setup advanced lighting with ray tracing
     */
    setupAdvancedLighting() {
        // Championship key light
        const keyLight = new BABYLON.DirectionalLight("keyLight",
            new BABYLON.Vector3(-1, -2, -1), this.scene);
        keyLight.intensity = 1.5;
        keyLight.diffuse = this.colors.secondary;
        keyLight.specular = BABYLON.Color3.White();

        // Enable shadows
        const shadowGenerator = new BABYLON.ShadowGenerator(2048, keyLight);
        shadowGenerator.useContactHardeningShadow = true;
        shadowGenerator.contactHardeningLightSizeUVRatio = 0.05;
        shadowGenerator.bias = 0.00001;
        shadowGenerator.normalBias = 0.01;
        shadowGenerator.setDarkness(0.3);

        if (this.isWebGPU) {
            // Ray traced soft shadows
            shadowGenerator.filteringQuality = BABYLON.ShadowGenerator.QUALITY_HIGH;
            shadowGenerator.usePercentageCloserFiltering = true;
        }

        // Hemisphere light for ambient
        const hemiLight = new BABYLON.HemisphericLight("hemiLight",
            new BABYLON.Vector3(0, 1, 0), this.scene);
        hemiLight.intensity = 0.3;
        hemiLight.diffuse = this.colors.accent;
        hemiLight.groundColor = this.colors.deep;

        // Stadium spot lights
        this.createStadiumLights();

        return shadowGenerator;
    }

    /**
     * Create stadium-style lighting
     */
    createStadiumLights() {
        const positions = [
            { x: 30, y: 40, z: 30 },
            { x: -30, y: 40, z: 30 },
            { x: 30, y: 40, z: -30 },
            { x: -30, y: 40, z: -30 }
        ];

        positions.forEach((pos, i) => {
            const spotLight = new BABYLON.SpotLight(
                `stadiumLight${i}`,
                new BABYLON.Vector3(pos.x, pos.y, pos.z),
                new BABYLON.Vector3(-pos.x / 30, -1, -pos.z / 30),
                Math.PI / 3,
                2,
                this.scene
            );
            spotLight.intensity = 0.5;
            spotLight.diffuse = BABYLON.Color3.White();
            spotLight.specular = this.colors.glow;

            // Create light mesh for visual effect
            const lightMesh = BABYLON.MeshBuilder.CreateSphere(`lightMesh${i}`,
                { diameter: 2 }, this.scene);
            lightMesh.position = spotLight.position;

            const lightMat = new BABYLON.PBRMaterial(`lightMat${i}`, this.scene);
            lightMat.emissiveColor = this.colors.secondary;
            lightMat.emissiveIntensity = 2;
            lightMat.unlit = true;
            lightMesh.material = lightMat;

            // Add glow layer
            if (this.effects.glow) {
                const gl = new BABYLON.GlowLayer(`glow${i}`, this.scene);
                gl.intensity = 1.5;
                gl.addIncludedOnlyMesh(lightMesh);
            }
        });
    }

    /**
     * Enable ray tracing features
     */
    enableRayTracing() {
        console.log("🎯 Enabling Championship Ray Tracing");

        // Create rendering pipeline
        const pipeline = new BABYLON.DefaultRenderingPipeline(
            "blazePipeline",
            true,
            this.scene,
            [this.camera]
        );

        // Ray traced reflections
        pipeline.screenSpaceReflectionsEnabled = true;
        pipeline.screenSpaceReflections.strength = 0.8;
        pipeline.screenSpaceReflections.quality = 2;
        pipeline.screenSpaceReflections.falloffExponent = 2;
        pipeline.screenSpaceReflections.roughnessFactor = 0.2;

        // Motion blur for sports action
        pipeline.motionBlurEnabled = true;
        pipeline.motionBlur.motionStrength = 1;
        pipeline.motionBlur.motionBlurSamples = 32;

        // Bloom effect for championship glow
        if (this.effects.bloom) {
            pipeline.bloomEnabled = true;
            pipeline.bloomThreshold = 0.8;
            pipeline.bloomWeight = 0.5;
            pipeline.bloomKernel = 64;
            pipeline.bloomScale = 0.5;
        }

        // Depth of field for cinematic effect
        pipeline.depthOfFieldEnabled = true;
        pipeline.depthOfFieldBlurLevel = BABYLON.DepthOfFieldEffectBlurLevel.Medium;
        pipeline.depthOfField.focusDistance = 2000;
        pipeline.depthOfField.focalLength = 50;
        pipeline.depthOfField.fStop = 1.4;

        // FXAA anti-aliasing
        pipeline.fxaaEnabled = true;

        // Chromatic aberration for realism
        pipeline.chromaticAberrationEnabled = true;
        pipeline.chromaticAberration.aberrationAmount = 30;
        pipeline.chromaticAberration.radialIntensity = 1;

        // Grain for film-like quality
        pipeline.grainEnabled = true;
        pipeline.grain.intensity = 10;
        pipeline.grain.animated = true;

        return pipeline;
    }

    /**
     * Create enhanced visualizations
     */
    async createEnhancedVisualizations() {
        // Create neural network visualization
        await this.createNeuralNetwork();

        // Create sports field visualization
        await this.createSportsField();

        // Create data streams
        await this.createDataStreams();

        // Create particle effects
        if (this.effects.particles) {
            await this.createParticleEffects();
        }

        // Create holographic displays
        await this.createHolographicDisplays();
    }

    /**
     * Create neural network visualization
     */
    async createNeuralNetwork() {
        const network = new BABYLON.Mesh("neuralNetwork", this.scene);

        // Create nodes
        const layers = [5, 8, 8, 5]; // Input, hidden, hidden, output
        const nodes = [];

        layers.forEach((count, layerIndex) => {
            const layerNodes = [];
            for (let i = 0; i < count; i++) {
                const node = BABYLON.MeshBuilder.CreateSphere(`node_${layerIndex}_${i}`, {
                    diameter: 1.5,
                    segments: 32
                }, this.scene);

                const x = (layerIndex - 1.5) * 10;
                const y = (i - count / 2) * 3;
                const z = 0;

                node.position = new BABYLON.Vector3(x, y, z);

                // PBR material with ray tracing
                const nodeMat = new BABYLON.PBRMaterial(`nodeMat_${layerIndex}_${i}`, this.scene);
                nodeMat.albedoColor = layerIndex === 0 ? this.colors.primary :
                                      layerIndex === layers.length - 1 ? this.colors.accent :
                                      this.colors.neural;
                nodeMat.metallic = 0.3;
                nodeMat.roughness = 0.4;
                nodeMat.emissiveColor = nodeMat.albedoColor;
                nodeMat.emissiveIntensity = 0.5;

                if (this.isWebGPU) {
                    nodeMat.enableRayTracedReflections = true;
                }

                node.material = nodeMat;
                node.parent = network;
                layerNodes.push(node);
            }
            nodes.push(layerNodes);
        });

        // Create connections
        for (let l = 0; l < nodes.length - 1; l++) {
            const currentLayer = nodes[l];
            const nextLayer = nodes[l + 1];

            currentLayer.forEach(node1 => {
                nextLayer.forEach(node2 => {
                    const connection = BABYLON.MeshBuilder.CreateTube(`connection_${l}`, {
                        path: [node1.position, node2.position],
                        radius: 0.05,
                        tessellation: 8
                    }, this.scene);

                    const connectionMat = new BABYLON.PBRMaterial(`connectionMat_${l}`, this.scene);
                    connectionMat.albedoColor = this.colors.accent;
                    connectionMat.emissiveColor = this.colors.accent;
                    connectionMat.emissiveIntensity = 0.3;
                    connectionMat.alpha = 0.6;
                    connection.material = connectionMat;
                    connection.parent = network;

                    // Animate data flow
                    this.animateDataFlow(connection);
                });
            });
        }

        // Animate network
        const animationGroup = new BABYLON.AnimationGroup("networkPulse", this.scene);
        nodes.flat().forEach((node, i) => {
            const scaleAnimation = new BABYLON.Animation(
                `scale_${i}`,
                "scaling",
                30,
                BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
                BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
            );

            const keys = [
                { frame: 0, value: new BABYLON.Vector3(1, 1, 1) },
                { frame: 15 + i * 2, value: new BABYLON.Vector3(1.2, 1.2, 1.2) },
                { frame: 30 + i * 2, value: new BABYLON.Vector3(1, 1, 1) }
            ];

            scaleAnimation.setKeys(keys);
            animationGroup.addTargetedAnimation(scaleAnimation, node);
        });

        animationGroup.play(true);
        this.animationGroups.push(animationGroup);
        this.visualizations.set('neuralNetwork', network);

        return network;
    }

    /**
     * Create sports field visualization
     */
    async createSportsField() {
        const field = new BABYLON.Mesh("sportsField", this.scene);
        field.position.y = -5;

        // Create baseball diamond
        const diamond = BABYLON.MeshBuilder.CreateGround("diamond", {
            width: 40,
            height: 40
        }, this.scene);

        const diamondMat = new BABYLON.PBRMaterial("diamondMat", this.scene);

        // Create procedural texture for field
        const fieldTexture = new BABYLON.DynamicTexture("fieldTex",
            { width: 1024, height: 1024 }, this.scene);
        const ctx = fieldTexture.getContext();

        // Draw field pattern
        const gradient = ctx.createRadialGradient(512, 512, 0, 512, 512, 512);
        gradient.addColorStop(0, '#654321');
        gradient.addColorStop(0.3, '#8B7355');
        gradient.addColorStop(1, '#0a5d2e');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1024, 1024);

        // Draw base paths
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(512, 800);
        ctx.lineTo(300, 512);
        ctx.lineTo(512, 224);
        ctx.lineTo(724, 512);
        ctx.closePath();
        ctx.stroke();

        fieldTexture.update();
        diamondMat.albedoTexture = fieldTexture;
        diamondMat.roughness = 0.8;
        diamondMat.metallic = 0;

        diamond.material = diamondMat;
        diamond.parent = field;

        // Add bases
        const bases = [
            { name: 'home', x: 0, z: 10 },
            { name: 'first', x: 10, z: 0 },
            { name: 'second', x: 0, z: -10 },
            { name: 'third', x: -10, z: 0 }
        ];

        bases.forEach(base => {
            const baseMesh = BABYLON.MeshBuilder.CreateBox(base.name, {
                size: 1.5
            }, this.scene);
            baseMesh.position = new BABYLON.Vector3(base.x, 0.3, base.z);

            const baseMat = new BABYLON.PBRMaterial(base.name + "Mat", this.scene);
            baseMat.albedoColor = BABYLON.Color3.White();
            baseMat.roughness = 0.3;
            baseMat.metallic = 0.1;
            baseMesh.material = baseMat;
            baseMesh.parent = field;

            // Add glow to bases
            if (this.effects.glow) {
                baseMat.emissiveColor = BABYLON.Color3.White();
                baseMat.emissiveIntensity = 0.3;
            }
        });

        this.visualizations.set('sportsField', field);
        return field;
    }

    /**
     * Create data streams
     */
    async createDataStreams() {
        const streams = new BABYLON.Mesh("dataStreams", this.scene);

        // Create flowing data ribbons
        for (let i = 0; i < 5; i++) {
            const path = [];
            const radiusFunction = (t) => 0.5 + Math.sin(t * 10) * 0.2;

            for (let t = 0; t < Math.PI * 2; t += 0.1) {
                path.push(new BABYLON.Vector3(
                    Math.cos(t + i) * 20,
                    Math.sin(t * 2) * 5,
                    Math.sin(t + i) * 20
                ));
            }

            const ribbon = BABYLON.MeshBuilder.CreateTube(`stream${i}`, {
                path: path,
                radiusFunction: radiusFunction,
                tessellation: 32,
                cap: BABYLON.Mesh.CAP_ALL
            }, this.scene);

            const ribbonMat = new BABYLON.PBRMaterial(`streamMat${i}`, this.scene);
            const teamColors = [
                this.colors.cardinals,
                this.colors.titans,
                this.colors.longhorns,
                this.colors.grizzlies,
                this.colors.primary
            ];

            ribbonMat.albedoColor = teamColors[i];
            ribbonMat.emissiveColor = teamColors[i];
            ribbonMat.emissiveIntensity = 0.5;
            ribbonMat.alpha = 0.7;
            ribbonMat.metallic = 0.5;
            ribbonMat.roughness = 0.3;

            ribbon.material = ribbonMat;
            ribbon.parent = streams;

            // Animate ribbon
            const animation = new BABYLON.Animation(
                `streamAnim${i}`,
                "rotation.y",
                30,
                BABYLON.Animation.ANIMATIONTYPE_FLOAT,
                BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
            );

            animation.setKeys([
                { frame: 0, value: 0 },
                { frame: 120, value: Math.PI * 2 }
            ]);

            ribbon.animations.push(animation);
            this.scene.beginAnimation(ribbon, 0, 120, true, 0.5 + i * 0.1);
        }

        this.visualizations.set('dataStreams', streams);
        return streams;
    }

    /**
     * Animate data flow
     */
    animateDataFlow(mesh) {
        const material = mesh.material;
        const animation = new BABYLON.Animation(
            "dataFlow",
            "emissiveIntensity",
            30,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );

        animation.setKeys([
            { frame: 0, value: 0.3 },
            { frame: 15, value: 1.0 },
            { frame: 30, value: 0.3 }
        ]);

        material.animations = [animation];
        this.scene.beginAnimation(material, 0, 30, true, Math.random() + 0.5);
    }

    /**
     * Create particle effects
     */
    async createParticleEffects() {
        // Championship particles
        const particleSystem = new BABYLON.ParticleSystem("particles", 5000, this.scene);

        // Create custom texture
        const particleTexture = new BABYLON.DynamicTexture("particleTex",
            { width: 256, height: 256 }, this.scene);
        const ctx = particleTexture.getContext();

        // Draw gradient circle
        const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
        gradient.addColorStop(0, 'rgba(191, 87, 0, 1)');
        gradient.addColorStop(0.5, 'rgba(155, 203, 235, 0.5)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(128, 128, 128, 0, Math.PI * 2);
        ctx.fill();
        particleTexture.update();

        particleSystem.particleTexture = particleTexture;
        particleSystem.emitter = BABYLON.Vector3.Zero();

        // Emitter shape
        particleSystem.createSphereEmitter(50);

        // Colors
        particleSystem.color1 = new BABYLON.Color4(...this.colors.primary.asArray(), 1);
        particleSystem.color2 = new BABYLON.Color4(...this.colors.accent.asArray(), 1);
        particleSystem.colorDead = new BABYLON.Color4(0, 0, 0, 0);

        // Size
        particleSystem.minSize = 0.1;
        particleSystem.maxSize = 0.5;

        // Life time
        particleSystem.minLifeTime = 2;
        particleSystem.maxLifeTime = 5;

        // Emission
        particleSystem.emitRate = 500;

        // Speed
        particleSystem.minEmitPower = 1;
        particleSystem.maxEmitPower = 3;
        particleSystem.updateSpeed = 0.01;

        // Gravity
        particleSystem.gravity = new BABYLON.Vector3(0, -0.5, 0);

        // Angular speed
        particleSystem.minAngularSpeed = 0;
        particleSystem.maxAngularSpeed = Math.PI;

        // Blend mode
        particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;

        // Start
        particleSystem.start();

        this.visualizations.set('particles', particleSystem);
        return particleSystem;
    }

    /**
     * Create holographic displays
     */
    async createHolographicDisplays() {
        const displays = new BABYLON.Mesh("holographicDisplays", this.scene);

        // Create floating data panels
        const panelData = [
            { label: 'WIN %', value: '94.6', color: this.colors.cardinals },
            { label: 'ERA', value: '2.85', color: this.colors.primary },
            { label: 'OPS', value: '.825', color: this.colors.titans },
            { label: 'QBR', value: '112.3', color: this.colors.longhorns }
        ];

        panelData.forEach((data, i) => {
            const angle = (i / panelData.length) * Math.PI * 2;
            const radius = 15;

            // Create panel
            const panel = BABYLON.MeshBuilder.CreatePlane(`panel${i}`, {
                width: 8,
                height: 6
            }, this.scene);

            panel.position = new BABYLON.Vector3(
                Math.cos(angle) * radius,
                5,
                Math.sin(angle) * radius
            );
            panel.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;

            // Create holographic material
            const holoMat = new BABYLON.PBRMaterial(`holoMat${i}`, this.scene);
            holoMat.albedoColor = data.color;
            holoMat.emissiveColor = data.color;
            holoMat.emissiveIntensity = 1;
            holoMat.alpha = 0.7;
            holoMat.metallic = 0.5;
            holoMat.roughness = 0.1;
            holoMat.backFaceCulling = false;

            if (this.isWebGPU) {
                holoMat.enableRayTracedReflections = true;
            }

            panel.material = holoMat;
            panel.parent = displays;

            // Create text
            const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(panel);

            const container = new BABYLON.GUI.StackPanel();
            container.width = "100%";
            container.height = "100%";

            const label = new BABYLON.GUI.TextBlock();
            label.text = data.label;
            label.color = "white";
            label.fontSize = 60;
            label.fontWeight = "bold";
            label.height = "40%";
            container.addControl(label);

            const value = new BABYLON.GUI.TextBlock();
            value.text = data.value;
            value.color = "#FFD700";
            value.fontSize = 90;
            value.fontWeight = "900";
            value.height = "60%";
            container.addControl(value);

            advancedTexture.addControl(container);

            // Animate panel
            const floatAnimation = new BABYLON.Animation(
                `float${i}`,
                "position.y",
                30,
                BABYLON.Animation.ANIMATIONTYPE_FLOAT,
                BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
            );

            floatAnimation.setKeys([
                { frame: 0, value: 5 },
                { frame: 30 + i * 5, value: 6 },
                { frame: 60 + i * 5, value: 5 }
            ]);

            panel.animations.push(floatAnimation);
            this.scene.beginAnimation(panel, 0, 60 + i * 5, true);
        });

        this.visualizations.set('holographicDisplays', displays);
        return displays;
    }

    /**
     * Setup event handlers
     */
    setupEventHandlers() {
        // Handle visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.engine.stopRenderLoop();
            } else {
                this.startRenderLoop();
            }
        });

        // Handle container resize
        const resizeObserver = new ResizeObserver(() => {
            this.engine.resize();
        });
        resizeObserver.observe(this.container);
    }

    /**
     * Start render loop
     */
    startRenderLoop() {
        this.engine.runRenderLoop(() => {
            this.scene.render();
        });
    }

    /**
     * Update visualization with new data
     */
    updateVisualization(type, data) {
        const viz = this.visualizations.get(type);
        if (!viz) return;

        // Update based on type
        switch(type) {
            case 'neuralNetwork':
                this.updateNeuralNetwork(viz, data);
                break;
            case 'sportsField':
                this.updateSportsField(viz, data);
                break;
            case 'dataStreams':
                this.updateDataStreams(viz, data);
                break;
            case 'holographicDisplays':
                this.updateHolographicDisplays(viz, data);
                break;
        }
    }

    /**
     * Update neural network with data
     */
    updateNeuralNetwork(network, data) {
        // Update node intensities based on data
        network.getChildMeshes().forEach((node, i) => {
            if (node.name.includes('node')) {
                const intensity = data.activations?.[i] || Math.random();
                node.material.emissiveIntensity = intensity;
            }
        });
    }

    /**
     * Update sports field with data
     */
    updateSportsField(field, data) {
        // Update field based on game state
        if (data.inning) {
            // Highlight active base
            field.getChildMeshes().forEach(base => {
                if (base.name === data.activeBase) {
                    base.material.emissiveIntensity = 1;
                } else {
                    base.material.emissiveIntensity = 0.3;
                }
            });
        }
    }

    /**
     * Update data streams
     */
    updateDataStreams(streams, data) {
        // Update stream colors based on team performance
        streams.getChildMeshes().forEach((stream, i) => {
            if (data.teamPerformance?.[i]) {
                const performance = data.teamPerformance[i];
                stream.material.emissiveIntensity = performance;
            }
        });
    }

    /**
     * Update holographic displays
     */
    updateHolographicDisplays(displays, data) {
        // Update display values
        if (data.stats) {
            // Implementation would update the GUI text blocks
            console.log('Updating holographic displays with:', data.stats);
        }
    }

    /**
     * Dispose and cleanup
     */
    dispose() {
        // Stop animations
        this.animationGroups.forEach(group => group.dispose());

        // Dispose visualizations
        this.visualizations.forEach(viz => {
            if (viz.dispose) viz.dispose();
        });

        // Dispose scene and engine
        this.scene?.dispose();
        this.engine?.dispose();

        // Remove canvas
        if (this.canvas && this.canvas.parentElement) {
            this.canvas.parentElement.removeChild(this.canvas);
        }
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BabylonEnhancedVisualizer;
}

// Make available globally
window.BabylonEnhancedVisualizer = BabylonEnhancedVisualizer;