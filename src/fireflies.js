// fireflies.js - Firefly particle system using THREE.Points
export class FireflySystem {
  constructor(scene, count = 50) {
    this.scene = scene;
    this.count = count;

    // Particle system components
    this.geometry = null;
    this.material = null;
    this.points = null;

    // Animation properties
    this.positions = new Float32Array(count * 3);
    this.velocities = new Float32Array(count * 3);
    this.phases = new Float32Array(count);
    this.sizes = new Float32Array(count);
    this.opacity = new Float32Array(count);

    // Timing
    this.time = 0;

    this.init();
  }

  init() {
    this.createGeometry();
    this.createMaterial();
    this.createPoints();
    this.initializeParticles();
  }

  createGeometry() {
    this.geometry = new THREE.BufferGeometry();

    // Initialize positions array
    for (let i = 0; i < this.count; i++) {
      const i3 = i * 3;

      // Spread fireflies in a natural area
      this.positions[i3] = (Math.random() - 0.5) * 20; // x
      this.positions[i3 + 1] = Math.random() * 8 + 1; // y (1-9)
      this.positions[i3 + 2] = (Math.random() - 0.5) * 20; // z
    }

    this.geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(this.positions, 3)
    );
  }

  createMaterial() {
    // Create firefly texture (glowing circle)
    const canvas = document.createElement("canvas");
    const size = 64;
    canvas.width = size;
    canvas.height = size;

    const context = canvas.getContext("2d");
    const gradient = context.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2
    );

    gradient.addColorStop(0, "rgba(255, 255, 120, 1)");
    gradient.addColorStop(0.2, "rgba(255, 255, 80, 0.8)");
    gradient.addColorStop(0.4, "rgba(255, 200, 50, 0.4)");
    gradient.addColorStop(1, "rgba(255, 150, 0, 0)");

    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);

    const texture = new THREE.CanvasTexture(canvas);

    this.material = new THREE.PointsMaterial({
      map: texture,
      size: 0.8,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: false,
    });
  }

  createPoints() {
    this.points = new THREE.Points(this.geometry, this.material);
    this.scene.add(this.points);
  }

  initializeParticles() {
    for (let i = 0; i < this.count; i++) {
      const i3 = i * 3;

      // Random movement velocities
      this.velocities[i3] = (Math.random() - 0.5) * 0.02; // x velocity
      this.velocities[i3 + 1] = (Math.random() - 0.5) * 0.01; // y velocity
      this.velocities[i3 + 2] = (Math.random() - 0.5) * 0.02; // z velocity

      // Random phases for pulsing animation
      this.phases[i] = Math.random() * Math.PI * 2;

      // Random sizes
      this.sizes[i] = 0.5 + Math.random() * 0.5;

      // Random opacity
      this.opacity[i] = 0.3 + Math.random() * 0.7;
    }
  }

  update() {
    this.time += 0.016; // Approximately 60fps

    const positions = this.geometry.attributes.position.array;

    for (let i = 0; i < this.count; i++) {
      const i3 = i * 3;

      // Update positions with smooth movement
      positions[i3] += this.velocities[i3];
      positions[i3 + 1] += this.velocities[i3 + 1];
      positions[i3 + 2] += this.velocities[i3 + 2];

      // Add floating motion
      const phase = this.phases[i] + this.time * 0.5;
      positions[i3 + 1] += Math.sin(phase) * 0.003;
      positions[i3] += Math.cos(phase * 0.7) * 0.002;
      positions[i3 + 2] += Math.sin(phase * 0.3) * 0.002;

      // Boundary wrapping
      if (positions[i3] > 10) positions[i3] = -10;
      if (positions[i3] < -10) positions[i3] = 10;
      if (positions[i3 + 2] > 10) positions[i3 + 2] = -10;
      if (positions[i3 + 2] < -10) positions[i3 + 2] = 10;

      // Keep fireflies above ground
      if (positions[i3 + 1] < 1) positions[i3 + 1] = 8;
      if (positions[i3 + 1] > 9) positions[i3 + 1] = 1;

      // Occasionally change direction
      if (Math.random() < 0.005) {
        this.velocities[i3] = (Math.random() - 0.5) * 0.02;
        this.velocities[i3 + 1] = (Math.random() - 0.5) * 0.01;
        this.velocities[i3 + 2] = (Math.random() - 0.5) * 0.02;
      }
    }

    // Update pulsing opacity
    const pulseIntensity = 0.3 + 0.4 * Math.sin(this.time * 2);
    this.material.opacity = pulseIntensity;

    // Mark positions as needing update
    this.geometry.attributes.position.needsUpdate = true;
  }

  /**
   * Set firefly behavior based on scroll progress
   * @param {number} progress - Scroll progress (0-1)
   */
  setScrollProgress(progress) {
    // Adjust firefly behavior based on scroll
    if (progress < 0.3) {
      // Forest section - more active
      this.material.size = 0.8 + Math.sin(this.time * 3) * 0.2;
      this.material.opacity = 0.8 + Math.sin(this.time * 2) * 0.2;
    } else if (progress < 0.6) {
      // Orange section - gather around center
      this.attractToPoint(2, 0, -3, 0.001);
      this.material.size = 1.0;
      this.material.opacity = 0.9;
    } else {
      // Logo section - celebratory movement
      this.material.size = 1.2 + Math.sin(this.time * 4) * 0.3;
      this.material.opacity = 1.0;
    }
  }

  /**
   * Attract fireflies to a specific point
   * @param {number} x - Target x position
   * @param {number} y - Target y position
   * @param {number} z - Target z position
   * @param {number} strength - Attraction strength
   */
  attractToPoint(x, y, z, strength = 0.001) {
    const positions = this.geometry.attributes.position.array;

    for (let i = 0; i < this.count; i++) {
      const i3 = i * 3;

      // Calculate direction to target
      const dx = x - positions[i3];
      const dy = y - positions[i3 + 1];
      const dz = z - positions[i3 + 2];

      // Apply attraction force
      this.velocities[i3] += dx * strength;
      this.velocities[i3 + 1] += dy * strength;
      this.velocities[i3 + 2] += dz * strength;

      // Limit velocity
      const maxVel = 0.05;
      this.velocities[i3] = Math.max(
        -maxVel,
        Math.min(maxVel, this.velocities[i3])
      );
      this.velocities[i3 + 1] = Math.max(
        -maxVel,
        Math.min(maxVel, this.velocities[i3 + 1])
      );
      this.velocities[i3 + 2] = Math.max(
        -maxVel,
        Math.min(maxVel, this.velocities[i3 + 2])
      );
    }
  }

  /**
   * Reset fireflies to random positions
   */
  reset() {
    const positions = this.geometry.attributes.position.array;

    for (let i = 0; i < this.count; i++) {
      const i3 = i * 3;

      positions[i3] = (Math.random() - 0.5) * 20;
      positions[i3 + 1] = Math.random() * 8 + 1;
      positions[i3 + 2] = (Math.random() - 0.5) * 20;

      this.velocities[i3] = (Math.random() - 0.5) * 0.02;
      this.velocities[i3 + 1] = (Math.random() - 0.5) * 0.01;
      this.velocities[i3 + 2] = (Math.random() - 0.5) * 0.02;
    }

    this.geometry.attributes.position.needsUpdate = true;
  }

  /**
   * Dispose of resources
   */
  dispose() {
    if (this.geometry) this.geometry.dispose();
    if (this.material) this.material.dispose();
    if (this.points && this.scene) this.scene.remove(this.points);
  }
}
