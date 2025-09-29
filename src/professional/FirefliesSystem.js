/**
 * FirefliesSystem.js - Manages animated firefly particles using THREE.Points
 */

import * as THREE from "three";

export class FirefliesSystem {
  constructor(scene, assetManager) {
    this.scene = scene;
    this.assetManager = assetManager;
    this.fireflies = null;
    this.fireflyGeometry = null;
    this.fireflyMaterial = null;
    this.fireflyCount = 200;
    this.time = 0;

    // Animation parameters
    this.speed = 0.5;
    this.amplitude = 2;
    this.glowIntensity = 1;

    this.init();
  }

  init() {
    this.createFireflyParticles();
    this.createFireflyShader();
  }

  createFireflyParticles() {
    // Create BufferGeometry for firefly particles
    this.fireflyGeometry = new THREE.BufferGeometry();

    // Arrays to hold particle attributes
    const positions = new Float32Array(this.fireflyCount * 3);
    const scales = new Float32Array(this.fireflyCount);
    const phases = new Float32Array(this.fireflyCount);
    const velocities = new Float32Array(this.fireflyCount * 3);

    // Initialize each firefly particle
    for (let i = 0; i < this.fireflyCount; i++) {
      const i3 = i * 3;

      // Random position within forest bounds
      positions[i3] = (Math.random() - 0.5) * 40; // x
      positions[i3 + 1] = Math.random() * 15 + 2; // y (2-17 units high)
      positions[i3 + 2] = (Math.random() - 0.5) * 40; // z

      // Random scale for size variation
      scales[i] = Math.random() * 0.5 + 0.3; // 0.3 to 0.8

      // Random phase for pulsating animation
      phases[i] = Math.random() * Math.PI * 2;

      // Random velocity for movement
      velocities[i3] = (Math.random() - 0.5) * 0.02; // x velocity
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.01; // y velocity
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.02; // z velocity
    }

    // Set attributes
    this.fireflyGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    this.fireflyGeometry.setAttribute(
      "scale",
      new THREE.BufferAttribute(scales, 1)
    );
    this.fireflyGeometry.setAttribute(
      "phase",
      new THREE.BufferAttribute(phases, 1)
    );
    this.fireflyGeometry.setAttribute(
      "velocity",
      new THREE.BufferAttribute(velocities, 3)
    );
  }

  createFireflyShader() {
    // Custom shader material for glowing fireflies - RED color like in reference
    this.fireflyMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        glowIntensity: { value: this.glowIntensity },
        color: { value: new THREE.Color(0xff3333) }, // Bright red color
      },
      vertexShader: `
                attribute float scale;
                attribute float phase;
                uniform float time;
                varying float vAlpha;
                varying vec2 vUv;

                void main() {
                    vUv = uv;
                    
                    // Pulsating alpha based on time and phase
                    vAlpha = 0.3 + 0.7 * sin(time * 2.0 + phase);
                    
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    
                    // Larger size for more visible fireflies
                    gl_PointSize = scale * 400.0 / (-mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
      fragmentShader: `
                uniform vec3 color;
                uniform float glowIntensity;
                varying float vAlpha;
                varying vec2 vUv;

                void main() {
                    // Create circular glow effect with stronger core
                    float distance = length(gl_PointCoord - vec2(0.5));
                    float alpha = 1.0 - smoothstep(0.0, 0.5, distance);
                    
                    // Create bright core
                    float core = 1.0 - smoothstep(0.0, 0.2, distance);
                    
                    // Apply pulsating alpha and glow
                    alpha *= vAlpha * glowIntensity;
                    core *= vAlpha;
                    
                    // Bright red firefly color with intense glow
                    vec3 finalColor = color * (1.0 + core * 3.0);
                    
                    gl_FragColor = vec4(finalColor, alpha);
                }
            `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    // Create Points object
    this.fireflies = new THREE.Points(
      this.fireflyGeometry,
      this.fireflyMaterial
    );
    this.scene.add(this.fireflies);
  }

  /**
   * Update firefly animation
   * @param {number} deltaTime - Time since last frame
   */
  update(deltaTime) {
    this.time += deltaTime * this.speed;

    // Update shader uniforms
    this.fireflyMaterial.uniforms.time.value = this.time;

    // Update particle positions for floating movement
    const positions = this.fireflyGeometry.attributes.position.array;
    const velocities = this.fireflyGeometry.attributes.velocity.array;
    const phases = this.fireflyGeometry.attributes.phase.array;

    for (let i = 0; i < this.fireflyCount; i++) {
      const i3 = i * 3;

      // Sine wave movement for natural floating
      positions[i3] += velocities[i3] + Math.sin(this.time + phases[i]) * 0.01;
      positions[i3 + 1] +=
        velocities[i3 + 1] + Math.cos(this.time * 0.7 + phases[i]) * 0.005;
      positions[i3 + 2] +=
        velocities[i3 + 2] + Math.sin(this.time * 0.8 + phases[i]) * 0.01;

      // Keep fireflies within bounds
      if (Math.abs(positions[i3]) > 20) {
        velocities[i3] *= -1;
      }
      if (positions[i3 + 1] < 1 || positions[i3 + 1] > 16) {
        velocities[i3 + 1] *= -1;
      }
      if (Math.abs(positions[i3 + 2]) > 20) {
        velocities[i3 + 2] *= -1;
      }
    }

    // Update geometry
    this.fireflyGeometry.attributes.position.needsUpdate = true;
  }

  /**
   * Adjust firefly intensity based on scroll progress
   * @param {number} progress - Scroll progress (0-1)
   */
  updateIntensity(progress) {
    // Fireflies are most active at the beginning, fade towards the end
    const intensity = Math.max(0.2, 1 - progress * 0.8);
    this.fireflyMaterial.uniforms.glowIntensity.value = intensity;

    // Also adjust overall opacity
    this.fireflies.material.opacity = intensity;
  }

  /**
   * Set firefly color
   * @param {THREE.Color} color - New firefly color
   */
  setColor(color) {
    this.fireflyMaterial.uniforms.color.value = color;
  }

  /**
   * Add interactive fireflies around a specific position
   * @param {THREE.Vector3} position - Position to spawn fireflies around
   * @param {number} count - Number of fireflies to spawn
   */
  spawnFirefliesAt(position, count = 20) {
    const newPositions = this.fireflyGeometry.attributes.position.array;
    const startIndex = Math.max(0, this.fireflyCount - count);

    for (let i = startIndex; i < this.fireflyCount; i++) {
      const i3 = i * 3;

      // Spawn around the target position with some randomness
      newPositions[i3] = position.x + (Math.random() - 0.5) * 5;
      newPositions[i3 + 1] = position.y + (Math.random() - 0.5) * 3;
      newPositions[i3 + 2] = position.z + (Math.random() - 0.5) * 5;
    }

    this.fireflyGeometry.attributes.position.needsUpdate = true;
  }

  /**
   * Get firefly system for external manipulation
   */
  getFireflies() {
    return this.fireflies;
  }

  /**
   * Dispose of firefly resources
   */
  dispose() {
    if (this.fireflyGeometry) {
      this.fireflyGeometry.dispose();
    }
    if (this.fireflyMaterial) {
      this.fireflyMaterial.dispose();
    }
    if (this.fireflies) {
      this.scene.remove(this.fireflies);
    }
  }
}
