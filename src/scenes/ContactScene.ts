import * as THREE from 'three';

/**
 * ContactScene — Terminal Gate / Apocalyptic Revelation (Chapter 05)
 *
 * Architecture:
 * 1. Structural Frame: Dual-layer rectangular ribbon frame (outer: 1.0, inner: 0.92, Z offset -0.022)
 * 2. Revelation Atmosphere Plane: Local quad PlaneGeometry with custom ShaderMaterial
 *    - Box SDF outer halo
 *    - Gate interior mask
 *    - Gentle drifting haze (frozen when reduced-motion)
 *    - Central vertical descending light beam
 *    - ~15.5s low-frequency revelation pulse (Sakura Pink tint)
 *    - Pointer proximity smooth hover boost (+6% brightness, 0 spatial displacement)
 * 3. Faint Ground Horizon Datum: Ultra-quiet spatial reference line at base
 *
 * Performance:
 * - low-allocation update path (zero per-frame allocations)
 * - Added draw calls: <= 3
 * - Visible vertices: < 100
 */

const GATE_VERT = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const GATE_FRAG = `
precision highp float;

uniform float uTime;
uniform float uReveal;
uniform float uHover;
uniform float uMotion;
uniform float uAspect;

uniform vec3 uFrameColor;
uniform vec3 uHaloColor;
uniform vec3 uPulseColor;

varying vec2 vUv;

float sdBox(vec2 p, vec2 b) {
  vec2 d = abs(p) - b;
  return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}

float insideBox(vec2 p, vec2 b, float aa) {
  return 1.0 - smoothstep(-aa, aa, sdBox(p, b));
}

float boxFrame(vec2 p, vec2 b, float thickness, float aa) {
  float outer = insideBox(p, b, aa);
  float inner = insideBox(p, max(b - vec2(thickness), vec2(0.001)), aa);
  return clamp(outer - inner, 0.0, 1.0);
}

void main() {
  vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0);

  float aa = 0.0025;
  vec2 outerSize = vec2(0.46 * uAspect, 0.47);
  vec2 innerSize = outerSize * 0.92;

  float frameOuter = boxFrame(p, outerSize, 0.0055, aa);
  float frameInner = boxFrame(p, innerSize, 0.0030, aa);

  // Local glow / halo near gate edge (replaces full-screen bloom)
  float edgeDist = abs(sdBox(p, outerSize));
  float halo = 1.0 - smoothstep(0.005, 0.055, edgeDist);

  // Interior mask
  float interior = insideBox(p, innerSize - vec2(0.012), 0.006);

  // Extremely slow drifting haze (frozen when uMotion is 0)
  float hazePhase = p.y * 10.0 + uTime * 0.12 * uMotion;
  float haze = interior * (0.55 + 0.45 * sin(hazePhase)) * (0.65 + 0.35 * cos(p.x * 13.0));

  // Central vertical descending light beam
  float shaftX = exp(-36.0 * p.x * p.x);
  float shaftY = smoothstep(-0.48, 0.12, p.y);
  float shaft = shaftX * shaftY * interior;

  // ~15.5s slow revelation pulse
  float phase = 0.5 + 0.5 * sin(uTime * 0.405 * uMotion);
  float pulse = smoothstep(0.84, 1.0, phase);

  // Pointer proximity hover boost (max +6% brightness)
  float hoverBoost = 1.0 + 0.06 * uHover;

  vec3 color =
    uFrameColor * frameOuter * hoverBoost +
    uFrameColor * frameInner * 0.34 +
    uHaloColor  * halo       * 0.13 +
    uHaloColor  * haze       * 0.055 +
    uFrameColor * shaft      * 0.09 +
    uPulseColor * pulse      * halo * 0.055;

  float alpha =
    frameOuter * 0.72 +
    frameInner * 0.24 +
    halo       * 0.10 +
    haze       * 0.050 +
    shaft      * 0.085 +
    pulse      * halo * 0.035;

  alpha *= uReveal;

  if (alpha < 0.003) discard;

  gl_FragColor = vec4(color, clamp(alpha, 0.0, 0.82));
}
`;

export class ContactScene {
  public group: THREE.Group = new THREE.Group();

  // Gate Group positioned in space
  public gateGroup: THREE.Group = new THREE.Group();

  // Unified Atmosphere & Frame Quad Mesh
  private atmosphereMesh!: THREE.Mesh;
  private atmosphereGeo!: THREE.PlaneGeometry;
  private atmosphereMaterial!: THREE.ShaderMaterial;

  // Faint Ground Horizon Datum
  private horizonLine!: THREE.Line;
  private horizonGeo!: THREE.BufferGeometry;
  private horizonMaterial!: THREE.LineBasicMaterial;

  // Shader Uniforms
  private uniforms = {
    uTime: { value: 0 },
    uReveal: { value: 0 },
    uHover: { value: 0 },
    uMotion: { value: 1.0 },
    uAspect: { value: 1.34 / 3.08 },
    uFrameColor: { value: new THREE.Color(0xb4c8d8) }, // Mist Blue
    uHaloColor: { value: new THREE.Color(0x6e9eae) },  // Ice Cyan
    uPulseColor: { value: new THREE.Color(0xf2c8d0) }, // Sakura Pink
  };

  // State
  private hoverValue: number = 0;
  private frozenTime: number = 0;
  private reducedMotion: boolean = false;
  private suspended: boolean = false;

  constructor() {
    this.buildGate();
    this.buildGroundDatum();
    this.group.add(this.gateGroup);
    this.group.visible = false;
  }

  private buildGate(): void {
    // Gate dimensions: aspect ~ 2.3:1, height 3.08 world units (~47 vh), width 1.34 world units
    // Center positioned at [2.50, 2.40, -31.5] (X ~ 74 vw, Y ~ 50 vh at Chapter 05)
    this.gateGroup.position.set(2.50, 2.40, -31.5);
    this.gateGroup.rotation.y = -3.2 * (Math.PI / 180); // 3.2° yaw facing inward
    this.gateGroup.rotation.x = 0.5 * (Math.PI / 180);  // 0.5° subtle pitch
    this.gateGroup.rotation.z = 0;

    const width = 1.34;
    const height = 3.08;

    // Revelation Atmosphere & Frame Quad (scale 1.08) -> 1 Draw Call, 4 Vertices
    // Combines outer frame, inner frame, outer halo, interior haze, descending light, and pulse
    const atmWidth = width * 1.08;
    const atmHeight = height * 1.08;
    this.atmosphereGeo = new THREE.PlaneGeometry(atmWidth, atmHeight);
    this.uniforms.uAspect.value = atmWidth / atmHeight;

    this.atmosphereMaterial = new THREE.ShaderMaterial({
      vertexShader: GATE_VERT,
      fragmentShader: GATE_FRAG,
      uniforms: this.uniforms,
      transparent: true,
      depthTest: true,
      depthWrite: false,
      blending: THREE.CustomBlending,
      blendSrc: THREE.OneFactor,
      blendDst: THREE.OneFactor,
    });
    this.atmosphereMesh = new THREE.Mesh(this.atmosphereGeo, this.atmosphereMaterial);
    this.gateGroup.add(this.atmosphereMesh);
  }

  private buildGroundDatum(): void {
    // Ultra-faint background horizon ground datum beneath the gate (Y ~ 0.84, Z ~ -32.5)
    // 24 vertices gradient fading to zero on right
    const segments = 24;
    const positions = new Float32Array((segments + 1) * 3);
    const colors = new Float32Array((segments + 1) * 3);

    const pStart = new THREE.Vector3(-0.4, 0.84, -32.0);
    const pEnd = new THREE.Vector3(5.8, 0.82, -33.5);
    const baseColor = new THREE.Color(0x6e9eae);

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      positions[i * 3] = THREE.MathUtils.lerp(pStart.x, pEnd.x, t);
      positions[i * 3 + 1] = THREE.MathUtils.lerp(pStart.y, pEnd.y, t);
      positions[i * 3 + 2] = THREE.MathUtils.lerp(pStart.z, pEnd.z, t);

      const fade = Math.pow(1.0 - t, 1.5);
      const intensity = THREE.MathUtils.lerp(0.005, 0.05, fade);

      colors[i * 3] = baseColor.r * intensity;
      colors[i * 3 + 1] = baseColor.g * intensity;
      colors[i * 3 + 2] = baseColor.b * intensity;
    }

    this.horizonGeo = new THREE.BufferGeometry();
    this.horizonGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.horizonGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    this.horizonMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending,
    });
    this.horizonLine = new THREE.Line(this.horizonGeo, this.horizonMaterial);
    this.group.add(this.horizonLine);
  }

  public setResponsiveLayout(aspect: number): void {
    if (aspect < 1.0) {
      // Mobile portrait: position cleanly in the right negative space without overlapping text
      this.gateGroup.position.set(1.18, 2.15, -32.0);
      this.gateGroup.scale.setScalar(0.66);
    } else if (aspect < 1.4) {
      // Tablet / narrow desktop
      this.gateGroup.position.set(1.90, 2.30, -31.5);
      this.gateGroup.scale.setScalar(0.88);
    } else {
      // Standard desktop
      this.gateGroup.position.set(2.50, 2.40, -31.5);
      this.gateGroup.scale.setScalar(1.0);
    }
  }

  public setReducedMotion(reduced: boolean): void {
    this.reducedMotion = reduced;
  }

  public setSuspended(suspended: boolean): void {
    this.suspended = suspended;
  }

  public update(
    time: number,
    dt: number,
    progress: number,
    pointerDistance: number = 999
  ): void {
    // Reveal window: smoothstep 4.58 -> 4.86 as defined in report
    const reveal = THREE.MathUtils.smoothstep(progress, 4.58, 4.86);
    const isVisible = reveal > 0.001;
    this.group.visible = isVisible;
    if (!isVisible || this.suspended) return;

    this.uniforms.uReveal.value = reveal;

    // Pointer proximity: soft zone around gate (~200px equivalent in NDC: < 0.28)
    const hoverTarget = pointerDistance < 0.28 ? 1.0 : 0.0;
    // Exponential smoothing with frame-rate independence
    const k = 1.0 - Math.exp(-dt * 5.5);
    this.hoverValue += (hoverTarget - this.hoverValue) * k;
    this.uniforms.uHover.value = this.hoverValue;

    this.uniforms.uMotion.value = this.reducedMotion ? 0.0 : 1.0;

    // Deterministic test time injection support
    const effectiveTime = typeof (window as any).__DZX_TEST_TIME__ === 'number'
      ? (window as any).__DZX_TEST_TIME__
      : time;

    if (!this.reducedMotion) {
      this.uniforms.uTime.value = effectiveTime;
      this.frozenTime = effectiveTime;
    } else {
      this.uniforms.uTime.value = this.frozenTime;
    }

    // Update ground datum opacity
    this.horizonMaterial.opacity = 0.06 * reveal;
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

