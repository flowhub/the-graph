const React = require('react');
const ReactDOM = require('react-dom');
const createReactClass = require('create-react-class');

module.exports.register = function (context) {
  const { TheGraph } = context;

  TheGraph.config.group = {
    container: {
      className: 'group',
    },
    boxRect: {
      rx: TheGraph.config.nodeRadius,
      ry: TheGraph.config.nodeRadius,
    },
    labelText: {
      className: 'group-label',
    },
    descriptionText: {
      className: 'group-description',
    },
  };

  TheGraph.factories.group = {
    createGroupGroup: TheGraph.factories.createGroup,
    createGroupBoxRect: TheGraph.factories.createRect,
    createGroupLabelText: TheGraph.factories.createText,
    createGroupDescriptionText: TheGraph.factories.createText,
  };

  // Group view

  TheGraph.Group = React.createFactory(createReactClass({
    displayName: 'TheGraphGroup',
    getInitialState() {
      return {
        moving: false,
        lastTrackX: null,
        lastTrackY: null,
      };
    },
    componentDidMount() {
      // Move group
      const dragNode = ReactDOM.findDOMNode(this.refs.events);
      dragNode.addEventListener('panstart', this.onTrackStart);

      // Context menu
      const domNode = ReactDOM.findDOMNode(this);
      if (this.props.showContext) {
        domNode.addEventListener('contextmenu', this.showContext);
        domNode.addEventListener('press', this.showContext);
      }
    },
    showContext(event) {
      // Don't show native context menu
      event.preventDefault();

      // Don't tap graph on hold event
      if (event.stopPropagation) { event.stopPropagation(); }
      if (event.preventTap) { event.preventTap(); }

      // Get mouse position
      if (event.gesture) {
        event = event.gesture.srcEvent; // unpack hammer.js gesture event
      }
      let x = event.x || event.clientX || 0;
      let y = event.y || event.clientY || 0;
      if (event.touches && event.touches.length) {
        x = event.touches[0].clientX;
        y = event.touches[0].clientY;
      }

      // App.showContext
      this.props.showContext({
        element: this,
        type: (this.props.isSelectionGroup ? 'selection' : 'group'),
        x,
        y,
        graph: this.props.graph,
        itemKey: this.props.label,
        item: this.props.item,
      });
    },
    getContext(menu, options, hide) {
      return TheGraph.Menu({
        menu,
        options,
        label: this.props.label,
        triggerHideContext: hide,
      });
    },
    onTrackStart(event) {
      // Don't pan graph
      event.stopPropagation();
      this.setState({ moving: true });
      this.setState({ lastTrackX: 0, lastTrackY: 0 });

      const dragNode = ReactDOM.findDOMNode(this.refs.events);
      dragNode.addEventListener('panmove', this.onTrack);
      dragNode.addEventListener('panend', this.onTrackEnd);

      this.props.graph.startTransaction('movegroup');
    },
    onTrack(event) {
      // Don't pan graph
      event.stopPropagation();

      // Reconstruct relative motion since last event
      const x = event.gesture.deltaX;
      const y = event.gesture.deltaY;
      const movementX = x - this.state.lastTrackX;
      const movementY = y - this.state.lastTrackY;

      const deltaX = Math.round(movementX / this.props.scale);
      const deltaY = Math.round(movementY / this.props.scale);

      this.setState({ lastTrackX: x, lastTrackY: y });
      this.props.triggerMoveGroup(this.props.item.nodes, deltaX, deltaY);
    },
    onTrackEnd(event) {
      this.setState({ moving: false });
      // Don't pan graph
      event.stopPropagation();

      // Snap to grid
      this.props.triggerMoveGroup(this.props.item.nodes);

      const dragNode = ReactDOM.findDOMNode(this.refs.events);
      dragNode.addEventListener('panmove', this.onTrack);
      dragNode.addEventListener('panend', this.onTrackEnd);

      this.setState({ lastTrackX: null, lastTrackY: null });
      this.props.graph.endTransaction('movegroup');
    },
    render() {
      const x = this.props.minX - TheGraph.config.nodeWidth / 2;
      const y = this.props.minY - TheGraph.config.nodeHeight / 2;
      const color = (this.props.color ? this.props.color : 0);
      const selection = (this.props.isSelectionGroup ? ' selection drag' : '');

      let boxRectOptions = {
        x,
        y,
        width: this.props.maxX - x + TheGraph.config.nodeWidth * 0.5,
        height: this.props.maxY - y + TheGraph.config.nodeHeight * 0.75,
        className: `group-box color${color}${selection}`,
      };
      boxRectOptions = TheGraph.merge(TheGraph.config.group.boxRect, boxRectOptions);
      const boxRect = TheGraph.factories.group.createGroupBoxRect.call(this, boxRectOptions);

      let labelTextOptions = {
        x: x + TheGraph.config.nodeRadius,
        y: y + 9,
        children: this.props.label,
      };
      labelTextOptions = TheGraph.merge(TheGraph.config.group.labelText, labelTextOptions);
      const labelText = TheGraph.factories.group.createGroupLabelText.call(this, labelTextOptions);

      let descriptionTextOptions = {
        x: x + TheGraph.config.nodeRadius,
        y: y + 24,
        children: this.props.description,
      };
      descriptionTextOptions = TheGraph.merge(TheGraph.config.group.descriptionText, descriptionTextOptions);
      const descriptionText = TheGraph.factories.group.createGroupDescriptionText.call(this, descriptionTextOptions);

      // When moving, expand bounding box of element
      // to catch events when pointer moves faster than we can move the element
      const eventOptions = {
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
        const extend = 1000;
        eventOptions.width += extend * 2;
        eventOptions.height += extend * 2;
        eventOptions.x -= extend;
        eventOptions.y -= extend;
      }
      const eventCatcher = TheGraph.factories.createRect(eventOptions);

      const groupContents = [
        boxRect,
        labelText,
        descriptionText,
        eventCatcher,
      ];

      const containerOptions = TheGraph.merge(TheGraph.config.group.container, {});
      return TheGraph.factories.group.createGroupGroup.call(this, containerOptions, groupContents);
    },
  }));
};
