
// https://stackoverflow.com/questions/15181452/how-to-save-export-inline-svg-styled-with-css-from-browser-to-image-file
function applyComputedStyle(element, defaults) {
    var style = getComputedStyle(element);
    var computedStyleStr = "";

    var ignoredNumber = 0;

    for (var i=0; i<style.length; i++) {
        var prop = style[i];
        var value = style.getPropertyValue(prop);
        var def = defaults.getPropertyValue(prop);
        var attr = element.getAttribute(prop);
        var include = !attr && prop.indexOf('-webkit') !== 0 && prop.indexOf('animation') !== 0 && prop.indexOf('transition') !== 0 && value !== "" && value !== def;
        if (include) {
            computedStyleStr += prop+":"+value+";";
        } else {
            ignoredNumber++;
        }
    }
    console.log('ignored', ignoredNumber, style.length);
    element.setAttribute('style', computedStyleStr);
}

function applyStyleManual(element) {
    var style = getComputedStyle(element);
    //var computedStyleStr = "";

    var transferToAttribute = [

    ]
    var transferToStyle = [
        'fill',
        'stroke',
        'stroke-width',
        'opacity',
        'text-anchor',
        'font-size',
        'visibility',
    ]

/*
position
top
left
*/
    transferToAttribute.forEach(function (name) {
        var s = style.getPropertyValue(name);
        if (s) {
            element.setAttribute(name, s);
        }
    });
    transferToStyle.forEach(function (name) {
        var s = style.getPropertyValue(name);
        if (s) {
            element.style[name] = s;
        }
    }); 



//    element.setAttribute('style', computedStyleStr);
}

function applyStyle(tree) {
    var all = tree.getElementsByTagName("*")
    console.log('l', all.length);

    var ignoreStyle = calculateDefaultStyle();
    for (var i=0; i<all.length; i++) {
        applyStyleManual(all[i], ignoreStyle);
    }
    return tree;
}

function calculateDefaultStyle() {
    var emptySvg = document.createElement('svg');
    document.body.appendChild(emptySvg);
    emptySvg.outerHTML = '<svg id="emptysvg" xmlns="http://www.w3.org/2000/svg" version="1.1" height="2"><g ffs="bs"></g></svg>';
    var s = getComputedStyle(emptySvg); 
    //document.body.removeChild(emptySvg);
    return s;
}


var svgNode = document.getElementById('editor').children[0].getElementsByTagName('svg')[0];
//svgNode = svgNode.cloneNode(true, true);
var withStyle = applyStyle(svgNode); 
// TODO: alternative is to inject the css file into SVG file?
// https://stackoverflow.com/questions/18434094/how-to-style-svg-with-external-css

// TODO: Draw to canvas, save as PNG/JPEG
// https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Drawing_DOM_objects_into_a_canvas

// TODO: use XmlSerializer?
//withStyle.outerHTML

//var ign = calculateDefaultStyle();
//ign

