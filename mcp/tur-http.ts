import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";
import pgp from "pg-promise";
import { z } from "zod";

const server = new McpServer({
    name: "Tur MCP",
    version: "1.0.0"
});

const connection = pgp()("postgres://postgres:123456@localhost:5432/app");

const BASE_SELECT = `
    SELECT
        f.id,
        f.flight_number,
        al.name AS airline,
        al.iata_code AS airline_code,
        f.aircraft,
        f.origin_airport,
        f.destination_airport,
        to_char(f.departure_datetime, 'YYYY-MM-DD HH24:MI') AS departure,
        to_char(f.arrival_datetime, 'YYYY-MM-DD HH24:MI') AS arrival,
        f.duration_minutes,
        f.price,
        f.currency,
        f.cabin_class,
        f.seats_available,
        f.stops,
        f.status,
        f.terminal,
        f.gate
    FROM flight f
    JOIN airline al ON al.id = f.airline_id
`;

// Whitelist of sortable columns to avoid SQL injection via ORDER BY.
const ORDER_COLUMNS: Record<string, string> = {
    price: "f.price",
    departure: "f.departure_datetime",
    arrival: "f.arrival_datetime",
    duration: "f.duration_minutes",
    seats: "f.seats_available"
};

type Filter = {
    origin?: string;
    destination?: string;
    date?: string;
    date_from?: string;
    date_to?: string;
    max_price?: number;
    min_price?: number;
    airline?: string;
    cabin_class?: string;
    status?: string;
    only_available?: boolean;
    min_seats?: number;
    depart_after?: string;
    depart_before?: string;
    arrive_after?: string;
    arrive_before?: string;
    max_duration?: number;
    order_by?: string;
    order_dir?: string;
    limit?: number;
};

// Builds and runs a parameterized flight query from an optional filter set.
async function queryFlights(f: Filter) {
    const conditions: string[] = [];
    const params: Record<string, unknown> = {};

    if (f.origin) { conditions.push("f.origin_airport = ${origin}"); params.origin = f.origin.toUpperCase(); }
    if (f.destination) { conditions.push("f.destination_airport = ${destination}"); params.destination = f.destination.toUpperCase(); }
    if (f.date) { conditions.push("f.departure_datetime::date = ${date}::date"); params.date = f.date; }
    if (f.date_from) { conditions.push("f.departure_datetime::date >= ${date_from}::date"); params.date_from = f.date_from; }
    if (f.date_to) { conditions.push("f.departure_datetime::date <= ${date_to}::date"); params.date_to = f.date_to; }
    if (f.max_price !== undefined) { conditions.push("f.price <= ${max_price}"); params.max_price = f.max_price; }
    if (f.min_price !== undefined) { conditions.push("f.price >= ${min_price}"); params.min_price = f.min_price; }
    if (f.airline) { conditions.push("(al.name ILIKE ${airline} OR al.iata_code ILIKE ${airline})"); params.airline = f.airline; }
    if (f.cabin_class) { conditions.push("f.cabin_class ILIKE ${cabin_class}"); params.cabin_class = f.cabin_class; }
    if (f.status) { conditions.push("f.status = ${status}"); params.status = f.status; }
    if (f.only_available) { conditions.push("f.seats_available > 0 AND f.status <> 'Cancelled'"); }
    if (f.min_seats !== undefined) { conditions.push("f.seats_available >= ${min_seats}"); params.min_seats = f.min_seats; }
    if (f.depart_after) { conditions.push("f.departure_datetime::time >= ${depart_after}::time"); params.depart_after = f.depart_after; }
    if (f.depart_before) { conditions.push("f.departure_datetime::time <= ${depart_before}::time"); params.depart_before = f.depart_before; }
    if (f.arrive_after) { conditions.push("f.arrival_datetime::time >= ${arrive_after}::time"); params.arrive_after = f.arrive_after; }
    if (f.arrive_before) { conditions.push("f.arrival_datetime::time <= ${arrive_before}::time"); params.arrive_before = f.arrive_before; }
    if (f.max_duration !== undefined) { conditions.push("f.duration_minutes <= ${max_duration}"); params.max_duration = f.max_duration; }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const orderCol = ORDER_COLUMNS[f.order_by ?? "price"] ?? "f.price";
    const orderDir = (f.order_dir ?? "asc").toLowerCase() === "desc" ? "DESC" : "ASC";
    params.limit = Math.min(Math.max(f.limit ?? 20, 1), 100);

    const sql = `${BASE_SELECT} ${where} ORDER BY ${orderCol} ${orderDir} LIMIT ${"${limit}"}`;
    return connection.any(sql, params);
}

function asText(payload: unknown) {
    return { content: [{ type: "text" as const, text: JSON.stringify(payload, null, 2) }] };
}

// 1) Flexible, multi-purpose flight search.
server.tool(
    "search_flights",
    "Search flights with flexible filters: origin/destination airports, a single date or a date range, price bounds, airline, cabin class, status, seat availability, departure/arrival time windows and max duration. Sortable by price, departure, arrival, duration or seats.",
    {
        origin: z.string().length(3).optional().describe("Origin airport IATA code, e.g. FLN"),
        destination: z.string().length(3).optional().describe("Destination airport IATA code, e.g. CGH"),
        date: z.string().optional().describe("Exact departure date, format YYYY-MM-DD"),
        date_from: z.string().optional().describe("Range start departure date, YYYY-MM-DD"),
        date_to: z.string().optional().describe("Range end departure date, YYYY-MM-DD"),
        max_price: z.number().optional().describe("Maximum price (upper limit)"),
        min_price: z.number().optional().describe("Minimum price"),
        airline: z.string().optional().describe("Airline name or IATA code, e.g. GOL or G3"),
        cabin_class: z.string().optional().describe("Cabin class, e.g. Economy or Business"),
        status: z.string().optional().describe("Flight status: Scheduled, Delayed or Cancelled"),
        only_available: z.boolean().optional().describe("If true, only flights with seats left and not cancelled"),
        min_seats: z.number().optional().describe("Minimum number of available seats"),
        depart_after: z.string().optional().describe("Earliest departure time, HH:MM"),
        depart_before: z.string().optional().describe("Latest departure time, HH:MM"),
        arrive_after: z.string().optional().describe("Earliest arrival time, HH:MM"),
        arrive_before: z.string().optional().describe("Latest arrival time, HH:MM"),
        max_duration: z.number().optional().describe("Maximum flight duration in minutes"),
        order_by: z.enum(["price", "departure", "arrival", "duration", "seats"]).optional().describe("Sort field (default price)"),
        order_dir: z.enum(["asc", "desc"]).optional().describe("Sort direction (default asc)"),
        limit: z.number().optional().describe("Max rows to return (1-100, default 20)")
    },
    async (args) => {
        const flights = await queryFlights(args);
        console.log("search_flights", new Date(), args);
        return asText({ count: flights.length, flights });
    }
);

// 2) Single cheapest available flight for a route/date.
server.tool(
    "find_cheapest_flight",
    "Find the single cheapest available flight for a given origin, destination and (optionally) date. Useful when the user just wants the best price.",
    {
        origin: z.string().length(3).describe("Origin airport IATA code"),
        destination: z.string().length(3).describe("Destination airport IATA code"),
        date: z.string().optional().describe("Departure date, YYYY-MM-DD (optional)")
    },
    async ({ origin, destination, date }) => {
        const flights = await queryFlights({ origin, destination, date, only_available: true, order_by: "price", order_dir: "asc", limit: 1 });
        console.log("find_cheapest_flight", new Date(), { origin, destination, date });
        return asText(flights[0] ?? { message: "No available flight found for these criteria." });
    }
);

// 3) Cheapest round trip honoring time constraints on each leg.
server.tool(
    "plan_round_trip",
    "Plan the cheapest round trip between two airports. Picks the cheapest available outbound and the cheapest available return that satisfy optional time constraints (e.g. arrive before a meeting on the way out, depart after / arrive before a deadline on the way back) and returns the total price.",
    {
        origin: z.string().length(3).describe("Home/origin airport IATA code, e.g. FLN"),
        destination: z.string().length(3).describe("Destination airport IATA code, e.g. CGH"),
        outbound_date: z.string().describe("Outbound departure date, YYYY-MM-DD"),
        return_date: z.string().describe("Return departure date, YYYY-MM-DD"),
        outbound_arrive_before: z.string().optional().describe("Latest acceptable arrival time at destination, HH:MM (e.g. to make a meeting)"),
        outbound_depart_after: z.string().optional().describe("Earliest outbound departure time, HH:MM"),
        return_depart_after: z.string().optional().describe("Earliest return departure time, HH:MM"),
        return_arrive_before: z.string().optional().describe("Latest acceptable arrival time back home, HH:MM (e.g. to make dinner)")
    },
    async (args) => {
        const outbound = await queryFlights({
            origin: args.origin,
            destination: args.destination,
            date: args.outbound_date,
            arrive_before: args.outbound_arrive_before,
            depart_after: args.outbound_depart_after,
            only_available: true,
            order_by: "price",
            order_dir: "asc",
            limit: 1
        });
        const inbound = await queryFlights({
            origin: args.destination,
            destination: args.origin,
            date: args.return_date,
            arrive_before: args.return_arrive_before,
            depart_after: args.return_depart_after,
            only_available: true,
            order_by: "price",
            order_dir: "asc",
            limit: 1
        });
        console.log("plan_round_trip", new Date(), args);
        const out = outbound[0] ?? null;
        const back = inbound[0] ?? null;
        const total = out && back ? Number(out.price) + Number(back.price) : null;
        return asText({
            outbound: out,
            return: back,
            total_price: total,
            currency: out?.currency ?? "BRL",
            complete: Boolean(out && back)
        });
    }
);

// 4) List available airports with flight counts.
server.tool(
    "list_airports",
    "List all airports present in the database with how many flights depart from and arrive at each.",
    {},
    async () => {
        const airports = await connection.any(`
            SELECT airport,
                   SUM(departures) AS departures,
                   SUM(arrivals) AS arrivals
            FROM (
                SELECT origin_airport AS airport, 1 AS departures, 0 AS arrivals FROM flight
                UNION ALL
                SELECT destination_airport AS airport, 0 AS departures, 1 AS arrivals FROM flight
            ) t
            GROUP BY airport
            ORDER BY airport
        `);
        console.log("list_airports", new Date());
        return asText(airports);
    }
);

// 5) List airlines.
server.tool(
    "list_airlines",
    "List all airlines (id, IATA code and name) available in the database.",
    {},
    async () => {
        const airlines = await connection.any("SELECT id, iata_code, name FROM airline ORDER BY name");
        console.log("list_airlines", new Date());
        return asText(airlines);
    }
);

const app = express();
app.use(express.json());

app.post("/mcp", async (req, res) => {
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
    res.on("close", () => transport.close());
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
});

app.listen(3001);
