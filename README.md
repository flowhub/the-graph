The Graph Editor [![Build Status](https://secure.travis-ci.org/the-grid/the-graph.png?branch=master)](http://travis-ci.org/the-grid/the-graph)
================

This project provides a set of [Web Components](http://www.polymer-project.org/) for viewing and editing flow-based programming graphs. The focus is on performance, usage of modern web technologies, and touchscreen friendliness.

The graph widgets have the following dependencies:

* [Polymer](http://www.polymer-project.org/) for providing various polyfills for emerging web technologies like custom elements and pointer events
* [the-behavior](https://github.com/the-grid/the-behavior) for user interactions and gestures, using [NoFlo](http://noflojs.org/) on the background
* [GSS](http://gridstylesheets.org/) for constraint-based layout handling

Currently the project is still in a prototype state, but eventually the plan is to utilize it as the graph editing tool in [NoFlo UI](https://github.com/noflo/noflo-ui), replacing the older [dataflow](https://github.com/meemoo/dataflow) graph editor.

## Installation

Get these dependencies using [Bower](http://bower.io/):

    $ bower install

## Running

You need a local web server. Place these files into somewhere where they can be served, and access the `the-graph-editor/index.html` file with your browser.


[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/the-grid/the-graph/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

