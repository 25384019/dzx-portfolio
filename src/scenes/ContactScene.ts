import * as THREE from 'three';

/**
 * ContactScene — Terminal Horizon (Chapter 05)
 *
 * Visual Concept: "The edge of the digital world."
 * - Super-fine horizontal/slight perspective horizon line on the right half of space.
 * - 4 micro luminous beacon points with slow organic drift along the horizon.
 * - Periodic gentle Sakura Pink pulse wave (~4.5s cycle).
 * - Ultra-low opacity, zero polyhedrons, zero HUD, zero node networks.
 * - Zero-GC hot loop execution.
 */
export class ContactScene {
  public group: THREE.Group = new THREE.Group();

  // Terminal Horizon line & micro parallel guide
  private horizonLine!: THREE.Line;
  private microGuideLine!: THREE.Line;
  private horizonGeo!: THREE.BufferGeometry;
  private guideGeo!: THREE.BufferGeometry;

  // 4 Micro Horizon Beacon Points
  private beaconPoints: THREE.Mesh[] = [];
  private beaconMaterials: THREE.MeshBasicMaterial[] = [];
  private beaconBaseColors: THREE.Color[] = [];
  private pinkColor: THREE.Color = new THREE.Color(0xf2c8d0);
  private cyanColor: THREE.Color = new THREE.Color(0x6e9eae);
  private mistColor: THREE.Color = new THREE.Color(0xb4c8d8);

  // Pre-allocated scratch color for zero-GC lerp
  private _tmpColor: THREE.Color = new THREE.Color();

  constructor() {
    this.buildHorizonLines();
    this.buildBeaconPoints();
    this.group.visible = false;
  }

  private buildHorizonLines(): void {
    // Primary Terminal Horizon Line:
    // Placed in mid-lower viewport (Y ~ 1.70, Z ~ -30.5)
    // Spanning the right half of the horizon (X: -0.2 -> 5.6)
    const pts = [
      new THREE.Vector3(-0.2, 1.68, -30.5),
      new THREE.Vector3(5.6, 1.72, -30.2),
    ];
    this.horizonGeo = new THREE.BufferGeometry().setFromPoints(pts);
    const horizonMat = new THREE.LineBasicMaterial({
      color: 0x6e9eae,
      transparent: true,
      opacity: 0.22,
    });
    this.horizonLine = new THREE.Line(this.horizonGeo, horizonMat);
    this.group.add(this.horizonLine);

    // Parallel micro-faint auxiliary guide line
    const guidePts = [
      new THREE.Vector3(1.2, 1.62, -30.4),
      new THREE.Vector3(4.8, 1.65, -30.2),
    ];
    this.guideGeo = new THREE.BufferGeometry().setFromPoints(guidePts);
    const guideMat = new THREE.LineBasicMaterial({
      color: 0xb4c8d8,
      transparent: true,
      opacity: 0.08,
    });
    this.microGuideLine = new THREE.Line(this.guideGeo, guideMat);
    this.group.add(this.microGuideLine);
  }

  private buildBeaconPoints(): void {
    // 4 minimal micro beacon points along the horizon line
    const pointConfigs = [
      { x: 0.8, y: 1.685, z: -30.45, speed: 0.18, offset: 0.0, baseCol: this.mistColor },
      { x: 2.1, y: 1.695, z: -30.38, speed: 0.24, offset: 1.6, baseCol: this.cyanColor },
      { x: 3.5, y: 1.705, z: -30.30, speed: 0.15, offset: 3.2, baseCol: this.mistColor },
      { x: 4.7, y: 1.715, z: -30.22, speed: 0.20, offset: 4.8, baseCol: this.cyanColor },
    ];

    const sphereGeo = new THREE.SphereGeometry(0.024, 8, 8);

    pointConfigs.forEach((cfg) => {
      const mat = new THREE.MeshBasicMaterial({
        color: cfg.baseCol.clone(),
        transparent: true,
        opacity: 0.35,
      });
      const mesh = new THREE.Mesh(sphereGeo, mat);
      mesh.position.set(cfg.x, cfg.y, cfg.z);
      mesh.userData = {
        baseX: cfg.x,
        baseY: cfg.y,
        baseZ: cfg.z,
        speed: cfg.speed,
        offset: cfg.offset,
      };

      this.group.add(mesh);
      this.beaconPoints.push(mesh);
      this.beaconMaterials.push(mat);
      this.beaconBaseColors.push(cfg.baseCol);
    });
  }

  public update(time: number, _dt: number, progress: number): void {
    // Visibility window: smooth fade in as progress approaches Chapter 5 (peaks at progress 5.0)
    const alpha = THREE.MathUtils.smoothstep(progress, 4.45, 4.95);
    const isVisible = alpha > 0.004;
    this.group.visible = isVisible;
    if (!isVisible) return;

    // Line opacity
    (this.horizonLine.material as THREE.LineBasicMaterial).opacity = 0.22 * alpha;
    (this.microGuideLine.material as THREE.LineBasicMaterial).opacity = 0.08 * alpha;

    // Periodic gentle Sakura Pink pulse wave across beacon points (~4.5s cycle)
    const pulseCycle = (time * 0.22) % 1.0;
    const pulseWave = Math.sin(pulseCycle * Math.PI); // 0 -> 1 -> 0

    this.beaconPoints.forEach((pt, idx) => {
      const { baseX, baseY, baseZ, speed, offset } = pt.userData;
      // Very slow subtle horizontal drift
      const drift = Math.sin(time * speed + offset) * 0.15;
      pt.position.x = baseX + drift;
      pt.position.y = baseY + drift * 0.007; // slope matches line
      pt.position.z = baseZ;

      const mat = this.beaconMaterials[idx];
      const baseCol = this.beaconBaseColors[idx];

      // Points 1 & 2 breathe a faint sakura pink pulse
      if (idx === 1 || idx === 2) {
        this._tmpColor.copy(baseCol).lerp(this.pinkColor, pulseWave * 0.5);
        mat.color.copy(this._tmpColor);
        mat.opacity = (0.32 + pulseWave * 0.28) * alpha;
      } else {
        mat.opacity = (0.28 + Math.sin(time * 0.75 + idx) * 0.12) * alpha;
      }
    });
  }

  public dispose(): void {
    this.group.traverse((child) => {
      if (child instanceof THREE.Mesh || child instanceof THREE.Line) {
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
