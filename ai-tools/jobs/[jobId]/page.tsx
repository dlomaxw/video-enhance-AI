import { Navbar } from "@/components/navbar"
import { ProcessingDetails } from "@/components/processing-details"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function JobDetailsPage({ params }: { params: { jobId: string } }) {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <div className="container mx-auto px-4 py-8 md:px-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Job Details</h1>
          <Link href="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </div>

        <div className="mx-auto max-w-3xl">
          <ProcessingDetails jobId={params.jobId} />
        </div>
      </div>
    </main>
  )
}

