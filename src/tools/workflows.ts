import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { GHLClient } from "../ghl-client.js";

export const workflowTools: Tool[] = [
  {
    name: "get_workflows",
    description: "List all workflows in a GoHighLevel location",
    inputSchema: {
      type: "object",
      properties: {
        locationId: { type: "string", description: "Location ID (overrides env default)" },
      },
    },
  },
  {
    name: "add_contact_to_workflow",
    description: "Enroll a contact into an existing GoHighLevel workflow",
    inputSchema: {
      type: "object",
      properties: {
        workflowId: { type: "string", description: "The workflow ID to enroll the contact into" },
        contactId: { type: "string", description: "The contact ID to enroll" },
        eventStartTime: { type: "string", description: "Optional ISO 8601 datetime to schedule enrollment" },
      },
      required: ["workflowId", "contactId"],
    },
  },
];

export async function handleWorkflowTool(
  client: GHLClient,
  name: string,
  args: Record<string, any>
) {
  let result: any;

  switch (name) {
    case "get_workflows": {
      result = await client.get("/workflows/", {
        locationId: args.locationId ?? client.locationId,
      });
      break;
    }
    case "add_contact_to_workflow": {
      result = await client.post(`/contacts/${args.contactId}/workflow/${args.workflowId}`, {
        eventStartTime: args.eventStartTime,
      });
      break;
    }
    default:
      throw new Error(`Unknown workflow tool: ${name}`);
  }

  return {
    content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
  };
}
