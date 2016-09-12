import base from './base'

export default {
  radius: 72,
  positions: {
    n4IconX: 0,
    n4IconY: -52,
    n4LabelX: 0,
    n4LabelY: -35,
    s4IconX: 0,
    s4IconY: 52,
    s4LabelX: 0,
    s4LabelY: 35,
    e4IconX: 45,
    e4IconY: -5,
    e4LabelX: 45,
    e4LabelY: 15,
    w4IconX: -45,
    w4IconY: -5,
    w4LabelX: -45,
    w4LabelY: 15
  },
  container: {
    className: 'context-menu'
  },
  arcPath: {
    className: 'context-arc context-node-info-bg'
  },
  sliceIconText: {
    className: 'icon context-icon context-node-info-icon'
  },
  sliceLabelText: {
    className: 'context-arc-label'
  },
  sliceIconLabelText: {
    className: 'context-arc-icon-label'
  },
  circleXPath: {
    className: 'context-circle-x',
    d: 'M -51 -51 L 51 51 M -51 51 L 51 -51'
  },
  outlineCircle: {
    className: 'context-circle'
  },
  labelText: {
    className: 'context-node-label'
  },
  iconRect: {
    className: 'context-node-rect',
    x: -24,
    y: -24,
    width: 48,
    height: 48,
    rx: base.nodeRadius,
    ry: base.nodeRadius
  }
};
