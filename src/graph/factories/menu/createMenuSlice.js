import Config from '../../Config'
import {arcs, merge} from '../../utils'
import {
  createMenuSliceArcPath,
  createMenuSliceIconText,
  createMenuSliceLabelText,
  createMenuSliceIconLabelText,
  createMenuGroup
} from './'

export default function createMenuSlice(options) {
  var direction = options.direction;
  var arcPathOptions = merge(Config.menu.arcPath, { d: arcs[direction] });
  var children = [
    createMenuSliceArcPath(arcPathOptions)
  ];

  if (this.props.menu[direction]) {
    var slice = this.props.menu[direction];
    if (slice.icon) {
      var sliceIconTextOptions = {
        x: Config.menu.positions[direction+"IconX"],
        y: Config.menu.positions[direction+"IconY"],
        children: Config.FONT_AWESOME[ slice.icon ]
      };
      sliceIconTextOptions = merge(Config.menu.sliceIconText, sliceIconTextOptions);
      children.push(createMenuSliceIconText.call(this, sliceIconTextOptions));
    }
    if (slice.label) {
      var sliceLabelTextOptions = {
        x: Config.menu.positions[direction+"IconX"],
        y: Config.menu.positions[direction+"IconY"],
        children: slice.label
      };
      sliceLabelTextOptions = merge(Config.menu.sliceLabelText, sliceLabelTextOptions);
      children.push(createMenuSliceLabelText.call(this, sliceLabelTextOptions));
    }
    if (slice.iconLabel) {
      var sliceIconLabelTextOptions = {
        x: Config.menu.positions[direction+"LabelX"],
        y: Config.menu.positions[direction+"LabelY"],
        children: slice.iconLabel
      };
      sliceIconLabelTextOptions = merge(Config.menu.sliceIconLabelText, sliceIconLabelTextOptions);
      children.push(createMenuSliceIconLabelText.call(this, sliceIconLabelTextOptions));
    }
  }

  var containerOptions = {
    ref: direction,
    className: "context-slice context-node-info" + (this.state[direction+"tappable"] ? " click" : ""),
    children: children
  };
  containerOptions = merge(Config.menu.container, containerOptions);
  return createMenuGroup.call(this, containerOptions);
}
