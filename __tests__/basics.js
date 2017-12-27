const { render } = require("enzyme");
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

describe("Basics", function() {
  describe("loading a simple graph", function() {
    let rendered;

    beforeAll(async () => {
      const graph = await parseFBP(name);
      rendered = render(TheGraph.App({ graph, library }));
    });

    it("should render 2 nodes", () => {
      expect(rendered.find(".node")).toHaveLength(2);
    });

    it("should render 1 edge", () => {
      expect(rendered.find(".edge")).toHaveLength(1);
    });

    it("should render 1 IIP", () => {
      expect(rendered.find(".iip")).toHaveLength(1);
    });
  });
});
