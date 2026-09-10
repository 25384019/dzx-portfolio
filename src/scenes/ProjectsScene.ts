import * as THREE from 'three';

export class ProjectsScene {
  public group: THREE.Group = new THREE.Group();
  private pedestalRoot: THREE.Group = new THREE.Group();
  private basePlatform!: THREE.Mesh;
  private baseRim!: THREE.LineSegments;
  private holoDisplay!: THREE.Mesh;
  private ringConduits: THREE.LineSegments[] = [];
  private dataGrid!: THREE.GridHelper;
  private matrixCubes: THREE.Mesh[] = [];

  constructor() {
    this.buildPedestalArchitecture();
    this.buildHolographicMatrix();
    this.group.add(this.pedestalRoot);
    this.pedestalRoot.position.set(0.5, 0.4, -7.0);
  }

  private buildPedestalArchitecture(): void {
    // 1. Floating base circular platform
    const baseGeo = new THREE.CylinderGeometry(2.4, 2.7, 0.35, 36);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x070c14,
      roughness: 0.16,
      metalness: 0.88,
      transparent: true,
      opacity: 0.92,
    });
    this.basePlatform = new THREE.Mesh(baseGeo, baseMat);
    this.pedestalRoot.add(this.basePlatform);

    // Glowing Cyan Rim on pedestal
    const rimGeo = new THREE.EdgesGeometry(baseGeo);
    const rimMat = new THREE.LineBasicMaterial({
      color: 0x6e9eae,
      transparent: true,
      opacity: 0.7,
    });
    this.baseRim = new THREE.LineSegments(rimGeo, rimMat);
    this.basePlatform.add(this.baseRim);

    // 2. Spatial Data Grid under the pedestal
    this.dataGrid = new THREE.GridHelper(12, 24, 0x6e9eae, 0x152230);
    this.dataGrid.position.y = -0.4;
    (this.dataGrid.material as THREE.Material).transparent = true;
    (this.dataGrid.material as THREE.Material).opacity = 0.35;
    this.pedestalRoot.add(this.dataGrid);

    // 3. Concentric Orbiting Energy Rings
    const ringRadii = [1.6, 2.2, 3.1];
    const ringColors = [0x6e9eae, 0xb4c8d8, 0xf2c8d0];

    ringRadii.forEach((r, idx) => {
      const ringGeo = new THREE.RingGeometry(r, r + 0.04, 48);
      const ringMat = new THREE.LineBasicMaterial({
        color: ringColors[idx],
        transparent: true,
        opacity: 0.45,
      });
      const ring = new THREE.LineSegments(new THREE.EdgesGeometry(ringGeo), ringMat);
      ring.rotation.x = Math.PI * 0.5;
      ring.position.y = 0.2 + idx * 0.25;
      this.pedestalRoot.add(ring);
      this.ringConduits.push(ring);
    });
  }

  private buildHolographicMatrix(): void {
    // XiaoZhaiOS Holographic OS Interface floating disc / frame
    const displayGeo = new THREE.PlaneGeometry(2.4, 1.45);
    const displayMat = new THREE.MeshBasicMaterial({
      color: 0x6e9eae,
      wireframe: true,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
    });
    this.holoDisplay = new THREE.Mesh(displayGeo, displayMat);
    this.holoDisplay.position.set(0, 1.4, 0);
    this.holoDisplay.rotation.y = -0.22;
    this.pedestalRoot.add(this.holoDisplay);

    // Floating Data Matrix Nodes surrounding the pedestal
    const cubeGeo = new THREE.BoxGeometry(0.24, 0.24, 0.24);
    const cubeMat = new THREE.MeshBasicMaterial({
      color: 0xb4c8d8,
      wireframe: true,
      transparent: true,
      opacity: 0.55,
    });

    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const cube = new THREE.Mesh(cubeGeo, cubeMat.clone());
      cube.position.set(Math.cos(angle) * 1.8, 0.8 + (i % 3) * 0.35, Math.sin(angle) * 1.8);
      this.pedestalRoot.add(cube);
      this.matrixCubes.push(cube);
    }
  }

  /**
   * Continuous materialization driven by scroll progress.
   * Pedestal and holographic interface dynamically assemble as camera approaches Chapter 2.
   */
  public update(time: number, _dt: number, progress: number): void {
    // Materialization factor: 0 at progress <= 1.0 -> 1 at progress = 2.0
    const formFactor = THREE.MathUtils.smoothstep(progress, 1.05, 1.95);
    // Exit fade when moving deep into Chapter 3
    const exitFactor = 1.0 - THREE.MathUtils.smoothstep(progress, 2.65, 3.4);
    const overallAlpha = formFactor * exitFactor;

    const isVisible = overallAlpha > 0.01;
    this.group.visible = isVisible;
    if (!isVisible) return;

    // Physical assembly scale & elevation
    const scaleY = THREE.MathUtils.lerp(0.1, 1.0, formFactor);
    const scaleXZ = THREE.MathUtils.lerp(0.4, 1.0, formFactor);
    this.pedestalRoot.scale.set(scaleXZ, scaleY, scaleXZ);

    // Pedestal base platform opacity
    (this.basePlatform.material as THREE.MeshStandardMaterial).opacity = 0.92 * overallAlpha;
    (this.baseRim.material as THREE.LineBasicMaterial).opacity = 0.7 * overallAlpha;
    (this.dataGrid.material as THREE.Material).opacity = 0.35 * overallAlpha;

    // Holographic display floating breath
    if (this.holoDisplay) {
      this.holoDisplay.position.y = 1.4 + Math.sin(time * 1.2) * 0.08;
      this.holoDisplay.rotation.y = -0.22 + Math.sin(time * 0.6) * 0.08;
      (this.holoDisplay.material as THREE.MeshBasicMaterial).opacity = 0.6 * overallAlpha;
    }

    // Energy rings counter-rotation
    this.ringConduits.forEach((ring, idx) => {
      ring.rotation.z = time * (0.08 + idx * 0.04) * (idx % 2 === 0 ? 1 : -1);
      (ring.material as THREE.LineBasicMaterial).opacity = 0.45 * overallAlpha;
    });

    // Matrix cubes gentle orbit & spin
    this.matrixCubes.forEach((c, idx) => {
      c.rotation.x = time * 0.2 + idx;
      c.rotation.y = time * 0.3 + idx;
      c.position.y += Math.sin(time * 1.5 + idx) * 0.002;
      (c.material as THREE.MeshBasicMaterial).opacity = 0.55 * overallAlpha;
    });
  }

  public dispose(): void {
    this.group.traverse((child) => {
      if (child instanceof THREE.Mesh || child instanceof THREE.LineSegments || child instanceof THREE.GridHelper) {
        child.geometry?.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => m.dispose());
        } else {
          child.material?.dispose();
        }
      }
    });
  }
}

