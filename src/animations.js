// animations.js - GSAP ScrollTrigger mapping (scroll progress → camera zoom + morph/crossfade)
export class ScrollAnimations {
  constructor(camera, forestModel, orangeModel, logoModel) {
    this.camera = camera;
    this.forestModel = forestModel;
    this.orangeModel = orangeModel;
    this.logoModel = logoModel;

    // Animation state
    this.currentProgress = 0;
    this.isAnimating = false;

    // Store initial positions and rotations
    this.initialCameraPosition = this.camera.position.clone();
    this.initialCameraRotation = this.camera.rotation.clone();

    this.init();
  }

  init() {
    // Register GSAP ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    // Pin the canvas during scroll
    this.setupCanvasPin();

    // Setup scroll-driven animations
    this.setupScrollAnimations();

    // Setup text fade-in animations
    this.setupTextAnimations();

    console.log("📜 Scroll animations initialized");
  }

  setupCanvasPin() {
    // Pin the Three.js canvas while scrolling through content
    ScrollTrigger.create({
      trigger: ".scroll-content",
      start: "top top",
      end: "bottom bottom",
      pin: "#three-canvas",
      pinSpacing: false,
      onUpdate: (self) => {
        this.handleScrollProgress(self.progress);
      },
    });
  }

  setupScrollAnimations() {
    // Create main timeline
    const mainTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: ".scroll-content",
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
        onUpdate: (self) => {
          this.currentProgress = self.progress;
        },
      },
    });

    // Section 1: Forest scene (0% - 25%)
    mainTimeline.to(
      this.camera.position,
      {
        duration: 1,
        x: 1,
        y: 1.5,
        z: 6,
        ease: "power2.inOut",
      },
      0
    );

    // Section 2: Zoom towards orange (25% - 50%)
    mainTimeline.to(
      this.camera.position,
      {
        duration: 1,
        x: 2,
        y: 0.5,
        z: 2,
        ease: "power2.inOut",
        onStart: () => {
          this.showOrange();
        },
      },
      1
    );

    // Section 3: Focus on orange (50% - 75%)
    mainTimeline.to(
      this.camera.position,
      {
        duration: 1,
        x: 2.5,
        y: 0,
        z: 1,
        ease: "power2.inOut",
      },
      2
    );

    // Section 4: Transform to logo (75% - 100%)
    mainTimeline.to(
      this.camera.position,
      {
        duration: 1,
        x: 2,
        y: 0,
        z: 0.5,
        ease: "power2.inOut",
        onStart: () => {
          this.morphToLogo();
        },
      },
      3
    );

    // Camera rotation adjustments
    mainTimeline.to(
      this.camera.rotation,
      {
        duration: 4,
        x: -0.1,
        y: 0.2,
        z: 0,
        ease: "power2.inOut",
      },
      0
    );
  }

  setupTextAnimations() {
    // Animate text elements as they come into view
    gsap.utils.toArray(".fade-in").forEach((element, index) => {
      gsap.fromTo(
        element,
        {
          opacity: 0,
          y: 30,
          scale: 0.9,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: element,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse",
          },
        }
      );
    });
  }

  handleScrollProgress(progress) {
    // Update fireflies based on scroll progress
    if (window.app && window.app.fireflies) {
      window.app.fireflies.setScrollProgress(progress);
    }

    // Adjust lighting based on progress
    this.adjustLighting(progress);

    // Update model visibility and transforms
    this.updateModelVisibility(progress);
  }

  showOrange() {
    if (this.orangeModel) {
      this.orangeModel.visible = true;

      // Animate orange entrance
      gsap.fromTo(
        this.orangeModel.scale,
        {
          x: 0,
          y: 0,
          z: 0,
        },
        {
          x: 1,
          y: 1,
          z: 1,
          duration: 1.5,
          ease: "back.out(1.7)",
        }
      );
    }
  }

  morphToLogo() {
    if (!this.orangeModel || !this.logoModel) return;

    // Check for morph targets (primary method)
    if (
      this.orangeModel.morphTargetInfluences &&
      this.logoModel.morphTargetInfluences
    ) {
      this.morphWithTargets();
    } else {
      // Fallback: crossfade transition
      this.crossfadeTransition();
    }
  }

  morphWithTargets() {
    // If models have morph targets, animate between them
    console.log("🎭 Using morph targets for transformation");

    // This would work with properly set up morph targets
    if (this.orangeModel.morphTargetInfluences) {
      gsap.to(this.orangeModel.morphTargetInfluences, {
        duration: 2,
        ease: "power2.inOut",
        // Animate morph target influences
        0: 1, // Assuming index 0 is the logo shape
        onComplete: () => {
          console.log("Morph transformation complete");
        },
      });
    }
  }

  crossfadeTransition() {
    // Fallback: smooth crossfade between orange and logo
    console.log("🔄 Using crossfade transition");

    const tl = gsap.timeline();

    // Scale down and fade out orange
    tl.to(
      this.orangeModel.scale,
      {
        duration: 1,
        x: 0,
        y: 0,
        z: 0,
        ease: "power2.in",
      },
      0
    );

    // Show and scale up logo
    tl.call(
      () => {
        if (this.logoModel) {
          this.logoModel.visible = true;
          this.logoModel.scale.set(0, 0, 0);
        }
      },
      null,
      0.5
    );

    tl.to(
      this.logoModel.scale,
      {
        duration: 1.5,
        x: 1,
        y: 1,
        z: 1,
        ease: "back.out(1.7)",
      },
      0.5
    );

    // Hide orange after transformation
    tl.call(
      () => {
        if (this.orangeModel) {
          this.orangeModel.visible = false;
        }
      },
      null,
      1.5
    );
  }

  adjustLighting(progress) {
    // Dynamically adjust scene lighting based on scroll progress
    // This would require access to the scene lights

    const intensity = 0.8 + progress * 0.4; // Increase brightness
    const warmth = progress; // Increase warmth towards orange/logo

    // Example: adjust ambient light color temperature
    // (This would need to be connected to the actual lights in main.js)
  }

  updateModelVisibility(progress) {
    // Show/hide models based on scroll progress
    if (this.forestModel) {
      this.forestModel.visible = progress < 0.8; // Hide forest in final section
    }

    if (this.orangeModel && this.orangeModel.visible) {
      // Gently rotate orange while visible
      this.orangeModel.rotation.y += 0.01;
    }

    if (this.logoModel && this.logoModel.visible) {
      // Animate logo rotation
      this.logoModel.rotation.y += 0.02;
      this.logoModel.rotation.x = Math.sin(Date.now() * 0.001) * 0.1;
    }
  }

  /**
   * Reset all animations to initial state
   */
  reset() {
    this.camera.position.copy(this.initialCameraPosition);
    this.camera.rotation.copy(this.initialCameraRotation);

    if (this.forestModel) {
      this.forestModel.visible = true;
    }

    if (this.orangeModel) {
      this.orangeModel.visible = false;
      this.orangeModel.scale.set(1, 1, 1);
    }

    if (this.logoModel) {
      this.logoModel.visible = false;
      this.logoModel.scale.set(1, 1, 1);
    }

    this.currentProgress = 0;
    ScrollTrigger.refresh();
  }

  /**
   * Enable/disable scroll animations
   * @param {boolean} enabled - Whether to enable animations
   */
  setEnabled(enabled) {
    if (enabled) {
      ScrollTrigger.enable();
    } else {
      ScrollTrigger.disable();
    }
  }

  /**
   * Get current animation progress
   * @returns {number} - Current progress (0-1)
   */
  getProgress() {
    return this.currentProgress;
  }

  /**
   * Dispose of all scroll triggers
   */
  dispose() {
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
  }
}
