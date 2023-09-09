import {
  Mat,
  Matrix,
  Point,
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
};

type ContextType = Props & {
  finalMatrix: Matrix;
  perspectiveMatrix: Matrix;
};

const Context = createContext<ContextType>({} as ContextType);

export function FreeTransform({ children, ...rest }: PropsWithChildren<Props>) {
  const perspectiveMatrix = useMemo(() => {
    
    return makePerspectiveMatrix(
      makeWarpPoints(rest.width, rest.height),
      rest.warp || makeWarpPoints(rest.width, rest.height)
    );
  }, [rest.warp, rest.width, rest.height]);

  const finalMatrix = useMemo(() => {
    return Mat.multiply(rest.matrix, perspectiveMatrix);
  }, [perspectiveMatrix, rest.matrix]);

  
  return (
    <Context.Provider
      value={{
        ...rest,
        finalMatrix,
        perspectiveMatrix,
      }}
    >
      {children}
    </Context.Provider>
  );
}

export const useFreeTransform = () => useContext(Context);
