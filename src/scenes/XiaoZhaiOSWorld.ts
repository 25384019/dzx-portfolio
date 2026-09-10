import * as THREE from 'three';

interface MemoryNode {
  id: string;
  label: string;
  sublabel: string;
  position: THREE.Vector3;
  color: number;
  mesh: THREE.Mesh;
  wire: THREE.LineSegments;
  beacon: THREE.Mesh;
}

export class XiaoZhaiOSWorld {
  public group: THREE.Group = new THREE.Group();
  public portalCameraTarget = {
    position: new THREE.Vector3(0.5, 2.2, -6.5),
    target: new THREE.Vector3(0.5, 2.2, -14.0),
    fov: 46,
    name: 'XiaoZhaiOS · Memory System',
  };

  // Central Neural Memory Core
  private coreMesh!: THREE.Mesh;
  private coreWire!: THREE.LineSegments;
  private coreHaloRings: THREE.LineSegments[] = [];

  // 4 Semantic Cognitive Nodes (RAW, CONTEXT, SELF, LONG-TERM)
  private memoryNodes: MemoryNode[] = [];
  private synapticGraph!: THREE.LineSegments;
  private graphGeo!: THREE.BufferGeometry;

  // Timeline / Semantic Data Matrix Plates (2025, 2026, Memory Events)
  private timelinePlates: THREE.Group[] = [];

  // Surrounding Memory Particle Field
  private memoryParticles!: THREE.Points;

  constructor() {
    this.group.position.set(0.5, 2.2, -14.0);
    // Hidden by default during main webpage scroll to prevent visual interference with Chapter 3
    this.group.visible = false;

    this.buildMemoryCore();
    this.buildCognitiveNodes();
    this.buildTimelineDataPlates();
    this.buildMemoryParticleField();
  }

  // --- 1. CENTRAL MEMORY CORE ---
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
    const light = new THREE.PointLight(0x6e9eae, 2.2, 10.0);
    this.coreMesh.add(light);
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

  // --- 3. TIMELINE & SEMANTIC DATA MATRIX PLATES ---
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

  // --- 4. SURROUNDING MEMORY PARTICLE FIELD ---
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

  /**
   * Update logic with rigorous portal lifecycle control:
   * Only materializes when entering portal (progress >= 0.20, peaking at 0.65 -> 1.0).
   * Completely hidden during normal webpage scrolling to prevent any visual collision with Chapter 3.
   */
  public update(time: number, _dt: number, isInPortal: boolean, portalFlightProgress: number = 0): void {
    // If neither in portal nor transitioning into it, keep hidden
    const isActivelyInPortal = isInPortal || portalFlightProgress > 0.15;
    this.group.visible = isActivelyInPortal;
    if (!isActivelyInPortal) return;

    // Materialization factor:
    // 0.0 -> 0.2: 0 (camera starts flight, project UI fades out)
    // 0.2 -> 0.75: smoothstep materialization into the world
    // isInPortal holds it at 1.0
    const enterFactor = isInPortal ? 1.0 : THREE.MathUtils.smoothstep(portalFlightProgress, 0.22, 0.78);

    // 1. Memory Core rotation & breathing pulse
    if (this.coreMesh) {
      this.coreMesh.rotation.y = time * 0.35;
      this.coreMesh.rotation.x = Math.sin(time * 0.5) * 0.15;
      (this.coreMesh.material as THREE.MeshStandardMaterial).opacity = 0.9 * enterFactor;
      (this.coreWire.material as THREE.LineBasicMaterial).opacity = 0.8 * enterFactor;
    }

    this.coreHaloRings.forEach((ring, idx) => {
      ring.rotation.z = time * (0.2 + idx * 0.1) * (idx % 2 === 0 ? 1 : -1);
    });

    // 2. Cognitive Nodes floating & beacon spin
    this.memoryNodes.forEach((node, idx) => {
      const floatY = Math.sin(time * 1.2 + idx * 1.5) * 0.08;
      node.mesh.position.y = node.position.y + floatY;
      node.mesh.rotation.y = time * 0.5;
      node.beacon.rotation.x = time * 0.8;
      (node.mesh.material as THREE.MeshStandardMaterial).opacity = 0.9 * enterFactor;
      (node.wire.material as THREE.LineBasicMaterial).opacity = 0.85 * enterFactor;
    });

    // 3. Dynamic Synaptic Graph pulse
    if (this.synapticGraph) {
      const pulse = 0.35 + Math.sin(time * 2.2) * 0.15;
      (this.synapticGraph.material as THREE.LineBasicMaterial).opacity = pulse * enterFactor;
    }

    // 4. Timeline Data Plates gentle floating & billboarding towards viewer
    this.timelinePlates.forEach((plate, idx) => {
      plate.position.y += Math.sin(time * 0.8 + idx * 2.0) * 0.002;
    });

    // 5. Memory Particles slow orbital drift
    if (this.memoryParticles) {
      this.memoryParticles.rotation.y = time * 0.04;
      (this.memoryParticles.material as THREE.PointsMaterial).opacity = 0.75 * enterFactor;
    }
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
