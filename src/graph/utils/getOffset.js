export default function getOffset (domNode){
  var getElementOffset = function(element){
    var offset = { top: 0, left: 0},
      parentOffset;
    if(!element){
      return offset;
    }
    offset.top += (element.offsetTop || 0);
    offset.left += (element.offsetLeft || 0);
    parentOffset = getElementOffset(element.offsetParent);
    offset.top += parentOffset.top;
    offset.left += parentOffset.left;
    return offset;
  };
  try{
    return getElementOffset( domNode );
  }catch(e){
    return getElementOffset();
  }
};
