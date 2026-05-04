export const commonIdDescription = " Format: 8-4-4-4-12 with hyphens.";

export const formatParameter = {
  type: "string",
  enum: ["json", "markdown"],
  description:
    "Response format. 'json' for raw data, 'markdown' for readable output. Use 'json' when planning to write/modify.",
  default: "markdown",
};

const colorDesc = "Color: default, blue, brown, gray, green, orange, pink, purple, red, yellow (+ _background variants).";

const nestedBlockChildItem = {
  type: "object",
  properties: {
    object: { type: "string", enum: ["block"] },
    type: { type: "string" },
  },
  required: ["object", "type"],
};

export const richTextObjectSchema = {
  type: "object",
  description: "A rich text object.",
  properties: {
    type: {
      type: "string",
      description: "Rich text type: text or mention.",
      enum: ["text", "mention"],
    },
    text: {
      type: "object",
      description: "Text content + optional link. Required if type is 'text'.",
      properties: {
        content: {
          type: "string",
          description: "Text content. Max 2000 chars.",
        },
        link: {
          type: "object",
          description: "Optional link. Omit field entirely if no link.",
          properties: {
            url: { type: "string", description: "URL the text links to." },
          },
        },
      },
    },
    mention: {
      type: "object",
      description: "Inline mention of a database, date, page, or user.",
      properties: {
        type: {
          type: "string",
          description: "Mention type.",
          enum: ["database", "date", "page", "user"],
        },
        database: {
          type: "object",
          description: "Database mention.",
          properties: {
            id: {
              type: "string",
              description: "Database ID." + commonIdDescription,
            },
          },
          required: ["id"],
        },
        date: {
          type: "object",
          description: "Date mention.",
          properties: {
            start: {
              type: "string",
              description: "ISO 8601 start date/datetime.",
            },
            end: {
              type: ["string", "null"],
              description: "ISO 8601 end date/datetime, or null.",
            },
            time_zone: {
              type: ["string", "null"],
              description: "Time zone. Null = UTC.",
            },
          },
          required: ["start"],
        },
        page: {
          type: "object",
          description: "Page mention.",
          properties: {
            id: {
              type: "string",
              description: "Page ID." + commonIdDescription,
            },
          },
          required: ["id"],
        },
        user: {
          type: "object",
          description: "User mention.",
          properties: {
            object: {
              type: "string",
              description: "Must be 'user'.",
              enum: ["user"],
            },
            id: {
              type: "string",
              description: "User ID." + commonIdDescription,
            },
          },
          required: ["object", "id"],
        },
      },
      required: ["type"],
      oneOf: [
        { required: ["database"] },
        { required: ["date"] },
        { required: ["page"] },
        { required: ["user"] },
      ],
    },
    annotations: {
      type: "object",
      description: "Text styling. Omit for default text.",
      properties: {
        bold: { type: "boolean" },
        italic: { type: "boolean" },
        strikethrough: { type: "boolean" },
        underline: { type: "boolean" },
        code: { type: "boolean" },
        color: { type: "string", description: colorDesc },
      },
    },
    href: {
      type: "string",
      description: "Link URL if any. Omit if none.",
    },
    plain_text: {
      type: "string",
      description: "Plain text without annotations.",
    },
  },
  required: ["type"],
};

export const blockObjectSchema = {
  type: "object",
  description: "Notion block. Max 100 blocks, 2 nesting levels, 2000 chars.",
  properties: {
    object: {
      type: "string",
      description: "Must be 'block'.",
      enum: ["block"],
    },
    type: {
      type: "string",
      description:
        "Block type: paragraph, heading_1, heading_2, heading_3, bulleted_list_item, numbered_list_item, to_do, toggle, divider, table, callout, quote, code, image, bookmark, embed, etc.",
    },
    paragraph: {
      type: "object",
      description: "Paragraph block.",
      properties: {
        rich_text: {
          type: "array",
          description: "Paragraph content as rich text array.",
          items: richTextObjectSchema,
        },
        color: { type: "string", description: colorDesc },
        children: {
          type: "array",
          description: "Nested child blocks.",
          items: nestedBlockChildItem,
        },
      },
    },
    heading_1: {
      type: "object",
      description: "Heading 1 block.",
      properties: {
        rich_text: {
          type: "array",
          description: "Heading content.",
          items: richTextObjectSchema,
        },
        color: { type: "string", description: colorDesc },
        is_toggleable: {
          type: "boolean",
          description: "Whether heading is toggleable.",
        },
      },
    },
    heading_2: {
      type: "object",
      description: "Heading 2 block.",
      properties: {
        rich_text: {
          type: "array",
          description: "Heading content.",
          items: richTextObjectSchema,
        },
        color: { type: "string", description: colorDesc },
        is_toggleable: {
          type: "boolean",
          description: "Whether heading is toggleable.",
        },
      },
    },
    heading_3: {
      type: "object",
      description: "Heading 3 block.",
      properties: {
        rich_text: {
          type: "array",
          description: "Heading content.",
          items: richTextObjectSchema,
        },
        color: { type: "string", description: colorDesc },
        is_toggleable: {
          type: "boolean",
          description: "Whether heading is toggleable.",
        },
      },
    },
    bulleted_list_item: {
      type: "object",
      description: "Bulleted list item.",
      properties: {
        rich_text: {
          type: "array",
          description: "List item content.",
          items: richTextObjectSchema,
        },
        color: { type: "string", description: colorDesc },
        children: {
          type: "array",
          description: "Nested child blocks.",
          items: nestedBlockChildItem,
        },
      },
    },
    numbered_list_item: {
      type: "object",
      description: "Numbered list item.",
      properties: {
        rich_text: {
          type: "array",
          description: "List item content.",
          items: richTextObjectSchema,
        },
        color: { type: "string", description: colorDesc },
        children: {
          type: "array",
          description: "Nested child blocks.",
          items: nestedBlockChildItem,
        },
      },
    },
    toggle: {
      type: "object",
      description: "Toggle block.",
      properties: {
        rich_text: {
          type: "array",
          description: "Toggle content.",
          items: richTextObjectSchema,
        },
        color: { type: "string", description: colorDesc },
        children: {
          type: "array",
          description: "Nested child blocks revealed when opened.",
          items: nestedBlockChildItem,
        },
      },
    },
    divider: {
      type: "object",
      description: "Divider block.",
      properties: {},
    },
    table: {
      type: "object",
      description: "Table block. Children must be table_row blocks with cells (array of rich_text arrays).",
      properties: {
        table_width: {
          type: "number",
          description: "Column count. Must match cells per row.",
        },
        has_column_header: {
          type: "boolean",
          description: "First row as header.",
        },
        has_row_header: {
          type: "boolean",
          description: "First column as header.",
        },
        children: {
          type: "array",
          description: "table_row blocks.",
          items: {
            type: "object",
            properties: {
              type: { type: "string", enum: ["table_row"] },
              table_row: {
                type: "object",
                properties: {
                  cells: {
                    type: "array",
                    description: "Each cell = array of rich_text objects.",
                    items: { type: "array", items: { type: "object" } },
                  },
                },
                required: ["cells"],
              },
            },
            required: ["type", "table_row"],
          },
        },
      },
      required: ["table_width", "has_column_header"],
    },
  },
  required: ["object", "type"],
};
