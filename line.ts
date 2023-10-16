type Point = { x: number, y: number };

export class Line {
  x1: number; y1: number; x2: number; y2: number;
  constructor(x1: number, y1: number, x2: number, y2: number) {
    this.x1 = x1; this.y1 = y1; this.x2 = x2; this.y2 = y2;
  }

  pointInSection(p: Point): boolean {
    // Check if p is in the section created by (x1, y1) and (x2, y2)
    // x1<=x<=x2 and y1<=y<=y2 in case of x1<x2 and y1<y2
    return (
      p.x >= Math.min(this.x1, this.x2) 
      && p.y >= Math.min(this.y1, this.y2)
      && p.x <= Math.max(this.x1, this.x2)  
      && p.y <= Math.max(this.y1, this.y2)
    );
  }

  static isParallel(l1: Line, l2: Line): boolean {
    let slope1 = (l1.y2 - l1.y1) / (l1.x2 - l1.x1);
    let slope2 = (l2.y2 - l2.y1) / (l2.x2 - l2.x1);

    // allow some error
    return Math.abs(slope1 - slope2) < 0.0001;
  }

  static findIntersection(l1: Line, l2: Line): [boolean, Point] {
    /* 
    In PSM, we want intersection of two lines.
    However, the intersection have to fulfill following condition
    If a Line l1 is created from section created by point (x1, y1) and (x2, y2),
    the intersection has to be in the section.
    */

    // Parallel lines do not have intersection.
    if (this.isParallel(l1,l2)) return [false, { x: 0, y: 0 }];

    // Find the intersection point.
    // https://en.wikipedia.org/wiki/Line%E2%80%93line_intersection
    let x = (
      (l1.x1 * l1.y2 - l1.y1 * l1.x2) * (l2.x1 - l2.x2) 
      - (l1.x1 - l1.x2) * (l2.x1 * l2.y2 - l2.y1 * l2.x2)
    ) / (
      (l1.x1 - l1.x2) * (l2.y1 - l2.y2) 
      - (l1.y1 - l1.y2) * (l2.x1 - l2.x2)
    );

    let y = (
      (l1.x1 * l1.y2 - l1.y1 * l1.x2) * (l2.y1 - l2.y2) 
      - (l1.y1 - l1.y2) * (l2.x1 * l2.y2 - l2.y1 * l2.x2)
    ) / (
      (l1.x1 - l1.x2) * (l2.y1 - l2.y2) 
      - (l1.y1 - l1.y2) * (l2.x1 - l2.x2)
    );

    let p = { x, y };

    return [l1.pointInSection(p) && l2.pointInSection(p), p];
  }
}
