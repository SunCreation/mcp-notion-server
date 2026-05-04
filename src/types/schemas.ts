import { Tool } from "@modelcontextprotocol/sdk/types.js";
import {
  commonIdDescription,
  formatParameter,
  richTextObjectSchema,
  blockObjectSchema,
} from "./common.js";

const cid = commonIdDescription;

export const appendBlockChildrenTool: Tool = {
  name: "notion_append_block_children",
  description: "Append child blocks to a parent. Max 100 blocks, 2 nesting levels.",
  inputSchema: {
    type: "object",
    properties: {
      block_id: { type: "string", description: "Parent block ID." + cid },
      children: { type: "array", description: "Block objects to append.", items: blockObjectSchema },
      after: { type: "string", description: "Insert after this block ID." + cid },
      format: formatParameter,
    },
    required: ["block_id", "children"],
  },
};

export const retrieveBlockTool: Tool = {
  name: "notion_retrieve_block",
  description: "Retrieve a block",
  inputSchema: {
    type: "object",
    properties: {
      block_id: { type: "string", description: "Block ID." + cid },
      format: formatParameter,
    },
    required: ["block_id"],
  },
};

export const retrieveBlockChildrenTool: Tool = {
  name: "notion_retrieve_block_children",
  description: "Retrieve children of a block",
  inputSchema: {
    type: "object",
    properties: {
      block_id: { type: "string", description: "Block ID." + cid },
      start_cursor: { type: "string", description: "Pagination cursor." },
      page_size: { type: "number", description: "Results per page (max 100)." },
      max_results: { type: "number", description: "Auto-paginate to collect up to N results total." },
      format: formatParameter,
    },
    required: ["block_id"],
  },
};

export const deleteBlockTool: Tool = {
  name: "notion_delete_block",
  description: "Delete a block",
  inputSchema: {
    type: "object",
    properties: {
      block_id: { type: "string", description: "Block ID to delete." + cid },
      format: formatParameter,
    },
    required: ["block_id"],
  },
};

export const updateBlockTool: Tool = {
  name: "notion_update_block",
  description: "Update block content. Replaces entire value for the given field.",
  inputSchema: {
    type: "object",
    properties: {
      block_id: { type: "string", description: "Block ID." + cid },
      block: { type: "object", description: "Updated content matching block type schema." },
      format: formatParameter,
    },
    required: ["block_id", "block"],
  },
};

export const createPageTool: Tool = {
  name: "notion_create_page",
  description: "Create a page under a page or database. Max 100 blocks, 2 nesting levels.",
  inputSchema: {
    type: "object",
    properties: {
      parent: {
        type: "object",
        description: "Parent: set page_id (subpage) or database_id (db item).",
        properties: {
          page_id: { type: "string", description: "Parent page ID." + cid },
          database_id: { type: "string", description: "Parent database ID." + cid },
        },
      },
      properties: { type: "object", description: "Page properties. Use 'title' for page parent; match schema for database parent." },
      children: { type: "array", description: "Page content blocks.", items: blockObjectSchema },
      format: formatParameter,
    },
    required: ["parent", "properties"],
  },
};

export const retrievePageTool: Tool = {
  name: "notion_retrieve_page",
  description: "Retrieve a page",
  inputSchema: {
    type: "object",
    properties: {
      page_id: { type: "string", description: "Page ID." + cid },
      format: formatParameter,
    },
    required: ["page_id"],
  },
};

export const updatePagePropertiesTool: Tool = {
  name: "notion_update_page_properties",
  description: "Update page or database item properties",
  inputSchema: {
    type: "object",
    properties: {
      page_id: { type: "string", description: "Page/item ID." + cid },
      properties: { type: "object", description: "Properties to update." },
      format: formatParameter,
    },
    required: ["page_id", "properties"],
  },
};

export const listAllUsersTool: Tool = {
  name: "notion_list_all_users",
  description: "List workspace users. Requires Enterprise plan + Org API key.",
  inputSchema: {
    type: "object",
    properties: {
      start_cursor: { type: "string", description: "Pagination cursor." },
      page_size: { type: "number", description: "Max results (max 100)." },
      max_results: { type: "number", description: "Auto-paginate to collect up to N results total." },
      format: formatParameter,
    },
  },
};

export const retrieveUserTool: Tool = {
  name: "notion_retrieve_user",
  description: "Get user by ID. Requires Enterprise plan + Org API key.",
  inputSchema: {
    type: "object",
    properties: {
      user_id: { type: "string", description: "User ID." + cid },
      format: formatParameter,
    },
    required: ["user_id"],
  },
};

export const retrieveBotUserTool: Tool = {
  name: "notion_retrieve_bot_user",
  description: "Get the bot user for the current integration token",
  inputSchema: {
    type: "object",
    properties: {
      format: formatParameter,
    },
  },
};

export const createDatabaseTool: Tool = {
  name: "notion_create_database",
  description: "Create a database",
  inputSchema: {
    type: "object",
    properties: {
      parent: { type: "object", description: "Parent object." },
      title: { type: "array", description: "Database title as rich text.", items: richTextObjectSchema },
      properties: { type: "object", description: "Property schema. Keys = property names, values = schema objects." },
      format: formatParameter,
    },
    required: ["parent", "properties"],
  },
};

export const queryDatabaseTool: Tool = {
  name: "notion_query_database",
  description: "Query a database",
  inputSchema: {
    type: "object",
    properties: {
      database_id: { type: "string", description: "Database ID." + cid },
      filter: { type: "object", description: "Filter conditions." },
      sorts: {
        type: "array",
        description: "Sort conditions.",
        items: {
          type: "object",
          properties: {
            property: { type: "string" },
            timestamp: { type: "string" },
            direction: { type: "string", enum: ["ascending", "descending"] },
          },
          required: ["direction"],
        },
      },
      start_cursor: { type: "string", description: "Pagination cursor." },
      page_size: { type: "number", description: "Results per page (max 100)." },
      max_results: { type: "number", description: "Auto-paginate to collect up to N results total." },
      format: formatParameter,
    },
    required: ["database_id"],
  },
};

export const retrieveDatabaseTool: Tool = {
  name: "notion_retrieve_database",
  description: "Retrieve a database",
  inputSchema: {
    type: "object",
    properties: {
      database_id: { type: "string", description: "Database ID." + cid },
      format: formatParameter,
    },
    required: ["database_id"],
  },
};

export const updateDatabaseTool: Tool = {
  name: "notion_update_database",
  description: "Update a database",
  inputSchema: {
    type: "object",
    properties: {
      database_id: { type: "string", description: "Database ID." + cid },
      title: { type: "array", description: "Database title as rich text.", items: richTextObjectSchema },
      description: { type: "array", description: "Database description as rich text.", items: richTextObjectSchema },
      properties: { type: "object", description: "Properties to change." },
      format: formatParameter,
    },
    required: ["database_id"],
  },
};

export const createDatabaseItemTool: Tool = {
  name: "notion_create_database_item",
  description: "Create a new item (page) in a database",
  inputSchema: {
    type: "object",
    properties: {
      database_id: { type: "string", description: "Database ID." + cid },
      properties: { type: "object", description: "Item properties matching database schema." },
      format: formatParameter,
    },
    required: ["database_id", "properties"],
  },
};

export const createCommentTool: Tool = {
  name: "notion_create_comment",
  description: "Create a comment on a page (parent) or discussion thread (discussion_id). Needs insert-comment capability.",
  inputSchema: {
    type: "object",
    properties: {
      parent: {
        type: "object",
        description: "Page to comment on. Set page_id.",
        properties: {
          page_id: { type: "string", description: "Page ID." + cid },
        },
      },
      discussion_id: { type: "string", description: "Discussion thread ID." + cid },
      rich_text: { type: "array", description: "Comment content.", items: richTextObjectSchema },
      format: formatParameter,
    },
    required: ["rich_text"],
  },
};

export const retrieveCommentsTool: Tool = {
  name: "notion_retrieve_comments",
  description: "Get unresolved comments from a page or block. Needs read-comment capability.",
  inputSchema: {
    type: "object",
    properties: {
      block_id: { type: "string", description: "Block/page ID." + cid },
      start_cursor: { type: "string", description: "Pagination cursor." },
      page_size: { type: "number", description: "Max results (max 100)." },
      format: formatParameter,
    },
    required: ["block_id"],
  },
};

export const searchTool: Tool = {
  name: "notion_search",
  description: "Search pages or databases by title",
  inputSchema: {
    type: "object",
    properties: {
      query: { type: "string", description: "Search text for titles." },
      filter: {
        type: "object",
        description: "Filter by type.",
        properties: {
          property: { type: "string", description: "Must be 'object'." },
          value: { type: "string", description: "'page' or 'database'." },
        },
      },
      sort: {
        type: "object",
        description: "Sort order.",
        properties: {
          direction: { type: "string", enum: ["ascending", "descending"] },
          timestamp: { type: "string", enum: ["last_edited_time"] },
        },
      },
      start_cursor: { type: "string", description: "Pagination cursor." },
      page_size: { type: "number", description: "Max results (max 100)." },
      max_results: { type: "number", description: "Auto-paginate to collect up to N results total." },
      format: formatParameter,
    },
  },
};

export const tableAddRowTool: Tool = {
  name: "notion_table_add_row",
  description: "Add a row to a table block. Cells count must match table_width.",
  inputSchema: {
    type: "object",
    properties: {
      table_block_id: { type: "string", description: "Table block ID (not page ID)." + cid },
      cells: {
        type: "array",
        description: "Array of cells. Each cell is an array of rich text objects.",
        items: { type: "array", items: { type: "object" } },
      },
      format: formatParameter,
    },
    required: ["table_block_id", "cells"],
  },
};

export const tableDeleteRowTool: Tool = {
  name: "notion_table_delete_row",
  description: "Delete a row from a table block by its row block ID.",
  inputSchema: {
    type: "object",
    properties: {
      row_block_id: { type: "string", description: "table_row block ID to delete." + cid },
      format: formatParameter,
    },
    required: ["row_block_id"],
  },
};

export const tableUpdateCellsTool: Tool = {
  name: "notion_table_update_cells",
  description: "Update all cells in a table row. Replaces entire row content (Notion API limitation — no single-cell update).",
  inputSchema: {
    type: "object",
    properties: {
      row_block_id: { type: "string", description: "table_row block ID to update." + cid },
      cells: {
        type: "array",
        description: "Full array of cells for the row. Each cell is an array of rich text objects.",
        items: { type: "array", items: { type: "object" } },
      },
      format: formatParameter,
    },
    required: ["row_block_id", "cells"],
  },
};
