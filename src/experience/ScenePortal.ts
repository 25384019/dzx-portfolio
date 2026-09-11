import * as THREE from 'three';
import { XiaoZhaiOSWorld, MemoryNode } from '../scenes/XiaoZhaiOSWorld';

export interface PresenceNodeInfo {
  id: string;
  label: string;
  sublabel: string;
  screenX: number;
  screenY: number;
  color: number;
  isSelected: boolean;
  isHovered: boolean;
}

export interface PresenceState {
  isFocused: boolean;
  isCoreHit: boolean;
  hoveredNode: PresenceNodeInfo | null;
  selectedNode: PresenceNodeInfo | null;
  dwellProgress: number;
}

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

  // Camera Target Shift (Subtle focus toward selected node)
  public currentTargetOffset: THREE.Vector3 = new THREE.Vector3();
  public desiredTargetOffset: THREE.Vector3 = new THREE.Vector3();

  // Internal pointer tracking
  public isPointerDown: boolean = false;
  private lastPointerX: number = 0;
  private lastPointerY: number = 0;
  private downX: number = 0;
  private downY: number = 0;
  private downTime: number = 0;
  private totalDragDist: number = 0;

  // Normalized pointer coordinates (-1 to 1) for raycasting
  private pointerNDC: THREE.Vector2 = new THREE.Vector2(-999, -999);
  private pointerClient: THREE.Vector2 = new THREE.Vector2(-999, -999);

  // Raycasting (Zero hot-loop allocations)
  private raycaster: THREE.Raycaster = new THREE.Raycaster();
  private tempProjVec: THREE.Vector3 = new THREE.Vector3();
  private allIntersections: THREE.Intersection[] = [];
  private readonly portalCenter: THREE.Vector3 = new THREE.Vector3(0.5, 2.2, -14.0);

  // DOM Descriptor Element direct imperative ref
  public descriptorElement: HTMLElement | null = null;

  // Cached discrete state to eliminate 60fps React render bridge
  private lastReportedState = {
    isFocused: false,
    isCoreHit: false,
    hoveredNodeId: null as string | null,
    selectedNodeId: null as string | null,
  };

  // Interaction State
  public hoveredNodeId: string | null = null;
  public selectedNodeId: string | null = null;
  private isCoreHovered: boolean = false;
  private dwellTimer: number = 0;
  private readonly dwellThreshold: number = 1.1; // 1.1s dwell

  // World & Camera references
  public xiaoZhaiOSWorld: XiaoZhaiOSWorld | null = null;
  public camera: THREE.Camera | null = null;

  // Callbacks
  public onBackgroundClick?: () => void;
  public onPresenceChange?: (state: PresenceState) => void;

  constructor() {}

  public enter(portalId: string): void {
    this.isInPortal = true;
    this.activePortalId = portalId;
    this.resetControls();
    if (this.xiaoZhaiOSWorld) {
      this.xiaoZhaiOSWorld.triggerPresenceScan();
    }
  }

  public exit(): void {
    this.isInPortal = false;
    this.activePortalId = '';
    this.resetControls();
    if (this.descriptorElement) {
      this.descriptorElement.style.opacity = '0';
    }
    if (this.xiaoZhaiOSWorld) {
      this.xiaoZhaiOSWorld.hoveredNodeId = null;
      this.xiaoZhaiOSWorld.selectedNodeId = null;
      this.xiaoZhaiOSWorld.setCoreHit(null);
      this.xiaoZhaiOSWorld.setDwellConnection(null, 0);
    }
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
    this.hoveredNodeId = null;
    this.selectedNodeId = null;
    this.isCoreHovered = false;
    this.dwellTimer = 0;
    this.currentTargetOffset.set(0, 0, 0);
    this.desiredTargetOffset.set(0, 0, 0);
    this.lastReportedState = {
      isFocused: false,
      isCoreHit: false,
      hoveredNodeId: null,
      selectedNodeId: null,
    };
  }

  public handlePointerDown(e: MouseEvent | TouchEvent | PointerEvent): void {
    if (!this.isInPortal) return;
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
    if (!this.isInPortal) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    this.pointerClient.set(clientX, clientY);
    this.pointerNDC.x = (clientX / width) * 2 - 1;
    this.pointerNDC.y = -(clientY / height) * 2 + 1;

    if (this.isPointerDown) {
      const dx = clientX - this.lastPointerX;
      const dy = clientY - this.lastPointerY;
      this.lastPointerX = clientX;
      this.lastPointerY = clientY;
      this.totalDragDist += Math.hypot(dx, dy);

      const sensX = (Math.PI * 2.2) / Math.max(1, width);
      const sensY = (Math.PI * 1.5) / Math.max(1, height);

      this.targetYaw -= dx * sensX;
      this.targetPitch = THREE.MathUtils.clamp(this.targetPitch + dy * sensY, -0.75, 0.75);
    }
  }

  public handlePointerUp(e: MouseEvent | TouchEvent | PointerEvent): void {
    if (!this.isPointerDown) return;
    this.isPointerDown = false;

    const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : e.clientX;
    const clientY = 'changedTouches' in e ? e.changedTouches[0].clientY : e.clientY;

    const dist = Math.hypot(clientX - this.downX, clientY - this.downY);
    const elapsed = performance.now() - this.downTime;

    // Clean click detection (< 12px drag, < 350ms duration)
    if (dist < 12 && this.totalDragDist < 12 && elapsed < 350 && this.isInPortal) {
      const target = e.target as HTMLElement | null;
      if (target && target.closest('button, a')) return;

      if (this.hoveredNodeId) {
        // Clicked on one of the 4 Satellite Memory Nodes: toggle spatial selection
        if (this.selectedNodeId === this.hoveredNodeId) {
          this.selectedNodeId = null;
          this.desiredTargetOffset.set(0, 0, 0);
        } else {
          this.selectedNodeId = this.hoveredNodeId;
          const node = this.xiaoZhaiOSWorld?.getMemoryNodes().find(n => n.id === this.selectedNodeId);
          if (node) {
            // Subtle shift of camera target toward node (max 0.35 unit shift)
            this.desiredTargetOffset.copy(node.position).multiplyScalar(0.22);
          }
        }
        if (this.xiaoZhaiOSWorld) {
          this.xiaoZhaiOSWorld.selectedNodeId = this.selectedNodeId;
        }
      } else if (this.isCoreHovered) {
        // Clicked on Central Core: safe area
        if (this.selectedNodeId) {
          // If a node was selected, safely deselect it
          this.selectedNodeId = null;
          this.desiredTargetOffset.set(0, 0, 0);
          if (this.xiaoZhaiOSWorld) {
            this.xiaoZhaiOSWorld.selectedNodeId = null;
          }
        }
        // If no node was selected, clicking Core does nothing (does NOT exit portal)
      } else {
        // Clicked on true empty background: if node is selected, unselect it; otherwise exit portal
        if (this.selectedNodeId) {
          this.selectedNodeId = null;
          this.desiredTargetOffset.set(0, 0, 0);
          if (this.xiaoZhaiOSWorld) {
            this.xiaoZhaiOSWorld.selectedNodeId = null;
          }
        } else {
          this.onBackgroundClick?.();
        }
      }
    }
  }

  public handleWheel(deltaY: number): void {
    if (!this.isInPortal) return;
    const step = deltaY > 0 ? 0.75 : -0.75;
    this.targetZoom = THREE.MathUtils.clamp(this.targetZoom + step, -3.8, 5.0);
  }

  public update(dt: number): void {
    if (!this.isInPortal) return;

    // 1. Orbit & Zoom damping
    const rotSpeed = 7.5;
    const rotFactor = dt > 0 ? 1 - Math.exp(-rotSpeed * dt) : 1;
    this.yaw += (this.targetYaw - this.yaw) * rotFactor;
    this.pitch += (this.targetPitch - this.pitch) * rotFactor;

    const zoomSpeed = 6.0;
    const zoomFactor = dt > 0 ? 1 - Math.exp(-zoomSpeed * dt) : 1;
    this.zoom += (this.targetZoom - this.zoom) * zoomFactor;

    // 2. Camera target shift damping toward selected node
    this.currentTargetOffset.lerp(this.desiredTargetOffset, 0.08);

    // 3. Continuous Raycasting & Presence Recognition
    this.updatePresenceRaycasting(dt);
  }

  private updatePresenceRaycasting(dt: number): void {
    if (!this.camera || !this.xiaoZhaiOSWorld) return;

    this.raycaster.setFromCamera(this.pointerNDC, this.camera);
    this.allIntersections.length = 0;

    // Single-pass test across Core and Hit Proxies
    const targets = this.xiaoZhaiOSWorld.getInteractionTargets();
    this.raycaster.intersectObjects(targets, false, this.allIntersections);

    const nodes = this.xiaoZhaiOSWorld.getMemoryNodes();
    let hitNode: MemoryNode | null = null;
    let coreHit = false;
    let coreHitPoint: THREE.Vector3 | null = null;

    if (this.allIntersections.length > 0) {
      const closest = this.allIntersections[0];
      if (closest.object.userData.type === 'core') {
        coreHit = true;
        coreHitPoint = closest.point;
        // Core is in front: any node behind Core is physically occluded
        hitNode = null;
      } else if (closest.object.userData.type === 'node') {
        const nodeId = closest.object.userData.nodeId;
        hitNode = nodes.find(n => n.id === nodeId) || null;
        coreHit = false;
        coreHitPoint = null;
      }
    }

    // Core sensing (Very faint ambient surface response only - never triggers focus, descriptor, or selection)
    this.isCoreHovered = coreHit;
    this.xiaoZhaiOSWorld.setCoreHit(coreHitPoint);

    // Node focus (ONLY the 4 satellite memory nodes)
    this.hoveredNodeId = hitNode ? hitNode.id : null;
    this.xiaoZhaiOSWorld.hoveredNodeId = this.hoveredNodeId;

    // Dwell conduction (Only when hovering an outer memory node)
    if (this.hoveredNodeId) {
      this.dwellTimer += dt;
      const dwellProg = THREE.MathUtils.clamp((this.dwellTimer - 0.4) / (this.dwellThreshold - 0.4), 0, 1);
      this.xiaoZhaiOSWorld.setDwellConnection(this.hoveredNodeId, dwellProg);
    } else {
      this.dwellTimer = 0;
      this.xiaoZhaiOSWorld.setDwellConnection(null, 0);
    }

    // Update NodeDescriptor imperative screen position and edge placement
    const activeTargetId = this.selectedNodeId || this.hoveredNodeId;
    if (this.descriptorElement) {
      if (activeTargetId && this.camera && this.xiaoZhaiOSWorld) {
        const activeNode = nodes.find(n => n.id === activeTargetId);
        if (activeNode) {
          activeNode.mesh.getWorldPosition(this.tempProjVec);
          this.tempProjVec.project(this.camera);
          const W = window.innerWidth;
          const H = window.innerHeight;
          const sx = (this.tempProjVec.x * 0.5 + 0.5) * W;
          const sy = (-this.tempProjVec.y * 0.5 + 0.5) * H;

          const isRightHalf = sx > W * 0.5;
          const isNearTop = sy < 115;
          const isNearBottom = sy > H - 120;

          const offsetX = isRightHalf ? -240 : 20;
          const offsetY = isNearTop ? 20 : isNearBottom ? -55 : -36;

          const finalX = THREE.MathUtils.clamp(sx + offsetX, 20, W - 250);
          const finalY = THREE.MathUtils.clamp(sy + offsetY, 80, H - 110);

          this.descriptorElement.style.transform = `translate3d(${Math.round(finalX)}px, ${Math.round(finalY)}px, 0)`;
          this.descriptorElement.style.opacity = '1';
          this.descriptorElement.setAttribute('data-placement-x', isRightHalf ? 'left' : 'right');
          this.descriptorElement.setAttribute('data-placement-y', isNearTop ? 'bottom' : isNearBottom ? 'top' : 'default');
        } else {
          this.descriptorElement.style.opacity = '0';
        }
      } else {
        this.descriptorElement.style.opacity = '0';
      }
    }

    // Discrete React State Broadcast (Zero 60fps bridge)
    // Note: Core hover does NOT trigger cursor tightening or descriptor; only satellite node hover does.
    const isFocused = this.hoveredNodeId !== null || this.selectedNodeId !== null;
    const isCoreHit = this.isCoreHovered;
    const stateChanged =
      isFocused !== this.lastReportedState.isFocused ||
      isCoreHit !== this.lastReportedState.isCoreHit ||
      this.hoveredNodeId !== this.lastReportedState.hoveredNodeId ||
      this.selectedNodeId !== this.lastReportedState.selectedNodeId;

    if (stateChanged) {
      this.lastReportedState = {
        isFocused,
        isCoreHit,
        hoveredNodeId: this.hoveredNodeId,
        selectedNodeId: this.selectedNodeId,
      };

      if (this.onPresenceChange) {
        const getScreenInfo = (targetId: string | null): PresenceNodeInfo | null => {
          if (!targetId) return null;
          const n = nodes.find(item => item.id === targetId);
          if (!n || !this.camera) return null;

          n.mesh.getWorldPosition(this.tempProjVec);
          this.tempProjVec.project(this.camera);
          const sx = (this.tempProjVec.x * 0.5 + 0.5) * window.innerWidth;
          const sy = (-this.tempProjVec.y * 0.5 + 0.5) * window.innerHeight;

          return {
            id: n.id,
            label: n.label,
            sublabel: n.sublabel,
            screenX: sx,
            screenY: sy,
            color: n.color,
            isSelected: this.selectedNodeId === n.id,
            isHovered: this.hoveredNodeId === n.id,
          };
        };

        const dwellProgress = THREE.MathUtils.clamp(this.dwellTimer / this.dwellThreshold, 0, 1);
        this.onPresenceChange({
          isFocused,
          isCoreHit,
          hoveredNode: getScreenInfo(this.hoveredNodeId),
          selectedNode: getScreenInfo(this.selectedNodeId),
          dwellProgress,
        });
      }
    }
  }

  /**
   * Applies 360-degree spherical orbit, subtle node-shift focus, and zoom to camera.
   * Returns scalar fov directly to eliminate per-frame object allocation (Zero GC).
   */
  public applyToCamera(
    outP: THREE.Vector3,
    outT: THREE.Vector3,
    outFov: number,
    mx: number,
    my: number,
    time: number,
    blendFactor: number = 1
  ): number {
    const k = blendFactor;
    const center = this.portalCenter;
    const baseDist = 7.0;
    const currentDist = THREE.MathUtils.clamp(baseDist + this.zoom, 3.2, 12.5);

    const breatheX = Math.sin(time * 0.7) * 0.08 * k;
    const breatheY = Math.cos(time * 0.5) * 0.05 * k;

    const cosPitch = Math.cos(this.pitch);
    const orbX = center.x + Math.sin(this.yaw) * cosPitch * currentDist;
    const orbY = center.y + Math.sin(this.pitch) * currentDist;
    const orbZ = center.z + Math.cos(this.yaw) * cosPitch * currentDist;

    outP.x = THREE.MathUtils.lerp(outP.x, orbX + mx * 0.35 + breatheX + this.currentTargetOffset.x, k);
    outP.y = THREE.MathUtils.lerp(outP.y, orbY + my * 0.22 + breatheY + this.currentTargetOffset.y, k);
    outP.z = THREE.MathUtils.lerp(outP.z, orbZ + this.currentTargetOffset.z, k);

    outT.x = THREE.MathUtils.lerp(outT.x, center.x + mx * 0.25 + breatheX * 0.5 + this.currentTargetOffset.x, k);
    outT.y = THREE.MathUtils.lerp(outT.y, center.y + my * 0.16 + breatheY * 0.5 + this.currentTargetOffset.y, k);
    outT.z = THREE.MathUtils.lerp(outT.z, center.z + this.currentTargetOffset.z, k);

    return outFov + this.zoom * 1.5 * k;
  }
}
