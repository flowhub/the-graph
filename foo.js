
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

// FIXME: background is missing
// 
// FIXME: icons are broken
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



function renderImage(svgNode, options, callback) {
    if (!options) { options = {}; }
    options.format |= 'png';

    // FIXME: make copy
    //svgNode = svgNode.cloneNode(true, true);

    // Note: alternative to inlining style is to inject the CSS file into SVG file?
    // https://stackoverflow.com/questions/18434094/how-to-style-svg-with-external-css
    var withStyle = applyStyle(svgNode);

    var serializer = new XMLSerializer();
    var svgData = serializer.serializeToString(withStyle);

    if (options.format == 'svg') {
        return callback(null, svgData);
    }

    var DOMURL = window.URL || window.webkitURL || window;

    var img = new Image();
    var svg = new Blob([svgData], {type: 'image/svg+xml'});
    var svgUrl = DOMURL.createObjectURL(svg);   

    var canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 1000;

    // TODO: allow resizing?
    // TODO: support background
    var ctx = canvas.getContext('2d');
    img.onerror = function(err) {
        return callback(err);
        console.error('load err', err);
    }
    img.onload = function() {
        console.log('image loaded');
        ctx.drawImage(img, 0, 0);
        DOMURL.revokeObjectURL(svgUrl);

        // TEMP
        return callback(null, canvas.toDataURL(options.format))
    }
    //console.log('loading image', svgUrl);
    img.src = svgUrl;

    //document.body.appendChild(img)
}


// FIXME: render graph to DOM
// FIXME: Set zoom-level, width,height so that whole graph shows with all info 

// TEMP: testing
var svgNode = document.getElementById('editor').children[0].getElementsByTagName('svg')[0];
var options = {};
renderImage(svgNode, options, function(err, imageUrl) {
    imageUrl = imageUrl.replace("image/png", "image/octet-stream"); // avoid browser complaining about unsupported
    window.location.href = imageUrl;
})

