function lu(A) {
  A = clone(A);
  const n = A.length;
  const n1 = n - 1;
  const P = new Array(n);
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
      if (j === n1)
        Ai[j] -= Ai[k] * Ak[j];
    }
  }
  return {
    LU: A,
    P
  };
}
function luSolve(lu2, b) {
  var LU = lu2.LU;
  var n = LU.length;
  var x = clone(b);
  var P = lu2.P;
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
  return x;
}
function clone(a) {
  if (Array.isArray(a)) {
    return a.map((a2) => clone(a2));
  }
  return a;
}
function identity() {
  return [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1]
  ];
}
function transpose(a) {
  return a[0].map((_, i) => a.map((y) => y[i]));
}
function dotProduct(a, b) {
  return a.map((_, i) => a[i] * b[i]).reduce((m, n) => m + n);
}
function multiply(a, b) {
  return a.map((x) => transpose(b).map((y) => dotProduct(x, y)));
}
function multiplies(...matrices) {
  let result = identity();
  for (let matrix of matrices) {
    result = multiply(result, matrix);
  }
  return result;
}
function applyToPoint(matrix, point) {
  const vector = getVector(matrix, point);
  return [vector[0] / vector[2], vector[1] / vector[2]];
}
function applyToPoints(matrix, points) {
  return points.map((point) => applyToPoint(matrix, point));
}
function getVector(matrix, point = [0, 0]) {
  const x = matrix[0][0] * point[0] + matrix[0][1] * point[1] + matrix[0][3];
  const y = matrix[1][0] * point[0] + matrix[1][1] * point[1] + matrix[1][3];
  const w = matrix[3][0] * point[0] + matrix[3][1] * point[1] + matrix[3][3];
  return [x, y, w];
}
function matrixTranslate(tx, ty) {
  return [
    [1, 0, 0, tx],
    [0, 1, 0, ty],
    [0, 0, 1, 0],
    [0, 0, 0, 1]
  ];
}
function matrixRotate(radians, origin) {
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  const matrix = [
    [cos, -sin, 0, 0],
    [sin, cos, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1]
  ];
  if (!origin) {
    return matrix;
  }
  return multiplies(
    matrixTranslate(origin[0], origin[1]),
    matrix,
    matrixTranslate(-origin[0], -origin[1])
  );
}
function matrixScale(sx, sy, origin) {
  const matrix = [
    [sx, 0, 0, 0],
    [0, sy, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1]
  ];
  if (!origin) {
    return matrix;
  }
  return multiplies(
    matrixTranslate(origin[0], origin[1]),
    matrix,
    matrixTranslate(-origin[0], -origin[1])
  );
}
function createMatrixFromParams({
  scaleX = 1,
  scaleY = 1,
  angle = 0,
  width = 0,
  height = 0
} = {}) {
  return multiply(
    matrixScale(scaleX, scaleY),
    matrixRotate(angle, [width / 2, height / 2])
  );
}
function inverseAffine(matrix) {
  const denominator = matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
  return [
    [
      matrix[1][1] / denominator,
      matrix[0][1] / -denominator,
      0,
      (matrix[1][1] * matrix[0][3] - matrix[1][0] * matrix[1][3]) / -denominator
    ],
    [
      matrix[1][0] / -denominator,
      matrix[0][0] / denominator,
      0,
      (matrix[0][1] * matrix[0][3] - matrix[0][0] * matrix[1][3]) / denominator
    ],
    [0, 0, 1, 0],
    [0, 0, 0, 1]
  ];
}
function decompose(matrix) {
  const result = {
    scale: {
      sx: 0,
      sy: 0
    },
    rotation: {
      angle: 0
    }
  };
  const [[sx, rx], [ry, sy]] = matrix;
  if (sx !== 0 || ry !== 0) {
    const hypotAc = Math.hypot(sx, ry);
    result.scale.sx = hypotAc;
    result.scale.sy = (sx * sy - rx * ry) / hypotAc;
    const acos = Math.acos(sx / hypotAc);
    result.rotation.angle = ry > 0 ? -acos : acos;
  } else if (rx !== 0 || sx !== 0) {
    const hypotBd = Math.hypot(rx, sy);
    result.scale.sx = (sx * sy - rx * ry) / hypotBd;
    result.scale.sy = hypotBd;
    const acos = Math.acos(ry / hypotBd);
    result.rotation.angle = Math.PI / 2 + (sy > 0 ? -acos : acos);
  }
  return result;
}
const minMax = (points) => {
  const bounds = points.reduce(
    (bounds2, point) => {
      bounds2.xmin = Math.min(bounds2.xmin, point[0]);
      bounds2.xmax = Math.max(bounds2.xmax, point[0]);
      bounds2.ymin = Math.min(bounds2.ymin, point[1]);
      bounds2.ymax = Math.max(bounds2.ymax, point[1]);
      return bounds2;
    },
    {
      xmin: Infinity,
      xmax: -Infinity,
      ymin: Infinity,
      ymax: -Infinity
    }
  );
  return {
    ...bounds,
    width: bounds.xmax - bounds.xmin,
    height: bounds.ymax - bounds.ymin
  };
};
function makeWarpPoints(width, height) {
  return [
    [0, 0],
    [0, height],
    [width, 0],
    [width, height]
  ];
}
const getAngle = (p1, p2 = [0, 0]) => Math.atan2(p2[1] - p1[1], p1[0] - p2[0]);
const toRadians = (degree) => degree * (Math.PI / 180);
const toDegree = (radians) => radians * (180 / Math.PI);
const getPointAtAngle = ([x, y], radians) => {
  const sin = Math.sin(radians);
  const cos = Math.cos(radians);
  return [x * cos + y * sin, y * cos - x * sin];
};
function call(callback, ...args) {
  if (callback) {
    callback(...args);
  }
}
function value(descriptor, ...args) {
  if (typeof descriptor === "function") {
    return descriptor(...args);
  }
  return descriptor;
}
function clamp(number, min, max) {
  return Math.max(min, Math.min(number, max));
}
const getDistance = (p2, p1) => {
  return Math.sqrt(
    (p1[0] - p2[0]) * (p1[0] - p2[0]) + (p1[1] - p2[1]) * (p1[1] - p2[1])
  );
};
function scale(scaleType, {
  start,
  width,
  height,
  fromCenter = () => false,
  aspectRatio = () => false,
  matrix,
  affineMatrix,
  perspectiveMatrix,
  scaleLimit
}, onUpdate) {
  const decomposed = decompose(affineMatrix);
  const bounds = minMax(applyToPoints(matrix, makeWarpPoints(width, height)));
  const radians = decomposed.rotation.angle;
  const startPoint = [start[0], start[1]];
  return (event) => {
    const opposite = value(fromCenter, event) ? [0.5, 0.5] : [1 - scaleType[0], 1 - scaleType[1]];
    const movePoint = [event.clientX, event.clientY];
    let moveDiff = getPointAtAngle(
      [movePoint[0] - startPoint[0], movePoint[1] - startPoint[1]],
      -radians
    );
    moveDiff[0] /= decomposed.scale.sx;
    moveDiff[1] /= decomposed.scale.sy;
    const px1 = applyToPoint(perspectiveMatrix, [
      width * scaleType[0],
      height * scaleType[1]
    ]);
    const px2 = applyToPoint(perspectiveMatrix, [
      width * opposite[0],
      height * opposite[1]
    ]);
    const newScale = [1, 1];
    if (scaleType[0] === 0 || scaleType[0] === 1) {
      newScale[0] = (px1[0] + moveDiff[0] - px2[0]) / (px1[0] - px2[0]);
    }
    if (scaleType[1] === 0 || scaleType[1] === 1) {
      newScale[1] = (px1[1] + moveDiff[1] - px2[1]) / (px1[1] - px2[1]);
    }
    const absoluteOrigin = applyToPoint(perspectiveMatrix, [
      width * opposite[0],
      height * opposite[1]
    ]);
    if (value(aspectRatio, event)) {
      if (scaleType[0] === 0 || scaleType[0] === 1) {
        const ratio = bounds.width / bounds.height;
        newScale[1] = bounds.width * newScale[0] * (1 / ratio) / bounds.height;
      } else if (scaleType[1] === 0 || scaleType[1] === 1) {
        const ratio = bounds.height / bounds.width;
        newScale[0] = height * newScale[1] * ratio / width;
      }
    }
    if (scaleLimit) {
      newScale[0] = clamp(newScale[0], scaleLimit[0], scaleLimit[1]);
      newScale[1] = clamp(newScale[1], scaleLimit[0], scaleLimit[1]);
    }
    onUpdate({
      matrix: multiply(
        affineMatrix,
        matrixScale(newScale[0], newScale[1], absoluteOrigin)
      )
    });
  };
}
function rotate({
  x,
  y,
  width,
  height,
  start,
  offset,
  origin,
  affineMatrix,
  matrix,
  snapDegree = 15,
  snap
}, onUpdate) {
  const decomposed = decompose(affineMatrix);
  const rotation = decomposed.rotation.angle;
  const angle = toDegree(rotation);
  const absoluteOrigin = applyToPoint(matrix, [
    width * origin[0],
    height * origin[1]
  ]);
  const pressAngle = Math.atan2(
    start[1] - offset[1] - (absoluteOrigin[1] + y),
    start[0] - offset[0] - (absoluteOrigin[0] + x)
  );
  return (event) => {
    let radians = rotation + Math.atan2(
      event.clientY - offset[1] - (absoluteOrigin[1] + y),
      event.clientX - offset[0] - (absoluteOrigin[0] + x)
    ) - pressAngle;
    let degrees = toDegree(radians);
    if (value(snap, event)) {
      degrees = Math.round(degrees / snapDegree) * snapDegree;
    }
    degrees -= angle;
    onUpdate({
      matrix: multiply(
        matrixRotate(toRadians(degrees), absoluteOrigin),
        affineMatrix
      )
    });
  };
}
function translate({ x, y, start }, onUpdate) {
  return (dragEvent) => {
    x += dragEvent.clientX - start[0];
    y += dragEvent.clientY - start[1];
    onUpdate({ x, y });
    start = [dragEvent.clientX, dragEvent.clientY];
  };
}
const TRIANGLES = [
  [0, 1, 2],
  [1, 0, 3],
  [2, 0, 3],
  [3, 1, 2]
];
function getTriangleRotation(pos1, pos2, pos3) {
  const radians = getAngle(pos1, pos3) - getAngle(pos1, pos2);
  return radians >= 0 ? radians : radians + 2 * Math.PI;
}
function isConvex(points, prevPoints) {
  for (let i = 0; i < points.length; i++) {
    const p = TRIANGLES[i];
    const rad1 = getTriangleRotation(points[p[0]], points[p[1]], points[p[2]]);
    const rad2 = getTriangleRotation(
      prevPoints[p[0]],
      prevPoints[p[1]],
      prevPoints[p[2]]
    );
    const pi = Math.PI;
    if (rad1 >= pi && rad2 <= pi || rad1 <= pi && rad2 >= pi) {
      return true;
    }
  }
  return false;
}
const originalHandles = [
  [0, 0],
  [0, 1],
  [1, 0],
  [1, 1]
];
function getNearestPoints(point, points, returnCount = 1) {
  const nearest = points.map((p, index) => [index, getDistance(point, p)]);
  return nearest.sort((a, b) => a[1] - b[1]).slice(0, returnCount);
}
function warp(handle, { affineMatrix, handles, start }, onUpdate) {
  const decomposed = decompose(affineMatrix);
  const radians = decomposed.rotation.angle;
  const nearestCount = (handle[0] === 0 || handle[0] === 1) && (handle[1] === 0 || handle[1] === 1) ? 1 : 2;
  const nearestHandles = getNearestPoints(
    handle,
    originalHandles,
    nearestCount
  ).map((near) => near[0]);
  return (event) => {
    const movePoint = [event.clientX, event.clientY];
    let moveDiff = getPointAtAngle(
      [movePoint[0] - start[0], movePoint[1] - start[1]],
      -radians
    );
    moveDiff[0] /= decomposed.scale.sx;
    moveDiff[1] /= decomposed.scale.sy;
    const newHandles = handles.map((handles2, index) => {
      if (nearestHandles.includes(index)) {
        return [handles2[0] + moveDiff[0], handles2[1] + moveDiff[1]];
      }
      return handles2;
    });
    if (isConvex(newHandles, handles)) {
      return;
    }
    onUpdate({
      warp: newHandles
    });
  };
}
function makePerspectiveMatrix(src, dest) {
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
        -src[i][1] * dest[i][0]
      ],
      [
        0,
        0,
        0,
        src[i][0],
        src[i][1],
        1,
        -src[i][0] * dest[i][1],
        -src[i][1] * dest[i][1]
      ]
    );
  }
  const h = luSolve(
    lu(A),
    dest.reduce((acc, dest2) => [...acc, ...dest2], [])
  );
  const H = [
    [h[0], h[1], 0, h[2]],
    [h[3], h[4], 0, h[5]],
    [0, 0, 1, 0],
    [h[6], h[7], 0, 1]
  ];
  return H;
}
export {
  applyToPoint,
  applyToPoints,
  call,
  clamp,
  createMatrixFromParams,
  decompose,
  dotProduct,
  getAngle,
  getDistance,
  getPointAtAngle,
  getVector,
  identity,
  inverseAffine,
  lu,
  luSolve,
  makePerspectiveMatrix,
  makeWarpPoints,
  matrixRotate,
  matrixScale,
  matrixTranslate,
  minMax,
  multiplies,
  multiply,
  rotate,
  scale,
  toDegree,
  toRadians,
  translate,
  transpose,
  value,
  warp
};
