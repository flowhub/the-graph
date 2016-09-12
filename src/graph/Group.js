import React, {Component} from 'react'
import {merge} from './utils'
import {findDOMNode} from 'react-dom'
import Menu from './Menu'
import Config from './Config'
import {
  createGroupBoxRect,
  createGroupLabelText,
  createGroupDescriptionText,
  createGroupGroup
} from './factories/group'

// Group view
export default class TheGraphGroup extends Component {
  componentDidMount () {
    // Move group
    if (this.props.isSelectionGroup) {
      // Drag selection by bg
      findDOMNode(this.refs.box).addEventListener("trackstart", this.onTrackStart);
    } else {
      findDOMNode(this.refs.label).addEventListener("trackstart", this.onTrackStart);
    }

    var domNode = findDOMNode(this);

    // Don't pan under menu
    domNode.addEventListener("trackstart", this.dontPan);

    // Context menu
    if (this.props.showContext) {
      domNode.addEventListener("contextmenu", this.showContext);
      domNode.addEventListener("hold", this.showContext);
    }
  }
  showContext (event) {
    // Don't show native context menu
    event.preventDefault();

    // Don't tap graph on hold event
    event.stopPropagation();
    if (event.preventTap) { event.preventTap(); }

    // Get mouse position
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
  }
  getContext (menu, options, hide) {
    return Menu({
      menu: menu,
      options: options,
      label: this.props.label,
      triggerHideContext: hide
    });
  }
  dontPan (event) {
    // Don't drag under menu
    if (this.props.app.menuShown) {
      event.stopPropagation();
    }
  }
  onTrackStart (event) {
    // Don't drag graph
    event.stopPropagation();

    if (this.props.isSelectionGroup) {
      var box = findDOMNode(this.refs.box);
      box.addEventListener("track", this.onTrack);
      box.addEventListener("trackend", this.onTrackEnd);
    } else {
      var label = findDOMNode(this.refs.label);
      label.addEventListener("track", this.onTrack);
      label.addEventListener("trackend", this.onTrackEnd);
    }

    this.props.graph.startTransaction('movegroup');
  }
  onTrack (event) {
    // Don't fire on graph
    event.stopPropagation();

    var deltaX = Math.round( event.ddx / this.props.scale );
    var deltaY = Math.round( event.ddy / this.props.scale );

    this.props.triggerMoveGroup(this.props.item.nodes, deltaX, deltaY);
  }
  onTrackEnd (event) {
    // Don't fire on graph
    event.stopPropagation();

    // Don't tap graph (deselect)
    event.preventTap();

    // Snap to grid
    this.props.triggerMoveGroup(this.props.item.nodes);

    if (this.props.isSelectionGroup) {
      var box = findDOMNode(this.refs.box);
      box.removeEventListener("track", this.onTrack);
      box.removeEventListener("trackend", this.onTrackEnd);
    } else {
      var label = findDOMNode(this.refs.label);
      label.removeEventListener("track", this.onTrack);
      label.removeEventListener("trackend", this.onTrackEnd);
    }

    this.props.graph.endTransaction('movegroup');
  }
  render () {
    var x = this.props.minX - Config.base.config.nodeWidth / 2;
    var y = this.props.minY - Config.base.config.nodeHeight / 2;
    var color = (this.props.color ? this.props.color : 0);
    var selection = (this.props.isSelectionGroup ? ' selection drag' : '');
    var boxRectOptions = {
      x: x,
      y: y,
      width: this.props.maxX - x + Config.base.config.nodeWidth*0.5,
      height: this.props.maxY - y + Config.base.config.nodeHeight*0.75,
      className: "group-box color"+color + selection
    };
    boxRectOptions = merge(Config.group.boxRect, boxRectOptions);
    var boxRect =  createGroupBoxRect.call(this, boxRectOptions);

    var labelTextOptions = {
      x: x + Config.base.config.nodeRadius,
      y: y + 9,
      children: this.props.label
    };
    labelTextOptions = merge(Config.group.labelText, labelTextOptions);
    var labelText = createGroupLabelText.call(this, labelTextOptions);

    var descriptionTextOptions = {
      x: x + Config.base.nodeRadius,
      y: y + 24,
      children: this.props.description
    };
    descriptionTextOptions = merge(Config.group.descriptionText, descriptionTextOptions);
    var descriptionText = createGroupDescriptionText.call(this, descriptionTextOptions);

    var groupContents = [
      boxRect,
      labelText,
      descriptionText
    ];

    var containerOptions = merge(Config.group.container, {});

    return createGroupGroup.call(this, containerOptions, groupContents);
  }
}
