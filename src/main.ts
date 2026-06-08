import GUI from "lil-gui";
import "./main.css";
import { AppState, DISPLAY_SIZE } from "./app-state";
import { VisualizationMode } from "./visualizations";
import { AnisotropyLevel } from "./footprint";

const gui = new GUI({ title: "Rasterizer Controls" });
const app = new AppState();

const VISUALIZATION_MODES: { value: VisualizationMode; label: string }[] = [
  { value: "none", label: "None" },
  {value :"lod_heatmap" , label: "lod_heatmap"}
];

const visualizationLabels = VISUALIZATION_MODES.map((m) => m.label);
const visualizationValues = VISUALIZATION_MODES.map((m) => m.value);

const inspectorFolder = gui.addFolder("Pixel Inspector");
inspectorFolder.add(app.debugger.inspector, "screenX").name("Screen X").listen().disable();
inspectorFolder.add(app.debugger.inspector, "screenY").name("Screen Y").listen().disable();
inspectorFolder.add(app.debugger.inspector, "lambda1").name("λ1").listen().disable();
inspectorFolder.add(app.debugger.inspector, "lambda2").name("λ2").listen().disable();
inspectorFolder.add(app.debugger.inspector, "lambda3").name("λ3").listen().disable();
inspectorFolder.add(app.debugger.inspector, "u").name("U").listen().disable();
inspectorFolder.add(app.debugger.inspector, "v").name("V").listen().disable();
inspectorFolder.add(app.debugger.inspector, "dudx").name("dudx").listen().disable();
inspectorFolder.add(app.debugger.inspector, "dvdx").name("dvdx").listen().disable();
inspectorFolder.add(app.debugger.inspector, "dudy").name("dudy").listen().disable();
inspectorFolder.add(app.debugger.inspector, "dvdy").name("dvdy").listen().disable();
inspectorFolder.add(app.debugger.inspector, "footprintWidth").name("Footprint Width").listen().disable();
inspectorFolder.add(app.debugger.inspector, "footprintHeight").name("Footprint Height").listen().disable();
inspectorFolder.add(app.debugger.inspector, "majorAxisLength").name("Major Axis").listen().disable();
inspectorFolder.add(app.debugger.inspector, "minorAxisLength").name("Minor Axis").listen().disable();
inspectorFolder.add(app.debugger.inspector, "anisotropyRatio").name("Anisotropy Ratio").listen().disable();
inspectorFolder.add(app.debugger.inspector, "computedLOD").name("Computed LOD").listen().disable();
inspectorFolder.add(app.debugger.inspector, "selectedMip").name("Selected Mip").listen().disable();
inspectorFolder.add(app.debugger.inspector, "sampleCount").name("Sample Count").listen().disable();
inspectorFolder.add(app.debugger.inspector, "finalColorR").name("Color R").listen().disable();
inspectorFolder.add(app.debugger.inspector, "finalColorG").name("Color G").listen().disable();
inspectorFolder.add(app.debugger.inspector, "finalColorB").name("Color B").listen().disable();

const vizProxy = {
  mode: "None",
};
gui
  .add(vizProxy, "mode", visualizationLabels)
  .name("Visualization Mode")
  .onChange((label: string) => {
    const idx = visualizationLabels.indexOf(label);
    app.setVisualizationMode(visualizationValues[idx]);
  });

gui
  .add(app.settings, "resolution", [16, 32, 64, 128, 256, 512])
  .name("Resolution")
  .onChange((v: number) => app.setResolution(v));

gui
  .add(app.settings, "textureRes", [16, 32, 64, 128, 256, 512,1024])
  .name("Texture Resolution")
  .onChange((v: number) => app.setTextureRes(v));

gui
  .add(app.settings, "textureCellsize", [2, 4, 8, 16, 32, 64, 128, 256, 512])
  .name("Cellsize")
  .onChange((v: number) => app.setTextureCellsize(v));

gui
  .add(app.settings, "filterMode", [
    "nearest",
    "bilinear",
    "mipmap_nearest",
    "mipmap_linear",
    "anisotropic",
  ])
  .name("Filter Mode")
  .onChange((v: typeof app.settings.filterMode) => app.setFilterMode(v));

gui
  .add(app.settings, "anisotropyLevel", [1, 2, 4, 8, 16])
  .name("Anisotropy Level")
  .onChange((v: AnisotropyLevel) => app.setAnisotropyLevel(v));

const sf = gui.addFolder("Stepper");
const stepperProxy = {
  Reset: () => {
    app.stepper.reset();
    app.redraw();
    updateStepLabel();
  },
  Back: () => {
    app.stepper.stepBack();
    app.redraw();
    updateStepLabel();
  },
  "Play/Pause": () => {
    app.stepper.playing = !app.stepper.playing;
    if (app.stepper.playing && app.stepper.cursor >= app.stepper.steps.length) {
      app.stepper.reset();
      app.redraw();
      updateStepLabel();
    }
  },
  "Step Pixel": () => {
    app.stepper.stepForwardPixel();
    app.redraw();
    updateStepLabel();
  },
  "Step Row": () => {
    app.stepper.stepForwardRow();
    app.redraw();
    updateStepLabel();
  },
  Finish: () => {
    app.stepper.finish();
    app.redraw();
    updateStepLabel();
  },
  stepMode: "row" as "pixel" | "row",
  playSpeedMs: 50,
  "Step: 0 / 0": () => {},
};
sf.add(stepperProxy, "Reset");
sf.add(stepperProxy, "Back");
sf.add(stepperProxy, "Play/Pause");
sf.add(stepperProxy, "Step Pixel");
sf.add(stepperProxy, "Step Row");
sf.add(stepperProxy, "Finish");
sf.add(stepperProxy, "stepMode", ["pixel", "row"])
  .name("Auto-play steps by")
  .onChange((v: "pixel" | "row") => {
    app.stepper.stepMode = v;
  });
sf.add(stepperProxy, "playSpeedMs", 1, 500, 1)
  .name("Play speed (ms)")
  .onChange((v: number) => {
    app.stepper.playIntervalMs = v;
  });
const stepControl = sf.add(stepperProxy, "Step: 0 / 0");
sf.open();

function updateStepLabel() {
  stepControl.name(`Step: ${app.stepper.cursor} / ${app.stepper.steps.length}`);
}

gui
  .add(app.settings, "interpolationMode", ["linear", "perspective"])
  .name("Interpolation")
  .onChange((v: typeof app.settings.interpolationMode) =>
    app.setInterpolationMode(v),
  );

const f1 = gui.addFolder("Vertex 1");
f1.add(app.triangle.p1, "x", 0, DISPLAY_SIZE, 1)
  .name("X")
  .onChange(() => app.onTriangleChanged());
f1.add(app.triangle.p1, "y", 0, DISPLAY_SIZE, 1)
  .name("Y")
  .onChange(() => app.onTriangleChanged());
f1.add(app.triangle.p1, "w", 0.1, 10, 0.1)
  .name("W (Depth)")
  .onChange(() => app.onTriangleChanged());
f1.add(app.triangle.uv1, "x", 0, 1, 0.01)
  .name("U")
  .onChange(() => app.onTriangleChanged());
f1.add(app.triangle.uv1, "y", 0, 1, 0.01)
  .name("V")
  .onChange(() => app.onTriangleChanged());

const f2 = gui.addFolder("Vertex 2");
f2.add(app.triangle.p2, "x", 0, DISPLAY_SIZE, 1)
  .name("X")
  .onChange(() => app.onTriangleChanged());
f2.add(app.triangle.p2, "y", 0, DISPLAY_SIZE, 1)
  .name("Y")
  .onChange(() => app.onTriangleChanged());
f2.add(app.triangle.p2, "w", 0.1, 10, 0.1)
  .name("W (Depth)")
  .onChange(() => app.onTriangleChanged());
f2.add(app.triangle.uv2, "x", 0, 1, 0.01)
  .name("U")
  .onChange(() => app.onTriangleChanged());
f2.add(app.triangle.uv2, "y", 0, 1, 0.01)
  .name("V")
  .onChange(() => app.onTriangleChanged());

const f3 = gui.addFolder("Vertex 3");
f3.add(app.triangle.p3, "x", 0, DISPLAY_SIZE, 1)
  .name("X")
  .onChange(() => app.onTriangleChanged());
f3.add(app.triangle.p3, "y", 0, DISPLAY_SIZE, 1)
  .name("Y")
  .onChange(() => app.onTriangleChanged());
f3.add(app.triangle.p3, "w", 0.1, 10, 0.1)
  .name("W (Depth)")
  .onChange(() => app.onTriangleChanged());
f3.add(app.triangle.uv3, "x", 0, 1, 0.01)
  .name("U")
  .onChange(() => app.onTriangleChanged());
f3.add(app.triangle.uv3, "y", 0, 1, 0.01)
  .name("V")
  .onChange(() => app.onTriangleChanged());

f1.open();
f2.open();
f3.open();
inspectorFolder.open();

app.triangleCanvas.onClick = (x, y) => app.selectPixel(x, y);

app.fullRebuild();
updateStepLabel();

function loop(timestamp: number) {
  if (app.stepper.playing && app.stepper.cursor < app.stepper.steps.length) {
    if (timestamp - app.stepper.lastTime >= app.stepper.playIntervalMs) {
      app.stepper.lastTime = timestamp;
      if (app.stepper.stepMode === "row") app.stepper.stepForwardRow();
      else app.stepper.stepForwardPixel();
      app.redraw();
      updateStepLabel();
    }
  } else if (
    app.stepper.playing &&
    app.stepper.cursor >= app.stepper.steps.length
  ) {
    app.stepper.playing = false;
  }
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
