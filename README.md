The Graph Editor [![Build Status](https://secure.travis-ci.org/the-grid/the-graph.png?branch=master)](http://travis-ci.org/the-grid/the-graph)
================

This project provides a set of [Web Components](http://www.polymer-project.org/) for viewing and editing flow-based programming graphs. The focus is on performance, usage of modern web technologies, and touchscreen friendliness.

The graph widgets have the following dependencies:

* [Polymer](http://www.polymer-project.org/) for providing various polyfills for emerging web technologies like custom elements and pointer events
* [React](http://facebook.github.io/react/) for the "virtual DOM" to make SVG fast

The project is the graph editing tool in [NoFlo UI](https://github.com/noflo/noflo-ui), replacing the older [dataflow](https://github.com/meemoo/dataflow) graph editor.

## Installation

Get these dependencies using [Bower](http://bower.io/):

    $ bower install

## Running

You need a local web server. Place these files into somewhere where they can be served, and access the `the-graph-editor/index.html` file with your browser.
