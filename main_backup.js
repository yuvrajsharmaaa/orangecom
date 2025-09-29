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

// Torus
const geometry = new THREE.TorusGeometry(10, 3, 16, 100);
const material = new THREE.MeshStandardMaterial({ color: 0xff6347 });
const torus = new THREE.Mesh(geometry, material);

scene.add(torus);

// Lights
const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(5, 5, 5);

const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(pointLight, ambientLight);

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

// Background
const spaceTexture = new THREE.TextureLoader().load("space.jpg");
scene.background = spaceTexture;

// Firefly Model
let firefly;
const loader = new GLTFLoader();

function createFallbackFirefly() {
  console.log("Creating fallback yellow sphere...");
  const geometry = new THREE.SphereGeometry(1, 32, 32);
  const material = new THREE.MeshBasicMaterial({
    color: 0xffff00,
    transparent: false,
  });
  firefly = new THREE.Mesh(geometry, material);
  firefly.position.set(2, 0, -5);
  scene.add(firefly);
  console.log("Fallback sphere created and added to scene");
}

console.log("Attempting to load firefly.glb...");

loader.load(
  "firefly.glb",
  function (gltf) {
    console.log("GLB loaded successfully!", gltf);
    firefly = gltf.scene;

    firefly.scale.setScalar(5);
    firefly.position.set(2, 0, -5);

    firefly.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          child.material.transparent = false;
          child.material.opacity = 1;
        }
      }
    });

    scene.add(firefly);
    console.log("Firefly added to scene at position:", firefly.position);
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
    createFallbackFirefly();
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

// Scroll Animation
function moveCamera() {
  const t = document.body.getBoundingClientRect().top;
  moon.rotation.x += 0.05;
  moon.rotation.y += 0.075;
  moon.rotation.z += 0.05;

  if (firefly) {
    firefly.rotation.y += 0.01;
    firefly.rotation.z += 0.01;
    firefly.position.y = Math.sin(Date.now() * 0.001) * 0.5;
  }

  camera.position.z = t * -0.01;
  camera.position.x = t * -0.0002;
  camera.rotation.y = t * -0.0002;
}

document.body.onscroll = moveCamera;
moveCamera();

// Animation Loop
function animate() {
  requestAnimationFrame(animate);

  torus.rotation.x += 0.01;
  torus.rotation.y += 0.005;
  torus.rotation.z += 0.01;

  moon.rotation.x += 0.005;

  renderer.render(scene, camera);
}

animate();
