The Graph Editor [![MIT license](http://img.shields.io/badge/License-MIT-brightgreen.svg)](#license)
================

This project provides a set [React](https://facebook.github.io/react) components for viewing and editing node-based graphs.
The focus is on graphs used for dataflow and [Flow-based programming](https://en.wikipedia.org/wiki/Flow-based_programming).

The graph structure is stored by [fbp-graph](https://github.com/flowbased/fbp-graph), which supports extendable metadata and undo/redo.

You can optionally use [klayjs-noflo](https://github.com/noflo/klayjs-noflo) for automatic layout of graphs.

`the-graph` is used as the editor in the [Flowhub IDE](https://flowhub.io).

## Examples

* Basic demo. [code](./examples/demo-simple.html) |
[Run](https://flowhub.github.io/the-graph/examples/demo-simple.html)
* Stresstest. [code](./examples/demo-full.html) |
[Run](https://flowhub.github.io/the-graph/examples/demo-full.html)
* Thumbnail. [code](./examples/demo-thumbnail.html) |
[Run](https://flowhub.github.io/the-graph/examples/demo-thumbnail.html)

## Using

Install via NPM

    npm install the-graph

See the examples for how to include the `.js` and `.css` files, and API usage.

## License

[The MIT License](./LICENSE-MIT.txt)

## Support
[![Flowhub logo](https://flowhub.io/assets/banner-github.png)](https://flowhub.io)

the-graph is a part of [Flowhub](https://flowhub.io), a platform for building robust [IoT systems](https://flowhub.io/iot) and web services.<br>
We offer an [Integrated Development Environment](https://app.flowhub.io) and [consulting services](https://flowhub.io/consulting).

## Developing

Clone the repo

    git clone https://github.com/flowhub/the-graph.git # or your own fork on Github
    cd the-graph

Run tests, watch for changes

    npm start

Open [http://localhost:3000/spec/runner.html](http://localhost:3000/spec/runner.html) for the automated tests,
or [http://localhost:3000/examples/demo-full.html](http://localhost:3000/examples/demo-full.html) for interactive demo.

Send pull requests on Github!
