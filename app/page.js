'use client'

import { useState, useEffect } from 'react'
import { ChevronUpIcon, ChevronDownIcon } from 'lucide-react'

export default function SaladNetworkMonitor() {
  const [gpuData, setGpuData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sortColumn, setSortColumn] = useState('name')
  const [sortDirection, setSortDirection] = useState('desc')

  useEffect(() => {
    async function fetchGPUData() {
      try {
        const res = await fetch('/api/gpuDemand');
        const data = await res.json();
        const sortedData = data.sort((a, b) => b.name.localeCompare(a.name));
        setGpuData(sortedData);
        setIsLoading(false);
      } catch (error) {
        setError('Failed to fetch GPU data');
        setIsLoading(false);
      }
    }

    fetchGPUData();
  }, [])

  const getDemandBadge = (utilizationPct) => {
    if (utilizationPct >= 70) return { text: 'High', className: 'bg-[#c3e325]' }
    if (utilizationPct >= 40) return { text: 'Moderate', className: 'bg-[#e8ff47]' }
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
          aValue = a.earningRates.avgEarning;
          bValue = b.earningRates.avgEarning;
          break;
        case 'avgRunningTime':
          aValue = a.earningRates.avgEarningTimeMinutes;
          bValue = b.earningRates.avgEarningTimeMinutes;
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
    return sortDirection === 'asc' ? <ChevronUpIcon className="inline w-4 h-4" /> : <ChevronDownIcon className="inline w-4 h-4" />;
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen bg-[#0a192f] text-[#c3e325] text-4xl font-bold">Loading...</div>
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500 text-xl">{error}</div>
  }

  return (
    <div className="min-h-screen bg-[#0a192f] p-8 text-[#c3e325] font-sans">
        <h1 className="text-4xl font-bold mb-4 text-center">Salad Network Monitor (API is currently providing fake data)</h1>
      <p className="text-[#8b9cb3] text-lg text-center">
        This grabs data through an official API to show demand and earnings data on the Salad network.
      </p>
      <p className="mb-8 text-[#8b9cb3] text-lg text-center">
        More tools to be added to this website in the future.
      </p>

      <div className="overflow-x-auto flex justify-center">
  <table className="w-full max-w-6xl border-collapse bg-[#112240] rounded-lg shadow-lg">
    <thead>
      <tr className="bg-[#c3e325] text-[#0a192f]">
        <th className="p-4 text-left cursor-pointer hover:bg-[#e8ff47]" onClick={() => sortData('name')}>
          GPU <SortIcon column="name" />
        </th>
        <th className="p-4 text-left cursor-pointer hover:bg-[#e8ff47]" onClick={() => sortData('recommendedSpecs')}>
          Recommended Specs <SortIcon column="recommendedSpecs" />
        </th>
        <th className="p-4 text-left cursor-pointer hover:bg-[#e8ff47]" onClick={() => sortData('demand')}>
          Demand <SortIcon column="demand" />
        </th>
        <th className="p-4 text-left cursor-pointer hover:bg-[#e8ff47]" onClick={() => sortData('avgEarnings')}>
          Average Earnings 24/h <SortIcon column="avgEarnings" />
        </th>
        <th className="p-4 text-left cursor-pointer hover:bg-[#e8ff47]" onClick={() => sortData('avgRunningTime')}>
          Average Running Time 24/h <SortIcon column="avgRunningTime" />
        </th>
      </tr>
    </thead>
    <tbody>
      {gpuData.map((gpu, index) => {
        const demand = getDemandBadge(gpu.utilizationPct)
        const hourlyRate = {
          min: (gpu.earningRates.minEarningRate).toFixed(3),
          max: (gpu.earningRates.maxEarningRate).toFixed(3)
        }

        return (
          <tr key={index} className={`${index % 2 === 0 ? 'bg-[#1e2a47]' : 'bg-[#112240]'} hover:bg-[#2c3e54] transition-all duration-300`}>
            <td className="p-4">
              <div className="font-bold">{gpu.name}</div>
              <div className="text-sm text-[#8b9cb3]">
                HOURLY RATE
                <br />
                ${hourlyRate.min} - ${hourlyRate.max}
              </div>
            </td>
            <td className="p-4 text-white">
              {gpu.recommendedSpecs.ramGb}GB System RAM
            </td>
            <td className="p-4">
              <span className={`px-4 py-1 rounded-full text-black ${demand.className}`}>
                {demand.text}
              </span>
            </td>
            <td className="p-4 text-white">
              ${gpu.earningRates.avgEarning.toFixed(2)}
            </td>
            <td className="p-4 text-white">
              {(gpu.earningRates.avgEarningTimeMinutes / 60).toFixed(1)} hours
            </td>
          </tr>
        )
      })}
    </tbody>
  </table>
</div>

      {/* Disclaimer at the bottom */}
      <footer className="text-center text-sm text-[#8b9cb3] mt-8">
        <strong className="font-bold">Disclaimer:</strong> This website is not affiliated with or owned by Salad Technologies. It uses data provided through the official Salad API for informational purposes only.
      </footer>
    </div>
  )
}
