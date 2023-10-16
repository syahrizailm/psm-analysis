import { expect, test } from '@jest/globals';
import { Line } from "./line";

test('findIntersection line', () => {
  // Parallel
  let l1 = new Line(0, 0, 1, 1);
  let l2 = new Line(0, 1, 1, 2);
  let [exist, p] = Line.findIntersection(l1, l2);
  expect(exist).toBeFalsy();

  // Intersect, inside section
  l1 = new Line(0, 0, 1, 1);
  l2 = new Line(0, 1, 1, 0);
  [exist, p] = Line.findIntersection(l1, l2);
  expect(exist).toBeTruthy();
  expect(p.x).toBeCloseTo(0.5);
  expect(p.y).toBeCloseTo(0.5);

  // Intersect, inside section
  l1 = new Line(200, 0.472, 250, 0.139);
  l2 = new Line(200, 0.056, 250, 0.167);
  [exist, p] = Line.findIntersection(l1, l2);
  expect(exist).toBeTruthy();
  expect(p.x).toBeCloseTo(27400/111);

  // Intersect, outside section
  l1 = new Line(50, 0, 100, 0);
  l2 = new Line(50, 100, 100, 0.972);
  [exist, p] = Line.findIntersection(l1, l2);
  expect(exist).toBeFalsy();

  // Intersect, outside section
  l1 = new Line(0, 0, 10, 10);
  l2 = new Line(0,10, 1, 9);
  [exist, p] = Line.findIntersection(l1, l2);
  expect(exist).toBeFalsy();
  expect(p.x).toBeCloseTo(5);
  expect(p.y).toBeCloseTo(5);

  // Intersect, outside section
  l2 = new Line(0, 0, 10, 10);
  l1 = new Line(0,10, 1, 9);
  [exist, p] = Line.findIntersection(l1, l2);
  expect(exist).toBeFalsy();
  expect(p.x).toBeCloseTo(5);
  expect(p.y).toBeCloseTo(5);
})
