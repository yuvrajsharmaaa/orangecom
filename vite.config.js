import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  build: {
    outDir: "dist",
    assetsDir: "assets",
  },
  server: {
    hmr: {
      overlay: false,
    },
  },
  assetsInclude: ["**/*.glb", "**/*.gltf", "**/*.mp4"],
});
