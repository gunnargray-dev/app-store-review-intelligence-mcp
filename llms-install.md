# Installing App Store Review Intelligence MCP

Option A, hosted (recommended): add a Streamable HTTP server
URL: https://parallelstudio--app-store-review-intelligence-mcp.apify.actor/mcp
Header: Authorization: Bearer <APIFY_TOKEN>  (get a token at https://console.apify.com/settings/integrations)

Option B, local stdio (free, no keys):
1. git clone https://github.com/gunnargray-dev/app-store-review-intelligence-mcp && cd app-store-review-intelligence-mcp
2. npm install && npm run build
3. MCP config: {"mcpServers":{"app-store-reviews":{"command":"node","args":["/ABSOLUTE/PATH/app-store-review-intelligence-mcp/dist/index.js"]}}}

Tools: search_apps, get_app_reviews, review_insights, compare_apps.
