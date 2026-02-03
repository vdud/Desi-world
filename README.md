# 🌐 My Metaverse

Welcome to **My Metaverse**, a cutting-edge 3D virtual world built on modern web technologies. This project is a template for creating immersive, interactive, and performant metaverse experiences that run directly in the browser.

> This project showcases a traversable 3D world with a player character, physics-based interactions, and dynamically loaded assets, all rendered in real-time.

---

## ✨ Features

- **🚶‍♂️ Third-Person Player Controller:** Navigate the world with a ready-to-use third-person character controller.
- ** keyboard and on-screen joystick support.**
- **⚡ Physics-Based World:** Powered by **Rapier**, the world supports realistic physics interactions for solid, dynamic, and kinematic bodies.
- ** optimizing performance and memory usage.**
- **🌇 Dynamic Environment:** The scene features a beautiful skybox and dynamic directional lighting with soft shadows.
- **🧱 Modular Architecture:** The codebase is organized into reusable Svelte components, making it easy to extend and customize.
- **🌐 WebXR Ready:** With `@threlte/xr`, the project is structured to easily add Virtual and Augmented Reality support.

---

## 🛠️ Key Technologies

- **[SvelteKit](https://kit.svelte.dev/):** A powerful application framework for building high-performance web apps.
- **[Threlte](https://threlte.xyz/):** A Svelte renderer and component library for Three.js, offering a declarative Svelte-native API.
- **[Three.js](https://threejs.org/):** The core 3D graphics library for creating and displaying animated 3D computer graphics in a web browser.
- **[Rapier](https://rapier.rs/):** A fast and lightweight 3D physics engine written in Rust, compiled to WebAssembly.
- **[Theatre.js](https://www.theatrejs.com/):** A JavaScript animation library for creating high-fidelity motion graphics.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18 or higher)
- [pnpm](https://pnpm.io/installation)

### Developing

Once you've cloned the repository and installed dependencies with `pnpm install`, start the development server:

```sh
pnpm run dev

# or start the server and open the app in a new browser tab
pnpm run dev -- --open
```

### Building for Production

To create a production version of your app:

```sh
pnpm run build
```

You can preview the production build with `pnpm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.

---

## 📂 Project Structure

A brief overview of the key files and directories in this project.

```
/
├─── src/
│    ├─── lib/
│    │    ├─── components/       # Core Svelte components
│    │    │    ├─── Player/      # Player character and controller
│    │    │    ├─── models/      # 3D model Svelte components
│    │    │    └─── Scene.svelte # Main 3D scene composition
│    │    └─── stores/           # Svelte stores for state management
│    └─── routes/               # SvelteKit page routes
└─── static/
     ├─── models/               # Raw 3D models (.glb, .gltf)
     └─── hdr.exr                # High Dynamic Range image for environment lighting
```
