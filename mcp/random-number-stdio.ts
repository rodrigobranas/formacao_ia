import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new McpServer({
    name: "Random Number MCP",
    version: "1.0.0"
});

server.tool("get_random_number", "Generate a random number", {}, async () => {
    const output = Math.round(Math.random() * 1000);
    return {
        content: [
            {
                type: "text",
                text: `Random number: ${output}`
            }
        ]
    }
});

const transport = new StdioServerTransport();
await server.connect(transport);

// claude mcp add random-number-mcp --scope user bun run /Users/rodrigobranas/development/workspace/branas/formacao_ia/mcp/random-number.ts
