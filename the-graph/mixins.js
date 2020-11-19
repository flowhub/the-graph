const ReactDOM = require('react-dom');
// React mixins

// Show fake tooltip
// Class must have getTooltipTrigger (dom node) and shouldShowTooltip (boolean)
const Tooltip = {
  showTooltip(event) {
    if (!this.shouldShowTooltip()) { return; }

    const tooltipEvent = new CustomEvent('the-graph-tooltip', {
      detail: {
        tooltip: this.props.label,
        x: event.clientX,
        y: event.clientY,
      },
      bubbles: true,
    });
    ReactDOM.findDOMNode(this).dispatchEvent(tooltipEvent);
  },
  hideTooltip(event) {
    if (!this.shouldShowTooltip()) { return; }

    const tooltipEvent = new CustomEvent('the-graph-tooltip-hide', {
      bubbles: true,
    });
    if (this.mounted) {
      ReactDOM.findDOMNode(this).dispatchEvent(tooltipEvent);
    }
  },
  componentDidMount() {
    this.mounted = true;
    if (navigator && navigator.userAgent.indexOf('Firefox') !== -1) {
      // HACK Ff does native tooltips on svg elements
      return;
    }
    const tooltipper = this.getTooltipTrigger();
    tooltipper.addEventListener('tap', this.showTooltip);
    tooltipper.addEventListener('mouseenter', this.showTooltip);
    tooltipper.addEventListener('mouseleave', this.hideTooltip);
  },
  componentWillUnmount() {
    this.mounted = false;
  },
};

module.exports = {
  Tooltip,
};
