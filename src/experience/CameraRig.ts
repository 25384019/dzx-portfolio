import * as THREE from 'three';

export interface CameraKnot {
  progress: number;
  p: [number, number, number];
  t: [number, number, number];
  roll: number; // in radians
  fov: number;
}

export const DZX_CAMERA_KNOTS: CameraKnot[] = [
  // 00 HOME: Centered facing the monolithic obsidian neural core
  {
    progress: 0.0,
    p: [0.0, 3.2, 11.5],
    t: [0.0, 1.8, 0.0],
    roll: 0.0,
    fov: 42,
  },
  // 00 -> 01 FLANK PASS: Camera curves wide to the right flank, grazing the Core's edge
  // creating intense foreground occlusion and parallax silhouette before entering ABOUT
  {
    progress: 0.45,
    p: [4.8, 2.6, 6.8],
    t: [0.3, 2.0, 0.8],
    roll: 0.034, // banking right into the flank curve
    fov: 43.5,
  },
  // 01 ABOUT: Gliding into position framing the 3 disassembled modules (Cognition, System, Body)
  {
    progress: 1.0,
    p: [2.0, 2.1, 3.4],
    t: [-0.6, 1.8, -1.8],
    roll: -0.012, // subtle counter-bank settling into the frame
    fov: 44,
  },
  // 01 -> 02 DEEP PLUNGE: Camera plunges deeper into the persistent world
  {
    progress: 1.5,
    p: [-1.4, 2.5, -2.4],
    t: [0.2, 1.6, -6.0],
    roll: -0.024, // banking left through the data matrix conduits
    fov: 44.5,
  },
  // 02 PROJECTS: Lowering and aligning with XiaoZhaiOS floating pedestal and holographic interface
  {
    progress: 2.0,
    p: [-2.6, 2.2, -4.8],
    t: [0.5, 1.6, -7.2],
    roll: 0.014,
    fov: 45,
  },
  // 03 INTERESTS: Expansive drift into creative and photography coordinates
  {
    progress: 3.0,
    p: [2.6, 1.8, -9.5],
    t: [-0.4, 1.4, -14.5],
    roll: -0.018,
    fov: 46,
  },
  // 04 PHILOSOPHY: Elevated ascending vantage point
  {
    progress: 4.0,
    p: [-1.6, 3.6, -16.0],
    t: [0.0, 2.2, -22.5],
    roll: 0.02,
    fov: 43,
  },
  // 05 CONTACT: Terminal horizon alignment
  {
    progress: 5.0,
    p: [0.0, 2.4, -22.5],
    t: [0.0, 2.4, -32.0],
    roll: 0.0,
    fov: 40,
  },
];

export class CameraRig {
  public camera: THREE.PerspectiveCamera;
  public knots: CameraKnot[];

  // Current computed vectors & state
  public position: THREE.Vector3 = new THREE.Vector3();
  public target: THREE.Vector3 = new THREE.Vector3();
  public fov: number = 42;
  public roll: number = 0;

  // Scroll velocity & dynamic inertial response
  public prevProgress: number = 0;
  public rawVelocity: number = 0;
  public smoothVelocity: number = 0;
  public velocityPitch: number = 0;
  public velocityRoll: number = 0;

  // Parallax & Handheld state
  public tmx: number = 0;
  public tmy: number = 0;
  public mx: number = 0;
  public my: number = 0;
  public intro: number = 0;

  private _tmpP = new THREE.Vector3();

  constructor(knots: CameraKnot[] = DZX_CAMERA_KNOTS) {
    this.knots = knots;
    const aspect = window.innerWidth / Math.max(1, window.innerHeight);
    this.camera = new THREE.PerspectiveCamera(42, aspect, 0.1, 140);
    this.updateFromProgress(0, 0, 0);
  }

  public updatePointer(clientX: number, clientY: number, width: number, height: number): void {
    this.tmx = (clientX / Math.max(1, width)) * 2 - 1;
    this.tmy = -((clientY / Math.max(1, height)) * 2 - 1);
  }

  public resize(width: number, height: number): void {
    this.camera.aspect = width / Math.max(1, height);
    this.camera.updateProjectionMatrix();
  }

  public fitAspect(p: THREE.Vector3, t: THREE.Vector3, baseFov: number): number {
    const asp = this.camera.aspect;
    if (asp >= 1.55) return baseFov;
    // For mobile screens, pull camera back along look vector to preserve composition
    const fix = Math.max(0, (1.55 - asp) / 1.55);
    const dir = this._tmpP.subVectors(p, t).normalize();
    p.addScaledVector(dir, fix * 5.5);
    p.y += fix * 0.8;
    return baseFov * (1 + fix * 0.35);
  }

  /**
   * Evaluates camera position, target, roll, and fov at any continuous progress value.
   * Uses cubic Hermite spline interpolation between knots for guaranteed C1 continuity.
   */
  private evaluateTrajectory(progress: number): {
    p: THREE.Vector3;
    t: THREE.Vector3;
    roll: number;
    fov: number;
  } {
    const knots = this.knots;
    const minP = knots[0].progress;
    const maxP = knots[knots.length - 1].progress;
    const clamped = Math.min(Math.max(progress, minP), maxP);

    // Locate enclosing segment
    let idx = 0;
    for (let i = 0; i < knots.length - 1; i++) {
      if (clamped >= knots[i].progress && clamped <= knots[i + 1].progress) {
        idx = i;
        break;
      }
    }

    const k0 = knots[Math.max(0, idx - 1)];
    const k1 = knots[idx];
    const k2 = knots[idx + 1];
    const k3 = knots[Math.min(knots.length - 1, idx + 2)];

    const span = Math.max(1e-5, k2.progress - k1.progress);
    const u = (clamped - k1.progress) / span;

    // Cubic Hermite basis functions
    const u2 = u * u;
    const u3 = u2 * u;
    const h00 = 2 * u3 - 3 * u2 + 1;
    const h10 = u3 - 2 * u2 + u;
    const h01 = -2 * u3 + 3 * u2;
    const h11 = u3 - u2;

    // Position interpolation
    const pOut = new THREE.Vector3();
    const tOut = new THREE.Vector3();

    for (let axis = 0; axis < 3; axis++) {
      // Tangents at k1 and k2
      const m1_p = ((k2.p[axis] - k0.p[axis]) / Math.max(1e-5, k2.progress - k0.progress)) * span;
      const m2_p = ((k3.p[axis] - k1.p[axis]) / Math.max(1e-5, k3.progress - k1.progress)) * span;
      pOut.setComponent(axis, h00 * k1.p[axis] + h10 * m1_p + h01 * k2.p[axis] + h11 * m2_p);

      const m1_t = ((k2.t[axis] - k0.t[axis]) / Math.max(1e-5, k2.progress - k0.progress)) * span;
      const m2_t = ((k3.t[axis] - k1.t[axis]) / Math.max(1e-5, k3.progress - k1.progress)) * span;
      tOut.setComponent(axis, h00 * k1.t[axis] + h10 * m1_t + h01 * k2.t[axis] + h11 * m2_t);
    }

    // Roll and FOV interpolation with smooth blending
    const smoothU = u * u * (3 - 2 * u);
    const roll = THREE.MathUtils.lerp(k1.roll, k2.roll, smoothU);
    const fov = THREE.MathUtils.lerp(k1.fov, k2.fov, smoothU);

    return { p: pOut, t: tOut, roll, fov };
  }

  public updateFromProgress(progress: number, dt: number, time: number): void {
    // 1. Calculate Scroll Velocity & Dynamic Inertia
    if (dt > 0) {
      this.rawVelocity = (progress - this.prevProgress) / dt;
    } else {
      this.rawVelocity = 0;
    }
    this.prevProgress = progress;

    // Dampen velocity for physical inertia feel
    const velDamp = dt > 0 ? 1 - Math.exp(-6.5 * dt) : 1;
    this.smoothVelocity += (this.rawVelocity - this.smoothVelocity) * velDamp;

    // Dynamic pitch: Scrolling forward tilts camera down slightly; scrolling backward pulls up
    this.velocityPitch = -THREE.MathUtils.clamp(this.smoothVelocity * 0.022, -0.06, 0.06);
    // Dynamic roll: Scrolling creates subtle lateral banking response
    this.velocityRoll = -THREE.MathUtils.clamp(this.smoothVelocity * 0.012, -0.035, 0.035);

    // 2. Parallax mouse damping
    const dampFactor = dt > 0 ? 1 - Math.exp(-3.2 * dt) : 1;
    this.mx += (this.tmx - this.mx) * dampFactor;
    this.my += (this.tmy - this.my) * dampFactor;

    // 3. Evaluate trajectory
    const sample = this.evaluateTrajectory(progress);
    this.position.copy(sample.p);
    this.target.copy(sample.t);
    this.roll = sample.roll;
    this.fov = this.fitAspect(this.position, this.target, sample.fov);

    // 4. Intro entrance dolly
    if (this.intro < 1) {
      const io = 1 - this.intro;
      this.position.z += io * 4.5;
      this.position.y += io * 0.5;
      this.fov += io * 6.0;
    }

    // 5. Parallax hand-held drift
    const parDepth = Math.max(0.35, 1 - (progress / 5.0) * 0.5);
    this.position.x += this.mx * 0.65 * parDepth;
    this.position.y += this.my * 0.35 * parDepth;
    this.target.x -= this.mx * 0.22 * parDepth;
    this.target.y -= this.my * 0.14 * parDepth;

    // 6. Organic ambient breathing motion
    const breatheX = Math.sin(time * 0.65) * 0.08;
    const breatheY = Math.cos(time * 0.5) * 0.05;
    this.position.x += breatheX;
    this.position.y += breatheY;
    this.target.x += breatheX * 0.4;
    this.target.y += breatheY * 0.4;

    // 7. Apply to Three.js camera
    this.camera.position.copy(this.position);
    this.camera.lookAt(this.target);

    // Apply pitch dynamic tilt
    if (Math.abs(this.velocityPitch) > 1e-4) {
      this.camera.rotateX(this.velocityPitch);
    }

    // Apply continuous banking roll + velocity roll around local Z
    const totalRoll = this.roll + this.velocityRoll;
    if (Math.abs(totalRoll) > 1e-5) {
      this.camera.rotateZ(totalRoll);
    }

    if (Math.abs(this.camera.fov - this.fov) > 1e-4) {
      this.camera.fov = this.fov;
      this.camera.updateProjectionMatrix();
    }
  }
}

