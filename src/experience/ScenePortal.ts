import * as THREE from 'three';

export class ScenePortal {
  public isInPortal: boolean = false;
  public activePortalId: string = '';

  // Spherical Orbit Angles & Zoom
  public yaw: number = 0;
  public pitch: number = 0;
  public targetYaw: number = 0;
  public targetPitch: number = 0;
  public zoom: number = 0;
  public targetZoom: number = 0;

  // Internal pointer tracking
  public isPointerDown: boolean = false;
  private lastPointerX: number = 0;
  private lastPointerY: number = 0;
  private downX: number = 0;
  private downY: number = 0;
  private downTime: number = 0;
  private totalDragDist: number = 0;

  public onBackgroundClick?: () => void;

  constructor() {}

  public enter(portalId: string): void {
    this.isInPortal = true;
    this.activePortalId = portalId;
    this.resetControls();
  }

  public exit(): void {
    this.isInPortal = false;
    this.activePortalId = '';
    this.resetControls();
  }

  public resetControls(): void {
    this.yaw = 0;
    this.pitch = 0;
    this.targetYaw = 0;
    this.targetPitch = 0;
    this.zoom = 0;
    this.targetZoom = 0;
    this.isPointerDown = false;
    this.totalDragDist = 0;
  }

  public handlePointerDown(e: MouseEvent | TouchEvent | PointerEvent): void {
    if (!this.isInPortal) return;
    // If clicked on an interactive button or control, ignore drag
    const target = e.target as HTMLElement | null;
    if (target && target.closest('button, a, input, select, textarea')) {
      return;
    }

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    this.isPointerDown = true;
    this.downX = clientX;
    this.downY = clientY;
    this.lastPointerX = clientX;
    this.lastPointerY = clientY;
    this.downTime = performance.now();
    this.totalDragDist = 0;
  }

  public handlePointerMove(e: MouseEvent | TouchEvent | PointerEvent, width: number, height: number): void {
    if (!this.isPointerDown || !this.isInPortal) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const dx = clientX - this.lastPointerX;
    const dy = clientY - this.lastPointerY;

    this.lastPointerX = clientX;
    this.lastPointerY = clientY;
    this.totalDragDist += Math.hypot(dx, dy);

    // Dynamic rotation sensitivity (full screen width ≈ 360 degree orbit)
    const sensX = (Math.PI * 2.2) / Math.max(1, width);
    const sensY = (Math.PI * 1.5) / Math.max(1, height);

    this.targetYaw -= dx * sensX;
    // Pitch clamped between -0.75 and 0.75 radians (~±43 deg) to prevent flipping
    this.targetPitch = THREE.MathUtils.clamp(this.targetPitch + dy * sensY, -0.75, 0.75);
  }

  public handlePointerUp(e: MouseEvent | TouchEvent | PointerEvent): void {
    if (!this.isPointerDown) return;
    this.isPointerDown = false;

    const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : e.clientX;
    const clientY = 'changedTouches' in e ? e.changedTouches[0].clientY : e.clientY;

    const dist = Math.hypot(clientX - this.downX, clientY - this.downY);
    const elapsed = performance.now() - this.downTime;

    // Clean background click to smoothly exit (short click under 350ms, moved < 10px)
    if (dist < 10 && this.totalDragDist < 10 && elapsed < 350 && this.isInPortal) {
      const target = e.target as HTMLElement | null;
      if (!target || !target.closest('button, a')) {
        this.onBackgroundClick?.();
      }
    }
  }

  public handleWheel(deltaY: number): void {
    if (!this.isInPortal) return;
    const step = deltaY > 0 ? 0.75 : -0.75;
    this.targetZoom = THREE.MathUtils.clamp(this.targetZoom + step, -3.8, 5.0);
  }

  public update(dt: number): void {
    const rotSpeed = 7.5;
    const rotFactor = dt > 0 ? 1 - Math.exp(-rotSpeed * dt) : 1;
    this.yaw += (this.targetYaw - this.yaw) * rotFactor;
    this.pitch += (this.targetPitch - this.pitch) * rotFactor;

    const zoomSpeed = 6.0;
    const zoomFactor = dt > 0 ? 1 - Math.exp(-zoomSpeed * dt) : 1;
    this.zoom += (this.targetZoom - this.zoom) * zoomFactor;
  }

  /**
   * Applies 360-degree spherical orbit, parallax, and zoom to camera in XiaoZhaiOS space.
   */
  public applyToCamera(
    outP: THREE.Vector3,
    outT: THREE.Vector3,
    outFov: number,
    mx: number,
    my: number,
    time: number,
    blendFactor: number = 1
  ): { fov: number } {
    const k = blendFactor;
    // XiaoZhaiOS Memory Core center
    const center = new THREE.Vector3(0.5, 2.2, -14.0);
    const baseDist = 7.0;
    const currentDist = THREE.MathUtils.clamp(baseDist + this.zoom, 3.2, 12.5);

    // Organic ambient breathing motion
    const breatheX = Math.sin(time * 0.7) * 0.08 * k;
    const breatheY = Math.cos(time * 0.5) * 0.05 * k;

    // Spherical position calculated from yaw and pitch
    const cosPitch = Math.cos(this.pitch);
    const orbX = center.x + Math.sin(this.yaw) * cosPitch * currentDist;
    const orbY = center.y + Math.sin(this.pitch) * currentDist;
    const orbZ = center.z + Math.cos(this.yaw) * cosPitch * currentDist;

    // Blend from flight path into orbital position
    outP.x = THREE.MathUtils.lerp(outP.x, orbX + mx * 0.35 + breatheX, k);
    outP.y = THREE.MathUtils.lerp(outP.y, orbY + my * 0.22 + breatheY, k);
    outP.z = THREE.MathUtils.lerp(outP.z, orbZ, k);

    // Look target locks onto the neural crystal center with subtle parallax
    outT.x = THREE.MathUtils.lerp(outT.x, center.x + mx * 0.25 + breatheX * 0.5, k);
    outT.y = THREE.MathUtils.lerp(outT.y, center.y + my * 0.16 + breatheY * 0.5, k);
    outT.z = THREE.MathUtils.lerp(outT.z, center.z, k);

    return {
      fov: outFov + this.zoom * 1.5 * k,
    };
  }
}

