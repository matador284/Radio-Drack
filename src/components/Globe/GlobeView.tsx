"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { City } from "@/lib/types";

interface GlobeViewProps {
  cities: City[];
  selectedCity: City | null;
  onSelectCity: (city: City) => void;
  onZoomIntoCity?: (city: City) => void;
  isPlaying?: boolean;
}

export const GlobeView: React.FC<GlobeViewProps> = ({
  cities,
  selectedCity,
  onSelectCity,
  onZoomIntoCity,
  isPlaying = false,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const selectedCityRef = useRef<City | null>(selectedCity);
  selectedCityRef.current = selectedCity;

  const onSelectCityRef = useRef(onSelectCity);
  onSelectCityRef.current = onSelectCity;

  const onZoomIntoCityRef = useRef(onZoomIntoCity);
  onZoomIntoCityRef.current = onZoomIntoCity;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene & Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050608, 0.0008);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1200);
    camera.position.set(0, 0, 310);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    container.appendChild(renderer.domElement);

    // Lighting (Sunlight from top-right + subtle ambient)
    const ambientLight = new THREE.AmbientLight(0x223355, 1.2);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.5);
    sunLight.position.set(250, 120, 200);
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.5);
    rimLight.position.set(-200, -100, -150);
    scene.add(rimLight);

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    const GLOBE_RADIUS = 100;

    // --- PROCEDURAL HIGH-RES NASA EARTH TEXTURE ---
    // Generates high-res equirectangular landmasses, topography, oceans, and city night lights
    const textureCanvas = document.createElement("canvas");
    textureCanvas.width = 2048;
    textureCanvas.height = 1024;
    const ctx = textureCanvas.getContext("2d")!;

    // 1. Deep NASA Blue Ocean Base with gradients
    const oceanGrad = ctx.createLinearGradient(0, 0, 0, 1024);
    oceanGrad.addColorStop(0, "#081326");
    oceanGrad.addColorStop(0.2, "#0b2046");
    oceanGrad.addColorStop(0.5, "#0c2854");
    oceanGrad.addColorStop(0.8, "#0b2046");
    oceanGrad.addColorStop(1, "#081326");
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, 2048, 1024);

    // 2. Continents and terrain simulation (NASA Blue Marble style)
    const project = (lat: number, lng: number) => {
      const x = ((lng + 180) / 360) * 2048;
      const y = ((90 - lat) / 180) * 1024;
      return [x, y];
    };

    // Draw continental landmass shapes
    const drawLandBlob = (lat: number, lng: number, rx: number, ry: number, color: string) => {
      const [cx, cy] = project(lat, lng);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
    };

    // South America (Brazil, Argentina, Andes)
    drawLandBlob(-14, -54, 180, 240, "#194328"); // Amazon forest lush green
    drawLandBlob(-23, -48, 140, 180, "#235532"); // Southeast Brazil
    drawLandBlob(-38, -64, 90, 160, "#3e522d"); // Pampas / Patagonia
    drawLandBlob(-10, -75, 40, 180, "#4a4c33"); // Andes mountain ridge

    // North America
    drawLandBlob(40, -100, 240, 190, "#2c4c28"); // US Great Plains & Midwest
    drawLandBlob(55, -105, 260, 170, "#1f3b20"); // Canada Boreal
    drawLandBlob(35, -118, 90, 140, "#5a5035"); // Western Desert & California
    drawLandBlob(22, -100, 90, 110, "#414629"); // Mexico
    drawLandBlob(72, -40, 140, 120, "#e2e8f0"); // Greenland Ice cap

    // Europe
    drawLandBlob(50, 15, 160, 110, "#2d5228"); // Central Europe
    drawLandBlob(42, -3, 80, 70, "#484d2f"); // Iberian Peninsula
    drawLandBlob(62, 18, 110, 120, "#1e3b21"); // Scandinavia
    drawLandBlob(54, -3, 50, 60, "#2d562b"); // UK & Ireland

    // Africa
    drawLandBlob(24, 18, 200, 110, "#735c3b"); // Sahara desert sand
    drawLandBlob(0, 22, 180, 150, "#1e4d29"); // Congo rainforest
    drawLandBlob(-24, 25, 140, 140, "#4d522c"); // Southern Africa Savanna

    // Asia & Russia
    drawLandBlob(60, 90, 420, 190, "#234124"); // Siberia Taiga
    drawLandBlob(35, 105, 220, 160, "#3a562d"); // East Asia / China
    drawLandBlob(22, 79, 130, 130, "#3f542e"); // India
    drawLandBlob(25, 45, 110, 110, "#6e5737"); // Arabian Peninsula
    drawLandBlob(36, 138, 45, 100, "#274826"); // Japan archipelago

    // Oceania
    drawLandBlob(-25, 134, 180, 140, "#6c5132"); // Outback Australia
    drawLandBlob(-33, 148, 80, 90, "#2c4e28"); // East Coast Australia
    drawLandBlob(-42, 172, 35, 60, "#234c26"); // New Zealand

    // 3. NASA City Night Lights (golden urban glow speckles across continents)
    ctx.fillStyle = "#ffdf79";
    for (let i = 0; i < 2400; i++) {
      // Clustered near populated coasts & rivers
      const [x, y] = [Math.random() * 2048, Math.random() * 1024];
      const p = ctx.getImageData(x, y, 1, 1).data;
      // If on land (not dark ocean)
      if (p[1] > 35 && p[0] > 15) {
        ctx.fillStyle = Math.random() > 0.3 ? "#fed7aa" : "#fef08a";
        ctx.fillRect(x, y, 1.5, 1.5);
      }
    }

    const earthTexture = new THREE.CanvasTexture(textureCanvas);
    earthTexture.wrapS = THREE.RepeatWrapping;
    earthTexture.wrapT = THREE.ClampToEdgeWrapping;

    // 1. NASA Photorealistic Earth Sphere
    const earthGeo = new THREE.SphereGeometry(GLOBE_RADIUS, 64, 64);
    const earthMat = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.65,
      metalness: 0.15,
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    globeGroup.add(earthMesh);

    // 2. NASA Clouds Swirl Layer
    const cloudsCanvas = document.createElement("canvas");
    cloudsCanvas.width = 1024;
    cloudsCanvas.height = 512;
    const cCtx = cloudsCanvas.getContext("2d")!;
    cCtx.fillStyle = "rgba(0,0,0,0)";
    cCtx.fillRect(0, 0, 1024, 512);
    // Draw wispy atmospheric cloud bands
    cCtx.fillStyle = "rgba(255,255,255,0.32)";
    for (let i = 0; i < 60; i++) {
      const cx = Math.random() * 1024;
      const cy = 100 + Math.random() * 312;
      cCtx.beginPath();
      cCtx.ellipse(cx, cy, 80 + Math.random() * 120, 20 + Math.random() * 40, Math.random() * 0.4, 0, Math.PI * 2);
      cCtx.fill();
    }
    const cloudsTexture = new THREE.CanvasTexture(cloudsCanvas);
    cloudsTexture.wrapS = THREE.RepeatWrapping;

    const cloudsGeo = new THREE.SphereGeometry(GLOBE_RADIUS + 0.8, 64, 64);
    const cloudsMat = new THREE.MeshStandardMaterial({
      map: cloudsTexture,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
    });
    const cloudsMesh = new THREE.Mesh(cloudsGeo, cloudsMat);
    globeGroup.add(cloudsMesh);

    // 3. Atmospheric Rayleigh Scattering Halo (Blue ISS rim)
    const glowGeo = new THREE.SphereGeometry(GLOBE_RADIUS * 1.18, 64, 64);
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
          float intensity = pow(0.72 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.6);
          gl_FragColor = vec4(0.24, 0.68, 1.0, 1.0) * intensity * 0.65;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });
    const glowMesh = new THREE.Mesh(glowGeo, glowMat);
    scene.add(glowMesh);

    // 4. Starfield Background (Deep Cosmos)
    const starCount = 1400;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const dist = 380 + Math.random() * 450;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      starPositions[i * 3] = dist * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = dist * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = dist * Math.cos(phi);
    }
    const starsGeo = new THREE.BufferGeometry();
    starsGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const starsMat = new THREE.PointsMaterial({
      color: 0x94a3b8,
      size: 0.9,
      transparent: true,
      opacity: 0.5,
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

    // 5. City Markers & Pulsing Beacons
    const markerGroup = new THREE.Group();
    globeGroup.add(markerGroup);

    const markerMeshes: { mesh: THREE.Mesh; ring: THREE.Mesh; city: City }[] = [];

    cities.forEach((city) => {
      const pos = latLngToVector(city.lat, city.lng, GLOBE_RADIUS + 1.2);

      // Pin core
      const pinGeo = new THREE.SphereGeometry(1.8, 16, 16);
      const isBr = city.country === "Brazil";
      const pinMat = new THREE.MeshBasicMaterial({
        color: isBr ? 0x10b981 : 0xe8c374, // Emerald green for Brazilian stations, gold for world
      });
      const pinMesh = new THREE.Mesh(pinGeo, pinMat);
      pinMesh.position.copy(pos);
      pinMesh.userData = { city };

      // Outer pulse ring
      const ringGeo = new THREE.RingGeometry(2.6, 3.8, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: isBr ? 0x10b981 : 0xe8c374,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.copy(pos);
      ringMesh.lookAt(new THREE.Vector3(0, 0, 0));

      markerGroup.add(pinMesh);
      markerGroup.add(ringMesh);

      markerMeshes.push({ mesh: pinMesh, ring: ringMesh, city });
    });

    // Active City Orbit Ring
    const activeRingGeo = new THREE.RingGeometry(4.2, 5.8, 32);
    const activeRingMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    const activeRing = new THREE.Mesh(activeRingGeo, activeRingMat);
    activeRing.visible = false;
    markerGroup.add(activeRing);

    // Interaction Variables
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-999, -999);

    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let rotSpeedX = 0;
    let rotSpeedY = 0;
    let targetQuat: THREE.Quaternion | null = null;
    let targetZoom = 310;

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
        targetQuat = null;
      } else {
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
      isDragging = false;
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

    // Zoom & GPS trigger
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      targetZoom += e.deltaY * 0.22;
      targetZoom = Math.max(140, Math.min(460, targetZoom));

      // If user zooms in extremely close, smoothly trigger GPS Street Map!
      if (targetZoom <= 155 && selectedCityRef.current && onZoomIntoCityRef.current) {
        onZoomIntoCityRef.current(selectedCityRef.current);
        targetZoom = 230; // reset for when they return
      }
    };

    // Double click to zoom straight into street level GPS!
    const onDoubleClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const clickX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const clickY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(new THREE.Vector2(clickX, clickY), camera);
      const intersects = raycaster.intersectObjects(markerMeshes.map((m) => m.mesh));

      if (intersects.length > 0) {
        const hitCity = intersects[0].object.userData.city as City;
        if (hitCity && onZoomIntoCityRef.current) {
          onZoomIntoCityRef.current(hitCity);
        }
      } else if (selectedCityRef.current && onZoomIntoCityRef.current) {
        onZoomIntoCityRef.current(selectedCityRef.current);
      }
    };

    container.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    container.addEventListener("wheel", onWheel, { passive: false });
    container.addEventListener("dblclick", onDoubleClick);

    const flyToCity = (city: City) => {
      const pos = latLngToVector(city.lat, city.lng, 1);
      const targetVec = new THREE.Vector3(0, 0, 1);
      const q = new THREE.Quaternion().setFromUnitVectors(pos.normalize(), targetVec);
      targetQuat = q;
      targetZoom = 235;
    };

    if (selectedCity) {
      flyToCity(selectedCity);
    }

    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      const elapsed = clock.getElapsedTime();

      // Slow orbital rotation
      if (!isDragging && !targetQuat) {
        globeGroup.rotation.y += 0.0009;
        cloudsMesh.rotation.y += 0.0004; // Clouds drift independently
      }

      if (targetQuat) {
        globeGroup.quaternion.slerp(targetQuat, 0.045);
        if (globeGroup.quaternion.angleTo(targetQuat) < 0.002) {
          targetQuat = null;
        }
      }

      // Smooth camera zoom
      camera.position.z += (targetZoom - camera.position.z) * 0.08;

      // Pulse city markers
      markerMeshes.forEach((item, index) => {
        const isCurrent =
          selectedCityRef.current &&
          selectedCityRef.current.name === item.city.name;
        const scale = 1 + 0.35 * Math.sin(elapsed * 3 + index);
        item.ring.scale.set(scale, scale, 1);

        const mat = item.ring.material as THREE.MeshBasicMaterial;
        mat.opacity = 0.35 + 0.45 * Math.abs(Math.cos(elapsed * 3 + index));

        if (isCurrent) {
          activeRing.visible = true;
          activeRing.position.copy(item.mesh.position);
          activeRing.lookAt(new THREE.Vector3(0, 0, 0));
          const activeScale = 1.2 + 0.6 * Math.sin(elapsed * 5);
          activeRing.scale.set(activeScale, activeScale, 1);
        }
      });

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);
    (container as unknown as { flyToCity: (c: City) => void }).flyToCity = flyToCity;

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      container.removeEventListener("wheel", onWheel);
      container.removeEventListener("dblclick", onDoubleClick);
      window.removeEventListener("resize", handleResize);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      renderer.dispose();
      earthGeo.dispose();
      earthMat.dispose();
      earthTexture.dispose();
      cloudsGeo.dispose();
      cloudsMat.dispose();
      cloudsTexture.dispose();
      starsGeo.dispose();
      starsMat.dispose();
    };
  }, [cities]); // eslint-disable-line react-hooks/exhaustive-deps

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
