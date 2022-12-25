import { toRadians, wrapAngle } from "../angle";
import {
  identity,
  inverseAffine,
  matrixRotate,
  matrixScale,
  matrixTranslate,
  multiply,
  round
} from "../matrix";

import {
  scale,
  rotate,
  translate,
  compose,
  inverse,
  identity as _identity,
} from "transformation-matrix";

// import {} from "transformation-matrix"
describe("matrix inverse", () => {
  it("inverse the matrix", () => {
    const matrix = multiply(
      matrixTranslate(15, 0),
      matrixRotate(wrapAngle(toRadians(-40))),
      matrixScale(1, 25)
    );

    const matrix2 = compose(
      translate(15, 0),
      rotate(toRadians(-40)),
      scale(1, 25)
    );

    const inv1 = inverseAffine(matrix);
    const inv2 = inverse(matrix2);
    console.log(
      inv2,
      {
        a: inv1[0][0],
        b: inv1[0][1],
        c: inv1[1][0],
        d: inv1[1][1],
        e: inv1[0][3],
        f: inv1[1][3],
      },
      compose(inverse(matrix2), matrix2),
      multiply(inv1, matrix)
    );

    expect(round(multiply(inverseAffine(matrix), matrix), 2)).toEqual(
      identity()
    );
  });
});
