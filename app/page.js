"use client"

import { useState, useEffect } from "react"
import {
  ChevronUpIcon,
  ChevronDownIcon,
  ExternalLink,
  Info,
  DollarSign,
  Cpu,
  Clock,
  Search,
  ArrowUpDown,
  HelpCircle,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function SaladNetworkMonitor() {
  const [gpuData, setGpuData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sortColumn, setSortColumn] = useState("name")
  const [sortDirection, setSortDirection] = useState("desc")
  const [searchResults, setSearchResults] = useState([])
  const [tableFilter, setTableFilter] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    async function fetchGPUData() {
      try {
        const res = await fetch("/api/gpuData")

        if (!res.ok) {
          const errorText = await res.text()
          throw new Error(`Failed to fetch data: ${errorText}`)
        }

        const data = await res.json()

        const sortedData = data.sort((a, b) => b.name.localeCompare(a.name))
        setGpuData(sortedData)
        setIsLoading(false)
      } catch (error) {
        console.error(error)
        setError(`Failed to fetch GPU data: ${error.message}`)
        setIsLoading(false)
      }
    }

    fetchGPUData()
  }, [])

  const getDemandBadge = (utilizationPct) => {
    if (utilizationPct === null) return { text: "Unknown", className: "bg-gray-500 text-white" }
    if (utilizationPct >= 80) return { text: "High", className: "bg-[#c3e325] text-[#112240]" }
    if (utilizationPct >= 50) return { text: "Moderate", className: "bg-[#e8ff47] text-[#112240]" }
    return { text: "Low", className: "bg-[#6b7280] text-white" }
  }

  const sortData = (column) => {
    const direction = column === sortColumn && sortDirection === "desc" ? "asc" : "desc"
    setSortColumn(column)
    setSortDirection(direction)

    const sortedData = [...gpuData].sort((a, b) => {
      let aValue, bValue

      switch (column) {
        case "name":
          return direction === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
        case "recommendedSpecs":
          aValue = a.recommendedSpecs.ramGb
          bValue = b.recommendedSpecs.ramGb
          break
        case "demand":
          aValue = a.utilizationPct
          bValue = b.utilizationPct
          break
        case "dayRate":
          aValue = a.saladEarningRates.avgEarning * 24
          bValue = b.saladEarningRates.avgEarning * 24
          break
        case "hourlyRate":
          aValue = a.saladEarningRates.avgEarning
          bValue = b.saladEarningRates.avgEarning
          break
        case "vastUnverified":
          aValue = a.vastEarningRates.unverified ? a.vastEarningRates.unverified.price10th : 0
          bValue = b.vastEarningRates.unverified ? b.vastEarningRates.unverified.price10th : 0
          break
        case "vastVerified":
          aValue = a.vastEarningRates.verified ? a.vastEarningRates.verified.price10th : 0
          bValue = b.vastEarningRates.verified ? b.vastEarningRates.verified.price10th : 0
          break
        default:
          return 0
      }

      if (aValue < bValue) return direction === "asc" ? -1 : 1
      if (aValue > bValue) return direction === "asc" ? 1 : -1
      return 0
    })

    setGpuData(sortedData)
  }

  const filterGpuData = () => {
    if (!tableFilter && activeTab === "all") return gpuData

    return gpuData.filter((gpu) => {
      const matchesSearch =
        !tableFilter ||
        gpu.displayName.toLowerCase().includes(tableFilter.toLowerCase()) ||
        gpu.name.toLowerCase().includes(tableFilter.toLowerCase())

      const matchesTab =
        activeTab === "all" ||
        (activeTab === "high" && gpu.utilizationPct >= 80) ||
        (activeTab === "moderate" && gpu.utilizationPct >= 50 && gpu.utilizationPct < 80) ||
        (activeTab === "low" && gpu.utilizationPct < 50)

      return matchesSearch && matchesTab
    })
  }

  const SortIcon = ({ column }) => {
    if (sortColumn !== column) return <ArrowUpDown className="ml-1 h-4 w-4 opacity-50" />
    return sortDirection === "asc" ? (
      <ChevronUpIcon className="ml-1 h-4 w-4" />
    ) : (
      <ChevronDownIcon className="ml-1 h-4 w-4" />
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#0a192f] text-[#c3e325] text-4xl font-bold">
        Loading...
      </div>
    )
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500 text-xl">{error}</div>
  }

  const filteredData = filterGpuData()

  return (
    <div className="min-h-screen bg-[#0a192f] p-4 text-[#c3e325] font-sans">
      <div className="max-w-screen-2xl mx-auto">
        {/* Hero Section */}
        <div className="flex flex-col items-center justify-center mb-10 mt-4">
          <h1 className="text-4xl font-bold mb-2 text-center">Salad Network Monitor</h1>
          <p className="text-[#8b9cb3] text-lg text-center max-w-3xl mb-6">
            See how much you could earn by putting your GPU to work with Salad
          </p>
        </div>

        {/* Salad Info Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-10">
          <div className="bg-[#112240] rounded-xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold mb-4">What is Salad?</h2>
            <p className="text-white mb-4">
              Salad is a simple app that lets you share your computer&apos;s GPU power when you&apos;re not using it. In return,
              you earn rewards like gift cards, games, and more. It works by securely running workloads in virtual machine like environments.
            </p>
            <p className="text-white mb-4">
              When your computer is idle, Salad puts your GPU to work on tasks like AI training, rendering, and
              scientific research. You get paid for the computing time you provide, making it a passive income source
              for gamers and PC enthusiasts.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-start gap-2">
                <DollarSign className="h-5 w-5 text-[#c3e325] mt-1" />
                <div>
                  <h3 className="font-semibold">Earn Passively</h3>
                  <p className="text-sm text-[#8b9cb3]">Make money while you sleep or work</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Cpu className="h-5 w-5 text-[#c3e325] mt-1" />
                <div>
                  <h3 className="font-semibold">Easy Setup</h3>
                  <p className="text-sm text-[#8b9cb3]">Just install and run - no technical knowledge needed</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="h-5 w-5 text-[#c3e325] mt-1" />
                <div>
                  <h3 className="font-semibold">Run When You Want</h3>
                  <p className="text-sm text-[#8b9cb3]">You control when Salad runs</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Info className="h-5 w-5 text-[#c3e325] mt-1" />
                <div>
                  <h3 className="font-semibold">Safe & Secure</h3>
                  <p className="text-sm text-[#8b9cb3]">Trusted by thousands of users worldwide</p>
                </div>
              </div>
            </div>
            <div className="bg-[#1e2a47] p-4 rounded-lg mb-6">
              <h3 className="font-semibold mb-2">How It Works:</h3>
              <ol className="list-decimal list-inside text-white space-y-2">
                <li>Download and install the Salad app on your PC</li>
                <li>Create an account and set a reward goal</li>
                <li>Let Salad run when you&apos;re not using your computer</li>
                <li>Earn rewards automatically as your GPU works</li>
                <li>Redeem your earnings for gift cards, paypal balance, or other rewards</li>
              </ol>
            </div>
            <div className="flex flex-col items-center">
              <a
                href="https://bit.ly/Salad-PIXEL"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#c3e325] hover:bg-[#e8ff47] text-[#112240] font-bold py-4 px-8 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 text-lg flex items-center justify-center w-full max-w-md"
              >
                Download Salad Now
                <ExternalLink className="ml-2 h-5 w-5" />
              </a>
              <p className="text-xs text-[#8b9cb3] mt-2 text-center">
                Affiliate link - I earn a commission when you use this link at no cost to you
              </p>
            </div>
          </div>

          <div className="bg-[#112240] rounded-xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Potential Earnings</h2>
            <p className="text-white mb-4">
              Enter your GPU model below to see estimated earnings. Your actual earnings may vary based on:
            </p>
            <ul className="list-disc list-inside text-[#8b9cb3] mb-4 space-y-2">
              <li>Your specific GPU model and its performance</li>
              <li>How long you run Salad each day</li>
              <li>Current market demand for computing power</li>
              <li>Your electricity costs (not factored into the estimates)</li>
            </ul>

            <div className="mb-4">
              <input
                type="text"
                placeholder="Search your GPU (e.g., RTX 3070, GTX 1660)"
                className="w-full p-3 rounded-lg bg-[#1e2a47] border border-[#2c3e54] text-white focus:outline-none focus:ring-2 focus:ring-[#c3e325] focus:border-transparent"
                onChange={(e) => {
                  const searchTerm = e.target.value.toLowerCase()
                  const filteredGPUs = gpuData.filter(
                    (gpu) =>
                      gpu.displayName.toLowerCase().includes(searchTerm) || gpu.name.toLowerCase().includes(searchTerm),
                  )
                  // Just use the first match if available
                  setSearchResults(searchTerm.length > 2 ? filteredGPUs.slice(0, 3) : [])
                }}
              />
            </div>

            {searchResults.length > 0 ? (
              <div className="space-y-4">
                {searchResults.map((gpu, index) => {
                  const demand = getDemandBadge(gpu.utilizationPct)
                  const minHourlyRate = gpu.saladEarningRates.minEarningRate
                  const maxHourlyRate = gpu.saladEarningRates.maxEarningRate
                  const minDailyRate = minHourlyRate * 24
                  const maxDailyRate = maxHourlyRate * 24
                  const minWeeklyRate = minDailyRate * 7
                  const maxWeeklyRate = maxDailyRate * 7

                  return (
                    <Card key={index} className="bg-[#1e2a47] border-[#c3e325] border">
                      <CardContent className="p-4">
                        <h3 className="font-bold text-xl mb-2 text-white">{gpu.displayName}</h3>

                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <p className="text-sm text-[#c3e325]">Recommended Specs</p>
                            <p className="font-medium text-white">{gpu.recommendedSpecs.ramGb}GB RAM, 120GB Storage</p>
                          </div>
                          <div>
                            <p className="text-sm text-white">Demand</p>
                            <span className={`px-2 py-1 rounded-full text-xs ${demand.className}`}>
                              {demand.text} {gpu.utilizationPct !== null ? `(${gpu.utilizationPct}%)` : ""}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 mt-4">
                          <div className="bg-[#112240] p-3 rounded-lg text-center">
                            <p className="text-sm text-[#c3e325]">Hourly</p>
                            <p className="text-xl font-bold text-white">${minHourlyRate.toFixed(3)} - ${maxHourlyRate.toFixed(3)}</p>
                          </div>
                          <div className="bg-[#112240] p-3 rounded-lg text-center">
                            <p className="text-sm text-[#c3e325]">Daily</p>
                            <p className="text-xl font-bold text-white">${minDailyRate.toFixed(2)} - ${maxDailyRate.toFixed(2)}</p>
                          </div>
                          <div className="bg-[#112240] p-3 rounded-lg text-center">
                            <p className="text-sm text-[#c3e325]">Weekly</p>
                            <p className="text-xl font-bold text-white">${minWeeklyRate.toFixed(2)} - ${maxWeeklyRate.toFixed(2)}</p>
                          </div>
                        </div>

                        <p className="text-xs text-[#8b9cb3] mt-3 italic">
                          This is based on min - max earnings of the GPU. Please find more detailed data available in the
                          table below.
                        </p>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <Card className="bg-[#1e2a47] border-[#c3e325] border">
                <CardContent className="p-4">
                  <h3 className="font-bold text-xl mb-2 text-white">RTX 3070</h3>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-[#c3e325]">Recommended Specs</p>
                      <p className="font-medium text-white">16GB RAM, 120GB Storage</p>
                    </div>
                    <div>
                      <p className="text-sm text-white">Demand</p>
                      <span className="px-2 py-1 rounded-full text-xs bg-[#c3e325] text-[#112240]">High (85%)</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-4">
                    <div className="bg-[#112240] p-3 rounded-lg text-center">
                      <p className="text-sm text-[#c3e325]">Hourly</p>
                      <p className="text-xl font-bold text-white">$0.062 - $0.100</p>
                    </div>
                    <div className="bg-[#112240] p-3 rounded-lg text-center">
                      <p className="text-sm text-[#c3e325]">Daily</p>
                      <p className="text-xl font-bold text-white">$1.50 - $2.40</p>
                    </div>
                    <div className="bg-[#112240] p-3 rounded-lg text-center">
                      <p className="text-sm text-[#c3e325]">Weekly</p>
                      <p className="text-xl font-bold text-white">$10.50 - $16.80</p>
                    </div>
                  </div>

                  <p className="text-xs text-[#8b9cb3] mt-3 italic">
                    This is an example with placeholder data only. Search your GPU above to see actual earnings
                    estimates.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>


        <Separator className="my-8 bg-[#1e2a47]" />

        <h2 className="text-2xl font-bold mb-4 text-center">GPU Earnings Comparison</h2>
         <p className="text-[#8b9cb3] text-sm text-center mb-4 max-w-3xl mx-auto">
           This table compares GPU earnings using data from Salad and vast.ai. The data provides an idea of typical
           earnings, but keep in mind that unusually high or low hourly rates might be due to outliers, which can distort
           the overall averages.
         </p>
         
         {/* Integrated Warning Message */}
         <p className="text-sm text-[#ff9a33] text-center mb-6 max-w-3xl mx-auto">
           <span className="text-[#ff9a33] font-semibold">Warning:</span> The average earnings can sometimes be below the minimum earnings. This is due to the way
           Salad calculates average earnings, it shows the average earning of any machine that has that GPU installed, even if it&apos;s running bandwidth sharing, mining, or CPU containers.
         </p>
         
         {/* Redesigned Table Section */}
         <div className="bg-[#112240] rounded-xl shadow-lg p-4 mb-8">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
             <div className="flex items-center gap-2">
               <h3 className="text-lg font-bold">GPU Comparison</h3>
               <TooltipProvider>
                 <Tooltip>
                   <TooltipTrigger>
                     <HelpCircle className="h-4 w-4 text-[#8b9cb3]" /> 
                   </TooltipTrigger>
                   <TooltipContent className="max-w-xs bg-[#1a2a3c] text-white p-3 rounded">
                     <p>Compare earnings potential across different GPU models. Click column headers to sort.</p>
                   </TooltipContent>
                 </Tooltip>
               </TooltipProvider>
             </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#8b9cb3]" />
                <input
                  type="text"
                  placeholder="Filter GPUs..."
                  className="pl-10 w-full p-2 rounded-lg bg-[#1e2a47] border border-[#2c3e54] text-white focus:outline-none focus:ring-2 focus:ring-[#c3e325] focus:border-transparent"
                  onChange={(e) => setTableFilter(e.target.value)}
                  value={tableFilter}
                />
              </div>

              <Tabs defaultValue="all" className="w-full sm:w-auto" onValueChange={setActiveTab}>
                <TabsList className="bg-[#1e2a47] grid grid-cols-4 w-full">
                  <TabsTrigger
                    value="all"
                    className="data-[state=active]:bg-[#c3e325] data-[state=active]:text-[#112240]"
                  >
                    All
                  </TabsTrigger>
                  <TabsTrigger
                    value="high"
                    className="data-[state=active]:bg-[#c3e325] data-[state=active]:text-[#112240]"
                  >
                    High Demand
                  </TabsTrigger>
                  <TabsTrigger
                    value="moderate"
                    className="data-[state=active]:bg-[#c3e325] data-[state=active]:text-[#112240]"
                  >
                    Moderate
                  </TabsTrigger>
                  <TabsTrigger
                    value="low"
                    className="data-[state=active]:bg-[#c3e325] data-[state=active]:text-[#112240]"
                  >
                    Low Demand
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Table for larger screens */}
          <div className="hidden md:block overflow-x-auto rounded-lg">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-[#1e2a47] border-b border-[#2c3e54]">
                  <th className="p-4 text-left">
                    <button
                      onClick={() => sortData("name")}
                      className="flex items-center font-medium text-[#c3e325] hover:text-[#e8ff47] transition-colors"
                    >
                      GPU <SortIcon column="name" />
                    </button>
                  </th>
                  <th className="p-4 text-center">
                    <button
                      onClick={() => sortData("recommendedSpecs")}
                      className="flex items-center justify-center font-medium text-[#c3e325] hover:text-[#e8ff47] transition-colors"
                    >
                      Specs <SortIcon column="recommendedSpecs" />
                    </button>
                  </th>
                  <th className="p-4 text-center">
                    <button
                      onClick={() => sortData("demand")}
                      className="flex items-center justify-center font-medium text-[#c3e325] hover:text-[#e8ff47] transition-colors"
                    >
                      Demand <SortIcon column="demand" />
                    </button>
                  </th>
                  <th className="p-4 text-center">
                    <button
                      onClick={() => sortData("hourlyRate")}
                      className="flex items-center justify-center font-medium text-[#c3e325] hover:text-[#e8ff47] transition-colors"
                    >
                      Hourly Rate <SortIcon column="hourlyRate" />
                    </button>
                  </th>
                  <th className="p-4 text-center">
                    <button
                      onClick={() => sortData("dayRate")}
                      className="flex items-center justify-center font-medium text-[#c3e325] hover:text-[#e8ff47] transition-colors"
                    >
                      Daily Rate <SortIcon column="dayRate" />
                    </button>
                  </th>
                  <th className="p-4 text-center">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => sortData("vastUnverified")}
                            className="flex items-center justify-center font-medium text-[#c3e325] hover:text-[#e8ff47] transition-colors"
                          >
                            Vast Unverified <SortIcon column="vastUnverified" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-[#1a2a3c] text-white p-2 rounded">
                          <p>Hourly rate for unverified machines on Vast.ai</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </th>
                  <th className="p-4 text-center">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => sortData("vastVerified")}
                            className="flex items-center justify-center font-medium text-[#c3e325] hover:text-[#e8ff47] transition-colors"
                          >
                            Vast Verified <SortIcon column="vastVerified" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent className="bg-[#1a2a3c] text-white p-2 rounded">
                          <p>Hourly rate for verified machines on Vast.ai</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((gpu, index) => {
                    const demand = getDemandBadge(gpu.utilizationPct)
                    const dayRate = {
                      min: (gpu.saladEarningRates.minEarningRate * 24).toFixed(2),
                      max: (gpu.saladEarningRates.maxEarningRate * 24).toFixed(2),
                      top25: (gpu.saladEarningRates.top25PctEarningRate * 24).toFixed(2),
                    }

                    const formatPrice = (value) => (typeof value === "number" ? `$${value.toFixed(2)}` : "N/A")

                    const vastVerified = gpu.vastEarningRates.verified
                      ? `${formatPrice(gpu.vastEarningRates.verified.price10th)} - ${formatPrice(gpu.vastEarningRates.verified.price90th)}`
                      : "N/A"

                    const vastUnverified = gpu.vastEarningRates.unverified
                      ? `${formatPrice(gpu.vastEarningRates.unverified.price10th)} - ${formatPrice(gpu.vastEarningRates.unverified.price90th)}`
                      : "N/A"

                    const vastUnverifiedCount = gpu.vastEarningRates.unverified?.count || 0
                    const vastVerifiedCount = gpu.vastEarningRates.verified?.count || 0

                    const averageRate = gpu.saladEarningRates.avgEarning.toFixed(3)

                    return (
                      <tr
                        key={index}
                        className={`${index % 2 === 0 ? "bg-[#112240]" : "bg-[#1a2a3c]"} hover:bg-[#2c3e54] transition-all duration-300 border-b border-[#2c3e54] last:border-0`}
                      >
                        <td className="p-4 text-left">
                          <div className="font-bold text-white">{gpu.displayName}</div>
                        </td>
                        <td className="p-4 text-center">
                          <div className="text-white">{gpu.recommendedSpecs.ramGb}GB RAM</div>
                          <div className="text-xs text-[#8b9cb3]">120 GB Storage</div>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex flex-col items-center">
                            <span className={`px-3 py-1 rounded-full text-xs ${demand.className} mb-1`}>
                              {demand.text}
                            </span>
                            {gpu.utilizationPct !== null && (
                              <div className="w-full bg-[#0a192f] rounded-full h-1.5 mt-1">
                                <div
                                  className="bg-[#c3e325] h-1.5 rounded-full"
                                  style={{ width: `${gpu.utilizationPct}%` }}
                                ></div>
                              </div>
                            )}
                            <div className="text-xs text-[#8b9cb3] mt-1">
                              {gpu.utilizationPct !== null ? `${gpu.utilizationPct}%` : "N/A"}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex flex-col items-center">
                            <div className="text-lg font-bold text-white">${averageRate}</div>
                            <div className="text-xs text-[#8b9cb3]">
                              Range: ${gpu.saladEarningRates.minEarningRate.toFixed(3)} - $
                              {gpu.saladEarningRates.maxEarningRate.toFixed(3)}
                            </div>
                            <div className="text-xs text-[#c3e325]">
                              Top 25%: ${gpu.saladEarningRates.top25PctEarningRate.toFixed(3)}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex flex-col items-center">
                            <div className="text-lg font-bold text-white">
                              ${(gpu.saladEarningRates.avgEarning * 24).toFixed(2)}
                            </div>
                            <div className="text-xs text-[#8b9cb3]">
                              Range: ${dayRate.min} - ${dayRate.max}
                            </div>
                            <div className="text-xs text-[#c3e325]">Top 25%: ${dayRate.top25}</div>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <div className="text-white">{vastUnverified}</div>
                          <div className="text-xs text-[#8b9cb3]">Machines: {vastUnverifiedCount}</div>
                        </td>
                        <td className="p-4 text-center">
                          <div className="text-white">{vastVerified}</div>
                          <div className="text-xs text-[#8b9cb3]">Machines: {vastVerifiedCount}</div>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-[#8b9cb3]">
                      No GPUs match your search criteria. Try adjusting your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Card view for mobile */}
          <div className="md:hidden space-y-4">
            {filteredData.length > 0 ? (
              filteredData.map((gpu, index) => {
                const demand = getDemandBadge(gpu.utilizationPct)
                const hourlyRate = gpu.saladEarningRates.avgEarning
                const dailyRate = hourlyRate * 24
                const weeklyRate = dailyRate * 7

                const formatPrice = (value) => (typeof value === "number" ? `$${value.toFixed(2)}` : "N/A")

                const vastVerified = gpu.vastEarningRates.verified
                  ? `${formatPrice(gpu.vastEarningRates.verified.price10th)} - ${formatPrice(gpu.vastEarningRates.verified.price90th)}`
                  : "N/A"

                const vastUnverified = gpu.vastEarningRates.unverified
                  ? `${formatPrice(gpu.vastEarningRates.unverified.price10th)} - ${formatPrice(gpu.vastEarningRates.unverified.price90th)}`
                  : "N/A"

                return (
                  <Card key={index} className="bg-[#1a2a3c] border-[#2c3e54] border">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-lg">{gpu.displayName}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs ${demand.className}`}>{demand.text}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-[#8b9cb3]">Specs</p>
                          <p className="text-sm">{gpu.recommendedSpecs.ramGb}GB RAM, 120GB Storage</p>
                        </div>
                        <div>
                          <p className="text-xs text-[#8b9cb3]">Utilization</p>
                          <p className="text-sm">{gpu.utilizationPct !== null ? `${gpu.utilizationPct}%` : "N/A"}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-[#8b9cb3]">Hourly Rate</p>
                          <p className="text-base font-bold">${hourlyRate.toFixed(3)}</p>
                          <p className="text-xs text-[#8b9cb3]">
                            Range: ${gpu.saladEarningRates.minEarningRate.toFixed(3)} - $
                            {gpu.saladEarningRates.maxEarningRate.toFixed(3)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-[#8b9cb3]">Daily Rate</p>
                          <p className="text-base font-bold">${dailyRate.toFixed(2)}</p>
                          <p className="text-xs text-[#8b9cb3]">Weekly: ${weeklyRate.toFixed(2)}</p>
                        </div>
                      </div>

                      <Separator className="my-3 bg-[#2c3e54]" />

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-[#8b9cb3]">Vast Unverified</p>
                          <p className="text-sm">{vastUnverified}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[#8b9cb3]">Vast Verified</p>
                          <p className="text-sm">{vastVerified}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            ) : (
              <div className="p-8 text-center text-[#8b9cb3] bg-[#1a2a3c] rounded-lg">
                No GPUs match your search criteria. Try adjusting your filters.
              </div>
            )}
          </div>

          <div className="mt-4 text-xs text-[#8b9cb3] text-center">
            Showing {filteredData.length} of {gpuData.length} GPUs
          </div>
        </div>
      </div>
      <footer className="text-center text-xs text-[#8b9cb3] mt-4 bg-[#112240] p-6 rounded-lg shadow-lg max-w-4xl mx-auto">
        <div className="mb-4">
          <strong className="font-bold text-[#c3e325]">Disclaimer:</strong>
          <span className="block mt-1">
            This website is not affiliated with or owned by Salad Technologies or Vast.ai / 500.Farm. It uses data
            provided through the official Salad API and 500.Farm for informational purposes only. Earnings estimates are
            based on historical data and are not guaranteed.
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
            Website
          </a>
        </div>
      </footer>
    </div>
  )
}

