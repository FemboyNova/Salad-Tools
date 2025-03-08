export async function GET() {
    const fetchWithTimeout = async (url, timeout = 5000) => {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeout);
        try {
            const response = await fetch(url, { signal: controller.signal });
            clearTimeout(timer);
            if (!response.ok) {
                throw new Error(`HTTP error ${response.status} - ${response.statusText} while fetching ${url}`);
            }
            return response;
        } catch (error) {
            clearTimeout(timer);
            throw new Error(`Request failed for ${url}: ${error.message}`);
        }
    };

    try {
        const [saladRes, vastRes] = await Promise.all([
            fetchWithTimeout("https://app-api.salad.com/api/v2/demand-monitor/gpu"),
            fetchWithTimeout("https://500.farm/vastai-exporter/gpu-stats"),
        ]);

        let saladData, vastData;
        try {
            saladData = await saladRes.json();
        } catch (error) {
            throw new Error("Failed to parse JSON from Salad API: " + error.message);
        }
        try {
            vastData = await vastRes.json();
        } catch (error) {
            throw new Error("Failed to parse JSON from Vast API: " + error.message);
        }

        if (!Array.isArray(saladData)) {
            throw new Error("Unexpected Salad API response format: Expected an array");
        }
        if (!vastData.models || !Array.isArray(vastData.models)) {
            throw new Error("Unexpected Vast API response format: Expected an object with a 'models' array");
        }

        function normalizeGpuNameForProcessing(name) {
            let normalized = name.replace(/nvidia|geforce/gi, "").trim();
            normalized = normalized.replace(/\(.*?\)/g, "").trim();
            if (/super/i.test(normalized)) {
                normalized = normalized.replace(/super/i, "").trim();
                normalized = normalized.replace(/(\d+)/, "$1S");
            }
            return normalized.trim();
        }

        const normalizedSaladData = saladData.map((gpu) => ({
            name: gpu.name || "Unknown GPU",
            displayName: gpu.displayName || "Unknown GPU",
            normalizedName: normalizeGpuNameForProcessing(gpu.name || "Unknown"),
            demandTier: gpu.demandTier || "unknown",
            demandTierName: gpu.demandTierName || "Unknown",
            recommendedSpecs: { ramGb: gpu.recommendedSpecs?.ramGb || 0 },
            saladEarningRates: {
                avgEarning: gpu.earningRates?.avgEarningRate ?? 0,
                maxEarningRate: gpu.earningRates?.maxEarningRate ?? 0,
                minEarningRate: gpu.earningRates?.minEarningRate ?? 0,
                top25PctEarningRate: gpu.earningRates?.top25PctEarningRate ?? 0,
            },
            utilizationPct: gpu.utilizationPct ?? 0,
        }));

        const normalizedVastData = vastData.models.map((model) => ({
            name: model.name || "Unknown GPU",
            normalizedName: normalizeGpuNameForProcessing(model.name || "Unknown"),
            vastEarningRates: {
                verified: {
                    price10th: model.stats.rented.verified?.[0]?.price_10th_percentile || null,
                    price90th: model.stats.rented.verified?.[0]?.price_90th_percentile || null,
                    count: model.stats.rented.verified?.[0]?.count || null,
                },
                unverified: {
                    price10th: model.stats.rented.unverified?.[0]?.price_10th_percentile || null,
                    price90th: model.stats.rented.unverified?.[0]?.price_90th_percentile || null,
                    count: model.stats.rented.unverified?.[0]?.count || null,
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
        console.error("Critical error fetching GPU data:", error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
}
