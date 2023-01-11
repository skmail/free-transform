import { Angle } from "../angle";
import { Mat } from "../matrix";

describe("matrix inverse", () => {
  it("inverse the matrix", () => {
    const matrix = Mat.multiply(
      Mat.translate(44, 25),
      Mat.rotate(Angle.radians(-40)),
      Mat.scale(1, 25)
    );

    expect(Mat.round(Mat.multiply(Mat.inverse(matrix), matrix), 1)).toEqual(
      Mat.identity()
    );
  });
});
