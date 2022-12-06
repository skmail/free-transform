import { Matrix, Point, Tuple } from "@free-transform/core";

interface BaseElement {
  id: string,
  
  x: number;
  y: number;

  width: number;
  height: number;

  matrix: Matrix;
  warp?: Tuple<Point, 4>;

  locked?: boolean;
  disabledScale?: boolean;
}

interface ImageElement extends BaseElement {
  type: "image";
  src: string;
}

interface TextElement extends BaseElement {
  type: "text";
  text: string;
}

export type Element = ImageElement | TextElement;

export interface Workspace {
  width: number;
  height: number;
  perspectiveGrid: number;
  perspectiveGridWidth: number;
  perspectiveGridColor: string;
  precision: number;
}
