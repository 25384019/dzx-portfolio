import * as THREE from 'three';

interface EvolutionBranch {
  line: THREE.Line;
  geometry: THREE.BufferGeometry;
  basePoints: THREE.Vector3[];
  color: number;
  activationStart: number;
  activationEnd: number;
}

export class PhilosophyScene {
  public group: THREE.Group = new THREE.Group();
  public root: THREE.Group = new THREE.Group();

  // 1. Evolution Curve Branches
  private branches: EvolutionBranch[] = [];

  // 2. Decision / Refactoring Nodal Beacons
  private nodePoints: THREE.Points[] = [];
  private centralAnchor!: THREE.Mesh;
  private anchorRings: THREE.LineSegments[] = [];

  // 3. Precision Grid / Horizon datum line
  private horizonDatum!: THREE.Line;

  constructor() {
    this.root.position.set(0.0, 2.2, -20.5);
    this.group.add(this.root);

    this.buildEvolutionBranches();
    this.buildNodalAnchors();
    this.buildHorizonDatum();
  }

  private buildEvolutionBranches(): void {
    // 5 interlocking branching paths representing continuous refactoring & ideological evolution
    const branchConfigs = [
      // Branch 0: Main central trunk (PAST -> NOW -> FUTURE)
      {
        points: [
          new THREE.Vector3(-4.5, 0.0, 4.0),
          new THREE.Vector3(-2.0, 0.1, 2.0),
          new THREE.Vector3(0.0, 0.0, 0.0), // NOW Node
          new THREE.Vector3(2.2, 0.15, -2.5),
          new THREE.Vector3(4.8, 0.0, -5.0),
        ],
        col: 0xdfe7e0,
        start: 3.5,
        end: 4.8,
      },
      // Branch 1: High divergence path (Synthesizing new abstraction)
      {
        points: [
          new THREE.Vector3(-2.0, 0.1, 2.0),
          new THREE.Vector3(-0.8, 0.85, 1.2),
          new THREE.Vector3(0.5, 1.1, -0.6),
          new THREE.Vector3(2.2, 0.15, -2.5), // Reconverges
        ],
        col: 0x6e9eae,
        start: 3.7,
        end: 4.6,
      },
      // Branch 2: Lower systemic grounding path
      {
        points: [
          new THREE.Vector3(0.0, 0.0, 0.0),
          new THREE.Vector3(0.9, -0.75, -1.2),
          new THREE.Vector3(2.4, -0.9, -3.2),
          new THREE.Vector3(4.2, -0.4, -4.8),
        ],
        col: 0xb4c8d8,
        start: 3.9,
        end: 4.7,
      },
      // Branch 3: Speculative forward branch (Future architecture)
      {
        points: [
          new THREE.Vector3(2.2, 0.15, -2.5),
          new THREE.Vector3(3.0, 0.7, -3.6),
          new THREE.Vector3(4.5, 1.2, -5.2),
        ],
        col: 0xf2c8d0,
        start: 4.1,
        end: 4.9,
      },
      // Branch 4: Pre-convergence harmonic thread
      {
        points: [
          new THREE.Vector3(-4.0, -0.5, 3.5),
          new THREE.Vector3(-1.2, -0.3, 1.5),
          new THREE.Vector3(0.0, 0.0, 0.0),
        ],
        col: 0x6e9eae,
        start: 3.5,
        end: 4.2,
      },
    ];

    branchConfigs.forEach((cfg) => {
      const curve = new THREE.CatmullRomCurve3(cfg.points);
      const pts = curve.getPoints(80);
      const geo = new THREE.BufferGeometry().setFromPoints(pts);

      const mat = new THREE.LineBasicMaterial({
        color: cfg.col,
        transparent: true,
        opacity: 0.7,
      });

      const line = new THREE.Line(geo, mat);
      this.root.add(line);

      this.branches.push({
        line,
        geometry: geo,
        basePoints: pts,
        color: cfg.col,
        activationStart: cfg.start,
        activationEnd: cfg.end,
      });
    });
  }

  private buildNodalAnchors(): void {
    // Center NOW anchor node (where past converges and future branches)
    const anchorGeo = new THREE.OctahedronGeometry(0.18, 0);
    const anchorMat = new THREE.MeshBasicMaterial({
      color: 0xdfe7e0,
      wireframe: true,
      transparent: true,
      opacity: 0.85,
    });
    this.centralAnchor = new THREE.Mesh(anchorGeo, anchorMat);
    this.centralAnchor.position.set(0, 0, 0);
    this.root.add(this.centralAnchor);

    // Subtle calibration ring around NOW node
    const ringGeo = new THREE.RingGeometry(0.42, 0.44, 32);
    const ringMat = new THREE.LineBasicMaterial({
      color: 0x6e9eae,
      transparent: true,
      opacity: 0.5,
    });
    const ring = new THREE.LineSegments(new THREE.EdgesGeometry(ringGeo), ringMat);
    this.centralAnchor.add(ring);
    this.anchorRings.push(ring);

    // Nodal markers at key intersection points
    const nodeCoords = [
      new THREE.Vector3(-2.0, 0.1, 2.0),
      new THREE.Vector3(2.2, 0.15, -2.5),
      new THREE.Vector3(0.9, -0.75, -1.2),
      new THREE.Vector3(3.0, 0.7, -3.6),
    ];

    const posArray = new Float32Array(nodeCoords.length * 3);
    nodeCoords.forEach((pt, i) => {
      posArray[i * 3] = pt.x;
      posArray[i * 3 + 1] = pt.y;
      posArray[i * 3 + 2] = pt.z;
    });

    const ptsGeo = new THREE.BufferGeometry();
    ptsGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const ptsMat = new THREE.PointsMaterial({
      size: 0.08,
      color: 0xb4c8d8,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    const nodes = new THREE.Points(ptsGeo, ptsMat);
    this.root.add(nodes);
    this.nodePoints.push(nodes);
  }

  private buildHorizonDatum(): void {
    // Ultra-fine datum line in the background ground plane providing calm spatial orientation
    const lineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-8.0, -1.8, -2.0),
      new THREE.Vector3(8.0, -1.8, -2.0),
    ]);
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x223545,
      transparent: true,
      opacity: 0.35,
    });
    this.horizonDatum = new THREE.Line(lineGeo, lineMat);
    this.root.add(this.horizonDatum);
  }

  public update(time: number, _dt: number, progress: number): void {
    // Visibility window around Chapter 4 (PHILOSOPHY: progress 3.4 -> 4.8)
    const fadeIn = THREE.MathUtils.smoothstep(progress, 3.3, 3.9);
    const fadeOut = 1.0 - THREE.MathUtils.smoothstep(progress, 4.4, 4.95);
    const overallAlpha = fadeIn * fadeOut;

    const isVisible = overallAlpha > 0.005;
    this.group.visible = isVisible;
    if (!isVisible) return;

    // Center anchor gentle rotation
    if (this.centralAnchor) {
      this.centralAnchor.rotation.y = time * 0.25;
      this.centralAnchor.rotation.x = time * 0.15;
      (this.centralAnchor.material as THREE.MeshBasicMaterial).opacity = 0.85 * overallAlpha;
    }

    this.anchorRings.forEach((ring) => {
      ring.rotation.z = time * 0.35;
    });

    // Dynamic branch illumination based on scroll progress
    // As progress advances, past branches soften and future branches ignite
    this.branches.forEach((b) => {
      const branchProgress = THREE.MathUtils.smoothstep(progress, b.activationStart, b.activationEnd);
      // Subtle laser pulse traveling along the line
      const pulse = Math.sin(time * 2.0 + b.activationStart * 4) * 0.15;
      const branchAlpha = Math.max(0.15, branchProgress) * (0.65 + pulse) * overallAlpha;
      (b.line.material as THREE.LineBasicMaterial).opacity = branchAlpha;
    });

    this.nodePoints.forEach((pts) => {
      (pts.material as THREE.PointsMaterial).opacity = 0.8 * overallAlpha;
    });

    if (this.horizonDatum) {
      (this.horizonDatum.material as THREE.LineBasicMaterial).opacity = 0.35 * overallAlpha;
    }
  }

  public dispose(): void {
    this.group.traverse((child) => {
      if (child instanceof THREE.Mesh || child instanceof THREE.Line || child instanceof THREE.LineSegments || child instanceof THREE.Points) {
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
