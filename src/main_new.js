/**
 * main.js - Main application controller coordinating all modules
 */

import * as THREE from "three";
import { SceneManager } from "./professional/SceneManager.js";
import { AssetManager } from "./professional/AssetManager.js";
import { FirefliesSystem } from "./professional/FirefliesSystem.js";
import { ScrollAnimations } from "./professional/ScrollAnimations.js";
import { PerformanceMonitor } from "./professional/PerformanceMonitor.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

class ForestScrollExperience {
  constructor() {
    // Core components
    this.sceneManager = null;
    this.assetManager = null;
    this.firefliesSystem = null;
    this.scrollAnimations = null;
    this.performanceMonitor = null;
    this.orbitControls = null;

    // Application state
    this.isLoaded = false;
    this.isInitialized = false;
    this.animationId = null;
    this.clock = new THREE.Clock();

    // UI elements
    this.loadingScreen = document.getElementById("loading-screen");
    this.progressFill = document.getElementById("progress-fill");
    this.canvas = document.getElementById("three-canvas");

    this.init();
  }

  async init() {
    try {
      console.log("🚀 Initializing Forest Scroll Experience...");

      // Initialize scene manager first
      this.sceneManager = new SceneManager(this.canvas);
      console.log("✓ Scene Manager initialized");

      // Initialize performance monitor
      this.performanceMonitor = new PerformanceMonitor(
        this.sceneManager.getRenderer(),
        this.sceneManager.getScene(),
        this.sceneManager.getCamera()
      );
      console.log("✓ Performance Monitor initialized");

      // Setup orbit controls (disabled by default)
      this.setupOrbitControls();

      // Load all assets
      await this.loadAssets();

      // Initialize systems that depend on loaded assets
      this.initializeSystems();

      // Setup scroll animations
      this.initializeScrollAnimations();

      // Start render loop
      this.startRenderLoop();

      // Hide loading screen
      this.hideLoadingScreen();

      this.isInitialized = true;
      console.log("✅ Forest Scroll Experience initialized successfully!");
    } catch (error) {
      console.error("❌ Initialization failed:", error);
      this.showError(
        "Failed to load the experience. Please refresh and try again."
      );
    }
  }

  setupOrbitControls() {
    this.orbitControls = new OrbitControls(
      this.sceneManager.getCamera(),
      this.sceneManager.getRenderer().domElement
    );

    // Configure controls
    this.orbitControls.enableDamping = true;
    this.orbitControls.dampingFactor = 0.05;
    this.orbitControls.enableZoom = true;
    this.orbitControls.enablePan = true;
    this.orbitControls.maxPolarAngle = Math.PI * 0.75;
    this.orbitControls.minDistance = 5;
    this.orbitControls.maxDistance = 100;

    // Disable controls initially (will be controlled by scroll)
    this.orbitControls.enabled = false;

    console.log("✓ Orbit Controls setup (disabled for scroll animation)");
  }

  async loadAssets() {
    console.log("📦 Loading assets...");

    // Initialize asset manager
    this.assetManager = new AssetManager(this.sceneManager.getScene());

    // Load all assets with progress tracking
    await this.assetManager.loadAllAssets((progress) => {
      this.updateLoadingProgress(progress);
    });

    this.isLoaded = true;
    console.log("✓ All assets loaded successfully");
  }

  initializeSystems() {
    // Initialize fireflies system
    this.firefliesSystem = new FirefliesSystem(
      this.sceneManager.getScene(),
      this.assetManager
    );
    console.log("✓ Fireflies system initialized");
  }

  initializeScrollAnimations() {
    // Initialize scroll animations
    this.scrollAnimations = new ScrollAnimations(
      this.sceneManager,
      this.assetManager,
      this.firefliesSystem
    );
    console.log("✓ Scroll animations initialized");
  }

  updateLoadingProgress(progress) {
    const percentage = Math.round(progress * 100);
    this.progressFill.style.width = `${percentage}%`;

    // Update loading text
    const loadingText = document.querySelector(".loading-text");
    if (loadingText) {
      if (percentage < 30) {
        loadingText.textContent = "Loading Forest Assets...";
      } else if (percentage < 60) {
        loadingText.textContent = "Preparing Fireflies...";
      } else if (percentage < 90) {
        loadingText.textContent = "Setting up Animations...";
      } else {
        loadingText.textContent = "Almost Ready...";
      }
    }
  }

  hideLoadingScreen() {
    if (this.loadingScreen) {
      gsap.to(this.loadingScreen, {
        duration: 1,
        opacity: 0,
        ease: "power2.inOut",
        onComplete: () => {
          this.loadingScreen.style.display = "none";
        },
      });
    }
  }

  showError(message) {
    if (this.loadingScreen) {
      const loadingText = document.querySelector(".loading-text");
      if (loadingText) {
        loadingText.textContent = message;
        loadingText.style.color = "#ff6b6b";
      }

      const progressBar = document.querySelector(".progress-bar");
      if (progressBar) {
        progressBar.style.display = "none";
      }
    }
  }

  startRenderLoop() {
    const animate = () => {
      this.animationId = requestAnimationFrame(animate);

      if (!this.isInitialized) return;

      const deltaTime = this.clock.getDelta();

      // Update systems
      this.update(deltaTime);

      // Render scene
      this.render();
    };

    animate();
    console.log("✓ Render loop started");
  }

  update(deltaTime) {
    // Update scene manager (lights animation)
    this.sceneManager.animate(deltaTime);

    // Update fireflies system
    if (this.firefliesSystem) {
      this.firefliesSystem.update(deltaTime);
    }

    // Update orbit controls (if enabled)
    if (this.orbitControls && this.orbitControls.enabled) {
      this.orbitControls.update();
    }

    // Update performance monitor
    if (this.performanceMonitor) {
      this.performanceMonitor.updateFPS();
    }
  }

  render() {
    this.sceneManager.render();
  }

  // Public methods for external control

  /**
   * Enable/disable orbit controls (for testing)
   */
  toggleOrbitControls(enable = true) {
    if (this.orbitControls) {
      this.orbitControls.enabled = enable;
      console.log(`Orbit controls ${enable ? "enabled" : "disabled"}`);
    }
  }

  /**
   * Get current performance metrics
   */
  getPerformanceMetrics() {
    return this.performanceMonitor
      ? this.performanceMonitor.getMetrics()
      : null;
  }

  /**
   * Get scroll progress
   */
  getScrollProgress() {
    return this.scrollAnimations
      ? this.scrollAnimations.getScrollProgress()
      : 0;
  }

  /**
   * Check if in video phase
   */
  isInVideoPhase() {
    return this.scrollAnimations
      ? this.scrollAnimations.getIsVideoPhase()
      : false;
  }

  /**
   * Cleanup and dispose
   */
  dispose() {
    console.log("🧹 Cleaning up Forest Scroll Experience...");

    // Cancel animation loop
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    // Dispose systems
    if (this.scrollAnimations) {
      this.scrollAnimations.dispose();
    }

    if (this.firefliesSystem) {
      this.firefliesSystem.dispose();
    }

    if (this.assetManager) {
      this.assetManager.dispose();
    }

    if (this.performanceMonitor) {
      this.performanceMonitor.dispose();
    }

    if (this.orbitControls) {
      this.orbitControls.dispose();
    }

    console.log("✓ Cleanup complete");
  }
}

// Global error handling
window.addEventListener("error", (event) => {
  console.error("Global error:", event.error);
});

window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled promise rejection:", event.reason);
  event.preventDefault();
});

// Initialize application when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("🌟 Starting Forest Scroll Experience...");

  // Create global instance
  window.forestExperience = new ForestScrollExperience();

  // Development helper: expose controls toggle
  if (typeof window !== "undefined") {
    window.toggleControls = () => {
      const currentState =
        window.forestExperience.orbitControls?.enabled || false;
      window.forestExperience.toggleOrbitControls(!currentState);
    };

    window.getMetrics = () => {
      return window.forestExperience.getPerformanceMetrics();
    };
  }
});

// Handle page unload
window.addEventListener("beforeunload", () => {
  if (window.forestExperience) {
    window.forestExperience.dispose();
  }
});

export { ForestScrollExperience };
