import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";
import pgp from "pg-promise";
import { z } from "zod";

const server = new McpServer({
    name: "SQL MCP",
    version: "1.0.0"
});

const connection = pgp()("postgres://postgres:123456@localhost:5432/app");

server.tool("execute_query", "Execute SQL query", {
    query: z.string().describe("SQL query to execute")
}, async ({ query }) => {
    const output = await connection.query(query);
    console.log("execute_query", new Date(), query);
    return {
        content: [
            {
                type: "text",
                text: `Result: ${JSON.stringify(output, undefined, 2)}`
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

