loadGraph(
{
  "properties": {
    "environment": {
      "runtime": "html",
      "content": "<div class='area' title='.area'><img id='clock' src='http://i.meemoo.me/v1/in/GJPUFPc8ThuRp9itdXC9_clock-face.png' style='position:absolute; width:300px; height:300px; top:0; left:0;' /><img id='hours' src='http://i.meemoo.me/v1/in/fRL213GT1uCRltIqXkK2_clock-hours.png' style='position:absolute; top:50px; left:130px; height:200px;' /><img id='minutes' src='http://i.meemoo.me/v1/in/23DZFKYoRTOIAjPA7sed_clock-minutes.png' style='position:absolute; top:0; left:140px; height:300px;' /><img id='seconds' src='http://i.meemoo.me/v1/in/VU2HqPmuTqucRpnUGGBj_clock-seconds.png' style='position:absolute; top:0; left:145px; height:300px;' /></div>",
      "width": 300,
      "height": 300,
      "src": "./preview/iframe.html"
    },
    "name": "NoFlo"
  },
  "exports": [],
  "processes": {
    "getTimezoneOffset": {
      "component": "objects/CallMethod",
      "metadata": {
        "x": 360,
        "y": 480
      }
    },
    "makeTimezoneAngle": {
      "component": "math/Divide",
      "metadata": {
        "x": 540,
        "y": 480
      }
    },
    "fixHourAngle": {
      "component": "math/Add",
      "metadata": {
        "x": 720,
        "y": 420
      }
    },
    "makeHourRotation": {
      "component": "math/Divide",
      "metadata": {
        "x": 360,
        "y": 360
      }
    },
    "rotateMinuteHand": {
      "component": "css/RotateElement",
      "metadata": {
        "x": 720,
        "y": 240
      }
    },
    "rotateHourHand": {
      "component": "css/RotateElement",
      "metadata": {
        "x": 900,
        "y": 360
      }
    },
    "getSecondHand": {
      "component": "dom/GetElement",
      "metadata": {
        "x": 540,
        "y": 60
      }
    },
    "getMinuteHand": {
      "component": "dom/GetElement",
      "metadata": {
        "x": 540,
        "y": 180
      }
    },
    "getHourHand": {
      "component": "dom/GetElement",
      "metadata": {
        "x": 540,
        "y": 300
      }
    },
    "makeSecondRotation": {
      "component": "math/Divide",
      "metadata": {
        "x": 360,
        "y": 120
      }
    },
    "rotateSecondHand": {
      "component": "css/RotateElement",
      "metadata": {
        "x": 720,
        "y": 120
      }
    },
    "split": {
      "component": "core/Split",
      "metadata": {
        "x": 180,
        "y": 300
      }
    },
    "animationFrame": {
      "component": "dom/RequestAnimationFrame",
      "metadata": {
        "x": 180,
        "y": 60
      }
    },
    "createDate": {
      "component": "objects/CreateDate",
      "metadata": {
        "x": 180,
        "y": 180
      }
    },
    "makeMinuteRotation": {
      "component": "math/Divide",
      "metadata": {
        "x": 360,
        "y": 240
      }
    },
    "core/Kick_qr1da": {
      "component": "core/Kick",
      "metadata": {
        "x": 60,
        "y": 60,
        "label": "core/Kick"
      }
    }
  },
  "connections": [
    {
      "src": {
        "process": "createDate",
        "port": "out"
      },
      "tgt": {
        "process": "split",
        "port": "in"
      }
    },
    {
      "src": {
        "process": "split",
        "port": "out"
      },
      "tgt": {
        "process": "makeSecondRotation",
        "port": "dividend"
      },
      "metadata": {
        "route": 1
      }
    },
    {
      "src": {
        "process": "getSecondHand",
        "port": "element"
      },
      "tgt": {
        "process": "rotateSecondHand",
        "port": "element"
      }
    },
    {
      "src": {
        "process": "makeSecondRotation",
        "port": "quotient"
      },
      "tgt": {
        "process": "rotateSecondHand",
        "port": "percent"
      },
      "metadata": {
        "route": 1
      }
    },
    {
      "src": {
        "process": "split",
        "port": "out"
      },
      "tgt": {
        "process": "makeMinuteRotation",
        "port": "dividend"
      },
      "metadata": {
        "route": 5
      }
    },
    {
      "src": {
        "process": "split",
        "port": "out"
      },
      "tgt": {
        "process": "makeHourRotation",
        "port": "dividend"
      },
      "metadata": {
        "route": 10
      }
    },
    {
      "src": {
        "process": "getMinuteHand",
        "port": "element"
      },
      "tgt": {
        "process": "rotateMinuteHand",
        "port": "element"
      }
    },
    {
      "src": {
        "process": "makeMinuteRotation",
        "port": "quotient"
      },
      "tgt": {
        "process": "rotateMinuteHand",
        "port": "percent"
      },
      "metadata": {
        "route": 5
      }
    },
    {
      "src": {
        "process": "getHourHand",
        "port": "element"
      },
      "tgt": {
        "process": "rotateHourHand",
        "port": "element"
      }
    },
    {
      "src": {
        "process": "animationFrame",
        "port": "out"
      },
      "tgt": {
        "process": "createDate",
        "port": "in"
      }
    },
    {
      "src": {
        "process": "split",
        "port": "out"
      },
      "tgt": {
        "process": "getTimezoneOffset",
        "port": "in"
      },
      "metadata": {
        "route": 0
      }
    },
    {
      "src": {
        "process": "getTimezoneOffset",
        "port": "out"
      },
      "tgt": {
        "process": "makeTimezoneAngle",
        "port": "dividend"
      }
    },
    {
      "src": {
        "process": "makeHourRotation",
        "port": "quotient"
      },
      "tgt": {
        "process": "fixHourAngle",
        "port": "augend"
      },
      "metadata": {
        "route": 10
      }
    },
    {
      "src": {
        "process": "makeTimezoneAngle",
        "port": "quotient"
      },
      "tgt": {
        "process": "fixHourAngle",
        "port": "addend"
      }
    },
    {
      "src": {
        "process": "fixHourAngle",
        "port": "sum"
      },
      "tgt": {
        "process": "rotateHourHand",
        "port": "percent"
      },
      "metadata": {
        "route": 10
      }
    },
    {
      "src": {
        "process": "core/Kick_qr1da",
        "port": "out"
      },
      "tgt": {
        "process": "animationFrame",
        "port": "start"
      },
      "metadata": {
        "route": 0
      }
    },
    {
      "data": "#hours",
      "tgt": {
        "process": "getHourHand",
        "port": "selector"
      }
    },
    {
      "data": "#minutes",
      "tgt": {
        "process": "getMinuteHand",
        "port": "selector"
      }
    },
    {
      "data": "#seconds",
      "tgt": {
        "process": "getSecondHand",
        "port": "selector"
      }
    },
    {
      "data": 60000,
      "tgt": {
        "process": "makeSecondRotation",
        "port": "divisor"
      }
    },
    {
      "data": 3600000,
      "tgt": {
        "process": "makeMinuteRotation",
        "port": "divisor"
      }
    },
    {
      "data": "getTimezoneOffset",
      "tgt": {
        "process": "getTimezoneOffset",
        "port": "method"
      }
    },
    {
      "data": "43200000",
      "tgt": {
        "process": "makeHourRotation",
        "port": "divisor"
      }
    },
    {
      "data": "-720",
      "tgt": {
        "process": "makeTimezoneAngle",
        "port": "divisor"
      }
    },
    {
      "data": "start",
      "tgt": {
        "process": "core/Kick_qr1da",
        "port": "in"
      }
    },
    {
      "data": true,
      "tgt": {
        "process": "core/Kick_qr1da",
        "port": "data"
      }
    }
  ]
}
);