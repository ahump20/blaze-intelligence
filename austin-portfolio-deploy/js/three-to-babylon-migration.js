/**
 * THREE.JS TO BABYLON.JS MIGRATION HELPER
 * Automated migration tool for existing Three.js code to Babylon.js
 * Maintains backward compatibility while upgrading to ray tracing
 */

class ThreeToBabylonMigration {
    constructor() {
        this.conversionMap = {
            // Geometry conversions
            'THREE.BoxGeometry': 'BABYLON.MeshBuilder.CreateBox',
            'THREE.SphereGeometry': 'BABYLON.MeshBuilder.CreateSphere',
            'THREE.PlaneGeometry': 'BABYLON.MeshBuilder.CreatePlane',
            'THREE.CylinderGeometry': 'BABYLON.MeshBuilder.CreateCylinder',
            'THREE.ConeGeometry': 'BABYLON.MeshBuilder.CreateCylinder',
            'THREE.TorusGeometry': 'BABYLON.MeshBuilder.CreateTorus',

            // Material conversions
            'THREE.MeshBasicMaterial': 'BABYLON.StandardMaterial',
            'THREE.MeshStandardMaterial': 'BABYLON.PBRMaterial',
            'THREE.MeshPhongMaterial': 'BABYLON.StandardMaterial',
            'THREE.MeshLambertMaterial': 'BABYLON.StandardMaterial',
            'THREE.MeshPhysicalMaterial': 'BABYLON.PBRMaterial',

            // Light conversions
            'THREE.DirectionalLight': 'BABYLON.DirectionalLight',
            'THREE.PointLight': 'BABYLON.PointLight',
            'THREE.SpotLight': 'BABYLON.SpotLight',
            'THREE.AmbientLight': 'BABYLON.HemisphericLight',
            'THREE.HemisphereLight': 'BABYLON.HemisphericLight',

            // Camera conversions
            'THREE.PerspectiveCamera': 'BABYLON.UniversalCamera',
            'THREE.OrthographicCamera': 'BABYLON.UniversalCamera',

            // Math conversions
            'THREE.Vector3': 'BABYLON.Vector3',
            'THREE.Vector2': 'BABYLON.Vector2',
            'THREE.Color': 'BABYLON.Color3',
            'THREE.Quaternion': 'BABYLON.Quaternion',
            'THREE.Matrix4': 'BABYLON.Matrix'
        };

        this.methodMap = {
            // Object methods
            'add': 'addChild',
            'remove': 'removeChild',
            'lookAt': 'setTarget',
            'translateX': 'position.x +=',
            'translateY': 'position.y +=',
            'translateZ': 'position.z +=',
            'rotateX': 'rotation.x +=',
            'rotateY': 'rotation.y +=',
            'rotateZ': 'rotation.z +=',

            // Material properties
            'map': 'diffuseTexture',
            'normalMap': 'bumpTexture',
            'roughnessMap': 'metallicTexture',
            'aoMap': 'ambientTexture',
            'emissiveMap': 'emissiveTexture',
            'transparent': 'alpha < 1',
            'opacity': 'alpha',

            // Scene methods
            'render': 'render',
            'dispose': 'dispose',
            'traverse': 'getDescendants'
        };
    }

    /**
     * Migrate Three.js scene to Babylon.js
     */
    migrateScene(threeScene, babylonEngine) {
        const babylonScene = new BABYLON.Scene(babylonEngine);

        // Migrate fog
        if (threeScene.fog) {
            babylonScene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
            babylonScene.fogColor = this.convertColor(threeScene.fog.color);
            babylonScene.fogStart = threeScene.fog.near || 10;
            babylonScene.fogEnd = threeScene.fog.far || 1000;
        }

        // Migrate background
        if (threeScene.background) {
            babylonScene.clearColor = this.convertColor(threeScene.background);
        }

        // Migrate all objects
        threeScene.traverse((object) => {
            if (object.isMesh) {
                this.migrateMesh(object, babylonScene);
            } else if (object.isLight) {
                this.migrateLight(object, babylonScene);
            } else if (object.isCamera) {
                this.migrateCamera(object, babylonScene, babylonEngine);
            }
        });

        return babylonScene;
    }

    /**
     * Migrate Three.js mesh to Babylon.js
     */
    migrateMesh(threeMesh, babylonScene) {
        let babylonMesh = null;

        // Convert geometry
        if (threeMesh.geometry) {
            const params = this.extractGeometryParams(threeMesh.geometry);
            babylonMesh = this.createBabylonMesh(threeMesh.geometry.type, params, babylonScene);
        }

        if (!babylonMesh) return null;

        // Copy transform
        babylonMesh.position = this.convertVector3(threeMesh.position);
        babylonMesh.rotation = this.convertVector3(threeMesh.rotation);
        babylonMesh.scaling = this.convertVector3(threeMesh.scale);

        // Convert material
        if (threeMesh.material) {
            babylonMesh.material = this.migrateMaterial(threeMesh.material, babylonScene);
        }

        // Copy properties
        babylonMesh.name = threeMesh.name || 'mesh_' + threeMesh.id;
        babylonMesh.isVisible = threeMesh.visible;

        // Add ray tracing if supported
        if (babylonScene.enableRayTracing && babylonMesh.material) {
            this.enableRayTracing(babylonMesh.material);
        }

        return babylonMesh;
    }

    /**
     * Extract geometry parameters from Three.js geometry
     */
    extractGeometryParams(geometry) {
        const params = {};

        switch (geometry.type) {
            case 'BoxGeometry':
                params.width = geometry.parameters.width;
                params.height = geometry.parameters.height;
                params.depth = geometry.parameters.depth;
                break;

            case 'SphereGeometry':
                params.diameter = geometry.parameters.radius * 2;
                params.segments = geometry.parameters.widthSegments;
                break;

            case 'PlaneGeometry':
                params.width = geometry.parameters.width;
                params.height = geometry.parameters.height;
                params.subdivisions = geometry.parameters.widthSegments;
                break;

            case 'CylinderGeometry':
                params.height = geometry.parameters.height;
                params.diameterTop = geometry.parameters.radiusTop * 2;
                params.diameterBottom = geometry.parameters.radiusBottom * 2;
                params.tessellation = geometry.parameters.radialSegments;
                break;

            default:
                console.warn(`Geometry type ${geometry.type} not fully supported`);
        }

        return params;
    }

    /**
     * Create Babylon.js mesh from type and parameters
     */
    createBabylonMesh(geometryType, params, scene) {
        switch (geometryType) {
            case 'BoxGeometry':
                return BABYLON.MeshBuilder.CreateBox('box', params, scene);

            case 'SphereGeometry':
                return BABYLON.MeshBuilder.CreateSphere('sphere', params, scene);

            case 'PlaneGeometry':
                return BABYLON.MeshBuilder.CreatePlane('plane', params, scene);

            case 'CylinderGeometry':
                return BABYLON.MeshBuilder.CreateCylinder('cylinder', params, scene);

            default:
                // Fallback to box
                return BABYLON.MeshBuilder.CreateBox('fallback', {size: 1}, scene);
        }
    }

    /**
     * Migrate Three.js material to Babylon.js
     */
    migrateMaterial(threeMaterial, babylonScene) {
        let babylonMaterial;

        // Choose appropriate Babylon material
        if (threeMaterial.type.includes('Physical') || threeMaterial.type.includes('Standard')) {
            // Use PBR for physical materials
            babylonMaterial = new BABYLON.PBRMaterial(threeMaterial.name || 'mat', babylonScene);

            // Convert PBR properties
            if (threeMaterial.color) {
                babylonMaterial.albedoColor = this.convertColor(threeMaterial.color);
            }
            if (threeMaterial.metalness !== undefined) {
                babylonMaterial.metallic = threeMaterial.metalness;
            }
            if (threeMaterial.roughness !== undefined) {
                babylonMaterial.roughness = threeMaterial.roughness;
            }
            if (threeMaterial.emissive) {
                babylonMaterial.emissiveColor = this.convertColor(threeMaterial.emissive);
            }

            // Enable ray tracing for PBR
            this.enableRayTracing(babylonMaterial);

        } else {
            // Use Standard material for basic materials
            babylonMaterial = new BABYLON.StandardMaterial(threeMaterial.name || 'mat', babylonScene);

            if (threeMaterial.color) {
                babylonMaterial.diffuseColor = this.convertColor(threeMaterial.color);
            }
            if (threeMaterial.emissive) {
                babylonMaterial.emissiveColor = this.convertColor(threeMaterial.emissive);
            }
            if (threeMaterial.specular) {
                babylonMaterial.specularColor = this.convertColor(threeMaterial.specular);
            }
        }

        // Common properties
        if (threeMaterial.opacity !== undefined) {
            babylonMaterial.alpha = threeMaterial.opacity;
        }
        if (threeMaterial.transparent) {
            babylonMaterial.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;
        }
        if (threeMaterial.side === THREE.DoubleSide) {
            babylonMaterial.backFaceCulling = false;
        }
        if (threeMaterial.wireframe) {
            babylonMaterial.wireframe = true;
        }

        // Convert textures
        if (threeMaterial.map) {
            babylonMaterial.diffuseTexture = this.convertTexture(threeMaterial.map, babylonScene);
        }
        if (threeMaterial.normalMap) {
            babylonMaterial.bumpTexture = this.convertTexture(threeMaterial.normalMap, babylonScene);
        }

        return babylonMaterial;
    }

    /**
     * Enable ray tracing features for material
     */
    enableRayTracing(material) {
        if (material instanceof BABYLON.PBRMaterial) {
            material.enableRayTracedReflections = true;
            material.enableRayTracedRefractions = true;
            material.enableRayTracedEmissive = true;

            // Enhance for ray tracing
            material.clearCoat = material.clearCoat || 0.1;
            material.clearCoatRoughness = 0.05;
        }
    }

    /**
     * Migrate Three.js light to Babylon.js
     */
    migrateLight(threeLight, babylonScene) {
        let babylonLight;

        switch (threeLight.type) {
            case 'DirectionalLight':
                babylonLight = new BABYLON.DirectionalLight(
                    threeLight.name || 'dirLight',
                    this.convertVector3(threeLight.position.clone().normalize().negate()),
                    babylonScene
                );
                break;

            case 'PointLight':
                babylonLight = new BABYLON.PointLight(
                    threeLight.name || 'pointLight',
                    this.convertVector3(threeLight.position),
                    babylonScene
                );
                break;

            case 'SpotLight':
                babylonLight = new BABYLON.SpotLight(
                    threeLight.name || 'spotLight',
                    this.convertVector3(threeLight.position),
                    this.convertVector3(threeLight.target.position.clone().sub(threeLight.position)),
                    threeLight.angle || Math.PI / 3,
                    threeLight.penumbra || 0.1,
                    babylonScene
                );
                break;

            case 'AmbientLight':
            case 'HemisphereLight':
                babylonLight = new BABYLON.HemisphericLight(
                    threeLight.name || 'hemiLight',
                    new BABYLON.Vector3(0, 1, 0),
                    babylonScene
                );
                break;

            default:
                console.warn(`Light type ${threeLight.type} not supported`);
                return null;
        }

        if (babylonLight) {
            // Convert color and intensity
            if (threeLight.color) {
                babylonLight.diffuse = this.convertColor(threeLight.color);
            }
            if (threeLight.intensity !== undefined) {
                babylonLight.intensity = threeLight.intensity;
            }

            // Enable shadows if the light casts them
            if (threeLight.castShadow) {
                const shadowGenerator = new BABYLON.ShadowGenerator(2048, babylonLight);
                shadowGenerator.usePercentageCloserFiltering = true;

                // Add ray-traced shadows if available
                if (babylonScene.enableRayTracing) {
                    shadowGenerator.useRayTracedShadows = true;
                }
            }
        }

        return babylonLight;
    }

    /**
     * Migrate Three.js camera to Babylon.js
     */
    migrateCamera(threeCamera, babylonScene, babylonEngine) {
        const babylonCamera = new BABYLON.UniversalCamera(
            threeCamera.name || 'camera',
            this.convertVector3(threeCamera.position),
            babylonScene
        );

        // Set target based on Three.js camera direction
        const direction = new THREE.Vector3(0, 0, -1);
        direction.applyQuaternion(threeCamera.quaternion);
        const target = threeCamera.position.clone().add(direction);

        babylonCamera.setTarget(this.convertVector3(target));

        // Convert FOV for perspective cameras
        if (threeCamera.isPerspectiveCamera) {
            babylonCamera.fov = threeCamera.fov * Math.PI / 180;
        }

        // Set as active camera
        babylonScene.activeCamera = babylonCamera;
        babylonCamera.attachControl(babylonEngine.getRenderingCanvas(), true);

        return babylonCamera;
    }

    /**
     * Convert Three.js Vector3 to Babylon.js Vector3
     */
    convertVector3(threeVector) {
        if (!threeVector) return new BABYLON.Vector3(0, 0, 0);
        return new BABYLON.Vector3(threeVector.x, threeVector.y, threeVector.z);
    }

    /**
     * Convert Three.js Color to Babylon.js Color3
     */
    convertColor(threeColor) {
        if (!threeColor) return new BABYLON.Color3(1, 1, 1);
        return new BABYLON.Color3(threeColor.r, threeColor.g, threeColor.b);
    }

    /**
     * Convert Three.js Texture to Babylon.js Texture
     */
    convertTexture(threeTexture, babylonScene) {
        if (!threeTexture || !threeTexture.image) return null;

        // Create texture from image source
        const babylonTexture = new BABYLON.Texture(
            threeTexture.image.src || threeTexture.image,
            babylonScene
        );

        // Convert wrap modes
        if (threeTexture.wrapS === THREE.RepeatWrapping) {
            babylonTexture.wrapU = BABYLON.Texture.WRAP_ADDRESSMODE;
        } else if (threeTexture.wrapS === THREE.ClampToEdgeWrapping) {
            babylonTexture.wrapU = BABYLON.Texture.CLAMP_ADDRESSMODE;
        }

        if (threeTexture.wrapT === THREE.RepeatWrapping) {
            babylonTexture.wrapV = BABYLON.Texture.WRAP_ADDRESSMODE;
        } else if (threeTexture.wrapT === THREE.ClampToEdgeWrapping) {
            babylonTexture.wrapV = BABYLON.Texture.CLAMP_ADDRESSMODE;
        }

        // Convert repeat
        if (threeTexture.repeat) {
            babylonTexture.uScale = threeTexture.repeat.x;
            babylonTexture.vScale = threeTexture.repeat.y;
        }

        return babylonTexture;
    }

    /**
     * Migrate Three.js animation to Babylon.js
     */
    migrateAnimation(threeAnimation, babylonMesh) {
        const animationPosition = new BABYLON.Animation(
            threeAnimation.name || 'animation',
            'position',
            30,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        );

        const keys = [];
        // Convert Three.js keyframes to Babylon.js keys
        // This would need to parse the specific animation format

        animationPosition.setKeys(keys);
        babylonMesh.animations.push(animationPosition);

        return animationPosition;
    }

    /**
     * Create compatibility wrapper for Three.js code
     */
    createCompatibilityWrapper(babylonScene, babylonEngine) {
        // Create a wrapper that mimics Three.js API
        const wrapper = {
            scene: babylonScene,
            renderer: {
                render: () => babylonScene.render(),
                setSize: (width, height) => babylonEngine.resize(),
                domElement: babylonEngine.getRenderingCanvas()
            },
            camera: babylonScene.activeCamera,

            // Helper methods
            add: (object) => {
                // Convert and add to Babylon scene
                if (object.isMesh) {
                    return this.migrateMesh(object, babylonScene);
                } else if (object.isLight) {
                    return this.migrateLight(object, babylonScene);
                }
            },

            remove: (object) => {
                // Find and dispose Babylon mesh
                const babylonMesh = babylonScene.getMeshByName(object.name);
                if (babylonMesh) {
                    babylonMesh.dispose();
                }
            },

            // Animation loop
            animate: (callback) => {
                babylonEngine.runRenderLoop(() => {
                    callback();
                    babylonScene.render();
                });
            }
        };

        return wrapper;
    }

    /**
     * Automated migration with code analysis
     */
    async analyzeAndMigrate(threeJsCode) {
        const report = {
            convertible: [],
            requiresManual: [],
            unsupported: [],
            suggestions: []
        };

        // Parse the code to find Three.js usage
        const threeUsages = this.findThreeJsUsages(threeJsCode);

        threeUsages.forEach(usage => {
            if (this.conversionMap[usage.type]) {
                report.convertible.push({
                    original: usage.type,
                    replacement: this.conversionMap[usage.type],
                    line: usage.line
                });
            } else if (usage.type.startsWith('THREE.')) {
                report.requiresManual.push({
                    type: usage.type,
                    line: usage.line,
                    suggestion: this.getSuggestion(usage.type)
                });
            }
        });

        // Generate migration code
        const migrationCode = this.generateMigrationCode(report);

        return {
            report,
            migrationCode,
            canAutoMigrate: report.requiresManual.length === 0
        };
    }

    /**
     * Find Three.js usages in code
     */
    findThreeJsUsages(code) {
        const usages = [];
        const lines = code.split('\n');

        lines.forEach((line, index) => {
            // Find THREE.* references
            const matches = line.matchAll(/THREE\.(\w+)/g);
            for (const match of matches) {
                usages.push({
                    type: `THREE.${match[1]}`,
                    line: index + 1,
                    fullLine: line.trim()
                });
            }
        });

        return usages;
    }

    /**
     * Get suggestion for unsupported features
     */
    getSuggestion(threeType) {
        const suggestions = {
            'THREE.BufferGeometry': 'Use BABYLON.Mesh with vertex data',
            'THREE.ShaderMaterial': 'Use BABYLON.ShaderMaterial or Node Material',
            'THREE.Raycaster': 'Use BABYLON.Ray for picking',
            'THREE.OrbitControls': 'Use BABYLON.ArcRotateCamera',
            'THREE.GLTFLoader': 'Use BABYLON.SceneLoader.LoadAssetContainer',
            'THREE.TextGeometry': 'Use BABYLON.MeshBuilder.CreateText or GUI',
            'THREE.ParticleSystem': 'Use BABYLON.ParticleSystem',
            'THREE.SkinnedMesh': 'Use BABYLON.Mesh with skeleton'
        };

        return suggestions[threeType] || 'Manual conversion required';
    }

    /**
     * Generate migration code
     */
    generateMigrationCode(report) {
        let code = `// Auto-generated Babylon.js migration code\n\n`;

        // Add imports
        code += `// Import Babylon.js\n`;
        code += `import * as BABYLON from '@babylonjs/core';\n\n`;

        // Add conversion functions
        code += `// Initialize Babylon.js engine\n`;
        code += `const canvas = document.getElementById('renderCanvas');\n`;
        code += `const engine = new BABYLON.Engine(canvas, true);\n`;
        code += `const scene = new BABYLON.Scene(engine);\n\n`;

        // Add ray tracing if available
        code += `// Enable ray tracing if WebGPU is available\n`;
        code += `if (BABYLON.WebGPUEngine.IsSupportedAsync) {\n`;
        code += `    scene.enableRayTracing = true;\n`;
        code += `}\n\n`;

        // Add conversions
        report.convertible.forEach(item => {
            code += `// Replace ${item.original} with ${item.replacement}\n`;
        });

        return code;
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThreeToBabylonMigration;
}

// Global instance for browser use
if (typeof window !== 'undefined') {
    window.ThreeToBabylonMigration = ThreeToBabylonMigration;
}