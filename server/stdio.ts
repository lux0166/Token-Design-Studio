import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, ListResourcesRequestSchema, ReadResourceRequestSchema, ListPromptsRequestSchema, GetPromptRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { agentInstructions } from '../shared/workflow.js';

// Adapter only: both transports use the running HTTP server, avoiding competing file writers.
const target = new URL(process.env.STUDIO_MCP_URL ?? 'http://127.0.0.1:4318/mcp');
if (!['127.0.0.1', 'localhost', '[::1]'].includes(target.hostname)) throw new Error('Chỉ cho phép MCP local.');
const client = new Client({ name: 'token-studio-stdio', version: '0.1.0' });
try {
  await client.connect(new StreamableHTTPClientTransport(target));
  const server = new Server({ name: 'token-studio', version: '0.1.0' }, { instructions: agentInstructions, capabilities: { tools: {}, resources: {}, prompts: {} } });
  server.setRequestHandler(ListToolsRequestSchema, () => client.listTools());
  server.setRequestHandler(CallToolRequestSchema, req => client.callTool(req.params));
  server.setRequestHandler(ListResourcesRequestSchema, () => client.listResources());
  server.setRequestHandler(ReadResourceRequestSchema, req => client.readResource(req.params));
  server.setRequestHandler(ListPromptsRequestSchema, () => client.listPrompts());
  server.setRequestHandler(GetPromptRequestSchema, req => client.getPrompt(req.params));
  await server.connect(new StdioServerTransport());
  process.on('SIGINT', () => { void client.close(); void server.close(); });
  process.stdin.on('end', () => { void client.close(); void server.close(); });
} catch (error) {
  console.error('Không thể kết nối Token Studio. Khởi động npm run dev hoặc npm start trước.', error);
  process.exitCode = 1;
}
