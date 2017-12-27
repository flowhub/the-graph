const { mount } = require("enzyme");
const fbpGraph = require("fbp-graph");
const TheGraph = require("../index.js");

const parseFBP = fbpString =>
  new Promise((resolve, reject) =>
    fbpGraph.graph.loadFBP(
      fbpString,
      (err, graph) =>
        err instanceof fbpGraph.Graph
          ? resolve(err)
          : err ? reject(err) : resolve(graph)
    )
  );

const dummyComponent = {
  inports: [
    {
      name: "in",
      type: "all"
    }
  ],
  outports: [
    {
      name: "out",
      type: "all"
    }
  ]
};

const name = "'42' -> CONFIG foo(Foo) OUT -> IN bar(Bar)";
const library = { Foo: dummyComponent, Bar: dummyComponent };

const simulate = (
  node,
  type,
  data = {},
  opts = { bubbles: true, cancelable: true }
) => node.dispatchEvent(Object.assign(new Event(type, opts), data));

describe("Editor navigation", () => {
  let mounted, svg, raf;

  beforeEach(async () => {
    const graph = await parseFBP(name);
    raf = window.requestAnimationFrame = jest.fn();
    mounted = mount(TheGraph.App({ graph, library }));
    svg = mounted.getDOMNode().getElementsByClassName("app-svg")[0];
  });

  afterEach(() => mounted.unmount());

  describe("dragging on background", () => {
    it("should pan graph view", () => {
      const deltaX = 100;
      const deltaY = 200;
      expect(mounted.state("x")).toBe(0);
      expect(mounted.state("y")).toBe(0);
      simulate(svg, "panstart");
      simulate(svg, "panmove", { gesture: { deltaX, deltaY } });
      simulate(svg, "panend");
      expect(mounted.state("x")).toBe(deltaX);
      expect(mounted.state("y")).toBe(deltaY);
    });
  });

  describe("mouse scrolling up", () => {
    it("should zoom in", () => {
      const deltaY = -100;
      expect(mounted.state("scale")).toBe(1);
      svg.onwheel = null;
      simulate(svg, "wheel", { deltaY });
      expect(raf).toHaveBeenCalledTimes(1);
      raf.mock.calls[0][0]();
      expect(mounted.state("scale")).toBe(1.2);
    });
  });

  describe("mouse scrolling down", () => {
    it("should zoom out", () => {
      const deltaY = 100;
      expect(mounted.state("scale")).toBe(1);
      svg.onwheel = null;
      simulate(svg, "wheel", { deltaY });
      expect(raf).toHaveBeenCalledTimes(1);
      raf.mock.calls[0][0]();
      expect(mounted.state("scale")).toBe(0.8);
    });
  });

  describe("multitouch pinch", () => {
    it("should zoom in/out", () => {
      expect(mounted.state("scale")).toBe(1);
      const touches = [
        { target: svg, identifier: "0", clientX: 0, clientY: 0 },
        { target: svg, identifier: "1", clientX: 100, clientY: 100 }
      ];
      simulate(svg, "touchstart", { touches, changedTouches: touches });
      touches[1].clientX = 50;
      simulate(svg, "touchmove", { touches, changedTouches: [touches[1]] });
      simulate(svg, "touchend", { touches, changedTouches: touches });
      expect(mounted.state("scale")).toBe(0.7905694150420948);
      simulate(svg, "touchstart", { touches, changedTouches: touches });
      touches[1].clientX = 100;
      simulate(svg, "touchmove", { touches, changedTouches: [touches[1]] });
      simulate(svg, "touchend", { touches, changedTouches: touches });
      expect(mounted.state("scale")).toBe(1);
    });
  });

  describe("hovering an node", () => {
    it("should highlight node");
  });
  describe("hovering an edge", () => {
    it("should highlight edge");
  });
  describe("hovering exported port", () => {
    it("should highlight exported port");
  });
  describe("hovering node group", () => {
    it("should highlight the group");
  });
});

describe("Editor", () => {
  let mounted, svg, raf, selectedNodes, selectedEdges;

  beforeEach(async () => {
    selectedNodes = {};
    selectedEdges = {};
    const graph = await parseFBP(name);
    raf = window.requestAnimationFrame = jest.fn();
    mounted = mount(
      TheGraph.App({
        graph,
        library,
        onNodeSelection: (id, node, toggle) => {
          if (toggle) return (selectedNodes[id] = !selectedNodes[id]);
          selectedNodes = selectedNodes[id] ? {} : { [id]: true };
        }
      })
    );
    svg = mounted.getDOMNode().getElementsByClassName("app-svg")[0];
  });

  afterEach(() => mounted.unmount());

  describe("dragging on node", () => {
    it("should move the node", () => {
      const deltaX = 100;
      const deltaY = 200;
      expect(mounted.props().graph.nodes[0].metadata.x).toBe(0);
      expect(mounted.props().graph.nodes[0].metadata.y).toBe(0);
      const [node] = mounted.getDOMNode().getElementsByClassName("node");
      simulate(node, "panstart");
      simulate(node, "panmove", { gesture: { deltaX, deltaY } });
      simulate(node, "panend");
      raf.mock.calls.forEach(([c]) => c());
      expect(mounted.props().graph.nodes[0].metadata.x).toBe(108);
      expect(mounted.props().graph.nodes[0].metadata.y).toBe(216);
    });
  });

  describe("dragging on exported port", () => {
    it("should move the port");
  });

  describe("dragging from node port", () => {
    it("should start making edge", () => {
      const deltaX = 100;
      const deltaY = 200;
      expect(svg.getElementsByClassName("edge")).toHaveLength(1);
      const [port] = svg.getElementsByClassName("port");
      simulate(port, "panstart");
      simulate(port, "panmove", { gesture: { deltaX, deltaY } });
      raf.mock.calls.forEach(([c]) => c());
      expect(svg.getElementsByClassName("edge")).toHaveLength(2);
    });
  });

  describe("dropping started edge on port", () => {
    it("should connect the edge", () => {
      const deltaX = 100;
      const deltaY = 200;
      const nodes = [...svg.getElementsByClassName("node")];
      const [p1, p2] = nodes.map(
        (n, i) =>
          n
            .getElementsByClassName(i ? "outports" : "inports")[0]
            .getElementsByClassName("port")[0]
      );
      simulate(p1, "panstart");
      simulate(p1, "panmove", { gesture: { deltaX, deltaY } });
      simulate(p1, "panend");
      simulate(p2, "tap");
      raf.mock.calls.forEach(([c]) => c());
      expect(mounted.props().graph.edges).toHaveLength(2);
    });
  });

  describe("dropping started edge outside", () => {
    it("should not connect the edge", () => {
      const deltaX = 100;
      const deltaY = 200;
      const [p1] = svg
        .getElementsByClassName("node")[0]
        .getElementsByClassName("inports")[0]
        .getElementsByClassName("port");
      simulate(p1, "panstart");
      simulate(p1, "panmove", { gesture: { deltaX, deltaY } });
      simulate(p1, "panend");
      simulate(svg, "click");
      raf.mock.calls.forEach(([c]) => c());
      expect(mounted.props().graph.edges).toHaveLength(1);
    });
  });

  describe("clicking exported port", () => {
    it("does nothing");
  });

  describe("clicking unselected node", () => {
    it("should add node to selection", () => {
      expect(selectedNodes).toEqual({});
      simulate(svg.getElementsByClassName("node")[0], "tap");
      raf.mock.calls.forEach(([c]) => c());
      expect(selectedNodes).toEqual({ foo: true });
    });
  });

  describe("clicking selected node", () => {
    it("should remove node from selection", () => {
      selectedNodes = { foo: true };
      simulate(svg.getElementsByClassName("node")[0], "tap");
      raf.mock.calls.forEach(([c]) => c());
      expect(selectedNodes).toEqual({});
    });
  });

  describe("clicking unselected edge", () => {
    it("should add edge to selection");
  });
  describe("clicking selected edge", () => {
    it("should remove edge from selection");
  });
  describe("selected nodes", () => {
    it("are visualized with a bounding box");
    describe("when dragging the box", () => {
      it("moves all nodes in selection");
    });
  });
  describe("node groups", () => {
    it("are visualized with a bounding box");
    it("shows group name");
    it("shows group description");
    describe("when dragging on label", () => {
      it("moves all nodes in group");
    });
    describe("when dragging on bounding box", () => {
      it("does nothing");
    });
  });
  describe("right-click node", () => {
    it("should open menu for node");
  });
  describe("right-click node port", () => {
    it("should open menu for port");
  });
  describe("right-click edge", () => {
    it("should open menu for edge");
  });
  describe("right-click exported port", () => {
    it("should open menu for exported port");
  });
  describe("right-click node group", () => {
    it("should open menu for group");
  });
  describe("right-click background", () => {
    it("should open menu for editor");
  });
  describe("long-press", () => {
    it("should work same as right-click");
  });
});

describe("Editor menus", () => {
  describe("node menu", () => {
    it("shows node name");
    it("shows component icon");
    it("should have delete action");
    it("should have copy action");
    it("should show in and outports");
    describe("clicking port", () => {
      it("should start edge");
    });
  });
  describe("node port menu", () => {
    it("should have export action");
  });
  describe("edge menu", () => {
    it("shows edge name");
    it("should have delete action");
  });
  describe("exported port menu", () => {
    it("should have delete action");
  });
  describe("node selection menu", () => {
    it("should have group action");
    it("should have copy action");
  });
  describe("editor menu", () => {
    it("should have paste action");
  });
});
