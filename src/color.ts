export interface Color {
  r: number;
  g: number;
  b: number;
  a: number;
}

export const Red: Color = { r: 255, g: 0, b: 0, a: 255 };
export const Black: Color = { r: 0, g: 0, b: 0, a: 255 };
export const White: Color = { r: 255, g: 255, b: 255, a: 255 };
export const Yellow: Color = { r: 255, g: 255, b: 0, a: 255 };
export const Cyan: Color = { r: 0, g: 255, b: 255, a: 255 };
export const Magenta: Color = { r: 255, g: 0, b: 255, a: 255 };
export const Transparent: Color = { r: 0, g: 0, b: 0, a: 0 };

export function Lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function LerpColor(a: Color, b: Color, t: number): Color {
  return {
    r: Lerp(a.r, b.r, t),
    g: Lerp(a.g, b.g, t),
    b: Lerp(a.b, b.b, t),
    a: Lerp(a.a, b.a, t),
  };
}
