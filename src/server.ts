import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { GHLClient } from "./ghl-client.js";
import { contactTools, handleContactTool } from "./tools/contacts.js";
import { conversationTools, handleConversationTool } from "./tools/conversations.js";
import { opportunityTools, handleOpportunityTool } from "./tools/opportunities.js";
import { calendarTools, handleCalendarTool } from "./tools/calendars.js";

const apiKey = process.env.GHL_API_KEY;
if (!apiKey) {
  console.error("GHL_API_KEY environment variable is required");
  process.exit(1);
}

const client = new GHLClient(apiKey, process.env.GHL_LOCATION_ID);

const server = new Server(
  { name: "ghl-mcp-server", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

const allTools = [
  ...contactTools,
  ...conversationTools,
  ...opportunityTools,
  ...calendarTools,
];

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: allTools }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;

  try {
    if (contactTools.some((t) => t.name === name)) {
      return await handleContactTool(client, name, args as Record<string, any>);
    }
    if (conversationTools.some((t) => t.name === name)) {
      return await handleConversationTool(client, name, args as Record<string, any>);
    }
    if (opportunityTools.some((t) => t.name === name)) {
      return await handleOpportunityTool(client, name, args as Record<string, any>);
    }
    if (calendarTools.some((t) => t.name === name)) {
      return await handleCalendarTool(client, name, args as Record<string, any>);
    }
    throw new Error(`Unknown tool: ${name}`);
  } catch (error: any) {
    return {
      content: [{ type: "text", text: `Error: ${error.message}` }],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("GHL MCP Server running on stdio");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
