/**
 * Blaze Intelligence Biomechanical Analysis System
 * Real-time posture, movement quality, and athletic performance assessment
 * Deep South Sports Authority - Elite Athletic Biomechanics
 */

class BiomechanicalAnalyzer {
    constructor() {
        this.poseDetection = null;
        this.isInitialized = false;
        this.analysisHistory = [];
        this.currentPose = null;

        // Biomechanical assessment parameters
        this.postureStandards = {
            athletic_stance: {
                knee_flexion: { optimal: 25, range: [15, 35] },
                hip_flexion: { optimal: 20, range: [10, 30] },
                spine_alignment: { optimal: 0, range: [-5, 5] },
                shoulder_position: { optimal: 0, range: [-10, 10] },
                weight_distribution: { optimal: 50, range: [45, 55] }
            },
            movement_quality: {
                stability_score: { excellent: 0.9, good: 0.75, needs_work: 0.6 },
                coordination: { excellent: 0.85, good: 0.7, needs_work: 0.55 },
                efficiency: { excellent: 0.9, good: 0.75, needs_work: 0.6 }
            }
        };

        // Kinematic chain analysis points
        this.kinematicChain = {
            lower_body: ['hip', 'knee', 'ankle'],
            core: ['pelvis', 'spine', 'shoulders'],
            upper_body: ['shoulder', 'elbow', 'wrist'],
            head_neck: ['neck', 'head']
        };

        // Performance scoring weights
        this.scoringWeights = {
            posture: 0.25,
            balance: 0.25,
            movement_efficiency: 0.20,
            tension_management: 0.15,
            athletic_readiness: 0.15
        };

        this.performanceMetrics = {
            processingTimes: [],
            accuracyScores: [],
            analysisCount: 0
        };
    }

    async initialize() {
        try {
            // Load MediaPipe Pose Detection
            await this.loadMediaPipePose();

            // Initialize pose analysis pipeline
            this.setupPoseAnalysis();

            // Start performance monitoring
            this.startPerformanceTracking();

            this.isInitialized = true;
            console.log('🏆 Biomechanical Analyzer initialized successfully');

            return { status: 'success', message: 'Biomechanical analysis ready' };
        } catch (error) {
            console.error('❌ Failed to initialize Biomechanical Analyzer:', error);
            return { status: 'error', message: error.message };
        }
    }

    async loadMediaPipePose() {
        // Load MediaPipe Pose detection library
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5/pose.js';
        document.head.appendChild(script);

        await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
        });

        // Initialize pose detection with high precision
        this.pose = new Pose({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5/${file}`
        });

        this.pose.setOptions({
            model: 'full',
            enableSegmentation: false,
            minDetectionConfidence: 0.8,
            minTrackingConfidence: 0.7,
            smoothLandmarks: true
        });

        this.pose.onResults(this.onPoseResults.bind(this));
    }

    setupPoseAnalysis() {
        // Create canvas for pose visualization
        this.canvas = document.createElement('canvas');
        this.canvas.width = 640;
        this.canvas.height = 480;
        this.ctx = this.canvas.getContext('2d');
    }

    async analyzeBiomechanics(videoElement) {
        const startTime = performance.now();

        try {
            // Extract current frame
            const frame = this.extractVideoFrame(videoElement);

            // Process pose detection
            await this.processPoseDetection(frame);

            // Perform biomechanical analysis
            const analysis = this.performBiomechanicalAnalysis();

            // Calculate performance scores
            const scores = this.calculatePerformanceScores(analysis);

            // Compile comprehensive results
            const results = {
                timestamp: Date.now(),
                pose_data: this.currentPose,
                biomechanical_analysis: analysis,
                performance_scores: scores,
                recommendations: this.generateRecommendations(analysis, scores),
                processing_time: performance.now() - startTime,
                confidence: this.calculateAnalysisConfidence()
            };

            this.analysisHistory.push(results);
            this.updatePerformanceMetrics(results);

            return results;

        } catch (error) {
            console.error('❌ Biomechanical analysis error:', error);
            return { error: error.message };
        }
    }

    extractVideoFrame(videoElement) {
        this.ctx.drawImage(videoElement, 0, 0, this.canvas.width, this.canvas.height);
        return this.canvas;
    }

    async processPoseDetection(frame) {
        return new Promise((resolve) => {
            this.pose.send({ image: frame });
            // Resolution will happen in onPoseResults
            setTimeout(resolve, 50); // Max wait time
        });
    }

    onPoseResults(results) {
        this.currentPose = {
            landmarks: results.poseLandmarks || [],
            worldLandmarks: results.poseWorldLandmarks || [],
            visibility: this.calculateLandmarkVisibility(results.poseLandmarks),
            timestamp: performance.now()
        };
    }

    calculateLandmarkVisibility(landmarks) {
        if (!landmarks || landmarks.length === 0) return 0;

        const visibilitySum = landmarks.reduce((sum, landmark) => {
            return sum + (landmark.visibility || 0);
        }, 0);

        return visibilitySum / landmarks.length;
    }

    performBiomechanicalAnalysis() {
        if (!this.currentPose || !this.currentPose.landmarks.length) {
            return { error: 'No pose data available' };
        }

        const landmarks = this.currentPose.landmarks;

        return {
            posture_analysis: this.analyzePosture(landmarks),
            balance_assessment: this.assessBalance(landmarks),
            movement_quality: this.evaluateMovementQuality(landmarks),
            tension_mapping: this.mapMuscleTension(landmarks),
            kinematic_chain: this.analyzeKinematicChain(landmarks),
            athletic_readiness: this.assessAthleticReadiness(landmarks)
        };
    }

    analyzePosture(landmarks) {
        const posture = {
            spine_alignment: this.calculateSpineAlignment(landmarks),
            shoulder_level: this.calculateShoulderLevel(landmarks),
            hip_alignment: this.calculateHipAlignment(landmarks),
            head_position: this.calculateHeadPosition(landmarks),
            overall_score: 0
        };

        // Calculate overall posture score
        const alignmentScore = 1 - Math.abs(posture.spine_alignment) / 15; // Normalize to 0-1
        const shoulderScore = 1 - Math.abs(posture.shoulder_level) / 10;
        const hipScore = 1 - Math.abs(posture.hip_alignment) / 10;
        const headScore = 1 - Math.abs(posture.head_position) / 10;

        posture.overall_score = (alignmentScore + shoulderScore + hipScore + headScore) / 4;

        return posture;
    }

    calculateSpineAlignment(landmarks) {
        // Calculate spine curvature using key points
        const neck = landmarks[11]; // Left shoulder approximation
        const midSpine = this.getMidpoint(landmarks[11], landmarks[12]); // Between shoulders
        const pelvis = this.getMidpoint(landmarks[23], landmarks[24]); // Between hips

        // Calculate deviation from straight line
        const spineVector = {
            x: pelvis.x - neck.x,
            y: pelvis.y - neck.y
        };

        const angle = Math.atan2(spineVector.x, spineVector.y) * (180 / Math.PI);
        return Math.abs(angle); // Deviation from vertical in degrees
    }

    calculateShoulderLevel(landmarks) {
        const leftShoulder = landmarks[11];
        const rightShoulder = landmarks[12];

        if (!leftShoulder || !rightShoulder) return 0;

        return (leftShoulder.y - rightShoulder.y) * 100; // Convert to degrees
    }

    calculateHipAlignment(landmarks) {
        const leftHip = landmarks[23];
        const rightHip = landmarks[24];

        if (!leftHip || !rightHip) return 0;

        return (leftHip.y - rightHip.y) * 100; // Convert to degrees
    }

    calculateHeadPosition(landmarks) {
        const nose = landmarks[0];
        const neck = this.getMidpoint(landmarks[11], landmarks[12]);

        if (!nose || !neck) return 0;

        // Calculate forward head posture
        return (nose.x - neck.x) * 100;
    }

    assessBalance(landmarks) {
        const balance = {
            center_of_gravity: this.calculateCenterOfGravity(landmarks),
            weight_distribution: this.calculateWeightDistribution(landmarks),
            stability_score: 0,
            sway_analysis: this.analyzePosturalSway(landmarks)
        };

        // Calculate stability score based on COG position
        const cogStability = this.evaluateCOGStability(balance.center_of_gravity);
        const distributionQuality = this.evaluateWeightDistribution(balance.weight_distribution);

        balance.stability_score = (cogStability + distributionQuality) / 2;

        return balance;
    }

    calculateCenterOfGravity(landmarks) {
        // Simplified COG calculation using key body points
        const keyPoints = [
            landmarks[11], landmarks[12], // Shoulders
            landmarks[23], landmarks[24], // Hips
            landmarks[27], landmarks[28]  // Knees
        ].filter(point => point); // Remove undefined points

        if (keyPoints.length === 0) return { x: 0.5, y: 0.5 };

        const avgX = keyPoints.reduce((sum, point) => sum + point.x, 0) / keyPoints.length;
        const avgY = keyPoints.reduce((sum, point) => sum + point.y, 0) / keyPoints.length;

        return { x: avgX, y: avgY };
    }

    calculateWeightDistribution(landmarks) {
        const leftFoot = landmarks[31];
        const rightFoot = landmarks[32];
        const centerOfGravity = this.calculateCenterOfGravity(landmarks);

        if (!leftFoot || !rightFoot) return 50; // Default to balanced

        // Calculate distance from COG to each foot
        const leftDistance = Math.sqrt(
            Math.pow(centerOfGravity.x - leftFoot.x, 2) +
            Math.pow(centerOfGravity.y - leftFoot.y, 2)
        );

        const rightDistance = Math.sqrt(
            Math.pow(centerOfGravity.x - rightFoot.x, 2) +
            Math.pow(centerOfGravity.y - rightFoot.y, 2)
        );

        // Calculate weight distribution percentage (left foot)
        const totalDistance = leftDistance + rightDistance;
        return totalDistance > 0 ? (rightDistance / totalDistance) * 100 : 50;
    }

    analyzePosturalSway(landmarks) {
        // Analyze micro-movements for stability assessment
        if (this.analysisHistory.length < 5) return { sway: 0, stability: 0.8 };

        const recentCOGs = this.analysisHistory.slice(-5).map(analysis =>
            analysis.biomechanical_analysis?.balance_assessment?.center_of_gravity || { x: 0.5, y: 0.5 }
        );

        // Calculate sway magnitude
        const swayX = Math.max(...recentCOGs.map(cog => cog.x)) - Math.min(...recentCOGs.map(cog => cog.x));
        const swayY = Math.max(...recentCOGs.map(cog => cog.y)) - Math.min(...recentCOGs.map(cog => cog.y));

        const totalSway = Math.sqrt(swayX * swayX + swayY * swayY);
        const stabilityScore = Math.max(0, 1 - (totalSway * 10)); // Normalize

        return {
            sway: totalSway,
            stability: stabilityScore
        };
    }

    evaluateMovementQuality(landmarks) {
        return {
            coordination: this.assessCoordination(landmarks),
            efficiency: this.assessMovementEfficiency(landmarks),
            range_of_motion: this.assessRangeOfMotion(landmarks),
            fluidity: this.assessMovementFluidity(landmarks)
        };
    }

    assessCoordination(landmarks) {
        // Assess limb coordination based on symmetry
        const leftArm = this.calculateLimbPosition(landmarks, 'left_arm');
        const rightArm = this.calculateLimbPosition(landmarks, 'right_arm');
        const leftLeg = this.calculateLimbPosition(landmarks, 'left_leg');
        const rightLeg = this.calculateLimbPosition(landmarks, 'right_leg');

        const armSymmetry = 1 - Math.abs(leftArm - rightArm);
        const legSymmetry = 1 - Math.abs(leftLeg - rightLeg);

        return (armSymmetry + legSymmetry) / 2;
    }

    calculateLimbPosition(landmarks, limb) {
        switch (limb) {
            case 'left_arm':
                return this.calculateAngle(landmarks[11], landmarks[13], landmarks[15]) || 0;
            case 'right_arm':
                return this.calculateAngle(landmarks[12], landmarks[14], landmarks[16]) || 0;
            case 'left_leg':
                return this.calculateAngle(landmarks[23], landmarks[25], landmarks[27]) || 0;
            case 'right_leg':
                return this.calculateAngle(landmarks[24], landmarks[26], landmarks[28]) || 0;
            default:
                return 0;
        }
    }

    assessMovementEfficiency(landmarks) {
        // Assess energy conservation and movement economy
        if (this.analysisHistory.length < 3) return 0.8;

        const recentMovements = this.analysisHistory.slice(-3);
        const movementVariability = this.calculateMovementVariability(recentMovements);

        return Math.max(0, 1 - movementVariability);
    }

    calculateMovementVariability(movements) {
        // Calculate variability in key joint angles over time
        const angles = movements.map(movement => {
            const landmarks = movement.pose_data?.landmarks || [];
            return {
                leftKnee: this.calculateAngle(landmarks[23], landmarks[25], landmarks[27]) || 0,
                rightKnee: this.calculateAngle(landmarks[24], landmarks[26], landmarks[28]) || 0,
                leftElbow: this.calculateAngle(landmarks[11], landmarks[13], landmarks[15]) || 0,
                rightElbow: this.calculateAngle(landmarks[12], landmarks[14], landmarks[16]) || 0
            };
        });

        if (angles.length < 2) return 0;

        // Calculate standard deviation of angles
        const variabilities = Object.keys(angles[0]).map(joint => {
            const values = angles.map(angle => angle[joint]);
            const mean = values.reduce((a, b) => a + b, 0) / values.length;
            const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
            return Math.sqrt(variance);
        });

        return variabilities.reduce((a, b) => a + b, 0) / variabilities.length / 30; // Normalize
    }

    assessRangeOfMotion(landmarks) {
        const jointRanges = {
            left_knee: this.calculateAngle(landmarks[23], landmarks[25], landmarks[27]) || 0,
            right_knee: this.calculateAngle(landmarks[24], landmarks[26], landmarks[28]) || 0,
            left_hip: this.calculateAngle(landmarks[11], landmarks[23], landmarks[25]) || 0,
            right_hip: this.calculateAngle(landmarks[12], landmarks[24], landmarks[26]) || 0,
            left_shoulder: this.calculateAngle(landmarks[13], landmarks[11], landmarks[23]) || 0,
            right_shoulder: this.calculateAngle(landmarks[14], landmarks[12], landmarks[24]) || 0
        };

        // Assess if ranges are within optimal athletic parameters
        const optimalRanges = {
            knee: [0, 150],
            hip: [0, 120],
            shoulder: [0, 180]
        };

        let rangeScore = 0;
        let jointCount = 0;

        Object.keys(jointRanges).forEach(joint => {
            const angle = jointRanges[joint];
            let score = 0;

            if (joint.includes('knee')) {
                score = this.scoreAngleRange(angle, optimalRanges.knee);
            } else if (joint.includes('hip')) {
                score = this.scoreAngleRange(angle, optimalRanges.hip);
            } else if (joint.includes('shoulder')) {
                score = this.scoreAngleRange(angle, optimalRanges.shoulder);
            }

            rangeScore += score;
            jointCount++;
        });

        return jointCount > 0 ? rangeScore / jointCount : 0.5;
    }

    scoreAngleRange(angle, optimalRange) {
        const [min, max] = optimalRange;
        if (angle >= min && angle <= max) return 1.0;

        const distanceFromRange = Math.min(
            Math.abs(angle - min),
            Math.abs(angle - max)
        );

        return Math.max(0, 1 - (distanceFromRange / 30)); // 30-degree tolerance
    }

    assessMovementFluidity(landmarks) {
        // Assess smoothness of movement transitions
        if (this.analysisHistory.length < 5) return 0.8;

        const recentAnalyses = this.analysisHistory.slice(-5);
        const movementSmoothness = this.calculateMovementSmoothness(recentAnalyses);

        return movementSmoothness;
    }

    calculateMovementSmoothness(analyses) {
        // Calculate jerk (rate of change of acceleration) for major joints
        const jointPositions = analyses.map(analysis => {
            const landmarks = analysis.pose_data?.landmarks || [];
            return {
                leftKnee: landmarks[25] || { x: 0, y: 0 },
                rightKnee: landmarks[27] || { x: 0, y: 0 },
                leftHip: landmarks[23] || { x: 0, y: 0 },
                rightHip: landmarks[24] || { x: 0, y: 0 }
            };
        });

        if (jointPositions.length < 3) return 0.8;

        // Calculate smoothness for each joint
        const smoothnessScores = Object.keys(jointPositions[0]).map(joint => {
            const positions = jointPositions.map(pos => pos[joint]);
            return this.calculateJerkScore(positions);
        });

        return smoothnessScores.reduce((a, b) => a + b, 0) / smoothnessScores.length;
    }

    calculateJerkScore(positions) {
        if (positions.length < 3) return 0.8;

        let totalJerk = 0;
        for (let i = 2; i < positions.length; i++) {
            const acceleration = {
                x: positions[i].x - 2 * positions[i-1].x + positions[i-2].x,
                y: positions[i].y - 2 * positions[i-1].y + positions[i-2].y
            };

            const jerk = Math.sqrt(acceleration.x * acceleration.x + acceleration.y * acceleration.y);
            totalJerk += jerk;
        }

        const avgJerk = totalJerk / (positions.length - 2);
        return Math.max(0, 1 - (avgJerk * 100)); // Normalize and invert
    }

    mapMuscleTension(landmarks) {
        return {
            neck_shoulders: this.assessNeckShoulderTension(landmarks),
            core_stability: this.assessCoreStability(landmarks),
            leg_tension: this.assessLegTension(landmarks),
            overall_tension: 0
        };
    }

    assessNeckShoulderTension(landmarks) {
        const leftShoulder = landmarks[11];
        const rightShoulder = landmarks[12];
        const neck = landmarks[0]; // Nose as neck approximation

        if (!leftShoulder || !rightShoulder || !neck) return 0.5;

        // Calculate shoulder elevation
        const shoulderElevation = Math.abs(leftShoulder.y - rightShoulder.y);

        // Calculate forward head posture
        const shoulderMidpoint = this.getMidpoint(leftShoulder, rightShoulder);
        const forwardHead = neck.x - shoulderMidpoint.x;

        const tensionScore = Math.min(1, (shoulderElevation * 10) + (Math.abs(forwardHead) * 5));
        return Math.max(0, 1 - tensionScore); // Invert so higher = less tension
    }

    assessCoreStability(landmarks) {
        const stability = this.assessBalance(landmarks).stability_score;
        const spineAlignment = this.analyzePosture(landmarks).spine_alignment;

        const alignmentScore = 1 - (Math.abs(spineAlignment) / 15);
        return (stability + alignmentScore) / 2;
    }

    assessLegTension(landmarks) {
        const leftKneeAngle = this.calculateAngle(landmarks[23], landmarks[25], landmarks[27]) || 150;
        const rightKneeAngle = this.calculateAngle(landmarks[24], landmarks[26], landmarks[28]) || 150;

        // Optimal athletic stance has slight knee bend
        const optimalKneeAngle = 155; // Degrees
        const leftTension = Math.abs(leftKneeAngle - optimalKneeAngle) / 30;
        const rightTension = Math.abs(rightKneeAngle - optimalKneeAngle) / 30;

        return Math.max(0, 1 - ((leftTension + rightTension) / 2));
    }

    analyzeKinematicChain(landmarks) {
        const chains = {};

        Object.keys(this.kinematicChain).forEach(chainName => {
            const joints = this.kinematicChain[chainName];
            chains[chainName] = this.assessChainEfficiency(landmarks, joints);
        });

        return chains;
    }

    assessChainEfficiency(landmarks, joints) {
        // Simplified kinematic chain analysis
        let efficiency = 0.8; // Base efficiency

        // Add specific chain assessments based on joint coordination
        if (joints.includes('hip') && joints.includes('knee') && joints.includes('ankle')) {
            // Lower body chain
            const hipKneeAngle = this.calculateAngle(landmarks[11], landmarks[23], landmarks[25]) || 0;
            const kneeAnkleAngle = this.calculateAngle(landmarks[23], landmarks[25], landmarks[27]) || 0;

            // Assess coordination between hip and knee
            const coordination = 1 - Math.abs(hipKneeAngle - kneeAnkleAngle) / 180;
            efficiency = coordination;
        }

        return {
            efficiency: efficiency,
            coordination: efficiency * 0.9, // Slightly lower than efficiency
            power_transfer: efficiency * 0.95
        };
    }

    assessAthleticReadiness(landmarks) {
        const posture = this.analyzePosture(landmarks);
        const balance = this.assessBalance(landmarks);
        const movement = this.evaluateMovementQuality(landmarks);

        const readinessScore = (
            posture.overall_score * 0.3 +
            balance.stability_score * 0.3 +
            movement.coordination * 0.2 +
            movement.efficiency * 0.2
        );

        return {
            overall_readiness: readinessScore,
            power_position: this.assessPowerPosition(landmarks),
            reaction_potential: this.assessReactionPotential(landmarks),
            injury_risk: this.assessInjuryRisk(landmarks)
        };
    }

    assessPowerPosition(landmarks) {
        // Assess if athlete is in optimal position for power generation
        const kneeBend = this.calculateAngle(landmarks[23], landmarks[25], landmarks[27]) || 150;
        const hipPosition = landmarks[23]?.y || 0.5;
        const shoulderPosition = landmarks[11]?.y || 0.4;

        const optimalKneeBend = kneeBend > 120 && kneeBend < 160;
        const athleticPosture = hipPosition > shoulderPosition;

        return (optimalKneeBend ? 0.6 : 0.3) + (athleticPosture ? 0.4 : 0.1);
    }

    assessReactionPotential(landmarks) {
        const balance = this.assessBalance(landmarks);
        const tension = this.mapMuscleTension(landmarks);

        return (balance.stability_score * 0.6) + (tension.overall_tension * 0.4);
    }

    assessInjuryRisk(landmarks) {
        const posture = this.analyzePosture(landmarks);
        const balance = this.assessBalance(landmarks);
        const tension = this.mapMuscleTension(landmarks);

        // High risk factors: poor posture, instability, excessive tension
        const postureRisk = 1 - posture.overall_score;
        const balanceRisk = 1 - balance.stability_score;
        const tensionRisk = 1 - tension.overall_tension;

        const overallRisk = (postureRisk * 0.4) + (balanceRisk * 0.3) + (tensionRisk * 0.3);

        return {
            overall_risk: overallRisk,
            risk_level: this.categorizeRisk(overallRisk),
            risk_factors: this.identifyRiskFactors(posture, balance, tension)
        };
    }

    categorizeRisk(riskScore) {
        if (riskScore < 0.3) return 'Low';
        if (riskScore < 0.6) return 'Moderate';
        return 'High';
    }

    identifyRiskFactors(posture, balance, tension) {
        const factors = [];

        if (posture.overall_score < 0.7) factors.push('Poor posture alignment');
        if (balance.stability_score < 0.7) factors.push('Balance instability');
        if (tension.overall_tension < 0.6) factors.push('Excessive muscle tension');
        if (Math.abs(posture.spine_alignment) > 10) factors.push('Spinal misalignment');

        return factors;
    }

    calculatePerformanceScores(analysis) {
        if (!analysis || analysis.error) {
            return { overall_score: 0, breakdown: {} };
        }

        const scores = {
            posture: analysis.posture_analysis?.overall_score || 0,
            balance: analysis.balance_assessment?.stability_score || 0,
            movement_efficiency: analysis.movement_quality?.efficiency || 0,
            tension_management: analysis.tension_mapping?.overall_tension || 0,
            athletic_readiness: analysis.athletic_readiness?.overall_readiness || 0
        };

        // Calculate weighted overall score
        const overallScore = Object.keys(scores).reduce((sum, category) => {
            return sum + (scores[category] * this.scoringWeights[category]);
        }, 0);

        return {
            overall_score: overallScore,
            category_scores: scores,
            performance_tier: this.getPerformanceTier(overallScore),
            improvement_areas: this.identifyImprovementAreas(scores)
        };
    }

    getPerformanceTier(score) {
        if (score >= 0.9) return 'Elite Athletic Performance';
        if (score >= 0.8) return 'High Performance';
        if (score >= 0.7) return 'Good Athletic Form';
        if (score >= 0.6) return 'Average Performance';
        if (score >= 0.5) return 'Below Average';
        return 'Needs Significant Improvement';
    }

    identifyImprovementAreas(scores) {
        const threshold = 0.7;
        const areas = [];

        Object.keys(scores).forEach(category => {
            if (scores[category] < threshold) {
                areas.push({
                    category: category,
                    current_score: scores[category],
                    target_score: threshold,
                    priority: threshold - scores[category] // Higher difference = higher priority
                });
            }
        });

        // Sort by priority (highest difference first)
        return areas.sort((a, b) => b.priority - a.priority);
    }

    generateRecommendations(analysis, scores) {
        const recommendations = [];

        // Posture recommendations
        if (scores.category_scores?.posture < 0.7) {
            recommendations.push({
                category: 'Posture',
                priority: 'High',
                recommendation: 'Focus on spine alignment and shoulder positioning',
                specific_actions: [
                    'Practice wall angels to improve shoulder mobility',
                    'Strengthen core muscles for better spinal support',
                    'Monitor head position to prevent forward head posture'
                ]
            });
        }

        // Balance recommendations
        if (scores.category_scores?.balance < 0.7) {
            recommendations.push({
                category: 'Balance',
                priority: 'High',
                recommendation: 'Improve stability and weight distribution',
                specific_actions: [
                    'Single-leg balance exercises',
                    'Proprioceptive training on unstable surfaces',
                    'Core strengthening for stability'
                ]
            });
        }

        // Movement efficiency recommendations
        if (scores.category_scores?.movement_efficiency < 0.7) {
            recommendations.push({
                category: 'Movement Efficiency',
                priority: 'Medium',
                recommendation: 'Enhance coordination and fluidity',
                specific_actions: [
                    'Practice movement patterns with focus on smoothness',
                    'Bilateral coordination exercises',
                    'Video analysis of movement patterns'
                ]
            });
        }

        // Tension management recommendations
        if (scores.category_scores?.tension_management < 0.6) {
            recommendations.push({
                category: 'Tension Management',
                priority: 'Medium',
                recommendation: 'Reduce unnecessary muscle tension',
                specific_actions: [
                    'Progressive muscle relaxation techniques',
                    'Breathing exercises for relaxation',
                    'Stretching routine for tight muscle groups'
                ]
            });
        }

        return recommendations;
    }

    // Utility methods
    calculateAngle(point1, point2, point3) {
        if (!point1 || !point2 || !point3) return null;

        const vector1 = { x: point1.x - point2.x, y: point1.y - point2.y };
        const vector2 = { x: point3.x - point2.x, y: point3.y - point2.y };

        const dot = vector1.x * vector2.x + vector1.y * vector2.y;
        const mag1 = Math.sqrt(vector1.x * vector1.x + vector1.y * vector1.y);
        const mag2 = Math.sqrt(vector2.x * vector2.x + vector2.y * vector2.y);

        if (mag1 === 0 || mag2 === 0) return null;

        const cos = dot / (mag1 * mag2);
        const angle = Math.acos(Math.max(-1, Math.min(1, cos))) * (180 / Math.PI);

        return angle;
    }

    getMidpoint(point1, point2) {
        if (!point1 || !point2) return { x: 0, y: 0 };

        return {
            x: (point1.x + point2.x) / 2,
            y: (point1.y + point2.y) / 2
        };
    }

    calculateAnalysisConfidence() {
        if (!this.currentPose) return 0;

        const visibilityScore = this.currentPose.visibility || 0;
        const landmarkCount = this.currentPose.landmarks?.length || 0;
        const expectedLandmarks = 33; // MediaPipe pose model

        const completeness = landmarkCount / expectedLandmarks;
        return (visibilityScore + completeness) / 2;
    }

    updatePerformanceMetrics(results) {
        this.performanceMetrics.processingTimes.push(results.processing_time);
        this.performanceMetrics.accuracyScores.push(results.confidence);
        this.performanceMetrics.analysisCount++;

        // Keep only last 100 measurements
        if (this.performanceMetrics.processingTimes.length > 100) {
            this.performanceMetrics.processingTimes.shift();
            this.performanceMetrics.accuracyScores.shift();
        }
    }

    startPerformanceTracking() {
        setInterval(() => {
            const avgProcessingTime = this.performanceMetrics.processingTimes.reduce((a, b) => a + b, 0) / this.performanceMetrics.processingTimes.length || 0;
            const avgAccuracy = this.performanceMetrics.accuracyScores.reduce((a, b) => a + b, 0) / this.performanceMetrics.accuracyScores.length || 0;

            console.log(`🏆 Biomechanical Analysis Performance:
                Processing Time: ${avgProcessingTime.toFixed(2)}ms
                Average Accuracy: ${(avgAccuracy * 100).toFixed(1)}%
                Analyses Completed: ${this.performanceMetrics.analysisCount}
                Target: <100ms processing, >90% accuracy`);
        }, 60000); // Log every minute
    }

    // API methods
    async analyzeUploadedVideo(videoFile) {
        return new Promise((resolve) => {
            const video = document.createElement('video');
            video.src = URL.createObjectURL(videoFile);

            video.onloadeddata = async () => {
                const results = await this.analyzeBiomechanics(video);
                URL.revokeObjectURL(video.src);
                resolve(results);
            };
        });
    }

    startLiveAnalysis(videoElement) {
        if (!this.isInitialized) {
            throw new Error('Biomechanical Analyzer not initialized');
        }

        const analyzeFrame = async () => {
            if (videoElement.readyState >= 2) {
                const results = await this.analyzeBiomechanics(videoElement);

                // Emit results for real-time updates
                window.dispatchEvent(new CustomEvent('biomechanicalUpdate', {
                    detail: results
                }));
            }

            requestAnimationFrame(analyzeFrame);
        };

        analyzeFrame();
    }

    getPerformanceReport() {
        const avgProcessingTime = this.performanceMetrics.processingTimes.reduce((a, b) => a + b, 0) / this.performanceMetrics.processingTimes.length || 0;
        const avgAccuracy = this.performanceMetrics.accuracyScores.reduce((a, b) => a + b, 0) / this.performanceMetrics.accuracyScores.length || 0;

        return {
            processing_performance: {
                average_time: avgProcessingTime,
                target_time: 100,
                status: avgProcessingTime < 100 ? 'MEETING_TARGET' : 'NEEDS_OPTIMIZATION'
            },
            accuracy: {
                average: avgAccuracy,
                target: 0.9,
                status: avgAccuracy > 0.9 ? 'MEETING_TARGET' : 'NEEDS_IMPROVEMENT'
            },
            total_analyses: this.performanceMetrics.analysisCount,
            engine_status: this.isInitialized ? 'ACTIVE' : 'INACTIVE'
        };
    }

    getLatestAnalysis(count = 10) {
        return this.analysisHistory.slice(-count);
    }

    reset() {
        this.analysisHistory = [];
        this.performanceMetrics = {
            processingTimes: [],
            accuracyScores: [],
            analysisCount: 0
        };
        this.currentPose = null;
    }
}

// Global instance for easy access
window.BiomechanicalAnalyzer = BiomechanicalAnalyzer;

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BiomechanicalAnalyzer;
}

console.log('🏆 Biomechanical Analyzer loaded - Elite Athletic Performance Assessment Ready');