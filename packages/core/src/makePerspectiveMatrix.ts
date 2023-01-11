import { Mat } from "./matrix";
import { Matrix, Point, Tuple } from "./types";

export function makePerspectiveMatrix(
  src: Tuple<Point, 4>,
  dest: Tuple<Point, 4>
): Matrix {
  const A = [];

  for (let i = 0; i < 4; i++) {
    A.push(
      [
        src[i][0],
        src[i][1],

        1,
        0,

        0,
        0,

        -src[i][0] * dest[i][0],
        -src[i][1] * dest[i][0],
      ],
      [
        0,
        0,

        0,
        src[i][0],

        src[i][1],
        1,

        -src[i][0] * dest[i][1],
        -src[i][1] * dest[i][1],
      ]
    );
  }

  const h = Mat.luSolve(
    Mat.lu(A as Tuple<Tuple<number, 8>, 8>),
    dest.reduce<number[]>((acc, dest) => [...acc, ...dest], [])
  );

  const H: Matrix = [
    [h[0], h[1], 0, h[2]],
    [h[3], h[4], 0, h[5]],
    [0, 0, 1, 0],
    [h[6], h[7], 0, 1],
  ];

  return H;
}
