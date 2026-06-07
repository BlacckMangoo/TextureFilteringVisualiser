import { Vec2 } from "./math";

export interface InterpolationContext {
  l1: number;
  l2: number;
  l3: number;
  w1: number;
  w2: number;
  w3: number;
  uv1: Vec2;
  uv2: Vec2;
  uv3: Vec2;
}

export interface InterpolationStrategy {
  interpolate(ctx: InterpolationContext): Vec2;
}

export class LinearInterpolation implements InterpolationStrategy {
  interpolate(ctx: InterpolationContext): Vec2 {
    const u = ctx.uv1.x * ctx.l1 + ctx.uv2.x * ctx.l2 + ctx.uv3.x * ctx.l3;
    const v = ctx.uv1.y * ctx.l1 + ctx.uv2.y * ctx.l2 + ctx.uv3.y * ctx.l3;
    return new Vec2(u, v);
  }
}

export class PerspectiveCorrectInterpolation implements InterpolationStrategy {
  interpolate(ctx: InterpolationContext): Vec2 {
    const interpolatedOneOverW =
      (1 / ctx.w1) * ctx.l1 + (1 / ctx.w2) * ctx.l2 + (1 / ctx.w3) * ctx.l3;
    const pixelW = 1 / interpolatedOneOverW;
    const interpolatedUOverW =
      (ctx.uv1.x / ctx.w1) * ctx.l1 +
      (ctx.uv2.x / ctx.w2) * ctx.l2 +
      (ctx.uv3.x / ctx.w3) * ctx.l3;
    const interpolatedVOverW =
      (ctx.uv1.y / ctx.w1) * ctx.l1 +
      (ctx.uv2.y / ctx.w2) * ctx.l2 +
      (ctx.uv3.y / ctx.w3) * ctx.l3;
    return new Vec2(interpolatedUOverW * pixelW, interpolatedVOverW * pixelW);
  }
}

export type InterpolationMode = "linear" | "perspective";

export function createInterpolator(
  mode: InterpolationMode,
): InterpolationStrategy {
  return mode === "perspective"
    ? new PerspectiveCorrectInterpolation()
    : new LinearInterpolation();
}

export class Interpolator {
  constructor(private strategy: InterpolationStrategy) {}
  setStrategy(strategy: InterpolationStrategy) {
    this.strategy = strategy;
  }
  interpolate(ctx: InterpolationContext): Vec2 {
    return this.strategy.interpolate(ctx);
  }
}
