import { toRadians, wrapAngle } from "../angle";
import {
  createMatrixFromParams,
  identity,
  inverseAffine,
  multiply,
} from "../matrix";
describe("matrix inverse", () => {
  it("inverse the matrix", () => {
    const matrix = createMatrixFromParams({
      scaleX: 1.5,
      scaleY: 1.5,
      angle: wrapAngle(toRadians(360)),
    });

    expect(multiply(inverseAffine(matrix), matrix)).toEqual(identity());
  });
});
