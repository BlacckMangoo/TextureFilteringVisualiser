export class Vec2 {
  x: number;
  y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
  Add(vec: Vec2): Vec2 {
    return new Vec2(this.x + vec.x, this.y + vec.y);
  }
  Dot(vec: Vec2): number {
    return this.x * vec.x + this.y * vec.y;
  }
  Cross(vec: Vec2): Vec2 {
    return new Vec2(this.x * vec.y, this.y * vec.x);
  }
}

export function Edge(a: Vec2, b: Vec2, p: Vec2): number {
  return (p.x - a.x) * (b.y - a.y) - (p.y - a.y) * (b.x - a.x);
}
