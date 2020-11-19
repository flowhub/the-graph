const React = require('react');
const ReactDOM = require('react-dom');
const createReactClass = require('create-react-class');

module.exports.register = function (context) {
  const { TheGraph } = context;

  TheGraph.config.nodeMenuPort = {
    container: {},
    backgroundRect: {
      rx: TheGraph.config.nodeRadius,
      ry: TheGraph.config.nodeRadius,
      height: TheGraph.contextPortSize - 1,
    },
    circle: {
      r: 10,
    },
    text: {},
  };

  TheGraph.factories.nodeMenuPort = {
    createNodeMenuPortGroup: TheGraph.factories.createGroup,
    createNodeMenuBackgroundRect: TheGraph.factories.createRect,
    createNodeMenuPortCircle: TheGraph.factories.createCircle,
    createNodeMenuPortText: TheGraph.factories.createText,
  };

  TheGraph.NodeMenuPort = React.createFactory(createReactClass({
    displayName: 'TheGraphNodeMenuPort',
    componentDidMount() {
      ReactDOM.findDOMNode(this).addEventListener('tap', this.edgeStart);
    },
    edgeStart(event) {
      // Don't tap graph
      event.stopPropagation();

      const port = {
        process: this.props.processKey,
        port: this.props.label,
        type: this.props.port.type,
      };

      const edgeStartEvent = new CustomEvent('the-graph-edge-start', {
        detail: {
          isIn: this.props.isIn,
          port,
          route: this.props.route,
        },
        bubbles: true,
      });
      ReactDOM.findDOMNode(this).dispatchEvent(edgeStartEvent);
    },
    render() {
      const labelLen = this.props.label.length;
      const bgWidth = (labelLen > 12 ? labelLen * 8 + 40 : 120);
      // Highlight compatible port
      const { highlightPort } = this.props;
      const highlight = (highlightPort && highlightPort.isIn === this.props.isIn && highlightPort.type === this.props.port.type);

      let rectOptions = {
        className: `context-port-bg${highlight ? ' highlight' : ''}`,
        x: this.props.x + (this.props.isIn ? -bgWidth : 0),
        y: this.props.y - TheGraph.contextPortSize / 2,
        width: bgWidth,
      };

      rectOptions = TheGraph.merge(TheGraph.config.nodeMenuPort.backgroundRect, rectOptions);
      const rect = TheGraph.factories.nodeMenuPort.createNodeMenuBackgroundRect.call(this, rectOptions);

      let circleOptions = {
        className: `context-port-hole stroke route${this.props.route}`,
        cx: this.props.x,
        cy: this.props.y,
      };
      circleOptions = TheGraph.merge(TheGraph.config.nodeMenuPort.circle, circleOptions);
      const circle = TheGraph.factories.nodeMenuPort.createNodeMenuPortCircle.call(this, circleOptions);

      let textOptions = {
        className: `context-port-label fill route${this.props.route}`,
        x: this.props.x + (this.props.isIn ? -20 : 20),
        y: this.props.y,
        children: this.props.label.replace(/(.*)\/(.*)(_.*)\.(.*)/, '$2.$4'),
      };

      textOptions = TheGraph.merge(TheGraph.config.nodeMenuPort.text, textOptions);
      const text = TheGraph.factories.nodeMenuPort.createNodeMenuPortText.call(this, textOptions);

      const containerContents = [rect, circle, text];

      const containerOptions = TheGraph.merge(TheGraph.config.nodeMenuPort.container, { className: `context-port click context-port-${this.props.isIn ? 'in' : 'out'}` });
      return TheGraph.factories.nodeMenuPort.createNodeMenuPortGroup.call(this, containerOptions, containerContents);
    },
  }));
};
