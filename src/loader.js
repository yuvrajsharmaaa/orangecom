// loader.js - GLTFLoader wrapper with progress handling
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

export class AssetLoader {
  constructor() {
    this.loader = new GLTFLoader();
    this.textureLoader = new THREE.TextureLoader();
    this.loadedAssets = new Map();
  }

  /**
   * Load GLTF model with progress tracking
   * @param {string} url - Path to GLTF file
   * @param {function} onProgress - Progress callback (0-1)
   * @returns {Promise<THREE.Group>} - Loaded model
   */
  async loadGLTF(url, onProgress = null) {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (this.loadedAssets.has(url)) {
        if (onProgress) onProgress(1);
        resolve(this.loadedAssets.get(url).clone());
        return;
      }

      this.loader.load(
        url,
        // On success
        (gltf) => {
          const model = gltf.scene;

          // Optimize model
          this.optimizeModel(model);

          // Store in cache
          this.loadedAssets.set(url, model);

          if (onProgress) onProgress(1);
          resolve(model.clone());
        },
        // On progress
        (progress) => {
          if (onProgress && progress.lengthComputable) {
            const percentComplete = progress.loaded / progress.total;
            onProgress(percentComplete);
          }
        },
        // On error
        (error) => {
          console.error(`Failed to load GLTF: ${url}`, error);
          reject(error);
        }
      );
    });
  }

  /**
   * Load texture with progress tracking
   * @param {string} url - Path to texture file
   * @param {function} onProgress - Progress callback (0-1)
   * @returns {Promise<THREE.Texture>} - Loaded texture
   */
  async loadTexture(url, onProgress = null) {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (this.loadedAssets.has(url)) {
        if (onProgress) onProgress(1);
        resolve(this.loadedAssets.get(url));
        return;
      }

      this.textureLoader.load(
        url,
        // On success
        (texture) => {
          // Optimize texture
          this.optimizeTexture(texture);

          // Store in cache
          this.loadedAssets.set(url, texture);

          if (onProgress) onProgress(1);
          resolve(texture);
        },
        // On progress
        (progress) => {
          if (onProgress && progress.lengthComputable) {
            const percentComplete = progress.loaded / progress.total;
            onProgress(percentComplete);
          }
        },
        // On error
        (error) => {
          console.error(`Failed to load texture: ${url}`, error);
          reject(error);
        }
      );
    });
  }

  /**
   * Load multiple assets with combined progress
   * @param {Array} assets - Array of {type, url} objects
   * @param {function} onProgress - Combined progress callback (0-1)
   * @returns {Promise<Array>} - Array of loaded assets
   */
  async loadMultiple(assets, onProgress = null) {
    const results = [];
    let completedCount = 0;

    const promises = assets.map(async (asset, index) => {
      let result;

      if (asset.type === "gltf") {
        result = await this.loadGLTF(asset.url, (progress) => {
          if (onProgress) {
            const totalProgress = (completedCount + progress) / assets.length;
            onProgress(totalProgress);
          }
        });
      } else if (asset.type === "texture") {
        result = await this.loadTexture(asset.url, (progress) => {
          if (onProgress) {
            const totalProgress = (completedCount + progress) / assets.length;
            onProgress(totalProgress);
          }
        });
      }

      completedCount++;
      results[index] = result;
      return result;
    });

    return Promise.all(promises);
  }

  /**
   * Optimize loaded 3D model
   * @param {THREE.Group} model - Model to optimize
   */
  optimizeModel(model) {
    model.traverse((child) => {
      if (child.isMesh) {
        // Enable shadows
        child.castShadow = true;
        child.receiveShadow = true;

        // Optimize materials
        if (child.material) {
          // Enable vertex colors if available
          if (child.geometry.attributes.color) {
            child.material.vertexColors = true;
          }

          // Set material properties for better lighting
          if (child.material.isMeshStandardMaterial) {
            child.material.roughness = Math.max(child.material.roughness, 0.1);
            child.material.metalness = Math.min(child.material.metalness, 0.9);
          }
        }

        // Optimize geometry
        if (child.geometry) {
          child.geometry.computeBoundingBox();
          child.geometry.computeBoundingSphere();
        }
      }
    });
  }

  /**
   * Optimize loaded texture
   * @param {THREE.Texture} texture - Texture to optimize
   */
  optimizeTexture(texture) {
    // Set appropriate filtering
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;

    // Generate mipmaps
    texture.generateMipmaps = true;

    // Set wrapping
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;

    // Enable anisotropic filtering if supported
    const maxAnisotropy = 4; // Reasonable default
    texture.anisotropy = Math.min(maxAnisotropy, 16);
  }

  /**
   * Get cached asset
   * @param {string} url - Asset URL
   * @returns {any} - Cached asset or null
   */
  getCached(url) {
    return this.loadedAssets.get(url) || null;
  }

  /**
   * Clear asset cache
   */
  clearCache() {
    this.loadedAssets.clear();
  }

  /**
   * Get cache size
   * @returns {number} - Number of cached assets
   */
  getCacheSize() {
    return this.loadedAssets.size;
  }
}
