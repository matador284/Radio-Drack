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

    // --- PHOTOREALISTIC NASA / GOOGLE EARTH TEXTURES ---
    const textureLoader = new THREE.TextureLoader();
    
    // 1. High-Res NASA Blue Marble Day & Specular Textures
    const earthMap = textureLoader.load("/textures/earth_atmos_2048.jpg");
    earthMap.colorSpace = THREE.SRGBColorSpace;

    const earthSpecular = textureLoader.load("/textures/earth_specular_2048.jpg");

    const earthGeo = new THREE.SphereGeometry(GLOBE_RADIUS, 64, 64);
    const earthMat = new THREE.MeshPhongMaterial({
      map: earthMap,
      specularMap: earthSpecular,
      specular: new THREE.Color(0x334e68),
      shininess: 25,
      bumpScale: 0.05,
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    globeGroup.add(earthMesh);

    // 2. NASA Floating Atmospheric Cloud Sphere
    const cloudsMap = textureLoader.load("/textures/earth_clouds_1024.png");
    const cloudsGeo = new THREE.SphereGeometry(GLOBE_RADIUS * 1.008, 64, 64);
    const cloudsMat = new THREE.MeshPhongMaterial({
      map: cloudsMap,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
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
          gl_FragColor = vec4(0.22, 0.65, 1.0, 1.0) * intensity * 0.75;
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

    // Touch Pinch-to-Zoom for Mobile & Tablet
    let initialPinchDistance = 0;
    let initialPinchZoom = 310;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        initialPinchDistance = Math.hypot(dx, dy);
        initialPinchZoom = targetZoom;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && initialPinchDistance > 0) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        const factor = initialPinchDistance / dist;
        targetZoom = Math.max(140, Math.min(460, initialPinchZoom * factor));

        if (targetZoom <= 155 && selectedCityRef.current && onZoomIntoCityRef.current) {
          onZoomIntoCityRef.current(selectedCityRef.current);
          targetZoom = 230;
        }
      }
    };

    container.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    container.addEventListener("touchstart", onTouchStart, { passive: true });
    container.addEventListener("touchmove", onTouchMove, { passive: false });
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
      container.removeEventListener("touchstart", onTouchStart);
      container.removeEventListener("touchmove", onTouchMove);
      container.removeEventListener("wheel", onWheel);
      container.removeEventListener("dblclick", onDoubleClick);
      window.removeEventListener("resize", handleResize);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      renderer.dispose();
      earthGeo.dispose();
      earthMat.dispose();
      earthMap.dispose();
      earthSpecular.dispose();
      cloudsGeo.dispose();
      cloudsMat.dispose();
      cloudsMap.dispose();
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
