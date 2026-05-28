import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { GHLClient } from "../ghl-client.js";

export const conversationTools: Tool[] = [
  {
    name: "search_conversations",
    description: "Search conversations in GoHighLevel",
    inputSchema: {
      type: "object",
      properties: {
        locationId: { type: "string", description: "Location ID (overrides env default)" },
        contactId: { type: "string", description: "Filter by contact ID" },
        assignedTo: { type: "string", description: "Filter by assigned user ID" },
        query: { type: "string", description: "Search query" },
        limit: { type: "number", description: "Max results (default 20)" },
        status: {
          type: "string",
          enum: ["all", "read", "unread", "starred", "recents"],
          description: "Filter by status",
        },
      },
    },
  },
  {
    name: "get_conversation",
    description: "Get a conversation by ID",
    inputSchema: {
      type: "object",
      properties: {
        conversationId: { type: "string", description: "The conversation ID" },
      },
      required: ["conversationId"],
    },
  },
  {
    name: "get_messages",
    description: "Get all messages in a conversation",
    inputSchema: {
      type: "object",
      properties: {
        conversationId: { type: "string", description: "The conversation ID" },
        limit: { type: "number", description: "Max messages to return (default 20)" },
      },
      required: ["conversationId"],
    },
  },
  {
    name: "send_message",
    description: "Send a message to a contact (SMS, email, or WhatsApp)",
    inputSchema: {
      type: "object",
      properties: {
        type: {
          type: "string",
          enum: ["SMS", "Email", "WhatsApp", "GMB", "IG", "FB", "Custom", "Live_Chat"],
          description: "Message type",
        },
        contactId: { type: "string", description: "Recipient contact ID" },
        conversationId: { type: "string", description: "Existing conversation ID (optional)" },
        message: { type: "string", description: "Message body text" },
        subject: { type: "string", description: "Email subject (for Email type)" },
        html: { type: "string", description: "HTML body (for Email type)" },
        fromNumber: { type: "string", description: "Sender phone number (for SMS)" },
        toNumber: { type: "string", description: "Recipient phone number (for SMS)" },
        emailFrom: { type: "string", description: "Sender email (for Email)" },
        emailTo: { type: "string", description: "Recipient email (for Email)" },
      },
      required: ["type", "contactId", "message"],
    },
  },
];

export async function handleConversationTool(
  client: GHLClient,
  name: string,
  args: Record<string, any>
) {
  let result: any;

  switch (name) {
    case "search_conversations": {
      result = await client.get("/conversations/search", {
        locationId: args.locationId ?? client.locationId,
        contactId: args.contactId,
        assignedTo: args.assignedTo,
        query: args.query,
        limit: args.limit ?? 20,
        status: args.status,
      });
      break;
    }
    case "get_conversation": {
      result = await client.get(`/conversations/${args.conversationId}`);
      break;
    }
    case "get_messages": {
      result = await client.get(`/conversations/${args.conversationId}/messages`, {
        limit: args.limit ?? 20,
      });
      break;
    }
    case "send_message": {
      result = await client.post("/conversations/messages", {
        type: args.type,
        contactId: args.contactId,
        conversationId: args.conversationId,
        message: args.message,
        subject: args.subject,
        html: args.html,
        fromNumber: args.fromNumber,
        toNumber: args.toNumber,
        emailFrom: args.emailFrom,
        emailTo: args.emailTo,
      });
      break;
    }
    default:
      throw new Error(`Unknown conversation tool: ${name}`);
  }

  return {
    content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
  };
}
