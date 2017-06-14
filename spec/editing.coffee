
describe 'Editor navigation', ->

  describe 'dragging on background', ->
    it 'should pan graph view'

  describe 'mouse scrolling up', ->
    it 'should zoom in'
  describe 'mouse scrolling down', ->
    it 'should zoom out'
  describe 'multitouch pinch', ->
    it 'should zoom in/out'

  describe 'hovering an node', ->
    it 'should highlight node'
  describe 'hovering an edge', ->
    it 'should highlight edge'
  describe 'hovering exported port', ->
    it 'should highlight exported port'
  describe 'hovering node group', ->
    it 'should highlight the group'

describe 'Editor', ->

  describe 'dragging on node', ->
    it 'should move the node'

  describe 'dragging on exported port', ->
    it 'should move the port'

  describe 'dragging from node port', ->
    it 'should start making edge'
  describe 'dropping started edge on port', ->
    it 'should connect the edge'
  describe 'dropping started edge outside', ->
    it 'should not connect edge'

  # selection
  # cannot be selected
  describe 'clicking exported port', ->
    it 'does nothing'

  describe 'clicking unselected node', ->
    it 'should add node to selection'

  describe 'clicking selected node', ->
    it 'should remove node from selection'

  describe 'clicking unselected edge', ->
    it 'should add edge to selection'

  describe 'clicking selected edge', ->
    it 'should remove edge from selection'

  describe 'selected nodes', ->
    it 'are visualized with a bounding box'

  # node groups
  describe 'node groups', ->
    it 'are visualized with a bounding box'
    it 'shows group name'
    it 'shows group description'

  # opening menus
  describe 'right-click node', ->
    it 'should open menu for node'

  describe 'right-click node port', ->
    it 'should open menu for port'

  describe 'right-click edge', ->
    it 'should open menu for edge'

  describe 'right-click exported port', ->
    it 'should open menu for exported port'

  describe 'right-click node group', ->
    it 'should open menu for group'

  describe 'right-click background', ->
    it 'should open menu for editor'

  describe 'long-press', ->
    it 'should work same as right-click'

describe 'Editor menus', ->
  # menu functionality
  describe 'node menu', ->
    it 'shows node name'
    it 'shows component icon'
    it 'should have delete action'
    it 'should have copy action'
    it 'should show in and outports'

    describe 'clicking port', ->
      it 'should start edge'

  describe 'node port menu', ->
    it 'should have export action'

  describe 'edge menu', ->
    it 'shows edge name'
    it 'should have delete action'

  describe 'exported port menu', ->
    it 'should have delete action'

  describe 'node selection menu', ->
    it 'should have group action'
    it 'should have copy action'

  describe 'editor menu', ->
    it 'should have paste action'

