// main.js - Scene setup, renderer, resize, render loop
import { AssetLoader } from "./loader.js";
import { FireflySystem } from "./fireflies.js";
import { ScrollAnimations } from "./animations.js";

class ThreeJSApp {
  constructor() {
    // Scene components
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;

    // Asset system
    this.loader = new AssetLoader();
    this.fireflies = null;
    this.scrollAnimations = null;

    // 3D Models
    this.forestModel = null;
    this.orangeModel = null;
    this.logoModel = null;

    // Animation state
    this.isLoading = true;
    this.currentSection = 0;

    this.init();
  }

  async init() {
    this.setupScene();
    this.setupRenderer();
    this.setupCamera();
    this.setupLights();
    this.setupControls();

    // Load all assets
    await this.loadAssets();

    // Initialize systems
    this.setupFireflies();
    this.setupScrollAnimations();

    // Start render loop
    this.animate();

    // Hide loading screen
    this.hideLoadingScreen();

    // Setup responsive handling
    this.setupResize();

    console.log("🌟 Three.js App initialized successfully!");
  }

  setupScene() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x0a0a0a, 10, 100);

    // Add subtle background
    const loader = new THREE.TextureLoader();
    loader.load("space.jpg", (texture) => {
      this.scene.background = texture;
    });
  }

  setupRenderer() {
    const canvas = document.getElementById("three-canvas");
    this.renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
    });

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
  }

  setupCamera() {
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    // Initial camera position for forest view
    this.camera.position.set(0, 2, 8);
    this.camera.lookAt(0, 0, 0);
  }

  setupLights() {
    // Warm ambient light
    const ambientLight = new THREE.AmbientLight(0xffeaa7, 0.4);
    this.scene.add(ambientLight);

    // Main directional light (moonlight)
    const moonLight = new THREE.DirectionalLight(0xb8c6db, 0.8);
    moonLight.position.set(10, 10, 5);
    moonLight.castShadow = true;
    moonLight.shadow.mapSize.width = 2048;
    moonLight.shadow.mapSize.height = 2048;
    moonLight.shadow.camera.near = 0.5;
    moonLight.shadow.camera.far = 50;
    moonLight.shadow.camera.left = -10;
    moonLight.shadow.camera.right = 10;
    moonLight.shadow.camera.top = 10;
    moonLight.shadow.camera.bottom = -10;
    this.scene.add(moonLight);

    // Warm rim light
    const rimLight = new THREE.DirectionalLight(0xffa726, 0.3);
    rimLight.position.set(-5, 3, -5);
    this.scene.add(rimLight);

    // Point light for firefly interaction
    const fireflyLight = new THREE.PointLight(0xffd54f, 0.5, 20);
    fireflyLight.position.set(0, 2, 0);
    this.scene.add(fireflyLight);
  }

  setupControls() {
    this.controls = new THREE.OrbitControls(
      this.camera,
      this.renderer.domElement
    );
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.enabled = false; // Disabled during scroll animations
    this.controls.maxPolarAngle = Math.PI / 2;
    this.controls.minDistance = 2;
    this.controls.maxDistance = 20;
  }

  async loadAssets() {
    const loadingText = document.getElementById("loading-text");
    const loadingProgress = document.getElementById("loading-progress");

    try {
      // Load forest (using existing firefly.glb as placeholder)
      loadingText.textContent = "Loading forest...";
      this.forestModel = await this.loader.loadGLTF(
        "./firefly.glb",
        (progress) => {
          loadingProgress.style.width = `${progress * 25}%`;
        }
      );

      // Load orange (using moon.jpg texture on sphere as placeholder)
      loadingText.textContent = "Loading orange...";
      const orangeGeometry = new THREE.SphereGeometry(1, 32, 32);
      const orangeTexture = new THREE.TextureLoader().load("./moon.jpg");
      const orangeMaterial = new THREE.MeshStandardMaterial({
        map: orangeTexture,
        color: 0xffa726,
      });
      this.orangeModel = new THREE.Mesh(orangeGeometry, orangeMaterial);
      this.orangeModel.position.set(2, 0, -3);
      this.orangeModel.visible = false;
      this.scene.add(this.orangeModel);
      loadingProgress.style.width = "50%";

      // Load logo (using torus as placeholder)
      loadingText.textContent = "Loading logo...";
      const logoGeometry = new THREE.TorusGeometry(0.8, 0.3, 16, 100);
      const logoMaterial = new THREE.MeshStandardMaterial({
        color: 0xffa726,
        metalness: 0.7,
        roughness: 0.3,
      });
      this.logoModel = new THREE.Mesh(logoGeometry, logoMaterial);
      this.logoModel.position.set(2, 0, -3);
      this.logoModel.visible = false;
      this.scene.add(this.logoModel);
      loadingProgress.style.width = "75%";

      // Setup forest model
      if (this.forestModel) {
        this.forestModel.scale.setScalar(2);
        this.forestModel.position.set(2, -1, -3);
        this.scene.add(this.forestModel);
      }

      loadingText.textContent = "Preparing experience...";
      loadingProgress.style.width = "100%";
    } catch (error) {
      console.warn("Some assets failed to load, using fallbacks:", error);
      loadingProgress.style.width = "100%";
    }
  }

  setupFireflies() {
    this.fireflies = new FireflySystem(this.scene, 50);
  }

  setupScrollAnimations() {
    this.scrollAnimations = new ScrollAnimations(
      this.camera,
      this.forestModel,
      this.orangeModel,
      this.logoModel
    );
  }

  hideLoadingScreen() {
    const loadingScreen = document.getElementById("loading-screen");
    loadingScreen.style.opacity = "0";

    setTimeout(() => {
      loadingScreen.style.display = "none";
      this.isLoading = false;
    }, 500);
  }

  setupResize() {
    window.addEventListener("resize", () => {
      // Update camera aspect ratio
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();

      // Update renderer size
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    if (!this.isLoading) {
      // Update fireflies
      if (this.fireflies) {
        this.fireflies.update();
      }

      // Update controls (when enabled)
      if (this.controls.enabled) {
        this.controls.update();
      }

      // Rotate models slightly
      if (this.orangeModel) {
        this.orangeModel.rotation.y += 0.01;
      }
      if (this.logoModel) {
        this.logoModel.rotation.y += 0.02;
        this.logoModel.rotation.x += 0.01;
      }
    }

    // Render scene
    this.renderer.render(this.scene, this.camera);
  }
}

// Initialize app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new ThreeJSApp();
});
