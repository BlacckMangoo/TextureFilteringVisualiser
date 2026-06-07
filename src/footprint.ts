import { PixelStep } from "./stepper";

export type AnisotropyLevel = 1 | 2 | 4 | 8 | 16|32;

export interface FootprintInfo {
  dx: { u: number; v: number };
  dy: { u: number; v: number };
  footprintWidth: number;
  footprintHeight: number;
  majorAxisLength: number;
  minorAxisLength: number;
  anisotropyRatio: number;
  computedLOD: number;
  selectedMip: number;
  majorIsX: boolean;
  majorAxisDirTex: { x: number; y: number };
  minorAxisDirTex: { x: number; y: number };
  sampleCount: number;
}

const ANISO_LEVELS: AnisotropyLevel[] = [1, 2, 4, 8, 16,32];

export function snapSampleCount(
  ratio: number,
  maxAnisotropy: AnisotropyLevel,
): number {
  const effective = Math.min(Math.max(ratio, 1), maxAnisotropy);
  let count: AnisotropyLevel = 1;
  for (const level of ANISO_LEVELS) {
    if (level <= effective) count = level;
    else break;
  }
  return count;
}

export function computeFootprint(
  step: PixelStep,
  texWidth: number,
  texHeight: number,
  mipCount: number,
  maxAnisotropy: AnisotropyLevel = 16,
): FootprintInfo {
  const dx = { u: step.dudx, v: step.dvdx };
  const dy = { u: step.dudy, v: step.dvdy };

  const dudxT = step.dudx * texWidth;
  const dvdxT = step.dvdx * texHeight;
  const dudyT = step.dudy * texWidth;
  const dvdyT = step.dvdy * texHeight;

  const footprintWidth = Math.sqrt(dudxT ** 2 + dvdxT ** 2);
  const footprintHeight = Math.sqrt(dudyT ** 2 + dvdyT ** 2);

  const majorAxisLength = Math.max(footprintWidth, footprintHeight);
  const minorAxisLength = Math.max(
    Math.min(footprintWidth, footprintHeight),
    1e-6,
  );
  const anisotropyRatio = majorAxisLength / minorAxisLength;
  const computedLOD = Math.log2(Math.max(majorAxisLength, 1e-6));
  const selectedMip = Math.max(
    0,
    Math.min(Math.round(computedLOD), mipCount - 1),
  );

  const majorIsX = footprintWidth >= footprintHeight;
  const majorLen = majorAxisLength;
  const minorLen = Math.max(
    majorIsX ? footprintHeight : footprintWidth,
    1e-6,
  );

  const majorAxisDirTex = {
    x: (majorIsX ? dudxT : dudyT) / majorLen,
    y: (majorIsX ? dvdxT : dvdyT) / majorLen,
  };
  const minorAxisDirTex = {
    x: (majorIsX ? dudyT : dudxT) / minorLen,
    y: (majorIsX ? dvdyT : dvdxT) / minorLen,
  };

  return {
    dx,
    dy,
    footprintWidth,
    footprintHeight,
    majorAxisLength,
    minorAxisLength,
    anisotropyRatio,
    computedLOD,
    selectedMip,
    majorIsX,
    majorAxisDirTex,
    minorAxisDirTex,
    sampleCount: snapSampleCount(anisotropyRatio, maxAnisotropy),
  };
}

export function computeMipLOD(
  step: PixelStep,
  texWidth: number,
  texHeight: number,
): number {
  const lenX = Math.sqrt((step.dudx * texWidth) ** 2 + (step.dvdx * texHeight) ** 2);
  const lenY = Math.sqrt((step.dudy * texWidth) ** 2 + (step.dvdy * texHeight) ** 2);
  return Math.log2(Math.max(Math.max(lenX, lenY), 1e-6));
}

export function computeMipLevel(
  step: PixelStep,
  texWidth: number,
  texHeight: number,
  mipCount: number,
): number {
  const lod = computeMipLOD(step, texWidth, texHeight);
  return Math.max(0, Math.min(Math.round(lod), mipCount - 1));
}

export function computeAnisoMipLevel(
  step: PixelStep,
  texWidth: number,
  texHeight: number,
  mipCount: number,
): number {
  const fp = computeFootprint(step, texWidth, texHeight, mipCount);
  const lod = Math.log2(Math.max(fp.minorAxisLength, 1e-6));
  return Math.max(0, Math.min(Math.floor(lod), mipCount - 1));
}
