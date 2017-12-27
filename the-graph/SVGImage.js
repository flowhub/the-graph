var React = require('react');
var createReactClass = require('create-react-class');

var SVGImage = React.createFactory( createReactClass({
  displayName: "TheGraphSVGImage",
  render: function() {
      var html = '<image ';
      html = html +'xlink:href="'+ this.props.src + '"';
      html = html +'x="' + this.props.x + '"';
      html = html +'y="' + this.props.y + '"';
      html = html +'width="' + this.props.width + '"';
      html = html +'height="' + this.props.height + '"';
      html = html +'/>';

      return React.createElement('g', {
          className: this.props.className,
          dangerouslySetInnerHTML:{__html: html}
      });
  }
}));

module.exports = SVGImage;
