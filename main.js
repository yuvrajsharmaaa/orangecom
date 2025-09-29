import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

// Setup
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("#bg"),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);
camera.position.setX(-3);

renderer.render(scene, camera);

// Enhanced Forest Lighting System
const pointLight = new THREE.PointLight(0xffffff, 1.2, 100);
pointLight.position.set(5, 8, 5);
pointLight.castShadow = true;

// Main ambient lighting - warmer and brighter for better visibility
const ambientLight = new THREE.AmbientLight(0x505050, 0.8);

// Primary forest directional light (sun filtering through canopy)
const forestSunLight = new THREE.DirectionalLight(0xffeedd, 1.2);
forestSunLight.position.set(15, 20, 10);
forestSunLight.castShadow = true;
forestSunLight.shadow.mapSize.width = 2048;
forestSunLight.shadow.mapSize.height = 2048;

// Secondary forest light from opposite direction for fill
const forestFillLight = new THREE.DirectionalLight(0xe6f3ff, 0.4);
forestFillLight.position.set(-10, 15, -8);

// Subtle green-tinted ambient for forest atmosphere
const forestAmbient = new THREE.AmbientLight(0x2a4a2a, 0.4);

// Ground-level rim lighting for depth
const groundLight = new THREE.DirectionalLight(0x4a6a4a, 0.3);
groundLight.position.set(0, 2, 0);

scene.add(pointLight, ambientLight, forestSunLight, forestFillLight, forestAmbient, groundLight);

// Stars
function addStar() {
  const geometry = new THREE.SphereGeometry(0.25, 24, 24);
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const star = new THREE.Mesh(geometry, material);

  const [x, y, z] = Array(3)
    .fill()
    .map(() => THREE.MathUtils.randFloatSpread(100));

  star.position.set(x, y, z);
  scene.add(star);
}

Array(200).fill().forEach(addStar);

// Background and Atmosphere
const spaceTexture = new THREE.TextureLoader().load("space.jpg");
scene.background = spaceTexture;

// Add atmospheric fog for depth and mystery
scene.fog = new THREE.Fog(0x1a2a3a, 30, 120); // Dark blue-green fog

// Multiple Roaming Fireflies
let fireflies = [];
const loader = new GLTFLoader();
const numberOfFireflies = 6;

function createSingleFirefly(index) {
  const geometry = new THREE.SphereGeometry(0.8 + Math.random() * 0.4, 16, 16);
  
  // Vary the colors slightly for each firefly
  const hue = 0.15 + Math.random() * 0.1; // Yellow to yellow-green
  const color = new THREE.Color().setHSL(hue, 0.8, 0.6);
  const emissiveColor = new THREE.Color().setHSL(hue, 0.9, 0.4);
  
  const material = new THREE.MeshBasicMaterial({
    color: color,
    transparent: true,
    opacity: 0.8 + Math.random() * 0.2,
    emissive: emissiveColor,
    emissiveIntensity: 0.6
  });
  
  const fireflyMesh = new THREE.Mesh(geometry, material);
  
  // Random starting positions
  fireflyMesh.position.set(
    (Math.random() - 0.5) * 40, // x: -20 to 20
    2 + Math.random() * 8,      // y: 2 to 10 (above forest floor)
    (Math.random() - 0.5) * 40  // z: -20 to 20
  );
  
  // Add a glowing halo
  const haloGeometry = new THREE.SphereGeometry(1.5 + Math.random() * 0.5, 12, 12);
  const haloMaterial = new THREE.MeshBasicMaterial({
    color: emissiveColor,
    transparent: true,
    opacity: 0.15,
    side: THREE.BackSide
  });
  const halo = new THREE.Mesh(haloGeometry, haloMaterial);
  fireflyMesh.add(halo);
  
  // Add a point light for glow effect
  const light = new THREE.PointLight(color, 1.5, 15);
  light.position.set(0, 0, 0);
  fireflyMesh.add(light);
  
  // Add roaming properties
  fireflyMesh.userData = {
    basePosition: fireflyMesh.position.clone(),
    roamRadius: 15 + Math.random() * 10,
    speed: 0.0005 + Math.random() * 0.0015,
    offsetX: Math.random() * Math.PI * 2,
    offsetY: Math.random() * Math.PI * 2,
    offsetZ: Math.random() * Math.PI * 2,
    verticalSpeed: 0.001 + Math.random() * 0.002
  };
  
  scene.add(fireflyMesh);
  fireflies.push(fireflyMesh);
  
  return fireflyMesh;
}

function createFallbackFireflies() {
  console.log(`Creating ${numberOfFireflies} fallback glowing fireflies...`);
  
  for (let i = 0; i < numberOfFireflies; i++) {
    createSingleFirefly(i);
  }
  
  console.log(`${numberOfFireflies} fallback fireflies created and roaming!`);
}

console.log("Attempting to load firefly.glb for multiple fireflies...");

loader.load(
  "firefly.glb",
  function (gltf) {
    console.log("GLB loaded successfully! Creating multiple fireflies...");
    
    // Create multiple fireflies from the GLB model
    for (let i = 0; i < numberOfFireflies; i++) {
      const fireflyClone = gltf.scene.clone();
      
      // Vary the scale for each firefly
      const scale = 3 + Math.random() * 4;
      fireflyClone.scale.setScalar(scale);
      
      // Random positions
      fireflyClone.position.set(
        (Math.random() - 0.5) * 40,
        2 + Math.random() * 8,
        (Math.random() - 0.5) * 40
      );

      fireflyClone.traverse((child) => {
        if (child.isMesh && child.material) {
          // Vary colors for each firefly
          const hue = 0.15 + Math.random() * 0.1;
          child.material = child.material.clone(); // Clone material for unique colors
          child.material.emissive = new THREE.Color().setHSL(hue, 0.9, 0.3);
          child.material.emissiveIntensity = 0.4 + Math.random() * 0.4;
          child.material.transparent = true;
          child.material.opacity = 0.8 + Math.random() * 0.2;
        }
      });
      
      // Add point light with varied colors
      const lightColor = new THREE.Color().setHSL(0.15 + Math.random() * 0.1, 0.8, 0.6);
      const fireflyLight = new THREE.PointLight(lightColor, 1 + Math.random() * 1.5, 12 + Math.random() * 8);
      fireflyLight.position.set(0, 0, 0);
      fireflyClone.add(fireflyLight);

      // Add roaming properties
      fireflyClone.userData = {
        basePosition: fireflyClone.position.clone(),
        roamRadius: 10 + Math.random() * 15,
        speed: 0.0005 + Math.random() * 0.0015,
        offsetX: Math.random() * Math.PI * 2,
        offsetY: Math.random() * Math.PI * 2,
        offsetZ: Math.random() * Math.PI * 2,
        verticalSpeed: 0.001 + Math.random() * 0.002
      };

      scene.add(fireflyClone);
      fireflies.push(fireflyClone);
    }
    
    console.log(`${numberOfFireflies} GLB fireflies created and roaming!`);
  },
  function (progress) {
    console.log(
      "Loading progress: ",
      Math.round((progress.loaded / progress.total) * 100) + "%"
    );
  },
  function (error) {
    console.error("Error loading GLB file:", error);
    console.error("Full error details:", error.message);
    // Create fallback fireflies instead
    createFallbackFireflies();
    console.log("Using fallback fireflies due to GLB loading error");
  }
);

// Moon
const moonTexture = new THREE.TextureLoader().load("moon.jpg");
const normalTexture = new THREE.TextureLoader().load("normal.jpg");

const moon = new THREE.Mesh(
  new THREE.SphereGeometry(3, 32, 32),
  new THREE.MeshStandardMaterial({
    map: moonTexture,
    normalMap: normalTexture,
  })
);

scene.add(moon);

moon.position.z = 30;
moon.position.setX(-10);

// Enhanced Forest Ground and Vegetation
function createForestFloor() {
  // Create a large base ground plane
  const baseGroundGeometry = new THREE.PlaneGeometry(200, 200);
  const baseGroundMaterial = new THREE.MeshLambertMaterial({
    color: new THREE.Color().setHSL(0.3, 0.4, 0.15), // Dark forest floor
    transparent: true,
    opacity: 0.9
  });
  const baseGround = new THREE.Mesh(baseGroundGeometry, baseGroundMaterial);
  baseGround.rotation.x = -Math.PI / 2;
  baseGround.position.y = -16;
  scene.add(baseGround);
  
  // Create multiple overlapping grass patches for better coverage
  const grassGeometry = new THREE.PlaneGeometry(15, 15);
  
  for (let i = 0; i < 50; i++) { // Increased from 15 to 50
    const grassColor = new THREE.Color().setHSL(
      0.25 + Math.random() * 0.15, // Green to yellow-green
      0.5 + Math.random() * 0.4,   // Varied saturation
      0.2 + Math.random() * 0.3    // Varied lightness
    );
    
    const grassMaterial = new THREE.MeshLambertMaterial({
      color: grassColor,
      transparent: true,
      opacity: 0.7 + Math.random() * 0.2,
      side: THREE.DoubleSide
    });
    
    const grassPatch = new THREE.Mesh(grassGeometry, grassMaterial);
    grassPatch.rotation.x = -Math.PI / 2 + (Math.random() - 0.5) * 0.2;
    grassPatch.rotation.z = Math.random() * Math.PI * 2;
    grassPatch.position.y = -15 + Math.random() * 1.5;
    grassPatch.position.x = (Math.random() - 0.5) * 120;
    grassPatch.position.z = (Math.random() - 0.5) * 120;
    
    scene.add(grassPatch);
  }
  
  // Add moss patches for ground variation
  for (let i = 0; i < 30; i++) {
    const mossGeometry = new THREE.PlaneGeometry(8 + Math.random() * 5, 8 + Math.random() * 5);
    const mossColor = new THREE.Color().setHSL(0.35, 0.6, 0.25 + Math.random() * 0.15);
    const mossMaterial = new THREE.MeshLambertMaterial({
      color: mossColor,
      transparent: true,
      opacity: 0.8
    });
    
    const moss = new THREE.Mesh(mossGeometry, mossMaterial);
    moss.rotation.x = -Math.PI / 2;
    moss.rotation.z = Math.random() * Math.PI * 2;
    moss.position.y = -14.8 + Math.random() * 0.3;
    moss.position.x = (Math.random() - 0.5) * 100;
    moss.position.z = (Math.random() - 0.5) * 100;
    
    scene.add(moss);
  }
}

function createForestTrees() {
  // Create dense forest with multiple tree types
  
  // Large background trees (tall and distant)
  for (let i = 0; i < 40; i++) {
    const treeGroup = new THREE.Group();
    
    // Varied trunk sizes and colors
    const trunkRadius = 0.4 + Math.random() * 0.6;
    const trunkHeight = 6 + Math.random() * 4;
    const trunkGeometry = new THREE.CylinderGeometry(trunkRadius * 0.7, trunkRadius, trunkHeight, 8);
    const trunkColor = new THREE.Color().setHSL(0.08, 0.6 + Math.random() * 0.3, 0.15 + Math.random() * 0.2);
    const trunkMaterial = new THREE.MeshLambertMaterial({ 
      color: trunkColor,
      roughness: 0.8
    });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = -13 + trunkHeight / 2;
    
    // Multiple foliage layers for fuller trees
    const foliageLayers = 2 + Math.floor(Math.random() * 2);
    for (let layer = 0; layer < foliageLayers; layer++) {
      const foliageRadius = 2.5 + Math.random() * 2;
      const foliageGeometry = new THREE.SphereGeometry(foliageRadius, 12, 8);
      const foliageHue = 0.25 + Math.random() * 0.15; // Green variety
      const foliageColor = new THREE.Color().setHSL(
        foliageHue,
        0.6 + Math.random() * 0.3,
        0.3 + Math.random() * 0.25
      );
      const foliageMaterial = new THREE.MeshLambertMaterial({ 
        color: foliageColor,
        transparent: true,
        opacity: 0.85 + Math.random() * 0.15
      });
      const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
      foliage.position.y = -10 + (layer * 1.5) + Math.random() * 0.5;
      foliage.position.x = (Math.random() - 0.5) * 0.5;
      foliage.position.z = (Math.random() - 0.5) * 0.5;
      foliage.scale.y = 0.8 + Math.random() * 0.4; // Vary vertical scale
      
      treeGroup.add(foliage);
    }
    
    treeGroup.add(trunk);
    
    // Better positioning for dense coverage
    treeGroup.position.x = (Math.random() - 0.5) * 100;
    treeGroup.position.z = (Math.random() - 0.5) * 100;
    treeGroup.position.y = -1 + Math.random() * 2;
    
    // Vary scale for depth
    const scale = 0.8 + Math.random() * 0.6;
    treeGroup.scale.setScalar(scale);
    
    // Random rotation
    treeGroup.rotation.y = Math.random() * Math.PI * 2;
    
    scene.add(treeGroup);
  }
  
  // Medium trees (foreground)
  for (let i = 0; i < 30; i++) {
    const treeGroup = new THREE.Group();
    
    const trunkGeometry = new THREE.CylinderGeometry(0.25, 0.35, 3, 6);
    const trunkMaterial = new THREE.MeshLambertMaterial({ 
      color: new THREE.Color().setHSL(0.08, 0.5, 0.2 + Math.random() * 0.15)
    });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = -12.5;
    
    // Bushier foliage
    const foliageGeometry = new THREE.SphereGeometry(1.8 + Math.random() * 1, 10, 6);
    const foliageColor = new THREE.Color().setHSL(0.3, 0.7, 0.35 + Math.random() * 0.2);
    const foliageMaterial = new THREE.MeshLambertMaterial({ color: foliageColor });
    const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
    foliage.position.y = -9.5;
    foliage.scale.y = 0.9;
    
    treeGroup.add(trunk);
    treeGroup.add(foliage);
    
    treeGroup.position.x = (Math.random() - 0.5) * 60;
    treeGroup.position.z = (Math.random() - 0.5) * 60;
    treeGroup.rotation.y = Math.random() * Math.PI * 2;
    
    scene.add(treeGroup);
  }
}

function createGrassBlades() {
  // Create dense grass coverage with multiple blade types
  const smallGrassGeometry = new THREE.PlaneGeometry(0.3, 1.5);
  const mediumGrassGeometry = new THREE.PlaneGeometry(0.5, 2.5);
  const tallGrassGeometry = new THREE.PlaneGeometry(0.7, 3);
  
  // Dense grass coverage
  for (let i = 0; i < 300; i++) { // Increased from 100
    const grassGeometry = [smallGrassGeometry, mediumGrassGeometry, tallGrassGeometry][Math.floor(Math.random() * 3)];
    const grassHue = 0.25 + Math.random() * 0.15;
    const grassColor = new THREE.Color().setHSL(grassHue, 0.6 + Math.random() * 0.3, 0.25 + Math.random() * 0.3);
    const grassBladeMaterial = new THREE.MeshLambertMaterial({
      color: grassColor,
      transparent: true,
      opacity: 0.6 + Math.random() * 0.3,
      side: THREE.DoubleSide
    });
    
    const grassBlade = new THREE.Mesh(grassGeometry, grassBladeMaterial);
    grassBlade.position.x = (Math.random() - 0.5) * 80;
    grassBlade.position.y = -14.5 + Math.random() * 1.5;
    grassBlade.position.z = (Math.random() - 0.5) * 80;
    grassBlade.rotation.y = Math.random() * Math.PI * 2;
    grassBlade.rotation.z = (Math.random() - 0.5) * 0.4;
    
    scene.add(grassBlade);
  }
}

function createBushesAndShrubs() {
  // Add bushes and shrubs for more forest density
  for (let i = 0; i < 40; i++) {
    const bushGroup = new THREE.Group();
    
    // Main bush body
    const bushGeometry = new THREE.SphereGeometry(0.8 + Math.random() * 0.7, 8, 6);
    const bushColor = new THREE.Color().setHSL(0.3, 0.6 + Math.random() * 0.2, 0.25 + Math.random() * 0.2);
    const bushMaterial = new THREE.MeshLambertMaterial({ color: bushColor });
    const bush = new THREE.Mesh(bushGeometry, bushMaterial);
    bush.position.y = -14;
    bush.scale.y = 0.6 + Math.random() * 0.3; // Flatten slightly
    
    bushGroup.add(bush);
    
    // Add smaller bush parts for complexity
    if (Math.random() > 0.5) {
      const smallBushGeometry = new THREE.SphereGeometry(0.4 + Math.random() * 0.3, 6, 4);
      const smallBush = new THREE.Mesh(smallBushGeometry, bushMaterial.clone());
      smallBush.position.set(
        (Math.random() - 0.5) * 1.5,
        -14 + Math.random() * 0.5,
        (Math.random() - 0.5) * 1.5
      );
      bushGroup.add(smallBush);
    }
    
    bushGroup.position.x = (Math.random() - 0.5) * 70;
    bushGroup.position.z = (Math.random() - 0.5) * 70;
    bushGroup.rotation.y = Math.random() * Math.PI * 2;
    
    scene.add(bushGroup);
  }
}

function createFerns() {
  // Add ferns for forest undergrowth
  for (let i = 0; i < 60; i++) {
    const fernGroup = new THREE.Group();
    
    // Fern fronds
    const frondCount = 3 + Math.floor(Math.random() * 4);
    for (let j = 0; j < frondCount; j++) {
      const frondGeometry = new THREE.PlaneGeometry(0.8, 2 + Math.random() * 1);
      const fernColor = new THREE.Color().setHSL(0.35, 0.7, 0.2 + Math.random() * 0.15);
      const frondMaterial = new THREE.MeshLambertMaterial({
        color: fernColor,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
      });
      
      const frond = new THREE.Mesh(frondGeometry, frondMaterial);
      frond.position.y = -13 + Math.random() * 0.5;
      frond.rotation.y = (j / frondCount) * Math.PI * 2 + Math.random() * 0.5;
      frond.rotation.z = (Math.random() - 0.5) * 0.3;
      frond.rotation.x = Math.random() * 0.2;
      
      fernGroup.add(frond);
    }
    
    fernGroup.position.x = (Math.random() - 0.5) * 75;
    fernGroup.position.z = (Math.random() - 0.5) * 75;
    
    scene.add(fernGroup);
  }
}

// Initialize dense forest environment
createForestFloor();
createForestTrees();
createGrassBlades();
createBushesAndShrubs();
createFerns();

// Scroll Animation
function moveCamera() {
  const t = document.body.getBoundingClientRect().top;
  moon.rotation.x += 0.05;
  moon.rotation.y += 0.075;
  moon.rotation.z += 0.05;

  // Update all roaming fireflies
  fireflies.forEach((firefly, index) => {
    // Gentle rotation
    firefly.rotation.y += 0.01 + (index * 0.002);
    firefly.rotation.z += 0.005 + (index * 0.001);
    
    // Scroll-based gentle drift (much subtler than before)
    const scrollInfluence = t * -0.001;
    firefly.position.x += scrollInfluence;
  });

  camera.position.z = t * -0.01;
  camera.position.x = t * -0.0002;
  camera.rotation.y = t * -0.0002;
}

document.body.onscroll = moveCamera;
moveCamera();

// Animation Loop
function animate() {
  requestAnimationFrame(animate);

  const time = Date.now();

  moon.rotation.x += 0.005;

  // Animate roaming fireflies
  fireflies.forEach((firefly, index) => {
    const userData = firefly.userData;
    if (userData) {
      // Create smooth roaming motion using sine waves
      const timeOffset = time * userData.speed;
      
      // Calculate new position based on base position and roaming patterns
      const roamX = Math.sin(timeOffset + userData.offsetX) * userData.roamRadius;
      const roamZ = Math.cos(timeOffset + userData.offsetZ) * userData.roamRadius;
      const roamY = Math.sin(timeOffset * 2 + userData.offsetY) * 3; // Vertical bobbing
      
      firefly.position.x = userData.basePosition.x + roamX;
      firefly.position.z = userData.basePosition.z + roamZ;
      firefly.position.y = userData.basePosition.y + roamY;
      
      // Gentle rotation while roaming
      firefly.rotation.y = Math.sin(timeOffset * 0.5) * 0.3;
      firefly.rotation.x = Math.sin(timeOffset * 0.3) * 0.2;
      
      // Occasionally change direction (update base position slightly)
      if (Math.random() < 0.001) {
        userData.basePosition.x += (Math.random() - 0.5) * 2;
        userData.basePosition.z += (Math.random() - 0.5) * 2;
        // Keep within bounds
        userData.basePosition.x = Math.max(-30, Math.min(30, userData.basePosition.x));
        userData.basePosition.z = Math.max(-30, Math.min(30, userData.basePosition.z));
      }
    }
  });

  // Animate forest elements with gentle wind-like motion
  scene.traverse((child) => {
    if (child.material && child.material.color && child.material.color.g > 0.5) {
      // Animate green objects (grass and leaves) with gentle swaying
      if (child.rotation && !fireflies.includes(child)) {
        child.rotation.z = Math.sin(time * 0.001 + child.position.x) * 0.1;
      }
    }
  });

  renderer.render(scene, camera);
}

animate();
