import {
  Mat,
  makeWarpPoints,
  Matrix,
  Point,
  Tuple,
  makePerspectiveMatrix,
} from "@free-transform/core";
import { computed, ToRefs } from "vue";

type Props = ToRefs<{
  x: number;
  y: number;
  width: number;
  height: number;
  matrix: Matrix;
  warp: Tuple<Point, 4> | undefined;
  disabledScale: boolean | undefined;
}>;

export function useValues(props: Props) {
  const decomposedAffineMatrix = computed(() =>
    Mat.decompose(props.matrix.value)
  );

  const width = computed(() =>
    props.disabledScale.value
      ? props.width.value * decomposedAffineMatrix.value.scale[0]
      : props.width.value
  );

  const height = computed(() =>
    props.disabledScale.value
      ? props.height.value * decomposedAffineMatrix.value.scale[1]
      : props.height.value
  );

  const warpPoints = computed(() => {
    if (!props.warp.value) {
      return makeWarpPoints(width.value, height.value);
    }
    if (props.disabledScale.value) {
      return props.warp.value.map((point) => [
        point[0] * decomposedAffineMatrix.value.scale[0],
        point[1] * decomposedAffineMatrix.value.scale[1],
      ]) as Tuple<Point, 4>;
    }
    return props.warp.value;
  });

  const perspectiveMatrix = computed(() =>
    makePerspectiveMatrix(
      makeWarpPoints(width.value, height.value),
      warpPoints.value
    )
  );

  const finalMatrix = computed(() => {
    let mat = props.matrix.value;
 
    if (props.disabledScale.value) {
      mat = Mat.multiply(
        props.matrix.value,
        Mat.inverse(
          Mat.scale(
            decomposedAffineMatrix.value.scale[0],
            decomposedAffineMatrix.value.scale[1]
          )
        )
      );
    }

    return Mat.multiply(mat, perspectiveMatrix.value);
  });

  const translatedMatrix = computed(() =>
    Mat.multiply(Mat.translate(props.x.value, props.y.value), finalMatrix.value)
  );

  return {
    x: props.x,
    y: props.y,
    width,
    height,
    warpPoints,
    affineMatrix: props.matrix,
    perspectiveMatrix,
    matrix: finalMatrix,
    translatedMatrix,
  };
}
