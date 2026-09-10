import * as THREE from 'three';

export class InterestsScene {
  public group: THREE.Group = new THREE.Group();
  public root: THREE.Group = new THREE.Group();

  // 1. Photography: Floating aspect ratio viewframes & optical reticles
  private photoGroup: THREE.Group = new THREE.Group();
  private frames: THREE.LineSegments[] = [];
  private apertureRings: THREE.LineSegments[] = [];

  // 2. Soundscapes: Ambient waveform rings & frequency ripples
  private soundGroup: THREE.Group = new THREE.Group();
  private waveRings: THREE.LineLoop[] = [];
  private waveGeoList: THREE.BufferGeometry[] = [];

  // 3. Physical Resilience: Kinetic force trajectory splines
  private bodyGroup: THREE.Group = new THREE.Group();
  private forceCurves: THREE.Line[] = [];
  private kineticPulses: THREE.Mesh[] = [];

  constructor() {
    this.root.position.set(0.6, 1.5, -13.8);
    this.group.add(this.root);

    this.buildPhotographyElements();
    this.buildSoundscapeElements();
    this.buildPhysicalResilienceElements();

    this.root.add(this.photoGroup);
    this.root.add(this.soundGroup);
    this.root.add(this.bodyGroup);

    // Position the 3 sub-clusters harmoniously in 3D space
    this.photoGroup.position.set(-1.8, 0.4, 0.6);
    this.soundGroup.position.set(0.0, -0.2, -0.5);
    this.bodyGroup.position.set(1.9, 0.3, 0.8);
  }

  // --- 1. PHOTOGRAPHY: FLOATING VIEWING FRAMES & OPTICAL APERTURE ---
  private buildPhotographyElements(): void {
    // Aspect ratios: 2.39:1 (Anamorphic), 16:9 (Cinematic), 4:3 (Medium Format)
    const frameConfigs = [
      { w: 2.2, h: 0.92, col: 0x6e9eae, rotZ: 0.08, z: 0.0 },   // 2.39:1
      { w: 1.8, h: 1.01, col: 0xb4c8d8, rotZ: -0.06, z: -0.4 }, // 16:9
      { w: 1.4, h: 1.05, col: 0xf2c8d0, rotZ: 0.03, z: 0.3 },   // 4:3
    ];

    frameConfigs.forEach((cfg) => {
      const hw = cfg.w * 0.5;
      const hh = cfg.h * 0.5;
      const tick = 0.15;

      // Lines forming rectangle with corner crosshair ticks
      const points: number[] = [
        // Main rectangle border
        -hw, -hh, 0,  hw, -hh, 0,
         hw, -hh, 0,  hw,  hh, 0,
         hw,  hh, 0, -hw,  hh, 0,
        -hw,  hh, 0, -hw, -hh, 0,
        // Rule-of-thirds grid marks
        -hw * 0.33, -hh, 0, -hw * 0.33, -hh + tick, 0,
         hw * 0.33, -hh, 0,  hw * 0.33, -hh + tick, 0,
        -hw * 0.33,  hh, 0, -hw * 0.33,  hh - tick, 0,
         hw * 0.33,  hh, 0,  hw * 0.33,  hh - tick, 0,
        // Corner optical reticles
        -hw, -hh, 0, -hw + tick, -hh, 0,
        -hw, -hh, 0, -hw, -hh + tick, 0,
         hw,  hh, 0,  hw - tick,  hh, 0,
         hw,  hh, 0,  hw,  hh - tick, 0,
      ];

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
      const mat = new THREE.LineBasicMaterial({
        color: cfg.col,
        transparent: true,
        opacity: 0.65,
      });

      const frame = new THREE.LineSegments(geo, mat);
      frame.position.z = cfg.z;
      frame.rotation.z = cfg.rotZ;
      this.photoGroup.add(frame);
      this.frames.push(frame);
    });

    // Optical iris / 9-blade polygonal aperture reticle in center
    const bladeCount = 9;
    const apertureGeo = new THREE.BufferGeometry();
    const aperturePts: number[] = [];
    const rOuter = 0.55;
    const rInner = 0.26;

    for (let i = 0; i < bladeCount; i++) {
      const a1 = (i / bladeCount) * Math.PI * 2;
      const a2 = ((i + 1) / bladeCount) * Math.PI * 2;
      const aMid = (a1 + a2) * 0.5;

      aperturePts.push(
        Math.cos(a1) * rOuter, Math.sin(a1) * rOuter, 0,
        Math.cos(aMid) * rInner, Math.sin(aMid) * rInner, 0,
        Math.cos(aMid) * rInner, Math.sin(aMid) * rInner, 0,
        Math.cos(a2) * rOuter, Math.sin(a2) * rOuter, 0
      );
    }

    apertureGeo.setAttribute('position', new THREE.Float32BufferAttribute(aperturePts, 3));
    const apertureMat = new THREE.LineBasicMaterial({
      color: 0x6e9eae,
      transparent: true,
      opacity: 0.5,
    });
    const apertureMesh = new THREE.LineSegments(apertureGeo, apertureMat);
    apertureMesh.position.set(0, 0, 0.1);
    this.photoGroup.add(apertureMesh);
    this.apertureRings.push(apertureMesh);
  }

  // --- 2. SOUNDSCAPES: HARMONIC WAVE RINGS & SYNTHESIZER FREQUENCIES ---
  private buildSoundscapeElements(): void {
    const ringCount = 5;
    const segments = 128;

    for (let r = 0; r < ringCount; r++) {
      const radius = 0.9 + r * 0.38;
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(segments * 3);

      for (let i = 0; i < segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        pos[i * 3] = Math.cos(theta) * radius;
        pos[i * 3 + 1] = 0;
        pos[i * 3 + 2] = Math.sin(theta) * radius;
      }

      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const mat = new THREE.LineBasicMaterial({
        color: r % 2 === 0 ? 0x6e9eae : 0xf2c8d0,
        transparent: true,
        opacity: 0.55 - r * 0.08,
      });

      const waveLoop = new THREE.LineLoop(geo, mat);
      waveLoop.position.y = (r - ringCount / 2) * 0.18;
      waveLoop.rotation.x = Math.PI * 0.28; // tilted perspective
      this.soundGroup.add(waveLoop);
      this.waveRings.push(waveLoop);
      this.waveGeoList.push(geo);
    }
  }

  // --- 3. PHYSICAL RESILIENCE: KINETIC TRAJECTORIES & FORCE VECTORS ---
  private buildPhysicalResilienceElements(): void {
    // 3 dynamic biomechanical parabolic / helix force splines
    const curveConfigs = [
      {
        points: [
          new THREE.Vector3(-0.6, -1.1, -0.6),
          new THREE.Vector3(0.3, -0.2, 0.2),
          new THREE.Vector3(-0.2, 0.8, 0.4),
          new THREE.Vector3(0.5, 1.4, -0.2),
        ],
        col: 0xb4c8d8,
      },
      {
        points: [
          new THREE.Vector3(0.8, -0.9, 0.4),
          new THREE.Vector3(-0.1, -0.1, -0.3),
          new THREE.Vector3(0.6, 0.7, -0.1),
          new THREE.Vector3(-0.3, 1.3, 0.3),
        ],
        col: 0xf2c8d0,
      },
      {
        points: [
          new THREE.Vector3(-0.4, -0.8, 0.7),
          new THREE.Vector3(0.7, 0.1, 0.1),
          new THREE.Vector3(-0.5, 0.9, -0.5),
          new THREE.Vector3(0.2, 1.5, 0.5),
        ],
        col: 0x6e9eae,
      },
    ];

    curveConfigs.forEach((cfg, idx) => {
      const curve = new THREE.CatmullRomCurve3(cfg.points);
      const pts = curve.getPoints(64);
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const mat = new THREE.LineBasicMaterial({
        color: cfg.col,
        transparent: true,
        opacity: 0.65,
      });

      const line = new THREE.Line(geo, mat);
      this.bodyGroup.add(line);
      this.forceCurves.push(line);

      // Luminous pulse traveling along force curve
      const pulseGeo = new THREE.SphereGeometry(0.045, 12, 12);
      const pulseMat = new THREE.MeshBasicMaterial({
        color: cfg.col,
        transparent: true,
        opacity: 0.9,
      });
      const pulse = new THREE.Mesh(pulseGeo, pulseMat);
      pulse.userData = { curve, speed: 0.32 + idx * 0.08, offset: idx * 0.33 };
      this.bodyGroup.add(pulse);
      this.kineticPulses.push(pulse);
    });
  }

  public update(time: number, _dt: number, progress: number): void {
    // Visibility window: peaks at Chapter 3 (progress ~3.0)
    const fadeIn = THREE.MathUtils.smoothstep(progress, 2.2, 2.9);
    const fadeOut = 1.0 - THREE.MathUtils.smoothstep(progress, 3.25, 3.8);
    const alpha = fadeIn * fadeOut;

    const isVisible = alpha > 0.005;
    this.group.visible = isVisible;
    if (!isVisible) return;

    // Gentle holistic drift
    this.root.position.y = 1.5 + Math.sin(time * 0.6) * 0.08;

    // 1. Photography animation (floating frames slight tilt & aperture spin)
    this.frames.forEach((frame, idx) => {
      frame.rotation.x = Math.sin(time * 0.7 + idx) * 0.06;
      frame.rotation.y = Math.cos(time * 0.5 + idx * 1.5) * 0.08;
      (frame.material as THREE.LineBasicMaterial).opacity = 0.65 * alpha;
    });
    this.apertureRings.forEach((iris) => {
      iris.rotation.z = time * 0.2;
      (iris.material as THREE.LineBasicMaterial).opacity = 0.5 * alpha;
    });

    // 2. Soundscape animation (circular audio spectrum waveform modulation)
    const segments = 128;
    this.waveRings.forEach((ring, rIdx) => {
      const geo = this.waveGeoList[rIdx];
      const posAttr = geo.attributes.position as THREE.BufferAttribute;
      const baseR = 0.9 + rIdx * 0.38;
      const freq = 4 + rIdx * 2;
      const speed = time * (1.8 + rIdx * 0.6);

      for (let i = 0; i < segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        // Harmonic modulation (simulating ambient analog synth waves)
        const wave = Math.sin(theta * freq + speed) * Math.cos(theta * 2 - speed * 0.5) * 0.07;
        const currentR = baseR + wave;

        posAttr.setXYZ(i, Math.cos(theta) * currentR, wave * 0.8, Math.sin(theta) * currentR);
      }
      posAttr.needsUpdate = true;
      (ring.material as THREE.LineBasicMaterial).opacity = (0.55 - rIdx * 0.08) * alpha;
    });

    // 3. Physical resilience animation (kinetic pulses flowing along force splines)
    this.kineticPulses.forEach((pulse) => {
      const { curve, speed, offset } = pulse.userData;
      const t = (time * speed + offset) % 1.0;
      const pt = (curve as THREE.CatmullRomCurve3).getPoint(t);
      pulse.position.copy(pt);
      (pulse.material as THREE.MeshBasicMaterial).opacity = (0.6 + Math.sin(time * 3) * 0.3) * alpha;
    });
    this.forceCurves.forEach((curve) => {
      (curve.material as THREE.LineBasicMaterial).opacity = 0.65 * alpha;
    });
  }

  public dispose(): void {
    this.group.traverse((child) => {
      if (child instanceof THREE.Mesh || child instanceof THREE.Line || child instanceof THREE.LineSegments) {
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
