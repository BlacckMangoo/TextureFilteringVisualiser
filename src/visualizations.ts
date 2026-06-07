import { AppState } from "./app-state";
import { Color, Cyan, Magenta, Transparent, Yellow } from "./color";
import { Canvas } from "./canvas";
import { computeFootprint, computeMipLevel } from "./footprint";
import { PixelStep } from "./stepper";

export type VisualizationMode = "none" | "lod_heatmap";

export interface VisualizationContext {
  triangleOverlay: Canvas;
  textureOverlay: Canvas | null;
  mipOverlays: {
    selectedTexel: Canvas;
    footprint: Canvas;
    mipHighlight: Canvas;
  }[];
}

// ─── helpers ────────────────────────────────────────────────────────────────

const MIP_COLORS: Color[] = [
  { r: 255, g: 0,   b: 0,   a: 200 },
  { r: 255, g: 128, b: 0,   a: 200 },
  { r: 255, g: 255, b: 0,   a: 200 },
  { r: 0,   g: 255, b: 0,   a: 200 },
  { r: 0,   g: 255, b: 255, a: 200 },
  { r: 0,   g: 128, b: 255, a: 200 },
  { r: 128, g: 0,   b: 255, a: 200 },
  { r: 255, g: 0,   b: 255, a: 200 },
  { r: 255, g: 128, b: 128, a: 200 },
  { r: 128, g: 128, b: 255, a: 200 },
];

function mipColor(level: number): Color {
  return MIP_COLORS[level % MIP_COLORS.length];
}

function clampTexel(v: number, max: number): number {
  return Math.max(0, Math.min(v, max - 1));
}

function setTexel2x2(canvas: Canvas, tx: number, ty: number, color: Color) {
  canvas.setPixel(tx,     ty,     color);
  canvas.setPixel(tx + 1, ty,     color);
  canvas.setPixel(tx,     ty + 1, color);
  canvas.setPixel(tx + 1, ty + 1, color);
}


function paintHeatmap(
  overlay: Canvas,
  steps: PixelStep[],
  tw: number,
  th: number,
  levelCount: number,
) {
  for (const step of steps) {
    const level = computeMipLevel(step, tw, th, levelCount);
    overlay.setPixel(step.x, step.y, mipColor(level));
  }
}


function paintCursor(
  step: PixelStep,
  ctx: VisualizationContext,
  tw: number,
  th: number,
  levelCount: number,
) {
  ctx.triangleOverlay.setPixel(step.x, step.y, Yellow);

  const lod = computeMipLevel(step, tw, th, levelCount);
  const overlay = ctx.mipOverlays[lod];
  if (!overlay) return;

  const mip = overlay.mipHighlight; // use mip canvas dimensions via the overlay canvas
  // We need resolution from the mipOverlay canvas itself; grab via selectedTexel (same dims)
  const mipCanvas = overlay.selectedTexel;
  const tx = clampTexel(Math.floor(step.u * mipCanvas.resolutionWidth),  mipCanvas.resolutionWidth);
  const ty = clampTexel(Math.floor(step.v * mipCanvas.resolutionHeight), mipCanvas.resolutionHeight);
  setTexel2x2(overlay.mipHighlight, tx, ty, Cyan);
}


function paintSelected(
  step: PixelStep,
  state: AppState,
  ctx: VisualizationContext,
) {
  const { texture, settings } = state;

  ctx.triangleOverlay.setPixel(step.x, step.y, Magenta);

  const fp = computeFootprint(
    step,
    texture.width,
    texture.height,
    texture.levelCount,
    settings.anisotropyLevel,
  );

  const overlay = ctx.mipOverlays[fp.selectedMip];
  if (!overlay) return;

  const mipW = overlay.selectedTexel.resolutionWidth;
  const mipH = overlay.selectedTexel.resolutionHeight;

  const tx = clampTexel(Math.floor(step.u * mipW), mipW);
  const ty = clampTexel(Math.floor(step.v * mipH), mipH);
  setTexel2x2(overlay.selectedTexel, tx, ty, Magenta);

  const cx = step.u * mipW;
  const cy = step.v * mipH;
  const halfMajor = fp.majorAxisLength * 0.5;
  const halfMinor = fp.minorAxisLength * 0.5;

  for (let y = 0; y < mipH; y++) {
    for (let x = 0; x < mipW; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const major = dx * fp.majorAxisDirTex.x + dy * fp.majorAxisDirTex.y;
      const minor = dx * fp.minorAxisDirTex.x + dy * fp.minorAxisDirTex.y;
      if (Math.abs(major) <= halfMajor && Math.abs(minor) <= halfMinor) {
        overlay.footprint.setPixel(x, y, Magenta);
      }
    }
  }
}


function flushOverlays(ctx: VisualizationContext) {
  ctx.triangleOverlay.Render();
  ctx.textureOverlay?.Render();
  for (const overlays of ctx.mipOverlays) {
    overlays.selectedTexel.Render();
    overlays.footprint.Render();
    overlays.mipHighlight.Render();
  }
}


export function renderVisualization(state: AppState, ctx: VisualizationContext) {
  const { stepper, texture, debugger: dbg, settings } = state;
  const { visualizationMode: mode } = settings;
  const tw = texture.width;
  const th = texture.height;

  ctx.triangleOverlay.clear(Transparent);
  ctx.textureOverlay?.clear(Transparent);
  for (const overlays of ctx.mipOverlays) {
    overlays.selectedTexel.clear(Transparent);
    overlays.footprint.clear(Transparent);
    overlays.mipHighlight.clear(Transparent);
  }

  switch (mode) {
    case "lod_heatmap":
      paintHeatmap(ctx.triangleOverlay, stepper.steps, tw, th, texture.levelCount);
      break;
    case "none":
    default:
      break;
  }

  const cursor = stepper.currentStep();
  if (cursor) {
    paintCursor(cursor, ctx, tw, th, texture.levelCount);
  }

  // selected pixel (magenta) — always last so it's never overwritten
  if (dbg.selectedStep) {
    paintSelected(dbg.selectedStep, state, ctx);
  }

  flushOverlays(ctx);
}