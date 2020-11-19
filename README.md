The Graph Editor [![MIT license](http://img.shields.io/badge/License-MIT-brightgreen.svg)](#license)
================

This project provides a set [React](https://facebook.github.io/react) components for viewing and editing node-based graphs.
The focus is on graphs used for dataflow and [Flow-based programming](https://en.wikipedia.org/wiki/Flow-based_programming).

The graph structure is stored by [fbp-graph](https://github.com/flowbased/fbp-graph), which supports extendable metadata and undo/redo.

You can optionally use [klayjs-noflo](https://github.com/noflo/klayjs-noflo) for automatic layout of graphs.

`the-graph` is used as the editor in the [Flowhub IDE](https://app.flowhub.io).

## Examples

* Basic demo. [code](./examples/demo-simple.js) |
[Run](https://flowhub.github.io/the-graph/demo-simple.html)
* Stresstest. [code](./examples/demo-full.js) |
[Run](https://flowhub.github.io/the-graph/demo-full.html)
* Thumbnail. [code](./examples/demo-thumbnail.js) |
[Run](https://flowhub.github.io/the-graph/demo-thumbnail.html)

## Using

Install via NPM

    npm install the-graph

See the examples for how to include the `.js` and `.css` files, and API usage.

## License

[The MIT License](./LICENSE-MIT.txt)

## Support
Please refer to <https://noflojs.org/support/>.

## Developing

Clone the repo

    git clone https://github.com/flowhub/the-graph.git # or your own fork on Github
    cd the-graph

Install dependencies and build

    npm install
    npm run build

Run the demo server

    npm start

or <http://localhost:3000/examples/demo-full.html> for interactive demo.

Send pull requests on Github!
