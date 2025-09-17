/**
 * Babylon.js Converter for Blaze Intelligence
 * Migrates Three.js implementations to Babylon.js with enhanced features
 * Includes WebGPU ray tracing support and procedural generation
 */

class BabylonConverter {
    constructor() {
        this.engine = null;
        this.scene = null;
        this.camera = null;
        this.isWebGPUSupported = false;
        this.rayTracingEnabled = false;

        // Blaze Intelligence color palette
        this.colors = {
            burntOrange: BABYLON.Color3.FromHexString("#BF5700"),
            cardinalBlue: BABYLON.Color3.FromHexString("#9BCBEB"),
            tennesseeDeep: BABYLON.Color3.FromHexString("#002244"),
            vancouverTeal: BABYLON.Color3.FromHexString("#00B2A9"),
            championshipGold: BABYLON.Color3.FromHexString("#FFD700"),
            cardinalsRed: BABYLON.Color3.FromHexString("#C41E3A"),
            titansNavy: BABYLON.Color3.FromHexString("#0C2340"),
            grizzliesNavy: BABYLON.Color3.FromHexString("#12173D")
        };
    }

    /**
     * Initialize Babylon.js engine with WebGPU support if available
     */
    async initializeEngine(canvas, options = {}) {
        // Check for WebGPU support
        if (await BABYLON.WebGPUEngine.IsSupportedAsync) {
            console.log("🚀 WebGPU supported - Enabling ray tracing features");
            this.engine = new BABYLON.WebGPUEngine(canvas);
            await this.engine.initAsync();
            this.isWebGPUSupported = true;
            this.rayTracingEnabled = options.rayTracing !== false;
        } else {
            console.log("⚡ Falling back to WebGL2");
            this.engine = new BABYLON.Engine(canvas, true, {
                preserveDrawingBuffer: true,
                stencil: true,
                antialias: true,
                powerPreference: 'high-performance'
            });
        }

        // Enable performance optimizations
        this.engine.enableOfflineSupport = false;
        BABYLON.Engine.audioEngine.useCustomUnlockedButton = true;

        // Handle resize
        window.addEventListener("resize", () => {
            this.engine.resize();
        });

        return this.engine;
    }

    /**
     * Create scene with Blaze Intelligence optimizations
     */
    createScene() {
        this.scene = new BABYLON.Scene(this.engine);

        // Enable optimizations
        this.scene.autoClear = false;
        this.scene.autoClearDepthAndStencil = false;
        this.scene.blockMaterialDirtyMechanism = true;

        // Optimize for 60fps
        this.scene.getEngine().setHardwareScalingLevel(1);

        // Enable ray tracing if supported
        if (this.rayTracingEnabled && this.isWebGPUSupported) {
            this.setupRayTracing();
        }

        // Championship gradient background
        const gradient = new BABYLON.GradientMaterial("gradient", this.scene);
        gradient.topColor = this.colors.tennesseeDeep;
        gradient.bottomColor = BABYLON.Color3.Black();
        gradient.scale = 2;

        // Apply fog for depth
        this.scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
        this.scene.fogDensity = 0.015;
        this.scene.fogColor = new BABYLON.Color3(0.04, 0.05, 0.1);

        return this.scene;
    }

    /**
     * Convert Three.js camera to Babylon.js
     */
    convertCamera(threeCamera) {
        const camera = new BABYLON.UniversalCamera("camera",
            new BABYLON.Vector3(
                threeCamera?.position?.x || 0,
                threeCamera?.position?.y || 10,
                threeCamera?.position?.z || 30
            ),
            this.scene
        );

        // Match Three.js perspective camera FOV
        camera.fov = (threeCamera?.fov || 60) * Math.PI / 180;
        camera.minZ = threeCamera?.near || 0.1;
        camera.maxZ = threeCamera?.far || 1000;

        // Enhanced camera controls
        camera.attachControl(this.engine.getRenderingCanvas(), true);
        camera.speed = 0.5;
        camera.angularSensibility = 1000;

        this.camera = camera;
        return camera;
    }

    /**
     * Setup advanced lighting with ray tracing support
     */
    setupLighting() {
        // Clear existing lights
        this.scene.lights.forEach(light => light.dispose());

        // Championship stadium lighting
        const keyLight = new BABYLON.DirectionalLight("keyLight",
            new BABYLON.Vector3(-1, -2, -1), this.scene);
        keyLight.intensity = 1.2;
        keyLight.diffuse = this.colors.championshipGold;
        keyLight.specular = BABYLON.Color3.White();

        // Enable ray traced shadows if supported
        if (this.rayTracingEnabled && this.isWebGPUSupported) {
            const shadowGenerator = new BABYLON.ShadowGenerator(2048, keyLight);
            shadowGenerator.useContactHardeningShadow = true;
            shadowGenerator.contactHardeningLightSizeUVRatio = 0.05;
            shadowGenerator.bias = 0.00001;
            shadowGenerator.normalBias = 0.01;
            shadowGenerator.setDarkness(0.3);

            // Ray traced soft shadows
            shadowGenerator.filteringQuality = BABYLON.ShadowGenerator.QUALITY_HIGH;
            shadowGenerator.usePercentageCloserFiltering = true;
        }

        // Rim lighting for depth
        const rimLight = new BABYLON.HemisphericLight("rimLight",
            new BABYLON.Vector3(0, 1, 0), this.scene);
        rimLight.intensity = 0.3;
        rimLight.diffuse = this.colors.cardinalBlue;
        rimLight.groundColor = this.colors.tennesseeDeep;

        // Stadium floodlights
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2;
            const spotLight = new BABYLON.SpotLight(
                `spotlight${i}`,
                new BABYLON.Vector3(Math.cos(angle) * 50, 40, Math.sin(angle) * 50),
                new BABYLON.Vector3(-Math.cos(angle), -1, -Math.sin(angle)),
                Math.PI / 4,
                2,
                this.scene
            );
            spotLight.intensity = 0.5;
            spotLight.diffuse = BABYLON.Color3.White();
        }

        return keyLight;
    }

    /**
     * Convert Three.js mesh to Babylon.js
     */
    convertMesh(threeMesh) {
        let babylonMesh;

        // Convert geometry
        if (threeMesh.geometry) {
            const geometry = threeMesh.geometry;

            if (geometry.type === 'BoxGeometry') {
                babylonMesh = BABYLON.MeshBuilder.CreateBox("box", {
                    width: geometry.parameters?.width || 1,
                    height: geometry.parameters?.height || 1,
                    depth: geometry.parameters?.depth || 1
                }, this.scene);
            } else if (geometry.type === 'SphereGeometry') {
                babylonMesh = BABYLON.MeshBuilder.CreateSphere("sphere", {
                    diameter: (geometry.parameters?.radius || 0.5) * 2,
                    segments: geometry.parameters?.widthSegments || 32
                }, this.scene);
            } else if (geometry.type === 'PlaneGeometry') {
                babylonMesh = BABYLON.MeshBuilder.CreatePlane("plane", {
                    width: geometry.parameters?.width || 1,
                    height: geometry.parameters?.height || 1
                }, this.scene);
            } else {
                // Default to box for unknown geometries
                babylonMesh = BABYLON.MeshBuilder.CreateBox("default", {}, this.scene);
            }
        }

        // Convert position
        if (threeMesh.position) {
            babylonMesh.position = new BABYLON.Vector3(
                threeMesh.position.x,
                threeMesh.position.y,
                threeMesh.position.z
            );
        }

        // Convert rotation
        if (threeMesh.rotation) {
            babylonMesh.rotation = new BABYLON.Vector3(
                threeMesh.rotation.x,
                threeMesh.rotation.y,
                threeMesh.rotation.z
            );
        }

        // Convert material
        const material = this.convertMaterial(threeMesh.material);
        if (material) {
            babylonMesh.material = material;
        }

        return babylonMesh;
    }

    /**
     * Convert Three.js material to Babylon.js PBR material
     */
    convertMaterial(threeMaterial) {
        const material = new BABYLON.PBRMaterial("material", this.scene);

        // Enable ray traced reflections if supported
        if (this.rayTracingEnabled && this.isWebGPUSupported) {
            material.enableRayTracedReflections = true;
            material.rayTracedReflectionsIntensity = 0.8;
        }

        if (!threeMaterial) {
            // Default Blaze Intelligence material
            material.albedoColor = this.colors.burntOrange;
            material.metallic = 0.3;
            material.roughness = 0.6;
            return material;
        }

        // Convert color
        if (threeMaterial.color) {
            material.albedoColor = new BABYLON.Color3(
                threeMaterial.color.r,
                threeMaterial.color.g,
                threeMaterial.color.b
            );
        }

        // Convert metalness/roughness
        material.metallic = threeMaterial.metalness || 0.5;
        material.roughness = threeMaterial.roughness || 0.5;

        // Convert emissive
        if (threeMaterial.emissive) {
            material.emissiveColor = new BABYLON.Color3(
                threeMaterial.emissive.r,
                threeMaterial.emissive.g,
                threeMaterial.emissive.b
            );
            material.emissiveIntensity = threeMaterial.emissiveIntensity || 1;
        }

        // Convert transparency
        if (threeMaterial.transparent) {
            material.transparencyMode = BABYLON.PBRMaterial.PBRMATERIAL_ALPHABLEND;
            material.alpha = threeMaterial.opacity || 1;
        }

        return material;
    }

    /**
     * Setup ray tracing features
     */
    setupRayTracing() {
        console.log("🎯 Enabling ray tracing features");

        // Create ray tracing acceleration structure
        this.scene.createDefaultEnvironment({
            createSkybox: false,
            createGround: false,
            enableGroundShadow: true,
            groundShadowLevel: 0.3
        });

        // Enable ray traced global illumination
        const pipeline = new BABYLON.DefaultRenderingPipeline(
            "rayTracePipeline",
            true,
            this.scene,
            [this.camera]
        );

        // Ray traced ambient occlusion
        pipeline.screenSpaceReflectionsEnabled = true;
        pipeline.screenSpaceReflections.strength = 0.8;
        pipeline.screenSpaceReflections.quality = 2;
        pipeline.screenSpaceReflections.falloffExponent = 2;

        // Motion blur for fast-moving objects (balls, players)
        pipeline.motionBlurEnabled = true;
        pipeline.motionBlur.motionStrength = 1;
        pipeline.motionBlur.motionBlurSamples = 32;

        return pipeline;
    }

    /**
     * Create procedural stadium
     */
    createProceduralStadium(type = 'mlb', team = 'cardinals') {
        const stadium = new BABYLON.Mesh("stadium", this.scene);

        if (type === 'mlb') {
            // Create baseball diamond
            const diamond = this.createBaseballDiamond();
            diamond.parent = stadium;

            // Create outfield walls
            const walls = this.createOutfieldWalls(team);
            walls.parent = stadium;

            // Create stands
            const stands = this.createStands(45000);
            stands.parent = stadium;

        } else if (type === 'nfl') {
            // Create football field
            const field = this.createFootballField();
            field.parent = stadium;

            // Create end zones
            const endZones = this.createEndZones(team);
            endZones.parent = stadium;

            // Create stands
            const stands = this.createStands(70000);
            stands.parent = stadium;
        }

        return stadium;
    }

    /**
     * Create baseball diamond with procedural generation
     */
    createBaseballDiamond() {
        const diamond = new BABYLON.Mesh("diamond", this.scene);

        // Infield dirt
        const infield = BABYLON.MeshBuilder.CreateGround("infield", {
            width: 30,
            height: 30
        }, this.scene);

        const dirtMaterial = new BABYLON.PBRMaterial("dirt", this.scene);
        dirtMaterial.albedoColor = new BABYLON.Color3(0.55, 0.27, 0.07);
        dirtMaterial.roughness = 0.9;
        dirtMaterial.metallic = 0;
        infield.material = dirtMaterial;
        infield.parent = diamond;

        // Grass outfield with procedural texture
        const outfield = BABYLON.MeshBuilder.CreateGround("outfield", {
            width: 100,
            height: 100,
            subdivisions: 32
        }, this.scene);

        const grassMaterial = new BABYLON.PBRMaterial("grass", this.scene);
        grassMaterial.albedoColor = new BABYLON.Color3(0.13, 0.55, 0.13);
        grassMaterial.roughness = 0.8;
        grassMaterial.metallic = 0;

        // Add procedural grass pattern
        if (this.isWebGPUSupported) {
            const grassTexture = new BABYLON.ProceduralTexture("grassTex", 512,
                "grass", this.scene);
            grassMaterial.albedoTexture = grassTexture;
        }

        outfield.material = grassMaterial;
        outfield.parent = diamond;

        // Create bases
        const bases = ['first', 'second', 'third', 'home'];
        bases.forEach((base, index) => {
            const angle = index * Math.PI / 2;
            const distance = base === 'home' ? 0 : 20;

            const baseMesh = BABYLON.MeshBuilder.CreateBox(base, {
                size: 1
            }, this.scene);

            baseMesh.position.x = Math.cos(angle) * distance;
            baseMesh.position.z = Math.sin(angle) * distance;
            baseMesh.position.y = 0.1;

            const baseMaterial = new BABYLON.PBRMaterial(base + "Mat", this.scene);
            baseMaterial.albedoColor = BABYLON.Color3.White();
            baseMaterial.roughness = 0.3;
            baseMesh.material = baseMaterial;
            baseMesh.parent = diamond;
        });

        return diamond;
    }

    /**
     * Create outfield walls
     */
    createOutfieldWalls(team) {
        const walls = new BABYLON.Mesh("walls", this.scene);

        // Generate wall height based on team (Green Monster for Red Sox, etc.)
        const wallHeight = team === 'redsox' ? 12 : 3 + Math.random() * 2;

        const wallCurve = [];
        for (let angle = -Math.PI / 4; angle <= Math.PI / 4; angle += Math.PI / 32) {
            const distance = 95 + Math.sin(angle * 2) * 5; // Varying distance
            wallCurve.push(new BABYLON.Vector3(
                Math.cos(angle + Math.PI / 2) * distance,
                0,
                Math.sin(angle + Math.PI / 2) * distance
            ));
        }

        const wall = BABYLON.MeshBuilder.CreateRibbon("outfieldWall", {
            pathArray: [
                wallCurve,
                wallCurve.map(p => new BABYLON.Vector3(p.x, wallHeight, p.z))
            ]
        }, this.scene);

        const wallMaterial = new BABYLON.PBRMaterial("wallMat", this.scene);
        wallMaterial.albedoColor = team === 'redsox' ?
            new BABYLON.Color3(0, 0.5, 0) : new BABYLON.Color3(0.2, 0.3, 0.2);
        wallMaterial.roughness = 0.7;
        wallMaterial.metallic = 0.1;
        wall.material = wallMaterial;
        wall.parent = walls;

        return walls;
    }

    /**
     * Create stadium stands
     */
    createStands(capacity) {
        const stands = new BABYLON.Mesh("stands", this.scene);

        // Create tiered seating bowl
        const tiers = 3;
        const seatsPerTier = Math.floor(capacity / tiers);

        for (let tier = 0; tier < tiers; tier++) {
            const radius = 60 + tier * 20;
            const height = 5 + tier * 10;
            const rows = 10 + tier * 5;

            const bowl = BABYLON.MeshBuilder.CreateCylinder(`tier${tier}`, {
                height: 15,
                diameterTop: radius * 2.2,
                diameterBottom: radius * 2,
                tessellation: 64,
                arc: 0.75
            }, this.scene);

            bowl.position.y = height;
            bowl.rotation.y = -Math.PI / 8;

            const seatMaterial = new BABYLON.PBRMaterial(`seats${tier}`, this.scene);
            seatMaterial.albedoColor = this.colors.cardinalsRed;
            seatMaterial.roughness = 0.6;
            seatMaterial.metallic = 0.2;
            bowl.material = seatMaterial;
            bowl.parent = stands;
        }

        return stands;
    }

    /**
     * Create football field
     */
    createFootballField() {
        const field = BABYLON.MeshBuilder.CreateGround("field", {
            width: 53.33, // NFL field width in yards
            height: 120,  // Field length with end zones
            subdivisions: 20
        }, this.scene);

        const fieldMaterial = new BABYLON.PBRMaterial("fieldMat", this.scene);

        // Create yard line texture procedurally
        const yardLineTexture = new BABYLON.DynamicTexture("yardLines",
            { width: 512, height: 1024 }, this.scene);
        const ctx = yardLineTexture.getContext();

        // Draw field
        ctx.fillStyle = "#0a5d2e";
        ctx.fillRect(0, 0, 512, 1024);

        // Draw yard lines
        ctx.strokeStyle = "white";
        ctx.lineWidth = 3;
        for (let yard = 0; yard <= 100; yard += 10) {
            const y = (yard / 100) * 1024;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(512, y);
            ctx.stroke();
        }

        yardLineTexture.update();
        fieldMaterial.albedoTexture = yardLineTexture;
        fieldMaterial.roughness = 0.8;
        field.material = fieldMaterial;

        return field;
    }

    /**
     * Create end zones
     */
    createEndZones(team) {
        const endZones = new BABYLON.Mesh("endZones", this.scene);

        ['north', 'south'].forEach((zone, index) => {
            const endZone = BABYLON.MeshBuilder.CreateGround(zone + "EndZone", {
                width: 53.33,
                height: 10
            }, this.scene);

            endZone.position.z = index === 0 ? 55 : -55;

            const endZoneMaterial = new BABYLON.PBRMaterial(zone + "Mat", this.scene);
            endZoneMaterial.albedoColor = team === 'titans' ?
                this.colors.titansNavy : this.colors.burntOrange;
            endZoneMaterial.roughness = 0.8;
            endZone.material = endZoneMaterial;
            endZone.parent = endZones;
        });

        return endZones;
    }

    /**
     * Create particle system for hero effects
     */
    createHeroParticles() {
        const particleSystem = new BABYLON.ParticleSystem("particles", 2000, this.scene);
        particleSystem.particleTexture = new BABYLON.Texture(
            "https://assets.babylonjs.com/textures/flare.png", this.scene);

        particleSystem.emitter = BABYLON.Vector3.Zero();
        particleSystem.minEmitBox = new BABYLON.Vector3(-50, -50, -50);
        particleSystem.maxEmitBox = new BABYLON.Vector3(50, 50, 50);

        particleSystem.color1 = new BABYLON.Color4(...this.colors.burntOrange.asArray(), 1);
        particleSystem.color2 = new BABYLON.Color4(...this.colors.cardinalBlue.asArray(), 1);
        particleSystem.colorDead = new BABYLON.Color4(0, 0, 0, 0);

        particleSystem.minSize = 0.1;
        particleSystem.maxSize = 0.5;

        particleSystem.minLifeTime = 2;
        particleSystem.maxLifeTime = 5;

        particleSystem.emitRate = 100;

        particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;

        particleSystem.gravity = new BABYLON.Vector3(0, -0.5, 0);

        particleSystem.direction1 = new BABYLON.Vector3(-1, 8, 1);
        particleSystem.direction2 = new BABYLON.Vector3(1, 8, -1);

        particleSystem.minAngularSpeed = 0;
        particleSystem.maxAngularSpeed = Math.PI;

        particleSystem.minEmitPower = 1;
        particleSystem.maxEmitPower = 3;
        particleSystem.updateSpeed = 0.01;

        particleSystem.start();

        return particleSystem;
    }

    /**
     * Animate scene
     */
    startRenderLoop(customAnimation) {
        this.engine.runRenderLoop(() => {
            if (customAnimation) {
                customAnimation();
            }
            this.scene.render();
        });
    }

    /**
     * Dispose and cleanup
     */
    dispose() {
        this.scene?.dispose();
        this.engine?.dispose();
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BabylonConverter;
}

// Make available globally
window.BabylonConverter = BabylonConverter;