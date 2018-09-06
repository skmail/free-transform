## Free Transform Tool Utility 


[![NPM Version](https://img.shields.io/npm/v/free-transform.svg?style=flat)](https://www.npmjs.com/package/free-transform)  [![NPM Downloads](https://img.shields.io/npm/dm/free-transform.svg?style=flat)](https://www.npmjs.com/package/free-transform)   [![License: MIT](https://img.shields.io/badge/License-MIT-brightgreen.svg)](https://opensource.org/licenses/MIT) [![Build Status](https://img.shields.io/travis/skmail/free-transform/master.svg?style=flat)](https://travis-ci.org/skmail/free-transform)   [![codecov.io](https://codecov.io/gh/skmail/free-transform/branch/master/graph/badge.svg)](https://codecov.io/gh/skmail/free-transform) 


A set of functions to calculate boundries element resizing, translating, rotating and styles object extraction 


## Installation 
`npm install free-transform`


## Usage 

### Scale

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
const onMouseDown = (event) => {
  
  event.stopPropagation();
  event.preventDefault();
      
  const drag = scale(scaleType, {
    startX: event.pageX,
    startY: event.pageY,
    scaleFromCenter: event.altKey,
    aspectRatio: event.shiftKey,
    ...element,   
  }, ({x, y, scaleX, scaleY}) => {
    // dragging
    element = {
      ...element,
      x,y,scaleX,scaleY
    }
  });
  
  const up = () => {
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', up);
  };

  document.addEventListener("mousemove", drag)
  document.addEventListener("mouseup", up)
  
}


```


 
 
