The Graph Editor [![Build Status](https://secure.travis-ci.org/flowhub/the-graph.png?branch=master)](http://travis-ci.org/flowhub/the-graph) [![MIT license](http://img.shields.io/badge/License-MIT-brightgreen.svg)](#license)
================

This project provides a set of [Web Components](http://www.polymer-project.org/) for viewing and editing flow-based programming graphs. The focus is on performance, usage of modern web technologies, and touchscreen friendliness.

The graph widgets have the following dependencies:

* [Polymer](http://www.polymer-project.org/) for providing various polyfills for emerging web technologies like custom elements and pointer events
* [React](http://facebook.github.io/react/) for the "virtual DOM" to make SVG fast
* [KLay Layered](http://rtsys.informatik.uni-kiel.de/confluence/display/KIELER/KLay+Layered) graph autolayout via [klayjs-noflo](https://github.com/noflo/klayjs-noflo)

The project is the graph editing tool in [NoFlo UI](https://github.com/noflo/noflo-ui), replacing the older [dataflow](https://github.com/meemoo/dataflow) graph editor.

## Examples

* Simple demo. [code](./examples/demo-simple.html) |
[Run](https://flowhub.github.io/the-graph/examples/demo-simple.html)
* Stresstest. [code](./examples/demo-full.html) |
[Run](https://flowhub.github.io/the-graph/examples/demo-full.html)
* Thumbnail. [code](./examples/demo-thumbnail.html) |
[Run](https://flowhub.github.io/the-graph/examples/demo-thumbnail.html)

## Building

Get dependencies and build:

    npm install
    npm run build

## Running

    npm start

And open [http://localhost:3000/examples/demo-full.html](http://localhost:3000/examples/demo-full.html)

## License

[The MIT License](./LICENSE-MIT.txt)
