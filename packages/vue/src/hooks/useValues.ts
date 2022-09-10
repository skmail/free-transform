import {
  decompose,
  makeWarpPoints,
  Matrix,
  Point,
  Tuple,
} from "@free-transform/core";
import { computed, ToRefs } from "vue";

import {
  makePerspectiveMatrix,
  inverseAffine,
  multiply,
  matrixScale,
  matrixTranslate,
} from "@free-transform/core";

type Props = ToRefs<{
  x: number;
  y: number;
  width: number;
  height: number;
  matrix: Matrix;
  warp: Tuple<Point, 4> | undefined;
  disabledScale: boolean;
}>;

export function useValues(props: Props) {
  const decomposedAffineMatrix = computed(() => decompose(props.matrix.value));

  const width = computed(() =>
    props.disabledScale.value
      ? props.width.value * decomposedAffineMatrix.value.scale.sx
      : props.width.value
  );

  const height = computed(() =>
    props.disabledScale.value
      ? props.height.value * decomposedAffineMatrix.value.scale.sy
      : props.height.value
  );

  const warpPoints = computed(() => {
    if (!props.warp.value) {
      return makeWarpPoints(width.value, height.value);
    }
    if (props.disabledScale.value) {
      return props.warp.value.map((point) => [
        point[0] * decomposedAffineMatrix.value.scale.sx,
        point[1] * decomposedAffineMatrix.value.scale.sy,
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
      const inverted = decompose(inverseAffine(props.matrix.value));

      mat = multiply(
        props.matrix.value,
        matrixScale(
          inverted.scale.sx * Math.sign(decomposedAffineMatrix.value.scale.sx),
          inverted.scale.sy * Math.sign(decomposedAffineMatrix.value.scale.sy)
        )
      );
    }

    return multiply(mat, perspectiveMatrix.value);
  });

  const translatedMatrix = computed(() =>
    multiply(matrixTranslate(props.x.value, props.y.value), finalMatrix.value)
  );

  return {
    x:props.x,
    y:props.y,
    width,
    height,
    warpPoints,
    affineMatrix: props.matrix,
    perspectiveMatrix,
    matrix: finalMatrix,
    translatedMatrix,
  };
}
