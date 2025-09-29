/**
 * ScrollAnimations.js - Handles GSAP ScrollTrigger animations for camera and scene
 */

export class ScrollAnimations {
  constructor(sceneManager, assetManager, firefliesSystem) {
    this.sceneManager = sceneManager;
    this.assetManager = assetManager;
    this.firefliesSystem = firefliesSystem;
    this.camera = sceneManager.getCamera();
    this.scene = sceneManager.getScene();

    // Animation state
    this.scrollProgress = 0;
    this.lastLoggedProgress = 0; // For debug logging
    this.isVideoPhase = false;
    this.videoTriggered = false; // Flag to prevent multiple video triggers
    this.timeline = null;

    this.init();
  }

  init() {
    // Register GSAP ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);

    this.setupScrollAnimation();
    // Removed setupVideoTransition() - no longer needed
  }

  setupScrollAnimation() {
    // Create main timeline for 3D scene animation
    this.timeline = gsap.timeline({
      scrollTrigger: {
        trigger: "#scroll-content",
        start: "top top",
        end: "bottom bottom", // Use full scroll for 3D animation
        scrub: 1,
        pin: "#canvas-container",
        onUpdate: (self) => {
          this.scrollProgress = self.progress;
          this.updateScene(self.progress);

          // Debug logging
          if (
            Math.floor(self.progress * 10) !==
            Math.floor(this.lastLoggedProgress * 10)
          ) {
            console.log(
              `📊 Scroll progress: ${Math.round(self.progress * 100)}%`
            );
            this.lastLoggedProgress = self.progress;
          }

          // Auto-trigger video at 95% scroll progress as backup
          if (self.progress >= 0.95 && !this.videoTriggered) {
            this.videoTriggered = true;
            console.log("🎬 95% scroll reached, triggering video...");
            setTimeout(() => this.redirectToVideoPage(), 100);
          }
        },
        onComplete: () => {
          // Main trigger when scroll completes
          if (!this.videoTriggered) {
            this.videoTriggered = true;
            this.redirectToVideoPage();
          }
        },
      },
    });

    // Camera animation sequence
    this.animateCamera();
    this.animateFlower();
    this.animateLighting();
  }

  animateCamera() {
    // Initial camera position (ground level forest view like reference)
    const startPos = { x: 0, y: 3, z: 15 };
    const startLookAt = { x: 0, y: 1, z: 0 };

    // Final camera position (focused on flower)
    const endPos = { x: 0, y: 1.5, z: -3 };
    const endLookAt = { x: 0, y: 1, z: -8 };

    // Camera movement timeline
    this.timeline
      // Phase 1: Zoom into forest (0% - 40%)
      .to(
        this.camera.position,
        {
          duration: 0.4,
          x: 0,
          y: 2.5,
          z: 10,
          ease: "power2.inOut",
        },
        0
      )
      .to(
        this.camera.rotation,
        {
          duration: 0.4,
          x: -0.1, // Less downward angle
          ease: "power2.inOut",
        },
        0
      )

      // Phase 2: Move towards flower area (40% - 70%)
      .to(
        this.camera.position,
        {
          duration: 0.3,
          x: 0,
          y: 2,
          z: 3,
          ease: "power2.inOut",
        },
        0.4
      )

      // Phase 3: Final close-up on flower (70% - 100%)
      .to(
        this.camera.position,
        {
          duration: 0.3,
          x: endPos.x,
          y: endPos.y,
          z: endPos.z,
          ease: "power2.out",
        },
        0.7
      )
      .to(
        this.camera.rotation,
        {
          duration: 0.3,
          x: 0,
          y: 0,
          z: 0,
          ease: "power2.out",
        },
        0.7
      );

    // Update camera lookAt during animation
    this.timeline.to(
      {},
      {
        duration: 1,
        onUpdate: () => {
          const progress = this.scrollProgress;
          const lookAtX =
            startLookAt.x + (endLookAt.x - startLookAt.x) * progress;
          const lookAtY =
            startLookAt.y + (endLookAt.y - startLookAt.y) * progress;
          const lookAtZ =
            startLookAt.z + (endLookAt.z - startLookAt.z) * progress;

          this.camera.lookAt(lookAtX, lookAtY, lookAtZ);
        },
      },
      0
    );
  }

  animateFlower() {
    // Flower appears and grows during the scroll
    const flowerAsset = this.assetManager.getAsset("blueFlower");
    if (flowerAsset) {
      // Initial state - hidden
      gsap.set(flowerAsset.model.scale, { x: 0, y: 0, z: 0 });
      gsap.set(flowerAsset.model.rotation, { y: 0 });

      // Flower growth animation (starts at 70% scroll)
      this.timeline
        .to(
          flowerAsset.model.scale,
          {
            duration: 0.3,
            x: 3,
            y: 3,
            z: 3,
            ease: "elastic.out(1, 0.5)",
          },
          0.7
        )
        .to(
          flowerAsset.model.rotation,
          {
            duration: 0.3,
            y: Math.PI,
            ease: "power2.inOut",
          },
          0.7
        )
        .to(
          flowerAsset.model.position,
          {
            duration: 0.3,
            y: 1.0, // Rise slightly for dramatic effect
            ease: "power2.out",
          },
          0.7
        );
    }
  }

  animateLighting() {
    const lights = this.sceneManager.getLights();

    // Animate ambient light intensity
    this.timeline
      .to(
        lights.ambient,
        {
          duration: 1,
          intensity: 0.6,
          ease: "power2.inOut",
        },
        0
      )

      // Animate directional light
      .to(
        lights.directional,
        {
          duration: 1,
          intensity: 0.8,
          ease: "power2.inOut",
        },
        0
      )

      // Change directional light position for dramatic effect
      .to(
        lights.directional.position,
        {
          duration: 1,
          x: 10,
          y: 20,
          z: 5,
          ease: "power2.inOut",
        },
        0.5
      );
  }

  updateScene(progress) {
    // Update fireflies intensity
    this.firefliesSystem.updateIntensity(progress);

    // Update asset visibility
    this.assetManager.updateVisibility(progress);

    // Add subtle fog changes
    if (this.scene.fog) {
      this.scene.fog.near = 50 - progress * 30; // 50 to 20
      this.scene.fog.far = 200 - progress * 50; // 200 to 150
    }
  }

  /**
   * Auto-play video after scroll animation completes
   */
  redirectToVideoPage() {
    console.log("🎬 Scroll animation complete, auto-playing video...");

    // Hide the 3D scene immediately
    const canvasContainer = document.getElementById("canvas-container");
    if (canvasContainer) {
      canvasContainer.style.opacity = "0";
      canvasContainer.style.transition = "opacity 0.5s ease";
    }

    // Wait a moment for transition, then start video
    setTimeout(() => {
      this.playVideo();
    }, 500);
  }

  /**
   * Play the video in fullscreen
   */
  playVideo() {
    const video = document.getElementById("end-video");
    const videoContainer = document.getElementById("video-container");
    const loadingScreen = document.getElementById("loading-screen");

    console.log("🎬 Attempting to play video...");
    console.log("Video element:", video);
    console.log("Video source:", video?.src);

    if (video && videoContainer) {
      // Hide loading screen
      if (loadingScreen) {
        loadingScreen.style.display = "none";
      }

      // Show video container
      videoContainer.style.opacity = "1";
      videoContainer.style.pointerEvents = "auto";
      videoContainer.style.display = "flex";
      videoContainer.style.justifyContent = "center";
      videoContainer.style.alignItems = "center";

      // Make video visible and full size
      video.style.display = "block";
      video.style.width = "100%";
      video.style.height = "100%";
      video.style.objectFit = "cover";

      // Load and play video with better error handling
      video.load();

      video.addEventListener("loadeddata", () => {
        console.log("✅ Video loaded successfully");
        video.currentTime = 0;

        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log("✅ Video playing successfully");
            })
            .catch((error) => {
              console.log("❌ Autoplay prevented, showing controls:", error);
              video.controls = true;
              // Add click to play fallback
              video.addEventListener("click", () => {
                video.play();
              });
            });
        }
      });

      video.addEventListener("error", (e) => {
        console.error("❌ Video error:", e);
        console.error("Video error details:", video.error);

        // Show error message
        videoContainer.innerHTML = `
                    <div style="color: white; text-align: center; padding: 20px;">
                        <h2>❌ Video Error</h2>
                        <p>Could not load video: ${
                          video.error?.message || "Unknown error"
                        }</p>
                        <p>Video path: ./assets/models/endvideo.mp4</p>
                        <button onclick="location.reload()" style="
                            padding: 10px 20px;
                            background: #ff6b35;
                            color: white;
                            border: none;
                            border-radius: 5px;
                            cursor: pointer;
                        ">Reload Page</button>
                    </div>
                `;
      });
    } else {
      console.error("❌ Video elements not found");
      console.log("Video element:", video);
      console.log("Video container:", videoContainer);
    }
  }

  /**
   * Add parallax effect to scene elements
   */
  addParallaxEffect() {
    // Get scroll position
    const scrollY = window.scrollY;
    const parallaxFactor = 0.0005;

    // Apply parallax to background elements
    const stars = this.scene.children.find((child) => child.type === "Points");
    if (stars) {
      stars.rotation.y = scrollY * parallaxFactor;
      stars.rotation.x = scrollY * parallaxFactor * 0.5;
    }
  }

  /**
   * Handle resize events
   */
  handleResize() {
    ScrollTrigger.refresh();
  }

  /**
   * Get current scroll progress
   */
  getScrollProgress() {
    return this.scrollProgress;
  }

  /**
   * Check if in video phase
   */
  getIsVideoPhase() {
    return this.isVideoPhase;
  }

  /**
   * Cleanup and dispose
   */
  dispose() {
    if (this.timeline) {
      this.timeline.kill();
    }
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
  }
}
