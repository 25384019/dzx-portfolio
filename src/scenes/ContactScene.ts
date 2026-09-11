import * as THREE from 'three';

/**
 * ContactScene — Terminal Horizon (Chapter 05)
 *
 * Visual Concept: "The edge of the digital world."
 * - Super-fine horizontal line on the right half of space with subtle perspective depth.
 * - Near-to-far brightness/opacity gradient (0.22 -> 0.022) so the right edge softly dissolves into space.
 * - 4 micro luminous beacon points with non-uniform spacing, size attenuation, and opacity gradient.
 * - Periodic gentle Sakura Pink pulse wave (~4.5s cycle) across mid-beacons.
 * - Ultra-low opacity, zero polyhedrons, zero HUD, zero node networks.
 * - low-allocation update path.
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

  // Pre-allocated scratch color for low-allocation lerp
  private _tmpColor: THREE.Color = new THREE.Color();

  constructor() {
    this.buildHorizonLines();
    this.buildBeaconPoints();
    this.group.visible = false;
  }

  private buildHorizonLines(): void {
    // Primary Terminal Horizon Line:
    // Spans right half of the horizon (X: 0.1 -> 6.2, Y: 1.68 -> 1.64, Z: -29.6 -> -33.2)
    // Very gentle perspective inclination (~4° on screen) with subtle recession into Z depth.
    const segments = 32;
    const positions = new Float32Array((segments + 1) * 3);
    const colors = new Float32Array((segments + 1) * 3);

    const pStart = new THREE.Vector3(0.1, 1.68, -29.6);
    const pEnd = new THREE.Vector3(6.2, 1.64, -33.2);
    const baseColor = this.cyanColor;

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      positions[i * 3] = THREE.MathUtils.lerp(pStart.x, pEnd.x, t);
      positions[i * 3 + 1] = THREE.MathUtils.lerp(pStart.y, pEnd.y, t);
      positions[i * 3 + 2] = THREE.MathUtils.lerp(pStart.z, pEnd.z, t);

      // Gradient: brightness fades from 0.22 at near end to 0.022 at far end
      // Right end seamlessly dissolves into dark space
      const fade = Math.pow(1.0 - t, 1.35);
      const intensity = THREE.MathUtils.lerp(0.022, 0.22, fade);

      colors[i * 3] = baseColor.r * intensity;
      colors[i * 3 + 1] = baseColor.g * intensity;
      colors[i * 3 + 2] = baseColor.b * intensity;
    }

    this.horizonGeo = new THREE.BufferGeometry();
    this.horizonGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.horizonGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const horizonMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending,
    });
    this.horizonLine = new THREE.Line(this.horizonGeo, horizonMat);
    this.group.add(this.horizonLine);

    // Parallel micro-faint auxiliary guide line (shorter span, fainter gradient)
    const guideSegments = 20;
    const guidePositions = new Float32Array((guideSegments + 1) * 3);
    const guideColors = new Float32Array((guideSegments + 1) * 3);

    const gStart = new THREE.Vector3(1.3, 1.62, -30.2);
    const gEnd = new THREE.Vector3(4.5, 1.59, -32.3);
    const guideBaseColor = this.mistColor;

    for (let i = 0; i <= guideSegments; i++) {
      const t = i / guideSegments;
      guidePositions[i * 3] = THREE.MathUtils.lerp(gStart.x, gEnd.x, t);
      guidePositions[i * 3 + 1] = THREE.MathUtils.lerp(gStart.y, gEnd.y, t);
      guidePositions[i * 3 + 2] = THREE.MathUtils.lerp(gStart.z, gEnd.z, t);

      const fade = Math.pow(1.0 - t, 1.2);
      const intensity = THREE.MathUtils.lerp(0.008, 0.08, fade);

      guideColors[i * 3] = guideBaseColor.r * intensity;
      guideColors[i * 3 + 1] = guideBaseColor.g * intensity;
      guideColors[i * 3 + 2] = guideBaseColor.b * intensity;
    }

    this.guideGeo = new THREE.BufferGeometry();
    this.guideGeo.setAttribute('position', new THREE.BufferAttribute(guidePositions, 3));
    this.guideGeo.setAttribute('color', new THREE.BufferAttribute(guideColors, 3));

    const guideMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending,
    });
    this.microGuideLine = new THREE.Line(this.guideGeo, guideMat);
    this.group.add(this.microGuideLine);
  }

  private buildBeaconPoints(): void {
    // 4 micro beacon points with non-uniform distribution:
    // - Irregular spacing: gaps = 1.35, 0.85 (cluster), 1.95 (distant reach)
    // - Size attenuation: radius 0.026 -> 0.022 -> 0.017 -> 0.012
    // - Opacity attenuation: 0.42 -> 0.34 -> 0.26 -> 0.16 (furthest is faint and ethereal)
    const pointConfigs = [
      {
        x: 0.95,
        y: 1.674,
        z: -30.10,
        radius: 0.026,
        baseOpacity: 0.42,
        speed: 0.16,
        offset: 0.0,
        driftAmp: 0.14,
        baseCol: this.cyanColor,
      },
      {
        x: 2.30,
        y: 1.666,
        z: -30.90,
        radius: 0.022,
        baseOpacity: 0.34,
        speed: 0.22,
        offset: 1.5,
        driftAmp: 0.11,
        baseCol: this.cyanColor,
      },
      {
        x: 3.15,
        y: 1.660,
        z: -31.40,
        radius: 0.017,
        baseOpacity: 0.26,
        speed: 0.18,
        offset: 3.0,
        driftAmp: 0.08,
        baseCol: this.mistColor,
      },
      {
        x: 5.10,
        y: 1.647,
        z: -32.55,
        radius: 0.012,
        baseOpacity: 0.16,
        speed: 0.12,
        offset: 4.5,
        driftAmp: 0.05,
        baseCol: this.mistColor,
      },
    ];

    const slopeY = -0.0065;
    const slopeZ = -0.59;

    pointConfigs.forEach((cfg) => {
      const sphereGeo = new THREE.SphereGeometry(cfg.radius, 12, 12);
      const mat = new THREE.MeshBasicMaterial({
        color: cfg.baseCol.clone(),
        transparent: true,
        opacity: cfg.baseOpacity,
        blending: THREE.AdditiveBlending,
      });
      const mesh = new THREE.Mesh(sphereGeo, mat);
      mesh.position.set(cfg.x, cfg.y, cfg.z);
      mesh.userData = {
        baseX: cfg.x,
        baseY: cfg.y,
        baseZ: cfg.z,
        baseOpacity: cfg.baseOpacity,
        speed: cfg.speed,
        offset: cfg.offset,
        driftAmp: cfg.driftAmp,
        slopeY,
        slopeZ,
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

    // Line material opacity scales with chapter progress
    (this.horizonLine.material as THREE.LineBasicMaterial).opacity = alpha;
    (this.microGuideLine.material as THREE.LineBasicMaterial).opacity = alpha;

    // Periodic gentle Sakura Pink pulse wave across mid-beacons (~4.5s cycle)
    const pulseCycle = (time * 0.22) % 1.0;
    const pulseWave = Math.sin(pulseCycle * Math.PI); // 0 -> 1 -> 0

    // Low-allocation update loop
    const count = this.beaconPoints.length;
    for (let i = 0; i < count; i++) {
      const pt = this.beaconPoints[i];
      const ud = pt.userData;
      const drift = Math.sin(time * ud.speed + ud.offset) * ud.driftAmp;
      pt.position.x = ud.baseX + drift;
      pt.position.y = ud.baseY + drift * ud.slopeY;
      pt.position.z = ud.baseZ + drift * ud.slopeZ;

      const mat = this.beaconMaterials[i];
      const baseCol = this.beaconBaseColors[i];

      if (i === 1) {
        // Beacon 1 breathes gentle Sakura Pink pulse
        this._tmpColor.copy(baseCol).lerp(this.pinkColor, pulseWave * 0.45);
        mat.color.copy(this._tmpColor);
        mat.opacity = (ud.baseOpacity + pulseWave * 0.22) * alpha;
      } else if (i === 2) {
        // Beacon 2 breathes Sakura Pink with phase offset
        const lagWave = Math.sin(((pulseCycle + 0.18) % 1.0) * Math.PI);
        this._tmpColor.copy(baseCol).lerp(this.pinkColor, lagWave * 0.35);
        mat.color.copy(this._tmpColor);
        mat.opacity = (ud.baseOpacity + lagWave * 0.16) * alpha;
      } else if (i === 0) {
        // Beacon 0: nearest beacon with subtle steady breathing
        mat.opacity = (ud.baseOpacity + Math.sin(time * 0.8) * 0.08) * alpha;
      } else {
        // Beacon 3: furthest micro-beacon, faint and slow drifting in deep horizon
        mat.opacity = (ud.baseOpacity + Math.sin(time * 0.45 + 2.0) * 0.04) * alpha;
      }
    }
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
