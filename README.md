The Graph Editor [![Build Status](https://secure.travis-ci.org/the-grid/the-graph.png?branch=master)](http://travis-ci.org/the-grid/the-graph) [![MIT license](http://img.shields.io/badge/License-MIT-brightgreen.svg)](#license)
================

This project provides a set of [Web Components](http://www.polymer-project.org/) for viewing and editing flow-based programming graphs. The focus is on performance, usage of modern web technologies, and touchscreen friendliness.

The graph widgets have the following dependencies:

* [Polymer](http://www.polymer-project.org/) for providing various polyfills for emerging web technologies like custom elements and pointer events
* [React](http://facebook.github.io/react/) for the "virtual DOM" to make SVG fast
* [KLay Layered](http://rtsys.informatik.uni-kiel.de/confluence/display/KIELER/KLay+Layered) graph autolayout via [KLayJS](https://github.com/automata/klay-js)

The project is the graph editing tool in [NoFlo UI](https://github.com/noflo/noflo-ui), replacing the older [dataflow](https://github.com/meemoo/dataflow) graph editor.

## Installation

Get dependencies and build:

    npm install
    npm run build

## Running

    npm start

And open http://localhost:3000/the-graph-editor/index.html

## License

[The MIT License](./LICENSE-MIT.txt)
