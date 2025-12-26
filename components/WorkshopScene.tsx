
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface WorkshopSceneProps {
  isOrbiting: boolean;
  onOrbitComplete: () => void;
}

const WorkshopScene: React.FC<WorkshopSceneProps> = ({ isOrbiting, onOrbitComplete }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const orbitAngleRef = useRef(0);
  // Fix: Added explicit initial value 'undefined' to match expected argument count for useRef
  const animationFrameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0c1421);
    scene.fog = new THREE.FogExp2(0x0c1421, 0.02);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffaa66, 2, 20);
    pointLight.position.set(0, 2, 0);
    pointLight.castShadow = true;
    scene.add(pointLight);

    // Floor
    const floorGeo = new THREE.PlaneGeometry(30, 30);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x3d2b1f });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Particles (Snow/Dust)
    const particleCount = 400;
    const particleGeo = new THREE.BufferGeometry();
    const posArray = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 20;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.04,
      color: 0xffffff,
      transparent: true,
      opacity: 0.5,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Walls
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x4a3423 });
    const wall1 = new THREE.Mesh(new THREE.BoxGeometry(30, 10, 0.5), wallMat);
    wall1.position.z = -5; wall1.position.y = 5;
    scene.add(wall1);

    const wall2 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 10, 30), wallMat);
    wall2.position.x = -15; wall2.position.y = 5;
    scene.add(wall2);

    // Tree
    const treeGroup = new THREE.Group();
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x0a5c0a });
    for (let i = 0; i < 3; i++) {
      const leaf = new THREE.Mesh(new THREE.ConeGeometry(2 - i * 0.5, 2, 8), leafMat);
      leaf.position.y = 1 + i * 1.2;
      leaf.castShadow = true;
      treeGroup.add(leaf);
    }
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 1), new THREE.MeshStandardMaterial({ color: 0x3d2b1f }));
    trunk.position.y = 0.5;
    treeGroup.add(trunk);
    treeGroup.position.set(5, 0, -3);
    scene.add(treeGroup);

    // Fireplace
    const fireplace = new THREE.Group();
    const brickMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
    const frame = new THREE.Mesh(new THREE.BoxGeometry(4, 3, 1), brickMat);
    frame.position.y = 1.5;
    fireplace.add(frame);
    const hearth = new THREE.Mesh(new THREE.BoxGeometry(3, 1.5, 0.8), new THREE.MeshStandardMaterial({ color: 0x111111 }));
    hearth.position.y = 1; hearth.position.z = 0.2;
    fireplace.add(hearth);
    const fireGlow = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 8), new THREE.MeshBasicMaterial({ color: 0xff4500 }));
    fireGlow.position.set(0, 0.8, 0.3);
    fireplace.add(fireGlow);
    fireplace.position.set(-8, 0, -4);
    scene.add(fireplace);

    const elves: THREE.Group[] = [];
    const elfColors = [0xff0000, 0x00ff00, 0xffff00];
    for (let i = 0; i < 3; i++) {
      const elf = new THREE.Group();
      const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.3, 0.6, 4, 8), new THREE.MeshStandardMaterial({ color: elfColors[i] }));
      body.position.y = 0.6; elf.add(body);
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8), new THREE.MeshStandardMaterial({ color: 0xffdbac }));
      head.position.y = 1.2; elf.add(head);
      const hat = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.4, 8), new THREE.MeshStandardMaterial({ color: elfColors[i] }));
      hat.position.y = 1.6; elf.add(hat);
      const box = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), new THREE.MeshStandardMaterial({ color: 0xcccccc }));
      box.position.set(0, 0.6, 0.5); elf.add(box);
      elf.position.set(-4 + i * 4, 0, 2);
      scene.add(elf);
      elves.push(elf);
    }

    const table = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.2, 1, 16), new THREE.MeshStandardMaterial({ color: 0x5c4033 }));
    table.position.set(0, 0.5, -2);
    scene.add(table);
    const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.4, 8), new THREE.MeshStandardMaterial({ color: 0xffffff }));
    mug.position.set(0, 1.2, -2);
    scene.add(mug);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      const time = Date.now() * 0.002;
      elves.forEach((elf, idx) => {
        elf.position.x += Math.sin(time + idx) * 0.02;
        elf.rotation.y = Math.sin(time + idx) * 0.2;
        elf.position.y = Math.abs(Math.sin(time * 2 + idx)) * 0.1;
      });
      fireGlow.scale.setScalar(1 + Math.sin(time * 5) * 0.2);
      pointLight.intensity = 2 + Math.sin(time * 5) * 0.5;

      // Particles animation
      particles.rotation.y += 0.0005;
      const positions = particles.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] -= 0.005;
        if (positions[i * 3 + 1] < -2) positions[i * 3 + 1] = 8;
      }
      particles.geometry.attributes.position.needsUpdate = true;

      if (isOrbiting) {
        orbitAngleRef.current += 0.005;
        const radius = 15;
        camera.position.x = Math.sin(orbitAngleRef.current) * radius;
        camera.position.z = Math.cos(orbitAngleRef.current) * radius;
        camera.position.y = 5;
        camera.lookAt(0, 2, 0);
        if (orbitAngleRef.current >= Math.PI * 2) onOrbitComplete();
      } else {
        camera.position.lerp(new THREE.Vector3(0, 3, 10), 0.05);
        camera.lookAt(0, 1, 0);
      }
      renderer.render(scene, camera);
    };

    animate();
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
      scene.traverse((o) => { if (o instanceof THREE.Mesh || o instanceof THREE.Points) { o.geometry.dispose(); if (Array.isArray(o.material)) o.material.forEach(m => m.dispose()); else o.material.dispose(); } });
    };
  }, [isOrbiting, onOrbitComplete]);

  return <div ref={mountRef} className="absolute inset-0 z-0" />;
};

export default WorkshopScene;
