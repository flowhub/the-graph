const Hammer = require('hammerjs');
// Contains code from hammmer.js
// https://github.com/hammerjs/hammer.js
// The MIT License (MIT)
// Copyright (C) 2011-2014 by Jorik Tangelder (Eight Media)
//
// With customizations to get it to work as we like/need,
// particularly we track all events on the target element itself

const VENDOR_PREFIXES = ['', 'webkit', 'Moz', 'MS', 'ms', 'o'];

function prefixed(obj, property) {
  let prefix; let
    prop;
  const camelProp = property[0].toUpperCase() + property.slice(1);

  let i = 0;
  while (i < VENDOR_PREFIXES.length) {
    prefix = VENDOR_PREFIXES[i];
    prop = (prefix) ? prefix + camelProp : property;

    if (prop in obj) {
      return prop;
    }
    i += 1;
  }
  return undefined;
}

const MOBILE_REGEX = /mobile|tablet|ip(ad|hone|od)|android/i;

const SUPPORT_TOUCH = ('ontouchstart' in window);
const SUPPORT_POINTER_EVENTS = prefixed(window, 'PointerEvent') !== undefined;
const SUPPORT_ONLY_TOUCH = SUPPORT_TOUCH && MOBILE_REGEX.test(navigator.userAgent);

let POINTER_ELEMENT_EVENTS = 'pointerdown';
let POINTER_WINDOW_EVENTS = 'pointermove pointerup pointercancel';
// IE10 has prefixed support, and case-sensitive
if (window.MSPointerEvent && !window.PointerEvent) {
  POINTER_ELEMENT_EVENTS = 'MSPointerDown';
  POINTER_WINDOW_EVENTS = 'MSPointerMove MSPointerUp MSPointerCancel';
}

function PointerInput(...args) {
  // OVERRIDE: listen for all event on the element, not on window
  // This is needed for event propagation to get the right targets
  this.evEl = `${POINTER_ELEMENT_EVENTS} ${POINTER_WINDOW_EVENTS}`;
  this.evWin = '';
  Hammer.Input.apply(this, args);
  this.manager.session.pointerEvents = [];
  this.store = this.manager.session.pointerEvents;
}
Hammer.inherit(PointerInput, Hammer.PointerEventInput, {});
PointerInput.prototype.constructor = function () { }; // STUB, avoids init() being called too early

const MOUSE_ELEMENT_EVENTS = 'mousedown';
const MOUSE_WINDOW_EVENTS = 'mousemove mouseup';

function MouseInput(...args) {
  // OVERRIDE: listen for all event on the element, not on window
  // This is needed for event propagation to get the right targets
  this.evEl = `${MOUSE_ELEMENT_EVENTS} ${MOUSE_WINDOW_EVENTS}`;
  this.evWin = '';

  this.pressed = false; // mousedown state
  Hammer.Input.apply(this, args);
}
Hammer.inherit(MouseInput, Hammer.MouseInput, {});
// STUB, avoids overridden constructor being called
MouseInput.prototype.constructor = function () { };

function TouchMouseInput(...args) {
  Hammer.Input.apply(this, args);

  const handler = this.handler.bind(this);
  this.touch = new Hammer.TouchInput(this.manager, handler);
  this.mouse = new MouseInput(this.manager, handler);

  this.primaryTouch = null;
  this.lastTouches = [];
}
Hammer.inherit(TouchMouseInput, Hammer.TouchMouseInput, {});
// STUB, avoids overridden constructor being called
TouchMouseInput.prototype.constructor = function () { };

let Input = null;
if (SUPPORT_POINTER_EVENTS) {
  Input = PointerInput;
} else if (SUPPORT_ONLY_TOUCH) {
  Input = Hammer.TouchInput;
} else if (!SUPPORT_TOUCH) {
  Input = MouseInput;
} else {
  Input = TouchMouseInput;
}

module.exports = {
  Input,
};
