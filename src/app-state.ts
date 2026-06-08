import { Canvas } from "./canvas";
import { Debugger } from "./debugger";
import {
  createInterpolator,
  Interpolator,
  InterpolationMode,
} from "./interpolator";
import { RedrawUpToCursor } from "./renderer";
import { createFilter, FilterMode, Sampler } from "./sampler";
import { Stepper, TriangleData } from "./stepper";
import { Texture } from "./texture";
import { Vec2 } from "./math";
import { AnisotropyLevel } from "./footprint";
import { VisualizationMode } from "./visualizations";

export const DISPLAY_SIZE = window.innerHeight / 2 + window.innerHeight / 4;

export interface AppSettings {
  resolution: number;
  textureRes: number;
  textureCellsize: number;
  filterMode: FilterMode;
  interpolationMode: InterpolationMode;
  anisotropyLevel: AnisotropyLevel;
  visualizationMode: VisualizationMode;
}

export class AppState {
  triangleCanvas: Canvas;
  texture: Texture;
  sampler: Sampler;
  interpolator: Interpolator;
  stepper: Stepper;
  debugger: Debugger;
  triangle: TriangleData;
  settings: AppSettings;

  constructor() {
    this.settings = {
      resolution: 512,
      textureRes: 1024,
      textureCellsize: 16,
      filterMode: "anisotropic",
      interpolationMode: "perspective",
      anisotropyLevel: 32,
      visualizationMode: "none",
    };

    this.triangleCanvas = new Canvas(
      256,
      256,
      DISPLAY_SIZE,
      DISPLAY_SIZE,
      0,
      0,
    );

    this.texture = new Texture(256, DISPLAY_SIZE, DISPLAY_SIZE, 0);

    this.interpolator = new Interpolator(
      createInterpolator(this.settings.interpolationMode),
    );

    this.sampler = new Sampler(
      createFilter(
        this.settings.filterMode,
        this.texture,
        this.settings.anisotropyLevel,
      ),
    );

    this.stepper = new Stepper();
    this.debugger = new Debugger();

    this.triangle = {
      p1: { x: 400, y: 700, w: 1.0 },
      p2: { x: 40, y: 400, w: 3.0 },
      p3: { x: 600, y: 400, w: 3.0 },
      uv1: new Vec2(1, 0),
      uv2: new Vec2(0, 1),
      uv3: new Vec2(1, 1),
    };

    this.debugger.attachTriangleOverlay(this.triangleCanvas);
  }

  private refreshSampler() {
    this.sampler.setFilter(
      createFilter(
        this.settings.filterMode,
        this.texture,
        this.settings.anisotropyLevel,
      ),
    );
  }

  rebuildTexture() {
    this.texture.rebuildTexture(
      this.settings.textureRes,
      this.settings.textureCellsize,
    );
  }

  rebuildMipChain() {
    this.texture.rebuildMipChain({
      displaySize: DISPLAY_SIZE,
      columnLeft: DISPLAY_SIZE * 2,
    });
    this.debugger.attachTextureOverlay(this.texture);
    this.debugger.attachMipOverlays(this.texture);
    this.refreshSampler();
  }

  rebuildSteps() {
    this.stepper.rebuildSteps(
      this.triangle,
      this.interpolator,
      this.triangleCanvas,
    );
    this.debugger.selectedStep = null;
  }

  fullRebuild() {
    this.triangleCanvas.ResizeResolution(this.settings.resolution);
    this.debugger.attachTriangleOverlay(this.triangleCanvas);
    this.rebuildTexture();
    this.rebuildMipChain();
    this.rebuildSteps();
    RedrawUpToCursor(this);
  }

  private refreshInspector() {
    if (this.debugger.selectedStep) {
      this.debugger.updateInspector(this.debugger.selectedStep, this);
    }
  }

  redraw() {
    RedrawUpToCursor(this);
  }

  setFilterMode(mode: FilterMode) {
    this.settings.filterMode = mode;
    this.refreshSampler();
    this.refreshInspector();
    this.redraw();
  }

  setAnisotropyLevel(level: AnisotropyLevel) {
    this.settings.anisotropyLevel = level;
    this.refreshSampler();
    if (this.debugger.selectedStep) {
      this.debugger.updateInspector(this.debugger.selectedStep, this);
    }
    this.redraw();
  }

  setVisualizationMode(mode: VisualizationMode) {
    this.settings.visualizationMode = mode;
    this.redraw();
  }

  setInterpolationMode(mode: InterpolationMode) {
    this.settings.interpolationMode = mode;
    this.interpolator.setStrategy(createInterpolator(mode));
    this.rebuildSteps();
    this.redraw();
  }

  setResolution(resolution: number) {
    this.settings.resolution = resolution;
    this.triangleCanvas.ResizeResolution(resolution);
    this.debugger.attachTriangleOverlay(this.triangleCanvas);
    this.rebuildSteps();
    this.redraw();
  }

  setTextureRes(resolution: number) {
    this.settings.textureRes = resolution;
    this.rebuildTexture();
    this.rebuildMipChain();
    this.rebuildSteps();
    this.redraw();
  }

  setTextureCellsize(cellsize: number) {
    this.settings.textureCellsize = cellsize;
    this.rebuildTexture();
    this.rebuildMipChain();
    this.rebuildSteps();
    this.redraw();
  }

  onTriangleChanged() {
    this.rebuildSteps();
    this.redraw();
  }

  selectPixel(x: number, y: number) {
    this.debugger.selectPixel(x, y, this);
    this.redraw();
  }
}
