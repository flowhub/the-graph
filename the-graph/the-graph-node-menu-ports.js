const React = require('react');
const createReactClass = require('create-react-class');

module.exports.register = function (context) {
  const { TheGraph } = context;

  TheGraph.config.nodeMenuPorts = {
    container: {},
    linesGroup: {
      className: 'context-ports-lines',
    },
    portsGroup: {
      className: 'context-ports-ports',
    },
    portPath: {
      className: 'context-port-path',
    },
    nodeMenuPort: {},
  };

  TheGraph.factories.menuPorts = {
    createNodeMenuPortsGroup: TheGraph.factories.createGroup,
    createNodeMenuPortsLinesGroup: TheGraph.factories.createGroup,
    createNodeMenuPortsPortsGroup: TheGraph.factories.createGroup,
    createNodeMenuPortsPortPath: TheGraph.factories.createPath,
    createNodeMenuPortsNodeMenuPort: createNodeMenuPort,
  };

  function createNodeMenuPort(options) {
    return TheGraph.NodeMenuPort(options);
  }

  TheGraph.NodeMenuPorts = React.createFactory(createReactClass({
    displayName: 'TheGraphNodeMenuPorts',
    render() {
      const portViews = [];
      const lines = [];

      const { scale } = this.props;
      const { ports } = this.props;
      const { deltaX } = this.props;
      const { deltaY } = this.props;

      const keys = Object.keys(this.props.ports);
      const h = keys.length * TheGraph.contextPortSize;
      const len = keys.length;
      for (let i = 0; i < len; i++) {
        const key = keys[i];
        const port = ports[key];

        const x = (this.props.isIn ? -100 : 100);
        const y = 0 - h / 2 + i * TheGraph.contextPortSize + TheGraph.contextPortSize / 2;
        const ox = (port.x - this.props.nodeWidth / 2) * scale + deltaX;
        const oy = (port.y - this.props.nodeHeight / 2) * scale + deltaY;

        // Make path from graph port to menu port
        const lineOptions = TheGraph.merge(TheGraph.config.nodeMenuPorts.portPath, { d: ['M', ox, oy, 'L', x, y].join(' ') });
        const line = TheGraph.factories.menuPorts.createNodeMenuPortsPortPath.call(this, lineOptions);

        let portViewOptions = {
          label: key,
          port,
          processKey: this.props.processKey,
          isIn: this.props.isIn,
          x,
          y,
          route: port.route,
          highlightPort: this.props.highlightPort,
        };
        portViewOptions = TheGraph.merge(TheGraph.config.nodeMenuPorts.nodeMenuPort, portViewOptions);
        const portView = TheGraph.factories.menuPorts.createNodeMenuPortsNodeMenuPort.call(this, portViewOptions);

        lines.push(line);
        portViews.push(portView);
      }

      let transform = '';
      if (this.props.translateX !== undefined) {
        transform = `translate(${this.props.translateX},${this.props.translateY})`;
      }

      const linesGroupOptions = TheGraph.merge(TheGraph.config.nodeMenuPorts.linesGroup, { children: lines });
      const linesGroup = TheGraph.factories.menuPorts.createNodeMenuPortsLinesGroup.call(this, linesGroupOptions);

      const portsGroupOptions = TheGraph.merge(TheGraph.config.nodeMenuPorts.portsGroup, { children: portViews });
      const portsGroup = TheGraph.factories.menuPorts.createNodeMenuPortsGroup.call(this, portsGroupOptions);

      const containerContents = [linesGroup, portsGroup];
      let containerOptions = {
        className: `context-ports context-ports-${this.props.isIn ? 'in' : 'out'}`,
        transform,
      };
      containerOptions = TheGraph.merge(TheGraph.config.nodeMenuPorts.container, containerOptions);
      return TheGraph.factories.menuPorts.createNodeMenuPortsGroup.call(this, containerOptions, containerContents);
    },
  }));
};
