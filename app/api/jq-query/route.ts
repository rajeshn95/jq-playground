import * as jq from "jq-wasm";

type JqResult = object | object[] | null;

export async function POST(req: Request) {
  const body = await req.json();
  const { data, query } = body;
  console.log("Request--->", query, data);

  if (!jq) {
    console.error("jq is not initialized");
    return new Response(JSON.stringify({ error: "jq is not initialized" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Using jq.json for parsed JSON output
  const result: JqResult = await jq.json(JSON.parse(data), query, ["-c"]);
  console.log("Result--->", result); // Output: ["bar"]

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
