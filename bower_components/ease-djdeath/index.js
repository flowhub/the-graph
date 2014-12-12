(function(window, undefined) {
  'use strict';

var Ease = {};

// easing functions from "Tween.js"

Ease.linear = function(n){
  return n;
};

Ease.inQuad = function(n){
  return n * n;
};

Ease.outQuad = function(n){
  return n * (2 - n);
};

Ease.inOutQuad = function(n){
  n *= 2;
  if (n < 1) return 0.5 * n * n;
  return - 0.5 * (--n * (n - 2) - 1);
};

Ease.inCube = function(n){
  return n * n * n;
};

Ease.outCube = function(n){
  return --n * n * n + 1;
};

Ease.inOutCube = function(n){
  n *= 2;
  if (n < 1) return 0.5 * n * n * n;
  return 0.5 * ((n -= 2 ) * n * n + 2);
};

Ease.inQuart = function(n){
  return n * n * n * n;
};

Ease.outQuart = function(n){
  return 1 - (--n * n * n * n);
};

Ease.inOutQuart = function(n){
  n *= 2;
  if (n < 1) return 0.5 * n * n * n * n;
  return -0.5 * ((n -= 2) * n * n * n - 2);
};

Ease.inQuint = function(n){
  return n * n * n * n * n;
}

Ease.outQuint = function(n){
  return --n * n * n * n * n + 1;
}

Ease.inOutQuint = function(n){
  n *= 2;
  if (n < 1) return 0.5 * n * n * n * n * n;
  return 0.5 * ((n -= 2) * n * n * n * n + 2);
};

Ease.inSine = function(n){
  return 1 - Math.cos(n * Math.PI / 2 );
};

Ease.outSine = function(n){
  return Math.sin(n * Math.PI / 2);
};

Ease.inOutSine = function(n){
  return .5 * (1 - Math.cos(Math.PI * n));
};

Ease.inExpo = function(n){
  return 0 == n ? 0 : Math.pow(1024, n - 1);
};

Ease.outExpo = function(n){
  return 1 == n ? n : 1 - Math.pow(2, -10 * n);
};

Ease.inOutExpo = function(n){
  if (0 == n) return 0;
  if (1 == n) return 1;
  if ((n *= 2) < 1) return .5 * Math.pow(1024, n - 1);
  return .5 * (-Math.pow(2, -10 * (n - 1)) + 2);
};

Ease.inCirc = function(n){
  return 1 - Math.sqrt(1 - n * n);
};

Ease.outCirc = function(n){
  return Math.sqrt(1 - (--n * n));
};

Ease.inOutCirc = function(n){
  n *= 2
  if (n < 1) return -0.5 * (Math.sqrt(1 - n * n) - 1);
  return 0.5 * (Math.sqrt(1 - (n -= 2) * n) + 1);
};

Ease.inBack = function(n){
  var s = 1.70158;
  return n * n * (( s + 1 ) * n - s);
};

Ease.outBack = function(n){
  var s = 1.70158;
  return --n * n * ((s + 1) * n + s) + 1;
};

Ease.inOutBack = function(n){
  var s = 1.70158 * 1.525;
  if ( ( n *= 2 ) < 1 ) return 0.5 * ( n * n * ( ( s + 1 ) * n - s ) );
  return 0.5 * ( ( n -= 2 ) * n * ( ( s + 1 ) * n + s ) + 2 );
};

Ease.inBounce = function(n){
  return 1 - Ease.outBounce(1 - n);
};

Ease.outBounce = function(n){
  if ( n < ( 1 / 2.75 ) ) {
    return 7.5625 * n * n;
  } else if ( n < ( 2 / 2.75 ) ) {
    return 7.5625 * ( n -= ( 1.5 / 2.75 ) ) * n + 0.75;
  } else if ( n < ( 2.5 / 2.75 ) ) {
    return 7.5625 * ( n -= ( 2.25 / 2.75 ) ) * n + 0.9375;
  } else {
    return 7.5625 * ( n -= ( 2.625 / 2.75 ) ) * n + 0.984375;
  }
};

Ease.inOutBounce = function(n){
  if (n < .5) return Ease.inBounce(n * 2) * .5;
  return Ease.outBounce(n * 2 - 1) * .5 + .5;
};

Ease.inElastic = function(n){
  var s, a = 0.1, p = 0.4;
  if ( n === 0 ) return 0;
  if ( n === 1 ) return 1;
  if ( !a || a < 1 ) { a = 1; s = p / 4; }
  else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
  return - ( a * Math.pow( 2, 10 * ( n -= 1 ) ) * Math.sin( ( n - s ) * ( 2 * Math.PI ) / p ) );
};

Ease.outElastic = function(n){
  var s, a = 0.1, p = 0.4;
  if ( n === 0 ) return 0;
  if ( n === 1 ) return 1;
  if ( !a || a < 1 ) { a = 1; s = p / 4; }
  else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
  return ( a * Math.pow( 2, - 10 * n) * Math.sin( ( n - s ) * ( 2 * Math.PI ) / p ) + 1 );
};

Ease.inOutElastic = function(n){
  var s, a = 0.1, p = 0.4;
  if ( n === 0 ) return 0;
  if ( n === 1 ) return 1;
  if ( !a || a < 1 ) { a = 1; s = p / 4; }
  else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
  if ( ( n *= 2 ) < 1 ) return - 0.5 * ( a * Math.pow( 2, 10 * ( n -= 1 ) ) * Math.sin( ( n - s ) * ( 2 * Math.PI ) / p ) );
  return a * Math.pow( 2, -10 * ( n -= 1 ) ) * Math.sin( ( n - s ) * ( 2 * Math.PI ) / p ) * 0.5 + 1;
};

// aliases

Ease['in-quad'] = Ease.inQuad;
Ease['out-quad'] = Ease.outQuad;
Ease['in-out-quad'] = Ease.inOutQuad;
Ease['in-cube'] = Ease.inCube;
Ease['out-cube'] = Ease.outCube;
Ease['in-out-cube'] = Ease.inOutCube;
Ease['in-quart'] = Ease.inQuart;
Ease['out-quart'] = Ease.outQuart;
Ease['in-out-quart'] = Ease.inOutQuart;
Ease['in-quint'] = Ease.inQuint;
Ease['out-quint'] = Ease.outQuint;
Ease['in-out-quint'] = Ease.inOutQuint;
Ease['in-sine'] = Ease.inSine;
Ease['out-sine'] = Ease.outSine;
Ease['in-out-sine'] = Ease.inOutSine;
Ease['in-expo'] = Ease.inExpo;
Ease['out-expo'] = Ease.outExpo;
Ease['in-out-expo'] = Ease.inOutExpo;
Ease['in-circ'] = Ease.inCirc;
Ease['out-circ'] = Ease.outCirc;
Ease['in-out-circ'] = Ease.inOutCirc;
Ease['in-back'] = Ease.inBack;
Ease['out-back'] = Ease.outBack;
Ease['in-out-back'] = Ease.inOutBack;
Ease['in-bounce'] = Ease.inBounce;
Ease['out-bounce'] = Ease.outBounce;
Ease['in-out-bounce'] = Ease.inOutBounce;
Ease['in-elastic'] = Ease.inElastic;
Ease['out-elastic'] = Ease.outElastic;
Ease['in-out-elastic'] = Ease.inOutElastic;

// AMD export
if(typeof define == 'function' && define.amd) {
  define(function(){
    return Ease;
  });
}
// commonjs export
else if(typeof module == 'object' && module.exports) {
  module.exports = Ease;
}
// browser export
else {
  window.Ease = Ease;
}

})(window);
