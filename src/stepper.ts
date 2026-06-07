import { Edge, Vec2 } from "./math";
import { Canvas } from "./canvas";
import { Interpolator } from "./interpolator";

export interface TriangleData {
  p1: { x: number; y: number; w: number };
  p2: { x: number; y: number; w: number };
  p3: { x: number; y: number; w: number };
  uv1: Vec2;
  uv2: Vec2;
  uv3: Vec2;
}

export interface PixelStep {
  x: number;
  y: number;
  u: number;
  v: number;
  dudx: number;
  dvdx: number;
  dudy: number;
  dvdy: number;
  lambda1: number;
  lambda2: number;
  lambda3: number;
}

export function ComputeLOD(
  step: PixelStep,
  texWidth: number,
  texHeight: number,
  mipCount: number,
): number {
  const lenX = Math.sqrt((step.dudx * texWidth) ** 2 + (step.dvdx * texHeight) ** 2);
  const lenY = Math.sqrt((step.dudy * texWidth) ** 2 + (step.dvdy * texHeight) ** 2);
  const lod = Math.log2(Math.max(Math.max(lenX, lenY), 1e-6));
  return Math.max(0, Math.min(Math.round(lod), mipCount - 1));
}

export function ComputeContinuousLOD(
  step: PixelStep,
  texWidth: number,
  texHeight: number,
): number {
  const lenX = Math.sqrt((step.dudx * texWidth) ** 2 + (step.dvdx * texHeight) ** 2);
  const lenY = Math.sqrt((step.dudy * texWidth) ** 2 + (step.dvdy * texHeight) ** 2);
  return Math.log2(Math.max(Math.max(lenX, lenY), 1e-6));
}

export function BuildSteps(
  triangle: TriangleData,
  interpolator: Interpolator,
  targetCanvas: Canvas,
): PixelStep[] {
  const steps: PixelStep[] = [];
  const { p1, p2, p3, uv1, uv2, uv3 } = triangle;
  const sx = targetCanvas.resolutionWidth / targetCanvas.displayWidth;
  const sy = targetCanvas.resolutionHeight / targetCanvas.displayHeight;
  const p1s = new Vec2(p1.x * sx, p1.y * sy);
  const p2s = new Vec2(p2.x * sx, p2.y * sy);
  const p3s = new Vec2(p3.x * sx, p3.y * sy);
  const minX = Math.max(0, Math.floor(Math.min(p1s.x, p2s.x, p3s.x)));
  const maxX = Math.min(
    targetCanvas.resolutionWidth - 1,
    Math.ceil(Math.max(p1s.x, p2s.x, p3s.x)),
  );
  const minY = Math.max(0, Math.floor(Math.min(p1s.y, p2s.y, p3s.y)));
  const maxY = Math.min(
    targetCanvas.resolutionHeight - 1,
    Math.ceil(Math.max(p1s.y, p2s.y, p3s.y)),
  );
  const area = Edge(p1s, p2s, p3s);
  if (Math.abs(area) < 0.00001) return steps;

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const p = new Vec2(x + 0.5, y + 0.5);
      const e0 = Edge(p1s, p2s, p);
      const e1 = Edge(p2s, p3s, p);
      const e2 = Edge(p3s, p1s, p);
      const insideCCW = e0 >= 0 && e1 >= 0 && e2 >= 0;
      const insideCW = e0 <= 0 && e1 <= 0 && e2 <= 0;
      if (!insideCCW && !insideCW) continue;

      const lambda1 = Edge(p2s, p3s, p) / area;
      const lambda2 = Edge(p3s, p1s, p) / area;
      const lambda3 = Edge(p1s, p2s, p) / area;

      const uv = interpolator.interpolate({
        l1: lambda1,
        l2: lambda2,
        l3: lambda3,
        w1: p1.w,
        w2: p2.w,
        w3: p3.w,
        uv1,
        uv2,
        uv3,
      });

      const uvR = interpolator.interpolate({
        l1: Edge(p2s, p3s, new Vec2(x + 1.5, y + 0.5)) / area,
        l2: Edge(p3s, p1s, new Vec2(x + 1.5, y + 0.5)) / area,
        l3: Edge(p1s, p2s, new Vec2(x + 1.5, y + 0.5)) / area,
        w1: p1.w,
        w2: p2.w,
        w3: p3.w,
        uv1,
        uv2,
        uv3,
      });
      const uvD = interpolator.interpolate({
        l1: Edge(p2s, p3s, new Vec2(x + 0.5, y + 1.5)) / area,
        l2: Edge(p3s, p1s, new Vec2(x + 0.5, y + 1.5)) / area,
        l3: Edge(p1s, p2s, new Vec2(x + 0.5, y + 1.5)) / area,
        w1: p1.w,
        w2: p2.w,
        w3: p3.w,
        uv1,
        uv2,
        uv3,
      });

      const dudx = uvR.x - uv.x;
      const dvdx = uvR.y - uv.y;
      const dudy = uvD.x - uv.x;
      const dvdy = uvD.y - uv.y;

      steps.push({
        x,
        y,
        u: uv.x,
        v: uv.y,
        dudx,
        dvdx,
        dudy,
        dvdy,
        lambda1,
        lambda2,
        lambda3,
      });
    }
  }
  return steps;
}

export class Stepper {
  steps: PixelStep[] = [];
  cursor = 0;
  playing = true;
  playIntervalMs = 5;
  lastTime = 0;
  stepMode: "pixel" | "row" = "pixel";

  rebuildSteps(
    triangle: TriangleData,
    interpolator: Interpolator,
    triangleCanvas: Canvas,
  ) {
    this.steps = BuildSteps(triangle, interpolator, triangleCanvas);
    this.cursor = 0;
    this.playing = true;
    this.lastTime = performance.now();
  }

  advanceBy(count: number) {
    this.cursor = Math.min(this.cursor + count, this.steps.length);
  }

  stepForwardPixel() {
    this.advanceBy(1);
  }

  stepForwardRow() {
    if (this.cursor >= this.steps.length) return;
    const curRow = this.steps[this.cursor].y;
    let n = 0;
    for (let i = this.cursor; i < this.steps.length; i++) {
      if (this.steps[i].y !== curRow) break;
      n++;
    }
    this.advanceBy(n);
  }

  stepBack() {
    this.cursor = Math.max(0, this.cursor - 1);
  }

  reset() {
    this.cursor = 0;
    this.playing = false;
  }

  finish() {
    this.cursor = this.steps.length;
    this.playing = false;
  }

  currentStep(): PixelStep | null {
    if (this.cursor >= this.steps.length) return null;
    return this.steps[this.cursor];
  }
}
