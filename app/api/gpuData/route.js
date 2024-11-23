export async function GET() {
    try {
        // Fetch data from the Salad and Vast APIs
        const saladRes = await fetch("https://app-api.salad.com/api/v2/demand-monitor/gpu");
        const vastRes = await fetch("https://500.farm/vastai-exporter/gpu-stats");

        if (!saladRes.ok || !vastRes.ok) {
            throw new Error("Failed to fetch data from one or both APIs");
        }

        const saladData = await saladRes.json();
        const vastData = await vastRes.json();

        // Function to normalize GPU names for processing (used for matching data)
        function normalizeGpuNameForProcessing(name) {
            // Remove "NVIDIA" or "GeForce"
            let normalized = name.replace(/nvidia|geforce/gi, "").trim();

            // Remove anything in parentheses (e.g., "12GB VRAM")
            normalized = normalized.replace(/\(.*?\)/g, "").trim();

            // Replace "Super" with "S"
            if (/super/i.test(normalized)) {
                normalized = normalized.replace(/super/i, "").trim(); // Remove "Super" first
                normalized = normalized.replace(/(\d+)/, "$1S"); // Add "S" after the number
            }

            return normalized.trim(); // Trim any extra spaces after modifications
        }

        // Function to normalize GPU name for UI display
        function normalizeGpuNameForUI(name) {
            // Format for UI (e.g., "RTX 4070 TI Super" instead of "RTX 4070 Ti S")
            let displayName = name.replace(/nvidia|geforce/gi, "").trim();
            return displayName;
        }

        // Normalize Salad data to include utilizationPct, recommendedSpecs, and normalized names
        const normalizedSaladData = saladData.map((gpu) => ({
            name: gpu.name,
            displayName: normalizeGpuNameForUI(gpu.name), // Add display name for UI
            normalizedName: normalizeGpuNameForProcessing(gpu.name), // For processing (matching)
            recommendedSpecs: { ramGb: gpu.recommendedSpecs?.ramGb || null }, // Default 16GB RAM if missing
            saladEarningRates: {
                avgEarning: gpu.earningRates.avgEarning || null,
                avgEarningTimeMinutes: gpu.earningRates.avgEarningTimeMinutes || null,
                maxEarningRate: gpu.earningRates.maxEarningRate || null,
                minEarningRate: gpu.earningRates.minEarningRate || null,
            },
            utilizationPct: gpu.utilizationPct || null, // Include utilizationPct from Salad
        }));

        // Normalize Vast data
        const normalizedVastData = vastData.models.map((model) => ({
            name: model.name,
            normalizedName: normalizeGpuNameForProcessing(model.name), // For processing (matching)
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

        // Merge Salad and Vast data by normalized GPU name
        const mergedData = normalizedSaladData.map((saladGpu) => {
            const vastGpu = normalizedVastData.find(
                (vastGpu) => vastGpu.normalizedName === saladGpu.normalizedName
            );

            return {
                name: saladGpu.name, // Original name
                displayName: saladGpu.displayName, // For UI display
                recommendedSpecs: saladGpu.recommendedSpecs,
                saladEarningRates: saladGpu.saladEarningRates,
                utilizationPct: saladGpu.utilizationPct,
                vastEarningRates: vastGpu ? vastGpu.vastEarningRates : { verified: null, unverified: null },
            };
        });

        // Respond with the merged data
        return new Response(JSON.stringify(mergedData), { status: 200 });
    } catch (error) {
        console.error("Error fetching GPU data:", error);
        return new Response("Failed to fetch GPU data", { status: 500 });
    }
}
