"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CacheManager } from "@/components/cache-manager"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { FileVideo, Clock, CheckCircle, Loader2 } from "lucide-react"
import { VideoPlayer } from "@/components/video-player"

export default function Dashboard() {
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedJob, setSelectedJob] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("jobs")
  const [statsData, setStatsData] = useState<any>({
    totalJobs: 0,
    completedJobs: 0,
    failedJobs: 0,
    processingJobs: 0,
    averageProcessingTime: 0,
    jobsByDay: [],
    statusDistribution: [],
  })

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/jobs")

        if (!response.ok) {
          throw new Error("Failed to fetch jobs")
        }

        const data = await response.json()
        setJobs(data.jobs)

        // Calculate statistics
        calculateStats(data.jobs)

        setLoading(false)
      } catch (err) {
        setError(err.message || "An error occurred")
        setLoading(false)
      }
    }

    fetchJobs()

    // Refresh data every 30 seconds
    const interval = setInterval(fetchJobs, 30000)

    return () => clearInterval(interval)
  }, [])

  const calculateStats = (jobsData: any[]) => {
    // Count jobs by status
    const completedJobs = jobsData.filter((job) => job.status === "completed").length
    const failedJobs = jobsData.filter((job) => job.status === "failed").length
    const processingJobs = jobsData.filter((job) => ["processing", "queued"].includes(job.status)).length

    // Calculate average processing time for completed jobs
    let totalProcessingTime = 0
    let processedJobsCount = 0

    jobsData.forEach((job) => {
      if (job.status === "completed" && job.processingStartedAt && job.processingCompletedAt) {
        const startTime = new Date(job.processingStartedAt).getTime()
        const endTime = new Date(job.processingCompletedAt).getTime()
        const processingTime = (endTime - startTime) / 1000 // in seconds

        totalProcessingTime += processingTime
        processedJobsCount++
      }
    })

    const averageProcessingTime = processedJobsCount > 0 ? Math.round(totalProcessingTime / processedJobsCount) : 0

    // Group jobs by day
    const jobsByDay = groupJobsByDay(jobsData)

    // Status distribution for pie chart
    const statusDistribution = [
      { name: "Completed", value: completedJobs, color: "#10b981" },
      { name: "Failed", value: failedJobs, color: "#ef4444" },
      { name: "Processing", value: processingJobs, color: "#3b82f6" },
    ].filter((item) => item.value > 0)

    setStatsData({
      totalJobs: jobsData.length,
      completedJobs,
      failedJobs,
      processingJobs,
      averageProcessingTime,
      jobsByDay,
      statusDistribution,
    })
  }

  const groupJobsByDay = (jobsData: any[]) => {
    const jobsByDay: Record<string, number> = {}

    jobsData.forEach((job) => {
      const date = new Date(job.createdAt).toLocaleDateString()
      jobsByDay[date] = (jobsByDay[date] || 0) + 1
    })

    // Convert to array for chart
    return Object.entries(jobsByDay)
      .map(([date, count]) => ({
        date,
        count,
      }))
      .slice(-7) // Last 7 days
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "uploaded":
      case "queued":
        return "bg-yellow-500"
      case "processing":
        return "bg-blue-500"
      case "completed":
        return "bg-green-500"
      case "failed":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const formatTime = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds} seconds`
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = seconds % 60
      return `${minutes} min ${remainingSeconds} sec`
    } else {
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      return `${hours} hr ${minutes} min`
    }
  }

  const viewJobDetails = (job: any) => {
    setSelectedJob(job)
    setActiveTab("details")
  }

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <div className="container mx-auto px-4 py-8 md:px-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Processing Dashboard</h1>
          <Link href="/">
            <Button>New Enhancement</Button>
          </Link>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="jobs">Processing Jobs</TabsTrigger>
            <TabsTrigger value="cache">Cache Manager</TabsTrigger>
            {selectedJob && <TabsTrigger value="details">Job Details</TabsTrigger>}
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
                  <FileVideo className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{statsData.totalJobs}</div>
                  <p className="text-xs text-muted-foreground">Videos processed through the system</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{statsData.completedJobs}</div>
                  <p className="text-xs text-muted-foreground">Successfully enhanced videos</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Processing</CardTitle>
                  <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{statsData.processingJobs}</div>
                  <p className="text-xs text-muted-foreground">Currently in the processing queue</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Processing Time</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatTime(statsData.averageProcessingTime)}</div>
                  <p className="text-xs text-muted-foreground">Average time to enhance a video</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Processing Activity</CardTitle>
                  <CardDescription>Number of videos processed per day</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statsData.jobsByDay}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3b82f6" name="Videos" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Processing Status</CardTitle>
                  <CardDescription>Distribution of job statuses</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statsData.statusDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {statsData.statusDistribution.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="jobs">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : error ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-500">{error}</div>
            ) : jobs.length === 0 ? (
              <div className="rounded-lg border p-8 text-center">
                <p className="mb-4 text-lg font-medium">No jobs found</p>
                <p className="text-gray-500">Upload a video to start enhancing</p>
              </div>
            ) : (
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job ID</TableHead>
                      <TableHead>File Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobs.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell className="font-mono text-xs">{job.id.substring(0, 8)}...</TableCell>
                        <TableCell className="max-w-[200px] truncate">{job.originalFilename}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(job.status)}>
                            {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(job.createdAt).toLocaleString()}</TableCell>
                        <TableCell>{job.progress !== undefined ? `${job.progress}%` : "-"}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" onClick={() => viewJobDetails(job)}>
                              Details
                            </Button>
                            {job.status === "completed" && (
                              <Link href={`/api/jobs/${job.id}/download`}>
                                <Button size="sm">Download</Button>
                              </Link>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="cache">
            <CacheManager />
          </TabsContent>

          <TabsContent value="details">
            {selectedJob && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Job Details</CardTitle>
                        <CardDescription>Detailed information about this processing job</CardDescription>
                      </div>
                      <Badge className={getStatusColor(selectedJob.status)}>
                        {selectedJob.status.charAt(0).toUpperCase() + selectedJob.status.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <h3 className="text-lg font-medium mb-2">File Information</h3>
                        <div className="space-y-2">
                          <div className="grid grid-cols-2">
                            <span className="text-sm font-medium">File Name:</span>
                            <span className="text-sm">{selectedJob.originalFilename}</span>
                          </div>
                          <div className="grid grid-cols-2">
                            <span className="text-sm font-medium">File Type:</span>
                            <span className="text-sm">{selectedJob.fileType}</span>
                          </div>
                          <div className="grid grid-cols-2">
                            <span className="text-sm font-medium">File Size:</span>
                            <span className="text-sm">{formatFileSize(selectedJob.fileSize)}</span>
                          </div>
                          <div className="grid grid-cols-2">
                            <span className="text-sm font-medium">Job ID:</span>
                            <span className="text-sm font-mono">{selectedJob.id}</span>
                          </div>
                        </div>

                        <h3 className="text-lg font-medium mt-4 mb-2">Processing Information</h3>
                        <div className="space-y-2">
                          <div className="grid grid-cols-2">
                            <span className="text-sm font-medium">Created:</span>
                            <span className="text-sm">{new Date(selectedJob.createdAt).toLocaleString()}</span>
                          </div>
                          {selectedJob.processingStartedAt && (
                            <div className="grid grid-cols-2">
                              <span className="text-sm font-medium">Processing Started:</span>
                              <span className="text-sm">
                                {new Date(selectedJob.processingStartedAt).toLocaleString()}
                              </span>
                            </div>
                          )}
                          {selectedJob.processingCompletedAt && (
                            <div className="grid grid-cols-2">
                              <span className="text-sm font-medium">Processing Completed:</span>
                              <span className="text-sm">
                                {new Date(selectedJob.processingCompletedAt).toLocaleString()}
                              </span>
                            </div>
                          )}
                          {selectedJob.processingStartedAt && selectedJob.processingCompletedAt && (
                            <div className="grid grid-cols-2">
                              <span className="text-sm font-medium">Processing Time:</span>
                              <span className="text-sm">
                                {formatTime(
                                  (new Date(selectedJob.processingCompletedAt).getTime() -
                                    new Date(selectedJob.processingStartedAt).getTime()) /
                                    1000,
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium mb-2">Enhancement Options</h3>
                        {selectedJob.enhancementOptions ? (
                          <div className="space-y-2">
                            <div className="grid grid-cols-2">
                              <span className="text-sm font-medium">Target Resolution:</span>
                              <span className="text-sm">{selectedJob.enhancementOptions.resolution}</span>
                            </div>
                            <div className="grid grid-cols-2">
                              <span className="text-sm font-medium">Quality Level:</span>
                              <span className="text-sm">{selectedJob.enhancementOptions.quality}%</span>
                            </div>
                            <div className="grid grid-cols-2">
                              <span className="text-sm font-medium">Auto Color Correction:</span>
                              <span className="text-sm">
                                {selectedJob.enhancementOptions.autoColor ? "Enabled" : "Disabled"}
                              </span>
                            </div>
                            <div className="grid grid-cols-2">
                              <span className="text-sm font-medium">Noise Reduction:</span>
                              <span className="text-sm">
                                {selectedJob.enhancementOptions.denoise ? "Enabled" : "Disabled"}
                              </span>
                            </div>
                            {selectedJob.enhancementOptions.stabilize !== undefined && (
                              <div className="grid grid-cols-2">
                                <span className="text-sm font-medium">Video Stabilization:</span>
                                <span className="text-sm">
                                  {selectedJob.enhancementOptions.stabilize ? "Enabled" : "Disabled"}
                                </span>
                              </div>
                            )}
                            {selectedJob.enhancementOptions.enhanceDetails !== undefined && (
                              <div className="grid grid-cols-2">
                                <span className="text-sm font-medium">Detail Enhancement:</span>
                                <span className="text-sm">
                                  {selectedJob.enhancementOptions.enhanceDetails ? "Enabled" : "Disabled"}
                                </span>
                              </div>
                            )}
                            {selectedJob.enhancementOptions.hdrEffect !== undefined && (
                              <div className="grid grid-cols-2">
                                <span className="text-sm font-medium">HDR Effect:</span>
                                <span className="text-sm">
                                  {selectedJob.enhancementOptions.hdrEffect ? "Enabled" : "Disabled"}
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">No enhancement options available</p>
                        )}

                        {selectedJob.videoInfo && (
                          <>
                            <h3 className="text-lg font-medium mt-4 mb-2">Original Video Info</h3>
                            <div className="space-y-2">
                              <div className="grid grid-cols-2">
                                <span className="text-sm font-medium">Resolution:</span>
                                <span className="text-sm">
                                  {selectedJob.videoInfo.width}x{selectedJob.videoInfo.height}
                                </span>
                              </div>
                              <div className="grid grid-cols-2">
                                <span className="text-sm font-medium">Duration:</span>
                                <span className="text-sm">{formatTime(selectedJob.videoInfo.duration)}</span>
                              </div>
                              <div className="grid grid-cols-2">
                                <span className="text-sm font-medium">Codec:</span>
                                <span className="text-sm">{selectedJob.videoInfo.codec_name}</span>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {selectedJob.status === "completed" && (
                      <div className="mt-6">
                        <h3 className="text-lg font-medium mb-2">Preview Enhanced Video</h3>
                        {/* Update the stream URL to use jobId parameter */}
                        <VideoPlayer src={`/api/jobs/${selectedJob.id}/stream`} className="aspect-video w-full" />
                      </div>
                    )}

                    {selectedJob.logs && selectedJob.logs.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-lg font-medium mb-2">Processing Log</h3>
                        <div className="max-h-60 overflow-y-auto rounded-md bg-gray-100 p-2">
                          {selectedJob.logs.map((log: any, index: number) => (
                            <div key={index} className="text-sm">
                              <span className="text-gray-500">[{new Date(log.timestamp).toLocaleTimeString()}]</span>{" "}
                              <span
                                className={`font-medium ${
                                  log.level === "error"
                                    ? "text-red-500"
                                    : log.level === "warning"
                                      ? "text-yellow-500"
                                      : "text-gray-700"
                                }`}
                              >
                                {log.message}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedJob(null)
                      setActiveTab("jobs")
                    }}
                  >
                    Back to Jobs
                  </Button>

                  {selectedJob.status === "completed" && (
                    <Link href={`/api/jobs/${selectedJob.id}/download`}>
                      <Button>Download Enhanced Video</Button>
                    </Link>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}

// Helper function to format file size
const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + " B"
  else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + " KB"
  else return (bytes / 1048576).toFixed(2) + " MB"
}

