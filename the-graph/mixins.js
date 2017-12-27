var ReactDOM = require('react-dom');
// React mixins

// Show fake tooltip
// Class must have getTooltipTrigger (dom node) and shouldShowTooltip (boolean)
var Tooltip = {
  showTooltip: function (event) {
    if ( !this.shouldShowTooltip() ) { return; }

    var tooltipEvent = new CustomEvent('the-graph-tooltip', { 
      detail: {
        tooltip: this.props.label,
        x: event.clientX,
        y: event.clientY
      }, 
      bubbles: true
    });
    ReactDOM.findDOMNode(this).dispatchEvent(tooltipEvent);
  },
  hideTooltip: function (event) {
    if ( !this.shouldShowTooltip() ) { return; }

    var tooltipEvent = new CustomEvent('the-graph-tooltip-hide', { 
      bubbles: true
    });
    if (this.mounted) {
      ReactDOM.findDOMNode(this).dispatchEvent(tooltipEvent);
    }
  },
  componentDidMount: function () {
    this.mounted = true;
    if (navigator && navigator.userAgent.indexOf("Firefox") !== -1) {
      // HACK Ff does native tooltips on svg elements
      return;
    }
    var tooltipper = this.getTooltipTrigger();
    tooltipper.addEventListener("tap", this.showTooltip);
    tooltipper.addEventListener("mouseenter", this.showTooltip);
    tooltipper.addEventListener("mouseleave", this.hideTooltip);
  },
  componentWillUnmount: function () {
    this.mounted = false;
  }
};

module.exports = {
  Tooltip: Tooltip,
};
