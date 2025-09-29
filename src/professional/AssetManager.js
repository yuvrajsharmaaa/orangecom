/**
 * AssetManager.js - Handles loading and management of 3D assets (GLB files)
 */

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

export class AssetManager {
  constructor(scene) {
    this.scene = scene;
    this.loader = new GLTFLoader();
    this.loadedAssets = new Map();
    this.loadingProgress = 0;
    this.totalAssets = 0;
    this.loadedCount = 0;

    // Asset definitions with paths and configurations
    this.assetDefinitions = {
      // Very small grass for ground cover
      grass: {
        path: "./assets/models/grass.glb",
        position: { x: 0, y: 0, z: 0 },
        scale: { x: 0.1, y: 0.05, z: 0.1 }, // Very small for ground cover
        rotation: { x: 0, y: 0, z: 0 },
      },
      // Skip trees - will create procedural trees instead
      // trees: {
      //   path: "./assets/models/trees/source/TreeAndGrassObject/Object And Texture/MissionGoGoPlants.glb",
      //   position: { x: 0, y: 0, z: 0 },
      //   scale: { x: 0.5, y: 0.5, z: 0.5 }, // Much smaller trees
      //   rotation: { x: 0, y: 0, z: 0 },
      // },
      // Use blue flower for foreground positioning (visible before video)
      blueFlower: {
        path: "./assets/models/flower/source/Blue_end.glb",
        position: { x: 0, y: 0.3, z: 5 }, // Moved to foreground (closer to camera)
        scale: { x: 2.5, y: 2.5, z: 2.5 }, // Larger size to match reference
        rotation: { x: 0, y: 0, z: 0 },
      },
    };

    // Create procedural pumpkins to match reference image (larger foreground pumpkins)
    this.pumpkinPositions = [
      // Foreground left cluster (close to camera like reference) - larger
      { x: -8, y: 0.2, z: 8, scale: 1.8 },
      { x: -6, y: 0.2, z: 10, scale: 1.5 },
      { x: -4, y: 0.2, z: 9, scale: 1.3 },
      { x: -10, y: 0.2, z: 6, scale: 1.6 },

      // Foreground right cluster (close to camera like reference) - larger
      { x: 6, y: 0.2, z: 8, scale: 1.9 },
      { x: 8, y: 0.2, z: 10, scale: 1.4 },
      { x: 10, y: 0.2, z: 7, scale: 1.2 },
      { x: 4, y: 0.2, z: 11, scale: 1.7 },

      // Middle ground scattered - medium size
      { x: -2, y: 0.2, z: 5, scale: 1.1 },
      { x: 1, y: 0.2, z: 6, scale: 0.9 },
      { x: 12, y: 0.2, z: 4, scale: 1.0 },
      { x: -12, y: 0.2, z: 3, scale: 1.2 },
    ];

    this.totalAssets = Object.keys(this.assetDefinitions).length;
  }

  /**
   * Load all assets with progress tracking
   * @param {Function} onProgress - Progress callback (0-1)
   * @returns {Promise} - Resolves when all assets are loaded
   */
  async loadAllAssets(onProgress = null) {
    const loadPromises = Object.entries(this.assetDefinitions).map(
      ([name, config]) => this.loadAsset(name, config, onProgress)
    );

    try {
      await Promise.all(loadPromises);
      this.setupScene();
      return this.loadedAssets;
    } catch (error) {
      console.error("Error loading assets:", error);
      throw error;
    }
  }

  /**
   * Load individual asset
   * @param {string} name - Asset name
   * @param {Object} config - Asset configuration
   * @param {Function} onProgress - Progress callback
   * @returns {Promise} - Resolves with loaded model
   */
  async loadAsset(name, config, onProgress = null) {
    return new Promise((resolve, reject) => {
      this.loader.load(
        config.path,
        (gltf) => {
          // Store the loaded model
          this.loadedAssets.set(name, {
            model: gltf.scene,
            config: config,
            animations: gltf.animations || [],
          });

          this.loadedCount++;
          this.loadingProgress = this.loadedCount / this.totalAssets;

          if (onProgress) {
            onProgress(this.loadingProgress);
          }

          console.log(`✓ Loaded: ${name}`);
          resolve(gltf.scene);
        },
        (progress) => {
          // Individual file progress - can be used for more detailed tracking
        },
        (error) => {
          console.error(`✗ Failed to load ${name}:`, error);
          reject(error);
        }
      );
    });
  }

  /**
   * Setup scene with loaded assets
   */
  setupScene() {
    // Create main scene groups for organization
    this.sceneGroups = {
      ground: new THREE.Group(),
      vegetation: new THREE.Group(),
      pumpkins: new THREE.Group(),
      fireflies: new THREE.Group(),
      effects: new THREE.Group(),
    };

    // Add groups to scene
    Object.values(this.sceneGroups).forEach((group) => {
      this.scene.add(group);
    });

    // Create natural ground plane
    this.createNaturalGround();

    // Create procedural pumpkins
    this.createPumpkins();

    // Position and configure each loaded asset
    this.loadedAssets.forEach((asset, name) => {
      const { model, config } = asset;

      // Apply transformations
      model.position.set(
        config.position.x,
        config.position.y,
        config.position.z
      );
      model.scale.set(config.scale.x, config.scale.y, config.scale.z);
      model.rotation.set(
        config.rotation.x,
        config.rotation.y,
        config.rotation.z
      );

      // Configure shadows and materials
      model.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;

          // Enhance materials for better lighting and remove any dark filters
          if (child.material) {
            child.material.needsUpdate = true;
            // Dramatically brighten materials
            if (child.material.color) {
              child.material.color.multiplyScalar(2.5); // Brighten by 150%
            }
            // Add emissive light to make materials glow slightly
            if (child.material.emissive) {
              child.material.emissive.setHex(0x111111);
            }
            // Make materials more reflective
            if (child.material.metalness !== undefined) {
              child.material.metalness = 0.1;
              child.material.roughness = 0.7;
            }
          }
        }
      });

      // Add to appropriate group and create realistic distributions
      if (name === "grass") {
        // Create dense grass coverage for ground
        this.createRealisticGrassGround(model);
      } else if (name === "blueFlower") {
        this.sceneGroups.vegetation.add(model);
        // Create smaller blue flowers scattered around
        this.createRealisticFlowerDistribution(model);
      }
    });

    // Create procedural trees since we don't have GLB files
    this.createProceduralTrees();

    // Position scene groups
    this.sceneGroups.ground.position.y = 0;
    this.sceneGroups.vegetation.position.y = 0;
    this.sceneGroups.pumpkins.position.y = 0;
    this.sceneGroups.fireflies.position.y = 2;

    console.log("✓ Scene setup complete");
  }

  /**
   * Create realistic forest floor matching reference image
   */
  createNaturalGround() {
    // Create main dark forest floor to match reference
    const forestFloorGeometry = new THREE.PlaneGeometry(200, 200);
    const forestFloorMaterial = new THREE.MeshLambertMaterial({
      color: 0x0a1a0a, // Darker forest green to match reference image
      transparent: false,
    });

    const forestFloor = new THREE.Mesh(
      forestFloorGeometry,
      forestFloorMaterial
    );
    forestFloor.rotation.x = -Math.PI / 2;
    forestFloor.position.y = 0;
    forestFloor.receiveShadow = true;

    this.sceneGroups.ground.add(forestFloor);

    // Add some subtle ground texture patches
    for (let i = 0; i < 10; i++) {
      const patchGeometry = new THREE.CircleGeometry(Math.random() * 3 + 1, 8);
      const patchMaterial = new THREE.MeshLambertMaterial({
        color: new THREE.Color().setHSL(0.25, 0.6, 0.12 + Math.random() * 0.06),
      });
      const patch = new THREE.Mesh(patchGeometry, patchMaterial);
      patch.rotation.x = -Math.PI / 2;
      patch.position.set(
        (Math.random() - 0.5) * 100,
        0.01,
        (Math.random() - 0.5) * 100
      );
      this.sceneGroups.ground.add(patch);
    }

    console.log("✓ Realistic forest floor with visible grass created");
  }

  /**
   * Create procedural pumpkin models
   */
  createPumpkins() {
    this.pumpkinPositions.forEach((pos, index) => {
      const pumpkin = this.createPumpkinGeometry();
      pumpkin.position.set(pos.x, pos.y, pos.z);
      pumpkin.scale.setScalar(pos.scale);

      // Add some random rotation
      pumpkin.rotation.y = Math.random() * Math.PI * 2;

      this.sceneGroups.pumpkins.add(pumpkin);
    });

    console.log("✓ Procedural pumpkins created");
  }

  /**
   * Create a single pumpkin geometry
   */
  createPumpkinGeometry() {
    const pumpkinGroup = new THREE.Group();

    // Main pumpkin body - bright orange sphere with vertical segments
    const bodyGeometry = new THREE.SphereGeometry(1, 16, 8);
    const bodyMaterial = new THREE.MeshLambertMaterial({
      color: 0xff9500, // Brighter orange
      emissive: 0x331100, // Add warm glow
    });

    // Modify geometry for pumpkin ridges
    const bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
    bodyMesh.scale.set(1, 0.8, 1); // Flatten slightly
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;

    // Pumpkin stem - brighter brown
    const stemGeometry = new THREE.CylinderGeometry(0.1, 0.15, 0.3, 8);
    const stemMaterial = new THREE.MeshLambertMaterial({
      color: 0xcd853f, // Brighter brown
      emissive: 0x221100,
    });
    const stem = new THREE.Mesh(stemGeometry, stemMaterial);
    stem.position.y = 0.9;
    stem.castShadow = true;

    // Pumpkin leaves - brighter green
    const leafGeometry = new THREE.PlaneGeometry(0.3, 0.5);
    const leafMaterial = new THREE.MeshLambertMaterial({
      color: 0x32cd32, // Bright green
      emissive: 0x001100,
      side: THREE.DoubleSide,
    });

    // Create a few leaves
    for (let i = 0; i < 3; i++) {
      const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
      leaf.position.set(
        Math.cos((i * Math.PI * 2) / 3) * 0.3,
        0.7,
        Math.sin((i * Math.PI * 2) / 3) * 0.3
      );
      leaf.rotation.z = Math.random() * 0.5 - 0.25;
      leaf.rotation.y = (i * Math.PI * 2) / 3;
      leaf.castShadow = true;
      pumpkinGroup.add(leaf);
    }

    pumpkinGroup.add(bodyMesh);
    pumpkinGroup.add(stem);

    return pumpkinGroup;
  }

  /**
   * Get loaded asset by name
   * @param {string} name - Asset name
   * @returns {Object|null} - Asset object or null if not found
   */
  getAsset(name) {
    return this.loadedAssets.get(name) || null;
  }

  /**
   * Get all assets in a category
   * @param {string} category - Category name (ground, vegetation, fireflies, effects)
   * @returns {THREE.Group} - Scene group
   */
  getSceneGroup(category) {
    return this.sceneGroups[category] || null;
  }

  /**
   * Clone an asset for reuse
   * @param {string} name - Asset name to clone
   * @returns {THREE.Object3D|null} - Cloned model
   */
  cloneAsset(name) {
    const asset = this.getAsset(name);
    if (asset) {
      return asset.model.clone();
    }
    return null;
  }

  /**
   * Update asset visibility based on scroll progress
   * @param {number} progress - Scroll progress (0-1)
   */
  updateVisibility(progress) {
    // Forest floor and flowers are always visible from the start
    const flowerAsset = this.getAsset("blueFlower");
    if (flowerAsset) {
      // Flowers are always visible (before video starts)
      flowerAsset.model.visible = true;

      // Keep flowers at their original scale (no animation needed)
      flowerAsset.model.scale.set(2.5, 2.5, 2.5);
    }
  }

  /**
   * Create procedural trees for forest background
   */
  createProceduralTrees() {
    const treePositions = [
      // Background forest line
      { x: -35, z: -25, scale: 0.3, height: 8 },
      { x: -20, z: -30, scale: 0.25, height: 6 },
      { x: -5, z: -32, scale: 0.28, height: 7 },
      { x: 10, z: -30, scale: 0.22, height: 5 },
      { x: 25, z: -28, scale: 0.32, height: 9 },
      { x: 40, z: -25, scale: 0.28, height: 7 },

      // Side trees for depth
      { x: -45, z: -10, scale: 0.35, height: 10 },
      { x: -42, z: 5, scale: 0.25, height: 6 },
      { x: 45, z: -8, scale: 0.3, height: 8 },
      { x: 42, z: 8, scale: 0.28, height: 7 },

      // Far background
      { x: -50, z: -45, scale: 0.4, height: 12 },
      { x: 0, z: -50, scale: 0.35, height: 10 },
      { x: 50, z: -45, scale: 0.38, height: 11 },
    ];

    treePositions.forEach((treePos) => {
      const tree = this.createSimpleTree(treePos.height, treePos.scale);
      tree.position.set(treePos.x, 0, treePos.z);
      tree.rotation.y = Math.random() * Math.PI * 2;
      this.sceneGroups.vegetation.add(tree);
    });

    console.log("✓ Procedural trees created");
  }

  /**
   * Create a simple tree using cylinder and sphere geometry
   */
  createSimpleTree(height = 8, scaleMultiplier = 1) {
    const tree = new THREE.Group();

    // Tree trunk
    const trunkGeometry = new THREE.CylinderGeometry(
      0.3 * scaleMultiplier,
      0.5 * scaleMultiplier,
      height * scaleMultiplier,
      8
    );
    const trunkMaterial = new THREE.MeshLambertMaterial({
      color: 0x4a4a2a, // Dark brown
    });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = (height * scaleMultiplier) / 2;
    tree.add(trunk);

    // Tree foliage (multiple spheres for natural look)
    const foliageColors = [0x0d4f0d, 0x1a5f1a, 0x266f26]; // Dark greens

    for (let i = 0; i < 3; i++) {
      const foliageGeometry = new THREE.SphereGeometry(
        (2 + Math.random()) * scaleMultiplier,
        12,
        8
      );
      const foliageMaterial = new THREE.MeshLambertMaterial({
        color: foliageColors[i % foliageColors.length],
      });
      const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);

      foliage.position.set(
        (Math.random() - 0.5) * scaleMultiplier,
        height * scaleMultiplier + (Math.random() - 0.5) * scaleMultiplier,
        (Math.random() - 0.5) * scaleMultiplier
      );

      tree.add(foliage);
    }

    return tree;
  }

  /**
   * Create realistic grass ground cover using grass.glb
   */
  createRealisticGrassGround(grassModel) {
    // Create dense forest floor coverage like reference image
    const grassPositions = [];

    // Create dense, continuous grass coverage for forest floor
    for (let x = -50; x <= 50; x += 4) {
      // Denser spacing for continuous coverage
      for (let z = -10; z <= 25; z += 3) {
        // Dense coverage in viewing area
        // Much higher fill rate for continuous forest floor
        if (Math.random() > 0.2) {
          // 80% coverage for continuous look
          grassPositions.push({
            x: x + (Math.random() - 0.5) * 3, // Some variation
            z: z + (Math.random() - 0.5) * 2,
            scale: 0.12 + Math.random() * 0.06, // Larger 0.12-0.18 for ground coverage
            rotation: Math.random() * Math.PI * 2,
          });
        }
      }
    }

    // Add extra dense patches in foreground areas
    const foregroundPatches = [
      { centerX: -15, centerZ: 12, radius: 8 },
      { centerX: 15, centerZ: 10, radius: 6 },
      { centerX: 0, centerZ: 15, radius: 7 },
      { centerX: -25, centerZ: 5, radius: 5 },
      { centerX: 25, centerZ: 8, radius: 5 },
    ];

    foregroundPatches.forEach((patch) => {
      for (let i = 0; i < 15; i++) {
        // 15 grass pieces per patch
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * patch.radius;
        const x = patch.centerX + Math.cos(angle) * distance;
        const z = patch.centerZ + Math.sin(angle) * distance;

        grassPositions.push({
          x: x,
          z: z,
          scale: 0.1 + Math.random() * 0.08, // 0.10-0.18 for patch density
          rotation: Math.random() * Math.PI * 2,
        });
      }
    });

    grassPositions.forEach((grassPos) => {
      const grassClone = grassModel.clone();
      grassClone.position.set(grassPos.x, 0, grassPos.z);
      grassClone.scale.setScalar(grassPos.scale);
      grassClone.rotation.y = grassPos.rotation;

      // Slightly embed in ground for natural look
      grassClone.position.y = -0.02;
      this.sceneGroups.ground.add(grassClone);
    });

    console.log("✓ Dense forest floor grass coverage created");
  }

  /**
   * Create realistic flower distribution for natural look
   */
  createRealisticFlowerDistribution(flowerModel) {
    const foregroundFlowerPositions = [
      // Foreground flowers (closer to camera like reference image)
      { x: -12, z: 8, scale: 0.6, rotation: 0 },
      { x: -6, z: 12, scale: 0.5, rotation: Math.PI / 4 },
      { x: 8, z: 10, scale: 0.7, rotation: Math.PI / 2 },
      { x: 15, z: 6, scale: 0.55, rotation: Math.PI },
      { x: -18, z: 4, scale: 0.65, rotation: Math.PI * 1.3 },
      { x: 3, z: 15, scale: 0.6, rotation: Math.PI * 0.7 },

      // Additional foreground flowers for reference match
      { x: -25, z: 2, scale: 0.5, rotation: Math.PI / 6 },
      { x: 22, z: 3, scale: 0.58, rotation: Math.PI * 1.8 },
      { x: -8, z: 18, scale: 0.52, rotation: Math.PI * 0.3 },
      { x: 12, z: 14, scale: 0.62, rotation: Math.PI * 1.5 },
    ];

    foregroundFlowerPositions.forEach((flowerPos) => {
      const flowerClone = flowerModel.clone();
      flowerClone.position.set(flowerPos.x, 0.2, flowerPos.z);
      flowerClone.scale.setScalar(flowerPos.scale);
      flowerClone.rotation.y = flowerPos.rotation;

      // Add some random height variation
      flowerClone.position.y += Math.random() * 0.05;
      this.sceneGroups.vegetation.add(flowerClone);
    });

    console.log("✓ Foreground flower distribution created");
  }

  /**
   * Dispose of all loaded assets
   */
  dispose() {
    this.loadedAssets.forEach((asset) => {
      asset.model.traverse((child) => {
        if (child.geometry) {
          child.geometry.dispose();
        }
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((material) => material.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
    });

    this.loadedAssets.clear();
    console.log("✓ Assets disposed");
  }
}
