## Free Transform Tool Core 


[![NPM Version](https://img.shields.io/npm/v/@free-transform/core.svg?style=flat)](https://www.npmjs.com/package/@free-transform/core)  [![NPM Downloads](https://img.shields.io/npm/dm/@free-transform/core.svg?style=flat)](https://www.npmjs.com/package/@free-transform/core)   [![License: MIT](https://img.shields.io/badge/License-MIT-brightgreen.svg)](https://opensource.org/licenses/MIT) 

A set of functions to perform shape transformations, including, `Scale`, `Rotate`, `Translate` & `Warping`


# Installation 
`npm install @free-transform/core`


# Usage 

## Scale
### scale types (Handles)

Scale handles can be specified origin points 

`[0, 0]`  left-top

`[0, 1]`  left-bottom

`[1, 0]`  right-top

`[1, 1]`  right-bottom

`[0, .5]`  left-middle

`[1, .5]`  right-middle

`[0.5, 0]`  middle-top

`[0.5, 1]`  middle-bottom

`[number, number]` any numeric value can be used to specify scale handle but it could introduce undesired behaviour





```js
import {scale, createMatrixFromParams} from '@free-transform/core'

let element = {
  x:0,
  y:0,
  width:100,
  height:100,
  matrix: createMatrixFromParams()  
}

const onScaleHandleMouseDown = (event) => {
  
  event.stopPropagation();
  event.preventDefault();
  // scale from top left
  const drag = scale([0,0 ], {
    start: [event.pageX, event.clientY],
    // scale from center only when alt key is pressed
    fromCenter: (event => event.altKey),
    // scale to aspect ration only when shift key is pressed
    aspectRatio: (event) => event.shiftKey,    
    ...element,    
  }, (payload) => { // {matrix:Matrix}
    // dragging
    element = { ...element, ...payload }
  });
  
  const up = () => {
    document.removeEventListener('pointermove', drag);
    document.removeEventListener('pointerup', up);
  };

  document.addEventListener("pointermove", drag)
  document.addEventListener("pointerup", up)
  
}

```
## Rotation
```js

import {rotate, createMatrixFromParams, toRadians} from '@free-transform/core'

let element = {
  x:0,
  y:0,
  width:100,
  height:100,
  matrix: createMatrixFromParams({
    angle: toRadians(45)
  })  
}


const onRotateHandleMouseDown = (event) => {
  
  event.stopPropagation();
  event.preventDefault();
      
  const drag = rotate({
    start: [event.pageX,event.clientY] 
    offset: [0, 0], // the parent element offset
    ...element,   
    snap: (event) => event.altKey,
    snapDegree: 15,
  }, (payload) => { // {matrix}
    // dragging
    element = { ...element, ...payload }
  });
  
  const up = () => {
    document.removeEventListener('pointermove', drag);
    document.removeEventListener('pointerup', up);
  };

  document.addEventListener("pointermove", drag)
  document.addEventListener("pointerup", up)
}

```


## Translation (Dragging)

```js
import {translate} from '@free-transform/core'

let element = {
  x:0,
  y:0,
}

const onElementMouseDown = (event) => {
    event.stopPropagation();
    
    const drag = translate({
      x: element.x,
      y: element.y,
      start: [event.pageX,event.clientY]
    }, (payload) => { // {x,y}
      // dragging     
      element = { ...element, ...payload }
    });
    
    const up = () => {
      document.removeEventListener('pointermove', drag);
      document.removeEventListener('pointerup', up);
    };
    
    document.addEventListener('pointermove', drag);
    document.addEventListener('pointerup', up);
}

```


## Warp (Perspective transofrmation)

```js
import {warp, createMatrixFromParams, makeWarpPoints} from '@free-transform/core'


let element = {
  x:0,
  y:0,
  width:100,
  height:100,
  matrix: createMatrixFromParams()  
}

element.warp = makeWarpPoints(element.width, element.height)

const onElementMouseDown = (event) => {
    event.stopPropagation();

    // warp from left-top handle
    const drag = warp([0, 0], {
      start: [event.pageX,event.clientY],
      warp: element.warp,
      matrix: element.matrix,
    }, (payload) => { // {warp}
      // dragging     
      element = { ...element, ...payload }
    });
    
    const up = () => {
      document.removeEventListener('pointermove', drag);
      document.removeEventListener('pointerup', up);
    };
    
    document.addEventListener('pointermove', drag);
    document.addEventListener('pointerup', up);
}

```



## All together

in order to make all transformations works together, we need to generate a new Perspective matrix  to work on homogeneous coordinates


```js


import {
  rotate,
  warp,
  scale,
  createMatrixFromParams,
  makeWarpPoints,
  makePerspectiveMatrix,
  multiply
} from '@free-transform/core'

 
let element = {
  x:0,
  y:0,
  width:100,
  height:100,
  matrix: createMatrixFromParams()  
}

element.warp = makeWarpPoints(element.width, element.height)
 
const onScaleHandleMouseDown = (event) => {
 
  const drag = scale([0,0 ], {
    start: [event.pageX, event.clientY],
    fromCenter: (event => event.altKey),
    aspectRatio: (event) => event.shiftKey,    
    ...element,    

    // created using the new warp points
    perspectiveMatrix,

    // contains scale & rotation values
    affineMatrix: element.matrix,
    
    // the final matrix
    matrix: multiply(element.matrix, perspectiveMatrix)
  }, (payload) => { // {matrix:Matrix}
    // dragging
    element = { ...element, ...payload }
  }); 
}



const onRotateHandleMouseDown = (event) => {
   const perspectiveMatrix = makePerspectiveMatrix(
    makeWarpPoints(element.width, element.height),
    element.warp
  )
 
  const drag = rotate({
    start: [event.pageX,event.clientY] 
    offset: [0, 0], // the parent element offset
    ...element,   
    snap: (event) => event.altKey,
    snapDegree: 15,

    // contains scale & rotation values
    affineMatrix: element.matrix,
    
    // the final matrix
    matrix: multiply(element.matrix, perspectiveMatrix)
  }, (payload) => { // {matrix}
    // dragging
    element = { ...element, ...payload }
  });
}
```


## Output to css matrix3d

```js

import {
  createMatrixFromParams,
  makeWarpPoints,
  makePerspectiveMatrix,
  multiply,
  transpose,
  matrixTranslate
} from '@free-transform/core'

let element = {
  x:0,
  y:0,
  width:100,
  height:100,
  matrix: createMatrixFromParams()  
}

element.warp = makeWarpPoints(element.width, element.height)

const perspectiveMatrix = makePerspectiveMatrix(
  makeWarpPoints(element.width, element.height),
  element.warp
)

const outputMatrix = multiply(
  element.matrix,
  perspectiveMatrix,
  matrixTranslate(element.x, element.y)
) ;


const string = transpose(outputMatrix).map((v) =>
  v.map((v) => Number(v.toFixed(10)))
);

const tansform = `matrix3d(${string})`;

```


