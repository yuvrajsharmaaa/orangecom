# 3D Models Directory

Place your `.glb` or `.gltf` files in this folder:

## Required Models:

- `forest.glb` - Forest scene with trees and environment
- `orange.glb` - 3D orange model for transformation
- `logo.glb` - Your company logo as 3D model

## Model Guidelines:

- **Format**: Use `.glb` (preferred) or `.gltf`
- **Size**: Keep under 10MB per model
- **Scale**: Models should be 1-5 units in size
- **Origin**: Center models at (0,0,0)
- **Optimization**: Use compressed textures and low-poly meshes for web

## Blender Export Settings:

1. Select all objects to export
2. File → Export → glTF 2.0 (.glb)
3. Enable: "Selected Objects" (if needed)
4. Enable: "Apply Modifiers"
5. Enable: "UVs", "Normals", "Materials"
6. Format: "glTF Binary (.glb)"

Your models will be automatically loaded by the application.
