import * as THREE from 'three';

export class InterestsScene {
  public group: THREE.Group = new THREE.Group();
  public root: THREE.Group = new THREE.Group();

  // 1. Photography: Multi-layered optical viewframes & iris aperture
  private photoGroup: THREE.Group = new THREE.Group();
  private frames: THREE.LineSegments[] = [];
  private frameBaseScales: number[] = [];
  private apertureMesh!: THREE.LineSegments;
  private apertureGeo!: THREE.BufferGeometry;
  private apertureCaliper!: THREE.LineSegments;
  private deflectionBeams!: THREE.LineSegments;

  // 2. Fitness / Body: Biomechanical kinetic force field & coordinate anchors
  private bodyGroup: THREE.Group = new THREE.Group();
  private forceCurves: THREE.Line[] = [];
  private forceGeos: THREE.BufferGeometry[] = [];
  private forceBaseArrays: Float32Array[] = [];
  private kineticSplines: THREE.CatmullRomCurve3[] = [];
  private kineticPulseMeshes: THREE.Mesh[] = [];
  private anchorCrosses: THREE.Group[] = [];

  // 3. Music: Concentric harmonic spectrum rings & acoustic chords
  private soundGroup: THREE.Group = new THREE.Group();
  private waveRings: THREE.LineLoop[] = [];
  private waveGeoList: THREE.BufferGeometry[] = [];
  private waveBaseRadii: number[] = [];
  private harmonicChords!: THREE.LineSegments;

  // Zero-GC preallocated vectors and scratch variables
  private _tmpVec1 = new THREE.Vector3();
  private _tmpVec2 = new THREE.Vector3();
  private _tmpQuat = new THREE.Quaternion();
  private _tmpUp = new THREE.Vector3(0, 1, 0);

  constructor() {
    this.root.position.set(0.6, 1.5, -13.8);
    this.group.add(this.root);

    // Build the 3 distinct procedural sensory systems
    this.buildPhotographySystem();
    this.buildKineticForceFieldSystem();
    this.buildHarmonicWaveSystem();

    this.root.add(this.photoGroup);
    this.root.add(this.bodyGroup);
    this.root.add(this.soundGroup);

    // Triangulated spatial positioning:
    // - Photography: upper-left, forefront
    // - Fitness: kinetic force lines sweep diagonally across the center
    // - Music: lower-right, deeper in spatial depth
    this.photoGroup.position.set(-2.0, 0.45, 1.2);
    this.bodyGroup.position.set(0.0, 0.0, 0.0);
    this.soundGroup.position.set(1.8, -0.6, -1.4);
  }

  // =========================================================================
  // 01 / PHOTOGRAPHY (Optical Frame System: Light / Frame / Time)
  // =========================================================================
  private buildPhotographySystem(): void {
    // 4 Cinematic Aspect Ratios:
    // 2.39:1 (Anamorphic), 16:9 (Widescreen), 4:3 (Medium Format), 1:1 (Square)
    const frameConfigs = [
      { w: 2.40, h: 1.004, z: 0.55, rotZ: 0.05, col: 0xb4c8d8, alpha: 0.70 },
      { w: 2.05, h: 1.153, z: 0.15, rotZ: -0.04, col: 0x6e9eae, alpha: 0.65 },
      { w: 1.55, h: 1.162, z: -0.25, rotZ: 0.02, col: 0xf2c8d0, alpha: 0.60 },
      { w: 1.15, h: 1.150, z: -0.65, rotZ: -0.03, col: 0xb4c8d8, alpha: 0.55 },
    ];

    frameConfigs.forEach((cfg) => {
      const hw = cfg.w * 0.5;
      const hh = cfg.h * 0.5;
      const corner = Math.min(0.16, cfg.w * 0.12);
      const gridTick = 0.07;
      const notchLen = 0.04;

      const pts: number[] = [
        // 1. Outer viewframe border rectangle
        -hw, -hh, 0,  hw, -hh, 0,
         hw, -hh, 0,  hw,  hh, 0,
         hw,  hh, 0, -hw,  hh, 0,
        -hw,  hh, 0, -hw, -hh, 0,

        // 2. Precision corner reticle brackets (inward ticks)
        -hw, -hh, 0, -hw + corner, -hh, 0,
        -hw, -hh, 0, -hw, -hh + corner, 0,
         hw, -hh, 0,  hw - corner, -hh, 0,
         hw, -hh, 0,  hw, -hh + corner, 0,
         hw,  hh, 0,  hw - corner,  hh, 0,
         hw,  hh, 0,  hw,  hh - corner, 0,
        -hw,  hh, 0, -hw + corner,  hh, 0,
        -hw,  hh, 0, -hw,  hh - corner, 0,

        // 3. Rule-of-thirds grid tick marks on all 4 borders
        -hw * 0.333, -hh, 0, -hw * 0.333, -hh + gridTick, 0,
         hw * 0.333, -hh, 0,  hw * 0.333, -hh + gridTick, 0,
        -hw * 0.333,  hh, 0, -hw * 0.333,  hh - gridTick, 0,
         hw * 0.333,  hh, 0,  hw * 0.333,  hh - gridTick, 0,
        -hw, -hh * 0.333, 0, -hw + gridTick, -hh * 0.333, 0,
        -hw,  hh * 0.333, 0, -hw + gridTick,  hh * 0.333, 0,
         hw, -hh * 0.333, 0,  hw - gridTick, -hh * 0.333, 0,
         hw,  hh * 0.333, 0,  hw - gridTick,  hh * 0.333, 0,

        // 4. Optical center micro-crosshair
        -0.06, 0, 0, -0.015, 0, 0,
         0.015, 0, 0,  0.06, 0, 0,
         0, -0.06, 0, 0, -0.015, 0,
         0,  0.015, 0, 0,  0.06, 0,

        // 5. Film / cinema calibration notches along top & bottom edges
        -hw * 0.66, -hh, 0, -hw * 0.66, -hh + notchLen, 0,
         hw * 0.66, -hh, 0,  hw * 0.66, -hh + notchLen, 0,
        -hw * 0.66,  hh, 0, -hw * 0.66,  hh - notchLen, 0,
         hw * 0.66,  hh, 0,  hw * 0.66,  hh - notchLen, 0,
      ];

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
      const mat = new THREE.LineBasicMaterial({
        color: cfg.col,
        transparent: true,
        opacity: cfg.alpha,
      });

      const frame = new THREE.LineSegments(geo, mat);
      frame.position.z = cfg.z;
      frame.rotation.z = cfg.rotZ;
      frame.userData = { targetAlpha: cfg.alpha };

      this.photoGroup.add(frame);
      this.frames.push(frame);
      this.frameBaseScales.push(1.0);
    });

    // Optical Iris: 9-blade polygonal aperture reticle with breathing inner radius
    const bladeCount = 9;
    this.apertureGeo = new THREE.BufferGeometry();
    const aperturePts = new Float32Array(bladeCount * 4 * 3); // 9 blades * 2 lines * 2 pts * 3 coords
    this.apertureGeo.setAttribute('position', new THREE.BufferAttribute(aperturePts, 3));

    const apertureMat = new THREE.LineBasicMaterial({
      color: 0x6e9eae,
      transparent: true,
      opacity: 0.65,
    });
    this.apertureMesh = new THREE.LineSegments(this.apertureGeo, apertureMat);
    this.apertureMesh.position.set(0.1, -0.05, 0.0);
    this.photoGroup.add(this.apertureMesh);

    // Caliber circular ring with 36 radial millimeter calibration ticks
    const tickCount = 36;
    const caliperPts: number[] = [];
    const rOuter = 0.54;
    const rInnerTick = 0.50;
    for (let i = 0; i < tickCount; i++) {
      const angle = (i / tickCount) * Math.PI * 2;
      const isMajor = i % 4 === 0;
      const rIn = isMajor ? rInnerTick - 0.03 : rInnerTick;
      caliperPts.push(
        Math.cos(angle) * rOuter, Math.sin(angle) * rOuter, 0,
        Math.cos(angle) * rIn, Math.sin(angle) * rIn, 0
      );
    }
    const caliperGeo = new THREE.BufferGeometry();
    caliperGeo.setAttribute('position', new THREE.Float32BufferAttribute(caliperPts, 3));
    const caliperMat = new THREE.LineBasicMaterial({
      color: 0xb4c8d8,
      transparent: true,
      opacity: 0.45,
    });
    this.apertureCaliper = new THREE.LineSegments(caliperGeo, caliperMat);
    this.apertureCaliper.position.set(0.1, -0.05, 0.0);
    this.photoGroup.add(this.apertureCaliper);

    // Optical Refraction / Light Deflection Beams passing through the viewframes
    const beamCount = 7;
    const beamPts: number[] = [];
    for (let b = 0; b < beamCount; b++) {
      const angle = (b / beamCount) * Math.PI * 2;
      const rFront = 0.72 + (b % 3) * 0.15;
      const rBack = 0.12 + (b % 2) * 0.08;
      const x1 = Math.cos(angle) * rFront;
      const y1 = Math.sin(angle) * rFront * 0.65;
      const z1 = 0.9;
      const x2 = Math.cos(angle + 0.3) * rBack;
      const y2 = Math.sin(angle + 0.3) * rBack * 0.65;
      const z2 = -0.9;
      beamPts.push(x1, y1, z1, x2, y2, z2);
    }
    const beamGeo = new THREE.BufferGeometry();
    beamGeo.setAttribute('position', new THREE.Float32BufferAttribute(beamPts, 3));
    const beamMat = new THREE.LineBasicMaterial({
      color: 0xb4c8d8,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
    });
    this.deflectionBeams = new THREE.LineSegments(beamGeo, beamMat);
    this.photoGroup.add(this.deflectionBeams);
  }

  // =========================================================================
  // 02 / FITNESS / BODY (Kinetic Force Field: Strength / Motion / Control)
  // =========================================================================
  private buildKineticForceFieldSystem(): void {
    // 4 Dynamic Biomechanical Spline Trajectories:
    // Curve 1: Primary kinetic tension arc (load -> acceleration -> release)
    // Curve 2: Helical torque spiral (rotational energy vector)
    // Curve 3: Lower stabilization tether
    // Curve 4: Kinetic rebound & follow-through trajectory
    const splineDefinitions: THREE.Vector3[][] = [
      // Primary Biomechanical Tension Arc
      [
        new THREE.Vector3(-1.5, -0.9, 0.8),
        new THREE.Vector3(-0.7, -0.4, 0.5),
        new THREE.Vector3(0.2, 0.2, 0.1),
        new THREE.Vector3(1.1, 0.8, -0.4),
        new THREE.Vector3(1.9, 1.3, -1.0),
      ],
      // Helical Torque Spiral
      [
        new THREE.Vector3(-1.3, -0.7, 0.6),
        new THREE.Vector3(-0.4, -0.1, 0.8),
        new THREE.Vector3(0.4, 0.4, -0.2),
        new THREE.Vector3(1.3, 0.6, 0.3),
        new THREE.Vector3(1.8, 1.1, -0.7),
      ],
      // Lower Stabilization Tether
      [
        new THREE.Vector3(-1.6, -0.8, 0.4),
        new THREE.Vector3(-0.8, -0.6, 0.1),
        new THREE.Vector3(0.0, -0.3, -0.2),
        new THREE.Vector3(0.9, -0.1, -0.6),
      ],
      // Kinetic Rebound Trajectory
      [
        new THREE.Vector3(-0.5, 0.5, 0.3),
        new THREE.Vector3(0.3, 0.8, -0.1),
        new THREE.Vector3(1.2, 1.0, -0.5),
        new THREE.Vector3(2.1, 1.2, -1.2),
      ],
    ];

    const curveColors = [0x6e9eae, 0xb4c8d8, 0x6e9eae, 0xf2c8d0];
    const curveOpacities = [0.75, 0.60, 0.50, 0.55];

    splineDefinitions.forEach((pts, idx) => {
      const curve = new THREE.CatmullRomCurve3(pts);
      this.kineticSplines.push(curve);

      const sampleCount = 72;
      const sampledPoints = curve.getPoints(sampleCount);
      const baseArray = new Float32Array((sampleCount + 1) * 3);

      for (let i = 0; i <= sampleCount; i++) {
        baseArray[i * 3] = sampledPoints[i].x;
        baseArray[i * 3 + 1] = sampledPoints[i].y;
        baseArray[i * 3 + 2] = sampledPoints[i].z;
      }
      this.forceBaseArrays.push(baseArray);

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(baseArray), 3));
      this.forceGeos.push(geo);

      const mat = new THREE.LineBasicMaterial({
        color: curveColors[idx],
        transparent: true,
        opacity: curveOpacities[idx],
      });
      const line = new THREE.Line(geo, mat);
      line.userData = { targetOpacity: curveOpacities[idx] };
      this.bodyGroup.add(line);
      this.forceCurves.push(line);

      // 2 Sleek Elongated Kinetic Vector Markers per spline (NO polyhedrons, NO large spheres)
      for (let p = 0; p < 2; p++) {
        // Micro elongated capsule cylinder (r=0.024, length=0.12) aligned with curve tangent
        const pulseGeo = new THREE.CylinderGeometry(0.024, 0.024, 0.12, 8);
        const pulseMat = new THREE.MeshBasicMaterial({
          color: curveColors[idx],
          transparent: true,
          opacity: 0.85,
          blending: THREE.AdditiveBlending,
        });
        const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
        pulseMesh.userData = {
          curveIdx: idx,
          speed: 0.22 + idx * 0.05,
          offset: p * 0.5 + idx * 0.25,
        };
        this.bodyGroup.add(pulseMesh);
        this.kineticPulseMeshes.push(pulseMesh);
      }
    });

    // 3 Spatial Anchor Coordinate Verniers (STRENGTH, MOTION, CONTROL)
    // Strictly NOT polyhedrons! Minimalist kinematic coordinate crosshairs + bracket circle.
    const anchorPositions = [
      new THREE.Vector3(-1.0, -0.65, 0.45), // STRENGTH: load baseline
      new THREE.Vector3(0.2, 0.15, 0.05),   // MOTION: dynamic inflection
      new THREE.Vector3(1.5, 0.95, -0.65),  // CONTROL: apex stabilization
    ];

    anchorPositions.forEach((pos, aIdx) => {
      const anchorGroup = new THREE.Group();
      anchorGroup.position.copy(pos);

      // Micro 3D coordinate crosshair ticks (length +-0.075 on X, Y, Z)
      const tick = 0.075;
      const crossPts: number[] = [
        -tick, 0, 0,  tick, 0, 0,
        0, -tick, 0,  0, tick, 0,
        0, 0, -tick,  0, 0, tick,
      ];
      const crossGeo = new THREE.BufferGeometry();
      crossGeo.setAttribute('position', new THREE.Float32BufferAttribute(crossPts, 3));
      const crossMat = new THREE.LineBasicMaterial({
        color: aIdx === 2 ? 0xf2c8d0 : 0x6e9eae,
        transparent: true,
        opacity: 0.70,
      });
      const crossLines = new THREE.LineSegments(crossGeo, crossMat);
      anchorGroup.add(crossLines);

      // Precision micro circular caliper ring (radius 0.10)
      const ringSegments = 24;
      const ringPts = new Float32Array(ringSegments * 3);
      for (let s = 0; s < ringSegments; s++) {
        const theta = (s / ringSegments) * Math.PI * 2;
        ringPts[s * 3] = Math.cos(theta) * 0.10;
        ringPts[s * 3 + 1] = Math.sin(theta) * 0.10;
        ringPts[s * 3 + 2] = 0;
      }
      const ringGeo = new THREE.BufferGeometry();
      ringGeo.setAttribute('position', new THREE.BufferAttribute(ringPts, 3));
      const ringMat = new THREE.LineLoop(ringGeo, new THREE.LineBasicMaterial({
        color: 0xb4c8d8,
        transparent: true,
        opacity: 0.45,
      }));
      anchorGroup.add(ringMat);

      anchorGroup.userData = { baseRotSpeed: 0.3 + aIdx * 0.15 };
      this.bodyGroup.add(anchorGroup);
      this.anchorCrosses.push(anchorGroup);
    });
  }

  // =========================================================================
  // 03 / MUSIC (Rhythmic Wave Structure: Rhythm / Space / Resonance)
  // =========================================================================
  private buildHarmonicWaveSystem(): void {
    const ringCount = 5;
    const segments = 128;
    this.waveBaseRadii = [0.82, 1.20, 1.58, 1.96, 2.34];

    // Colors: Warm analog synth palette (Sakura Pink, Sleet, Mist Blue)
    const ringColors = [0xf2c8d0, 0xe0c8d4, 0xb4c8d8, 0xf2c8d0, 0x6e9eae];
    const ringOpacities = [0.72, 0.60, 0.50, 0.40, 0.32];

    for (let r = 0; r < ringCount; r++) {
      const radius = this.waveBaseRadii[r];
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
        color: ringColors[r],
        transparent: true,
        opacity: ringOpacities[r],
      });

      const waveLoop = new THREE.LineLoop(geo, mat);
      // Tilted plane giving deep elliptical perspective
      waveLoop.position.y = (r - ringCount * 0.5) * 0.12;
      waveLoop.rotation.x = Math.PI * 0.32;
      waveLoop.rotation.z = -0.14;
      waveLoop.userData = { targetOpacity: ringOpacities[r], baseR: radius };

      this.soundGroup.add(waveLoop);
      this.waveRings.push(waveLoop);
      this.waveGeoList.push(geo);
    }

    // Harmonic Acoustic Chords: radial standing wave bridge chords at resonance nodes
    const chordAngles = [
      0, Math.PI * 0.25, Math.PI * 0.5, Math.PI * 0.75,
      Math.PI, Math.PI * 1.25, Math.PI * 1.5, Math.PI * 1.75,
    ];
    const chordPts: number[] = [];
    const rInnerChord = this.waveBaseRadii[0];
    const rOuterChord = this.waveBaseRadii[4];

    chordAngles.forEach((ang) => {
      const cosA = Math.cos(ang);
      const sinA = Math.sin(ang);
      chordPts.push(
        cosA * rInnerChord, 0, sinA * rInnerChord,
        cosA * rOuterChord, 0, sinA * rOuterChord
      );
    });

    const chordGeo = new THREE.BufferGeometry();
    chordGeo.setAttribute('position', new THREE.Float32BufferAttribute(chordPts, 3));
    const chordMat = new THREE.LineBasicMaterial({
      color: 0xe0c8d4,
      transparent: true,
      opacity: 0.30,
      blending: THREE.AdditiveBlending,
    });
    this.harmonicChords = new THREE.LineSegments(chordGeo, chordMat);
    this.harmonicChords.position.y = 0;
    this.harmonicChords.rotation.x = Math.PI * 0.32;
    this.harmonicChords.rotation.z = -0.14;
    this.soundGroup.add(this.harmonicChords);
  }

  // =========================================================================
  // UPDATE LOOP (Zero-GC, 100% Reversible Timeline Progression)
  // =========================================================================
  public update(time: number, _dt: number, progress: number, mx: number = 0, my: number = 0): void {
    // Visibility window centered on Chapter 3 (peaks at progress ~3.0)
    // 2.15 -> 2.65: fade in; 3.35 -> 3.85: fade out
    const fadeIn = THREE.MathUtils.smoothstep(progress, 2.15, 2.65);
    const fadeOut = 1.0 - THREE.MathUtils.smoothstep(progress, 3.35, 3.85);
    const alpha = fadeIn * fadeOut;

    const isVisible = alpha > 0.003;
    this.group.visible = isVisible;
    if (!isVisible) return;

    // Subsystem discovery progression curves:
    // - 0.20: Photography optical frames expand and aperture opens
    // - 0.60: Kinetic body force curves reach peak tension
    // - 0.78: Harmonic wave structure modulates and resonates
    const pPhoto = THREE.MathUtils.smoothstep(progress, 2.20, 2.65);
    const pBody = THREE.MathUtils.smoothstep(progress, 2.50, 3.05);
    const pMusic = THREE.MathUtils.smoothstep(progress, 2.75, 3.35);

    // Multi-plane parallax proximity response (Zero-GC scalar updates)
    this.root.position.x = 0.6 + mx * 0.20;
    this.root.position.y = 1.5 + my * 0.15 + Math.sin(time * 0.55) * 0.06;

    this.photoGroup.position.x = -2.0 + mx * 0.14;
    this.photoGroup.position.y = 0.45 + my * 0.10;

    this.bodyGroup.position.x = mx * 0.07;
    this.bodyGroup.position.y = my * 0.05;

    this.soundGroup.position.x = 1.8 - mx * 0.10;
    this.soundGroup.position.y = -0.6 - my * 0.07;

    // -----------------------------------------------------------------------
    // 1. Photography Animation & Breathing Iris Aperture
    // -----------------------------------------------------------------------
    this.frames.forEach((frame, idx) => {
      // Gentle cinematic breathing floating tilt
      frame.rotation.x = Math.sin(time * 0.65 + idx * 1.2) * 0.05;
      frame.rotation.y = Math.cos(time * 0.50 + idx * 0.9) * 0.06;

      // Frame scale expansion driven by discovery progression
      const scale = 0.86 + 0.14 * pPhoto;
      frame.scale.set(scale, scale, 1.0);

      const targetAlpha = frame.userData.targetAlpha as number;
      (frame.material as THREE.LineBasicMaterial).opacity = targetAlpha * alpha * pPhoto;
    });

    // Dynamic Breathing Iris Aperture Blades (updates in-place without new allocations)
    const bladeCount = 9;
    const rOuter = 0.52;
    // Iris opens and breathes between f/1.4 and f/5.6
    const rInner = 0.18 + 0.06 * Math.sin(time * 1.1) + 0.05 * pPhoto;
    const posAttr = this.apertureGeo.attributes.position as THREE.BufferAttribute;
    const array = posAttr.array as Float32Array;

    let ptr = 0;
    for (let i = 0; i < bladeCount; i++) {
      const a1 = (i / bladeCount) * Math.PI * 2;
      const a2 = ((i + 1) / bladeCount) * Math.PI * 2;
      const aMid = (a1 + a2) * 0.5;

      const cos1 = Math.cos(a1) * rOuter;
      const sin1 = Math.sin(a1) * rOuter;
      const cosMid = Math.cos(aMid) * rInner;
      const sinMid = Math.sin(aMid) * rInner;
      const cos2 = Math.cos(a2) * rOuter;
      const sin2 = Math.sin(a2) * rOuter;

      // Segment 1: Outer1 -> MidInner
      array[ptr++] = cos1;
      array[ptr++] = sin1;
      array[ptr++] = 0;
      array[ptr++] = cosMid;
      array[ptr++] = sinMid;
      array[ptr++] = 0;

      // Segment 2: MidInner -> Outer2
      array[ptr++] = cosMid;
      array[ptr++] = sinMid;
      array[ptr++] = 0;
      array[ptr++] = cos2;
      array[ptr++] = sin2;
      array[ptr++] = 0;
    }
    posAttr.needsUpdate = true;

    this.apertureMesh.rotation.z = time * 0.15;
    (this.apertureMesh.material as THREE.LineBasicMaterial).opacity = 0.65 * alpha * pPhoto;

    this.apertureCaliper.rotation.z = -time * 0.06;
    (this.apertureCaliper.material as THREE.LineBasicMaterial).opacity = 0.45 * alpha * pPhoto;

    (this.deflectionBeams.material as THREE.LineBasicMaterial).opacity =
      (0.20 + 0.15 * Math.sin(time * 1.8)) * alpha * pPhoto;

    // -----------------------------------------------------------------------
    // 2. Fitness / Body Animation & Muscular Wave Propagation
    // -----------------------------------------------------------------------
    // Wave muscular tension along CatmullRom curves in-place
    this.forceCurves.forEach((curveLine, cIdx) => {
      const geo = this.forceGeos[cIdx];
      const posA = geo.attributes.position as THREE.BufferAttribute;
      const arr = posA.array as Float32Array;
      const baseArr = this.forceBaseArrays[cIdx];
      const count = baseArr.length / 3;

      for (let i = 0; i < count; i++) {
        const u = i / count;
        // Traveling tension wave
        const wave = Math.sin(u * 5.5 - time * 2.4 + cIdx) * 0.032 * pBody;
        arr[i * 3] = baseArr[i * 3];
        arr[i * 3 + 1] = baseArr[i * 3 + 1] + wave;
        arr[i * 3 + 2] = baseArr[i * 3 + 2] + wave * 0.5;
      }
      posA.needsUpdate = true;

      const baseOp = curveLine.userData.targetOpacity as number;
      (curveLine.material as THREE.LineBasicMaterial).opacity = baseOp * alpha * pBody;
    });

    // Flowing Kinetic Vector Pulses (Accelerating in power stroke, decelerating at peak)
    this.kineticPulseMeshes.forEach((pulse) => {
      const { curveIdx, speed, offset } = pulse.userData;
      const curve = this.kineticSplines[curveIdx];

      // Realistic biomechanical acceleration profile: v(u) accelerates midway
      const rawT = (time * speed + offset) % 1.0;
      const easedT = rawT + Math.sin(rawT * Math.PI * 2) * 0.05;
      const clampedT = THREE.MathUtils.clamp(easedT, 0.001, 0.999);

      curve.getPoint(clampedT, this._tmpVec1);
      pulse.position.copy(this._tmpVec1);

      // Orient elongated cylinder along curve tangent
      curve.getTangent(clampedT, this._tmpVec2);
      this._tmpQuat.setFromUnitVectors(this._tmpUp, this._tmpVec2);
      pulse.quaternion.copy(this._tmpQuat);

      (pulse.material as THREE.MeshBasicMaterial).opacity =
        (0.60 + Math.sin(time * 4.0 + offset * 10) * 0.25) * alpha * pBody;
    });

    // Spatial Coordinate Vernier Crosshairs (STRENGTH, MOTION, CONTROL)
    this.anchorCrosses.forEach((anchor, aIdx) => {
      const rotSpeed = anchor.userData.baseRotSpeed as number;
      anchor.rotation.y = time * rotSpeed;
      anchor.rotation.z = time * rotSpeed * 0.6;

      const pulseScale = 1.0 + Math.sin(time * 2.0 + aIdx * 1.5) * 0.06;
      anchor.scale.set(pulseScale, pulseScale, pulseScale);

      anchor.traverse((child) => {
        if (child instanceof THREE.LineSegments || child instanceof THREE.LineLoop) {
          (child.material as THREE.LineBasicMaterial).opacity =
            (aIdx === 2 ? 0.70 : 0.60) * alpha * pBody;
        }
      });
    });

    // -----------------------------------------------------------------------
    // 3. Music Animation: Warm Analog Synthesizer Superposition
    // -----------------------------------------------------------------------
    const ringSegs = 128;
    this.waveRings.forEach((ring, rIdx) => {
      const geo = this.waveGeoList[rIdx];
      const posA = geo.attributes.position as THREE.BufferAttribute;
      const arr = posA.array as Float32Array;
      const baseR = this.waveBaseRadii[rIdx];

      // Superposition of fundamental analog frequency and warm harmonic overtone
      const f1 = 3 + rIdx;
      const f2 = (2 + rIdx) * 2 - 1;
      const speed1 = time * (1.3 + rIdx * 0.28);
      const speed2 = time * 0.75;

      for (let i = 0; i < ringSegs; i++) {
        const theta = (i / ringSegs) * Math.PI * 2;
        const waveR =
          (Math.sin(theta * f1 + speed1) * 0.060 +
            Math.cos(theta * f2 - speed2) * 0.032) *
          pMusic;
        const waveY = Math.sin(theta * f1 + speed1 * 0.8) * 0.042 * pMusic;

        const currR = baseR + waveR;
        arr[i * 3] = Math.cos(theta) * currR;
        arr[i * 3 + 1] = waveY;
        arr[i * 3 + 2] = Math.sin(theta) * currR;
      }
      posA.needsUpdate = true;

      const targetOp = ring.userData.targetOpacity as number;
      (ring.material as THREE.LineBasicMaterial).opacity = targetOp * alpha * pMusic;
    });

    // Harmonic chords breathing pulse
    (this.harmonicChords.material as THREE.LineBasicMaterial).opacity =
      (0.20 + Math.sin(time * 1.5) * 0.12) * alpha * pMusic;
  }

  public dispose(): void {
    this.group.traverse((child) => {
      if (
        child instanceof THREE.Mesh ||
        child instanceof THREE.Line ||
        child instanceof THREE.LineSegments ||
        child instanceof THREE.LineLoop
      ) {
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
