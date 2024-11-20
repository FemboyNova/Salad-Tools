// app/api/gpuDemand/route.js
export async function GET() {
    try {
      const res = await fetch("https://app-api.salad.com/api/v2/demand-monitor/gpu");
      const gpuData = await res.json();
  
      if (!res.ok) {
        return new Response("Failed to fetch GPU data", { status: 500 });
      }
  
      return new Response(JSON.stringify(gpuData), { status: 200 });
    } catch (error) {
      return new Response("Failed to fetch GPU data", { status: 500 });
    }
  }
  