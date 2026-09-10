import * as THREE from 'three';

export class AboutScene {
  public group: THREE.Group = new THREE.Group();
  private matrixNodes!: THREE.Points;
  private matrixLines!: THREE.LineSegments;
  private haloRings: THREE.LineSegments[] = [];

  constructor() {
    this.buildSynapticMatrix();
    this.buildHaloAnchors();
  }

  private buildSynapticMatrix(): void {
    // Background synaptic matrix nodes that visually bridge ABOUT to the deep PROJECTS world
    const count = 160;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const cCyan = new THREE.Color(0x6e9eae);
    const cBlue = new THREE.Color(0xb4c8d8);
    const cPink = new THREE.Color(0xf2c8d0);

    for (let i = 0; i < count; i++) {
      // Clustered along the corridor leading from ABOUT (Z: -2) into PROJECTS (Z: -7)
      positions[i * 3] = (Math.random() - 0.5) * 8.0;
      positions[i * 3 + 1] = 0.8 + Math.random() * 3.5;
      positions[i * 3 + 2] = -2.0 - Math.random() * 6.5;

      const pick = Math.random();
      const col = pick < 0.5 ? cCyan : pick < 0.85 ? cBlue : cPink;
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.07,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });
    this.matrixNodes = new THREE.Points(geo, mat);
    this.group.add(this.matrixNodes);

    // Connecting longitudinal data threads extending towards PROJECTS
    const lineCoords: number[] = [];
    for (let i = 0; i < count - 4; i += 3) {
      lineCoords.push(
        positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2],
        positions[(i + 1) * 3], positions[(i + 1) * 3 + 1], positions[(i + 1) * 3 + 2]
      );
    }

    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(lineCoords, 3));
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x6e9eae,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
    });
    this.matrixLines = new THREE.LineSegments(lineGeo, lineMat);
    this.group.add(this.matrixLines);
  }

  private buildHaloAnchors(): void {
    // 3 subtle holographic reticle rings marking the spatial anchor of each ABOUT module
    const anchorPositions = [
      new THREE.Vector3(-2.4, 2.9, -1.6), // COGNITION
      new THREE.Vector3(0.1, 1.8, -2.6),  // SYSTEM
      new THREE.Vector3(2.6, 1.1, -3.4),  // BODY / AESTHETICS
    ];
    const colors = [0x6e9eae, 0xb4c8d8, 0xf2c8d0];

    anchorPositions.forEach((pos, idx) => {
      const ringGeo = new THREE.RingGeometry(0.85, 0.88, 32);
      const ringMat = new THREE.LineBasicMaterial({
        color: colors[idx],
        transparent: true,
        opacity: 0.35,
      });
      const ring = new THREE.LineSegments(new THREE.EdgesGeometry(ringGeo), ringMat);
      ring.position.copy(pos);
      this.group.add(ring);
      this.haloRings.push(ring);
    });
  }

  public update(time: number, _dt: number, progress: number): void {
    // Smoothbell curve around Chapter 1: peaks at progress = 1.0
    const fadeIn = THREE.MathUtils.smoothstep(progress, 0.35, 0.95);
    const fadeOut = 1.0 - THREE.MathUtils.smoothstep(progress, 1.45, 2.15);
    const alpha = fadeIn * fadeOut;

    const isVisible = alpha > 0.01;
    this.group.visible = isVisible;
    if (!isVisible) return;

    if (this.matrixNodes) {
      (this.matrixNodes.material as THREE.PointsMaterial).opacity = 0.65 * alpha;
      this.matrixNodes.rotation.y = time * 0.02;
    }

    if (this.matrixLines) {
      (this.matrixLines.material as THREE.LineBasicMaterial).opacity = (0.2 + Math.sin(time * 0.8) * 0.06) * alpha;
    }

    this.haloRings.forEach((ring, idx) => {
      ring.rotation.z = time * (0.1 + idx * 0.05);
      (ring.material as THREE.LineBasicMaterial).opacity = 0.35 * alpha;
    });
  }

  public dispose(): void {
    this.group.traverse((child) => {
      if (child instanceof THREE.Mesh || child instanceof THREE.LineSegments || child instanceof THREE.Points) {
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

