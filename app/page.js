'use client'

import { useState, useEffect } from 'react'
import { ChevronUpIcon, ChevronDownIcon } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export default function SaladNetworkMonitor() {
  const [gpuData, setGpuData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sortColumn, setSortColumn] = useState('name')
  const [sortDirection, setSortDirection] = useState('desc')

  useEffect(() => {
    async function fetchGPUData() {
      try {
        const res = await fetch('/api/gpuData');
  
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Failed to fetch data: ${errorText}`);
        }
  
        const data = await res.json();
  
        const sortedData = data.sort((a, b) => b.name.localeCompare(a.name));
        setGpuData(sortedData);
        setIsLoading(false);
      } catch (error) {
        console.error(error);
        setError(`Failed to fetch GPU data: ${error.message}`);
        setIsLoading(false);
      }
    }
  
    fetchGPUData();
  }, []);  

  const getDemandBadge = (utilizationPct) => {
    if (utilizationPct >= 80) return { text: 'High', className: 'bg-[#c3e325]' }
    if (utilizationPct >= 50) return { text: 'Moderate', className: 'bg-[#e8ff47]' }
    return { text: 'Low', className: 'bg-[#6b7280]' }
  }

  const sortData = (column) => {
    const direction = column === sortColumn && sortDirection === 'desc' ? 'asc' : 'desc';
    setSortColumn(column);
    setSortDirection(direction);

    const sortedData = [...gpuData].sort((a, b) => {
      let aValue, bValue;

      switch (column) {
        case 'name':
          return direction === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
        case 'recommendedSpecs':
          aValue = a.recommendedSpecs.ramGb;
          bValue = b.recommendedSpecs.ramGb;
          break;
        case 'demand':
          aValue = a.utilizationPct;
          bValue = b.utilizationPct;
          break;
        case 'avgEarnings':
          aValue = a.saladEarningRates.avgEarning;
          bValue = b.saladEarningRates.avgEarning;
          break;
        case 'avgRunningTime':
          aValue = a.saladEarningRates.avgEarningTimeMinutes;
          bValue = b.saladEarningRates.avgEarningTimeMinutes;
          break;
        case 'hourlyEarnings':
          aValue = a.saladEarningRates.minEarningRate;
          bValue = b.saladEarningRates.minEarningRate;
          break;
        case 'vastVerified':
          aValue = a.vastEarningRates.verified ? a.vastEarningRates.verified.price10th : 0;
          bValue = b.vastEarningRates.verified ? b.vastEarningRates.verified.price10th : 0;
          break;
        case 'vastUnverified':
          aValue = a.vastEarningRates.unverified ? a.vastEarningRates.unverified.price10th : 0;
          bValue = b.vastEarningRates.unverified ? b.vastEarningRates.unverified.price10th : 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    setGpuData(sortedData);
  }

  const SortIcon = ({ column }) => {
    if (sortColumn !== column) return null;
    return (
      <div className="absolute top-1/2 transform -translate-y-1/2">
        {sortDirection === 'asc' ? (
          <ChevronUpIcon className="inline w-4 h-4" />
        ) : (
          <ChevronDownIcon className="inline w-4 h-4" />
        )}
      </div>
    );
  };
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen bg-[#0a192f] text-[#c3e325] text-4xl font-bold">Loading...</div>
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500 text-xl">{error}</div>
  }

  return (
<div className="min-h-screen bg-[#0a192f] p-4 text-[#c3e325] font-sans">
  <div className="max-w-screen-2xl mx-auto">
    <h1 className="text-3xl font-bold mb-2 text-center">Salad Network Monitor (API currently providing simulated data)</h1>
<p className="text-[#8b9cb3] text-sm text-center mb-2">
  This platform compares GPU earnings using data from Salad and vast.ai.
   The data provides an idea of typical earnings, but keep in mind that unusually high hourly rates might be due to outliers,
    which can distort the overall averages.
</p>
<p className="text-[#c3e325] text-sm text-center mb-2">
  Hover over the category names to learn more about what they mean.
</p>
      <div className="overflow-x-auto mt-8">
        <div className="w-full">
          <table className="w-full border-collapse bg-[#112240] rounded-lg shadow-lg text-sm">
            <thead>
              <tr className="bg-[#c3e325] text-[#0a192f]">
                <TooltipProvider>
                  <th className="p-2 text-center cursor-pointer hover:bg-[#e8ff47]" onClick={() => sortData('name')}>
                    <Tooltip>
                      <TooltipTrigger className="w-full h-full">
                        <div className="flex items-center justify-center gap-1">
                          <span className="truncate">GPU</span>
                          <span className="w-6 h-6 relative flex justify-center items-center">
                            <SortIcon column="name" />
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="text-xs p-2 bg-[#1a2a3c] text-white rounded">
                        <p>Name of the GPU</p>
                      </TooltipContent>
                    </Tooltip>
                  </th>
                  <th className="p-2 text-center cursor-pointer hover:bg-[#e8ff47]" onClick={() => sortData('recommendedSpecs')}>
                    <Tooltip>
                      <TooltipTrigger className="w-full h-full">
                        <div className="flex items-center justify-center gap-1">
                          <span className="truncate">Specs</span>
                          <span className="w-6 h-6 relative flex justify-center items-center">
                            <SortIcon column="recommendedSpecs" />
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="text-xs p-2 bg-[#1a2a3c] text-white rounded">
                        <p>Recommended system specifications for the GPU</p>
                      </TooltipContent>
                    </Tooltip>
                  </th>
                  <th className="p-2 text-center cursor-pointer hover:bg-[#e8ff47]" onClick={() => sortData('demand')}>
                    <Tooltip>
                      <TooltipTrigger className="w-full h-full">
                        <div className="flex items-center justify-center gap-1">
                          <span className="truncate">Demand</span>
                          <span className="w-6 h-6 relative flex justify-center items-center">
                            <SortIcon column="demand" />
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="text-xs p-2 bg-[#1a2a3c] text-white rounded">
                        <p>Percentage of GPUs rented on the Salad network</p>
                      </TooltipContent>
                    </Tooltip>
                  </th>
                  <th className="p-2 text-center cursor-pointer hover:bg-[#e8ff47]" onClick={() => sortData('avgRunningTime')}>
                    <Tooltip>
                      <TooltipTrigger className="w-full h-full">
                        <div className="flex items-center justify-center gap-1">
                          <span className="truncate">Avg R Time</span>
                          <span className="w-6 h-6 relative flex justify-center items-center">
                            <SortIcon column="avgRunningTime" />
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="text-xs p-2 bg-[#1a2a3c] text-white rounded">
                        <p>Average running time of the GPU on the network</p>
                      </TooltipContent>
                    </Tooltip>
                  </th>
                  <th className="p-2 text-center cursor-pointer hover:bg-[#e8ff47]" onClick={() => sortData('avgEarnings')}>
                    <Tooltip>
                      <TooltipTrigger className="w-full h-full">
                        <div className="flex items-center justify-center gap-1">
                          <span className="truncate">Avg 24h</span>
                          <span className="w-6 h-6 relative flex justify-center items-center">
                            <SortIcon column="avgEarnings" />
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="text-xs p-2 bg-[#1a2a3c] text-white rounded">
                        <p>Average earnings in the last 24 hours</p>
                      </TooltipContent>
                    </Tooltip>
                  </th>
                  <th className="p-2 text-center cursor-pointer hover:bg-[#e8ff47]" onClick={() => sortData('hourlyEarnings')}>
                    <Tooltip>
                      <TooltipTrigger className="w-full h-full">
                        <div className="flex items-center justify-center gap-1">
                          <span className="truncate">Hourly</span>
                          <span className="w-6 h-6 relative flex justify-center items-center">
                            <SortIcon column="hourlyEarnings" />
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="text-xs p-2 bg-[#1a2a3c] text-white rounded">
                        <p>Hourly earnings rate (min - max)</p>
                      </TooltipContent>
                    </Tooltip>
                  </th>
                  <th className="p-2 text-center cursor-pointer hover:bg-[#e8ff47]" onClick={() => sortData('vastUnverified')}>
                    <Tooltip>
                      <TooltipTrigger className="w-full h-full">
                        <div className="flex items-center justify-center gap-1">
                          <span className="truncate">Vast Unverified</span>
                          <span className="w-6 h-6 relative flex justify-center items-center">
                            <SortIcon column="vastUnverified" />
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="text-xs p-2 bg-[#1a2a3c] text-white rounded">
                        <p>Hourly rate for unverified machines on Vast.ai</p>
                      </TooltipContent>
                    </Tooltip>
                  </th>
                  <th className="p-2 text-center cursor-pointer hover:bg-[#e8ff47]" onClick={() => sortData('vastVerified')}>
                    <Tooltip>
                      <TooltipTrigger className="w-full h-full">
                        <div className="flex items-center justify-center gap-1">
                          <span className="truncate">Vast Verified</span>
                          <span className="w-6 h-6 relative flex justify-center items-center">
                            <SortIcon column="vastVerified" />
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="text-xs p-2 bg-[#1a2a3c] text-white rounded">
                        <p>Hourly rate for verified machines on Vast.ai</p>
                      </TooltipContent>
                    </Tooltip>
                  </th>
                </TooltipProvider>
              </tr>
            </thead>
            <tbody>
              {gpuData.map((gpu, index) => {
                const demand = getDemandBadge(gpu.utilizationPct);
                const hourlyRate = {
                  min: gpu.saladEarningRates.minEarningRate.toFixed(3),
                  max: gpu.saladEarningRates.maxEarningRate.toFixed(3),
                };

                const vastVerified = gpu.vastEarningRates.verified && gpu.vastEarningRates.verified.price10th !== null && gpu.vastEarningRates.verified.price10th !== undefined
                  ? `$${gpu.vastEarningRates.verified.price10th.toFixed(2)} - $${gpu.vastEarningRates.verified.price90th.toFixed(2)}`
                  : 'N/A';

                const vastUnverified = gpu.vastEarningRates.unverified && gpu.vastEarningRates.unverified.price10th !== null && gpu.vastEarningRates.unverified.price10th !== undefined
                  ? `$${gpu.vastEarningRates.unverified.price10th.toFixed(2)} - $${gpu.vastEarningRates.unverified.price90th.toFixed(2)}`
                  : 'N/A';

                const vastUnverifiedCount = gpu.vastEarningRates.unverified?.count || 0;
                const vastVerifiedCount = gpu.vastEarningRates.verified?.count || 0;

                return (
                  <tr
                    key={index}
                    className={`${index % 2 === 0 ? 'bg-[#1e2a47]' : 'bg-[#112240]'} hover:bg-[#2c3e54] transition-all duration-300`}
                  >
                    <td className="p-4 text-left">
                      <div className="font-bold">{gpu.displayName}</div>
                    </td>
                    <td className="p-4 text-center text-white">
                      {gpu.recommendedSpecs.ramGb}GB RAM
                      <br />
                      <span className="text-xs text-[#8b9cb3]">120 GB Storage</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-black text-xs ${demand.className}`}>
                        {demand.text}
                      </span>
                      <div className="text-xs mt-1 text-[#8b9cb3]">
                        {gpu.utilizationPct}%
                      </div>
                    </td>
                    <td className="p-4 text-center text-white">
                      {(gpu.saladEarningRates.avgEarningTimeMinutes / 60).toFixed(1)}h
                    </td>
                    <td className="p-4 text-center text-white">
                      ${gpu.saladEarningRates.avgEarning.toFixed(2)}
                    </td>
                    <td className="p-4 text-center text-white">
                      ${hourlyRate.min} - ${hourlyRate.max}
                    </td>
                    <td className="p-4 text-center text-white">
                      {vastUnverified}
                      <br />
                      <span className="text-xs text-[#8b9cb3]">Machines: {vastUnverifiedCount}</span>
                    </td>
                    <td className="p-4 text-center text-white">
                      {vastVerified}
                      <br />
                      <span className="text-xs text-[#8b9cb3]">Machines: {vastVerifiedCount}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      </div>
      <footer className="text-center text-xs text-[#8b9cb3] mt-4 bg-[#112240] p-4 rounded-lg shadow-lg max-w-4xl mx-auto">
        <div className="mb-2">
          <strong className="font-bold text-[#c3e325]">Disclaimer:</strong>  
          <span className="block mt-1">
            This website is not affiliated with or owned by Salad Technologies or Vast.ai / 500.Farm. It uses data provided through the official Salad API and 500.Farm for informational purposes only.
          </span>
        </div>
        <div className="mb-2">
          <strong className="text-[#c3e325]">Made By:</strong> 
          <span> Pixel Sized Tech</span>.  
        </div>
        <div className="flex justify-center gap-4 text-[#8b9cb3]">
          <a
            href="https://www.youtube.com/@PixelSizedTech"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#c3e325] transition-colors duration-300"
          >
            YouTube
          </a>
          <a
            href="https://www.tiktok.com/@pixel_sized_tech"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#c3e325] transition-colors duration-300"
          >
            TikTok
          </a>
          <a
            href="https://bit.ly/Salad-PIXEL"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#c3e325] transition-colors duration-300"
          >
            Salad Referral
          </a>
        </div>
      </footer>
    </div>
  )
}

