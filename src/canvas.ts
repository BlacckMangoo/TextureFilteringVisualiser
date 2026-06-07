import { Color } from "./color";

export class Canvas {
  resolutionWidth: number;
  resolutionHeight: number;
  displayWidth: number;
  displayHeight: number;
  imageData: ImageData;
  framebuffer: HTMLCanvasElement;
  framebufferCtx: CanvasRenderingContext2D;
  readonly container: HTMLDivElement;

  public onClick?: (x: number, y: number) => void;

  constructor(
    resW: number,
    resH: number,
    displayW: number,
    displayH: number,
    left = 0,
    top = 0,
    options?: { overlay?: boolean; zIndex?: number; parent?: HTMLElement },
  ) {
    this.resolutionWidth = resW;
    this.resolutionHeight = resH;
    this.displayWidth = displayW;
    this.displayHeight = displayH;

    const container = document.createElement("div");
    if (options?.parent) {
      container.style.position = "absolute";
      container.style.left = "0";
      container.style.top = "0";
      container.style.width = "100%";
      container.style.height = "100%";
      container.style.pointerEvents = "none";

    } else {
      container.style.position = "absolute";
      container.style.left = `${left}px`;
      container.style.top = `${top}px`;
      container.style.width = `${displayW}px`;
      container.style.height = `${displayH}px`;
    }
    this.container = container;
    const mountTarget = options?.parent ?? document.getElementById("canvasSpace");
    mountTarget?.appendChild(container);

    this.framebuffer = document.createElement("canvas");
    this.framebuffer.width = resW;
    this.framebuffer.height = resH;
    this.framebuffer.style.width = `${displayW}px`;
    this.framebuffer.style.height = `${displayH}px`;
    this.framebuffer.style.position = "absolute";
    this.framebuffer.style.left = "0";
    this.framebuffer.style.top = "0";
    this.framebuffer.style.imageRendering = "pixelated";
    
    if (options?.zIndex !== undefined) {
      this.framebuffer.style.zIndex = String(options.zIndex);
    }
    if (options?.overlay) {
      this.framebuffer.style.pointerEvents = "none";
    }
    container.appendChild(this.framebuffer);

    this.framebufferCtx = this.framebuffer.getContext("2d")!;
    this.framebufferCtx.imageSmoothingEnabled = false;
    this.imageData = this.framebufferCtx.createImageData(resW, resH);

    if (!options?.overlay) {
      this.framebuffer.addEventListener("click", (e) => {
        const rect = this.framebuffer.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const pixelX = Math.floor(
          (mouseX * this.resolutionWidth) / rect.width,
        );
        const pixelY = Math.floor(
          (mouseY * this.resolutionHeight) / rect.height,
        );
        this.onClick?.(pixelX, pixelY);
      });
    }
  }

  setPixel(x: number, y: number, col: Color) {
    if (
      x < 0 ||
      x >= this.resolutionWidth ||
      y < 0 ||
      y >= this.resolutionHeight
    )
      return;
    const i = (y * this.resolutionWidth + x) * 4;
    this.imageData.data[i + 0] = col.r;
    this.imageData.data[i + 1] = col.g;
    this.imageData.data[i + 2] = col.b;
    this.imageData.data[i + 3] = col.a;
  }

  getPixel(x: number, y: number): Color {
    x = Math.max(0, Math.min(x, this.resolutionWidth - 1));
    y = Math.max(0, Math.min(y, this.resolutionHeight - 1));
    const i = (y * this.resolutionWidth + x) * 4;
    return {
      r: this.imageData.data[i + 0],
      g: this.imageData.data[i + 1],
      b: this.imageData.data[i + 2],
      a: this.imageData.data[i + 3],
    };
  }

  ResizeResolution(res: number) {
    this.resolutionWidth = res;
    this.resolutionHeight = res;
    this.framebuffer.width = res;
    this.framebuffer.height = res;
    this.framebufferCtx = this.framebuffer.getContext("2d")!;
    this.framebufferCtx.imageSmoothingEnabled = false;
    this.imageData = this.framebufferCtx.createImageData(res, res);
  }

  clear(col: Color) {
    for (let i = 0; i < this.resolutionWidth * this.resolutionHeight; i++) {
      this.imageData.data[i * 4 + 0] = col.r;
      this.imageData.data[i * 4 + 1] = col.g;
      this.imageData.data[i * 4 + 2] = col.b;
      this.imageData.data[i * 4 + 3] = col.a;
    }
  }

  Render() {
    this.framebufferCtx.putImageData(this.imageData, 0, 0);
  }

  destroy() {
    this.container.remove();
  }
}
