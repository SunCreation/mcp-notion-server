/**
 * Notion API client wrapper — @notionhq/client SDK 기반
 */

import { Client } from "@notionhq/client";
import { collectPaginatedAPI } from "@notionhq/client/build/src/helpers.js";
import { convertToMarkdown } from "../markdown/index.js";
import { TTLCache } from "./cache.js";
import {
  NotionResponse,
  BlockResponse,
  PageResponse,
  DatabaseResponse,
  ListResponse,
  UserResponse,
  CommentResponse,
} from "../types/index.js";

/**
 * 테이블 블록에 children(table_row)이 없으면 빈 행 자동 삽입
 * Notion API는 테이블 생성 시 최소 1개 table_row를 요구
 */
function ensureTableHasRows(children: any[]): any[] {
  return children.map((child) => {
    if (
      child.type === "table" &&
      child.table &&
      (!child.table.children || child.table.children.length === 0)
    ) {
      const width = child.table.table_width || 1;
      return {
        ...child,
        table: {
          ...child.table,
          children: [
            {
              type: "table_row",
              table_row: { cells: Array(width).fill([]) },
            },
          ],
        },
      };
    }
    return child;
  });
}

export class NotionClientWrapper {
  private notion: Client;
  private cache: TTLCache<any>;

  constructor(token: string) {
    this.notion = new Client({ auth: token });
    this.cache = new TTLCache<any>();
  }

  setApiVersion(version: string) {
    // SDK 재초기화 없이는 버전 변경 불가 — 필요시 ClientOptions.notionVersion 사용
    // 실제 사용 사례가 거의 없으므로 경고만 출력
    console.warn(
      `setApiVersion("${version}") called. Restart server with NOTION_API_VERSION to change version.`
    );
  }

  // ─── Pages ──────────────────────────────────────────────

  async createPage(
    parent: { database_id?: string; page_id?: string },
    properties: Record<string, any>,
    children?: Partial<BlockResponse>[]
  ): Promise<PageResponse> {
    const processedChildren = children
      ? ensureTableHasRows(children as any[])
      : undefined;

    const response = await this.notion.pages.create({
      parent: parent as any,
      properties: properties as any,
      children: processedChildren as any,
    });
    return response as unknown as PageResponse;
  }

  async retrievePage(page_id: string): Promise<PageResponse> {
    const cached = this.cache.get(`page:${page_id}`);
    if (cached) return cached;

    const response = await this.notion.pages.retrieve({ page_id });
    const result = response as unknown as PageResponse;
    this.cache.set(`page:${page_id}`, result, 60_000); // 1분 TTL
    return result;
  }

  async updatePageProperties(
    page_id: string,
    properties: Record<string, any>
  ): Promise<PageResponse> {
    const response = await this.notion.pages.update({
      page_id,
      properties: properties as any,
    });
    this.cache.invalidate(`page:${page_id}`);
    return response as unknown as PageResponse;
  }

  // ─── Blocks ─────────────────────────────────────────────

  async appendBlockChildren(
    block_id: string,
    children: Partial<BlockResponse>[],
    after?: string
  ): Promise<BlockResponse> {
    const processedChildren = ensureTableHasRows(children as any[]);

    const response = await this.notion.blocks.children.append({
      block_id,
      children: processedChildren as any,
      after,
    });
    return response as unknown as BlockResponse;
  }

  async retrieveBlock(block_id: string): Promise<BlockResponse> {
    const response = await this.notion.blocks.retrieve({ block_id });
    return response as unknown as BlockResponse;
  }

  async retrieveBlockChildren(
    block_id: string,
    start_cursor?: string,
    page_size?: number,
    max_results?: number
  ): Promise<ListResponse> {
    if (max_results) {
      // 자동 페이지네이션 — max_results까지 모든 페이지 수집
      const allResults = await collectPaginatedAPI(
        this.notion.blocks.children.list,
        {
          block_id,
          start_cursor,
          page_size: page_size || 100,
        } as any
      );
      // max_results까지만 잘라서 반환
      const sliced = allResults.slice(0, max_results);
      return {
        object: "list",
        results: sliced as any[],
        next_cursor: null,
        has_more: allResults.length > max_results,
      } as ListResponse;
    }

    const response = await this.notion.blocks.children.list({
      block_id,
      start_cursor,
      page_size,
    } as any);
    return response as unknown as ListResponse;
  }

  async deleteBlock(block_id: string): Promise<BlockResponse> {
    const response = await this.notion.blocks.delete({ block_id });
    return response as unknown as BlockResponse;
  }

  async updateBlock(
    block_id: string,
    block: Partial<BlockResponse>
  ): Promise<BlockResponse> {
    const response = await this.notion.blocks.update({
      block_id,
      ...block,
    } as any);
    return response as unknown as BlockResponse;
  }

  // ─── Table Helpers ──────────────────────────────────────

  async tableAddRow(
    table_block_id: string,
    cells: any[][]
  ): Promise<BlockResponse> {
    const response = await this.notion.blocks.children.append({
      block_id: table_block_id,
      children: [
        {
          type: "table_row",
          table_row: { cells },
        },
      ] as any,
    });
    // append는 ListResponse를 반환하지만 첫 번째 결과 반환
    const list = response as any;
    if (list.results && list.results.length > 0) {
      return list.results[0] as BlockResponse;
    }
    return response as unknown as BlockResponse;
  }

  async tableDeleteRow(row_block_id: string): Promise<BlockResponse> {
    const response = await this.notion.blocks.delete({
      block_id: row_block_id,
    });
    return response as unknown as BlockResponse;
  }

  async tableUpdateCells(
    row_block_id: string,
    cells: any[][]
  ): Promise<BlockResponse> {
    const response = await this.notion.blocks.update({
      block_id: row_block_id,
      table_row: { cells },
    } as any);
    return response as unknown as BlockResponse;
  }

  // ─── Users ──────────────────────────────────────────────

  async listAllUsers(
    start_cursor?: string,
    page_size?: number,
    max_results?: number
  ): Promise<ListResponse> {
    if (max_results) {
      const allResults = await collectPaginatedAPI(
        this.notion.users.list,
        {
          start_cursor,
          page_size: page_size || 100,
        } as any
      );
      const sliced = allResults.slice(0, max_results);
      return {
        object: "list",
        results: sliced as any[],
        next_cursor: null,
        has_more: allResults.length > max_results,
      } as ListResponse;
    }

    const response = await this.notion.users.list({
      start_cursor,
      page_size,
    } as any);
    return response as unknown as ListResponse;
  }

  async retrieveUser(user_id: string): Promise<UserResponse> {
    const cached = this.cache.get(`user:${user_id}`);
    if (cached) return cached;

    const response = await this.notion.users.retrieve({ user_id });
    const result = response as unknown as UserResponse;
    this.cache.set(`user:${user_id}`, result, 600_000); // 10분 TTL
    return result;
  }

  async retrieveBotUser(): Promise<UserResponse> {
    const cached = this.cache.get(`user:me`);
    if (cached) return cached;

    const response = await this.notion.users.me({});
    const result = response as unknown as UserResponse;
    this.cache.set(`user:me`, result, 600_000); // 10분 TTL
    return result;
  }

  // ─── Databases ──────────────────────────────────────────

  async createDatabase(
    parent: any,
    properties: Record<string, any>,
    title?: any[]
  ): Promise<DatabaseResponse> {
    const params: any = { parent, properties };
    if (title) params.title = title;

    const response = await this.notion.databases.create(params);
    return response as unknown as DatabaseResponse;
  }

  async queryDatabase(
    database_id: string,
    filter?: Record<string, any>,
    sorts?: Array<{
      property?: string;
      timestamp?: string;
      direction: "ascending" | "descending";
    }>,
    start_cursor?: string,
    page_size?: number,
    max_results?: number
  ): Promise<ListResponse> {
    if (max_results) {
      const allResults: any[] = [];
      let cursor = start_cursor || undefined;
      let collected = 0;

      while (collected < max_results) {
        const page: any = await this.notion.request({
          path: `databases/${database_id}/query`,
          method: "post",
          body: {
            filter,
            sorts,
            start_cursor: cursor,
            page_size: Math.min(page_size || 100, max_results - collected),
          },
        });
        allResults.push(...page.results);
        collected += page.results.length;
        if (!page.has_more || !page.next_cursor) break;
        cursor = page.next_cursor;
      }

      const sliced = allResults.slice(0, max_results);
      return {
        object: "list",
        results: sliced,
        next_cursor: null,
        has_more: allResults.length > max_results,
      } as ListResponse;
    }

    const response = await this.notion.request({
      path: `databases/${database_id}/query`,
      method: "post",
      body: { filter, sorts, start_cursor, page_size },
    });
    return response as unknown as ListResponse;
  }

  async retrieveDatabase(database_id: string): Promise<DatabaseResponse> {
    const cached = this.cache.get(`db:${database_id}`);
    if (cached) return cached;

    const response = await this.notion.databases.retrieve({ database_id });
    const result = response as unknown as DatabaseResponse;
    this.cache.set(`db:${database_id}`, result, 300_000); // 5분 TTL
    return result;
  }

  async updateDatabase(
    database_id: string,
    title?: any[],
    description?: any[],
    properties?: Record<string, any>
  ): Promise<DatabaseResponse> {
    const params: any = { database_id };
    if (title) params.title = title;
    if (description) params.description = description;
    if (properties) params.properties = properties;

    const response = await this.notion.databases.update(params);
    this.cache.invalidate(`db:${database_id}`);
    return response as unknown as DatabaseResponse;
  }

  async createDatabaseItem(
    database_id: string,
    properties: Record<string, any>
  ): Promise<PageResponse> {
    const response = await this.notion.pages.create({
      parent: { database_id },
      properties: properties as any,
    });
    return response as unknown as PageResponse;
  }

  // ─── Comments ───────────────────────────────────────────

  async createComment(
    parent?: { page_id: string },
    discussion_id?: string,
    rich_text?: any[]
  ): Promise<CommentResponse> {
    const params: any = { rich_text };
    if (parent) params.parent = parent;
    if (discussion_id) params.discussion_id = discussion_id;

    const response = await this.notion.comments.create(params);
    return response as unknown as CommentResponse;
  }

  async retrieveComments(
    block_id: string,
    start_cursor?: string,
    page_size?: number
  ): Promise<ListResponse> {
    const response = await this.notion.comments.list({
      block_id,
      start_cursor,
      page_size,
    } as any);
    return response as unknown as ListResponse;
  }

  // ─── Search ─────────────────────────────────────────────

  async search(
    query?: string,
    filter?: { property: string; value: string },
    sort?: {
      direction: "ascending" | "descending";
      timestamp: "last_edited_time";
    },
    start_cursor?: string,
    page_size?: number,
    max_results?: number
  ): Promise<ListResponse> {
    if (max_results) {
      const allResults = await collectPaginatedAPI(
        this.notion.search as any,
        {
          query,
          filter,
          sort,
          start_cursor,
          page_size: page_size || 100,
        } as any
      );
      const sliced = allResults.slice(0, max_results);
      return {
        object: "list",
        results: sliced as any[],
        next_cursor: null,
        has_more: allResults.length > max_results,
      } as ListResponse;
    }

    const response = await this.notion.search({
      query,
      filter,
      sort,
      start_cursor,
      page_size,
    } as any);
    return response as unknown as ListResponse;
  }

  // ─── Markdown Conversion ────────────────────────────────

  async toMarkdown(response: NotionResponse): Promise<string> {
    return convertToMarkdown(response);
  }
}
