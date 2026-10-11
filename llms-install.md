# Installing App Store & Google Play Review Intelligence MCP

Option A, hosted (recommended): add a Streamable HTTP server
URL: https://parallelstudio--app-store-review-intelligence-mcp.apify.actor/mcp
Header: Authorization: Bearer <APIFY_TOKEN>  (get a token at https://console.apify.com/settings/integrations)

Option B, local stdio (free, no keys):
1. git clone https://github.com/gunnargray-dev/app-store-review-intelligence-mcp && cd app-store-review-intelligence-mcp
2. npm install && npm run build
3. MCP config: {"mcpServers":{"app-store-reviews":{"command":"node","args":["/ABSOLUTE/PATH/app-store-review-intelligence-mcp/dist/index.js"]}}}

Tools: search_apps (find app ids), review_insights (start here: complaints, rating by version, what got worse in the latest version), get_app_reviews (raw review text), compare_apps (2-10 apps).
App ids: Apple numeric id (284882215). No API keys needed.
Google Play (package names like com.instagram.android, search_apps store "google", mixed Apple/Google compare_apps) works in Option B (local) only; it is coming soon on the hosted server.
