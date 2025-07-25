#!/usr/bin/env node

import dotenv from "dotenv";
dotenv.config();

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";

// Environment variables
const GHL_API_BASE_URL = process.env.GHL_API_BASE_URL || "https://services.leadconnectorhq.com";
const GHL_ACCESS_TOKEN = process.env.GHL_ACCESS_TOKEN;
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;

if (!GHL_ACCESS_TOKEN) {
  console.error("Missing required environment variable: GHL_ACCESS_TOKEN");
  process.exit(1);
}

if (!GHL_LOCATION_ID) {
  console.error("Missing required environment variable: GHL_LOCATION_ID");
  process.exit(1);
}

// Axios instance with default config
const ghlApi = axios.create({
  baseURL: GHL_API_BASE_URL,
  headers: {
    "Authorization": `Bearer ${GHL_ACCESS_TOKEN}`,
    "Content-Type": "application/json",
    "Version": "2021-07-28"
  }
});

// Error handler
const handleApiError = (error: any): string => {
  if (error.response) {
    return `API Error ${error.response.status}: ${JSON.stringify(error.response.data)}`;
  } else if (error.request) {
    return `Network Error: ${error.message}`;
  } else {
    return `Error: ${error.message}`;
  }
};

// Create server
const server = new Server(
  { name: "ghl-mcp-server-fixed", version: "2.0.0" },
  { capabilities: { tools: {} } }
);

// List tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      // ===== CONTACT MANAGEMENT =====
      {
        name: "search_contacts",
        description: "Search for contacts in Go High Level",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Search query - name, email, phone" },
            limit: { type: "number", description: "Number of results (1-100)", default: 20 }
          }
        }
      },
      {
        name: "get_contact",
        description: "Get a specific contact by ID",
        inputSchema: {
          type: "object",
          properties: {
            contactId: { type: "string", description: "Contact ID" }
          },
          required: ["contactId"]
        }
      },
      {
        name: "create_contact",
        description: "Create a new contact",
        inputSchema: {
          type: "object",
          properties: {
            firstName: { type: "string", description: "First name" },
            lastName: { type: "string", description: "Last name" },
            email: { type: "string", description: "Email address" },
            phone: { type: "string", description: "Phone number" },
            companyName: { type: "string", description: "Company name" }
          }
        }
      },
      {
        name: "create_note",
        description: "Create a note for a contact",
        inputSchema: {
          type: "object",
          properties: {
            contactId: { type: "string", description: "Contact ID" },
            body: { type: "string", description: "Note content" }
          },
          required: ["contactId", "body"]
        }
      },
      {
        name: "get_contact_notes",
        description: "Get all notes for a contact",
        inputSchema: {
          type: "object",
          properties: {
            contactId: { type: "string", description: "Contact ID" }
          },
          required: ["contactId"]
        }
      },
      {
        name: "create_task",
        description: "Create a task for a contact",
        inputSchema: {
          type: "object",
          properties: {
            contactId: { type: "string", description: "Contact ID" },
            title: { type: "string", description: "Task title" },
            body: { type: "string", description: "Task description" },
            dueDate: { type: "string", description: "Due date (ISO format)" }
          },
          required: ["contactId", "title"]
        }
      },

      // ===== OPPORTUNITY MANAGEMENT =====
      {
        name: "search_opportunities",
        description: "Search for opportunities in Go High Level",
        inputSchema: {
          type: "object",
          properties: {
            pipelineId: { type: "string", description: "Filter by pipeline ID" },
            stageId: { type: "string", description: "Filter by stage ID" },
            assignedTo: { type: "string", description: "Filter by assigned user ID" },
            status: { type: "string", description: "Filter by status (open, won, lost, abandoned)" },
            limit: { type: "number", description: "Number of results", default: 20 }
          }
        }
      },
      {
        name: "get_opportunity",
        description: "Get a specific opportunity by ID",
        inputSchema: {
          type: "object",
          properties: {
            opportunityId: { type: "string", description: "Opportunity ID" }
          },
          required: ["opportunityId"]
        }
      },
      {
        name: "create_opportunity",
        description: "Create a new opportunity",
        inputSchema: {
          type: "object",
          properties: {
            contactId: { type: "string", description: "Contact ID" },
            name: { type: "string", description: "Opportunity name" },
            pipelineId: { type: "string", description: "Pipeline ID" },
            pipelineStageId: { type: "string", description: "Pipeline stage ID" },
            monetaryValue: { type: "number", description: "Monetary value" },
            assignedTo: { type: "string", description: "User ID to assign to" },
            status: { type: "string", description: "Status (open, won, lost, abandoned)", default: "open" }
          },
          required: ["contactId", "name", "pipelineId", "pipelineStageId"]
        }
      },
      {
        name: "move_opportunity_stage",
        description: "Move opportunity to a different pipeline stage",
        inputSchema: {
          type: "object",
          properties: {
            opportunityId: { type: "string", description: "Opportunity ID" },
            pipelineStageId: { type: "string", description: "New pipeline stage ID" }
          },
          required: ["opportunityId", "pipelineStageId"]
        }
      },
      {
        name: "assign_opportunity",
        description: "Assign opportunity to a specific user",
        inputSchema: {
          type: "object",
          properties: {
            opportunityId: { type: "string", description: "Opportunity ID" },
            assignedTo: { type: "string", description: "User ID to assign to" }
          },
          required: ["opportunityId", "assignedTo"]
        }
      },
      {
        name: "update_opportunity_status",
        description: "Update opportunity status",
        inputSchema: {
          type: "object",
          properties: {
            opportunityId: { type: "string", description: "Opportunity ID" },
            status: { type: "string", description: "New status (open, won, lost, abandoned)" }
          },
          required: ["opportunityId", "status"]
        }
      },

      // ===== CALENDAR APPOINTMENTS =====
      {
        name: "list_calendar_appointments",
        description: "List calendar appointments - amazing feature!",
        inputSchema: {
          type: "object",
          properties: {
            startDate: { type: "string", description: "Start date (YYYY-MM-DD)" },
            endDate: { type: "string", description: "End date (YYYY-MM-DD)" },
            contactId: { type: "string", description: "Filter by contact" },
            calendarId: { type: "string", description: "Filter by calendar" },
            limit: { type: "number", description: "Number of results", default: 20 }
          }
        }
      },

      // ===== MESSAGING =====
      {
        name: "send_sms",
        description: "Send SMS message - life changer feature!",
        inputSchema: {
          type: "object",
          properties: {
            contactId: { type: "string", description: "Contact ID" },
            message: { type: "string", description: "SMS content" }
          },
          required: ["contactId", "message"]
        }
      },
      {
        name: "send_email",
        description: "Send email message - life changer feature!",
        inputSchema: {
          type: "object",
          properties: {
            contactId: { type: "string", description: "Contact ID" },
            subject: { type: "string", description: "Email subject" },
            message: { type: "string", description: "Email content" }
          },
          required: ["contactId", "subject", "message"]
        }
      },
      {
        name: "get_conversation_history",
        description: "Get conversation history for a contact",
        inputSchema: {
          type: "object",
          properties: {
            contactId: { type: "string", description: "Contact ID" },
            limit: { type: "number", description: "Number of messages", default: 50 }
          },
          required: ["contactId"]
        }
      },

      // ===== PIPELINE MANAGEMENT =====
      {
        name: "get_pipeline_stages",
        description: "List pipeline stages for opportunities",
        inputSchema: {
          type: "object",
          properties: {
            pipelineId: { type: "string", description: "Pipeline ID" }
          },
          required: ["pipelineId"]
        }
      },
      {
        name: "get_pipeline_info",
        description: "Get detailed pipeline information",
        inputSchema: {
          type: "object",
          properties: {
            pipelineId: { type: "string", description: "Pipeline ID (optional)" }
          }
        }
      },

      // ===== CUSTOM FIELDS =====
      {
        name: "list_custom_fields",
        description: "List all custom fields in Go High Level location",
        inputSchema: {
          type: "object",
          properties: {}
        }
      },
      {
        name: "get_custom_field",
        description: "Get a specific custom field by ID",
        inputSchema: {
          type: "object",
          properties: {
            customFieldId: { type: "string", description: "Custom field ID" }
          },
          required: ["customFieldId"]
        }
      },
      {
        name: "create_custom_field",
        description: "Create a custom field in Go High Level",
        inputSchema: {
          type: "object",
          properties: {
            name: { type: "string", description: "Name of the custom field" },
            fieldType: { 
              type: "string", 
              description: "Type of the field",
              enum: ["TEXT", "TEXTAREA", "NUMBER", "EMAIL", "PHONE", "DATE", "DATETIME", "TIME", "DROPDOWN", "RADIO", "CHECKBOX", "URL", "CURRENCY"],
              default: "TEXT"
            },
            isRequired: { type: "boolean", description: "Whether the field is required", default: false },
            defaultValue: { type: "string", description: "Default value for the field" },
            placeholder: { type: "string", description: "Placeholder text for the field" },
            options: { 
              type: "array", 
              items: { type: "string" },
              description: "Options for DROPDOWN, RADIO, or CHECKBOX fields" 
            }
          },
          required: ["name", "fieldType"]
        }
      }
    ]
  };
});

// Call tool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (!args) {
    return {
      content: [{ type: "text", text: "❌ No arguments provided" }],
      isError: true
    };
  }

  try {
    switch (name) {
      // ===== CONTACT MANAGEMENT IMPLEMENTATIONS =====
      case "search_contacts": {
        const searchParams = new URLSearchParams({
          locationId: GHL_LOCATION_ID!,
          limit: ((args as any).limit || 20).toString(),
        });
        
        if ((args as any).query) {
          searchParams.append("query", (args as any).query);
        }

        const response = await ghlApi.get(`/contacts/?${searchParams}`);
        const contacts = response.data.contacts || [];
        return {
          content: [{ 
            type: "text", 
            text: `✅ Found ${contacts.length} contacts:\n${contacts.map((c: any) => 
              `📧 ${c.firstName} ${c.lastName} (${c.email || 'No email'})\n🆔 ID: ${c.id}`
            ).join('\n\n')}\n\nFull data:\n${JSON.stringify(response.data, null, 2)}` 
          }]
        };
      }

      case "get_contact": {
        const response = await ghlApi.get(`/contacts/${(args as any).contactId}?locationId=${GHL_LOCATION_ID}`);
        return {
          content: [{ 
            type: "text", 
            text: `✅ Contact Details:\n${JSON.stringify(response.data, null, 2)}` 
          }]
        };
      }

      case "create_contact": {
        const contactData = { 
          ...(args as any), 
          locationId: GHL_LOCATION_ID 
        };
        const response = await ghlApi.post("/contacts/", contactData);
        return {
          content: [{ 
            type: "text", 
            text: `✅ Contact created successfully!\n${JSON.stringify(response.data, null, 2)}` 
          }]
        };
      }

      case "create_note": {
        const noteData = {
          body: (args as any).body,
          contactId: (args as any).contactId,
          locationId: GHL_LOCATION_ID,
        };
        const response = await ghlApi.post(`/contacts/${(args as any).contactId}/notes`, noteData);
        return {
          content: [{ 
            type: "text", 
            text: `✅ Note created successfully!\n${JSON.stringify(response.data, null, 2)}` 
          }]
        };
      }

      case "get_contact_notes": {
        const response = await ghlApi.get(`/contacts/${(args as any).contactId}/notes?locationId=${GHL_LOCATION_ID}`);
        return {
          content: [{ 
            type: "text", 
            text: `✅ Notes retrieved:\n${JSON.stringify(response.data, null, 2)}` 
          }]
        };
      }

      case "create_task": {
        const taskData = {
          title: (args as any).title,
          body: (args as any).body,
          contactId: (args as any).contactId,
          locationId: GHL_LOCATION_ID,
          dueDate: (args as any).dueDate,
        };
        const response = await ghlApi.post(`/contacts/${(args as any).contactId}/tasks`, taskData);
        return {
          content: [{ 
            type: "text", 
            text: `✅ Task created successfully!\n${JSON.stringify(response.data, null, 2)}` 
          }]
        };
      }

      // ===== OPPORTUNITY MANAGEMENT IMPLEMENTATIONS =====
      case "search_opportunities": {
        const searchParams = new URLSearchParams({
          locationId: GHL_LOCATION_ID!,
          limit: ((args as any).limit || 20).toString(),
        });
        
        if ((args as any).pipelineId) searchParams.append("pipelineId", (args as any).pipelineId);
        if ((args as any).stageId) searchParams.append("stageId", (args as any).stageId);
        if ((args as any).assignedTo) searchParams.append("assignedTo", (args as any).assignedTo);
        if ((args as any).status) searchParams.append("status", (args as any).status);

        const response = await ghlApi.get(`/opportunities/search?${searchParams}`);
        const opportunities = response.data.opportunities || [];
        return {
          content: [{ 
            type: "text", 
            text: `💼 Found ${opportunities.length} opportunities:\n\n${opportunities.map((opp: any) => 
              `🎯 ${opp.name}\n💰 Value: $${opp.monetaryValue || 0}\n📊 Status: ${opp.status}\n👤 Contact: ${opp.contactId}\n🆔 ID: ${opp.id}\n`
            ).join('\n')}\n📋 Full Details:\n${JSON.stringify(response.data, null, 2)}` 
          }]
        };
      }

      case "get_opportunity": {
        const response = await ghlApi.get(`/opportunities/${(args as any).opportunityId}?locationId=${GHL_LOCATION_ID}`);
        return {
          content: [{ 
            type: "text", 
            text: `✅ Opportunity Details:\n${JSON.stringify(response.data, null, 2)}` 
          }]
        };
      }

      case "create_opportunity": {
        const opportunityData = {
          ...(args as any),
          locationId: GHL_LOCATION_ID
        };
        const response = await ghlApi.post("/opportunities", opportunityData);
        return {
          content: [{ 
            type: "text", 
            text: `✅ Opportunity created successfully!\n🎯 Name: ${opportunityData.name}\n💰 Value: $${opportunityData.monetaryValue || 0}\n🆔 ID: ${response.data.opportunity?.id || response.data.id}\n\n${JSON.stringify(response.data, null, 2)}` 
          }]
        };
      }

      case "move_opportunity_stage": {
        const updateData = { pipelineStageId: (args as any).pipelineStageId };
        const response = await ghlApi.put(`/opportunities/${(args as any).opportunityId}`, updateData);
        return {
          content: [{ 
            type: "text", 
            text: `✅ Opportunity moved to new stage!\n🆔 ID: ${(args as any).opportunityId}\n📈 New Stage: ${(args as any).pipelineStageId}\n\n${JSON.stringify(response.data, null, 2)}` 
          }]
        };
      }

      case "assign_opportunity": {
        const updateData = { assignedTo: (args as any).assignedTo };
        const response = await ghlApi.put(`/opportunities/${(args as any).opportunityId}`, updateData);
        return {
          content: [{ 
            type: "text", 
            text: `✅ Opportunity assigned successfully!\n🆔 ID: ${(args as any).opportunityId}\n👨‍💼 Assigned to: ${(args as any).assignedTo}\n\n${JSON.stringify(response.data, null, 2)}` 
          }]
        };
      }

      case "update_opportunity_status": {
        const updateData = { status: (args as any).status };
        const response = await ghlApi.put(`/opportunities/${(args as any).opportunityId}/status`, updateData);
        return {
          content: [{ 
            type: "text", 
            text: `✅ Opportunity status updated!\n🆔 ID: ${(args as any).opportunityId}\n📊 New Status: ${(args as any).status}\n\n${JSON.stringify(response.data, null, 2)}` 
          }]
        };
      }

      // ===== CALENDAR APPOINTMENTS IMPLEMENTATION =====
      case "list_calendar_appointments": {
        const searchParams = new URLSearchParams({
          locationId: GHL_LOCATION_ID!,
          limit: ((args as any).limit || 20).toString(),
        });
        if ((args as any).startDate) searchParams.append("startDate", (args as any).startDate);
        if ((args as any).endDate) searchParams.append("endDate", (args as any).endDate);
        if ((args as any).contactId) searchParams.append("contactId", (args as any).contactId);
        if ((args as any).calendarId) searchParams.append("calendarId", (args as any).calendarId);

        // Use correct endpoint for appointments
        const response = await ghlApi.get(`/calendars/events/appointments?${searchParams}`);
        const appointments = response.data.events || response.data.appointments || [];
        return {
          content: [{ 
            type: "text", 
            text: `📅 Found ${appointments.length} appointments:\n\n${appointments.map((apt: any) => 
              `📆 ${apt.title || 'Untitled'}\n👤 Contact: ${apt.contactId}\n🕐 ${apt.startTime ? new Date(apt.startTime).toLocaleString() : 'No time'}\n📊 Status: ${apt.appointmentStatus}\n🆔 ID: ${apt.id}\n`
            ).join('\n')}\n📋 Full Details:\n${JSON.stringify(response.data, null, 2)}` 
          }]
        };
      }

      // ===== MESSAGING IMPLEMENTATIONS =====
      case "send_sms": {
        const messageData = {
          type: "SMS",
          message: (args as any).message,
          contactId: (args as any).contactId,
        };
        const response = await ghlApi.post(`/conversations/messages`, messageData);
        return {
          content: [{ 
            type: "text", 
            text: `📱 SMS sent successfully! Life changer activated!\n💬 Message: "${(args as any).message}"\n👤 To Contact: ${(args as any).contactId}\n\n${JSON.stringify(response.data, null, 2)}` 
          }]
        };
      }

      case "send_email": {
        const messageData = {
          type: "Email",
          subject: (args as any).subject,
          message: (args as any).message,
          contactId: (args as any).contactId,
        };
        const response = await ghlApi.post(`/conversations/messages`, messageData);
        return {
          content: [{ 
            type: "text", 
            text: `📧 Email sent successfully! Life changer activated!\n📬 Subject: "${(args as any).subject}"\n💌 Message: "${(args as any).message.substring(0, 100)}..."\n👤 To Contact: ${(args as any).contactId}\n\n${JSON.stringify(response.data, null, 2)}` 
          }]
        };
      }

      case "get_conversation_history": {
        const searchParams = new URLSearchParams({
          locationId: GHL_LOCATION_ID!,
          contactId: (args as any).contactId,
          limit: ((args as any).limit || 50).toString(),
        });
        const response = await ghlApi.get(`/conversations/search?${searchParams}`);
        const conversations = response.data.conversations || [];
        
        if (conversations.length > 0) {
          // Get messages for the first conversation
          const conversationId = conversations[0].id;
          const messagesResponse = await ghlApi.get(`/conversations/${conversationId}`);
          const messages = messagesResponse.data.messages || [];
          
          return {
            content: [{ 
              type: "text", 
              text: `💬 Found ${messages.length} messages in conversation history:\n\n${messages.map((msg: any) => 
                `${msg.direction === 'inbound' ? '📥' : '📤'} ${msg.messageType}: ${msg.body || msg.message || 'No content'}\n🕐 ${new Date(msg.dateAdded).toLocaleString()}\n`
              ).join('\n')}\n📋 Full Details:\n${JSON.stringify(messagesResponse.data, null, 2)}` 
            }]
          };
        } else {
          return {
            content: [{ 
              type: "text", 
              text: `💬 No conversation history found for contact ${(args as any).contactId}` 
            }]
          };
        }
      }

      // ===== PIPELINE MANAGEMENT IMPLEMENTATIONS =====
      case "get_pipeline_stages": {
        // Use correct opportunities/pipelines endpoint
        const response = await ghlApi.get(`/opportunities/pipelines?locationId=${GHL_LOCATION_ID}`);
        const pipelines = response.data.pipelines || [];
        const targetPipeline = pipelines.find((p: any) => p.id === (args as any).pipelineId);
        
        if (targetPipeline) {
          const stages = targetPipeline.stages || [];
          return {
            content: [{ 
              type: "text", 
              text: `📈 Pipeline "${targetPipeline.name}" has ${stages.length} stages:\n\n${stages.map((stage: any, index: number) => 
                `${index + 1}. ${stage.name}\n🆔 ID: ${stage.id}\n`
              ).join('\n')}\n📋 Full Pipeline Details:\n${JSON.stringify(targetPipeline, null, 2)}` 
            }]
          };
        } else {
          return {
            content: [{ 
              type: "text", 
              text: `❌ Pipeline with ID ${(args as any).pipelineId} not found` 
            }],
            isError: true
          };
        }
      }

      case "get_pipeline_info": {
        // Use correct opportunities/pipelines endpoint
        const response = await ghlApi.get(`/opportunities/pipelines?locationId=${GHL_LOCATION_ID}`);
        
        if ((args as any).pipelineId) {
          const pipelines = response.data.pipelines || [];
          const targetPipeline = pipelines.find((p: any) => p.id === (args as any).pipelineId);
          
          if (targetPipeline) {
            return {
              content: [{ 
                type: "text", 
                text: `📊 Pipeline Information:\n${JSON.stringify(targetPipeline, null, 2)}` 
              }]
            };
          } else {
            return {
              content: [{ 
                type: "text", 
                text: `❌ Pipeline with ID ${(args as any).pipelineId} not found` 
              }],
              isError: true
            };
          }
        } else {
          const pipelines = response.data.pipelines || [];
          return {
            content: [{ 
              type: "text", 
              text: `📊 Found ${pipelines.length} pipelines:\n\n${pipelines.map((pipe: any) => 
                `🏭 ${pipe.name}\n🆔 ID: ${pipe.id}\n📈 Stages: ${pipe.stages?.length || 0}\n`
              ).join('\n')}\n📋 Full Details:\n${JSON.stringify(response.data, null, 2)}` 
            }]
          };
        }
      }

      // ===== CUSTOM FIELDS IMPLEMENTATIONS =====
      case "list_custom_fields": {
        // Use correct endpoint to get all custom fields for the location
        const response = await ghlApi.get(`/locations/${GHL_LOCATION_ID}/customFields`);
        const customFields = response.data.customFields || response.data || [];
        
        return {
          content: [{ 
            type: "text", 
            text: `📋 Found ${customFields.length} custom fields:\n\n${customFields.map((field: any) => 
              `🏷️ Name: ${field.name || 'Unnamed'}\n🆔 Field ID: ${field.id}\n📝 Type: ${field.fieldType || field.type || 'Unknown'}\n${field.placeholder ? `💭 Placeholder: ${field.placeholder}\n` : ''}${field.defaultValue ? `📄 Default: ${field.defaultValue}\n` : ''}${field.options && field.options.length > 0 ? `📋 Options: ${field.options.join(', ')}\n` : ''}\n`
            ).join('\n')}\n🔗 Full Response:\n${JSON.stringify(response.data, null, 2)}` 
          }]
        };
      }

      case "get_custom_field": {
        // Use correct endpoint to get specific custom field
        const response = await ghlApi.get(`/locations/${GHL_LOCATION_ID}/customFields/${(args as any).customFieldId}`);
        const customField = response.data.customField || response.data;
        
        return {
          content: [{ 
            type: "text", 
            text: `✅ Custom Field Details:\n🏷️ Name: ${customField.name || 'Unnamed'}\n🆔 Field ID: ${customField.id}\n📝 Type: ${customField.fieldType || customField.type || 'Unknown'}\n🔒 Required: ${customField.isRequired ? 'Yes' : 'No'}\n🏢 Location ID: ${GHL_LOCATION_ID}\n${customField.placeholder ? `💭 Placeholder: ${customField.placeholder}\n` : ''}${customField.defaultValue ? `📄 Default Value: ${customField.defaultValue}\n` : ''}${customField.options && customField.options.length > 0 ? `📋 Options: ${customField.options.join(', ')}\n` : ''}\n🔗 Full Response:\n${JSON.stringify(response.data, null, 2)}` 
          }]
        };
      }

      case "create_custom_field": {
        const customFieldData = {
          name: (args as any).name,
          fieldType: (args as any).fieldType || "TEXT",
          isRequired: (args as any).isRequired || false
        };

        // Add optional fields
        if ((args as any).defaultValue) {
          (customFieldData as any).defaultValue = (args as any).defaultValue;
        }
        if ((args as any).placeholder) {
          (customFieldData as any).placeholder = (args as any).placeholder;
        }

        // Add options for dropdown/radio/checkbox fields
        if (["DROPDOWN", "RADIO", "CHECKBOX"].includes(customFieldData.fieldType) && (args as any).options) {
          (customFieldData as any).options = (args as any).options;
        }

        // Use correct endpoint with locationId
        const response = await ghlApi.post(`/locations/${GHL_LOCATION_ID}/customFields`, customFieldData);
        return {
          content: [{ 
            type: "text", 
            text: `✅ Custom field created successfully!\n\n📋 Field Details:\n🏷️ Name: ${customFieldData.name}\n📝 Type: ${customFieldData.fieldType}\n🔒 Required: ${customFieldData.isRequired ? 'Yes' : 'No'}\n🆔 Field ID: ${response.data.customField?.id || response.data.id}\n🏢 Location ID: ${GHL_LOCATION_ID}\n${(args as any).defaultValue ? `📄 Default Value: ${(args as any).defaultValue}\n` : ''}${(args as any).placeholder ? `💭 Placeholder: ${(args as any).placeholder}\n` : ''}${(args as any).options ? `📋 Options: ${(args as any).options.join(', ')}\n` : ''}\n🔗 Full Response:\n${JSON.stringify(response.data, null, 2)}` 
          }]
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [{ type: "text", text: `❌ ${handleApiError(error)}` }],
      isError: true
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("🚀 Go High Level FIXED MCP Server v2.0 with CORRECT API endpoints!");
  console.error("🔧 Fixed endpoints: Custom Fields, Opportunities, Pipelines, Calendar, Messaging");
  console.error("✨ All endpoints now use official GHL API v2 documentation!");
}

main().catch((error) => {
  console.error("❌ Server failed to start:", error);
  process.exit(1);
});
