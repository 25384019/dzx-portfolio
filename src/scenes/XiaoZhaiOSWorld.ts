import * as THREE from 'three';

export interface MemoryNode {
  id: string;
  label: string;
  sublabel: string;
  position: THREE.Vector3;
  color: number;
  mesh: THREE.Mesh;
  wire: THREE.LineSegments;
  beacon: THREE.Mesh;
  hitRadius: number;
}

export class XiaoZhaiOSWorld {
  public group: THREE.Group = new THREE.Group();
  public portalCameraTarget = {
    position: new THREE.Vector3(0.5, 2.2, -6.5),
    target: new THREE.Vector3(0.5, 2.2, -14.0),
    fov: 46,
    name: 'XiaoZhaiOS · Memory System',
  };

  // 1. Central Neural Memory Core
  public coreMesh!: THREE.Mesh;
  private coreWire!: THREE.LineSegments;
  private coreHaloRings: THREE.LineSegments[] = [];
  private coreLight!: THREE.PointLight;

  // 1b. Core Surface Fresnel Cursor Response
  private coreSurfaceSpot!: THREE.Mesh;
  private targetSpotPos: THREE.Vector3 = new THREE.Vector3();
  private currentSpotPos: THREE.Vector3 = new THREE.Vector3();
  private isCoreHit: boolean = false;
  private spotOpacity: number = 0;

  // 1c. Presence Scanning Wave
  private scanningRing!: THREE.LineSegments;
  private scanningActive: boolean = false;
  private scanningTimer: number = 0;

  // 2. Four Semantic Cognitive Nodes (RAW, CONTEXT, SELF, LONG-TERM)
  private memoryNodes: MemoryNode[] = [];
  private synapticGraph!: THREE.LineSegments;
  private graphGeo!: THREE.BufferGeometry;

  // 2b. Dwell Secondary Connection Thread
  private dwellLine!: THREE.Line;
  private dwellGeo!: THREE.BufferGeometry;
  private dwellPulseBead!: THREE.Mesh;
  private activeDwellNode: MemoryNode | null = null;
  private dwellT: number = 0;

  // 3. Abstract Hand Signature (5 fingertips + 1 palm center)
  private handGroup: THREE.Group = new THREE.Group();
  private handPoints!: THREE.Points;
  private handLines!: THREE.LineSegments;
  private handVelocities: THREE.Vector3[] = [];
  private handDetached: boolean = false;
  private handOpacity: number = 0;
  private handTimer: number = 0;

  // 4. Timeline / Semantic Data Matrix Plates (2025, 2026, Memory Events)
  private timelinePlates: THREE.Group[] = [];

  // 5. Surrounding Memory Particle Field
  private memoryParticles!: THREE.Points;

  // Interaction States
  public hoveredNodeId: string | null = null;
  public selectedNodeId: string | null = null;

  constructor() {
    this.group.position.set(0.5, 2.2, -14.0);
    // Hidden by default during main webpage scroll to prevent visual interference with Chapter 3
    this.group.visible = false;

    this.buildMemoryCore();
    this.buildScanningWave();
    this.buildCognitiveNodes();
    this.buildDwellLine();
    this.buildAbstractHandSignature();
    this.buildTimelineDataPlates();
    this.buildMemoryParticleField();
  }

  // --- 1. CENTRAL MEMORY CORE & FRESNEL SPOT ---
  private buildMemoryCore(): void {
    // Hyper-refined octahedron crystal lattice with dual wireframe
    const geo = new THREE.OctahedronGeometry(1.1, 1);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x05080f,
      roughness: 0.12,
      metalness: 0.92,
      transparent: true,
      opacity: 0.9,
    });
    this.coreMesh = new THREE.Mesh(geo, mat);
    this.group.add(this.coreMesh);

    const wireGeo = new THREE.EdgesGeometry(geo);
    const wireMat = new THREE.LineBasicMaterial({
      color: 0x6e9eae, // Ice Cyan
      transparent: true,
      opacity: 0.8,
    });
    this.coreWire = new THREE.LineSegments(wireGeo, wireMat);
    this.coreMesh.add(this.coreWire);

    // Inner pulsating nucleus
    const nucGeo = new THREE.DodecahedronGeometry(0.52, 0);
    const nucMat = new THREE.MeshBasicMaterial({
      color: 0xf2c8d0, // Sakura Pink
      wireframe: true,
      transparent: true,
      opacity: 0.85,
    });
    const nucleus = new THREE.Mesh(nucGeo, nucMat);
    this.coreMesh.add(nucleus);

    // Orbital equatorial memory rings
    const ringRadii = [1.5, 2.0];
    ringRadii.forEach((r, idx) => {
      const ringGeo = new THREE.RingGeometry(r, r + 0.025, 48);
      const ringMat = new THREE.LineBasicMaterial({
        color: idx === 0 ? 0x6e9eae : 0xb4c8d8,
        transparent: true,
        opacity: 0.45,
      });
      const ring = new THREE.LineSegments(new THREE.EdgesGeometry(ringGeo), ringMat);
      ring.rotation.x = Math.PI * (0.35 + idx * 0.25);
      this.coreMesh.add(ring);
      this.coreHaloRings.push(ring);
    });

    // Central core light source
    this.coreLight = new THREE.PointLight(0x6e9eae, 2.2, 10.0);
    this.coreMesh.add(this.coreLight);

    // Subtle Surface Fresnel Contact Spot (Responding to cursor gaze on Core)
    const spotGeo = new THREE.SphereGeometry(0.18, 16, 16);
    const spotMat = new THREE.MeshBasicMaterial({
      color: 0x6e9eae,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
    });
    this.coreSurfaceSpot = new THREE.Mesh(spotGeo, spotMat);
    this.coreMesh.add(this.coreSurfaceSpot);
  }

  // --- 1b. SCANNING RIPPLE WAVE (PRESENCE INTRO RITUAL) ---
  private buildScanningWave(): void {
    const ringGeo = new THREE.RingGeometry(0.2, 0.24, 64);
    const ringMat = new THREE.LineBasicMaterial({
      color: 0x6e9eae,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
    });
    this.scanningRing = new THREE.LineSegments(new THREE.EdgesGeometry(ringGeo), ringMat);
    this.scanningRing.rotation.x = Math.PI * 0.5;
    this.coreMesh.add(this.scanningRing);
  }

  public triggerPresenceScan(): void {
    this.scanningActive = true;
    this.scanningTimer = 0;
    this.handDetached = false;
    this.handTimer = 0;
    this.handOpacity = 0.55;
    this.resetHandPositions();
  }

  // --- 2. FOUR COGNITIVE NODES: RAW, CONTEXT, SELF, LONG-TERM ---
  private buildCognitiveNodes(): void {
    const nodeConfigs = [
      {
        id: 'RAW',
        label: 'RAW INPUT STREAM',
        sublabel: 'Sensory Perception & Token Buffer',
        pos: new THREE.Vector3(-2.4, 0.9, -0.6),
        color: 0x6e9eae, // Ice Cyan
      },
      {
        id: 'CONTEXT',
        label: 'CONTEXT GRAPH',
        sublabel: 'Dynamic Working Memory & Attention',
        pos: new THREE.Vector3(0.0, 1.8, 1.2),
        color: 0xb4c8d8, // Mist Blue
      },
      {
        id: 'SELF',
        label: 'SELF IDENTITY',
        sublabel: 'Autonomous Persona & Agent Boundaries',
        pos: new THREE.Vector3(2.4, 0.8, -0.6),
        color: 0xf2c8d0, // Sakura Pink
      },
      {
        id: 'LONG_TERM',
        label: 'LONG-TERM MEMORY',
        sublabel: 'Vectorized Knowledge & Episodic Store',
        pos: new THREE.Vector3(0.0, -1.8, -1.0),
        color: 0x5a88a8, // Slate Cyan
      },
    ];

    nodeConfigs.forEach((cfg) => {
      // Node housing mesh
      const nodeGeo = new THREE.OctahedronGeometry(0.32, 0);
      const nodeMat = new THREE.MeshStandardMaterial({
        color: 0x060b12,
        roughness: 0.15,
        metalness: 0.85,
        transparent: true,
        opacity: 0.9,
      });
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      nodeMesh.position.copy(cfg.pos);
      nodeMesh.userData = { nodeId: cfg.id };

      const wireGeo = new THREE.EdgesGeometry(nodeGeo);
      const wireMat = new THREE.LineBasicMaterial({
        color: cfg.color,
        transparent: true,
        opacity: 0.85,
      });
      const nodeWire = new THREE.LineSegments(wireGeo, wireMat);
      nodeMesh.add(nodeWire);

      // Inner glowing core
      const beaconGeo = new THREE.BoxGeometry(0.14, 0.14, 0.14);
      const beaconMat = new THREE.MeshBasicMaterial({
        color: cfg.color,
        wireframe: true,
        transparent: true,
        opacity: 0.9,
      });
      const nodeBeacon = new THREE.Mesh(beaconGeo, beaconMat);
      nodeMesh.add(nodeBeacon);

      this.group.add(nodeMesh);

      this.memoryNodes.push({
        id: cfg.id,
        label: cfg.label,
        sublabel: cfg.sublabel,
        position: cfg.pos,
        color: cfg.color,
        mesh: nodeMesh,
        wire: nodeWire,
        beacon: nodeBeacon,
        hitRadius: 0.65,
      });
    });

    // Build Synaptic Graph connecting each node to Core and to neighbors
    const linePairs: [THREE.Vector3, THREE.Vector3][] = [
      // Node to Center Core (0, 0, 0)
      [this.memoryNodes[0].position, new THREE.Vector3(0, 0, 0)],
      [this.memoryNodes[1].position, new THREE.Vector3(0, 0, 0)],
      [this.memoryNodes[2].position, new THREE.Vector3(0, 0, 0)],
      [this.memoryNodes[3].position, new THREE.Vector3(0, 0, 0)],
      // Horizontal inter-node connections
      [this.memoryNodes[0].position, this.memoryNodes[1].position], // RAW <-> CONTEXT
      [this.memoryNodes[1].position, this.memoryNodes[2].position], // CONTEXT <-> SELF
      [this.memoryNodes[0].position, this.memoryNodes[3].position], // RAW <-> LONG-TERM
      [this.memoryNodes[2].position, this.memoryNodes[3].position], // SELF <-> LONG-TERM
    ];

    const coords: number[] = [];
    linePairs.forEach(([p1, p2]) => {
      coords.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);
    });

    this.graphGeo = new THREE.BufferGeometry();
    this.graphGeo.setAttribute('position', new THREE.Float32BufferAttribute(coords, 3));

    const graphMat = new THREE.LineBasicMaterial({
      color: 0x6e9eae,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
    });
    this.synapticGraph = new THREE.LineSegments(this.graphGeo, graphMat);
    this.group.add(this.synapticGraph);
  }

  // --- 2b. DWELL SECONDARY RECOGNITION CONDUCTION THREAD ---
  private buildDwellLine(): void {
    this.dwellGeo = new THREE.BufferGeometry();
    const pos = new Float32Array(6); // 2 points (node to core)
    this.dwellGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    const mat = new THREE.LineBasicMaterial({
      color: 0xf2c8d0, // Sakura Pink
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
    });
    this.dwellLine = new THREE.Line(this.dwellGeo, mat);
    this.dwellLine.visible = false;
    this.group.add(this.dwellLine);

    // Pulse bead traveling along thread
    const beadGeo = new THREE.SphereGeometry(0.05, 12, 12);
    const beadMat = new THREE.MeshBasicMaterial({
      color: 0xf2c8d0,
      transparent: true,
      opacity: 0.0,
    });
    this.dwellPulseBead = new THREE.Mesh(beadGeo, beadMat);
    this.dwellPulseBead.visible = false;
    this.group.add(this.dwellPulseBead);
  }

  // --- 3. ABSTRACT HAND SIGNATURE (5 FINGERTIPS + 1 PALM CENTER) ---
  private initialHandPositions = [
    new THREE.Vector3(-0.45, 0.45, 0.1),  // Thumb
    new THREE.Vector3(-0.25, 0.85, 0.0),  // Index
    new THREE.Vector3(0.0, 0.95, -0.05),  // Middle
    new THREE.Vector3(0.25, 0.8, 0.0),    // Ring
    new THREE.Vector3(0.42, 0.55, 0.08),  // Pinky
    new THREE.Vector3(0.0, 0.15, 0.05),   // Palm center
  ];

  private buildAbstractHandSignature(): void {
    // Spatial positioning in front of Core towards the observer
    this.handGroup.position.set(0.2, -0.6, 2.5);
    this.group.add(this.handGroup);

    const count = 6;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = this.initialHandPositions[i].x;
      pos[i * 3 + 1] = this.initialHandPositions[i].y;
      pos[i * 3 + 2] = this.initialHandPositions[i].z;
      this.handVelocities.push(new THREE.Vector3(
        (Math.random() - 0.5) * 0.6,
        0.3 + Math.random() * 0.5,
        (Math.random() - 0.5) * 0.6
      ));
    }

    const ptsGeo = new THREE.BufferGeometry();
    ptsGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    const ptsMat = new THREE.PointsMaterial({
      size: 0.08,
      color: 0x6e9eae,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
    });
    this.handPoints = new THREE.Points(ptsGeo, ptsMat);
    this.handGroup.add(this.handPoints);

    // Minimal connecting lines (palm to each fingertip)
    const lineCoords: number[] = [];
    const palm = this.initialHandPositions[5];
    for (let i = 0; i < 5; i++) {
      const tip = this.initialHandPositions[i];
      lineCoords.push(palm.x, palm.y, palm.z, tip.x, tip.y, tip.z);
    }

    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(lineCoords, 3));
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x6e9eae,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
    });
    this.handLines = new THREE.LineSegments(lineGeo, lineMat);
    this.handGroup.add(this.handLines);
  }

  private resetHandPositions(): void {
    const posAttr = this.handPoints.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < 6; i++) {
      posAttr.setXYZ(i, this.initialHandPositions[i].x, this.initialHandPositions[i].y, this.initialHandPositions[i].z);
    }
    posAttr.needsUpdate = true;
  }

  // --- 4. TIMELINE & SEMANTIC DATA MATRIX PLATES ---
  private buildTimelineDataPlates(): void {
    const timelines = [
      { text: '2025 · AGENT ZERO', sub: 'Cognitive Architecture Initialized', pos: new THREE.Vector3(-3.4, -0.4, 1.2), rotY: 0.3 },
      { text: '2026 · XiaoZhaiOS', sub: 'Spatial Intelligence & Memory Graph', pos: new THREE.Vector3(3.2, -0.2, 1.0), rotY: -0.3 },
      { text: 'SYNAPSE · VECTOR', sub: 'Dynamic Semantic Embeddings', pos: new THREE.Vector3(0.0, 2.7, -1.8), rotY: 0.0 },
    ];

    timelines.forEach((t) => {
      const plateGroup = new THREE.Group();
      plateGroup.position.copy(t.pos);
      plateGroup.rotation.y = t.rotY;

      // 1. Sleek line-framed holographic HUD wafer
      const plateGeo = new THREE.PlaneGeometry(1.6, 0.65);
      const plateMat = new THREE.MeshBasicMaterial({
        color: 0x050a12,
        transparent: true,
        opacity: 0.75,
        side: THREE.DoubleSide,
      });
      const plateMesh = new THREE.Mesh(plateGeo, plateMat);
      plateGroup.add(plateMesh);

      const frameGeo = new THREE.EdgesGeometry(plateGeo);
      const frameMat = new THREE.LineBasicMaterial({
        color: 0x6e9eae,
        transparent: true,
        opacity: 0.6,
      });
      const frame = new THREE.LineSegments(frameGeo, frameMat);
      plateGroup.add(frame);

      // 2. High-DPI canvas texture rendering semantic typography
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 208;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'rgba(5, 10, 18, 0.9)';
        ctx.fillRect(0, 0, 512, 208);

        // Header accent dot & label
        ctx.fillStyle = '#6e9eae';
        ctx.beginPath();
        ctx.arc(36, 46, 7, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#dfe7e0';
        ctx.font = 'bold 32px monospace';
        ctx.letterSpacing = '3px';
        ctx.fillText(t.text, 58, 56);

        // Sublabel
        ctx.fillStyle = 'rgba(223, 231, 224, 0.7)';
        ctx.font = '22px system-ui, sans-serif';
        ctx.fillText(t.sub, 36, 110);

        // Tech status metric
        ctx.fillStyle = '#f2c8d0';
        ctx.font = '18px monospace';
        ctx.fillText('STATUS: SYNCHRONIZED [OK]', 36, 160);
      }

      const tex = new THREE.CanvasTexture(canvas);
      tex.minFilter = THREE.LinearFilter;
      const labelMat = new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        opacity: 0.85,
        side: THREE.DoubleSide,
      });
      const labelMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.58), labelMat);
      labelMesh.position.z = 0.02;
      plateGroup.add(labelMesh);

      this.group.add(plateGroup);
      this.timelinePlates.push(plateGroup);
    });
  }

  // --- 5. SURROUNDING MEMORY PARTICLE FIELD ---
  private buildMemoryParticleField(): void {
    const count = 300;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const cCyan = new THREE.Color(0x6e9eae);
    const cBlue = new THREE.Color(0xb4c8d8);
    const cPink = new THREE.Color(0xf2c8d0);

    for (let i = 0; i < count; i++) {
      const radius = 2.2 + Math.random() * 6.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;

      positions[i * 3] = Math.cos(phi) * Math.cos(theta) * radius;
      positions[i * 3 + 1] = Math.sin(phi) * radius;
      positions[i * 3 + 2] = Math.cos(phi) * Math.sin(theta) * radius;

      const pick = Math.random();
      const col = pick < 0.5 ? cCyan : pick < 0.8 ? cBlue : cPink;
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
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    this.memoryParticles = new THREE.Points(geo, mat);
    this.group.add(this.memoryParticles);
  }

  // --- INTERACTION & RAYCASTING GETTERS ---
  public getMemoryNodes(): MemoryNode[] {
    return this.memoryNodes;
  }

  public getCoreMesh(): THREE.Mesh {
    return this.coreMesh;
  }

  public setCoreHit(hitPoint: THREE.Vector3 | null): void {
    if (hitPoint) {
      this.isCoreHit = true;
      // Convert world hit point to Core local coordinates
      this.coreMesh.worldToLocal(this.targetSpotPos.copy(hitPoint));
    } else {
      this.isCoreHit = false;
    }
  }

  public setDwellConnection(nodeId: string | null, progress: number): void {
    if (nodeId && progress > 0.05) {
      const node = this.memoryNodes.find(n => n.id === nodeId);
      if (node) {
        this.activeDwellNode = node;
        this.dwellLine.visible = true;
        this.dwellPulseBead.visible = true;

        const posAttr = this.dwellGeo.attributes.position as THREE.BufferAttribute;
        // Point 0: Node position; Point 1: Core Center (0, 0, 0)
        posAttr.setXYZ(0, node.position.x, node.position.y, node.position.z);
        posAttr.setXYZ(1, 0, 0, 0);
        posAttr.needsUpdate = true;

        (this.dwellLine.material as THREE.LineBasicMaterial).opacity = 0.45 * Math.min(progress, 1.0);
        (this.dwellPulseBead.material as THREE.MeshBasicMaterial).opacity = 0.75 * Math.min(progress, 1.0);
        return;
      }
    }
    this.activeDwellNode = null;
    this.dwellLine.visible = false;
    this.dwellPulseBead.visible = false;
  }

  /**
   * Update logic with rigorous portal lifecycle and Presence Recognition states
   */
  public update(time: number, dt: number, isInPortal: boolean, portalFlightProgress: number = 0): void {
    const isActivelyInPortal = isInPortal || portalFlightProgress > 0.15;
    this.group.visible = isActivelyInPortal;
    if (!isActivelyInPortal) return;

    const enterFactor = isInPortal ? 1.0 : THREE.MathUtils.smoothstep(portalFlightProgress, 0.22, 0.78);

    // Dim surrounding world slightly if a node is selected (non-modal spatial focus)
    const selectionDim = this.selectedNodeId ? 0.88 : 1.0;

    // 1. Central Memory Core base rotation
    if (this.coreMesh) {
      this.coreMesh.rotation.y = time * 0.25;
      this.coreMesh.rotation.x = Math.sin(time * 0.4) * 0.12;
      (this.coreMesh.material as THREE.MeshStandardMaterial).opacity = 0.9 * enterFactor * selectionDim;
      (this.coreWire.material as THREE.LineBasicMaterial).opacity = 0.8 * enterFactor * selectionDim;
    }

    this.coreHaloRings.forEach((ring, idx) => {
      ring.rotation.z = time * (0.16 + idx * 0.08) * (idx % 2 === 0 ? 1 : -1);
    });

    // 1b. Core Surface Fresnel Follower
    if (this.coreSurfaceSpot) {
      if (this.isCoreHit) {
        this.currentSpotPos.lerp(this.targetSpotPos, 0.18);
        this.spotOpacity = THREE.MathUtils.lerp(this.spotOpacity, 0.55, 0.12);
      } else {
        this.spotOpacity = THREE.MathUtils.lerp(this.spotOpacity, 0.0, 0.08);
      }
      this.coreSurfaceSpot.position.copy(this.currentSpotPos);
      (this.coreSurfaceSpot.material as THREE.MeshBasicMaterial).opacity = this.spotOpacity * enterFactor;
    }

    // 1c. Presence Scanning Wave
    if (this.scanningActive) {
      this.scanningTimer += dt;
      const progress = this.scanningTimer / 1.4; // 1.4s scan wave duration
      if (progress >= 1.0) {
        this.scanningActive = false;
        (this.scanningRing.material as THREE.LineBasicMaterial).opacity = 0;
      } else {
        const scale = THREE.MathUtils.lerp(0.5, 3.8, progress);
        this.scanningRing.scale.set(scale, scale, scale);
        const waveAlpha = Math.sin(progress * Math.PI) * 0.45;
        (this.scanningRing.material as THREE.LineBasicMaterial).opacity = waveAlpha * enterFactor;
      }
    }

    // 2. Cognitive Nodes Animation & Selection Highlights
    this.memoryNodes.forEach((node, idx) => {
      const isHovered = this.hoveredNodeId === node.id;
      const isSelected = this.selectedNodeId === node.id;

      const floatY = Math.sin(time * 1.2 + idx * 1.5) * 0.08;
      node.mesh.position.y = node.position.y + floatY;
      node.mesh.rotation.y = time * 0.5;
      node.beacon.rotation.x = time * 0.8;

      // Highlight target node, keep others calm
      const targetWireAlpha = isSelected ? 1.0 : isHovered ? 0.95 : 0.85;
      const targetMeshAlpha = isSelected ? 0.98 : isHovered ? 0.94 : 0.90;
      (node.mesh.material as THREE.MeshStandardMaterial).opacity = targetMeshAlpha * enterFactor;
      (node.wire.material as THREE.LineBasicMaterial).opacity = targetWireAlpha * enterFactor;

      // Beacon color shifts to Sakura Pink on selection
      if (isSelected) {
        (node.beacon.material as THREE.MeshBasicMaterial).color.setHex(0xf2c8d0);
      } else {
        (node.beacon.material as THREE.MeshBasicMaterial).color.setHex(node.color);
      }
    });

    // 2b. Dwell Pulse Conduction
    if (this.activeDwellNode && this.dwellPulseBead.visible) {
      this.dwellT = (this.dwellT + dt * 0.7) % 1.0;
      // Lerp bead from node position to core (0, 0, 0)
      this.dwellPulseBead.position.lerpVectors(this.activeDwellNode.position, new THREE.Vector3(0, 0, 0), this.dwellT);
    }

    // 3. Abstract Hand Signature Evolution
    if (this.handOpacity > 0.005) {
      this.handTimer += dt;
      if (this.handTimer > 0.75 && !this.handDetached) {
        this.handDetached = true;
      }

      if (this.handDetached) {
        // Points detach, gain outward momentum and slowly fade into memory world
        const posAttr = this.handPoints.geometry.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < 6; i++) {
          const vx = this.handVelocities[i].x * dt;
          const vy = this.handVelocities[i].y * dt;
          const vz = this.handVelocities[i].z * dt;
          posAttr.setXYZ(i, posAttr.getX(i) + vx, posAttr.getY(i) + vy, posAttr.getZ(i) + vz);
        }
        posAttr.needsUpdate = true;

        this.handOpacity = THREE.MathUtils.lerp(this.handOpacity, 0, dt * 1.6);
        (this.handLines.material as THREE.LineBasicMaterial).opacity = Math.max(0, this.handOpacity - 0.2) * enterFactor;
      } else {
        (this.handLines.material as THREE.LineBasicMaterial).opacity = 0.35 * enterFactor;
      }
      (this.handPoints.material as THREE.PointsMaterial).opacity = this.handOpacity * enterFactor;
    }

    // 4. Dynamic Synaptic Graph pulse
    if (this.synapticGraph) {
      const pulse = 0.35 + Math.sin(time * 2.2) * 0.15;
      (this.synapticGraph.material as THREE.LineBasicMaterial).opacity = pulse * enterFactor * selectionDim;
    }

    // 5. Timeline Data Plates gentle floating
    this.timelinePlates.forEach((plate, idx) => {
      plate.position.y += Math.sin(time * 0.8 + idx * 2.0) * 0.002;
    });

    // 6. Memory Particles slow orbital drift
    if (this.memoryParticles) {
      this.memoryParticles.rotation.y = time * 0.04;
      (this.memoryParticles.material as THREE.PointsMaterial).opacity = 0.75 * enterFactor * selectionDim;
    }
  }

  public dispose(): void {
    this.group.traverse((child) => {
      if (child instanceof THREE.Mesh || child instanceof THREE.LineSegments || child instanceof THREE.Line || child instanceof THREE.Points) {
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
