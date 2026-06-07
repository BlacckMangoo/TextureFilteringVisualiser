import { Canvas } from "./canvas";
import { Texture } from "./texture";
import { PixelStep, TriangleData } from "./stepper";
import { Edge, Vec2 } from "./math";
import { Interpolator } from "./interpolator";
import { AppState } from "./app-state";
import { computeFootprint } from "./footprint";
import { renderVisualization } from "./visualizations";

export interface PixelInspectorInfo {
  screenX: number;
  screenY: number;
  lambda1: number;
  lambda2: number;
  lambda3: number;
  u: number;
  v: number;
  dudx: number;
  dvdx: number;
  dudy: number;
  dvdy: number;
  footprintWidth: number;
  footprintHeight: number;
  majorAxisLength: number;
  minorAxisLength: number;
  anisotropyRatio: number;
  computedLOD: number;
  selectedMip: number;
  sampleCount: number;
  finalColorR: number;
  finalColorG: number;
  finalColorB: number;
}

interface MipOverlays {
  selectedTexel: Canvas;
  footprint: Canvas;
  mipHighlight: Canvas;
}

export class Debugger {
  selectedStep: PixelStep | null = null;
  inspector: PixelInspectorInfo = {
    screenX: 0,
    screenY: 0,
    lambda1: 0,
    lambda2: 0,
    lambda3: 0,
    u: 0,
    v: 0,
    dudx: 0,
    dvdx: 0,
    dudy: 0,
    dvdy: 0,
    footprintWidth: 0,
    footprintHeight: 0,
    majorAxisLength: 0,
    minorAxisLength: 0,
    anisotropyRatio: 0,
    computedLOD: 0,
    selectedMip: 0,
    sampleCount: 0,
    finalColorR: 0,
    finalColorG: 0,
    finalColorB: 0,
  };

  private triangleOverlay: Canvas | null = null;
  private textureOverlay: Canvas | null = null;
  private mipOverlays: MipOverlays[] = [];

  attachTriangleOverlay(triangleCanvas: Canvas) {
    this.triangleOverlay?.destroy();
    this.triangleOverlay = new Canvas(
      triangleCanvas.resolutionWidth,
      triangleCanvas.resolutionHeight,
      triangleCanvas.displayWidth,
      triangleCanvas.displayHeight,
      0,
      0,
      { overlay: true, zIndex: 1, parent: triangleCanvas.container },
    );
  }

  attachTextureOverlay(texture: Texture) {
    this.textureOverlay?.destroy();
    const base = texture.baseCanvas;
    this.textureOverlay = new Canvas(
      base.resolutionWidth,
      base.resolutionHeight,
      base.displayWidth,
      base.displayHeight,
      0,
      0,
      { overlay: true, zIndex: 4, parent: base.container },
    );
  }

  attachMipOverlays(texture: Texture) {
    this.destroyMipOverlays();
    for (const mip of texture.mipLevels) {
      this.mipOverlays.push({
        selectedTexel: new Canvas(
          mip.resolutionWidth,
          mip.resolutionHeight,
          mip.displayWidth,
          mip.displayHeight,
          0,
          0,
          { overlay: true, zIndex: 1, parent: mip.container },
        ),
        footprint: new Canvas(
          mip.resolutionWidth,
          mip.resolutionHeight,
          mip.displayWidth,
          mip.displayHeight,
          0,
          0,
          { overlay: true, zIndex: 2, parent: mip.container },
        ),
        mipHighlight: new Canvas(
          mip.resolutionWidth,
          mip.resolutionHeight,
          mip.displayWidth,
          mip.displayHeight,
          0,
          0,
          { overlay: true, zIndex: 3, parent: mip.container },
        ),
      });
    }
  }

  destroyMipOverlays() {
    for (const overlays of this.mipOverlays) {
      overlays.selectedTexel.destroy();
      overlays.footprint.destroy();
      overlays.mipHighlight.destroy();
    }
    this.mipOverlays = [];
  }

  updateInspector(step: PixelStep, state: AppState) {
    const fp = computeFootprint(
      step,
      state.texture.width,
      state.texture.height,
      state.texture.levelCount,
      state.settings.anisotropyLevel,
    );
    const color = state.sampler.sample(
      step.u,
      step.v,
      step.dudx,
      step.dvdx,
      step.dudy,
      step.dvdy,
    );
    Object.assign(this.inspector, {
      screenX: step.x,
      screenY: step.y,
      lambda1: step.lambda1,
      lambda2: step.lambda2,
      lambda3: step.lambda3,
      u: step.u,
      v: step.v,
      dudx: step.dudx,
      dvdx: step.dvdx,
      dudy: step.dudy,
      dvdy: step.dvdy,
      footprintWidth: fp.footprintWidth,
      footprintHeight: fp.footprintHeight,
      majorAxisLength: fp.majorAxisLength,
      minorAxisLength: fp.minorAxisLength,
      anisotropyRatio: fp.anisotropyRatio,
      computedLOD: fp.computedLOD,
      selectedMip: fp.selectedMip,
      sampleCount: fp.sampleCount,
      finalColorR: Math.round(color.r),
      finalColorG: Math.round(color.g),
      finalColorB: Math.round(color.b),
    });
  }

  selectPixel(x: number, y: number, state: AppState) {
    if (this.selectedStep && this.selectedStep.x === x && this.selectedStep.y === y) {
      this.selectedStep = null;
      return;
    }
    const match = state.stepper.steps
      .slice(0, state.stepper.cursor)
      .reverse()
      .find((s) => s.x === x && s.y === y);
    if (!match) {
      this.selectedStep = null;
      return;
    }
    this.selectedStep = match;
    this.updateInspector(match, state);
  }

  uvAtScreenPixel(
    px: number,
    py: number,
    triangle: TriangleData,
    interpolator: Interpolator,
    triangleCanvas: Canvas,
  ): Vec2 {
    const sx = triangleCanvas.resolutionWidth / triangleCanvas.displayWidth;
    const sy = triangleCanvas.resolutionHeight / triangleCanvas.displayHeight;
    const p1s = new Vec2(triangle.p1.x * sx, triangle.p1.y * sy);
    const p2s = new Vec2(triangle.p2.x * sx, triangle.p2.y * sy);
    const p3s = new Vec2(triangle.p3.x * sx, triangle.p3.y * sy);
    const area = Edge(p1s, p2s, p3s);
    const p = new Vec2(px + 0.5, py + 0.5);
    const l1 = Edge(p2s, p3s, p) / area;
    const l2 = Edge(p3s, p1s, p) / area;
    const l3 = Edge(p1s, p2s, p) / area;
    return interpolator.interpolate({
      l1,
      l2,
      l3,
      w1: triangle.p1.w,
      w2: triangle.p2.w,
      w3: triangle.p3.w,
      uv1: triangle.uv1,
      uv2: triangle.uv2,
      uv3: triangle.uv3,
    });
  }

  drawOverlays(state: AppState) {
    if (!this.triangleOverlay) return;
    renderVisualization(state, {
      triangleOverlay: this.triangleOverlay,
      textureOverlay: this.textureOverlay,
      mipOverlays: this.mipOverlays,
    });
  }
}
