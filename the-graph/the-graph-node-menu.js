(function (context) {
  "use strict";

  var TheGraph = context.TheGraph;

  TheGraph.config.nodeMenu = {
    container: {
      className: "context-node"
    },
    inports: {},
    outports: {},
    menu: {
      x: 0,
      y: 0
    }
  };

  TheGraph.factories.nodeMenu = {
    createNodeMenuGroup: TheGraph.factories.createGroup,
    createNodeMenuInports: createNodeMenuPorts,
    createNodeMenuOutports: createNodeMenuPorts,
    createNodeMenuMenu: createNodeMenuMenu
  };

  function createNodeMenuPorts(options) {
    return TheGraph.NodeMenuPorts(options);
  }

  function createNodeMenuMenu(options) {
    return TheGraph.Menu(options);
  }

  TheGraph.NodeMenu = React.createFactory( React.createClass({
    displayName: "TheGraphNodeMenu",
    radius: 72,
    stopPropagation: function (event) {
      // Don't drag graph
      event.stopPropagation();
    },
    componentDidMount: function () {
      // Prevent context menu
      this.getDOMNode().addEventListener("contextmenu", function (event) {
        event.stopPropagation();
        event.preventDefault();
      }, false);
    },
    render: function() {
      var scale = this.props.node.props.app.state.scale;
      var ports = this.props.ports;
      var deltaX = this.props.deltaX;
      var deltaY = this.props.deltaY;

      var inportsOptions = {
        ports: ports.inports,
        isIn: true,
        scale: scale,
        processKey: this.props.processKey,
        deltaX: deltaX,
        deltaY: deltaY,
        nodeWidth: this.props.nodeWidth,
        nodeHeight: this.props.nodeHeight,
        highlightPort: this.props.highlightPort
      };

      inportsOptions = TheGraph.merge(TheGraph.config.nodeMenu.inports, inportsOptions);
      var inports = TheGraph.factories.nodeMenu.createNodeMenuInports.call(this, inportsOptions);

      var outportsOptions = {
        ports: ports.outports,
        isIn: false,
        scale: scale,
        processKey: this.props.processKey,
        deltaX: deltaX,
        deltaY: deltaY,
        nodeWidth: this.props.nodeWidth,
        nodeHeight: this.props.nodeHeight,
        highlightPort: this.props.highlightPort
      };

      outportsOptions = TheGraph.merge(TheGraph.config.nodeMenu.outports, outportsOptions);
      var outports = TheGraph.factories.nodeMenu.createNodeMenuOutports.call(this, outportsOptions);

      var menuOptions = {
        menu: this.props.menu,
        options: this.props.options,
        triggerHideContext: this.props.triggerHideContext,
        icon: this.props.icon,
        label: this.props.label
      };

      menuOptions = TheGraph.merge(TheGraph.config.nodeMenu.menu, menuOptions);
      var menu = TheGraph.factories.nodeMenu.createNodeMenuMenu.call(this, menuOptions);

      var children = [
        inports, outports, menu
      ];

      var containerOptions = {
        transform: "translate("+this.props.x+","+this.props.y+")",
        children: children
      };
      containerOptions = TheGraph.merge(TheGraph.config.nodeMenu.container, containerOptions);
      return TheGraph.factories.nodeMenu.createNodeMenuGroup.call(this, containerOptions);

    }
  }));


})(this);
