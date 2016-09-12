import React, {Component} from 'react'
import {g, rect, text} from 'react-dom'

export default class TheGraphTextBG extends Component {
  render () {
    var text = this.props.text;
    if (!text) {
      text = "";
    }
    var height = this.props.height;
    var width = text.length * this.props.height * 2/3;
    var radius = this.props.height/2;

    var textAnchor = "start";
    var dominantBaseline = "central";
    var x = this.props.x;
    var y = this.props.y - height/2;

    if (this.props.halign === "center") {
      x -= width/2;
      textAnchor = "middle";
    }
    if (this.props.halign === "right") {
      x -= width;
      textAnchor = "end";
    }

    return g(
      {
        className: (this.props.className ? this.props.className : "text-bg"),
      },
      rect({
        className: "text-bg-rect",
        x: x,
        y: y,
        rx: radius,
        ry: radius,
        height: height * 1.1,
        width: width
      }),
      text({
        className: (this.props.textClassName ? this.props.textClassName : "text-bg-text"),
        x: this.props.x,
        y: this.props.y,
        children: text
      })
    );
  }
}
