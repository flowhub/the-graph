// Customizations to get hammerjs to work as we like/need
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

// FIXME: also support Firefox/mobile etc, which does not support pointer events
var Input = PointerInput;

module.exports = {
  Input: Input,
};
