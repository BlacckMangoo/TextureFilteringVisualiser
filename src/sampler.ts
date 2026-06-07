import { Color, LerpColor } from "./color";
import { Canvas } from "./canvas";
import { Texture } from "./texture";
import { PixelStep } from "./stepper";
import {
  AnisotropyLevel,
  computeAnisoMipLevel,
  computeFootprint,
  computeMipLOD,
  computeMipLevel,
  snapSampleCount,
} from "./footprint";

export function sampleMip(
  mip: Canvas,
  u: number,
  v: number,
  bilinear: boolean,
): Color {
  if (bilinear) {
    const tx = u * mip.resolutionWidth - 0.5;
    const ty = v * mip.resolutionHeight - 0.5;
    const x0 = Math.floor(tx);
    const y0 = Math.floor(ty);
    const x1 = x0 + 1;
    const y1 = y0 + 1;
    const fx = tx - x0;
    const fy = ty - y0;
    const c00 = mip.getPixel(x0, y0);
    const c10 = mip.getPixel(x1, y0);
    const c01 = mip.getPixel(x0, y1);
    const c11 = mip.getPixel(x1, y1);
    const top = LerpColor(c00, c10, fx);
    const bottom = LerpColor(c01, c11, fx);
    return LerpColor(top, bottom, fy);
  } else {
    let texX = Math.floor(u * mip.resolutionWidth);
    let texY = Math.floor(v * mip.resolutionHeight);
    texX = Math.max(0, Math.min(texX, mip.resolutionWidth - 1));
    texY = Math.max(0, Math.min(texY, mip.resolutionHeight - 1));
    return mip.getPixel(texX, texY);
  }
}

function averageColors(colors: Color[]): Color {
  if (colors.length === 0) return { r: 0, g: 0, b: 0, a: 0 };
  let r = 0,
    g = 0,
    b = 0,
    a = 0;
  for (const c of colors) {
    r += c.r;
    g += c.g;
    b += c.b;
    a += c.a;
  }
  const n = colors.length;
  return { r: r / n, g: g / n, b: b / n, a: a / n };
}

export interface FilterStrategy {
  sample(
    u: number,
    v: number,
    dudx: number,
    dvdx: number,
    dudy: number,
    dvdy: number,
  ): Color;
}

export class NearestFilter implements FilterStrategy {
  constructor(private texture: Texture) {}
  sample(u: number, v: number): Color {
    return sampleMip(this.texture.getMip(0), u, v, false);
  }
}

export class BilinearFilter implements FilterStrategy {
  constructor(private texture: Texture) {}
  sample(u: number, v: number): Color {
    return sampleMip(this.texture.getMip(0), u, v, true);
  }
}

export class MipMapNearestFilter implements FilterStrategy {
  constructor(private texture: Texture) {}
  sample(
    u: number,
    v: number,
    dudx: number,
    dvdx: number,
    dudy: number,
    dvdy: number,
  ): Color {
    const level = computeMipLevel(
      { u, v, dudx, dvdx, dudy, dvdy } as PixelStep,
      this.texture.width,
      this.texture.height,
      this.texture.levelCount,
    );
    return sampleMip(this.texture.getMip(level), u, v, false);
  }
}

export class MipMapLinearFilter implements FilterStrategy {
  constructor(private texture: Texture) {}
  sample(
    u: number,
    v: number,
    dudx: number,
    dvdx: number,
    dudy: number,
    dvdy: number,
  ): Color {
    const lod = computeMipLOD(
      { u, v, dudx, dvdx, dudy, dvdy } as PixelStep,
      this.texture.width,
      this.texture.height,
    );
    const clampedLod = Math.max(
      0,
      Math.min(lod, this.texture.levelCount - 1),
    );
    const level0 = Math.floor(clampedLod);
    const level1 = Math.min(level0 + 1, this.texture.levelCount - 1);
    const frac = clampedLod - level0;
    const c0 = sampleMip(this.texture.getMip(level0), u, v, true);
    const c1 = sampleMip(this.texture.getMip(level1), u, v, true);
    return LerpColor(c0, c1, frac);
  }
}

export class AnisotropicFilter implements FilterStrategy {
  constructor(
    private texture: Texture,
    private maxAnisotropy: AnisotropyLevel,
  ) {}

  sample(
    u: number,
    v: number,
    dudx: number,
    dvdx: number,
    dudy: number,
    dvdy: number,
  ): Color {
    const step = { u, v, dudx, dvdx, dudy, dvdy } as PixelStep;
    const fp = computeFootprint(
      step,
      this.texture.width,
      this.texture.height,
      this.texture.levelCount,
      this.maxAnisotropy,
    );
    const level = computeAnisoMipLevel(
      step,
      this.texture.width,
      this.texture.height,
      this.texture.levelCount,
    );
    const mip = this.texture.getMip(level);
    const sampleCount = snapSampleCount(fp.anisotropyRatio, this.maxAnisotropy);
    const tw = this.texture.width;
    const th = this.texture.height;

    const colors: Color[] = [];
    for (let i = 0; i < sampleCount; i++) {
      const t =
        sampleCount === 1 ? 0 : i / (sampleCount - 1) - 0.5;
      const offsetTex = t * fp.majorAxisLength;
      const su =
        u + (fp.majorAxisDirTex.x * offsetTex) / tw;
      const sv =
        v + (fp.majorAxisDirTex.y * offsetTex) / th;
      colors.push(sampleMip(mip, su, sv, true));
    }
    return averageColors(colors);
  }
}

export type FilterMode =
  | "nearest"
  | "bilinear"
  | "mipmap_nearest"
  | "mipmap_linear"
  | "anisotropic";

export interface SampleLocation {
  u: number;
  v: number;
  mipLevel: number;
  weight: number;
}

export function getAnisotropicSampleLocations(
  step: PixelStep,
  texture: Texture,
  maxAnisotropy: AnisotropyLevel,
): SampleLocation[] {
  const fp = computeFootprint(
    step,
    texture.width,
    texture.height,
    texture.levelCount,
    maxAnisotropy,
  );
  const level = computeAnisoMipLevel(
    step,
    texture.width,
    texture.height,
    texture.levelCount,
  );
  const sampleCount = snapSampleCount(fp.anisotropyRatio, maxAnisotropy);
  const tw = texture.width;
  const th = texture.height;
  const locations: SampleLocation[] = [];

  for (let i = 0; i < sampleCount; i++) {
    const t = sampleCount === 1 ? 0 : i / (sampleCount - 1) - 0.5;
    const offsetTex = t * fp.majorAxisLength;
    locations.push({
      u: step.u + (fp.majorAxisDirTex.x * offsetTex) / tw,
      v: step.v + (fp.majorAxisDirTex.y * offsetTex) / th,
      mipLevel: level,
      weight: 1 / sampleCount,
    });
  }
  return locations;
}

export function getSampleLocations(
  filterMode: FilterMode,
  step: PixelStep,
  texture: Texture,
  maxAnisotropy: AnisotropyLevel,
): SampleLocation[] {
  const { u, v, dudx, dvdx, dudy, dvdy } = step;

  switch (filterMode) {
    case "nearest": {
      const mip = texture.getMip(0);
      const tx = Math.floor(u * mip.resolutionWidth);
      const ty = Math.floor(v * mip.resolutionHeight);
      return [
        {
          u: (tx + 0.5) / mip.resolutionWidth,
          v: (ty + 0.5) / mip.resolutionHeight,
          mipLevel: 0,
          weight: 1,
        },
      ];
    }
    case "bilinear": {
      const mip = texture.getMip(0);
      const tx = u * mip.resolutionWidth - 0.5;
      const ty = v * mip.resolutionHeight - 0.5;
      const corners = [
        [Math.floor(tx), Math.floor(ty)],
        [Math.floor(tx) + 1, Math.floor(ty)],
        [Math.floor(tx), Math.floor(ty) + 1],
        [Math.floor(tx) + 1, Math.floor(ty) + 1],
      ];
      return corners.map(([x, y]) => ({
        u: (x + 0.5) / mip.resolutionWidth,
        v: (y + 0.5) / mip.resolutionHeight,
        mipLevel: 0,
        weight: 0.25,
      }));
    }
    case "mipmap_nearest": {
      const level = computeMipLevel(
        step,
        texture.width,
        texture.height,
        texture.levelCount,
      );
      const mip = texture.getMip(level);
      const tx = Math.floor(u * mip.resolutionWidth);
      const ty = Math.floor(v * mip.resolutionHeight);
      return [
        {
          u: (tx + 0.5) / mip.resolutionWidth,
          v: (ty + 0.5) / mip.resolutionHeight,
          mipLevel: level,
          weight: 1,
        },
      ];
    }
    case "mipmap_linear": {
      const lod = computeMipLOD(step, texture.width, texture.height);
      const clampedLod = Math.max(
        0,
        Math.min(lod, texture.levelCount - 1),
      );
      const level0 = Math.floor(clampedLod);
      const level1 = Math.min(level0 + 1, texture.levelCount - 1);
      const frac = clampedLod - level0;
      const locs: SampleLocation[] = [];
      for (const level of [level0, level1]) {
        const mip = texture.getMip(level);
        const tx = u * mip.resolutionWidth - 0.5;
        const ty = v * mip.resolutionHeight - 0.5;
        const corners = [
          [Math.floor(tx), Math.floor(ty)],
          [Math.floor(tx) + 1, Math.floor(ty)],
          [Math.floor(tx), Math.floor(ty) + 1],
          [Math.floor(tx) + 1, Math.floor(ty) + 1],
        ];
        const w = level === level0 ? 1 - frac : frac;
        for (const [x, y] of corners) {
          locs.push({
            u: (x + 0.5) / mip.resolutionWidth,
            v: (y + 0.5) / mip.resolutionHeight,
            mipLevel: level,
            weight: w * 0.25,
          });
        }
      }
      return locs;
    }
    case "anisotropic":
      return getAnisotropicSampleLocations(step, texture, maxAnisotropy);
    default:
      return [];
  }
}

export function createFilter(
  mode: FilterMode,
  texture: Texture,
  maxAnisotropy: AnisotropyLevel = 16,
): FilterStrategy {
  switch (mode) {
    case "bilinear":
      return new BilinearFilter(texture);
    case "mipmap_nearest":
      return new MipMapNearestFilter(texture);
    case "mipmap_linear":
      return new MipMapLinearFilter(texture);
    case "anisotropic":
      return new AnisotropicFilter(texture, maxAnisotropy);
    default:
      return new NearestFilter(texture);
  }
}

export class Sampler {
  constructor(private filter: FilterStrategy) {}
  setFilter(filter: FilterStrategy) {
    this.filter = filter;
  }
  sample(u: number, v: number, dudx = 0, dvdx = 0, dudy = 0, dvdy = 0): Color {
    return this.filter.sample(u, v, dudx, dvdx, dudy, dvdy);
  }
}
