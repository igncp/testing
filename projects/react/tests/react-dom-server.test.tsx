import React from "react";
import * as ReactDOMServer from "react-dom/server";

describe("ReactDOMServer", () => {
  it("can render to string", () => {
    const element = (
      <div>
        <span>Foo</span>
        <span>Bar</span>
      </div>
    );

    const result = ReactDOMServer.renderToString(element);

    expect(result).toEqual("<div><span>Foo</span><span>Bar</span></div>");
  });
});
