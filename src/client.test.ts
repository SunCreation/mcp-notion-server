import { expect, test, describe, vi, beforeEach } from "vitest";
import { NotionClientWrapper } from "./client/index.js";
import { PageResponse } from "./types/index.js";
import { filterTools } from "./utils/index.js";

vi.mock("./markdown/index.js", () => ({
  convertToMarkdown: vi.fn().mockReturnValue("# Test"),
}));

vi.mock("@notionhq/client", () => ({
  Client: vi.fn().mockImplementation(() => ({})),
}));

vi.mock("@notionhq/client/build/src/helpers.js", () => ({
  collectPaginatedAPI: vi.fn().mockResolvedValue([]),
}));

const mockInputSchema = { type: "object" as const };
const mockTools = [
  { name: "notion_retrieve_block", inputSchema: mockInputSchema },
  { name: "notion_retrieve_page", inputSchema: mockInputSchema },
  { name: "notion_query_database", inputSchema: mockInputSchema },
];

const mockRequest = vi.fn().mockResolvedValue({ object: "block", id: "test", type: "paragraph" });
const mockNotion = {
  request: mockRequest,
  pages: {
    create: mockRequest,
    retrieve: mockRequest,
    update: mockRequest,
  },
  blocks: {
    retrieve: mockRequest,
    delete: mockRequest,
    update: mockRequest,
    children: {
      append: mockRequest,
      list: mockRequest,
    },
  },
  databases: {
    retrieve: mockRequest,
    create: mockRequest,
    update: mockRequest,
  },
  users: {
    list: mockRequest,
    retrieve: mockRequest,
    me: mockRequest,
  },
  comments: {
    create: mockRequest,
    list: mockRequest,
  },
  search: mockRequest,
};

describe("NotionClientWrapper", () => {
  let wrapper: any;

  beforeEach(() => {
    vi.resetAllMocks();
    mockRequest.mockResolvedValue({ object: "block", id: "test", type: "paragraph" });
    wrapper = new NotionClientWrapper("test-token");
    wrapper.notion = mockNotion;
  });

  test("should initialize with SDK Client", () => {
    expect((wrapper as any).notion).toBeDefined();
    expect((wrapper as any).cache).toBeDefined();
  });

  test("should call appendBlockChildren via SDK", async () => {
    const blockId = "block123";
    const children = [{ type: "paragraph" }];

    await wrapper.appendBlockChildren(blockId, children);

    expect(mockRequest).toHaveBeenCalled();
  });

  test("should call retrieveBlock via SDK", async () => {
    const blockId = "block123";

    await wrapper.retrieveBlock(blockId);

    expect(mockRequest).toHaveBeenCalled();
  });

  test("should call retrieveBlockChildren with pagination parameters", async () => {
    const blockId = "block123";
    const startCursor = "cursor123";
    const pageSize = 10;

    mockRequest.mockResolvedValueOnce({
      object: "list",
      results: [],
      next_cursor: null,
      has_more: false,
    });

    await wrapper.retrieveBlockChildren(blockId, startCursor, pageSize);

    expect(mockRequest).toHaveBeenCalled();
  });

  test("should call retrievePage via SDK", async () => {
    const pageId = "page123";

    mockRequest.mockResolvedValueOnce({
      object: "page",
      id: pageId,
      properties: {},
    });

    await wrapper.retrievePage(pageId);

    expect(mockRequest).toHaveBeenCalled();
  });

  test("should call updatePageProperties via SDK", async () => {
    const pageId = "page123";
    const properties = {
      title: { title: [{ text: { content: "New Title" } }] },
    };

    await wrapper.updatePageProperties(pageId, properties);

    expect(mockRequest).toHaveBeenCalled();
  });

  test("should call queryDatabase via SDK", async () => {
    const databaseId = "db123";
    const filter = { property: "Status", equals: "Done" };
    const sorts = [{ property: "Due Date", direction: "ascending" as const }];

    await wrapper.queryDatabase(databaseId, filter, sorts);

    expect(mockRequest).toHaveBeenCalled();
  });

  test("should call search via SDK", async () => {
    const query = "test query";
    const filter = { property: "object", value: "page" };

    mockRequest.mockResolvedValueOnce({
      object: "list",
      results: [],
      next_cursor: null,
      has_more: false,
    });

    await wrapper.search(query, filter);

    expect(mockRequest).toHaveBeenCalled();
  });

  test("should call toMarkdown method correctly", async () => {
    const { convertToMarkdown } = await import("./markdown/index.js");

    const response: PageResponse = {
      object: "page",
      id: "test",
      created_time: "2021-01-01T00:00:00.000Z",
      last_edited_time: "2021-01-01T00:00:00.000Z",
      parent: {
        type: "workspace",
      },
      properties: {},
    };
    await wrapper.toMarkdown(response);

    expect(convertToMarkdown).toHaveBeenCalledWith(response);
  });

  test("should auto-fill empty table children", async () => {
    const blockId = "block123";
    const children = [
      {
        type: "table",
        object: "block",
        table: { table_width: 3, has_column_header: false },
      },
    ];

    await wrapper.appendBlockChildren(blockId, children);

    expect(mockRequest).toHaveBeenCalled();
  });

  describe("filterTools", () => {
    test("should return all tools when no filter specified", () => {
      const result = filterTools(mockTools);
      expect(result).toEqual(mockTools);
    });

    test("should filter tools based on enabledTools", () => {
      const enabledToolsSet = new Set([
        "notion_retrieve_block",
        "notion_query_database",
      ]);
      const result = filterTools(mockTools, enabledToolsSet);
      expect(result).toEqual([
        { name: "notion_retrieve_block", inputSchema: mockInputSchema },
        { name: "notion_query_database", inputSchema: mockInputSchema },
      ]);
    });

    test("should return empty array when no tools match", () => {
      const enabledToolsSet = new Set(["non_existent_tool"]);
      const result = filterTools(mockTools, enabledToolsSet);
      expect(result).toEqual([]);
    });
  });
});
