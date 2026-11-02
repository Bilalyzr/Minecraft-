import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { CuboidCollider, RigidBody } from '@react-three/rapier';
import { Html } from '@react-three/drei';
import {
  CHARACTER_PRESETS,
  WARDROBE_BOUTIQUE_POS,
  WARDROBE_BOUTIQUE_ROT_Y,
} from '../../config/character.config';
import { getPBRBlockMaps } from '../../textures/pbrTextures';
import { VoxelCharacterModel } from '../shared/VoxelCharacterModel';
import { useWorldStore } from '../../store/useWorldStore';
import { isTypingInInput } from '../../core/cameraState';
import { soundEngine } from '../../audio/soundEngine';

export function WardrobeBoutique() {
  const isNearWardrobe = useWorldStore((s) => s.isNearWardrobe);
  const setWardrobeOpen = useWorldStore((s) => s.setWardrobeOpen);
  const characterAppearance = useWorldStore((s) => s.characterAppearance);
  const timeOfDay = useWorldStore((s) => s.timeOfDay);

  const [showPlaque, setShowPlaque] = useState(true);
  const camDirHelper = useMemo(() => new THREE.Vector3(), []);
  const toBoutiqueHelper = useMemo(() => new THREE.Vector3(), []);

  const centerMannequinRef = useRef<THREE.Group>(null);
  const leftMannequinRef = useRef<THREE.Group>(null);
  const rightMannequinRef = useRef<THREE.Group>(null);
  const padRingRef = useRef<THREE.Mesh>(null);
  const lastNearRef = useRef(false);

  const quartzMaps = useMemo(() => getPBRBlockMaps('chiseled_quartz', 3, 2), []);
  const cherryPlankMaps = useMemo(() => getPBRBlockMaps('pink_cherry_planks', 3, 2), []);
  const mossyMaps = useMemo(() => getPBRBlockMaps('mossy_stone', 3, 2), []);
  const blossomMaps = useMemo(() => getPBRBlockMaps('sakura_blossom', 2, 2), []);
  const oakMaps = useMemo(() => getPBRBlockMaps('oak_planks', 3, 2), []);

  const padWorldPos = useMemo<[number, number, number]>(() => {
    const sin = Math.sin(WARDROBE_BOUTIQUE_ROT_Y);
    const cos = Math.cos(WARDROBE_BOUTIQUE_ROT_Y);
    return [
      WARDROBE_BOUTIQUE_POS[0] + sin * 5.2,
      0.04,
      WARDROBE_BOUTIQUE_POS[2] + cos * 5.2,
    ];
  }, []);

  useFrame(({ clock, camera }) => {
    const t = clock.getElapsedTime();
    const store = useWorldStore.getState();
    const [px, , pz] = store.playerPosition;

    const dPad = Math.hypot(px - padWorldPos[0], pz - padWorldPos[2]);
    const dCenter = Math.hypot(
      px - WARDROBE_BOUTIQUE_POS[0],
      pz - WARDROBE_BOUTIQUE_POS[2]
    );
    const isNear = Math.min(dPad, dCenter * 0.75) < 4.5;

    if (isNear !== lastNearRef.current) {
      lastNearRef.current = isNear;
      store.setNearWardrobe(isNear);
      if (isNear) {
        soundEngine.playChime('pad');
      }
    }

    camera.getWorldDirection(camDirHelper);
    toBoutiqueHelper.set(
      WARDROBE_BOUTIQUE_POS[0] - camera.position.x,
      WARDROBE_BOUTIQUE_POS[1] + 5.2 - camera.position.y,
      WARDROBE_BOUTIQUE_POS[2] - camera.position.z
    );
    const visible = toBoutiqueHelper.dot(camDirHelper) > 2.0 && toBoutiqueHelper.length() < 68;
    if (visible !== showPlaque) {
      setShowPlaque(visible);
    }

    if (centerMannequinRef.current) {
      centerMannequinRef.current.rotation.y = Math.sin(t * 0.85) * 0.55;
    }
    if (leftMannequinRef.current) {
      leftMannequinRef.current.rotation.y = t * 0.65;
    }
    if (rightMannequinRef.current) {
      rightMannequinRef.current.rotation.y = -t * 0.65;
    }
    if (padRingRef.current) {
      const pulse = 1 + Math.sin(t * 4.0) * 0.05;
      padRingRef.current.scale.set(pulse, 1, pulse);
    }
  });

  // Keyboard shortcut [C] opens Wardrobe anywhere, or [Enter]/[E] when standing on Boutique Pad
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || isTypingInInput(e)) return;
      const store = useWorldStore.getState();
      if (!store.hasEnteredWorld) return;

      if (e.code === 'KeyC') {
        store.setWardrobeOpen(!store.isWardrobeOpen);
      } else if (
        (e.code === 'Enter' || e.code === 'KeyE') &&
        store.isNearWardrobe &&
        !store.isWardrobeOpen &&
        !store.activeModalProjectId
      ) {
        store.setWardrobeOpen(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const leftPreset = CHARACTER_PRESETS[1].appearance;
  const rightPreset = CHARACTER_PRESETS[3].appearance;
  const glowIntensity = isNearWardrobe ? 3.2 : timeOfDay === 'night' ? 2.6 : 1.4;

  return (
    <group position={WARDROBE_BOUTIQUE_POS} rotation={[0, WARDROBE_BOUTIQUE_ROT_Y, 0]}>
      {/* Stepped Boutique Stage & Architectural Canopy */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[4.4, 0.26, 3.1]} position={[0, 0.26, 0]} />
        <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[8.8, 0.4, 6.2]} />
          <meshStandardMaterial {...mossyMaps} />
        </mesh>
        <mesh position={[0, 0.46, 0]} castShadow receiveShadow>
          <boxGeometry args={[8.0, 0.2, 5.4]} />
          <meshStandardMaterial {...quartzMaps} />
        </mesh>

        {/* Front Boutique Steps */}
        <CuboidCollider args={[1.9, 0.18, 0.55]} position={[0, 0.18, 3.1]} />
        <mesh position={[0, 0.26, 2.95]} castShadow receiveShadow>
          <boxGeometry args={[3.8, 0.22, 0.65]} />
          <meshStandardMaterial {...quartzMaps} />
        </mesh>

        {/* 4 Sakura Timber Columns */}
        {[
          [-3.4, -2.1],
          [3.4, -2.1],
          [-3.4, 2.1],
          [3.4, 2.1],
        ].map(([cx, cz], idx) => (
          <group key={idx} position={[cx, 0.55, cz]}>
            <CuboidCollider args={[0.38, 2.2, 0.38]} position={[0, 2.2, 0]} />
            <mesh position={[0, 2.2, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.72, 4.4, 0.72]} />
              <meshStandardMaterial {...cherryPlankMaps} />
            </mesh>
            <mesh position={[0, 3.9, 0]}>
              <boxGeometry args={[0.84, 0.2, 0.84]} />
              <meshStandardMaterial
                color="#e879f9"
                emissive="#d946ef"
                emissiveIntensity={glowIntensity}
              />
            </mesh>
          </group>
        ))}

        {/* Sakura Blossom Pergola Canopy */}
        <mesh position={[0, 5.05, 0]} castShadow receiveShadow>
          <boxGeometry args={[9.0, 0.42, 6.4]} />
          <meshStandardMaterial {...blossomMaps} />
        </mesh>
        <mesh position={[0, 4.78, 0]} castShadow>
          <boxGeometry args={[9.2, 0.16, 6.6]} />
          <meshStandardMaterial {...oakMaps} />
        </mesh>
      </RigidBody>

      {/* Center Illuminated Holographic Dressing Mirror Backdrop */}
      <group
        position={[0, 2.35, -1.35]}
        onClick={(e) => {
          e.stopPropagation();
          setWardrobeOpen(true);
        }}
      >
        <mesh castShadow>
          <boxGeometry args={[2.6, 3.3, 0.26]} />
          <meshStandardMaterial color="#0f172a" roughness={0.25} metalness={0.5} />
        </mesh>
        {/* Neon Mirror Trim */}
        <mesh position={[0, 0, -0.02]}>
          <boxGeometry args={[2.78, 3.48, 0.18]} />
          <meshStandardMaterial
            color="#f472b6"
            emissive="#ec4899"
            emissiveIntensity={glowIntensity}
          />
        </mesh>
        {/* Reflective Shimmering Mirror Glass */}
        <mesh position={[0, 0, 0.15]}>
          <planeGeometry args={[2.32, 3.02]} />
          <meshPhysicalMaterial
            color="#38bdf8"
            emissive="#ec4899"
            emissiveIntensity={0.25}
            roughness={0.05}
            metalness={0.85}
            clearcoat={1}
          />
        </mesh>
      </group>

      {/* Center Turntable Podium Displaying Visitor's Live Customized Character! */}
      <group position={[0, 0.58, -0.15]}>
        <mesh receiveShadow castShadow>
          <cylinderGeometry args={[0.95, 1.08, 0.22, 24]} />
          <meshStandardMaterial {...quartzMaps} />
        </mesh>
        <mesh position={[0, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.78, 0.92, 24]} />
          <meshStandardMaterial
            color="#f472b6"
            emissive="#ec4899"
            emissiveIntensity={2.2}
            side={THREE.DoubleSide}
          />
        </mesh>
        <group ref={centerMannequinRef} position={[0, 0.14, 0]}>
          <VoxelCharacterModel
            skinColor={characterAppearance.skinColor}
            jacketColor={characterAppearance.jacketColor}
            shirtColor={characterAppearance.shirtColor}
            pantsColor={characterAppearance.pantsColor}
            hairColor={characterAppearance.hairColor}
            shoeColor={characterAppearance.shoeColor}
            hairStyle={characterAppearance.hairStyle}
            outfitStyle={characterAppearance.outfitStyle}
            accessory={characterAppearance.accessory}
            capeColor={characterAppearance.capeColor}
            isWaving
          />
        </group>
      </group>

      {/* Left & Right Showcase Mannequin Pedestals (Showing Alternate Outfits) */}
      <group position={[-2.25, 0.58, 0.35]}>
        <mesh receiveShadow castShadow>
          <cylinderGeometry args={[0.68, 0.78, 0.18, 20]} />
          <meshStandardMaterial {...quartzMaps} />
        </mesh>
        <group ref={leftMannequinRef} position={[0, 0.1, 0]} scale={0.88}>
          <VoxelCharacterModel {...leftPreset} />
        </group>
      </group>

      <group position={[2.25, 0.58, 0.35]}>
        <mesh receiveShadow castShadow>
          <cylinderGeometry args={[0.68, 0.78, 0.18, 20]} />
          <meshStandardMaterial {...quartzMaps} />
        </mesh>
        <group ref={rightMannequinRef} position={[0, 0.1, 0]} scale={0.88}>
          <VoxelCharacterModel {...rightPreset} />
        </group>
      </group>

      {/* Floating 3D Boutique Header Plaque */}
      {showPlaque && (
        <Html position={[0, 6.25, 0.8]} center zIndexRange={[8, 0]}>
          <div
            onClick={() => setWardrobeOpen(true)}
            className="cursor-pointer select-none whitespace-nowrap rounded-xl border border-pink-400/40 bg-slate-950/85 px-3.5 py-1.5 text-center shadow-2xl backdrop-blur-md transition-transform hover:scale-105"
          >
            <div className="font-mono-code text-[9px] font-bold tracking-widest text-pink-400 uppercase">
              3D WARDROBE & AVATAR SPACE • [KEY C]
            </div>
            <div className="font-display text-xs font-bold text-white">
              Sakura Style & Outfit Atelier
            </div>
          </div>
        </Html>
      )}

      {/* Interactive Walk-On / Drive-On Glowing Wardrobe Pad in Front of Atelier */}
      <group position={[0, 0.04, 5.2]}>
        <mesh receiveShadow>
          <cylinderGeometry args={[2.55, 2.7, 0.08, 24]} />
          <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.3} />
        </mesh>
        <mesh ref={padRingRef} position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.05, 2.48, 32]} />
          <meshStandardMaterial
            color="#e879f9"
            emissive="#d946ef"
            emissiveIntensity={isNearWardrobe ? 3.5 : 1.6}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh position={[0, 0.045, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.98, 32]} />
          <meshStandardMaterial
            color="#e879f9"
            emissive="#d946ef"
            emissiveIntensity={isNearWardrobe ? 0.9 : 0.25}
            transparent
            opacity={isNearWardrobe ? 0.42 : 0.18}
          />
        </mesh>

        {isNearWardrobe && (
          <mesh position={[0, 7.5, 0]}>
            <cylinderGeometry args={[1.8, 2.2, 15, 20, 1, true]} />
            <meshBasicMaterial
              color="#e879f9"
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
