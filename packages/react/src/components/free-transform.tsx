import {
  DecomposedMatrix,
  Mat,
  Matrix,
  OnSnap,
  Point,
  SnapPoint,
  SnapPoints,
  Tuple,
  makePerspectiveMatrix,
  makeWarpPoints,
} from "@free-transform/core";
import { PropsWithChildren, createContext, useContext, useMemo } from "react";

type Props = {
  matrix: Matrix;
  x: number;
  y: number;
  width: number;
  height: number;
  onUpdate(data: any): void;
  offset?: Point;
  warp?: Tuple<Point, 4>;
  snap?: SnapPoints;
  onSnap?: OnSnap;
};

type ContextType = Props & {
  finalMatrix: Matrix;
  perspectiveMatrix: Matrix;
  rotationMatrix: Matrix;
  decomposedMatrix: DecomposedMatrix;
};

const Context = createContext<ContextType>({} as ContextType);

export function FreeTransform({ children, ...rest }: PropsWithChildren<Props>) {
  const perspectiveMatrix = useMemo(
    () =>
      makePerspectiveMatrix(
        makeWarpPoints(rest.width, rest.height),
        rest.warp || makeWarpPoints(rest.width, rest.height)
      ),
    [rest.warp, rest.width, rest.height]
  );

  const finalMatrix = useMemo(
    () => Mat.multiply(rest.matrix, perspectiveMatrix),
    [perspectiveMatrix, rest.matrix]
  );

  const decomposedMatrix = useMemo(
    () => Mat.decompose(rest.matrix),
    [rest.matrix]
  );

  const rotationMatrix = useMemo(
    () =>
      Mat.multiply(
        rest.matrix,
        Mat.inverse(
          Mat.scale(
            decomposedMatrix.scale[0] * Math.sign(decomposedMatrix.scale[0]),
            decomposedMatrix.scale[1] * Math.sign(decomposedMatrix.scale[1])
          )
        )
      ),
    [rest.matrix, decomposedMatrix]
  );

  return (
    <Context.Provider
      value={{
        ...rest,
        finalMatrix,
        perspectiveMatrix,
        rotationMatrix,
        decomposedMatrix,
      }}
    >
      {children}
    </Context.Provider>
  );
}

export const useFreeTransform = () => useContext(Context);
