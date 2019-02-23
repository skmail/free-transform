import {
  getPoint,
  getOppositePoint,
  getMovePoint,
  getSineCosine,
  getCenter,
} from './point-finder'

/**
 * Perform Scaling based on a positioned handle
 *
 * @param {string} scaleType scale point position name
 * @param {Object} payload an object holding element information
 * @param {event} payload.event the mousedown event object
 * @param {number} payload.x position of x
 * @param {number} payload.y position of y
 * @param {number} payload.scaleX amount of scale for x (width)
 * @param {number} payload.scaleY amount of scale for y (height)
 * @param {number} payload.width original width
 * @param {number} payload.height original height
 * @param {number} payload.angle the angle of rotation
 * @param {number} payload.scaleLimit minimum scale limit
 * @param {boolean} payload.scaleFromCenter by default scale from center
 * @param {boolean|number} payload.aspectRatio by default scale on aspect ration
 * @param {boolean} payload.enableScaleFromCenter completely disable scale from center
 * @param {boolean} payload.enableAspectRatio completely disable enforced aspect ratios
 * @param {Function} onUpdate a callback on mouse up
 *
 * @returns {Function} a function for mouse move
 */
export default (scaleType, {
  event,
  x,
  y,
  startX, // for backwards compatability, but should remove eventually
  startY, // for backwards compatability
  scaleX,
  scaleY,
  width,
  height,
  angle,
  scaleLimit,
  scaleFromCenter = false,
  enableScaleFromCenter = true,
  aspectRatio = false,
  enableAspectRatio = true
}, onUpdate) => {

  // allow ratio to be set at a specific ratio
  const ratio = aspectRatio && aspectRatio != true ? aspectRatio : (width * scaleX) / (height * scaleY);

  let point; 
  let oppositePoint;
  // let startX; // uncomment when removing them as arguments
  // let startY;
  if(!event) { // prevents breaking change
    event = {
      pageX: startX,
      pageY: startY,
      altKey: scaleFromCenter,
      shiftKey: aspectRatio,
    }

    scaleFromCenter = false;
    aspectRatio = false;
  }

  const currentProps = { x, y, scaleX, scaleY };

  var prevScaleFromCenterToggled = null; // will always fire the first time because scaleFromCenterToggled will always be true/false
  const drag = (event) => {

    // check control keys
    let aspectRatioToggled = enableAspectRatio && !event.shiftKey != !aspectRatio;
    let scaleFromCenterToggled = enableScaleFromCenter && !event.altKey != !scaleFromCenter;

    // initialize center if point changed.
    if(scaleFromCenterToggled !== prevScaleFromCenterToggled) {
      prevScaleFromCenterToggled = scaleFromCenterToggled;

      startX = event.pageX;
      startY = event.pageY;

      point = getPoint(scaleType, { ...currentProps, width, height, angle, scaleFromCenter: scaleFromCenterToggled });
      oppositePoint = getOppositePoint(scaleType, { ...currentProps, width, height, angle });

      return; // moveDiff will be zero anyway. this is just an initializing call.
    }

    const moveDiff = {
      x: event.pageX - startX,
      y: event.pageY - startY
    }

    const movePoint = getMovePoint(scaleType, oppositePoint, point, moveDiff)

    if (scaleFromCenterToggled) {
      movePoint.x *= 2
      movePoint.y *= 2
    }

    const {sin, cos} = getSineCosine(scaleType, angle);

    const rotationPoint = {
      x: movePoint.x * cos + movePoint.y * sin,
      y: movePoint.y * cos - movePoint.x * sin
    }
    
    currentProps.scaleX = Math.max(rotationPoint.x / width, scaleLimit);
    currentProps.scaleY = Math.max(rotationPoint.y / height, scaleLimit);

    switch (scaleType) {
    case 'ml':
    case 'mr':
      currentProps.scaleY = scaleY
      if (aspectRatioToggled) {
        currentProps.scaleY = ((width * currentProps.scaleX) * (1 / ratio)) / height;
      }
      break;
    case 'tm':
    case 'bm':
      currentProps.scaleX = scaleX
      if (aspectRatioToggled) {
        currentProps.scaleX = ((height * currentProps.scaleY) * ratio) / width;
      }
      break;
    default:
      if (aspectRatioToggled) {
        currentProps.scaleY = ((width * currentProps.scaleX) * (1 / ratio)) / height;
      }
    }

    if (scaleFromCenterToggled) {
      const center = getCenter({
        x,
        y,
        width,
        height,
        scaleX: currentProps.scaleX,
        scaleY: currentProps.scaleY,
      })
      currentProps.x = x + (point.x - center.x)
      currentProps.y = y + (point.y - center.y)
    } else {
      const freshOppositePoint = getOppositePoint(scaleType, {
        width,
        height,
        angle,
        x,
        y,
        scaleX: currentProps.scaleX,
        scaleY: currentProps.scaleY,
      });

      currentProps.x = x + (oppositePoint.x - freshOppositePoint.x)
      currentProps.y = y + (oppositePoint.y - freshOppositePoint.y)
    }

    onUpdate(currentProps);
  }

  drag(event); // run with initial mousedown event
  return drag;
}