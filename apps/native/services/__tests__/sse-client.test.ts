import { streamSSE } from "../sse-client";

function createMockStream(chunks: string[]) {
  const encoder = new TextEncoder();
  const encodedChunks = chunks.map((c) => encoder.encode(c));
  let index = 0;

  return {
    getReader: () => ({
      read: async () => {
        if (index < encodedChunks.length) {
          return { done: false, value: encodedChunks[index++] };
        }
        return { done: true, value: undefined };
      },
    }),
  };
}

describe("streamSSE", () => {
  it("yields data lines from SSE stream", async () => {
    const mockBody = createMockStream([
      "data: hello\n\ndata: world\n\n",
    ]);

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      body: mockBody,
    });

    const results: string[] = [];
    for await (const chunk of streamSSE("http://test", {
      body: { prompt: "test" },
    })) {
      results.push(chunk);
    }

    expect(results).toEqual(["hello", "world"]);
  });

  it("stops on [DONE] signal", async () => {
    const mockBody = createMockStream([
      "data: first\n\ndata: [DONE]\n\ndata: after\n\n",
    ]);

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      body: mockBody,
    });

    const results: string[] = [];
    for await (const chunk of streamSSE("http://test", {
      body: { prompt: "test" },
    })) {
      results.push(chunk);
    }

    expect(results).toEqual(["first"]);
  });

  it("throws on non-ok response", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
    });

    await expect(
      (async () => {
        for await (const _ of streamSSE("http://test", {
          body: { prompt: "test" },
        })) {
          // consume
        }
      })()
    ).rejects.toThrow("SSE request failed: 500");
  });

  it("handles partial chunks across reads", async () => {
    const mockBody = createMockStream([
      "data: hel",
      "lo\n\ndata: world\n\n",
    ]);

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      body: mockBody,
    });

    const results: string[] = [];
    for await (const chunk of streamSSE("http://test", {
      body: { prompt: "test" },
    })) {
      results.push(chunk);
    }

    expect(results).toEqual(["hello", "world"]);
  });
});
