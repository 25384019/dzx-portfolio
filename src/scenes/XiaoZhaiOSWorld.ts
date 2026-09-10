import * as THREE from 'three';

export class XiaoZhaiOSWorld {
  public group: THREE.Group = new THREE.Group();
  public portalCameraTarget = {
    position: new THREE.Vector3(0.5, 2.2, -7.0),
    target: new THREE.Vector3(0.5, 2.2, -18.0),
    fov: 44,
    name: 'XiaoZhaiOS · Neural Data World',
  };

  private memoryCore!: THREE.Mesh;
  private coreWire!: THREE.LineSegments;
  private synapticNodes!: THREE.Points;
  private synapticThreads!: THREE.LineSegments;
  private memoryPlates: THREE.Mesh[] = [];
  private pulseRings: THREE.Mesh[] = [];

  constructor() {
    // Hidden initially; activated and positioned in the data matrix
    this.group.position.set(0.5, 2.2, -14.0);
    this.buildMemoryCore();
    this.buildSynapticGrid();
    this.buildMemoryPlates();
    this.buildPulseRings();
  }

  private buildMemoryCore(): void {
    // Hyper-geometric rotating neural memory crystal
    const geo = new THREE.IcosahedronGeometry(1.2, 1);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x06090e,
      roughness: 0.15,
      metalness: 0.95,
      transparent: true,
      opacity: 0.92,
    });
    this.memoryCore = new THREE.Mesh(geo, mat);
    this.group.add(this.memoryCore);

    // Sakura pink and ice cyan dual wireframe
    const wireGeo = new THREE.EdgesGeometry(geo);
    const wireMat = new THREE.LineBasicMaterial({
      color: 0xf2c8d0, // Sakura Pink
      transparent: true,
      opacity: 0.75,
    });
    this.coreWire = new THREE.LineSegments(wireGeo, wireMat);
    this.memoryCore.add(this.coreWire);

    // Inner glowing core
    const innerGeo = new THREE.OctahedronGeometry(0.65, 0);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x6e9eae, // Ice Lake Cyan
      wireframe: true,
      transparent: true,
      opacity: 0.9,
    });
    const inner = new THREE.Mesh(innerGeo, innerMat);
    this.memoryCore.add(inner);

    const light = new THREE.PointLight(0x6e9eae, 1.8, 8.0);
    this.memoryCore.add(light);
  }

  private buildSynapticGrid(): void {
    const count = 420;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const cCyan = new THREE.Color(0x6e9eae);
    const cBlue = new THREE.Color(0xb4c8d8);
    const cPink = new THREE.Color(0xf2c8d0);

    for (let i = 0; i < count; i++) {
      const radius = 1.8 + Math.random() * 7.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;

      positions[i * 3] = Math.cos(phi) * Math.cos(theta) * radius;
      positions[i * 3 + 1] = Math.sin(phi) * radius;
      positions[i * 3 + 2] = Math.cos(phi) * Math.sin(theta) * radius;

      const pick = Math.random();
      const col = pick < 0.45 ? cCyan : pick < 0.75 ? cBlue : cPink;
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.09,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    this.synapticNodes = new THREE.Points(geo, mat);
    this.group.add(this.synapticNodes);

    // Connect selective nearest nodes with synaptic lines
    const lineCoords: number[] = [];
    for (let i = 0; i < Math.min(count, 120); i += 2) {
      lineCoords.push(
        positions[i * 3],
        positions[i * 3 + 1],
        positions[i * 3 + 2],
        positions[(i + 1) * 3],
        positions[(i + 1) * 3 + 1],
        positions[(i + 1) * 3 + 2]
      );
    }
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(lineCoords, 3));
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x6e9eae,
      transparent: true,
      opacity: 0.22,
    });
    this.synapticThreads = new THREE.LineSegments(lineGeo, lineMat);
    this.group.add(this.synapticThreads);
  }

  private buildMemoryPlates(): void {
    // Floating translucent memory wafers / code panels
    const plateGeo = new THREE.PlaneGeometry(0.9, 0.55);
    const plateMat = new THREE.MeshBasicMaterial({
      color: 0x081018,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
    });

    for (let i = 0; i < 8; i++) {
      const plate = new THREE.Mesh(plateGeo, plateMat);
      const angle = (i / 8) * Math.PI * 2;
      const r = 2.8 + (i % 2) * 0.8;
      plate.position.set(Math.cos(angle) * r, (Math.random() - 0.5) * 2.2, Math.sin(angle) * r);
      plate.rotation.y = angle + Math.PI * 0.5;
      this.group.add(plate);
      this.memoryPlates.push(plate);
    }
  }

  private buildPulseRings(): void {
    for (let i = 0; i < 3; i++) {
      const ringGeo = new THREE.RingGeometry(2.4 + i * 1.2, 2.44 + i * 1.2, 48);
      const ringMat = new THREE.MeshBasicMaterial({
        color: i === 1 ? 0xf2c8d0 : 0x6e9eae,
        transparent: true,
        opacity: 0.25 - i * 0.05,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI * 0.5;
      ring.position.y = -1.2 + i * 0.8;
      this.group.add(ring);
      this.pulseRings.push(ring);
    }
  }

  public update(time: number, _dt: number, _isActive: boolean): void {
    if (this.memoryCore) {
      this.memoryCore.rotation.y = time * 0.3;
      this.memoryCore.rotation.x = Math.sin(time * 0.4) * 0.2;
      const scale = 1.0 + Math.sin(time * 2.2) * 0.035;
      this.memoryCore.scale.set(scale, scale, scale);
    }

    if (this.synapticNodes) {
      this.synapticNodes.rotation.y = -time * 0.05;
    }

    if (this.synapticThreads) {
      this.synapticThreads.rotation.y = -time * 0.05;
      (this.synapticThreads.material as THREE.LineBasicMaterial).opacity =
        0.2 + Math.sin(time * 1.8) * 0.08;
    }

    this.memoryPlates.forEach((p, idx) => {
      p.position.y += Math.sin(time * 1.2 + idx) * 0.002;
    });

    this.pulseRings.forEach((r, idx) => {
      r.rotation.z = time * (0.05 * (idx % 2 === 0 ? 1 : -1));
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
