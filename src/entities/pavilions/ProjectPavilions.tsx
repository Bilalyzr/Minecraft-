import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { CuboidCollider, RigidBody } from '@react-three/rapier';
import { Html } from '@react-three/drei';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { type PortfolioProject } from '../../config/projects.config';
import { getPBRBlockMaps } from '../../textures/pbrTextures';
import { createProjectScreenHandle } from '../../textures/projectScreenRenderer';
import { useWorldStore } from '../../store/useWorldStore';
import { isTypingInInput } from '../../core/cameraState';
import { soundEngine } from '../../audio/soundEngine';

function SinglePavilion({ project }: { project: PortfolioProject }) {
  const nearbyProjectId = useWorldStore((s) => s.nearbyProjectId);
  const timeOfDay = useWorldStore((s) => s.timeOfDay);
  const openProjectModal = useWorldStore((s) => s.openProjectModal);

  const isActive = nearbyProjectId === project.id;
  const [showHeaderLabel, setShowHeaderLabel] = useState(true);
  const camDirHelper = useMemo(() => new THREE.Vector3(), []);
  const toObjHelper = useMemo(() => new THREE.Vector3(), []);

  const quartzMaps = useMemo(() => getPBRBlockMaps('chiseled_quartz', 3, 2), []);
  const oakMaps = useMemo(() => getPBRBlockMaps('oak_planks', 4, 2), []);
  const cherryPlankMaps = useMemo(() => getPBRBlockMaps('pink_cherry_planks', 4, 2), []);
  const slateMaps = useMemo(() => getPBRBlockMaps('dark_slate', 4, 2), []);
  const mossyMaps = useMemo(() => getPBRBlockMaps('mossy_stone', 4, 2), []);
  const stonePathMaps = useMemo(() => getPBRBlockMaps('stone_path', 3, 2), []);
  const blossomMaps = useMemo(() => getPBRBlockMaps('sakura_blossom', 3, 2), []);
  const azaleaMaps = useMemo(() => getPBRBlockMaps('azalea_bush', 2, 2), []);
  const grassMaps = useMemo(() => getPBRBlockMaps('grass_meadow', 2, 1), []);
  const lanternMaps = useMemo(() => getPBRBlockMaps('sea_lantern', 1, 1), []);

  const screenHandle = useMemo(() => createProjectScreenHandle(project), [project]);
  useEffect(() => {
    return () => screenHandle.dispose();
  }, [screenHandle]);

  const techCubesRef = useRef<THREE.Group>(null);
  const lanternsGroupRef = useRef<THREE.Group>(null);
  const padRingRef = useRef<THREE.Mesh>(null);
  const cubeGeo = useMemo(() => new RoundedBoxGeometry(0.56, 0.56, 0.56, 2, 0.06), []);

  useFrame(({ clock, camera }) => {
    const t = clock.getElapsedTime();
    const [px, , pz] = useWorldStore.getState().playerPosition;
    const distToPavilion = Math.hypot(px - project.position[0], pz - project.position[2]);

    camera.getWorldDirection(camDirHelper);
    toObjHelper.set(
      project.position[0] - camera.position.x,
      project.position[1] + 6 - camera.position.y,
      project.position[2] - camera.position.z
    );
    const inFront = toObjHelper.dot(camDirHelper) > 2.5 && toObjHelper.length() < 78;
    if (inFront !== showHeaderLabel) {
      setShowHeaderLabel(inFront);
    }

    // Animate canvas texture when player is within 75m
    if (distToPavilion < 75) {
      screenHandle.update(t);
    }

    if (techCubesRef.current) {
      techCubesRef.current.children.forEach((c, idx) => {
        c.rotation.y = t * 0.9 + idx * 1.1;
        c.rotation.x = Math.sin(t * 1.2 + idx) * 0.25;
        c.position.y = 1.92 + Math.sin(t * 2.0 + idx * 0.9) * 0.16;
      });
    }

    // Gentle spring breeze sway on hanging corner lanterns
    if (lanternsGroupRef.current) {
      lanternsGroupRef.current.children.forEach((l, idx) => {
        l.rotation.z = Math.sin(t * 1.6 + idx * 1.3) * 0.045;
        l.rotation.x = Math.cos(t * 1.3 + idx * 0.9) * 0.035;
      });
    }

    if (padRingRef.current) {
      const pulse = 1 + Math.sin(t * 3.8) * 0.045;
      padRingRef.current.scale.set(pulse, 1, pulse);
    }
  });

  // Architectural material palette per pavilion style
  const pillarMaps =
    project.architectureStyle === 'timber_hall'
      ? oakMaps
      : project.architectureStyle === 'lakeside_deck' || project.architectureStyle === 'sakura_pagoda'
        ? cherryPlankMaps
        : project.architectureStyle === 'redstone_tower'
          ? slateMaps
          : quartzMaps;

  const roofMaps =
    project.architectureStyle === 'sakura_pagoda'
      ? blossomMaps
      : project.architectureStyle === 'timber_hall'
        ? cherryPlankMaps
        : project.architectureStyle === 'conservatory'
          ? quartzMaps
          : slateMaps;

  const lanternIntensity = isActive ? 3.8 : timeOfDay === 'night' ? 3.2 : 1.5;

  return (
    <group position={project.position} rotation={[0, project.rotationY, 0]}>
      {/* Main Architectural Monument Colliders & Detailed Minecraft Spring Voxel Structure */}
      <RigidBody type="fixed" colliders={false}>
        {/* Stepped Plinth Foundation */}
        <CuboidCollider args={[5.6, 0.3, 4.0]} position={[0, 0.3, 0]} />
        <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
          <boxGeometry args={[11.4, 0.44, 8.2]} />
          <meshStandardMaterial {...mossyMaps} />
        </mesh>
        <mesh position={[0, 0.52, 0]} castShadow receiveShadow>
          <boxGeometry args={[10.4, 0.24, 7.2]} />
          <meshStandardMaterial {...quartzMaps} />
        </mesh>

        {/* Walkable Front Stepped Entrance Staircase & Stone Forecourt Apron */}
        <CuboidCollider args={[2.3, 0.2, 0.75]} position={[0, 0.2, 4.2]} />
        <mesh position={[0, 0.38, 3.88]} castShadow receiveShadow>
          <boxGeometry args={[4.6, 0.22, 0.62]} />
          <meshStandardMaterial {...quartzMaps} />
        </mesh>
        <mesh position={[0, 0.2, 4.38]} castShadow receiveShadow>
          <boxGeometry args={[5.0, 0.2, 0.65]} />
          <meshStandardMaterial {...mossyMaps} />
        </mesh>
        <mesh position={[0, 0.045, 5.5]} receiveShadow>
          <boxGeometry args={[6.4, 0.09, 2.4]} />
          <meshStandardMaterial {...stonePathMaps} />
        </mesh>

        {/* Flanking Cherry-Wood Spring Flower Planter Boxes with Blooming Azalea & Tulips */}
        {[-3.75, 3.75].map((px, idx) => (
          <group key={idx} position={[px, 0, 4.35]}>
            <CuboidCollider args={[1.15, 0.42, 0.65]} position={[0, 0.42, 0]} />
            {/* Planter Timber Box */}
            <mesh position={[0, 0.34, 0]} castShadow receiveShadow>
              <boxGeometry args={[2.3, 0.68, 1.25]} />
              <meshStandardMaterial {...cherryPlankMaps} />
            </mesh>
            {/* Turf Soil Top */}
            <mesh position={[0, 0.69, 0]} receiveShadow>
              <boxGeometry args={[2.06, 0.08, 1.02]} />
              <meshStandardMaterial {...grassMaps} />
            </mesh>
            {/* Lush Flowering Azalea Shrub Clusters */}
            <mesh position={[-0.48, 0.98, 0]} castShadow>
              <boxGeometry args={[0.78, 0.58, 0.78]} />
              <meshStandardMaterial {...azaleaMaps} />
            </mesh>
            <mesh position={[0.48, 0.94, 0.04]} castShadow>
              <boxGeometry args={[0.72, 0.52, 0.72]} />
              <meshStandardMaterial {...blossomMaps} />
            </mesh>
            {/* Center Glowing Accent Blossom Stem */}
            <mesh position={[0, 1.06, -0.05]} castShadow>
              <boxGeometry args={[0.32, 0.42, 0.32]} />
              <meshStandardMaterial
                color={project.accentColor}
                emissive={project.accentColor}
                emissiveIntensity={0.85}
              />
            </mesh>
          </group>
        ))}

        {/* 4 Sculpted Corner Architectural Pillars + Stone Plinth Bases & Corbel Brackets */}
        {[
          [-4.35, -2.75],
          [4.35, -2.75],
          [-4.35, 2.75],
          [4.35, 2.75],
        ].map(([cx, cz], idx) => (
          <group key={idx} position={[cx, 0.62, cz]}>
            <CuboidCollider args={[0.5, 2.65, 0.5]} position={[0, 2.65, 0]} />
            {/* Carved Stone Footing */}
            <mesh position={[0, 0.32, 0]} castShadow receiveShadow>
              <boxGeometry args={[1.18, 0.64, 1.18]} />
              <meshStandardMaterial {...mossyMaps} />
            </mesh>
            {/* Main Timber/Quartz Column */}
            <mesh position={[0, 2.65, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.92, 5.25, 0.92]} />
              <meshStandardMaterial {...pillarMaps} />
            </mesh>
            {/* Glowing Accent Collar */}
            <mesh position={[0, 4.72, 0]}>
              <boxGeometry args={[1.08, 0.24, 1.08]} />
              <meshStandardMaterial
                color={project.accentColor}
                emissive={project.accentColor}
                emissiveIntensity={lanternIntensity}
              />
            </mesh>
            {/* Upper Eave Capital Block */}
            <mesh position={[0, 5.12, 0]} castShadow>
              <boxGeometry args={[1.26, 0.34, 1.26]} />
              <meshStandardMaterial {...oakMaps} />
            </mesh>
          </group>
        ))}

        {/* Horizontal Timber Cross-Beams & Rear Lattice Balustrade (Complete 360° Detail) */}
        <mesh position={[0, 5.55, 2.75]} castShadow>
          <boxGeometry args={[9.6, 0.38, 0.52]} />
          <meshStandardMaterial {...oakMaps} />
        </mesh>
        <mesh position={[0, 5.55, -2.75]} castShadow>
          <boxGeometry args={[9.6, 0.38, 0.52]} />
          <meshStandardMaterial {...oakMaps} />
        </mesh>
        <mesh position={[-4.35, 5.55, 0]} castShadow>
          <boxGeometry args={[0.52, 0.38, 6.2]} />
          <meshStandardMaterial {...oakMaps} />
        </mesh>
        <mesh position={[4.35, 5.55, 0]} castShadow>
          <boxGeometry args={[0.52, 0.38, 6.2]} />
          <meshStandardMaterial {...oakMaps} />
        </mesh>

        {/* Rear & Side Decorative Balustrade Railings */}
        <mesh position={[0, 1.18, -3.1]} castShadow>
          <boxGeometry args={[8.2, 0.18, 0.22]} />
          <meshStandardMaterial {...oakMaps} />
        </mesh>
        {[-3.0, -1.5, 0, 1.5, 3.0].map((bx, i) => (
          <mesh key={i} position={[bx, 0.9, -3.1]} castShadow>
            <boxGeometry args={[0.18, 0.56, 0.18]} />
            <meshStandardMaterial {...cherryPlankMaps} />
          </mesh>
        ))}

        {/* Multi-Tiered Architectural Roof Canopy + Overhanging Timber Rafter Tails */}
        <mesh position={[0, 6.08, 0]} castShadow receiveShadow>
          <boxGeometry args={[11.4, 0.52, 8.3]} />
          {project.architectureStyle === 'conservatory' ? (
            <meshPhysicalMaterial
              color="#e0f2fe"
              roughness={0.12}
              transmission={0.7}
              transparent
              opacity={0.78}
            />
          ) : (
            <meshStandardMaterial {...roofMaps} />
          )}
        </mesh>
        {/* Decorative Eave Trim Band */}
        <mesh position={[0, 5.82, 0]} castShadow>
          <boxGeometry args={[11.65, 0.16, 8.55]} />
          <meshStandardMaterial {...oakMaps} />
        </mesh>
        {/* Upper Clerestory Tier */}
        <mesh position={[0, 6.72, 0]} castShadow receiveShadow>
          <boxGeometry args={[8.2, 0.68, 5.5]} />
          <meshStandardMaterial {...roofMaps} />
        </mesh>
        {/* Ridge Beam & Pagoda Finial Crown */}
        <mesh position={[0, 7.18, 0]} castShadow>
          <boxGeometry args={[8.6, 0.28, 0.65]} />
          <meshStandardMaterial {...oakMaps} />
        </mesh>
        <mesh position={[0, 7.62, 0]} castShadow>
          <boxGeometry args={[1.38, 0.96, 1.38]} />
          <meshStandardMaterial
            map={lanternMaps.map}
            emissive={project.accentColor}
            emissiveIntensity={lanternIntensity}
          />
        </mesh>
      </RigidBody>

      {/* 4 Swaying Hanging Corner Eave Lanterns */}
      <group ref={lanternsGroupRef}>
        {[
          [-5.25, -3.65],
          [5.25, -3.65],
          [-5.25, 3.65],
          [5.25, 3.65],
        ].map(([lx, lz], idx) => (
          <group key={idx} position={[lx, 5.75, lz]}>
            {/* Iron Chain */}
            <mesh position={[0, -0.32, 0]}>
              <boxGeometry args={[0.09, 0.64, 0.09]} />
              <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.35} />
            </mesh>
            {/* Lantern Cap */}
            <mesh position={[0, -0.68, 0]} castShadow>
              <boxGeometry args={[0.48, 0.14, 0.48]} />
              <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.4} />
            </mesh>
            {/* Glowing Warm Voxel Core */}
            <mesh position={[0, -0.92, 0]}>
              <boxGeometry args={[0.36, 0.38, 0.36]} />
              <meshStandardMaterial
                color="#fef08a"
                emissive="#fbbf24"
                emissiveIntensity={timeOfDay === 'night' ? 3.6 : 1.75}
              />
            </mesh>
          </group>
        ))}
      </group>

      {/* Giant 3D High-Definition Illuminated Project Display Screen */}
      <group position={[0, 3.28, -0.45]}>
        {/* Beveled Dark Slate Monitor Backing */}
        <mesh castShadow>
          <boxGeometry args={[6.65, 3.88, 0.38]} />
          <meshStandardMaterial color="#0f172a" roughness={0.32} metalness={0.45} />
        </mesh>
        {/* Glowing Accent Neon Frame Trim */}
        <mesh position={[0, 0, -0.02]}>
          <boxGeometry args={[6.84, 4.06, 0.24]} />
          <meshStandardMaterial
            color={project.accentColor}
            emissive={project.accentColor}
            emissiveIntensity={isActive ? 2.6 : 1.15}
          />
        </mesh>
        {/* Live Animated 640x360 Project Canvas Texture */}
        <mesh
          position={[0, 0, 0.21]}
          onClick={(e) => {
            e.stopPropagation();
            openProjectModal(project.id);
          }}
        >
          <planeGeometry args={[6.25, 3.52]} />
          <meshBasicMaterial map={screenHandle.texture} toneMapped={false} />
        </mesh>
      </group>

      {/* Floating Rotating 3D Tech-Stack Voxel Emblems on Carved Pedestals */}
      <group ref={techCubesRef}>
        {[-3.65, 3.65].map((tx, idx) => (
          <mesh key={idx} geometry={cubeGeo} position={[tx, 1.92, 1.35]} castShadow>
            <meshPhysicalMaterial
              color={idx === 0 ? project.accentColor : project.secondaryColor}
              emissive={idx === 0 ? project.accentColor : project.secondaryColor}
              emissiveIntensity={0.65}
              roughness={0.18}
              clearcoat={0.85}
            />
          </mesh>
        ))}
      </group>
      {[-3.65, 3.65].map((tx, idx) => (
        <group key={idx} position={[tx, 0.98, 1.35]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.84, 0.72, 0.84]} />
            <meshStandardMaterial {...quartzMaps} />
          </mesh>
          <mesh position={[0, 0.4, 0]}>
            <boxGeometry args={[0.94, 0.1, 0.94]} />
            <meshStandardMaterial {...mossyMaps} />
          </mesh>
        </group>
      ))}

      {/* Floating 3D Pavilion Header Plaque (Only shown when in front of camera) */}
      {showHeaderLabel && (
        <Html position={[0, 8.35, 1.2]} center zIndexRange={[8, 0]}>
          <div
            onClick={() => openProjectModal(project.id)}
            className="cursor-pointer select-none whitespace-nowrap rounded-xl border border-white/20 bg-slate-950/80 px-3 py-1 text-center shadow-xl backdrop-blur-md transition-transform hover:scale-105"
          >
            <div
              className="font-mono-code text-[9px] font-bold tracking-widest uppercase"
              style={{ color: project.accentColor }}
            >
              {project.chapterNumber ? `${project.chapterNumber} • ` : `#${project.number} • `}
              {project.category}
            </div>
            <div className="font-display text-xs font-bold text-white">{project.title}</div>
          </div>
        </Html>
      )}

      {/* Interactive Drive-Thru / Walk-On Glowing Rune Pressure Pad in Front of Pavilion */}
      <group position={[0, 0.04, 6.8]}>
        <mesh receiveShadow>
          <cylinderGeometry args={[3.2, 3.35, 0.09, 24]} />
          <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.3} />
        </mesh>
        <mesh ref={padRingRef} position={[0, 0.055, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.65, 3.12, 32]} />
          <meshStandardMaterial
            color={project.accentColor}
            emissive={project.accentColor}
            emissiveIntensity={isActive ? 3.5 : 1.5}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[2.55, 32]} />
          <meshStandardMaterial
            color={project.accentColor}
            emissive={project.accentColor}
            emissiveIntensity={isActive ? 0.85 : 0.22}
            transparent
            opacity={isActive ? 0.42 : 0.18}
          />
        </mesh>

        {/* Active Vertical Sky Beacon Beam When Player/Vehicle Enters Pad! */}
        {isActive && (
          <mesh position={[0, 9, 0]}>
            <cylinderGeometry args={[2.2, 2.75, 18, 20, 1, true]} />
            <meshBasicMaterial
              color={project.accentColor}
              transparent
              opacity={0.14}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
        )}
      </group>
    </group>
  );
}

export function ProjectPavilions() {
  const lastActiveRef = useRef<string | null>(null);
  const projects = useWorldStore((s) => s.projects);

  // Check proximity to each Pavilion's front Pressure Pad (works both on foot & while driving!)
  useFrame(() => {
    const store = useWorldStore.getState();
    const [px, , pz] = store.playerPosition;

    let matchedId: string | null = null;
    let bestDist = 5.4;

    for (const proj of store.projects) {
      const padX = proj.position[0] + Math.sin(proj.rotationY) * 6.8;
      const padZ = proj.position[2] + Math.cos(proj.rotationY) * 6.8;
      const dPad = Math.hypot(px - padX, pz - padZ);
      const dCenter = Math.hypot(px - proj.position[0], pz - proj.position[2]);
      const effectiveDist = Math.min(dPad, dCenter * 0.65);

      if (effectiveDist < bestDist) {
        bestDist = effectiveDist;
        matchedId = proj.id;
      }
    }

    if (matchedId !== lastActiveRef.current) {
      lastActiveRef.current = matchedId;
      store.setNearbyProjectId(matchedId);
      if (matchedId) {
        soundEngine.playChime('pad');
      }
    }
  });

  // Keyboard [Enter] or [E] opens active project's Full Case Study Modal, [N] teleports to Next Story Chapter
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || isTypingInInput(e)) return;
      const store = useWorldStore.getState();
      if (!store.hasEnteredWorld) return;

      if (e.code === 'Enter' || e.code === 'KeyE') {
        if (
          !store.activeModalProjectId &&
          !store.isWardrobeOpen &&
          !store.isProjectCreatorOpen &&
          !store.isResumeModalOpen &&
          store.nearbyProjectId
        ) {
          store.openProjectModal(store.nearbyProjectId);
        }
      } else if (e.code === 'KeyN') {
        if (
          !store.activeModalProjectId &&
          !store.isWardrobeOpen &&
          !store.isProjectCreatorOpen &&
          !store.isResumeModalOpen
        ) {
          store.teleportToStoryChapter(store.storyChapterIndex + 1);
        }
      } else if (e.code === 'Escape') {
        if (store.activeModalProjectId) store.closeProjectModal();
        if (store.isDirectoryOpen) store.setDirectoryOpen(false);
        if (store.isWardrobeOpen) store.setWardrobeOpen(false);
        if (store.isProjectCreatorOpen) store.closeProjectCreator();
        if (store.isResumeModalOpen) store.setResumeModalOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <group>
      {projects.map((project) => (
        <SinglePavilion key={project.id} project={project} />
      ))}
    </group>
  );
}
