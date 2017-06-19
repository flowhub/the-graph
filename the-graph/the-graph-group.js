module.exports.register = function (context) {

  var TheGraph = context.TheGraph;

  TheGraph.config.group = {
    container: {
      className: "group"
    },
    boxRect: {
      ref: "box",
      rx: TheGraph.config.nodeRadius,
      ry: TheGraph.config.nodeRadius
    },
    labelText: {
      ref: "label",
      className: "group-label drag"
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

  TheGraph.Group = React.createFactory( React.createClass({
    displayName: "TheGraphGroup",
    componentDidMount: function () {

      // Move group
      // either by label or by box
      var dragRefName = (this.props.isSelectionGroup) ? 'box' : 'label';
      var dragNode = ReactDOM.findDOMNode(this.refs[dragRefName]);
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

      var dragRefName = (this.props.isSelectionGroup) ? 'box' : 'label';
      var dragNode = ReactDOM.findDOMNode(this.refs[dragRefName]);
      dragNode.addEventListener("panmove", this.onTrack);
      dragNode.addEventListener("panend", this.onTrackEnd);

      this.props.graph.startTransaction('movegroup');
    },
    onTrack: function (event) {
      // Don't pan graph
      event.stopPropagation();

      var deltaX = Math.round( event.gesture.srcEvent.movementX / this.props.scale );
      var deltaY = Math.round( event.gesture.srcEvent.movementY / this.props.scale );

      this.props.triggerMoveGroup(this.props.item.nodes, deltaX, deltaY);
    },
    onTrackEnd: function (event) {
      // Don't pan graph
      event.stopPropagation();

      // Snap to grid
      this.props.triggerMoveGroup(this.props.item.nodes);

      var dragRefName = (this.props.isSelectionGroup) ? 'box' : 'label';
      var dragNode = ReactDOM.findDOMNode(this.refs[dragRefName]);
      dragNode.addEventListener("panmove", this.onTrack);
      dragNode.addEventListener("panend", this.onTrackEnd);

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
        className: "group-box color"+color + selection
      };
      boxRectOptions = TheGraph.merge(TheGraph.config.group.boxRect, boxRectOptions);
      var boxRect =  TheGraph.factories.group.createGroupBoxRect.call(this, boxRectOptions);

      var labelTextOptions = {
        x: x + TheGraph.config.nodeRadius,
        y: y + 9,
        children: this.props.label
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

      var groupContents = [
        boxRect,
        labelText,
        descriptionText
      ];

      var containerOptions = TheGraph.merge(TheGraph.config.group.container, {});
      return TheGraph.factories.group.createGroupGroup.call(this, containerOptions, groupContents);

    }
  }));


};
