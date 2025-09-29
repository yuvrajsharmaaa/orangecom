/**
 * PerformanceMonitor.js - Handles performance optimization and monitoring
 */

import * as THREE from "three";

export class PerformanceMonitor {
  constructor(renderer, scene, camera) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;

    // Performance metrics
    this.fps = 60;
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.deltaTime = 0;

    // Throttling settings
    this.throttleResize = this.throttle(this.handleResize.bind(this), 100);
    this.throttleScroll = this.throttle(this.handleScroll.bind(this), 16); // ~60fps

    // Performance settings
    this.settings = {
      targetFPS: 60,
      maxPixelRatio: 2,
      enableShadows: true,
      shadowMapSize: 2048,
      enableAntialias: true,
      enableToneMapping: true,
    };

    this.init();
  }

  init() {
    this.optimizeRenderer();
    this.setupEventListeners();
    this.detectDeviceCapabilities();
  }

  optimizeRenderer() {
    // Set optimal pixel ratio
    const pixelRatio = Math.min(
      window.devicePixelRatio,
      this.settings.maxPixelRatio
    );
    this.renderer.setPixelRatio(pixelRatio);

    // Configure shadow settings
    if (this.settings.enableShadows) {
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    // Set color space and tone mapping
    if (this.settings.enableToneMapping) {
      this.renderer.outputColorSpace = THREE.SRGBColorSpace;
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 0.8;
    }

    // Enable frustum culling
    this.camera.updateMatrixWorld();

    console.log(`✓ Renderer optimized - Pixel Ratio: ${pixelRatio}`);
  }

  detectDeviceCapabilities() {
    // Detect device performance level
    const canvas = this.renderer.domElement;
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");

    if (gl) {
      const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
      const vendor = gl.getParameter(
        debugInfo?.UNMASKED_VENDOR_WEBGL || gl.VENDOR
      );
      const renderer = gl.getParameter(
        debugInfo?.UNMASKED_RENDERER_WEBGL || gl.RENDERER
      );

      console.log(`GPU: ${vendor} ${renderer}`);

      // Adjust settings based on device capability
      if (this.isLowEndDevice(vendor, renderer)) {
        this.applyLowEndOptimizations();
      }
    }

    // Memory info (if available)
    if (performance.memory) {
      console.log("Memory Info:", {
        used: Math.round(performance.memory.usedJSHeapSize / 1048576) + "MB",
        total: Math.round(performance.memory.totalJSHeapSize / 1048576) + "MB",
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576) + "MB",
      });
    }
  }

  isLowEndDevice(vendor, renderer) {
    const lowEndIndicators = [
      "intel",
      "integrated",
      "mobile",
      "power",
      "mali",
      "adreno",
      "videocards",
    ];

    const deviceInfo = (vendor + " " + renderer).toLowerCase();
    return lowEndIndicators.some((indicator) => deviceInfo.includes(indicator));
  }

  applyLowEndOptimizations() {
    console.log("⚡ Applying low-end device optimizations");

    // Reduce pixel ratio
    this.settings.maxPixelRatio = 1;
    this.renderer.setPixelRatio(1);

    // Disable shadows
    this.settings.enableShadows = false;
    this.renderer.shadowMap.enabled = false;

    // Reduce shadow map size
    this.settings.shadowMapSize = 1024;

    // Disable antialiasing
    this.settings.enableAntialias = false;

    // Lower target FPS
    this.settings.targetFPS = 30;
  }

  setupEventListeners() {
    // Throttled resize handler
    window.addEventListener("resize", this.throttleResize);

    // Throttled scroll handler for performance monitoring
    window.addEventListener("scroll", this.throttleScroll);

    // Visibility change handler
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this.pausePerformanceMonitoring();
      } else {
        this.resumePerformanceMonitoring();
      }
    });
  }

  handleResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Update camera
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    // Update renderer
    this.renderer.setSize(width, height);

    // Refresh ScrollTrigger if available
    if (window.ScrollTrigger) {
      window.ScrollTrigger.refresh();
    }

    console.log(`📐 Resized: ${width}x${height}`);
  }

  handleScroll() {
    // Monitor scroll performance
    this.updateFPS();
  }

  updateFPS() {
    this.frameCount++;
    const currentTime = performance.now();

    if (currentTime >= this.lastTime + 1000) {
      this.fps = Math.round(
        (this.frameCount * 1000) / (currentTime - this.lastTime)
      );
      this.frameCount = 0;
      this.lastTime = currentTime;

      // Auto-adjust quality based on FPS
      this.autoAdjustQuality();
    }
  }

  autoAdjustQuality() {
    const targetFPS = this.settings.targetFPS;

    if (this.fps < targetFPS * 0.8) {
      // Performance is poor, reduce quality
      this.reduceQuality();
    } else if (this.fps > targetFPS * 1.2 && this.canIncreaseQuality()) {
      // Performance is good, can increase quality
      this.increaseQuality();
    }
  }

  reduceQuality() {
    let qualityReduced = false;

    // Step 1: Reduce pixel ratio
    if (this.renderer.getPixelRatio() > 1) {
      this.renderer.setPixelRatio(
        Math.max(1, this.renderer.getPixelRatio() - 0.25)
      );
      qualityReduced = true;
    }

    // Step 2: Disable shadows
    else if (this.renderer.shadowMap.enabled) {
      this.renderer.shadowMap.enabled = false;
      qualityReduced = true;
    }

    // Step 3: Reduce shadow map size
    else if (this.settings.shadowMapSize > 512) {
      this.settings.shadowMapSize /= 2;
      qualityReduced = true;
    }

    if (qualityReduced) {
      console.log(
        `⬇️ Quality reduced - FPS: ${this.fps}, Target: ${this.settings.targetFPS}`
      );
    }
  }

  increaseQuality() {
    let qualityIncreased = false;

    // Step 1: Increase shadow map size
    if (this.settings.shadowMapSize < 2048) {
      this.settings.shadowMapSize *= 2;
      qualityIncreased = true;
    }

    // Step 2: Enable shadows
    else if (!this.renderer.shadowMap.enabled && this.settings.enableShadows) {
      this.renderer.shadowMap.enabled = true;
      qualityIncreased = true;
    }

    // Step 3: Increase pixel ratio
    else if (this.renderer.getPixelRatio() < this.settings.maxPixelRatio) {
      const newRatio = Math.min(
        this.settings.maxPixelRatio,
        this.renderer.getPixelRatio() + 0.25
      );
      this.renderer.setPixelRatio(newRatio);
      qualityIncreased = true;
    }

    if (qualityIncreased) {
      console.log(
        `⬆️ Quality increased - FPS: ${this.fps}, Target: ${this.settings.targetFPS}`
      );
    }
  }

  canIncreaseQuality() {
    return (
      this.settings.shadowMapSize < 2048 ||
      !this.renderer.shadowMap.enabled ||
      this.renderer.getPixelRatio() < this.settings.maxPixelRatio
    );
  }

  pausePerformanceMonitoring() {
    console.log("⏸️ Performance monitoring paused");
    // Reduce render frequency when tab is not visible
  }

  resumePerformanceMonitoring() {
    console.log("▶️ Performance monitoring resumed");
    this.lastTime = performance.now();
    this.frameCount = 0;
  }

  /**
   * Throttle function to limit function calls
   */
  throttle(func, limit) {
    let inThrottle;
    return function () {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  /**
   * Debounce function to delay function calls
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Get current performance metrics
   */
  getMetrics() {
    return {
      fps: this.fps,
      pixelRatio: this.renderer.getPixelRatio(),
      shadowsEnabled: this.renderer.shadowMap.enabled,
      shadowMapSize: this.settings.shadowMapSize,
      targetFPS: this.settings.targetFPS,
    };
  }

  /**
   * Memory cleanup
   */
  dispose() {
    window.removeEventListener("resize", this.throttleResize);
    window.removeEventListener("scroll", this.throttleScroll);

    console.log("✓ PerformanceMonitor disposed");
  }
}
