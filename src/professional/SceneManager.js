/**
 * SceneManager.js - Handles Three.js scene setup, renderer, camera, and lighting
 */

import * as THREE from "three";

export class SceneManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.lights = {};

    this.init();
    this.setupLights();
    this.handleResize();
  }

  init() {
    // Scene setup with dark forest atmosphere like reference
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000); // Pure black background
    this.scene.fog = new THREE.Fog(0x000000, 20, 80); // Pure black fog

    // Camera setup - perspective camera with 45° FOV
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);

    // Initial camera position - ground level view like reference image
    this.camera.position.set(0, 3, 15); // Much lower and closer
    this.camera.lookAt(0, 1, 0); // Look slightly up from ground

    // Renderer setup with antialias and optimized pixel ratio
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: false,
    });

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.4; // Slightly brighter to show grass details

    // Enable shadows for realistic lighting
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Background - starry night sky
    // this.createStarryBackground(); // Temporarily disabled to check for purple issue
  }

  setupLights() {
    // Ambient light - warm forest lighting like reference
    this.lights.ambient = new THREE.AmbientLight(0xfff8dc, 0.6); // Warm white
    this.scene.add(this.lights.ambient);

    // Directional light - balanced for grass visibility with warm tone
    this.lights.directional = new THREE.DirectionalLight(0xfff8dc, 0.4); // Warm directional
    this.lights.directional.position.set(30, 40, 30);
    this.lights.directional.castShadow = true;

    // Shadow camera settings for better quality
    this.lights.directional.shadow.camera.near = 1;
    this.lights.directional.shadow.camera.far = 100;
    this.lights.directional.shadow.camera.left = -50;
    this.lights.directional.shadow.camera.right = 50;
    this.lights.directional.shadow.camera.top = 50;
    this.lights.directional.shadow.camera.bottom = -50;
    this.lights.directional.shadow.mapSize.width = 2048;
    this.lights.directional.shadow.mapSize.height = 2048;

    this.scene.add(this.lights.directional);

    // Point lights for subtle forest ambiance
    this.lights.pointLights = [];
    const pointLightColors = [0x8fbc8f, 0x6b8e6b, 0x556b55]; // Forest green tones

    for (let i = 0; i < 3; i++) {
      const pointLight = new THREE.PointLight(pointLightColors[i], 0.3, 25);
      pointLight.position.set(
        (Math.random() - 0.5) * 30,
        5 + Math.random() * 3,
        (Math.random() - 0.5) * 30
      );
      this.lights.pointLights.push(pointLight);
      this.scene.add(pointLight);
    }

    // Ambient forest lighting for grass visibility
    this.lights.ambient = new THREE.AmbientLight(0x404040, 0.2); // Slightly brighter ambient
    this.scene.add(this.lights.ambient);

    // Forest fill light for ground detail
    this.lights.fillLight = new THREE.DirectionalLight(0x6a8a6a, 0.15);
    this.lights.fillLight.position.set(-10, 15, -10);
    this.scene.add(this.lights.fillLight);
  }

  createStarryBackground() {
    // Create starry night sky using points
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1,
      sizeAttenuation: false,
    });

    const starsVertices = [];
    for (let i = 0; i < 1000; i++) {
      const x = (Math.random() - 0.5) * 2000;
      const y = (Math.random() - 0.5) * 2000;
      const z = (Math.random() - 0.5) * 2000;
      starsVertices.push(x, y, z);
    }

    starsGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(starsVertices, 3)
    );
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    this.scene.add(stars);
  }

  handleResize() {
    const resizeHandler = () => {
      // Update camera aspect ratio
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();

      // Update renderer size
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    // Throttled resize handler for performance
    let resizeTimeout;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(resizeHandler, 100);
    });
  }

  // Animation method to be called in the render loop
  animate(deltaTime) {
    // Animate point lights for magical effect
    this.lights.pointLights.forEach((light, index) => {
      const time = Date.now() * 0.001;
      light.position.x += Math.sin(time + index) * 0.01;
      light.position.z += Math.cos(time + index) * 0.01;
      light.intensity = 0.3 + Math.sin(time * 2 + index) * 0.2;
    });
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  // Getters for external access
  getScene() {
    return this.scene;
  }
  getCamera() {
    return this.camera;
  }
  getRenderer() {
    return this.renderer;
  }
  getLights() {
    return this.lights;
  }
}
