# Sakura Valley — Minecraft RTX Spring 3D Developer Portfolio

An interactive, physically-lit **3D Minecraft Spring World** built to showcase developer portfolio projects—powered by **React 19**, **Three.js / React Three Fiber v9**, **Rapier 3D WASM Physics**, **Custom GLSL Shaders**, and **Tailwind CSS v4**.

## Key Features

- **Authentic Minecraft Spring Biome & PBR Materials**: 18 procedural HD pixel-PBR materials synthesized offline with mathematical **Sobel tangent-space normal maps** & **physical roughness maps** (`grass_meadow`, `grass_side`, `birch_bark`, `birch_leaves`, `oak_leaves`, `azalea_bush`, `pink_cherry_planks`, `cobble_road`, `chiseled_quartz`, `sand_beach`), crisp volumetric Minecraft clouds, and 3 instant lighting presets (*Spring Morning*, *Golden Sunset*, *Starlit Night*).
- **Complete 264m×264m Gap-Free World & Landmarks**: Continuous 360° multi-tier voxel mountain horizon, climbable terraced **Spring Windmill Overlook Hill**, stepped grass-block knolls, Blossom Timber Trellis Archways, Oak post-and-rail fences, park benches, a Wooden River Pier with a moored Oak Rowboat, and a cozy flickering Campfire lounge.
- **Rich Spring Flora, Wildlife & Caustics River**: 54,000+ GPU-instanced wind-swaying 3D grass blades & 4,200 multi-species 3D spring wildflowers (tulips, poppies, dandelions, cornflowers, alliums, daisies) that part dynamically under footsteps and vehicle tires; 3 tree species (*Sakura Cherry* with Pink Petal carpets, *White Birch*, *Spring Oak* with hanging Golden Beehives), 12 buzzing Minecraft Voxel Bees, and an Emerald Spring River with Voronoi caustics, floating Lily Pads with Pink Water-Lilies, and 3 arched bridges.
- **Playable Character & 12 Obstacle-Avoiding Walking NPCs**: Unrestricted free-roam 3rd-person walking, sprinting (`Shift`), jumping (`Space`), automatic low-step climbing, and waving (`G`), alongside 6 project specialists and 6 valley visitors who greet you with interactive speech bubbles and steer smoothly around vehicles.
- **3 Driveable Spring Vehicles & Articulated Seated Kinematics**:
  - `[1]` **Sakura Trail 4x4 Safari** — Open-top field cruiser with tailgate spare tire & blossom cargo crate
  - `[2]` **Blossom GT Roadster** — Spring convertible sports tourer with twin headrests & rear GT wing
  - `[3]` **Meadow Breeze Scooter** — Step-through Vespa-style electric moped with wicker flower basket
  - Features 2-segment articulated driver legs resting naturally on footwell pedals/floorboards, hands gripping steering wheels/handlebars, `[F]` mount/dismount, `[Shift]` turbo boost, `[Space]` drift, and `[H]` horn.
- **6 Data-Driven Project Showcase Pavilions**: Stepped quartz stairs, cherry-wood flower planters, swaying hanging eave lanterns, live animated 640×360 3D display screens, glowing proximity pads, glassmorphic Case Study Modals, an **All Projects (6)** directory, and a 1-click Fast-Travel Radar Minimap.

## Quick Start

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:5173/` or `http://localhost:5173/`.

## Customizing Your Profile & Projects

1. **Identity & Social Links**: Edit [`src/config/profile.config.ts`](./src/config/profile.config.ts).
2. **Portfolio Projects & Specialist NPCs**: Edit [`src/config/projects.config.ts`](./src/config/projects.config.ts). Every entry automatically updates its 3D pavilion, live display screen, Minimap teleport pin, NPC specialist dialogue, and Case Study Modal.
3. **Vehicles, Bridges & Ambient Visitors**: Edit [`src/config/world.config.ts`](./src/config/world.config.ts).
