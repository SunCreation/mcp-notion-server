/**
 * MCP server setup and request handling
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequest,
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { NotionClientWrapper } from "../client/index.js";
import { filterTools } from "../utils/index.js";
import * as schemas from "../types/schemas.js";
import * as args from "../types/args.js";

export async function startServer(
  notionToken: string,
  enabledToolsSet: Set<string>,
  enableMarkdownConversion: boolean
) {
  const server = new Server(
    {
      name: "Notion MCP Server",
      version: "2.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  const notionClient = new NotionClientWrapper(notionToken);

  server.setRequestHandler(
    CallToolRequestSchema,
    async (request: CallToolRequest) => {
      console.error("Received CallToolRequest:", request);
      try {
        const requestArgs = request.params.arguments ?? {};
        let response;

        switch (request.params.name) {
          case "notion_append_block_children": {
            const a = requestArgs as unknown as args.AppendBlockChildrenArgs;
            if (!a.block_id || !a.children) {
              throw new Error("Missing required arguments: block_id and children");
            }
            response = await notionClient.appendBlockChildren(
              a.block_id,
              a.children,
              a.after
            );
            break;
          }

          case "notion_retrieve_block": {
            const a = requestArgs as unknown as args.RetrieveBlockArgs;
            if (!a.block_id) {
              throw new Error("Missing required argument: block_id");
            }
            response = await notionClient.retrieveBlock(a.block_id);
            break;
          }

          case "notion_retrieve_block_children": {
            const a = requestArgs as unknown as args.RetrieveBlockChildrenArgs;
            if (!a.block_id) {
              throw new Error("Missing required argument: block_id");
            }
            response = await notionClient.retrieveBlockChildren(
              a.block_id,
              a.start_cursor,
              a.page_size,
              a.max_results
            );
            break;
          }

          case "notion_delete_block": {
            const a = requestArgs as unknown as args.DeleteBlockArgs;
            if (!a.block_id) {
              throw new Error("Missing required argument: block_id");
            }
            response = await notionClient.deleteBlock(a.block_id);
            break;
          }

          case "notion_update_block": {
            const a = requestArgs as unknown as args.UpdateBlockArgs;
            if (!a.block_id || !a.block) {
              throw new Error("Missing required arguments: block_id and block");
            }
            response = await notionClient.updateBlock(a.block_id, a.block);
            break;
          }

          case "notion_create_page": {
            const a = requestArgs as unknown as args.CreatePageArgs;
            if (!a.parent || !a.properties) {
              throw new Error("Missing required arguments: parent and properties");
            }
            response = await notionClient.createPage(
              a.parent,
              a.properties,
              a.children
            );
            break;
          }

          case "notion_retrieve_page": {
            const a = requestArgs as unknown as args.RetrievePageArgs;
            if (!a.page_id) {
              throw new Error("Missing required argument: page_id");
            }
            response = await notionClient.retrievePage(a.page_id);
            break;
          }

          case "notion_update_page_properties": {
            const a = requestArgs as unknown as args.UpdatePagePropertiesArgs;
            if (!a.page_id || !a.properties) {
              throw new Error("Missing required arguments: page_id and properties");
            }
            response = await notionClient.updatePageProperties(
              a.page_id,
              a.properties
            );
            break;
          }

          case "notion_list_all_users": {
            const a = requestArgs as unknown as args.ListAllUsersArgs;
            response = await notionClient.listAllUsers(
              a.start_cursor,
              a.page_size,
              a.max_results
            );
            break;
          }

          case "notion_retrieve_user": {
            const a = requestArgs as unknown as args.RetrieveUserArgs;
            if (!a.user_id) {
              throw new Error("Missing required argument: user_id");
            }
            response = await notionClient.retrieveUser(a.user_id);
            break;
          }

          case "notion_retrieve_bot_user": {
            response = await notionClient.retrieveBotUser();
            break;
          }

          case "notion_query_database": {
            const a = requestArgs as unknown as args.QueryDatabaseArgs;
            if (!a.database_id) {
              throw new Error("Missing required argument: database_id");
            }
            response = await notionClient.queryDatabase(
              a.database_id,
              a.filter,
              a.sorts,
              a.start_cursor,
              a.page_size,
              a.max_results
            );
            break;
          }

          case "notion_create_database": {
            const a = requestArgs as unknown as args.CreateDatabaseArgs;
            response = await notionClient.createDatabase(
              a.parent,
              a.properties,
              a.title
            );
            break;
          }

          case "notion_retrieve_database": {
            const a = requestArgs as unknown as args.RetrieveDatabaseArgs;
            response = await notionClient.retrieveDatabase(a.database_id);
            break;
          }

          case "notion_update_database": {
            const a = requestArgs as unknown as args.UpdateDatabaseArgs;
            response = await notionClient.updateDatabase(
              a.database_id,
              a.title,
              a.description,
              a.properties
            );
            break;
          }

          case "notion_create_database_item": {
            const a = requestArgs as unknown as args.CreateDatabaseItemArgs;
            response = await notionClient.createDatabaseItem(
              a.database_id,
              a.properties
            );
            break;
          }

          case "notion_create_comment": {
            const a = requestArgs as unknown as args.CreateCommentArgs;
            if (!a.parent && !a.discussion_id) {
              throw new Error("Either parent.page_id or discussion_id must be provided");
            }
            response = await notionClient.createComment(
              a.parent,
              a.discussion_id,
              a.rich_text
            );
            break;
          }

          case "notion_retrieve_comments": {
            const a = requestArgs as unknown as args.RetrieveCommentsArgs;
            if (!a.block_id) {
              throw new Error("Missing required argument: block_id");
            }
            response = await notionClient.retrieveComments(
              a.block_id,
              a.start_cursor,
              a.page_size
            );
            break;
          }

          case "notion_search": {
            const a = requestArgs as unknown as args.SearchArgs;
            response = await notionClient.search(
              a.query,
              a.filter,
              a.sort,
              a.start_cursor,
              a.page_size,
              a.max_results
            );
            break;
          }

          case "notion_table_add_row": {
            const a = requestArgs as unknown as args.TableAddRowArgs;
            if (!a.table_block_id || !a.cells) {
              throw new Error("Missing required arguments: table_block_id and cells");
            }
            response = await notionClient.tableAddRow(a.table_block_id, a.cells);
            break;
          }

          case "notion_table_delete_row": {
            const a = requestArgs as unknown as args.TableDeleteRowArgs;
            if (!a.row_block_id) {
              throw new Error("Missing required argument: row_block_id");
            }
            response = await notionClient.tableDeleteRow(a.row_block_id);
            break;
          }

          case "notion_table_update_cells": {
            const a = requestArgs as unknown as args.TableUpdateCellsArgs;
            if (!a.row_block_id || !a.cells) {
              throw new Error("Missing required arguments: row_block_id and cells");
            }
            response = await notionClient.tableUpdateCells(a.row_block_id, a.cells);
            break;
          }

          default:
            throw new Error(`Unknown tool: ${request.params.name}`);
        }

        const requestedFormat = (requestArgs as any)?.format || "markdown";

        if (enableMarkdownConversion && requestedFormat === "markdown") {
          const markdown = await notionClient.toMarkdown(response);
          return {
            content: [{ type: "text", text: markdown }],
          };
        } else {
          return {
            content: [{ type: "text", text: JSON.stringify(response) }],
          };
        }
      } catch (error) {
        console.error("Error executing tool:", error);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                error: error instanceof Error ? error.message : String(error),
              }),
            },
          ],
        };
      }
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    const allTools = [
      schemas.appendBlockChildrenTool,
      schemas.retrieveBlockTool,
      schemas.retrieveBlockChildrenTool,
      schemas.deleteBlockTool,
      schemas.updateBlockTool,
      schemas.createPageTool,
      schemas.retrievePageTool,
      schemas.updatePagePropertiesTool,
      schemas.listAllUsersTool,
      schemas.retrieveUserTool,
      schemas.retrieveBotUserTool,
      schemas.createDatabaseTool,
      schemas.queryDatabaseTool,
      schemas.retrieveDatabaseTool,
      schemas.updateDatabaseTool,
      schemas.createDatabaseItemTool,
      schemas.createCommentTool,
      schemas.retrieveCommentsTool,
      schemas.searchTool,
      schemas.tableAddRowTool,
      schemas.tableDeleteRowTool,
      schemas.tableUpdateCellsTool,
    ];
    return {
      tools: filterTools(allTools, enabledToolsSet),
    };
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
}
