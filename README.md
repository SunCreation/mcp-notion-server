# @suncreation/mcp-notion-server

MCP Server for the Notion API, enabling LLM to interact with Notion workspaces.

> **Fork Notice**: This is a fork of [@suekou/mcp-notion-server](https://github.com/suekou/mcp-notion-server) with enhancements including improved error handling, additional features, and better environment variable support.

## Features

- Full Notion API integration via MCP (Model Context Protocol)
- Markdown conversion to reduce token usage
- **Page creation** (`notion_create_page`) - Create new pages under existing pages
- Supports both `NOTION_API_TOKEN` and `NOTION_API_KEY` environment variables
- Enhanced error handling with detailed HTTP status code messages

## Installation

```bash
npx -y @suncreation/mcp-notion-server
```

## Quick Start

### 1. Create a Notion Integration

1. Visit the [Notion Integrations page](https://www.notion.so/profile/integrations)
2. Click **"New Integration"**
3. Name your integration and select permissions:
   - ✅ Read content
   - ✅ Update content
   - ✅ Insert content
4. Copy the **"Internal Integration Token"** (starts with `ntn_` or `secret_`)

### 2. Connect Integration to Pages

1. Open the Notion page you want to access
2. Click **"···"** (top right) → **"Connections"**
3. Add your integration

### 3. Configure Your MCP Client

#### OpenCode

Add to `~/.config/opencode/opencode.json`:

```json
{
  "mcp": {
    "notion": {
      "type": "local",
      "command": ["npx", "-y", "@suncreation/mcp-notion-server"],
      "environment": {
        "NOTION_API_TOKEN": "your-integration-token"
      },
      "enabled": true
    }
  }
}
```

#### Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "notion": {
      "command": "npx",
      "args": ["-y", "@suncreation/mcp-notion-server"],
      "env": {
        "NOTION_API_TOKEN": "your-integration-token"
      }
    }
  }
}
```

#### Multiple Workspaces

You can connect multiple Notion workspaces by using different names:

```json
{
  "mcp": {
    "notion-work": {
      "type": "local",
      "command": ["npx", "-y", "@suncreation/mcp-notion-server"],
      "environment": {
        "NOTION_API_TOKEN": "work-workspace-token"
      },
      "enabled": true
    },
    "notion-personal": {
      "type": "local",
      "command": ["npx", "-y", "@suncreation/mcp-notion-server"],
      "environment": {
        "NOTION_API_TOKEN": "personal-workspace-token"
      },
      "enabled": true
    }
  }
}
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NOTION_API_TOKEN` | Yes* | Your Notion API integration token |
| `NOTION_API_KEY` | Yes* | Alternative name for the token (either works) |
| `NOTION_MARKDOWN_CONVERSION` | No | Set to `"true"` for Markdown output (reduces tokens) |

*One of `NOTION_API_TOKEN` or `NOTION_API_KEY` is required.

## Available Tools

### Pages
| Tool | Description |
|------|-------------|
| `notion_retrieve_page` | Get page information |
| `notion_update_page_properties` | Update page properties |
| `notion_create_page` | **Create a new page** (enhanced feature) |

### Blocks
| Tool | Description |
|------|-------------|
| `notion_retrieve_block` | Get block information |
| `notion_retrieve_block_children` | Get child blocks |
| `notion_append_block_children` | Add blocks to a page/block |
| `notion_delete_block` | Delete a block |

### Databases
| Tool | Description |
|------|-------------|
| `notion_create_database` | Create a new database |
| `notion_query_database` | Query database entries |
| `notion_retrieve_database` | Get database schema |
| `notion_update_database` | Update database properties |
| `notion_create_database_item` | Add item to database |

### Search & Users
| Tool | Description |
|------|-------------|
| `notion_search` | Search pages/databases by title |
| `notion_list_all_users` | List workspace users (Enterprise) |
| `notion_retrieve_user` | Get user details (Enterprise) |
| `notion_retrieve_bot_user` | Get bot user info |

### Comments
| Tool | Description |
|------|-------------|
| `notion_create_comment` | Add a comment |
| `notion_retrieve_comments` | Get comments on a page/block |

## Command Line Options

```bash
# Enable only specific tools
node build/index.js --enabledTools=notion_retrieve_page,notion_query_database

# Read-only mode example
node build/index.js --enabledTools=notion_retrieve_block,notion_retrieve_block_children,notion_retrieve_page,notion_query_database,notion_retrieve_database,notion_search
```

## Markdown Conversion

Enable Markdown conversion for reduced token usage:

```json
{
  "environment": {
    "NOTION_API_TOKEN": "your-token",
    "NOTION_MARKDOWN_CONVERSION": "true"
  }
}
```

- Use `format: "markdown"` for readable output (viewing)
- Use `format: "json"` for structured data (editing)

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Permission denied | Ensure integration is added to the page via "Connections" |
| 401 Unauthorized | Check your API token is correct |
| 404 Not Found | Verify the page/database ID is correct |
| Rate limited | Add delays between requests |

## Development

```bash
# Clone and install
git clone https://github.com/SunCreation/mcp-notion-server.git
cd mcp-notion-server
npm install

# Build
npm run build

# Test
npm test

# Watch mode
npm run watch
```

## Changes from Original

This fork includes the following enhancements over [@suekou/mcp-notion-server](https://github.com/suekou/mcp-notion-server):

1. **`notion_create_page` tool** - Create new pages under existing pages
2. **Dual environment variable support** - Both `NOTION_API_TOKEN` and `NOTION_API_KEY` work
3. **Enhanced error handling** - Detailed HTTP status code messages for easier debugging
4. **`setApiVersion()` method** - Dynamically change API version if needed

## License

MIT License - see [LICENSE](LICENSE) file.

## Credits

- Original project: [@suekou/mcp-notion-server](https://github.com/suekou/mcp-notion-server)
- Setup guides: [English](https://dev.to/suekou/operating-notion-via-claude-desktop-using-mcp-c0h) | [Japanese](https://qiita.com/suekou/items/44c864583f5e3e6325d9)
