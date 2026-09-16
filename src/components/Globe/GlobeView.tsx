"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { City } from "@/lib/types";

interface GlobeViewProps {
  cities: City[];
  selectedCity: City | null;
  onSelectCity: (city: City) => void;
  isPlaying?: boolean;
}

export const GlobeView: React.FC<GlobeViewProps> = ({
  cities,
  selectedCity,
  onSelectCity,
  isPlaying = false,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const selectedCityRef = useRef<City | null>(selectedCity);
  selectedCityRef.current = selectedCity;

  const onSelectCityRef = useRef(onSelectCity);
  onSelectCityRef.current = onSelectCity;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene & Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050608, 0.0012);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 320);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // Globe Group
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    const GLOBE_RADIUS = 100;

    // 1. Base Dark Sphere
    const sphereGeo = new THREE.SphereGeometry(GLOBE_RADIUS - 0.5, 64, 64);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0x0a0d14,
      transparent: true,
      opacity: 0.95,
    });
    const baseSphere = new THREE.Mesh(sphereGeo, sphereMat);
    globeGroup.add(baseSphere);

    // 2. Wireframe / Latitude-Longitude Grid
    const wireframeGeo = new THREE.SphereGeometry(GLOBE_RADIUS, 36, 18);
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: 0x1f293d,
      wireframe: true,
      transparent: true,
      opacity: 0.18,
    });
    const wireframeMesh = new THREE.Mesh(wireframeGeo, wireframeMat);
    globeGroup.add(wireframeMesh);

    // 3. Atmosphere Glow Shell
    const glowGeo = new THREE.SphereGeometry(GLOBE_RADIUS * 1.15, 64, 64);
    const glowMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.8);
          gl_FragColor = vec4(0.22, 0.65, 0.98, 1.0) * intensity * 0.45;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });
    const glowMesh = new THREE.Mesh(glowGeo, glowMat);
    scene.add(glowMesh);

    // 4. Dot Matrix for Landmass / Globe Particle Grid
    const pointCount = 18000;
    const pointPositions = new Float32Array(pointCount * 3);
    const pointColors = new Float32Array(pointCount * 3);
    const dummyColor = new THREE.Color();

    for (let i = 0; i < pointCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / pointCount);
      const theta = Math.sqrt(pointCount * Math.PI) * phi;

      const r = GLOBE_RADIUS + 0.2;
      const x = r * Math.cos(theta) * Math.sin(phi);
      const y = r * Math.sin(theta) * Math.sin(phi);
      const z = r * Math.cos(phi);

      pointPositions[i * 3] = x;
      pointPositions[i * 3 + 1] = y;
      pointPositions[i * 3 + 2] = z;

      // Dark futuristic starlight dots
      if (Math.random() > 0.85) {
        dummyColor.setHex(0xe8c374); // gold fleck
      } else {
        dummyColor.setHex(0x1e293b); // deep slate
      }
      pointColors[i * 3] = dummyColor.r;
      pointColors[i * 3 + 1] = dummyColor.g;
      pointColors[i * 3 + 2] = dummyColor.b;
    }

    const pointsGeo = new THREE.BufferGeometry();
    pointsGeo.setAttribute("position", new THREE.BufferAttribute(pointPositions, 3));
    pointsGeo.setAttribute("color", new THREE.BufferAttribute(pointColors, 3));

    const pointsMat = new THREE.PointsMaterial({
      size: 1.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
    });
    const globePoints = new THREE.Points(pointsGeo, pointsMat);
    globeGroup.add(globePoints);

    // 5. Starfield Background
    const starCount = 1200;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const dist = 350 + Math.random() * 450;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      starPositions[i * 3] = dist * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = dist * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = dist * Math.cos(phi);
    }
    const starsGeo = new THREE.BufferGeometry();
    starsGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const starsMat = new THREE.PointsMaterial({
      color: 0x818cf8,
      size: 0.8,
      transparent: true,
      opacity: 0.45,
    });
    const starField = new THREE.Points(starsGeo, starsMat);
    scene.add(starField);

    // Helper: Convert Lat/Lng to Vector3 on sphere
    const latLngToVector = (lat: number, lng: number, radius = GLOBE_RADIUS): THREE.Vector3 => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lng + 180) * (Math.PI / 180);
      const x = -(radius * Math.sin(phi) * Math.cos(theta));
      const z = radius * Math.sin(phi) * Math.sin(theta);
      const y = radius * Math.cos(phi);
      return new THREE.Vector3(x, y, z);
    };

    // 6. City Markers (interactive meshes)
    const markerGroup = new THREE.Group();
    globeGroup.add(markerGroup);

    const markerMeshes: { mesh: THREE.Mesh; ring: THREE.Mesh; city: City }[] = [];

    cities.forEach((city) => {
      const pos = latLngToVector(city.lat, city.lng, GLOBE_RADIUS + 0.8);

      // Core point
      const pinGeo = new THREE.SphereGeometry(1.8, 16, 16);
      const pinMat = new THREE.MeshBasicMaterial({
        color: 0xe8c374,
      });
      const pinMesh = new THREE.Mesh(pinGeo, pinMat);
      pinMesh.position.copy(pos);
      pinMesh.userData = { city };

      // Outer pulse ring
      const ringGeo = new THREE.RingGeometry(2.5, 3.4, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xe8c374,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.copy(pos);
      ringMesh.lookAt(new THREE.Vector3(0, 0, 0));

      markerGroup.add(pinMesh);
      markerGroup.add(ringMesh);

      markerMeshes.push({ mesh: pinMesh, ring: ringMesh, city });
    });

    // 7. Active City Halo & Audio Waves
    const activeRingGeo = new THREE.RingGeometry(4.0, 5.5, 32);
    const activeRingMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
    });
    const activeRing = new THREE.Mesh(activeRingGeo, activeRingMat);
    activeRing.visible = false;
    markerGroup.add(activeRing);

    // Raycasting & Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-999, -999);

    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let rotSpeedX = 0;
    let rotSpeedY = 0;
    let targetQuat: THREE.Quaternion | null = null;
    let targetZoom = 320;

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
      rotSpeedX = 0;
      rotSpeedY = 0;
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (isDragging) {
        const deltaX = e.clientX - prevMouseX;
        const deltaY = e.clientY - prevMouseY;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;

        rotSpeedX = deltaX * 0.005;
        rotSpeedY = deltaY * 0.005;

        globeGroup.rotation.y += rotSpeedX;
        globeGroup.rotation.x += rotSpeedY;
        targetQuat = null; // cancel auto flight on manual drag
      } else {
        // Test hover
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(markerMeshes.map((m) => m.mesh));
        if (intersects.length > 0) {
          container.style.cursor = "pointer";
        } else {
          container.style.cursor = "grab";
        }
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (isDragging) {
        isDragging = false;
      }

      // Check click if movement was negligible
      const rect = container.getBoundingClientRect();
      const clickX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const clickY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(new THREE.Vector2(clickX, clickY), camera);
      const intersects = raycaster.intersectObjects(markerMeshes.map((m) => m.mesh));

      if (intersects.length > 0) {
        const hitCity = intersects[0].object.userData.city as City;
        if (hitCity) {
          onSelectCityRef.current(hitCity);
        }
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      targetZoom += e.deltaY * 0.2;
      targetZoom = Math.max(160, Math.min(460, targetZoom));
    };

    container.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    container.addEventListener("wheel", onWheel, { passive: false });

    // Function to align globe to a specific city
    const flyToCity = (city: City) => {
      const pos = latLngToVector(city.lat, city.lng, 1);
      // We want `pos` to point directly towards camera (which is at +Z)
      const targetVec = new THREE.Vector3(0, 0, 1);
      const q = new THREE.Quaternion().setFromUnitVectors(pos.normalize(), targetVec);
      targetQuat = q;
      targetZoom = 240; // Zoom in slightly on destination
    };

    // Initial fly to selected city if present
    if (selectedCity) {
      flyToCity(selectedCity);
    }

    // Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      const elapsed = clock.getElapsedTime();

      // Slow idle spin when not dragging or flying
      if (!isDragging && !targetQuat) {
        globeGroup.rotation.y += 0.001;
      }

      // Smooth flight interpolation towards target city
      if (targetQuat) {
        globeGroup.quaternion.slerp(targetQuat, 0.045);
        if (globeGroup.quaternion.angleTo(targetQuat) < 0.002) {
          targetQuat = null; // reached
        }
      }

      // Smooth camera zoom
      camera.position.z += (targetZoom - camera.position.z) * 0.08;

      // Pulse rings
      markerMeshes.forEach((item, index) => {
        const isCurrent =
          selectedCityRef.current &&
          selectedCityRef.current.name === item.city.name;
        const scale = 1 + 0.35 * Math.sin(elapsed * 3 + index);
        item.ring.scale.set(scale, scale, 1);

        const mat = item.ring.material as THREE.MeshBasicMaterial;
        mat.opacity = 0.3 + 0.4 * Math.abs(Math.cos(elapsed * 3 + index));

        if (isCurrent) {
          activeRing.visible = true;
          activeRing.position.copy(item.mesh.position);
          activeRing.lookAt(new THREE.Vector3(0, 0, 0));
          const activeScale = 1.2 + 0.6 * Math.sin(elapsed * 5);
          activeRing.scale.set(activeScale, activeScale, 1);
        }
      });

      // Render
      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    // Expose flyTo method via container element or ref
    (container as unknown as { flyToCity: (c: City) => void }).flyToCity = flyToCity;

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      container.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", handleResize);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      renderer.dispose();
      sphereGeo.dispose();
      sphereMat.dispose();
      pointsGeo.dispose();
      pointsMat.dispose();
      starsGeo.dispose();
      starsMat.dispose();
    };
  }, [cities]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle selectedCity changes from outside
  useEffect(() => {
    if (selectedCity && containerRef.current) {
      const instance = containerRef.current as unknown as { flyToCity?: (c: City) => void };
      if (instance.flyToCity) {
        instance.flyToCity(selectedCity);
      }
    }
  }, [selectedCity]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing select-none overflow-hidden"
    />
  );
};
