import { Black } from "./color";
import { AppState } from "./app-state";

export function RenderTriangle(state: AppState) {
  const { triangleCanvas, stepper, sampler } = state;
  triangleCanvas.clear(Black);
  for (let i = 0; i < stepper.cursor; i++) {
    const s = stepper.steps[i];
    triangleCanvas.setPixel(
      s.x,
      s.y,
      sampler.sample(s.u, s.v, s.dudx, s.dvdx, s.dudy, s.dvdy),
    );
  }
  triangleCanvas.Render();
}

export function RenderTextureView(state: AppState) {
  state.texture.baseCanvas.Render();
}

export function RenderMipViews(state: AppState) {
  for (let i = 1; i < state.texture.levelCount; i++) {
    state.texture.getMip(i).Render();
  }
}

export function RenderDebugOverlays(state: AppState) {
  state.debugger.drawOverlays(state);
}

export function RedrawUpToCursor(state: AppState) {
  RenderTriangle(state);
  RenderTextureView(state);
  RenderMipViews(state);
  RenderDebugOverlays(state);
}
