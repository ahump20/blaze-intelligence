/**
 * Babylon.js Sports-Specific Components for Blaze Intelligence
 * Championship-level visualizations for MLB, NFL, NBA, NCAA, Perfect Game
 * Includes ray-traced ball physics and procedural venue generation
 */

class BabylonSportsComponents {
    constructor(scene, engine) {
        this.scene = scene;
        this.engine = engine;
        this.isWebGPU = engine.constructor.name === 'WebGPUEngine';

        // Team colors database
        this.teamColors = {
            // MLB
            cardinals: { primary: '#C41E3A', secondary: '#0C2340', accent: '#FEDB00' },
            astros: { primary: '#EB6E1F', secondary: '#002D62', accent: '#F4911E' },
            rangers: { primary: '#003278', secondary: '#C0111F', accent: '#FFFFFF' },

            // NFL
            titans: { primary: '#0C2340', secondary: '#4B92DB', accent: '#C8102E' },
            texans: { primary: '#03202F', secondary: '#A71930', accent: '#FFFFFF' },
            cowboys: { primary: '#003594', secondary: '#869397', accent: '#FFFFFF' },

            // NBA
            grizzlies: { primary: '#12173D', secondary: '#9EA2A2', accent: '#FDB927' },
            mavericks: { primary: '#00538C', secondary: '#002B5E', accent: '#C4CED4' },
            spurs: { primary: '#000000', secondary: '#C4CED4', accent: '#FFFFFF' },

            // NCAA
            longhorns: { primary: '#BF5700', secondary: '#FFFFFF', accent: '#333F48' },
            aggies: { primary: '#500000', secondary: '#FFFFFF', accent: '#998542' }
        };

        // Venue specifications
        this.venueSpecs = {
            mlb: {
                buschStadium: { capacity: 44494, leftField: 336, centerField: 400, rightField: 335 },
                minuteMaidPark: { capacity: 41168, leftField: 315, centerField: 436, rightField: 326 },
                globeLifeField: { capacity: 40300, leftField: 329, centerField: 407, rightField: 326 }
            },
            nfl: {
                nissanStadium: { capacity: 69143, surface: 'grass', roof: 'open' },
                nrgStadium: { capacity: 72220, surface: 'turf', roof: 'retractable' },
                attStadium: { capacity: 80000, surface: 'turf', roof: 'retractable' }
            },
            nba: {
                fedexForum: { capacity: 18119, courtLength: 94, courtWidth: 50 },
                americanAirlinesCenter: { capacity: 19200, courtLength: 94, courtWidth: 50 },
                attCenter: { capacity: 18418, courtLength: 94, courtWidth: 50 }
            },
            perfectGame: {
                lgClassic: { fields: 4, ageGroups: ['9u', '10u', '11u', '12u'] },
                pgNationals: { fields: 8, ageGroups: ['13u', '14u', '15u', '16u', '17u'] },
                wwba: { fields: 12, ageGroups: ['14u', '15u', '16u', '17u', '18u'] }
            }
        };

        // Physics constants
        this.physics = {
            gravity: new BABYLON.Vector3(0, -9.81, 0),
            airDensity: 1.225, // kg/m³
            dragCoefficient: {
                baseball: 0.3,
                football: 0.05,
                basketball: 0.47
            },
            magnus: {
                baseball: 0.00041, // Magnus coefficient for baseball
                football: 0.00025,
                basketball: 0.00035
            }
        };
    }

    /**
     * Create MLB stadium with accurate dimensions
     */
    createMLBStadium(team = 'cardinals', options = {}) {
        const stadium = new BABYLON.Mesh(`${team}Stadium`, this.scene);
        const specs = this.venueSpecs.mlb[team === 'cardinals' ? 'buschStadium' :
                     team === 'astros' ? 'minuteMaidPark' : 'globeLifeField'];

        // Create playing field
        const field = this.createBaseballField(specs, team);
        field.parent = stadium;

        // Create outfield walls
        const walls = this.createOutfieldDimensions(specs);
        walls.parent = stadium;

        // Create seating bowl
        const stands = this.createStadiumSeating(specs.capacity, this.teamColors[team]);
        stands.parent = stadium;

        // Add stadium lights
        if (options.lights) {
            this.addStadiumLighting(stadium);
        }

        // Add scoreboard
        if (options.scoreboard) {
            const scoreboard = this.createScoreboard(team);
            scoreboard.parent = stadium;
        }

        return stadium;
    }

    /**
     * Create accurate baseball field
     */
    createBaseballField(specs, team) {
        const field = new BABYLON.Mesh('baseballField', this.scene);

        // Infield skin (dirt)
        const infieldPoints = [
            new BABYLON.Vector3(0, 0, 0), // Home plate
            new BABYLON.Vector3(27.43, 0, 27.43), // First base
            new BABYLON.Vector3(0, 0, 38.8), // Second base
            new BABYLON.Vector3(-27.43, 0, 27.43), // Third base
        ];

        const infield = BABYLON.MeshBuilder.CreatePolygon('infield', {
            shape: infieldPoints,
            sideOrientation: BABYLON.Mesh.DOUBLESIDE
        }, this.scene);

        const dirtMaterial = new BABYLON.PBRMaterial('dirtMat', this.scene);
        dirtMaterial.albedoColor = BABYLON.Color3.FromHexString('#8B7355');
        dirtMaterial.roughness = 0.9;
        dirtMaterial.metallic = 0;

        if (this.isWebGPU) {
            // Procedural dirt texture
            const dirtTexture = new BABYLON.ProceduralTexture('dirtTex', 512, 'dirt', this.scene);
            dirtMaterial.albedoTexture = dirtTexture;
        }

        infield.material = dirtMaterial;
        infield.parent = field;

        // Grass outfield
        const outfield = BABYLON.MeshBuilder.CreateGround('outfield', {
            width: specs.centerField / 3,
            height: specs.centerField / 3,
            subdivisions: 64
        }, this.scene);

        const grassMaterial = this.createGrassMaterial(team);
        outfield.material = grassMaterial;
        outfield.parent = field;

        // Create base paths
        this.createBasePaths(field);

        // Create pitcher's mound
        const mound = this.createPitchersMound();
        mound.parent = field;

        // Create bases
        this.createBases(field);

        // Create foul lines
        this.createFoulLines(field, specs);

        return field;
    }

    /**
     * Create realistic grass material with patterns
     */
    createGrassMaterial(team) {
        const grassMat = new BABYLON.PBRMaterial('grassMat', this.scene);

        // Create procedural grass texture
        const grassTexture = new BABYLON.DynamicTexture('grassPattern',
            { width: 2048, height: 2048 }, this.scene);
        const ctx = grassTexture.getContext();

        // Draw mowing patterns
        const stripeWidth = 256;
        for (let i = 0; i < 2048; i += stripeWidth) {
            ctx.fillStyle = i % (stripeWidth * 2) === 0 ? '#0D5F0D' : '#0B4F0B';
            ctx.fillRect(i, 0, stripeWidth, 2048);
        }

        // Add team logo in center field
        if (team) {
            ctx.font = 'bold 200px Arial';
            ctx.fillStyle = this.teamColors[team].primary;
            ctx.textAlign = 'center';
            ctx.fillText(team.charAt(0).toUpperCase(), 1024, 1024);
        }

        grassTexture.update();
        grassMat.albedoTexture = grassTexture;
        grassMat.roughness = 0.8;
        grassMat.metallic = 0;

        // Add bump mapping for realism
        if (this.isWebGPU) {
            const bumpTexture = new BABYLON.ProceduralTexture('grassBump', 512, 'grass', this.scene);
            grassMat.bumpTexture = bumpTexture;
        }

        return grassMat;
    }

    /**
     * Create pitcher's mound with proper dimensions
     */
    createPitchersMound() {
        const mound = BABYLON.MeshBuilder.CreateCylinder('mound', {
            height: 0.25, // 10 inches
            diameterTop: 5.5, // 18 feet
            diameterBottom: 5.5,
            tessellation: 32
        }, this.scene);

        mound.position = new BABYLON.Vector3(0, 0.125, 18.44); // 60 feet 6 inches

        const moundMat = new BABYLON.PBRMaterial('moundMat', this.scene);
        moundMat.albedoColor = BABYLON.Color3.FromHexString('#8B7355');
        moundMat.roughness = 0.9;
        mound.material = moundMat;

        // Add rubber
        const rubber = BABYLON.MeshBuilder.CreateBox('rubber', {
            width: 0.6, // 24 inches
            height: 0.05,
            depth: 0.15 // 6 inches
        }, this.scene);
        rubber.position = new BABYLON.Vector3(0, 0.26, 18.44);

        const rubberMat = new BABYLON.PBRMaterial('rubberMat', this.scene);
        rubberMat.albedoColor = BABYLON.Color3.White();
        rubberMat.roughness = 0.7;
        rubber.material = rubberMat;
        rubber.parent = mound;

        return mound;
    }

    /**
     * Create NFL stadium with accurate specifications
     */
    createNFLStadium(team = 'titans', options = {}) {
        const stadium = new BABYLON.Mesh(`${team}Stadium`, this.scene);
        const specs = this.venueSpecs.nfl[team === 'titans' ? 'nissanStadium' :
                     team === 'texans' ? 'nrgStadium' : 'attStadium'];

        // Create football field
        const field = this.createFootballField(team, specs.surface);
        field.parent = stadium;

        // Create end zones
        const endZones = this.createNFLEndZones(team);
        endZones.parent = stadium;

        // Create goalposts
        const goalposts = this.createGoalposts();
        goalposts.parent = stadium;

        // Create seating
        const stands = this.createStadiumSeating(specs.capacity, this.teamColors[team]);
        stands.parent = stadium;

        // Add retractable roof if applicable
        if (specs.roof === 'retractable' && options.roof) {
            const roof = this.createRetractableRoof();
            roof.parent = stadium;
        }

        // Add jumbotron
        if (options.jumbotron) {
            const jumbotron = this.createJumbotron(team);
            jumbotron.parent = stadium;
        }

        return stadium;
    }

    /**
     * Create NBA arena with accurate court dimensions
     */
    createNBAArena(team = 'grizzlies', options = {}) {
        const arena = new BABYLON.Mesh(`${team}Arena`, this.scene);
        const specs = this.venueSpecs.nba[team === 'grizzlies' ? 'fedexForum' :
                     team === 'mavericks' ? 'americanAirlinesCenter' : 'attCenter'];

        // Create basketball court
        const court = this.createBasketballCourt(team);
        court.parent = arena;

        // Create hoops
        const hoops = this.createBasketballHoops();
        hoops.parent = arena;

        // Create seating bowl
        const stands = this.createArenaSeating(specs.capacity, this.teamColors[team]);
        stands.parent = arena;

        // Add scoreboard
        if (options.scoreboard) {
            const scoreboard = this.createArenaScoreboard(team);
            scoreboard.parent = arena;
        }

        // Add championship banners
        if (options.banners) {
            const banners = this.createChampionshipBanners(team);
            banners.parent = arena;
        }

        return arena;
    }

    /**
     * Create Perfect Game tournament complex
     */
    createPerfectGameComplex(tournament = 'lgClassic', options = {}) {
        const complex = new BABYLON.Mesh('perfectGameComplex', this.scene);
        const specs = this.venueSpecs.perfectGame[tournament];

        // Create multiple fields
        for (let i = 0; i < specs.fields; i++) {
            const angle = (i / specs.fields) * Math.PI * 2;
            const radius = 150; // Distance between fields

            const field = this.createYouthBaseballField(specs.ageGroups[i % specs.ageGroups.length]);
            field.position.x = Math.cos(angle) * radius;
            field.position.z = Math.sin(angle) * radius;
            field.rotation.y = -angle;
            field.parent = complex;

            // Add field number sign
            const fieldSign = this.createFieldSign(i + 1, specs.ageGroups[i % specs.ageGroups.length]);
            fieldSign.position = field.position.clone();
            fieldSign.position.y = 10;
            fieldSign.parent = complex;
        }

        // Create central complex building
        if (options.complex) {
            const building = this.createComplexBuilding();
            building.parent = complex;
        }

        // Create parking areas
        if (options.parking) {
            const parking = this.createParkingLots(specs.fields * 50);
            parking.parent = complex;
        }

        return complex;
    }

    /**
     * Create youth baseball field with age-appropriate dimensions
     */
    createYouthBaseballField(ageGroup) {
        const field = new BABYLON.Mesh(`field_${ageGroup}`, this.scene);

        // Age-specific dimensions
        const dimensions = {
            '9u': { bases: 65, mound: 46, fence: 200 },
            '10u': { bases: 65, mound: 46, fence: 200 },
            '11u': { bases: 70, mound: 50, fence: 225 },
            '12u': { bases: 70, mound: 50, fence: 225 },
            '13u': { bases: 80, mound: 54, fence: 275 },
            '14u': { bases: 90, mound: 60.5, fence: 300 },
            '15u': { bases: 90, mound: 60.5, fence: 315 },
            '16u': { bases: 90, mound: 60.5, fence: 330 },
            '17u': { bases: 90, mound: 60.5, fence: 330 },
            '18u': { bases: 90, mound: 60.5, fence: 330 }
        };

        const dims = dimensions[ageGroup] || dimensions['14u'];

        // Scale field components based on age group
        const scaleFactor = dims.bases / 90;

        // Create infield
        const infield = BABYLON.MeshBuilder.CreateGround(`infield_${ageGroup}`, {
            width: dims.bases * 1.5,
            height: dims.bases * 1.5
        }, this.scene);

        const infieldMat = new BABYLON.PBRMaterial(`infieldMat_${ageGroup}`, this.scene);
        infieldMat.albedoColor = BABYLON.Color3.FromHexString('#8B7355');
        infieldMat.roughness = 0.9;
        infield.material = infieldMat;
        infield.parent = field;

        // Create outfield with fence
        const outfield = BABYLON.MeshBuilder.CreateGround(`outfield_${ageGroup}`, {
            width: dims.fence * 0.67,
            height: dims.fence * 0.67,
            subdivisions: 32
        }, this.scene);

        const outfieldMat = new BABYLON.PBRMaterial(`outfieldMat_${ageGroup}`, this.scene);
        outfieldMat.albedoColor = BABYLON.Color3.FromHexString('#228B22');
        outfieldMat.roughness = 0.8;
        outfield.material = outfieldMat;
        outfield.parent = field;

        // Create fence
        const fencePoints = [];
        for (let angle = -Math.PI / 4; angle <= Math.PI / 4; angle += Math.PI / 32) {
            fencePoints.push(new BABYLON.Vector3(
                Math.cos(angle + Math.PI / 2) * dims.fence / 3,
                0,
                Math.sin(angle + Math.PI / 2) * dims.fence / 3
            ));
        }

        const fence = BABYLON.MeshBuilder.CreateRibbon(`fence_${ageGroup}`, {
            pathArray: [
                fencePoints,
                fencePoints.map(p => new BABYLON.Vector3(p.x, 2.5, p.z))
            ]
        }, this.scene);

        const fenceMat = new BABYLON.PBRMaterial(`fenceMat_${ageGroup}`, this.scene);
        fenceMat.albedoColor = BABYLON.Color3.FromHexString('#FFD700');
        fenceMat.roughness = 0.6;
        fenceMat.metallic = 0.3;
        fence.material = fenceMat;
        fence.parent = field;

        // Add age group label
        this.createAgeGroupLabel(field, ageGroup);

        return field;
    }

    /**
     * Ray-traced ball physics system
     */
    createBallPhysics(ballType = 'baseball') {
        const physics = {
            ball: null,
            trajectory: [],
            shadowRay: null,
            isRayTracingEnabled: this.isWebGPU
        };

        // Create ball mesh
        const diameter = ballType === 'baseball' ? 0.073 :
                        ballType === 'football' ? 0.28 :
                        ballType === 'basketball' ? 0.24 : 0.073;

        physics.ball = BABYLON.MeshBuilder.CreateSphere(`${ballType}Ball`, {
            diameter: diameter,
            segments: 32
        }, this.scene);

        // PBR material with ray tracing
        const ballMat = new BABYLON.PBRMaterial(`${ballType}Mat`, this.scene);

        if (ballType === 'baseball') {
            ballMat.albedoColor = BABYLON.Color3.White();
            ballMat.roughness = 0.6;

            // Add stitching texture
            const stitchTexture = new BABYLON.DynamicTexture('stitches',
                { width: 512, height: 512 }, this.scene);
            const ctx = stitchTexture.getContext();
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 3;

            // Draw stitching pattern
            for (let i = 0; i < 108; i++) { // 108 stitches on a baseball
                const angle = (i / 108) * Math.PI * 4;
                const x = 256 + Math.cos(angle) * 200;
                const y = 256 + Math.sin(angle) * 50;
                ctx.beginPath();
                ctx.arc(x, y, 2, 0, Math.PI * 2);
                ctx.stroke();
            }

            stitchTexture.update();
            ballMat.albedoTexture = stitchTexture;
        } else if (ballType === 'football') {
            ballMat.albedoColor = BABYLON.Color3.FromHexString('#835C3B');
            ballMat.roughness = 0.7;
        } else if (ballType === 'basketball') {
            ballMat.albedoColor = BABYLON.Color3.FromHexString('#EE6730');
            ballMat.roughness = 0.8;
        }

        ballMat.metallic = 0.1;

        if (this.isWebGPU) {
            ballMat.enableRayTracedReflections = true;
            ballMat.rayTracedReflectionsIntensity = 0.3;
        }

        physics.ball.material = ballMat;

        // Calculate trajectory with ray tracing
        physics.calculateTrajectory = (initialVelocity, spinRate, launchAngle) => {
            const trajectory = [];
            const dt = 0.016; // 60 fps
            let position = physics.ball.position.clone();
            let velocity = initialVelocity.clone();

            // Convert launch angle to radians
            const angleRad = launchAngle * Math.PI / 180;
            velocity.y = initialVelocity.length() * Math.sin(angleRad);
            velocity.x = initialVelocity.length() * Math.cos(angleRad) * Math.cos(0);
            velocity.z = initialVelocity.length() * Math.cos(angleRad) * Math.sin(0);

            for (let t = 0; t < 10; t += dt) { // 10 second max flight
                // Apply gravity
                velocity = velocity.add(this.physics.gravity.scale(dt));

                // Apply drag
                const dragForce = this.calculateDrag(velocity, ballType);
                velocity = velocity.subtract(dragForce.scale(dt));

                // Apply Magnus effect
                if (spinRate > 0) {
                    const magnusForce = this.calculateMagnus(velocity, spinRate, ballType);
                    velocity = velocity.add(magnusForce.scale(dt));
                }

                // Update position
                position = position.add(velocity.scale(dt));

                // Ray trace for collision detection
                if (this.isWebGPU) {
                    const ray = new BABYLON.Ray(position, velocity.normalize(), velocity.length() * dt);
                    const hit = this.scene.pickWithRay(ray);

                    if (hit && hit.hit) {
                        // Ball hit something
                        position = hit.pickedPoint;

                        // Calculate bounce
                        const normal = hit.getNormal(true);
                        velocity = velocity.subtract(normal.scale(2 * BABYLON.Vector3.Dot(velocity, normal)));
                        velocity = velocity.scale(0.7); // Energy loss
                    }
                }

                trajectory.push({
                    position: position.clone(),
                    velocity: velocity.clone(),
                    time: t
                });

                // Stop if ball hits ground
                if (position.y < 0) break;
            }

            physics.trajectory = trajectory;
            return trajectory;
        };

        // Animate ball along trajectory
        physics.animateTrajectory = (speed = 1) => {
            if (physics.trajectory.length === 0) return;

            let index = 0;
            const animationGroup = new BABYLON.AnimationGroup('ballTrajectory', this.scene);

            // Position animation
            const posAnimation = new BABYLON.Animation(
                'ballPos',
                'position',
                60,
                BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
                BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
            );

            const posKeys = physics.trajectory.map((point, i) => ({
                frame: i * speed,
                value: point.position
            }));

            posAnimation.setKeys(posKeys);
            animationGroup.addTargetedAnimation(posAnimation, physics.ball);

            // Rotation animation for spin
            const rotAnimation = new BABYLON.Animation(
                'ballRot',
                'rotation',
                60,
                BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
                BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
            );

            const rotKeys = physics.trajectory.map((point, i) => ({
                frame: i * speed,
                value: new BABYLON.Vector3(i * 0.1, i * 0.2, 0)
            }));

            rotAnimation.setKeys(rotKeys);
            animationGroup.addTargetedAnimation(rotAnimation, physics.ball);

            // Create trail effect
            if (this.isWebGPU) {
                this.createBallTrail(physics.trajectory);
            }

            animationGroup.play(false);
            return animationGroup;
        };

        return physics;
    }

    /**
     * Calculate drag force
     */
    calculateDrag(velocity, ballType) {
        const speed = velocity.length();
        const dragCoeff = this.physics.dragCoefficient[ballType];
        const crossSection = ballType === 'baseball' ? 0.004 :
                           ballType === 'football' ? 0.025 :
                           ballType === 'basketball' ? 0.045 : 0.004;

        const dragMagnitude = 0.5 * this.physics.airDensity * dragCoeff * crossSection * speed * speed;
        return velocity.normalize().scale(-dragMagnitude);
    }

    /**
     * Calculate Magnus force
     */
    calculateMagnus(velocity, spinRate, ballType) {
        const magnusCoeff = this.physics.magnus[ballType];
        const speed = velocity.length();

        // Simplified Magnus force calculation
        const magnusForce = new BABYLON.Vector3(
            0,
            magnusCoeff * spinRate * speed,
            0
        );

        return magnusForce;
    }

    /**
     * Create ball trail effect with ray tracing
     */
    createBallTrail(trajectory) {
        const trail = new BABYLON.TrailMesh('ballTrail', this.ball, this.scene, 0.5, 30, true);

        const trailMat = new BABYLON.StandardMaterial('trailMat', this.scene);
        trailMat.emissiveColor = BABYLON.Color3.FromHexString('#FFD700');
        trailMat.alpha = 0.5;
        trail.material = trailMat;

        // Add glow effect
        const gl = new BABYLON.GlowLayer('trailGlow', this.scene);
        gl.intensity = 1.5;
        gl.addIncludedOnlyMesh(trail);

        return trail;
    }

    /**
     * Create stadium seating with team colors
     */
    createStadiumSeating(capacity, teamColors) {
        const stands = new BABYLON.Mesh('stands', this.scene);

        // Create tiered seating
        const tiers = 3;
        const seatsPerTier = Math.floor(capacity / tiers);

        for (let tier = 0; tier < tiers; tier++) {
            const radius = 80 + tier * 30;
            const height = 10 + tier * 15;

            const bowl = BABYLON.MeshBuilder.CreateCylinder(`tier${tier}`, {
                height: 20,
                diameterTop: radius * 2.3,
                diameterBottom: radius * 2,
                tessellation: 64,
                arc: 0.75
            }, this.scene);

            bowl.position.y = height;
            bowl.rotation.y = -Math.PI / 8;

            const seatMat = new BABYLON.PBRMaterial(`seatMat${tier}`, this.scene);
            seatMat.albedoColor = BABYLON.Color3.FromHexString(
                tier === 0 ? teamColors.primary :
                tier === 1 ? teamColors.secondary :
                teamColors.accent
            );
            seatMat.roughness = 0.6;
            seatMat.metallic = 0.2;

            bowl.material = seatMat;
            bowl.parent = stands;

            // Add seat instances for performance
            if (this.isWebGPU) {
                this.createSeatInstances(bowl, seatsPerTier);
            }
        }

        return stands;
    }

    /**
     * Create seat instances for realistic crowd
     */
    createSeatInstances(bowl, count) {
        const seat = BABYLON.MeshBuilder.CreateBox('seatTemplate', {
            width: 0.5,
            height: 0.8,
            depth: 0.5
        }, this.scene);

        seat.isVisible = false;

        // Create instances
        for (let i = 0; i < count; i++) {
            const instance = seat.createInstance(`seat${i}`);

            // Random position on bowl surface
            const angle = Math.random() * Math.PI * 1.5 - Math.PI * 0.75;
            const radiusVariation = Math.random() * 5;
            const tier = Math.floor(i / (count / 3));

            instance.position = new BABYLON.Vector3(
                Math.cos(angle) * (80 + tier * 30 + radiusVariation),
                10 + tier * 15 + Math.random() * 2,
                Math.sin(angle) * (80 + tier * 30 + radiusVariation)
            );

            instance.rotation.y = angle;

            // Random color variation for crowd effect
            if (Math.random() > 0.7) {
                instance.material = this.createFanMaterial();
            }
        }
    }

    /**
     * Create fan material with team colors
     */
    createFanMaterial() {
        const fanMat = new BABYLON.PBRMaterial('fanMat', this.scene);
        const colors = ['#FF0000', '#0000FF', '#FFFF00', '#00FF00', '#FF00FF'];
        fanMat.albedoColor = BABYLON.Color3.FromHexString(
            colors[Math.floor(Math.random() * colors.length)]
        );
        fanMat.roughness = 0.9;
        return fanMat;
    }

    /**
     * Create stadium lighting system
     */
    addStadiumLighting(stadium) {
        // Create light towers
        const towerPositions = [
            { x: 100, z: 100 },
            { x: -100, z: 100 },
            { x: 100, z: -100 },
            { x: -100, z: -100 }
        ];

        towerPositions.forEach((pos, i) => {
            // Tower structure
            const tower = BABYLON.MeshBuilder.CreateCylinder(`lightTower${i}`, {
                height: 50,
                diameterBottom: 3,
                diameterTop: 1,
                tessellation: 8
            }, this.scene);

            tower.position = new BABYLON.Vector3(pos.x, 25, pos.z);

            const towerMat = new BABYLON.PBRMaterial(`towerMat${i}`, this.scene);
            towerMat.albedoColor = BABYLON.Color3.Gray();
            towerMat.metallic = 0.8;
            towerMat.roughness = 0.3;
            tower.material = towerMat;
            tower.parent = stadium;

            // Light array
            for (let j = 0; j < 4; j++) {
                const light = new BABYLON.SpotLight(
                    `stadiumLight${i}_${j}`,
                    new BABYLON.Vector3(pos.x, 45, pos.z),
                    new BABYLON.Vector3(-pos.x / 100, -0.8, -pos.z / 100),
                    Math.PI / 3,
                    2,
                    this.scene
                );

                light.intensity = 2;
                light.diffuse = BABYLON.Color3.White();
                light.specular = BABYLON.Color3.White();

                // Ray traced shadows
                if (this.isWebGPU) {
                    const shadowGen = new BABYLON.ShadowGenerator(2048, light);
                    shadowGen.useContactHardeningShadow = true;
                    shadowGen.contactHardeningLightSizeUVRatio = 0.05;

                    // Add all meshes to shadow map
                    stadium.getChildMeshes().forEach(mesh => {
                        shadowGen.addShadowCaster(mesh);
                    });
                }

                // Light housing mesh
                const housing = BABYLON.MeshBuilder.CreateCylinder(`housing${i}_${j}`, {
                    height: 2,
                    diameterTop: 3,
                    diameterBottom: 1,
                    tessellation: 8
                }, this.scene);

                housing.position = new BABYLON.Vector3(pos.x, 45 - j * 2, pos.z);
                housing.rotation.x = Math.PI / 6;

                const housingMat = new BABYLON.PBRMaterial(`housingMat${i}_${j}`, this.scene);
                housingMat.emissiveColor = BABYLON.Color3.White();
                housingMat.emissiveIntensity = 2;
                housing.material = housingMat;
                housing.parent = tower;
            }
        });
    }

    /**
     * Dispose all components
     */
    dispose() {
        this.scene.meshes.forEach(mesh => {
            if (mesh.material) mesh.material.dispose();
            mesh.dispose();
        });
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BabylonSportsComponents;
}

// Make available globally
window.BabylonSportsComponents = BabylonSportsComponents;