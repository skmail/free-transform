## Free Transform Tool Utility 


[![NPM Version](https://img.shields.io/npm/v/free-transform.svg?style=flat)](https://www.npmjs.com/package/free-transform)  [![NPM Downloads](https://img.shields.io/npm/dm/free-transform.svg?style=flat)](https://www.npmjs.com/package/free-transform)   [![License: MIT](https://img.shields.io/badge/License-MIT-brightgreen.svg)](https://opensource.org/licenses/MIT) [![Build Status](https://img.shields.io/travis/skmail/free-transform/master.svg?style=flat)](https://travis-ci.org/skmail/free-transform)   [![codecov.io](https://codecov.io/gh/skmail/free-transform/branch/master/graph/badge.svg)](https://codecov.io/gh/skmail/free-transform) 


A set of functions to calculate boundries element resizing, translating, rotating and styles object extraction 


## Installation 
`npm install free-transform`


## Usage 

### Scale

#### scale types (Handles)
`tl` Top Left Handle

`ml` Middle Left Handle

`tr` Top Right Handle

`tm` Top Middle Handle

`bl` Bottom Left Handle

`bm` Bottom Middle Handle

`br` Bottom Right Handle

`mr` Middle Right Handle


```js
import {scale} from 'free-transform'

let element = {
  x:0,
  y:0,
  scaleX:1,
  scaleY:1,
  width:100,
  height:100,
  angle:0,
  scaleLimit:0.1, 
}

const onScaleHandleMouseDown = (event) => {
  
  event.stopPropagation();
  event.preventDefault();
  const drag = scale('tl', {
    startX: event.pageX,
    startY: event.pageY,
    scaleFromCenter: event.altKey,
    aspectRatio: event.shiftKey,
    ...element,   
  }, (payload) => { // {x, y, scaleX, scaleY}
    // dragging
    element = { ...element, ...payload }
  });
  
  const up = () => {
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', up);
  };

  document.addEventListener("mousemove", drag)
  document.addEventListener("mouseup", up)
  
}

```
### Rotation



```js

import {rotate} from 'free-transform'

let element = {
  x:0,
  y:0,
  scaleX:1,
  scaleY:1,
  width:100,
  height:100,
  angle:0,
  scaleLimit:0.1, 
}

const onRotateHandleMouseDown = (event) => {
  
  event.stopPropagation();
  event.preventDefault();
      
  const drag = rotate({
    startX: event.pageX,
    startY: event.pageY, 
    offsetX: 0, // the offset x of parent (parent.offsetLeft)
    offsetY: 0, // the offset y of parent (parent.offsetTop)
    ...element,   
  }, (payload) => { // {angle}
    // dragging
    element = { ...element, ...payload }
  });
  
  const up = () => {
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', up);
  };

  document.addEventListener("mousemove", drag)
  document.addEventListener("mouseup", up)
}

```


### Translation (Dragging)

```js
let element = {
  x:0,
  y:0,
  scaleX:1,
  scaleY:1,
  width:100,
  height:100,
  angle:0,
  scaleLimit:0.1, 
}

const onElementMouseDown = (event) => {
    event.stopPropagation();
    
    const drag = translate({
      x: element.x,
      y: element.y,
      startX: event.pageX,
      startY: event.pageY
    }, (payload) => { // {x,y}
      // dragging     
      element = { ...element, ...payload }
    });
    
    const up = () => {
      document.removeEventListener('mousemove', drag);
      document.removeEventListener('mouseup', up);
    };
    
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', up);
}

```