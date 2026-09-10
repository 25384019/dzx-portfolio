export class ScrollController {
  public anchors: number[] = [];
  public maxScroll: number = 1;
  public progress: number = 0;
  public smoothProgress: number = 0;
  public activeChapter: number = 0;
  public numChapters: number = 6;

  constructor(numChapters: number = 6) {
    this.numChapters = numChapters;
  }

  public measure(sectionElements: HTMLElement[], viewportHeight: number, totalScrollHeight: number): void {
    this.maxScroll = Math.max(1, totalScrollHeight - viewportHeight);
    if (!sectionElements.length) {
      this.anchors = Array.from({ length: this.numChapters }, (_, i) => (i / (this.numChapters - 1)) * this.maxScroll);
      return;
    }

    this.anchors = sectionElements.map((el, i) => {
      if (i === 0) return 0;
      if (i === sectionElements.length - 1) return this.maxScroll;
      const top = el.offsetTop;
      const h = el.offsetHeight;
      const target = top + h * 0.5 - viewportHeight * 0.5;
      return Math.min(Math.max(target, 0), this.maxScroll);
    });

    for (let i = 1; i < this.anchors.length; i++) {
      this.anchors[i] = Math.max(this.anchors[i], this.anchors[i - 1] + 1);
    }
  }

  public progressFor(scrollY: number): number {
    if (!this.anchors.length || scrollY <= this.anchors[0]) return 0;
    const N = this.anchors.length - 1;
    for (let i = 0; i < N; i++) {
      if (scrollY <= this.anchors[i + 1]) {
        const seg = this.anchors[i + 1] - this.anchors[i];
        return i + (seg > 0 ? (scrollY - this.anchors[i]) / seg : 0);
      }
    }
    return N;
  }

  public update(scrollY: number, dt: number): void {
    this.progress = this.progressFor(scrollY);
    const dampSpeed = 5.2;
    const factor = dt > 0 ? 1 - Math.exp(-dampSpeed * dt) : 1;
    this.smoothProgress += (this.progress - this.smoothProgress) * factor;
    this.activeChapter = Math.min(
      Math.max(Math.round(this.smoothProgress), 0),
      this.numChapters - 1
    );
  }

  public getAnchor(index: number): number {
    if (index >= 0 && index < this.anchors.length) {
      return this.anchors[index];
    }
    return 0;
  }
}
