import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { GHLClient } from "../ghl-client.js";

export const opportunityTools: Tool[] = [
  {
    name: "get_pipelines",
    description: "Get all pipelines in GoHighLevel for a location",
    inputSchema: {
      type: "object",
      properties: {
        locationId: { type: "string", description: "Location ID (overrides env default)" },
      },
    },
  },
  {
    name: "search_opportunities",
    description: "Search opportunities across pipelines",
    inputSchema: {
      type: "object",
      properties: {
        locationId: { type: "string", description: "Location ID (overrides env default)" },
        pipelineId: { type: "string", description: "Filter by pipeline ID" },
        stageId: { type: "string", description: "Filter by stage ID" },
        contactId: { type: "string", description: "Filter by contact ID" },
        query: { type: "string", description: "Search term" },
        status: {
          type: "string",
          enum: ["open", "won", "lost", "abandoned"],
          description: "Filter by status",
        },
        limit: { type: "number", description: "Max results (default 20)" },
      },
    },
  },
  {
    name: "get_opportunity",
    description: "Get an opportunity by ID",
    inputSchema: {
      type: "object",
      properties: {
        opportunityId: { type: "string", description: "The opportunity ID" },
      },
      required: ["opportunityId"],
    },
  },
  {
    name: "create_opportunity",
    description: "Create a new opportunity in GoHighLevel",
    inputSchema: {
      type: "object",
      properties: {
        pipelineId: { type: "string", description: "Pipeline ID" },
        locationId: { type: "string", description: "Location ID (overrides env default)" },
        name: { type: "string", description: "Opportunity name" },
        pipelineStageId: { type: "string", description: "Stage ID within the pipeline" },
        status: {
          type: "string",
          enum: ["open", "won", "lost", "abandoned"],
          description: "Opportunity status (default: open)",
        },
        contactId: { type: "string", description: "Associated contact ID" },
        monetaryValue: { type: "number", description: "Deal value" },
        assignedTo: { type: "string", description: "Assigned user ID" },
      },
      required: ["pipelineId", "name", "pipelineStageId", "contactId"],
    },
  },
  {
    name: "update_opportunity",
    description: "Update an existing opportunity",
    inputSchema: {
      type: "object",
      properties: {
        opportunityId: { type: "string", description: "The opportunity ID" },
        name: { type: "string" },
        pipelineStageId: { type: "string", description: "Move to a different stage" },
        status: {
          type: "string",
          enum: ["open", "won", "lost", "abandoned"],
        },
        monetaryValue: { type: "number" },
        assignedTo: { type: "string" },
      },
      required: ["opportunityId"],
    },
  },
];

export async function handleOpportunityTool(
  client: GHLClient,
  name: string,
  args: Record<string, any>
) {
  let result: any;

  switch (name) {
    case "get_pipelines": {
      result = await client.get("/pipelines/", {
        locationId: args.locationId ?? client.locationId,
      });
      break;
    }
    case "search_opportunities": {
      result = await client.get("/opportunities/search", {
        location_id: args.locationId ?? client.locationId,
        pipeline_id: args.pipelineId,
        pipeline_stage_id: args.stageId,
        contact_id: args.contactId,
        query: args.query,
        status: args.status,
        limit: args.limit ?? 20,
      });
      break;
    }
    case "get_opportunity": {
      result = await client.get(`/opportunities/${args.opportunityId}`);
      break;
    }
    case "create_opportunity": {
      const { locationId, ...rest } = args;
      result = await client.post("/opportunities/", {
        ...rest,
        locationId: locationId ?? client.locationId,
        status: rest.status ?? "open",
      });
      break;
    }
    case "update_opportunity": {
      const { opportunityId, ...rest } = args;
      result = await client.put(`/opportunities/${opportunityId}`, rest);
      break;
    }
    default:
      throw new Error(`Unknown opportunity tool: ${name}`);
  }

  return {
    content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
  };
}
