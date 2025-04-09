import jmespath from "jmespath";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { data, query } = body;
    console.log("Request--->", query, data);

    const result: any = jmespath.search(JSON.parse(data), query);
    console.log("Result--->", result); // Output: ["bar"]

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify(error), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
