import * as THREE from 'three';

const RIFT_WIDTH = 2.5;
const RIFT_HEIGHT = 3.7;
const HOVER_RADIUS_NDC = 0.28;
const CROSSING_RADIUS_NDC = 0.34;
const CROSSING_COOLDOWN = 1.15;
const CROSS_PULSE_DECAY = 2.45;

const RIFT_VERT = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const RIFT_FRAG = `
precision highp float;
uniform float uTime;
uniform float uReveal;
uniform float uProximity;
uniform float uCrossPulse;
uniform float uMotion;
uniform float uAspect;
uniform vec3 uIceColor;
uniform vec3 uMistColor;
uniform vec3 uPulseColor;
varying vec2 vUv;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

void main() {
  vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0);
  float absX = abs(p.x);
  float verticalMask = smoothstep(0.50, 0.34, abs(p.y));

  float core = exp(-absX * 940.0) * verticalMask;
  float innerGlow = exp(-absX * 150.0) * verticalMask;
  float outerGlow = exp(-absX * 28.0) * verticalMask;
  float grain = hash21(floor(vec2(p.y * 390.0, uTime * 2.0 * uMotion)));
  float filament = core * mix(0.82, 1.12, grain);
  float breath = 0.94 + 0.06 * sin(uTime * 0.52 * uMotion);

  float intersection = exp(-length(p * vec2(3.7, 10.0)) * 11.0);
  float rippleRadius = uCrossPulse * 0.22;
  float radius = length(p * vec2(1.0, 2.7));
  float ripple = exp(-pow((radius - rippleRadius) * 42.0, 2.0)) * uCrossPulse;
  float proximityBoost = 1.0 + uProximity * 0.12;

  vec3 light =
    uMistColor * filament * 0.72 +
    uIceColor * innerGlow * 0.20 +
    uIceColor * outerGlow * 0.050 +
    uIceColor * intersection * (0.08 + 0.12 * uProximity) +
    uPulseColor * ripple * 0.15;

  light *= breath * proximityBoost * uReveal;
  gl_FragColor = vec4(light, 1.0);
}
`;

export class ContactScene {
  public group = new THREE.Group();
  public gateGroup = new THREE.Group();

  private riftGeometry!: THREE.PlaneGeometry;
  private riftMaterial!: THREE.ShaderMaterial;
  private horizonGeometry!: THREE.BufferGeometry;
  private horizonMaterial!: THREE.LineBasicMaterial;

  private uniforms = {
    uTime: { value: 0 },
    uReveal: { value: 0 },
    uProximity: { value: 0 },
    uCrossPulse: { value: 0 },
    uMotion: { value: 1.0 },
    uAspect: { value: RIFT_WIDTH / RIFT_HEIGHT },
    uIceColor: { value: new THREE.Color(0x6e9eae) },
    uMistColor: { value: new THREE.Color(0xb4c8d8) },
    uPulseColor: { value: new THREE.Color(0xf2c8d0) },
  };

  private proximityValue = 0;
  private crossPulse = 0;
  private crossingCooldown = 0;
  private previousPointerSide = 0;
  private frozenTime = 0;
  private reducedMotion = false;
  private suspended = false;
  private baseScale = 1;

  constructor() {
    this.buildRift();
    this.buildHorizon();
    this.group.add(this.gateGroup);
    this.group.visible = false;
  }

  private buildRift(): void {
    this.gateGroup.position.set(2.5, 2.36, -31.5);
    this.gateGroup.rotation.set(0.4 * Math.PI / 180, -3.0 * Math.PI / 180, 0);
    this.riftGeometry = new THREE.PlaneGeometry(RIFT_WIDTH, RIFT_HEIGHT);
    this.riftMaterial = new THREE.ShaderMaterial({
      vertexShader: RIFT_VERT,
      fragmentShader: RIFT_FRAG,
      uniforms: this.uniforms,
      transparent: true,
      depthTest: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    const rift = new THREE.Mesh(this.riftGeometry, this.riftMaterial);
    rift.position.z = -0.03;
    this.gateGroup.add(rift);
  }

  private buildHorizon(): void {
    const segments = 40;
    const positions = new Float32Array((segments + 1) * 3);
    const colors = new Float32Array((segments + 1) * 3);
    const cyan = new THREE.Color(0x6e9eae);

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const x = THREE.MathUtils.lerp(-1.45, 3.55, t);
      const distanceFromOrigin = Math.abs(x) / 3.55;
      const intensity = (1 - THREE.MathUtils.smoothstep(distanceFromOrigin, 0.18, 1.0)) * 0.24;
      positions[i * 3] = x;
      positions[i * 3 + 1] = THREE.MathUtils.lerp(-0.28, -0.35, t);
      positions[i * 3 + 2] = THREE.MathUtils.lerp(0.08, -1.65, t);
      colors[i * 3] = cyan.r * intensity;
      colors[i * 3 + 1] = cyan.g * intensity;
      colors[i * 3 + 2] = cyan.b * intensity;
    }

    this.horizonGeometry = new THREE.BufferGeometry();
    this.horizonGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.horizonGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    this.horizonMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.gateGroup.add(new THREE.Line(this.horizonGeometry, this.horizonMaterial));
  }

  public setResponsiveLayout(aspect: number): void {
    if (aspect < 1.0) {
      this.gateGroup.position.set(1.12, 2.08, -32.0);
      this.baseScale = 0.60;
    } else if (aspect < 1.4) {
      this.gateGroup.position.set(1.86, 2.26, -31.6);
      this.baseScale = 0.82;
    } else {
      this.gateGroup.position.set(2.5, 2.36, -31.5);
      this.baseScale = 1;
    }
    this.gateGroup.scale.setScalar(this.baseScale);
  }

  public setReducedMotion(reduced: boolean): void {
    this.reducedMotion = reduced;
    if (reduced) {
      this.crossPulse = 0;
      this.uniforms.uCrossPulse.value = 0;
    }
  }

  public setSuspended(suspended: boolean): void {
    this.suspended = suspended;
  }

  public update(time: number, dt: number, progress: number, pointerDistance = 999, pointerOffsetX = 999): void {
    const reveal = THREE.MathUtils.smoothstep(progress, 4.52, 4.88);
    this.group.visible = reveal > 0.001;
    if (!this.group.visible || this.suspended) return;

    const proximityTarget = pointerDistance < HOVER_RADIUS_NDC ? 1 : 0;
    this.proximityValue += (proximityTarget - this.proximityValue) * (1 - Math.exp(-dt * 4.6));
    this.crossingCooldown = Math.max(0, this.crossingCooldown - dt);

    const pointerSide = pointerOffsetX < 0 ? -1 : 1;
    const crossed = this.previousPointerSide !== 0 && pointerSide !== this.previousPointerSide;
    if (!this.reducedMotion && crossed && pointerDistance < CROSSING_RADIUS_NDC && this.crossingCooldown === 0) {
      this.crossPulse = 1;
      this.crossingCooldown = CROSSING_COOLDOWN;
    }
    this.previousPointerSide = pointerDistance < 0.72 ? pointerSide : 0;
    this.crossPulse = this.reducedMotion ? 0.0 : Math.max(0, this.crossPulse - dt * CROSS_PULSE_DECAY);

    const injectedTime = typeof (window as any).__DZX_TEST_TIME__ === 'number'
      ? (window as any).__DZX_TEST_TIME__
      : time;
    const effectiveTime = this.reducedMotion ? this.frozenTime : injectedTime;
    if (!this.reducedMotion) this.frozenTime = injectedTime;

    this.uniforms.uTime.value = effectiveTime;
    this.uniforms.uMotion.value = this.reducedMotion ? 0.0 : 1.0;
    this.uniforms.uReveal.value = reveal;
    this.uniforms.uProximity.value = this.reducedMotion ? 0 : this.proximityValue;
    this.uniforms.uCrossPulse.value = this.crossPulse;
    this.horizonMaterial.opacity = reveal * (0.74 + this.proximityValue * 0.12);
  }

  public dispose(): void {
    this.group.traverse((child) => {
      if (child instanceof THREE.Mesh || child instanceof THREE.Line) {
        child.geometry?.dispose();
        if (Array.isArray(child.material)) child.material.forEach((material) => material.dispose());
        else child.material?.dispose();
      }
    });
  }
}
