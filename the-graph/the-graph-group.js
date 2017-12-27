var React = require('react');
var ReactDOM = require('react-dom');
var createReactClass = require('create-react-class');

module.exports.register = function (context) {

  var TheGraph = context.TheGraph;

  TheGraph.config.group = {
    container: {
      className: "group"
    },
    boxRect: {
      rx: TheGraph.config.nodeRadius,
      ry: TheGraph.config.nodeRadius
    },
    labelText: {
      className: "group-label"
    },
    descriptionText: {
      className: "group-description"
    }
  };

  TheGraph.factories.group = {
    createGroupGroup: TheGraph.factories.createGroup,
    createGroupBoxRect: TheGraph.factories.createRect,
    createGroupLabelText: TheGraph.factories.createText,
    createGroupDescriptionText: TheGraph.factories.createText
  };

  // Group view

  TheGraph.Group = React.createFactory( createReactClass({
    displayName: "TheGraphGroup",
    getInitialState: function () {
        return {
            moving: false,
            lastTrackX: null,
            lastTrackY: null,
        };
    },
    componentDidMount: function () {

      // Move group
      var dragNode = ReactDOM.findDOMNode(this.refs.events);
      dragNode.addEventListener('panstart', this.onTrackStart);

      // Context menu
      var domNode = ReactDOM.findDOMNode(this);
      if (this.props.showContext) {
        domNode.addEventListener("contextmenu", this.showContext);
        domNode.addEventListener("press", this.showContext);
      }

    },
    showContext: function (event) {
      // Don't show native context menu
      event.preventDefault();

      // Don't tap graph on hold event
      if (event.stopPropagation) { event.stopPropagation(); }
      if (event.preventTap) { event.preventTap(); }

      // Get mouse position
      if (event.gesture) {
        event = event.gesture.srcEvent; // unpack hammer.js gesture event 
      }
      var x = event.x || event.clientX || 0;
      var y = event.y || event.clientY || 0;
      if (event.touches && event.touches.length) {
        x = event.touches[0].clientX;
        y = event.touches[0].clientY;
      }

      // App.showContext
      this.props.showContext({
        element: this,
        type: (this.props.isSelectionGroup ? "selection" : "group"),
        x: x,
        y: y,
        graph: this.props.graph,
        itemKey: this.props.label,
        item: this.props.item
      });
    },
    getContext: function (menu, options, hide) {
      return TheGraph.Menu({
        menu: menu,
        options: options,
        label: this.props.label,
        triggerHideContext: hide
      });
    },
    onTrackStart: function (event) {
      // Don't pan graph
      event.stopPropagation();
      this.setState({ moving: true });
      this.setState({ lastTrackX: 0, lastTrackY: 0});

      var dragNode = ReactDOM.findDOMNode(this.refs.events);
      dragNode.addEventListener("panmove", this.onTrack);
      dragNode.addEventListener("panend", this.onTrackEnd);

      this.props.graph.startTransaction('movegroup');
    },
    onTrack: function (event) {
      // Don't pan graph
      event.stopPropagation();

      // Reconstruct relative motion since last event
      var x = event.gesture.deltaX;
      var y = event.gesture.deltaY;
      var movementX = x - this.state.lastTrackX;
      var movementY = y - this.state.lastTrackY;

      var deltaX = Math.round( movementX / this.props.scale );
      var deltaY = Math.round( movementY / this.props.scale );

      this.setState({ lastTrackX: x , lastTrackY: y });
      this.props.triggerMoveGroup(this.props.item.nodes, deltaX, deltaY);
    },
    onTrackEnd: function (event) {
      this.setState({ moving: false });
      // Don't pan graph
      event.stopPropagation();

      // Snap to grid
      this.props.triggerMoveGroup(this.props.item.nodes);

      var dragNode = ReactDOM.findDOMNode(this.refs.events);
      dragNode.addEventListener("panmove", this.onTrack);
      dragNode.addEventListener("panend", this.onTrackEnd);

      this.setState({ lastTrackX: null, lastTrackY: null});
      this.props.graph.endTransaction('movegroup');
    },
    render: function() {
      var x = this.props.minX - TheGraph.config.nodeWidth / 2;
      var y = this.props.minY - TheGraph.config.nodeHeight / 2;
      var color = (this.props.color ? this.props.color : 0);
      var selection = (this.props.isSelectionGroup ? ' selection drag' : '');

      var boxRectOptions = {
        x: x,
        y: y,
        width: this.props.maxX - x + TheGraph.config.nodeWidth*0.5,
        height: this.props.maxY - y + TheGraph.config.nodeHeight*0.75,
        className: "group-box color"+color + selection,
      };
      boxRectOptions = TheGraph.merge(TheGraph.config.group.boxRect, boxRectOptions);
      var boxRect =  TheGraph.factories.group.createGroupBoxRect.call(this, boxRectOptions);

      var labelTextOptions = {
        x: x + TheGraph.config.nodeRadius,
        y: y + 9,
        children: this.props.label,
      };
      labelTextOptions = TheGraph.merge(TheGraph.config.group.labelText, labelTextOptions);
      var labelText = TheGraph.factories.group.createGroupLabelText.call(this, labelTextOptions);

      var descriptionTextOptions = {
        x: x + TheGraph.config.nodeRadius,
        y: y + 24,
        children: this.props.description
      };
      descriptionTextOptions = TheGraph.merge(TheGraph.config.group.descriptionText, descriptionTextOptions);
      var descriptionText = TheGraph.factories.group.createGroupDescriptionText.call(this, descriptionTextOptions);

      // When moving, expand bounding box of element
      // to catch events when pointer moves faster than we can move the element
      var eventOptions = {
        className: 'eventcatcher drag',
        ref: 'events',
      };
      if (this.props.isSelectionGroup) {
        eventOptions.x = boxRectOptions.x;
        eventOptions.y = boxRectOptions.y;
        eventOptions.width = boxRectOptions.width;
        eventOptions.height = boxRectOptions.height;
      } else {
        eventOptions.x = boxRectOptions.x;
        eventOptions.y = boxRectOptions.y;
        eventOptions.width = 24 * this.props.label.length * 0.75;
        eventOptions.height = 24 * 2;
      }
      if (this.state.moving) {
        var extend = 1000;
        eventOptions.width += extend*2;
        eventOptions.height += extend*2;
        eventOptions.x -= extend;
        eventOptions.y -= extend;
      }
      var eventCatcher = TheGraph.factories.createRect(eventOptions);

      var groupContents = [
        boxRect,
        labelText,
        descriptionText,
        eventCatcher,
      ];

      var containerOptions = TheGraph.merge(TheGraph.config.group.container, {});
      return TheGraph.factories.group.createGroupGroup.call(this, containerOptions, groupContents);

    }
  }));


};
