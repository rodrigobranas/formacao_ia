import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";

const server = new McpServer({
    name: "Random Number MCP",
    version: "1.0.0"
});

server.tool("get_random_number", "Generate a random number", {}, async () => {
    const output = Math.round(Math.random() * 1000);
    console.log("get_random_number", new Date(), output);
    return {
        content: [
            {
                type: "text",
                text: `Random number: ${output}`
            }
        ]
    }
});

const app = express();
app.use(express.json());

app.post("/mcp", async (req, res) => {
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
    res.on("close", () => transport.close());
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
});

app.listen(3000);

