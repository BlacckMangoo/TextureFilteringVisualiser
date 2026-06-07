import { Black, Color } from "./color";
import { Canvas } from "./canvas";

function FillChecker(canvas: Canvas, cellsize: number) {
  for (let y = 0; y <= canvas.resolutionHeight - 1; y++) {
    for (let x = 0; x <= canvas.resolutionWidth - 1; x++) {
      const a = Math.floor(x / cellsize);
      const b = Math.floor(y / cellsize);
      const col: Color = {
        r: Math.floor((255 * x) / canvas.resolutionWidth),
        g: Math.floor((255 * y) / canvas.resolutionHeight),
        b: 0,
        a: 255,
      };
      if ((a + b) % 2 == 0) canvas.setPixel(x, y, col);
    }
  }
}

export interface MipLayout {
  displaySize: number;
  columnLeft: number;
}

export class Texture {
  private base: Canvas;
  private mips: Canvas[] = [];
  private mipChain: Canvas[] = [];
  private cellsize = 16;

  constructor(
    resolution: number,
    displaySize: number,
    columnLeft: number,
    top = 0,
  ) {
    this.base = new Canvas(
      resolution,
      resolution,
      displaySize,
      displaySize,
      columnLeft,
      top,
    );
    this.mipChain = [this.base];
  }

  get baseCanvas(): Canvas {
    return this.base;
  }

  get mipLevels(): readonly Canvas[] {
    return this.mipChain;
  }

  get levelCount(): number {
    return this.mipChain.length;
  }

  getMip(level: number): Canvas {
    return this.mipChain[Math.max(0, Math.min(level, this.mipChain.length - 1))];
  }

  get width(): number {
    return this.base.resolutionWidth;
  }

  get height(): number {
    return this.base.resolutionHeight;
  }

  rebuildTexture(resolution: number, cellsize: number) {
    this.cellsize = cellsize;
    this.base.ResizeResolution(resolution);
    this.base.clear(Black);
    FillChecker(this.base, cellsize);
  }

  rebuildMipChain(layout: MipLayout) {
    for (const mip of this.mips) mip.destroy();
    this.mips = [];
    this.mipChain = [this.base];

    let current = this.base;
    let displaySize = layout.displaySize;
    let topOffset = 0;

    while (current.resolutionWidth > 1 || current.resolutionHeight > 1) {
      const newW = Math.max(1, Math.floor(current.resolutionWidth / 2));
      const newH = Math.max(1, Math.floor(current.resolutionHeight / 2));
      displaySize = Math.max(4, Math.floor(displaySize / 2));

      const mip = new Canvas(
        newW,
        newH,
        displaySize,
        displaySize,
        layout.columnLeft,
        topOffset,
      );
      topOffset += displaySize;
      for (let y = 0; y < newH; y++) {
        for (let x = 0; x < newW; x++) {
          const sx = x * 2,
            sy = y * 2;
          const c00 = current.getPixel(sx, sy);
          const c10 = current.getPixel(sx + 1, sy);
          const c01 = current.getPixel(sx, sy + 1);
          const c11 = current.getPixel(sx + 1, sy + 1);
          mip.setPixel(x, y, {
            r: (c00.r + c10.r + c01.r + c11.r) / 4,
            g: (c00.g + c10.g + c01.g + c11.g) / 4,
            b: (c00.b + c10.b + c01.b + c11.b) / 4,
            a: (c00.a + c10.a + c01.a + c11.a) / 4,
          });
        }
      }
      mip.Render();
      this.mips.push(mip);
      this.mipChain.push(mip);
      current = mip;
    }
  }

  renderAll() {
    this.base.Render();
    for (const mip of this.mips) mip.Render();
  }
}
