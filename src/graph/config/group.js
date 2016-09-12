import base from './base'

export default {
  container: {
    className: 'group'
  },
  boxRect: {
    ref: 'box',
    rx: base.nodeRadius,
    ry: base.nodeRadius
  },
  labelText: {
    ref: 'label',
    className: 'group-label drag'
  },
  descriptionText: {
    className: 'group-description'
  }
};
