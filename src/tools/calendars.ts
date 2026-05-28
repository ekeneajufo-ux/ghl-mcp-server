import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { GHLClient } from "../ghl-client.js";

export const calendarTools: Tool[] = [
  {
    name: "get_calendars",
    description: "Get all calendars for a GoHighLevel location",
    inputSchema: {
      type: "object",
      properties: {
        locationId: { type: "string", description: "Location ID (overrides env default)" },
      },
    },
  },
  {
    name: "get_appointments",
    description: "Get appointments for a contact or within a date range",
    inputSchema: {
      type: "object",
      properties: {
        contactId: { type: "string", description: "Filter by contact ID" },
        calendarId: { type: "string", description: "Filter by calendar ID" },
        locationId: { type: "string", description: "Location ID (overrides env default)" },
        startTime: { type: "string", description: "Start date/time ISO 8601 (e.g. 2024-01-01T00:00:00Z)" },
        endTime: { type: "string", description: "End date/time ISO 8601" },
      },
    },
  },
  {
    name: "get_appointment",
    description: "Get a single appointment by ID",
    inputSchema: {
      type: "object",
      properties: {
        appointmentId: { type: "string", description: "The appointment ID" },
      },
      required: ["appointmentId"],
    },
  },
  {
    name: "create_appointment",
    description: "Create a new appointment in GoHighLevel",
    inputSchema: {
      type: "object",
      properties: {
        calendarId: { type: "string", description: "Calendar ID to book into" },
        locationId: { type: "string", description: "Location ID (overrides env default)" },
        contactId: { type: "string", description: "Contact ID for the appointment" },
        startTime: { type: "string", description: "Appointment start time ISO 8601" },
        endTime: { type: "string", description: "Appointment end time ISO 8601" },
        title: { type: "string", description: "Appointment title" },
        appointmentStatus: {
          type: "string",
          enum: ["new", "confirmed", "cancelled", "showed", "noshow", "invalid"],
          description: "Appointment status (default: new)",
        },
        assignedUserId: { type: "string", description: "Assigned user ID" },
        address: { type: "string", description: "Location/address for the appointment" },
        notes: { type: "string", description: "Additional notes" },
      },
      required: ["calendarId", "contactId", "startTime", "endTime"],
    },
  },
  {
    name: "update_appointment",
    description: "Update an existing appointment",
    inputSchema: {
      type: "object",
      properties: {
        appointmentId: { type: "string", description: "The appointment ID" },
        startTime: { type: "string", description: "New start time ISO 8601" },
        endTime: { type: "string", description: "New end time ISO 8601" },
        title: { type: "string" },
        appointmentStatus: {
          type: "string",
          enum: ["new", "confirmed", "cancelled", "showed", "noshow", "invalid"],
        },
        assignedUserId: { type: "string" },
        address: { type: "string" },
        notes: { type: "string" },
      },
      required: ["appointmentId"],
    },
  },
];

export async function handleCalendarTool(
  client: GHLClient,
  name: string,
  args: Record<string, any>
) {
  let result: any;

  switch (name) {
    case "get_calendars": {
      result = await client.get("/calendars/", {
        locationId: args.locationId ?? client.locationId,
      });
      break;
    }
    case "get_appointments": {
      if (args.contactId) {
        result = await client.get(`/contacts/${args.contactId}/appointments`);
      } else {
        result = await client.get("/appointments/", {
          locationId: args.locationId ?? client.locationId,
          calendarId: args.calendarId,
          startTime: args.startTime,
          endTime: args.endTime,
        });
      }
      break;
    }
    case "get_appointment": {
      result = await client.get(`/appointments/${args.appointmentId}`);
      break;
    }
    case "create_appointment": {
      const { locationId, ...rest } = args;
      result = await client.post("/appointments/", {
        ...rest,
        locationId: locationId ?? client.locationId,
        appointmentStatus: rest.appointmentStatus ?? "new",
      });
      break;
    }
    case "update_appointment": {
      const { appointmentId, ...rest } = args;
      result = await client.put(`/appointments/${appointmentId}`, rest);
      break;
    }
    default:
      throw new Error(`Unknown calendar tool: ${name}`);
  }

  return {
    content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
  };
}
