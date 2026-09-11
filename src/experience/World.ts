import * as THREE from 'three';
import { CameraRig } from './CameraRig';
import { ScrollController } from './ScrollController';
import { TransitionManager } from './TransitionManager';
import { ScenePortal } from './ScenePortal';
import { HomeScene } from '../scenes/HomeScene';
import { AboutScene } from '../scenes/AboutScene';
import { ProjectsScene } from '../scenes/ProjectsScene';
import { InterestsScene } from '../scenes/InterestsScene';
import { PhilosophyScene } from '../scenes/PhilosophyScene';
import { ContactScene } from '../scenes/ContactScene';
import { XiaoZhaiOSWorld } from '../scenes/XiaoZhaiOSWorld';

export class World {
  public container: HTMLElement;
  public canvas: HTMLCanvasElement;
  public renderer: THREE.WebGLRenderer;
  public scene: THREE.Scene;

  // Subsystems
  public cameraRig: CameraRig;
  public scrollController: ScrollController;
  public transitionManager: TransitionManager;
  public scenePortal: ScenePortal;

  // 3D Scene Layers
  public homeScene: HomeScene;
  public aboutScene: AboutScene;
  public projectsScene: ProjectsScene;
  public interestsScene: InterestsScene;
  public philosophyScene: PhilosophyScene;
  public contactScene: ContactScene;
  public xiaoZhaiOSWorld: XiaoZhaiOSWorld;

  // Global ambient particle field with decrescendo into CONTACT
  private globalParticles!: THREE.Points;

  // Lighting
  private ambientLight!: THREE.AmbientLight;
  private keyLight!: THREE.DirectionalLight;
  private rimLight!: THREE.DirectionalLight;

  // Lifecycle
  public onPortalLanded?: () => void;
  private tempFlightP: THREE.Vector3 = new THREE.Vector3();
  private tempFlightT: THREE.Vector3 = new THREE.Vector3();
  private _gateWorldPos: THREE.Vector3 = new THREE.Vector3(2.50, 2.40, -31.5);
  private _gateNdcPos: THREE.Vector3 = new THREE.Vector3();
  private isRunning: boolean = false;
  private clock: number = 0;
  private prevTime: number = performance.now();
  private rafId: number = 0;

  // Event handlers
  private boundResize: () => void;
  private boundPointerMove: (e: PointerEvent) => void;
  private boundPointerDown: (e: PointerEvent) => void;
  private boundPointerUp: (e: PointerEvent) => void;
  private boundWheel: (e: WheelEvent) => void;
  private boundReducedMotionChange?: (e: MediaQueryListEvent) => void;
  private boundVisibilityChange?: () => void;

  constructor(container: HTMLElement) {
    this.container = container;
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'dzx-webgl-canvas';
    this.canvas.style.position = 'fixed';
    this.canvas.style.inset = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.display = 'block';
    this.canvas.style.zIndex = '0';
    this.canvas.style.background = '#05070a';
    this.container.appendChild(this.canvas);

    // 1. Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance',
      stencil: false,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.sortObjects = true;

    // 2. Scene & Fog
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x05070a);
    this.scene.fog = new THREE.FogExp2(0x05070a, 0.024);

    // 3. Subsystems
    this.cameraRig = new CameraRig();
    this.scrollController = new ScrollController(6);
    this.transitionManager = new TransitionManager();
    this.scenePortal = new ScenePortal();

    // Wire ScenePortal background click to exit
    this.scenePortal.onBackgroundClick = () => {
      this.exitXiaoZhaiOS();
    };

    // Wire transition landing signal
    this.transitionManager.onEnterComplete = () => {
      this.onPortalLanded?.();
    };

    // 4. Lights
    this.setupLights();

    // 5. Build 3D Scenes
    this.homeScene = new HomeScene();
    this.aboutScene = new AboutScene();
    this.projectsScene = new ProjectsScene();
    this.interestsScene = new InterestsScene();
    this.philosophyScene = new PhilosophyScene();
    this.contactScene = new ContactScene();
    this.xiaoZhaiOSWorld = new XiaoZhaiOSWorld();
    this.scenePortal.xiaoZhaiOSWorld = this.xiaoZhaiOSWorld;
    this.scenePortal.camera = this.cameraRig.camera;

    this.scene.add(this.homeScene.group);
    this.scene.add(this.aboutScene.group);
    this.scene.add(this.projectsScene.group);
    this.scene.add(this.interestsScene.group);
    this.scene.add(this.philosophyScene.group);
    this.scene.add(this.contactScene.group);
    this.scene.add(this.xiaoZhaiOSWorld.group);

    // 6. Global Ambient Particle Corridor with Decrescendo
    this.buildGlobalParticleField();

    // 7. Bind Events (Pointer, Drag, Wheel, Resize)
    this.boundResize = () => this.resize();
    this.boundPointerMove = (e: PointerEvent) => {
      this.cameraRig.updatePointer(e.clientX, e.clientY, window.innerWidth, window.innerHeight);
      if (this.scenePortal.isInPortal) {
        this.scenePortal.handlePointerMove(e, window.innerWidth, window.innerHeight);
      }
    };
    this.boundPointerDown = (e: PointerEvent) => {
      if (this.scenePortal.isInPortal) {
        if (e.button !== undefined && e.button !== 0) return;
        this.scenePortal.handlePointerDown(e);
        document.body.classList.add('is-dragging');
      }
    };
    this.boundPointerUp = (e: PointerEvent) => {
      if (this.scenePortal.isInPortal) {
        this.scenePortal.handlePointerUp(e);
        document.body.classList.remove('is-dragging');
      }
    };
    this.boundWheel = (e: WheelEvent) => {
      if (this.scenePortal.isInPortal) {
        e.preventDefault();
        e.stopPropagation();
        this.scenePortal.handleWheel(e.deltaY);
      }
    };

    window.addEventListener('resize', this.boundResize, { passive: true });
    window.addEventListener('pointermove', this.boundPointerMove, { passive: true });
    window.addEventListener('pointerdown', this.boundPointerDown, { passive: true });
    window.addEventListener('pointerup', this.boundPointerUp, { passive: true });
    window.addEventListener('wheel', this.boundWheel, { passive: false });

    // 8. Reduced Motion & Visibility Listeners for Terminal Gate
    if (typeof window !== 'undefined' && window.matchMedia) {
      const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.contactScene.setReducedMotion(reducedMotionQuery.matches);
      this.boundReducedMotionChange = (e: MediaQueryListEvent) => {
        this.contactScene.setReducedMotion(e.matches);
      };
      reducedMotionQuery.addEventListener('change', this.boundReducedMotionChange);
    }

    this.boundVisibilityChange = () => {
      this.contactScene.setSuspended(document.visibilityState === 'hidden');
    };
    document.addEventListener('visibilitychange', this.boundVisibilityChange);

    // Expose dev/test render metrics hook
    if ((import.meta as any).env?.DEV) {
      (window as any).__DZX_RENDER_INFO__ = {
        get calls() { return this.renderer.info.render.calls; },
        get triangles() { return this.renderer.info.render.triangles; },
        get lines() { return this.renderer.info.render.lines; },
        get points() { return this.renderer.info.render.points; },
      };
    }

    // Start intro entrance dolly animation
    this.cameraRig.intro = 0;
    this.start();
  }

  private setupLights(): void {
    // Cold ambient fill
    this.ambientLight = new THREE.AmbientLight(0x182432, 1.4);
    this.scene.add(this.ambientLight);

    // Key light in mist blue
    this.keyLight = new THREE.DirectionalLight(0xb4c8d8, 2.2);
    this.keyLight.position.set(6.0, 10.0, 8.0);
    this.scene.add(this.keyLight);

    // Rim light in delicate sakura pink / sleet
    this.rimLight = new THREE.DirectionalLight(0xf2c8d0, 1.6);
    this.rimLight.position.set(-8.0, 6.0, -10.0);
    this.scene.add(this.rimLight);
  }

  public enterXiaoZhaiOS(): void {
    const target = {
      position: this.xiaoZhaiOSWorld.portalCameraTarget.position,
      target: this.xiaoZhaiOSWorld.portalCameraTarget.target,
      fov: this.xiaoZhaiOSWorld.portalCameraTarget.fov,
      name: this.xiaoZhaiOSWorld.portalCameraTarget.name,
    };

    this.transitionManager.enter(
      this.cameraRig.camera.position,
      this.cameraRig.target,
      this.cameraRig.camera.fov,
      target
    );

    this.scenePortal.enter('xiaozhai-os');
    document.body.classList.add('in-portal-mode');
  }

  public exitXiaoZhaiOS(): void {
    if (!this.transitionManager.active && !this.scenePortal.isInPortal) return;

    // Destination on current main scroll curve
    const destP = new THREE.Vector3().copy(this.cameraRig.position);
    const destT = new THREE.Vector3().copy(this.cameraRig.target);
    const destFov = this.cameraRig.fov;

    // Current camera position in portal (where user orbited)
    const currentCameraP = new THREE.Vector3().copy(this.cameraRig.camera.position);
    const currentCameraT = new THREE.Vector3().copy(this.xiaoZhaiOSWorld.group.position);
    const currentCameraFov = this.cameraRig.camera.fov;

    this.transitionManager.exit(destP, destT, destFov, currentCameraP, currentCameraT, currentCameraFov);
    this.scenePortal.exit();
    document.body.classList.remove('in-portal-mode');
    document.body.classList.remove('is-dragging');
  }

  // Scroll element hook
  public scrollElement: HTMLElement | null = null;
  public getScrollY: () => number = () => {
    if (this.scrollElement) {
      return this.scrollElement.scrollTop;
    }
    return window.scrollY || document.documentElement.scrollTop || 0;
  };

  public setScrollElement(el: HTMLElement | null): void {
    this.scrollElement = el;
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.prevTime = performance.now();
    this.loop();
  }

  public stop(): void {
    this.isRunning = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
  }

  private loop = (): void => {
    if (!this.isRunning) return;
    const now = performance.now();
    const rawDt = (now - this.prevTime) / 1000;
    const dt = Math.min(rawDt, 0.05); // Frame governor prevents animation jumps
    this.prevTime = now;
    this.clock += dt;

    // Update intro progress
    if (this.cameraRig.intro < 1) {
      this.cameraRig.intro = Math.min(this.cameraRig.intro + dt / 2.2, 1);
    }

    // 1. Update Scroll & Main Camera Trajectory
    const scrollY = this.getScrollY();
    this.scrollController.update(scrollY, dt);

    this.cameraRig.updateFromProgress(
      this.scrollController.smoothProgress,
      dt,
      this.clock
    );

    // 2. Update Transitions & Camera Placement
    this.transitionManager.update(dt);

    if (this.transitionManager.progress > 0.0001) {
      // Override camera with smooth curved flight (Zero-GC preallocated vectors)
      const flightP = this.tempFlightP.copy(this.transitionManager.currentP);
      const flightT = this.tempFlightT.copy(this.transitionManager.currentT);
      const flightFov = this.transitionManager.currentFov;

      // Apply free look, drag, and parallax when in portal
      const ease = TransitionManager.easeFlight(this.transitionManager.progress);
      const newFov = this.scenePortal.applyToCamera(
        flightP,
        flightT,
        flightFov,
        this.cameraRig.mx,
        this.cameraRig.my,
        this.clock,
        ease
      );

      this.cameraRig.camera.position.copy(flightP);
      this.cameraRig.camera.lookAt(flightT);
      if (Math.abs(this.cameraRig.camera.fov - newFov) > 1e-4) {
        this.cameraRig.camera.fov = newFov;
        this.cameraRig.camera.updateProjectionMatrix();
      }
    }

    // Ensure camera world matrix is completely up-to-date
    this.cameraRig.camera.updateMatrixWorld(true);

    // 3. Update Scene Animations with Continuous Spatial Progress
    const smoothP = this.scrollController.smoothProgress;
    this.homeScene.update(this.clock, dt, smoothP);
    this.aboutScene.update(this.clock, dt, smoothP);
    this.projectsScene.update(this.clock, dt, smoothP);
    this.interestsScene.update(this.clock, dt, smoothP, this.cameraRig.mx, this.cameraRig.my);
    this.philosophyScene.update(this.clock, dt, smoothP);

    // Calculate Gate projected screen position and pointer proximity distance in NDC
    this._gateNdcPos.copy(this._gateWorldPos).project(this.cameraRig.camera);
    const dx = this.cameraRig.tmx - this._gateNdcPos.x;
    const dy = this.cameraRig.tmy - this._gateNdcPos.y;
    const pointerDistance = Math.hypot(dx, dy);
    this.contactScene.update(this.clock, dt, smoothP, pointerDistance);

    this.xiaoZhaiOSWorld.update(this.clock, dt, this.scenePortal.isInPortal, this.transitionManager.progress);
    this.updateGlobalParticles(smoothP, this.clock);

    // Explicitly update XiaoZhaiOS world matrices so Raycaster tests against exact current-frame transforms
    if (this.scenePortal.isInPortal || this.transitionManager.progress > 0.0001) {
      this.xiaoZhaiOSWorld.group.updateMatrixWorld(true);
    }

    // 4. Update Sub-Scene Portal Raycasting & Presence Recognition (100% current-frame camera & node matrices)
    this.scenePortal.update(dt);

    // 5. Update Spatial Position-Driven DOM Reveal
    this.updateDOM(smoothP);

    // 6. Render
    this.renderer.render(this.scene, this.cameraRig.camera);

    this.rafId = requestAnimationFrame(this.loop);
  };

  private buildGlobalParticleField(): void {
    const count = 480;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const cCyan = new THREE.Color(0x6e9eae);
    const cBlue = new THREE.Color(0xb4c8d8);
    const cPink = new THREE.Color(0xf2c8d0);

    for (let i = 0; i < count; i++) {
      // Distributed smoothly along the full corridor Z: 6 to -32
      positions[i * 3] = (Math.random() - 0.5) * 14.0;
      positions[i * 3 + 1] = 0.2 + Math.random() * 5.0;
      positions[i * 3 + 2] = 6.0 - Math.random() * 38.0;

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
      size: 0.065,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });

    this.globalParticles = new THREE.Points(geo, mat);
    this.scene.add(this.globalParticles);
  }

  private updateGlobalParticles(progress: number, time: number): void {
    if (!this.globalParticles) return;

    // Decrescendo requested by user:
    // HOME -> PROJECTS -> INTERESTS (progress <= 3.2): 100% density/opacity
    // PHILOSOPHY (progress 3.2 -> 4.2): drops from 1.0 to 0.60
    // CONTACT entrance (progress 4.2 -> 4.7): drops from 0.60 to 0.25
    // CONTACT terminal horizon (progress 4.7 -> 5.0): drops from 0.25 to ~3.5%
    let particleFactor = 1.0;
    if (progress > 3.2 && progress <= 4.2) {
      particleFactor = THREE.MathUtils.lerp(1.0, 0.6, (progress - 3.2) / 1.0);
    } else if (progress > 4.2 && progress <= 4.7) {
      particleFactor = THREE.MathUtils.lerp(0.6, 0.25, (progress - 4.2) / 0.5);
    } else if (progress > 4.7) {
      particleFactor = THREE.MathUtils.lerp(0.25, 0.035, Math.min((progress - 4.7) / 0.3, 1.0));
    }

    (this.globalParticles.material as THREE.PointsMaterial).opacity = 0.75 * particleFactor;
    this.globalParticles.rotation.y = time * 0.015;
  }

  private domElements: HTMLElement[] = [];
  private domElementsMeasured: boolean = false;

  public updateDOM(progress: number): void {
    if (!this.domElementsMeasured || this.domElements.length === 0) {
      this.domElements = Array.from(this.container.querySelectorAll<HTMLElement>('.dzx-chapter-content'));
      if (this.domElements.length > 0) {
        this.domElementsMeasured = true;
      }
    }
    if (!this.domElements.length) return;

    this.domElements.forEach((el) => {
      const chIdx = parseInt(el.getAttribute('data-ch') || '0', 10);
      let alpha = 0;
      let translateY = 0;

      if (chIdx === 0) {
        // Chapter 0: full at 0, drifts up and fades out as camera maneuvers around Core
        alpha = 1.0 - THREE.MathUtils.smoothstep(progress, 0.18, 0.65);
        translateY = -40 * THREE.MathUtils.smoothstep(progress, 0.18, 0.65);
      } else if (chIdx === 1) {
        // Chapter 1: fades in 0.62 -> 0.98, holds, fades out 1.35 -> 1.75
        const a_in = THREE.MathUtils.smoothstep(progress, 0.62, 0.98);
        const a_out = 1.0 - THREE.MathUtils.smoothstep(progress, 1.35, 1.75);
        alpha = a_in * a_out;
        translateY = (1.0 - a_in) * 36 - THREE.MathUtils.smoothstep(progress, 1.35, 1.75) * 36;
      } else if (chIdx === 2) {
        // Chapter 2: fades in 1.6 -> 2.0 with XiaoZhaiOS pedestal, fades out 2.35 -> 2.75
        const a_in = THREE.MathUtils.smoothstep(progress, 1.6, 1.98);
        const a_out = 1.0 - THREE.MathUtils.smoothstep(progress, 2.35, 2.75);
        alpha = a_in * a_out;
        translateY = (1.0 - a_in) * 36 - THREE.MathUtils.smoothstep(progress, 2.35, 2.75) * 36;
      } else if (chIdx === 3) {
        // Chapter 3: fades in 2.6 -> 3.0, fades out 3.35 -> 3.75
        const a_in = THREE.MathUtils.smoothstep(progress, 2.6, 2.98);
        const a_out = 1.0 - THREE.MathUtils.smoothstep(progress, 3.35, 3.75);
        alpha = a_in * a_out;
        translateY = (1.0 - a_in) * 36 - THREE.MathUtils.smoothstep(progress, 3.35, 3.75) * 36;
      } else if (chIdx === 4) {
        // Chapter 4: fades in 3.6 -> 4.0, fades out 4.35 -> 4.75
        const a_in = THREE.MathUtils.smoothstep(progress, 3.6, 3.98);
        const a_out = 1.0 - THREE.MathUtils.smoothstep(progress, 4.35, 4.75);
        alpha = a_in * a_out;
        translateY = (1.0 - a_in) * 36 - THREE.MathUtils.smoothstep(progress, 4.35, 4.75) * 36;
      } else if (chIdx === 5) {
        // Chapter 5: terminal chapter
        alpha = THREE.MathUtils.smoothstep(progress, 4.6, 4.98);
        translateY = (1.0 - alpha) * 36;
      }

      el.style.opacity = alpha.toFixed(3);
      el.style.transform = `translate3d(0, ${translateY.toFixed(1)}px, 0)`;
      el.style.pointerEvents = alpha > 0.08 ? 'auto' : 'none';
    });
  }

  public resize(): void {
    this.domElementsMeasured = false;
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.renderer.setSize(width, height);
    this.cameraRig.resize(width, height);
    const isMobile = width < 768 || ('ontouchstart' in window);
    this.xiaoZhaiOSWorld.setMobileHitProxy(isMobile);
    this.contactScene.setResponsiveLayout(this.cameraRig.camera.aspect);
  }

  public dispose(): void {
    this.stop();
    window.removeEventListener('resize', this.boundResize);
    window.removeEventListener('pointermove', this.boundPointerMove);
    window.removeEventListener('pointerdown', this.boundPointerDown);
    window.removeEventListener('pointerup', this.boundPointerUp);
    window.removeEventListener('wheel', this.boundWheel);

    if (this.boundVisibilityChange) {
      document.removeEventListener('visibilitychange', this.boundVisibilityChange);
    }
    if (this.boundReducedMotionChange && typeof window !== 'undefined' && window.matchMedia) {
      const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      reducedMotionQuery.removeEventListener('change', this.boundReducedMotionChange);
    }

    this.homeScene.dispose();
    this.aboutScene.dispose();
    this.projectsScene.dispose();
    this.interestsScene.dispose();
    this.philosophyScene.dispose();
    this.contactScene.dispose();
    this.xiaoZhaiOSWorld.dispose();

    if (this.globalParticles) {
      this.globalParticles.geometry.dispose();
      (this.globalParticles.material as THREE.Material).dispose();
    }

    this.renderer.dispose();
    if (this.canvas.parentElement) {
      this.canvas.parentElement.removeChild(this.canvas);
    }
  }
}
