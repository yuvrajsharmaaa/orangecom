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

scene.add(
  pointLight,
  ambientLight,
  forestSunLight,
  forestFillLight,
  forestAmbient,
  groundLight
);

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
    emissiveIntensity: 0.6,
  });

  const fireflyMesh = new THREE.Mesh(geometry, material);

  // Random starting positions
  fireflyMesh.position.set(
    (Math.random() - 0.5) * 40, // x: -20 to 20
    2 + Math.random() * 8, // y: 2 to 10 (above forest floor)
    (Math.random() - 0.5) * 40 // z: -20 to 20
  );

  // Add a glowing halo
  const haloGeometry = new THREE.SphereGeometry(
    1.5 + Math.random() * 0.5,
    12,
    12
  );
  const haloMaterial = new THREE.MeshBasicMaterial({
    color: emissiveColor,
    transparent: true,
    opacity: 0.15,
    side: THREE.BackSide,
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
    verticalSpeed: 0.001 + Math.random() * 0.002,
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
      const lightColor = new THREE.Color().setHSL(
        0.15 + Math.random() * 0.1,
        0.8,
        0.6
      );
      const fireflyLight = new THREE.PointLight(
        lightColor,
        1 + Math.random() * 1.5,
        12 + Math.random() * 8
      );
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
        verticalSpeed: 0.001 + Math.random() * 0.002,
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

// Forest environment removed - clean space scene

// Scroll Animation
function moveCamera() {
  const t = document.body.getBoundingClientRect().top;
  moon.rotation.x += 0.05;
  moon.rotation.y += 0.075;
  moon.rotation.z += 0.05;

  // Update all roaming fireflies
  fireflies.forEach((firefly, index) => {
    // Gentle rotation
    firefly.rotation.y += 0.01 + index * 0.002;
    firefly.rotation.z += 0.005 + index * 0.001;

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
      const roamX =
        Math.sin(timeOffset + userData.offsetX) * userData.roamRadius;
      const roamZ =
        Math.cos(timeOffset + userData.offsetZ) * userData.roamRadius;
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
        userData.basePosition.x = Math.max(
          -30,
          Math.min(30, userData.basePosition.x)
        );
        userData.basePosition.z = Math.max(
          -30,
          Math.min(30, userData.basePosition.z)
        );
      }
    }
  });

  renderer.render(scene, camera);
}

animate();
