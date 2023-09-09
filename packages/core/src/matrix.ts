import { Tuple, LUP, Matrix, Point } from "./types";

// @url https://cdnjs.cloudflare.com/ajax/libs/numeric/1.2.6/numeric.js
function lu(A: Array<number[]>): LUP {
  A = clone(A);
  const n = A.length;
  const n1 = n - 1;
  const P = new Array<number>(n);

  for (let k = 0; k < n; ++k) {
    let Ak = A[k];
    let Pk = k;
    let max = Math.abs(Ak[k]);
    for (let j = k + 1; j < n; ++j) {
      const absAjk = Math.abs(A[j][k]);
      if (max < absAjk) {
        max = absAjk;
        Pk = j;
      }
    }
    P[k] = Pk;

    if (Pk != k) {
      A[k] = A[Pk];
      A[Pk] = Ak;
      Ak = A[k];
    }

    const Akk = Ak[k];

    for (let i = k + 1; i < n; ++i) {
      A[i][k] /= Akk;
    }

    for (let i = k + 1; i < n; ++i) {
      const Ai = A[i];
      let j;
      for (j = k + 1; j < n1; ++j) {
        Ai[j] -= Ai[k] * Ak[j];
        ++j;
        Ai[j] -= Ai[k] * Ak[j];
      }
      if (j === n1) Ai[j] -= Ai[k] * Ak[j];
    }
  }

  return {
    LU: A,
    P,
  };
}

function luSolve(lu: LUP, b: number[]): Tuple<number, 8> {
  var LU = lu.LU;
  var n = LU.length;
  var x = clone(b);
  var P = lu.P;

  for (let i = n - 1; i !== -1; --i) {
    x[i] = b[i];
  }

  for (let i = 0; i < n; ++i) {
    const Pi = P[i];
    const LUi = LU[i];
    if (P[i] !== i) {
      const tmp = x[i];
      x[i] = x[Pi];
      x[Pi] = tmp;
    }

    for (let j = 0; j < i; ++j) {
      x[i] -= x[j] * LUi[j];
    }
  }

  for (let i = n - 1; i >= 0; --i) {
    const LUi = LU[i];
    for (let j = i + 1; j < n; ++j) {
      x[i] -= x[j] * LUi[j];
    }

    x[i] /= LUi[i];
  }

  return x as Tuple<number, 8>;
}

function clone<T>(a: T): T {
  if (Array.isArray(a)) {
    return a.map((a) => clone(a)) as T;
  }
  return a;
}

function identity(): Matrix {
  return [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ];
}

function transpose(a: Matrix) {
  return a[0].map((_, i) => a.map((y) => y[i]));
}

function dotProduct(a: number[], b: number[]): number {
  return a.map((_, i) => a[i] * b[i]).reduce((m, n) => m + n);
}

function _multiply(a: Matrix, b: Matrix): Matrix {
  return a.map((x) => transpose(b).map((y) => dotProduct(x, y))) as Matrix;
}

function multiply(...matrices: Matrix[]): Matrix {
  let result = identity();

  for (let matrix of matrices) {
    result = _multiply(result, matrix);
  }

  return result;
}

function applyToPoint(matrix: Matrix, point: Point): Point {
  const vector = getVector(matrix, point);
  return [vector[0] / vector[2], vector[1] / vector[2]];
}

function applyToPoints(matrix: Matrix, points: Point[]): Point[] {
  return points.map((point) => applyToPoint(matrix, point));
}

function getVector(matrix: Matrix, point: Point = [0, 0]) {
  const x = matrix[0][0] * point[0] + matrix[0][1] * point[1] + matrix[0][3];
  const y = matrix[1][0] * point[0] + matrix[1][1] * point[1] + matrix[1][3];
  const w = matrix[3][0] * point[0] + matrix[3][1] * point[1] + matrix[3][3];
  return [x, y, w];
}

function matrixTranslate(tx: number, ty: number): Matrix {
  return [
    [1, 0, 0, tx],
    [0, 1, 0, ty],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ];
}

function matrixRotate(radians: number, origin?: Point) {
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  const matrix: Matrix = [
    [cos, -sin, 0, 0],
    [sin, cos, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ];

  if (!origin) {
    return matrix;
  }

  return multiply(
    matrixTranslate(origin[0], origin[1]),
    matrix,
    matrixTranslate(-origin[0], -origin[1])
  );
}

function matrixScale(sx: number, sy: number, origin?: Point) {
  const matrix: Matrix = [
    [sx, 0, 0, 0],
    [0, sy, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ];

  if (!origin) {
    return matrix;
  }

  return multiply(
    matrixTranslate(origin[0], origin[1]),
    matrix,
    matrixTranslate(-origin[0], -origin[1])
  );
}
function createFromParams({
  scaleX = 1,
  scaleY = 1,
  angle = 0,
  width = 0,
  height = 0,
} = {}) {
  return multiply(
    matrixRotate(angle, [width / 2, height / 2]),
    matrixScale(scaleX, scaleY)
  );
}

// @url https://github.com/chrvadala/transformation-matrix/blob/main/src/inverse.js
// http://www.wolframalpha.com/input/?i=Inverse+%5B%7B%7Ba,c,e%7D,%7Bb,d,f%7D,%7B0,0,1%7D%7D%5D

function inverseAffine(matrix: Matrix): Matrix {
  const a = matrix[0][0];
  const b = matrix[0][1];

  const c = matrix[1][0];
  const d = matrix[1][1];

  const e = matrix[0][3];
  const f = matrix[1][3];

  const determinant = a * d - b * c;

  return [
    [d / determinant, -b / determinant, 0, (d * e - b * f) / -determinant],
    [-c / determinant, a / determinant, 0, (c * e - a * f) / determinant],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ];
}

// @url https://github.com/chrvadala/transformation-matrix/blob/main/src/decompose.js
function decompose(matrix: Matrix) {
  const result = {
    scale: [1, 1],
    rotation: 0,
    translate: [0, 0]
  };
  const [[sx, rx], [ry, sy]] = matrix;

  if (sx !== 0 || ry !== 0) {
    const hypotAc = Math.hypot(sx, ry);
    result.scale[0] = hypotAc;
    result.scale[1] = (sx * sy - rx * ry) / hypotAc;
    const acos = Math.acos(sx / hypotAc);
    result.rotation = ry > 0 ? -acos : acos;
  } else if (rx !== 0 || sy !== 0) {
    const hypotBd = Math.hypot(rx, sy);
    result.scale[0] = (sx * sy - rx * ry) / hypotBd;
    result.scale[1] = hypotBd;
    const acos = Math.acos(ry / hypotBd);
    result.rotation = Math.PI / 2 + (sy > 0 ? -acos : acos);
  }

  result.translate[0] = matrix[0][3]
  result.translate[1] = matrix[1][3]
  
  // console.log(result.scale, decompose2(matrix).scale);
  return result
  // return decompose2(matrix);
}

// @url https://github.com/chrvadala/transformation-matrix/blob/main/src/decompose.js
function decompose2(matrix: Matrix) {
  const result = {
    scale: [1, 1],
    rotation: 0,
    translate: [0, 0],
    skew: [0, 0],
  };

  let m11 = matrix[0][0];
  let m21 = matrix[1][0];
  let m12 = matrix[0][1];
  let m22 = matrix[1][1];

  let determinant = m11 * m22 - m12 * m21;
  if (determinant == 0) return result;

  result.translate[0] = matrix[0][3];
  result.translate[1] = matrix[1][3];

  if (determinant < 0) {
    if (m11 < m22) {
      result.scale[0] *= -1;
    } else {
      result.scale[1] *= -1;
    }
  }

  result.scale[0] *= Math.sqrt(m11 * m11 + m12 * m12);
  m11 /= result.scale[0];
  m12 /= result.scale[0];

  let scaledShear = m11 * m21 + m12 * m22;
  m21 -= m11 * scaledShear;
  m22 -= m12 * scaledShear;

  result.scale[1] *= Math.sqrt(m21 * m21 + m22 * m22);
  m21 /= result.scale[1];
  m22 /= result.scale[1];
  result.skew[0] = scaledShear / result.scale[1];

  result.rotation = Math.atan2(m12, m11);

  return result;
}

function roundMatrix(matrix: Matrix, precision = 10000000000) {
  return matrix.map((row) => row.map((value) => round(value, precision)));
}

function round(value: number, precision = 10000000000) {
  return Math.round(value * precision) / precision;
}

export const Mat = {
  lu,
  luSolve,
  decompose,

  identity,
  transpose,
  multiply,
  toPoint: applyToPoint,
  toPoints: applyToPoints,

  rotate: matrixRotate,
  scale: matrixScale,
  translate: matrixTranslate,
  inverse: inverseAffine,

  round: roundMatrix,
  fromParams: createFromParams,
};
