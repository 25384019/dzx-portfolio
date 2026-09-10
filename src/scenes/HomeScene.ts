import * as THREE from 'three';

interface CoreSegment {
  group: THREE.Group;
  mesh: THREE.Mesh;
  wire: THREE.LineSegments;
  beacon: THREE.Mesh;
  assembledPos: THREE.Vector3;
  disassembledPos: THREE.Vector3;
  color: number;
}

export class HomeScene {
  public group: THREE.Group = new THREE.Group();

  // Root Core container centered at (0, 3.2, 0)
  public coreRoot: THREE.Group = new THREE.Group();

  // 3 Disassemblable Spatial Modules
  private segments: CoreSegment[] = [];
  private moduleCognition!: CoreSegment;
  private moduleSystem!: CoreSegment;
  private moduleBody!: CoreSegment;

  // Synaptic dynamic tension lines connecting separating modules
  private tensionLines!: THREE.LineSegments;
  private tensionGeo!: THREE.BufferGeometry;

  // Internal glowing heartbeat point light
  private heartLight!: THREE.PointLight;

  // Internal floating data particles
  private internalParticles!: THREE.Points;

  // Ambient orbital data conduits & foreground shards
  private ringMesh!: THREE.LineSegments;
  private ambientParticles!: THREE.Points;
  private fgShards: THREE.Mesh[] = [];

  constructor() {
    this.buildDisassemblableCore();
    this.buildInternalParticles();
    this.buildTensionLines();
    this.buildRings();
    this.buildAmbientParticles();
    this.buildForegroundShards();

    this.group.add(this.coreRoot);
    this.coreRoot.position.set(0, 3.2, 0);
  }

  private buildDisassemblableCore(): void {
    // Shared dark translucent obsidian glass material
    const obsidianMat = new THREE.MeshStandardMaterial({
      color: 0x070c14,
      roughness: 0.14,
      metalness: 0.42,
      transparent: true,
      opacity: 0.84,
    });

    // --- 1. MODULE: COGNITION (01 / SYNTHETIC COGNITION) ---
    const geoCog = new THREE.BoxGeometry(2.3, 1.8, 2.3, 2, 2, 2);
    const meshCog = new THREE.Mesh(geoCog, obsidianMat.clone());
    const wireGeoCog = new THREE.EdgesGeometry(geoCog);
    const wireMatCog = new THREE.LineBasicMaterial({
      color: 0x6e9eae, // Ice Lake Cyan
      transparent: true,
      opacity: 0.65,
    });
    const wireCog = new THREE.LineSegments(wireGeoCog, wireMatCog);
    meshCog.add(wireCog);

    // Inner neural beacon (Octahedron)
    const beaconGeoCog = new THREE.OctahedronGeometry(0.55, 0);
    const beaconMatCog = new THREE.MeshBasicMaterial({
      color: 0x6e9eae,
      wireframe: true,
      transparent: true,
      opacity: 0.85,
    });
    const beaconCog = new THREE.Mesh(beaconGeoCog, beaconMatCog);
    meshCog.add(beaconCog);

    const grpCog = new THREE.Group();
    grpCog.add(meshCog);
    this.moduleCognition = {
      group: grpCog,
      mesh: meshCog,
      wire: wireCog,
      beacon: beaconCog,
      assembledPos: new THREE.Vector3(0, 1.85, 0),
      disassembledPos: new THREE.Vector3(-2.4, 2.9, -1.6),
      color: 0x6e9eae,
    };
    this.segments.push(this.moduleCognition);
    this.coreRoot.add(grpCog);

    // --- 2. MODULE: SYSTEM (02 / HIGH-PERFORMANCE DEV) ---
    const geoSys = new THREE.BoxGeometry(2.4, 2.0, 2.4, 2, 2, 2);
    const meshSys = new THREE.Mesh(geoSys, obsidianMat.clone());
    const wireGeoSys = new THREE.EdgesGeometry(geoSys);
    const wireMatSys = new THREE.LineBasicMaterial({
      color: 0xb4c8d8, // Mist Blue
      transparent: true,
      opacity: 0.6,
    });
    const wireSys = new THREE.LineSegments(wireGeoSys, wireMatSys);
    meshSys.add(wireSys);

    // Inner architectural lattice beacon (nested box)
    const beaconGeoSys = new THREE.BoxGeometry(0.8, 0.8, 0.8);
    const beaconMatSys = new THREE.MeshBasicMaterial({
      color: 0xb4c8d8,
      wireframe: true,
      transparent: true,
      opacity: 0.8,
    });
    const beaconSys = new THREE.Mesh(beaconGeoSys, beaconMatSys);
    meshSys.add(beaconSys);

    const grpSys = new THREE.Group();
    grpSys.add(meshSys);
    this.moduleSystem = {
      group: grpSys,
      mesh: meshSys,
      wire: wireSys,
      beacon: beaconSys,
      assembledPos: new THREE.Vector3(0, 0, 0),
      disassembledPos: new THREE.Vector3(0.1, 1.8, -2.6),
      color: 0xb4c8d8,
    };
    this.segments.push(this.moduleSystem);
    this.coreRoot.add(grpSys);

    // --- 3. MODULE: BODY / AESTHETICS (03 / AESTHETICS & PHYSICALITY) ---
    const geoBody = new THREE.BoxGeometry(2.3, 1.8, 2.3, 2, 2, 2);
    const meshBody = new THREE.Mesh(geoBody, obsidianMat.clone());
    const wireGeoBody = new THREE.EdgesGeometry(geoBody);
    const wireMatBody = new THREE.LineBasicMaterial({
      color: 0xf2c8d0, // Sakura Pink / Sleet
      transparent: true,
      opacity: 0.55,
    });
    const wireBody = new THREE.LineSegments(wireGeoBody, wireMatBody);
    meshBody.add(wireBody);

    // Inner physical resonance beacon (Icosahedron)
    const beaconGeoBody = new THREE.IcosahedronGeometry(0.5, 0);
    const beaconMatBody = new THREE.MeshBasicMaterial({
      color: 0xf2c8d0,
      wireframe: true,
      transparent: true,
      opacity: 0.8,
    });
    const beaconBody = new THREE.Mesh(beaconGeoBody, beaconMatBody);
    meshBody.add(beaconBody);

    const grpBody = new THREE.Group();
    grpBody.add(meshBody);
    this.moduleBody = {
      group: grpBody,
      mesh: meshBody,
      wire: wireBody,
      beacon: beaconBody,
      assembledPos: new THREE.Vector3(0, -1.85, 0),
      disassembledPos: new THREE.Vector3(2.6, 1.1, -3.4),
      color: 0xf2c8d0,
    };
    this.segments.push(this.moduleBody);
    this.coreRoot.add(grpBody);

    // Subtle Sakura Pink Heartbeat Point Light inside the central Core
    this.heartLight = new THREE.PointLight(0xf2c8d0, 0.4, 6.5);
    this.heartLight.position.set(0, 0, 0);
    this.coreRoot.add(this.heartLight);
  }

  private buildInternalParticles(): void {
    // 90 microscopic data particles suspended inside the translucent Core volume
    const count = 90;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const cCyan = new THREE.Color(0x6e9eae);
    const cPink = new THREE.Color(0xf2c8d0);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 1.8;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 4.8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 1.8;

      const pick = Math.random();
      const col = pick < 0.7 ? cCyan : cPink;
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.06,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    this.internalParticles = new THREE.Points(geo, mat);
    this.coreRoot.add(this.internalParticles);
  }

  private buildTensionLines(): void {
    // Dynamic synaptic threads connecting the 3 modules as they separate
    this.tensionGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(6 * 3); // 3 pairs of lines connecting modules
    this.tensionGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.LineBasicMaterial({
      color: 0x6e9eae,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
    });

    this.tensionLines = new THREE.LineSegments(this.tensionGeo, mat);
    this.group.add(this.tensionLines);
  }

  private buildRings(): void {
    // Concentric orbiting conduits
    const ringGeo = new THREE.RingGeometry(3.6, 3.65, 64);
    const edges = new THREE.EdgesGeometry(ringGeo);
    const mat = new THREE.LineBasicMaterial({
      color: 0x6e9eae,
      transparent: true,
      opacity: 0.45,
    });
    this.ringMesh = new THREE.LineSegments(edges, mat);
    this.ringMesh.rotation.x = Math.PI * 0.45;
    this.ringMesh.position.set(0, 3.2, 0);
    this.group.add(this.ringMesh);
  }

  private buildAmbientParticles(): void {
    const count = 360;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const c1 = new THREE.Color(0x6e9eae);
    const c2 = new THREE.Color(0xb4c8d8);
    const c3 = new THREE.Color(0xf2c8d0);

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const radius = 2.4 + Math.random() * 8.5;
      positions[i * 3] = Math.cos(theta) * radius;
      positions[i * 3 + 1] = 0.5 + Math.random() * 6.5;
      positions[i * 3 + 2] = Math.sin(theta) * radius;

      const pick = Math.random();
      const col = pick < 0.55 ? c1 : pick < 0.85 ? c2 : c3;
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });

    this.ambientParticles = new THREE.Points(geo, mat);
    this.group.add(this.ambientParticles);
  }

  private buildForegroundShards(): void {
    const shardGeo = new THREE.PlaneGeometry(1.2, 2.8);
    const shardMat = new THREE.MeshBasicMaterial({
      color: 0x0c1218,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
    });

    const s1 = new THREE.Mesh(shardGeo, shardMat);
    s1.position.set(-2.8, 2.6, 9.2);
    s1.rotation.y = 0.35;
    this.group.add(s1);
    this.fgShards.push(s1);

    const s2 = new THREE.Mesh(shardGeo, shardMat);
    s2.position.set(3.0, 2.4, 8.6);
    s2.rotation.y = -0.45;
    this.group.add(s2);
    this.fgShards.push(s2);
  }

  /**
   * Continuous spatial update driven by scroll progress and time.
   * Completely mathematically reversible on forward & reverse scroll.
   */
  public update(time: number, _dt: number, progress: number): void {
    // 1. Rare Sakura Pink Heartbeat Pulse every ~3.6s
    // Creates an elegant, organic, living breathing core
    const heartCycle = (time * Math.PI * 2) / 3.6;
    const pulse = Math.pow(Math.max(0, Math.sin(heartCycle)), 18);
    if (this.heartLight) {
      this.heartLight.intensity = 0.35 + pulse * 2.2;
    }

    // 2. Disassembly Interpolation Factor: 0 at HOME -> 1 at ABOUT
    // At progress <= 0.2: fully unified monolith
    // At progress 0.2 -> 1.0: fractures and drifts toward the 3 ABOUT card coordinates
    const dissFactor = THREE.MathUtils.smoothstep(progress, 0.2, 1.0);

    // Chapter 2 fade: As camera pushes past Chapter 1 deep into Chapter 2 (Projects),
    // the modules gracefully dissolve to give way to XiaoZhaiOS
    const overallOpacity = 1.0 - THREE.MathUtils.smoothstep(progress, 1.8, 2.5);
    const isVisible = overallOpacity > 0.01;
    this.coreRoot.visible = isVisible;
    this.tensionLines.visible = isVisible && dissFactor > 0.05;

    if (!isVisible) return;

    // 3. Update Position & Rotation of 3 Interlocking Modules
    const curCogPos = new THREE.Vector3();
    const curSysPos = new THREE.Vector3();
    const curBodyPos = new THREE.Vector3();

    this.segments.forEach((seg) => {
      // Smooth lerp from assembled (0, offset, 0) to disassembled ABOUT position
      seg.group.position.lerpVectors(seg.assembledPos, seg.disassembledPos, dissFactor);

      // Add gentle individual float animation when disassembled
      if (dissFactor > 0.05) {
        const floatY = Math.sin(time * 0.9 + seg.assembledPos.y) * 0.06 * dissFactor;
        const floatRot = Math.sin(time * 0.4 + seg.assembledPos.y) * 0.08 * dissFactor;
        seg.group.position.y += floatY;
        seg.group.rotation.y = floatRot;
        seg.group.rotation.x = floatRot * 0.5;
      } else {
        seg.group.rotation.set(0, 0, 0);
      }

      // Rotate inner beacons
      seg.beacon.rotation.y = time * 0.5;
      seg.beacon.rotation.z = time * 0.3;

      // Pulse beacon opacity with heartbeat
      (seg.beacon.material as THREE.MeshBasicMaterial).opacity = (0.7 + pulse * 0.3) * overallOpacity;

      // Update segment material opacity
      (seg.mesh.material as THREE.MeshStandardMaterial).opacity = 0.84 * overallOpacity;
      (seg.wire.material as THREE.LineBasicMaterial).opacity = (0.6 + pulse * 0.2) * overallOpacity;
    });

    // Save world coordinates for tension line updates
    this.moduleCognition.group.getWorldPosition(curCogPos);
    this.moduleSystem.group.getWorldPosition(curSysPos);
    this.moduleBody.group.getWorldPosition(curBodyPos);

    // 4. Update Dynamic Tension Lines connecting the separating modules
    if (dissFactor > 0.05 && this.tensionGeo) {
      const posAttr = this.tensionGeo.attributes.position as THREE.BufferAttribute;
      const arr = posAttr.array as Float32Array;

      // Line 1: Cognition <-> System
      arr[0] = curCogPos.x; arr[1] = curCogPos.y; arr[2] = curCogPos.z;
      arr[3] = curSysPos.x; arr[4] = curSysPos.y; arr[5] = curSysPos.z;

      // Line 2: System <-> Body
      arr[6] = curSysPos.x; arr[7] = curSysPos.y; arr[8] = curSysPos.z;
      arr[9] = curBodyPos.x; arr[10] = curBodyPos.y; arr[11] = curBodyPos.z;

      // Line 3: Cognition <-> Body (diagonal cross connection)
      arr[12] = curCogPos.x; arr[13] = curCogPos.y; arr[14] = curCogPos.z;
      arr[15] = curBodyPos.x; arr[16] = curBodyPos.y; arr[17] = curBodyPos.z;

      posAttr.needsUpdate = true;

      const tensionMat = this.tensionLines.material as THREE.LineBasicMaterial;
      tensionMat.opacity = Math.sin(dissFactor * Math.PI) * 0.45 * overallOpacity;
    }

    // 5. Monolith Core Base Rotation (active in HOME)
    const homeRotateWeight = 1.0 - dissFactor;
    this.coreRoot.rotation.y = time * 0.12 * homeRotateWeight;

    // 6. Ring & Particle Animations
    if (this.ringMesh) {
      this.ringMesh.rotation.z = time * 0.08;
      this.ringMesh.rotation.y = Math.sin(time * 0.25) * 0.15;
      const ringMat = this.ringMesh.material as THREE.LineBasicMaterial;
      ringMat.opacity = 0.45 * (1.0 - dissFactor) * overallOpacity;
      this.ringMesh.visible = ringMat.opacity > 0.01;
    }

    if (this.internalParticles) {
      this.internalParticles.rotation.y = -time * 0.08;
      (this.internalParticles.material as THREE.PointsMaterial).opacity = 0.8 * overallOpacity;
    }

    if (this.ambientParticles) {
      this.ambientParticles.rotation.y = -time * 0.04;
      (this.ambientParticles.material as THREE.PointsMaterial).opacity = 0.75 * overallOpacity;
    }

    // 7. Foreground Shards Dissolve
    this.fgShards.forEach((shard) => {
      const opacity = Math.max(0, 1.0 - progress * 1.8) * 0.35;
      (shard.material as THREE.MeshBasicMaterial).opacity = opacity;
      shard.visible = opacity > 0.01;
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

