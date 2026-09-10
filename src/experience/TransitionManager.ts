import * as THREE from 'three';

export interface TransitionTarget {
  position: THREE.Vector3;
  target: THREE.Vector3;
  fov: number;
  name: string;
}

export class TransitionManager {
  public active: boolean = false;
  public progress: number = 0;
  public direction: 1 | -1 | 0 = 0; // 1 = entering portal, -1 = exiting, 0 = idle
  public time: number = 0;
  public duration: number = 1.8;
  public arcHeight: number = 1.15; // Parabolic lift during flight

  public startP: THREE.Vector3 = new THREE.Vector3();
  public startT: THREE.Vector3 = new THREE.Vector3();
  public startFov: number = 42;

  public baseP: THREE.Vector3 = new THREE.Vector3();
  public baseT: THREE.Vector3 = new THREE.Vector3();
  public targetFov: number = 42;
  public portalName: string = '';

  // Interpolated outputs for camera override
  public currentP: THREE.Vector3 = new THREE.Vector3();
  public currentT: THREE.Vector3 = new THREE.Vector3();
  public currentFov: number = 42;

  public onEnterStart?: () => void;
  public onEnterComplete?: () => void;
  public onExitStart?: () => void;
  public onExitComplete?: () => void;

  public static easeFlight(t: number): number {
    return t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2;
  }

  public enter(fromP: THREE.Vector3, fromT: THREE.Vector3, fromFov: number, target: TransitionTarget): void {
    if (this.active && this.direction === 1 && this.portalName === target.name) return;

    this.active = true;
    this.direction = 1;
    this.time = 0;
    this.progress = 0;

    this.startP.copy(fromP);
    this.startT.copy(fromT);
    this.startFov = fromFov;

    this.baseP.copy(target.position);
    this.baseT.copy(target.target);
    this.targetFov = target.fov;
    this.portalName = target.name;

    this.onEnterStart?.();
  }

  public exit(
    destP: THREE.Vector3,
    destT: THREE.Vector3,
    destFov: number,
    currentPortalP?: THREE.Vector3,
    currentPortalT?: THREE.Vector3,
    currentPortalFov?: number
  ): void {
    if (!this.active || this.direction === -1) return;

    this.direction = -1;
    this.time = this.duration * (this.progress || 1);

    // Destination coordinates on main scroll path
    this.startP.copy(destP);
    this.startT.copy(destT);
    this.startFov = destFov;

    // Departure coordinates from current orbital camera position
    if (currentPortalP) this.baseP.copy(currentPortalP);
    if (currentPortalT) this.baseT.copy(currentPortalT);
    if (currentPortalFov !== undefined) this.targetFov = currentPortalFov;

    this.onExitStart?.();
  }

  public update(dt: number): void {
    if (this.direction === 1) {
      this.time += dt;
      this.progress = Math.min(Math.max(this.time / this.duration, 0), 1);
      if (this.progress >= 1) {
        this.direction = 0;
        this.progress = 1;
        this.onEnterComplete?.();
      }
    } else if (this.direction === -1) {
      this.time -= dt;
      this.progress = Math.min(Math.max(this.time / this.duration, 0), 1);
      if (this.progress <= 0) {
        this.direction = 0;
        this.progress = 0;
        this.active = false;
        this.onExitComplete?.();
      }
    }

    if (this.progress > 0.0001) {
      const ease = TransitionManager.easeFlight(this.progress);

      // Interpolate position with aerial arc
      this.currentP.lerpVectors(this.startP, this.baseP, ease);
      const arcLift = Math.sin(ease * Math.PI) * this.arcHeight;
      this.currentP.y += arcLift;

      // Interpolate lookAt target
      this.currentT.lerpVectors(this.startT, this.baseT, ease);

      // Interpolate FOV
      this.currentFov = THREE.MathUtils.lerp(this.startFov, this.targetFov, ease);
    }
  }
}
