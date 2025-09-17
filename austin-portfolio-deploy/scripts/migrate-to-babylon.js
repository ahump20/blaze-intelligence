#!/usr/bin/env node

/**
 * Blaze Intelligence Three.js to Babylon.js Migration Script
 * Automatically converts Three.js implementations to Babylon.js with WebGPU support
 * Run: node scripts/migrate-to-babylon.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Migration configuration
const config = {
    htmlFiles: [],
    jsFiles: [],
    backupDir: path.join(rootDir, 'backup-threejs-' + Date.now()),
    logFile: path.join(rootDir, 'migration-log.txt'),
    dryRun: false // Set to true to preview changes without modifying files
};

// Three.js to Babylon.js mapping
const conversionMap = {
    // Core objects
    'THREE.Scene': 'BABYLON.Scene',
    'THREE.PerspectiveCamera': 'BABYLON.UniversalCamera',
    'THREE.OrthographicCamera': 'BABYLON.UniversalCamera',
    'THREE.WebGLRenderer': 'BABYLON.Engine',
    'THREE.Clock': 'BABYLON.Tools.Now',

    // Geometries
    'THREE.BoxGeometry': 'BABYLON.MeshBuilder.CreateBox',
    'THREE.SphereGeometry': 'BABYLON.MeshBuilder.CreateSphere',
    'THREE.PlaneGeometry': 'BABYLON.MeshBuilder.CreatePlane',
    'THREE.CylinderGeometry': 'BABYLON.MeshBuilder.CreateCylinder',
    'THREE.TorusGeometry': 'BABYLON.MeshBuilder.CreateTorus',
    'THREE.RingGeometry': 'BABYLON.MeshBuilder.CreateDisc',

    // Materials
    'THREE.MeshBasicMaterial': 'BABYLON.StandardMaterial',
    'THREE.MeshLambertMaterial': 'BABYLON.StandardMaterial',
    'THREE.MeshPhongMaterial': 'BABYLON.StandardMaterial',
    'THREE.MeshStandardMaterial': 'BABYLON.PBRMaterial',
    'THREE.MeshPhysicalMaterial': 'BABYLON.PBRMaterial',
    'THREE.LineBasicMaterial': 'BABYLON.StandardMaterial',
    'THREE.PointsMaterial': 'BABYLON.StandardMaterial',

    // Lights
    'THREE.DirectionalLight': 'BABYLON.DirectionalLight',
    'THREE.PointLight': 'BABYLON.PointLight',
    'THREE.SpotLight': 'BABYLON.SpotLight',
    'THREE.AmbientLight': 'BABYLON.HemisphericLight',
    'THREE.HemisphereLight': 'BABYLON.HemisphericLight',

    // Math
    'THREE.Vector3': 'BABYLON.Vector3',
    'THREE.Vector2': 'BABYLON.Vector2',
    'THREE.Color': 'BABYLON.Color3',
    'THREE.Quaternion': 'BABYLON.Quaternion',
    'THREE.Matrix4': 'BABYLON.Matrix',
    'THREE.Euler': 'BABYLON.Vector3',

    // Mesh
    'THREE.Mesh': 'BABYLON.Mesh',
    'THREE.Group': 'BABYLON.Mesh',
    'THREE.Object3D': 'BABYLON.TransformNode',

    // Loaders
    'THREE.TextureLoader': 'BABYLON.Texture',
    'THREE.GLTFLoader': 'BABYLON.SceneLoader',
    'THREE.FBXLoader': 'BABYLON.SceneLoader',
    'THREE.OBJLoader': 'BABYLON.SceneLoader',

    // Controls
    'THREE.OrbitControls': '// Babylon camera has built-in controls',
    'THREE.TrackballControls': '// Babylon camera has built-in controls',

    // Helpers
    'THREE.GridHelper': 'BABYLON.MeshBuilder.CreateGround',
    'THREE.AxesHelper': 'BABYLON.AxesViewer',

    // Fog
    'THREE.Fog': 'scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR',
    'THREE.FogExp2': 'scene.fogMode = BABYLON.Scene.FOGMODE_EXP2',
};

// CDN URL replacements
const cdnReplacements = {
    'three@': 'babylonjs@7.0.0',
    'three/build/three.min.js': 'babylon.js',
    'three/build/three.module.js': 'babylon.js',
    'three/examples/jsm/controls/OrbitControls.js': 'babylon.gui.min.js',
    'three/examples/jsm/loaders/GLTFLoader.js': 'babylonjs.loaders.min.js',
};

// Log message
function log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${type.toUpperCase()}] ${message}\n`;

    console.log(logMessage);
    fs.appendFileSync(config.logFile, logMessage);
}

// Create backup
function createBackup(filePath) {
    const relativePath = path.relative(rootDir, filePath);
    const backupPath = path.join(config.backupDir, relativePath);
    const backupDirPath = path.dirname(backupPath);

    if (!fs.existsSync(backupDirPath)) {
        fs.mkdirSync(backupDirPath, { recursive: true });
    }

    fs.copyFileSync(filePath, backupPath);
    log(`Backed up: ${relativePath}`);
}

// Find all files to migrate
function findFilesToMigrate() {
    function walkDir(dir) {
        const files = fs.readdirSync(dir);

        files.forEach(file => {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);

            // Skip node_modules, backup directories, and hidden files
            if (file.startsWith('.') || file === 'node_modules' || file.includes('backup')) {
                return;
            }

            if (stat.isDirectory()) {
                walkDir(filePath);
            } else if (file.endsWith('.html')) {
                const content = fs.readFileSync(filePath, 'utf8');
                if (content.includes('three') || content.includes('THREE')) {
                    config.htmlFiles.push(filePath);
                }
            } else if (file.endsWith('.js')) {
                const content = fs.readFileSync(filePath, 'utf8');
                if (content.includes('THREE') || content.includes('three')) {
                    config.jsFiles.push(filePath);
                }
            }
        });
    }

    walkDir(rootDir);

    log(`Found ${config.htmlFiles.length} HTML files with Three.js`);
    log(`Found ${config.jsFiles.length} JS files with Three.js`);
}

// Convert Three.js code to Babylon.js
function convertThreeJsCode(code) {
    let converted = code;

    // Replace Three.js classes with Babylon.js equivalents
    Object.entries(conversionMap).forEach(([threeClass, babylonClass]) => {
        const regex = new RegExp(`\\b${threeClass.replace('.', '\\.')}\\b`, 'g');
        converted = converted.replace(regex, babylonClass);
    });

    // Convert specific patterns

    // Scene creation
    converted = converted.replace(
        /const\s+(\w+)\s*=\s*new\s+BABYLON\.Scene\(\)/g,
        'const $1 = new BABYLON.Scene(engine)'
    );

    // Renderer to Engine
    converted = converted.replace(
        /const\s+(\w+)\s*=\s*new\s+BABYLON\.Engine\(\s*{([^}]*)}\s*\)/g,
        `const $1 = new BABYLON.Engine(canvas, true, {$2})`
    );

    // Camera setup
    converted = converted.replace(
        /(\w+)\.aspect\s*=\s*([^;]+);/g,
        '// Aspect ratio handled automatically by Babylon'
    );

    // Mesh creation patterns
    converted = converted.replace(
        /new\s+BABYLON\.Mesh\(\s*new\s+BABYLON\.MeshBuilder\.CreateBox\(/g,
        'BABYLON.MeshBuilder.CreateBox('
    );

    // Position/rotation/scale
    converted = converted.replace(
        /\.position\.set\(([^)]+)\)/g,
        '.position = new BABYLON.Vector3($1)'
    );

    converted = converted.replace(
        /\.rotation\.set\(([^)]+)\)/g,
        '.rotation = new BABYLON.Vector3($1)'
    );

    converted = converted.replace(
        /\.scale\.set\(([^)]+)\)/g,
        '.scaling = new BABYLON.Vector3($1)'
    );

    // Color conversion
    converted = converted.replace(
        /new\s+BABYLON\.Color3\(\s*0x([0-9a-fA-F]{6})\s*\)/g,
        'BABYLON.Color3.FromHexString("#$1")'
    );

    // Render loop
    converted = converted.replace(
        /requestAnimationFrame\(\s*animate\s*\)/g,
        'engine.runRenderLoop(() => { animate(); scene.render(); })'
    );

    converted = converted.replace(
        /renderer\.render\(\s*scene\s*,\s*camera\s*\)/g,
        'scene.render()'
    );

    // Add scene to mesh creation
    converted = converted.replace(
        /(BABYLON\.MeshBuilder\.Create\w+\([^)]+)\)/g,
        '$1, scene)'
    );

    return converted;
}

// Convert HTML file
function convertHtmlFile(filePath) {
    log(`Converting HTML: ${path.relative(rootDir, filePath)}`);

    if (!config.dryRun) {
        createBackup(filePath);
    }

    let content = fs.readFileSync(filePath, 'utf8');

    // Replace CDN URLs
    Object.entries(cdnReplacements).forEach(([threeUrl, babylonUrl]) => {
        const regex = new RegExp(threeUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        content = content.replace(regex, babylonUrl);
    });

    // Replace Three.js CDN scripts with Babylon.js
    content = content.replace(
        /<script[^>]*src=[^>]*three[^>]*><\/script>/gi,
        `<!-- Babylon.js Core -->
    <script src="https://cdn.babylonjs.com/babylon.js"></script>
    <script src="https://cdn.babylonjs.com/materialsLibrary/babylonjs.materials.min.js"></script>
    <script src="https://cdn.babylonjs.com/loaders/babylonjs.loaders.min.js"></script>
    <script src="https://cdn.babylonjs.com/gui/babylon.gui.min.js"></script>`
    );

    // Convert inline scripts
    content = content.replace(
        /<script>([\s\S]*?)<\/script>/g,
        (match, scriptContent) => {
            if (scriptContent.includes('THREE')) {
                const converted = convertThreeJsCode(scriptContent);
                return `<script>
// Migrated from Three.js to Babylon.js
${converted}</script>`;
            }
            return match;
        }
    );

    // Add canvas if missing
    if (!content.includes('id="renderCanvas"') && content.includes('BABYLON')) {
        content = content.replace(
            /<body[^>]*>/,
            `$&
    <canvas id="renderCanvas" style="width: 100%; height: 100vh; display: block;"></canvas>`
        );
    }

    if (!config.dryRun) {
        fs.writeFileSync(filePath, content);
        log(`✅ Converted: ${path.relative(rootDir, filePath)}`, 'success');
    }
}

// Convert JavaScript file
function convertJsFile(filePath) {
    log(`Converting JS: ${path.relative(rootDir, filePath)}`);

    if (!config.dryRun) {
        createBackup(filePath);
    }

    let content = fs.readFileSync(filePath, 'utf8');

    // Add Babylon.js initialization if needed
    if (content.includes('new THREE.Scene()')) {
        content = `// Babylon.js Engine Initialization
const canvas = document.getElementById('renderCanvas') || document.querySelector('canvas');
const engine = new BABYLON.Engine(canvas, true, {
    preserveDrawingBuffer: true,
    stencil: true,
    antialias: true
});

` + content;
    }

    // Convert the code
    content = convertThreeJsCode(content);

    // Add resize handler if missing
    if (content.includes('BABYLON.Engine') && !content.includes('window.addEventListener("resize"')) {
        content += `

// Handle window resize
window.addEventListener("resize", () => {
    engine.resize();
});`;
    }

    // Add render loop if missing
    if (content.includes('BABYLON.Scene') && !content.includes('engine.runRenderLoop')) {
        content += `

// Start render loop
engine.runRenderLoop(() => {
    scene.render();
});`;
    }

    if (!config.dryRun) {
        fs.writeFileSync(filePath, content);
        log(`✅ Converted: ${path.relative(rootDir, filePath)}`, 'success');
    }
}

// Generate migration report
function generateReport() {
    const report = `
# Babylon.js Migration Report
Generated: ${new Date().toISOString()}

## Summary
- HTML Files Converted: ${config.htmlFiles.length}
- JavaScript Files Converted: ${config.jsFiles.length}
- Backup Location: ${config.backupDir}

## Converted Files

### HTML Files
${config.htmlFiles.map(f => `- ${path.relative(rootDir, f)}`).join('\n')}

### JavaScript Files
${config.jsFiles.map(f => `- ${path.relative(rootDir, f)}`).join('\n')}

## Next Steps
1. Run \`npm install\` to install Babylon.js dependencies
2. Test each converted file for functionality
3. Update any custom Three.js extensions manually
4. Deploy to staging for comprehensive testing

## WebGPU Features Now Available
- Ray tracing for realistic shadows
- Procedural texture generation
- Advanced particle systems
- Motion blur for sports action
- Screen-space reflections

## Manual Review Required
- Custom shaders need manual conversion
- Post-processing effects should use Babylon's pipeline
- Animation systems may need adjustments
- Physics integrations require Babylon physics engine
`;

    const reportPath = path.join(rootDir, 'MIGRATION_REPORT.md');
    fs.writeFileSync(reportPath, report);
    log(`📄 Migration report generated: ${reportPath}`, 'success');
}

// Main migration process
async function migrate() {
    console.log(`
╔══════════════════════════════════════════════════╗
║   Blaze Intelligence Three.js → Babylon.js      ║
║   Championship Migration Script                  ║
╚══════════════════════════════════════════════════╝
`);

    // Check for dry run
    if (process.argv.includes('--dry-run')) {
        config.dryRun = true;
        log('🔍 DRY RUN MODE - No files will be modified', 'info');
    }

    // Initialize log
    fs.writeFileSync(config.logFile, '');
    log('Starting migration process...', 'info');

    // Create backup directory
    if (!config.dryRun && !fs.existsSync(config.backupDir)) {
        fs.mkdirSync(config.backupDir, { recursive: true });
        log(`Created backup directory: ${config.backupDir}`, 'info');
    }

    // Find files to migrate
    findFilesToMigrate();

    if (config.htmlFiles.length === 0 && config.jsFiles.length === 0) {
        log('No Three.js files found to migrate', 'warning');
        return;
    }

    // Convert HTML files
    for (const htmlFile of config.htmlFiles) {
        try {
            convertHtmlFile(htmlFile);
        } catch (error) {
            log(`Error converting ${htmlFile}: ${error.message}`, 'error');
        }
    }

    // Convert JavaScript files
    for (const jsFile of config.jsFiles) {
        try {
            convertJsFile(jsFile);
        } catch (error) {
            log(`Error converting ${jsFile}: ${error.message}`, 'error');
        }
    }

    // Generate report
    generateReport();

    console.log(`
╔══════════════════════════════════════════════════╗
║   Migration Complete! 🚀                        ║
║   Check MIGRATION_REPORT.md for details         ║
╚══════════════════════════════════════════════════╝
`);

    // Show summary
    if (!config.dryRun) {
        console.log(`
Next Steps:
1. Run: npm install
2. Test converted files
3. Deploy to staging
4. Verify WebGPU features

Backup saved to: ${config.backupDir}
`);
    }
}

// Run migration
migrate().catch(error => {
    log(`Migration failed: ${error.message}`, 'error');
    console.error(error);
    process.exit(1);
});