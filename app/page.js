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
        const res = await fetch('/api/gpuData')

        if (!res.ok) {
          const errorText = await res.text() // Get the error response text
          throw new Error(`Failed to fetch data: ${errorText}`)
        }

        const data = await res.json()

        const sortedData = data.sort((a, b) => b.name.localeCompare(a.name))
        setGpuData(sortedData)
        setIsLoading(false)
      } catch (error) {
        console.error(error)  // Log the full error to the console for debugging
        setError(`Failed to fetch GPU data: ${error.message}`) // Provide the specific error message
        setIsLoading(false)
      }
    }

    fetchGPUData()
  }, [])

  const getDemandBadge = (utilizationPct) => {
    if (utilizationPct >= 80) return { text: 'High', className: 'bg-[#c3e325]' }
    if (utilizationPct >= 50) return { text: 'Moderate', className: 'bg-[#e8ff47]' }
    return { text: 'Low', className: 'bg-[#6b7280]' }
  }

  const sortData = (column) => {
    const direction = column === sortColumn && sortDirection === 'desc' ? 'asc' : 'desc'
    setSortColumn(column)
    setSortDirection(direction)

    const sortedData = [...gpuData].sort((a, b) => {
      let aValue, bValue

      switch (column) {
        case 'name':
          return direction === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
        case 'recommendedSpecs':
          aValue = a.recommendedSpecs.ramGb
          bValue = b.recommendedSpecs.ramGb
          break
        case 'demand':
          aValue = a.utilizationPct
          bValue = b.utilizationPct
          break
        case 'avgEarnings':
          aValue = a.saladEarningRates.avgEarning
          bValue = b.saladEarningRates.avgEarning
          break
        case 'avgRunningTime':
          aValue = a.saladEarningRates.avgEarningTimeMinutes
          bValue = b.saladEarningRates.avgEarningTimeMinutes
          break
        case 'hourlyEarnings':
          aValue = a.saladEarningRates.minEarningRate
          bValue = b.saladEarningRates.minEarningRate
          break
        case 'vastVerified':
          aValue = a.vastEarningRates.verified ? a.vastEarningRates.verified.price10th : 0
          bValue = b.vastEarningRates.verified ? b.vastEarningRates.verified.price10th : 0
          break
        case 'vastUnverified':
          aValue = a.vastEarningRates.unverified ? a.vastEarningRates.unverified.price10th : 0
          bValue = b.vastEarningRates.unverified ? b.vastEarningRates.unverified.price10th : 0
          break

        default:
          return 0
      }

      if (aValue < bValue) return direction === 'asc' ? -1 : 1
      if (aValue > bValue) return direction === 'asc' ? 1 : -1
      return 0
    })

    setGpuData(sortedData)
  }

  const SortIcon = ({ column }) => {
    if (sortColumn !== column) return null
    return (
      <div className="absolute top-1/2 transform -translate-y-1/2">
        {sortDirection === 'asc' ? (
          <ChevronUpIcon className="inline w-4 h-4" />
        ) : (
          <ChevronDownIcon className="inline w-4 h-4" />
        )}
      </div>
    )
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen bg-[#0a192f] text-[#c3e325] text-4xl font-bold">Loading...</div>
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500 text-xl">{error}</div>
  }

  return (
    <div className="min-h-screen bg-[#0a192f] p-8 text-[#c3e325] font-sans">
      <h1 className="text-4xl font-bold mb-4 text-center">Salad Network Monitor (Salad API currently providing simulated data)</h1>
      <p className="text-[#8b9cb3] text-lg text-center">
        This platform collects data from the Salad API and 500.farm (for vast.ai earnings) to compare GPU earnings across both networks. 
        While the data provides insights into typical earnings, note that higher hourly rates may sometimes be influenced by outliers, 
        which can skew the values significantly compared to the actual consistent earnings.
      </p>
      <p className="mb-8 text-[#8b9cb3] text-lg text-center">
        Additional tools and features will be introduced in future updates.
      </p>

      <div className="overflow-x-auto flex justify-center">
        <table className="w-full max-w-8xl border-collapse bg-[#112240] rounded-lg shadow-lg">
          <thead>
            <tr className="bg-[#c3e325] text-[#0a192f]">
              <th className="p-6 text-center cursor-pointer hover:bg-[#e8ff47] w-1/6" onClick={() => sortData('name')}>
                <div className="flex items-center justify-center gap-2">
                  <span className="truncate">GPU</span>
                  <span className="w-4 h-4 relative flex justify-center items-center">
                    <SortIcon column="name" />
                  </span>
                </div>
              </th>
              <th className="p-6 text-center cursor-pointer hover:bg-[#e8ff47] w-1/6" onClick={() => sortData('recommendedSpecs')}>
                <div className="flex items-center justify-center gap-2">
                  <span className="truncate">Recommended Specs</span>
                  <span className="w-4 h-4 relative flex justify-center items-center">
                    <SortIcon column="recommendedSpecs" />
                  </span>
                </div>
              </th>
              <th className="p-6 text-center cursor-pointer hover:bg-[#e8ff47] w-1/6" onClick={() => sortData('demand')}>
                <div className="flex items-center justify-center gap-2">
                  <span className="truncate">Demand</span>
                  <span className="w-4 h-4 relative flex justify-center items-center">
                    <SortIcon column="demand" />
                  </span>
                </div>
              </th>
              <th className="p-6 text-center cursor-pointer hover:bg-[#e8ff47] w-1/6" onClick={() => sortData('avgRunningTime')}>
                <div className="flex items-center justify-center gap-2">
                  <span className="truncate">Average Running Time</span>
                  <span className="w-4 h-4 relative flex justify-center items-center">
                    <SortIcon column="avgRunningTime" />
                  </span>
                </div>
              </th>
              <th className="p-6 text-center cursor-pointer hover:bg-[#e8ff47] w-1/6" onClick={() => sortData('avgEarnings')}>
                <div className="flex items-center justify-center gap-2">
                  <span className="truncate">Average Earnings (24h)</span>
                  <span className="w-4 h-4 relative flex justify-center items-center">
                    <SortIcon column="avgEarnings" />
                  </span>
                </div>
              </th>
              <th className="p-6 text-center cursor-pointer hover:bg-[#e8ff47] w-1/6" onClick={() => sortData('hourlyEarnings')}>
                <div className="flex items-center justify-center gap-2">
                  <span className="truncate">Hourly Rate</span>
                  <span className="w-4 h-4 relative flex justify-center items-center">
                    <SortIcon column="hourlyEarnings" />
                  </span>
                </div>
              </th>
              <th className="p-6 text-center cursor-pointer hover:bg-[#e8ff47] w-1/6" onClick={() => sortData('vastVerified')}>
                <div className="flex items-center justify-center gap-2">
                  <span className="truncate">Vast Verified Hourly Rate</span>
                  <span className="w-4 h-4 relative flex justify-center items-center">
                    <SortIcon column="vastVerified" />
                  </span>
                </div>
              </th>
              <th className="p-6 text-center cursor-pointer hover:bg-[#e8ff47] w-1/6" onClick={() => sortData('vastUnverified')}>
                <div className="flex items-center justify-center gap-2">
                  <span className="truncate">Vast Unverified Hourly Rate</span>
                  <span className="w-4 h-4 relative flex justify-center items-center">
                    <SortIcon column="vastUnverified" />
                  </span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {gpuData.map((gpu, index) => (
              <tr key={index} className="text-[#c3e325] hover:bg-[#253446]">
                <td className="p-4 text-center">{gpu.name}</td>
                <td className="p-4 text-center">{gpu.recommendedSpecs.ramGb} GB</td>
                <td className={`p-4 text-center ${getDemandBadge(gpu.utilizationPct).className}`}>{getDemandBadge(gpu.utilizationPct).text}</td>
                <td className="p-4 text-center">{gpu.saladEarningRates.avgEarningTimeMinutes} mins</td>
                <td className="p-4 text-center">{gpu.saladEarningRates.avgEarning} USD</td>
                <td className="p-4 text-center">{gpu.saladEarningRates.minEarningRate} USD/h</td>
                <td className="p-4 text-center">{gpu.vastEarningRates.verified ? gpu.vastEarningRates.verified.price10th : 'N/A'}</td>
                <td className="p-4 text-center">{gpu.vastEarningRates.unverified ? gpu.vastEarningRates.unverified.price10th : 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
  {/* Disclaimer at the bottom */}
  <footer className="text-center text-sm text-[#8b9cb3] mt-8 bg-[#112240] p-6 rounded-lg shadow-lg max-w-6xl mx-auto">
    <div className="mb-4">
      <strong className="font-bold text-[#c3e325]">Disclaimer:</strong>  
      <span className="block mt-2">
        This website is not affiliated with or owned by Salad Technologies or Vast.ai / 500.Farm. It uses data provided through the official Salad API and 500.Farm for informational purposes only.
      </span>
    </div>
   <div className="mb-4">
      <strong className="text-[#c3e325]"> Made By:</strong> 
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
