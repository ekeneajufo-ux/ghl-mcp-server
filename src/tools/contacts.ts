import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { GHLClient } from "../ghl-client.js";

export const contactTools: Tool[] = [
  {
    name: "search_contacts",
    description: "Search contacts in GoHighLevel by query string, email, or phone number",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search term (name, email, phone)" },
        locationId: { type: "string", description: "Location ID (overrides env default)" },
        limit: { type: "number", description: "Max results to return (default 20)" },
      },
      required: ["query"],
    },
  },
  {
    name: "get_contact",
    description: "Get a contact by their GoHighLevel contact ID",
    inputSchema: {
      type: "object",
      properties: {
        contactId: { type: "string", description: "The contact ID" },
      },
      required: ["contactId"],
    },
  },
  {
    name: "create_contact",
    description: "Create a new contact in GoHighLevel",
    inputSchema: {
      type: "object",
      properties: {
        firstName: { type: "string" },
        lastName: { type: "string" },
        email: { type: "string" },
        phone: { type: "string" },
        locationId: { type: "string", description: "Location ID (overrides env default)" },
        tags: { type: "array", items: { type: "string" }, description: "Tags to apply" },
        source: { type: "string", description: "Lead source" },
        companyName: { type: "string" },
        address1: { type: "string" },
        city: { type: "string" },
        state: { type: "string" },
        postalCode: { type: "string" },
        country: { type: "string" },
      },
    },
  },
  {
    name: "update_contact",
    description: "Update an existing contact in GoHighLevel",
    inputSchema: {
      type: "object",
      properties: {
        contactId: { type: "string", description: "The contact ID to update" },
        firstName: { type: "string" },
        lastName: { type: "string" },
        email: { type: "string" },
        phone: { type: "string" },
        tags: { type: "array", items: { type: "string" } },
        companyName: { type: "string" },
        address1: { type: "string" },
        city: { type: "string" },
        state: { type: "string" },
        postalCode: { type: "string" },
        country: { type: "string" },
      },
      required: ["contactId"],
    },
  },
  {
    name: "delete_contact",
    description: "Delete a contact from GoHighLevel",
    inputSchema: {
      type: "object",
      properties: {
        contactId: { type: "string", description: "The contact ID to delete" },
      },
      required: ["contactId"],
    },
  },
];

export async function handleContactTool(
  client: GHLClient,
  name: string,
  args: Record<string, any>
) {
  let result: any;

  switch (name) {
    case "search_contacts": {
      result = await client.get("/contacts/search", {
        locationId: args.locationId ?? client.locationId,
        query: args.query,
        limit: args.limit ?? 20,
      });
      break;
    }
    case "get_contact": {
      result = await client.get(`/contacts/${args.contactId}`);
      break;
    }
    case "create_contact": {
      const { locationId, ...rest } = args;
      result = await client.post("/contacts/", {
        ...rest,
        locationId: locationId ?? client.locationId,
      });
      break;
    }
    case "update_contact": {
      const { contactId, ...rest } = args;
      result = await client.put(`/contacts/${contactId}`, rest);
      break;
    }
    case "delete_contact": {
      result = await client.delete(`/contacts/${args.contactId}`);
      break;
    }
    default:
      throw new Error(`Unknown contact tool: ${name}`);
  }

  return {
    content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
  };
}
