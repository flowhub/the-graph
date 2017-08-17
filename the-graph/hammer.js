// Contains code from hammmer.js
// https://github.com/hammerjs/hammer.js
// The MIT License (MIT)
// Copyright (C) 2011-2014 by Jorik Tangelder (Eight Media)
//
// With customizations to get it to work as we like/need,
// particularly we track all events on the target element itself

var VENDOR_PREFIXES = ['', 'webkit', 'Moz', 'MS', 'ms', 'o'];

function prefixed(obj, property) {
    var prefix, prop;
    var camelProp = property[0].toUpperCase() + property.slice(1);

    var i = 0;
    while (i < VENDOR_PREFIXES.length) {
        prefix = VENDOR_PREFIXES[i];
        prop = (prefix) ? prefix + camelProp : property;

        if (prop in obj) {
            return prop;
        }
        i++;
    }
    return undefined;
}

var MOBILE_REGEX = /mobile|tablet|ip(ad|hone|od)|android/i;

var SUPPORT_TOUCH = ('ontouchstart' in window);
var SUPPORT_POINTER_EVENTS = prefixed(window, 'PointerEvent') !== undefined;
var SUPPORT_ONLY_TOUCH = SUPPORT_TOUCH && MOBILE_REGEX.test(navigator.userAgent);

var POINTER_ELEMENT_EVENTS = 'pointerdown';
var POINTER_WINDOW_EVENTS = 'pointermove pointerup pointercancel';
// IE10 has prefixed support, and case-sensitive
if (window.MSPointerEvent && !window.PointerEvent) {
    POINTER_ELEMENT_EVENTS = 'MSPointerDown';
    POINTER_WINDOW_EVENTS = 'MSPointerMove MSPointerUp MSPointerCancel';
}

function PointerInput() {
  // OVERRIDE: listen for all event on the element, not on window
  // This is needed for event propagation to get the right targets
  this.evEl = POINTER_ELEMENT_EVENTS + ' ' + POINTER_WINDOW_EVENTS;
  this.evWin = '';
  Hammer.Input.apply(this, arguments);
  this.store = (this.manager.session.pointerEvents = []);
}
Hammer.inherit(PointerInput, Hammer.PointerEventInput, {});
PointerInput.prototype.constructor = function() { }; // STUB, avoids init() being called too early

var MOUSE_ELEMENT_EVENTS = 'mousedown';
var MOUSE_WINDOW_EVENTS = 'mousemove mouseup';

function MouseInput() {
  // OVERRIDE: listen for all event on the element, not on window
  // This is needed for event propagation to get the right targets
  this.evEl = MOUSE_ELEMENT_EVENTS + ' ' + MOUSE_WINDOW_EVENTS;
  this.evWin = '';

  this.pressed = false; // mousedown state
  Hammer.Input.apply(this, arguments);
}
Hammer.inherit(MouseInput, Hammer.MouseInput, {});
MouseInput.prototype.constructor = function() { }; // STUB, avoids overridden constructor being called

function TouchMouseInput() {
    Hammer.Input.apply(this, arguments);

    var handler = this.handler.bind(this);
    this.touch = new Hammer.TouchInput(this.manager, handler);
    this.mouse = new MouseInput(this.manager, handler);

    this.primaryTouch = null;
    this.lastTouches = [];
}
Hammer.inherit(TouchMouseInput, Hammer.TouchMouseInput, {});
TouchMouseInput.prototype.constructor = function() { }; // STUB, avoids overridden constructor being called

var Input = null;
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
  Input: Input,
};
