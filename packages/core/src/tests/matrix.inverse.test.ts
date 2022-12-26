import { toRadians } from "../angle";
import {
  identity,
  inverseAffine,
  matrixRotate,
  matrixScale,
  matrixTranslate,
  multiply,
  round,
} from "../matrix";
 
describe("matrix inverse", () => {
  it("inverse the matrix", () => {
    const matrix = multiply(
      matrixTranslate(44, 25),
      matrixRotate(toRadians(-40)),
      matrixScale(1, 25)
    );

    expect(round(multiply(inverseAffine(matrix), matrix), 1)).toEqual(
      identity()
    );
  });
});
