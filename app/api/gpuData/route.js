export async function GET() {
    const fetchWithTimeout = async (url, timeout = 5000) => {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeout);
        try {
            const response = await fetch(url, { signal: controller.signal });
            clearTimeout(timer);
            if (!response.ok) {
                throw new Error(`Error fetching ${url}: ${response.statusText}`);
            }
            return response;
        } catch (error) {
            clearTimeout(timer);
            throw new Error(`Timeout or fetch error for ${url}: ${error.message}`);
        }
    };

    try {
        // Fetch Salad and Vast API data in parallel
        const [saladRes, vastRes] = await Promise.all([
            fetchWithTimeout("https://app-api.salad.com/api/v2/demand-monitor/gpu"),
            fetchWithTimeout("https://500.farm/vastai-exporter/gpu-stats"),
        ]);

        // Parse JSON responses
        const saladData = await saladRes.json();
        const vastData = await vastRes.json();

        // Normalize and process data
        function normalizeGpuNameForProcessing(name) {
            let normalized = name.replace(/nvidia|geforce/gi, "").trim();
            normalized = normalized.replace(/\(.*?\)/g, "").trim();
            if (/super/i.test(normalized)) {
                normalized = normalized.replace(/super/i, "").trim();
                normalized = normalized.replace(/(\d+)/, "$1S");
            }
            return normalized.trim();
        }

        function normalizeGpuNameForUI(name) {
            return name.replace(/nvidia|geforce/gi, "").trim();
        }

        const normalizedSaladData = saladData.map((gpu) => ({
            name: gpu.name,
            displayName: normalizeGpuNameForUI(gpu.name),
            normalizedName: normalizeGpuNameForProcessing(gpu.name),
            recommendedSpecs: { ramGb: gpu.recommendedSpecs?.ramGb || null },
            saladEarningRates: {
                avgEarning: gpu.earningRates.avgEarning || null,
                avgEarningTimeMinutes: gpu.earningRates.avgEarningTimeMinutes || null,
                maxEarningRate: gpu.earningRates.maxEarningRate || null,
                minEarningRate: gpu.earningRates.minEarningRate || null,
            },
            utilizationPct: gpu.utilizationPct || null,
        }));

        const normalizedVastData = vastData.models.map((model) => ({
            name: model.name,
            normalizedName: normalizeGpuNameForProcessing(model.name),
            vastEarningRates: {
                verified: {
                    price10th: model.stats.rented.verified[0]?.price_10th_percentile || null,
                    price90th: model.stats.rented.verified[0]?.price_90th_percentile || null,
                    count: model.stats.rented.verified[0]?.count || null,
                },
                unverified: {
                    price10th: model.stats.rented.unverified[0]?.price_10th_percentile || null,
                    price90th: model.stats.rented.unverified[0]?.price_90th_percentile || null,
                    count: model.stats.rented.unverified[0]?.count || null,
                },
            },
        }));

        const mergedData = normalizedSaladData.map((saladGpu) => {
            const vastGpu = normalizedVastData.find(
                (vastGpu) => vastGpu.normalizedName === saladGpu.normalizedName
            );

            return {
                name: saladGpu.name,
                displayName: saladGpu.displayName,
                recommendedSpecs: saladGpu.recommendedSpecs,
                saladEarningRates: saladGpu.saladEarningRates,
                utilizationPct: saladGpu.utilizationPct,
                vastEarningRates: vastGpu ? vastGpu.vastEarningRates : { verified: null, unverified: null },
            };
        });

        return new Response(JSON.stringify(mergedData), { status: 200 });
    } catch (error) {
        console.error("Error fetching GPU data:", error);
        return new Response("Failed to fetch GPU data", { status: 500 });
    }
}
