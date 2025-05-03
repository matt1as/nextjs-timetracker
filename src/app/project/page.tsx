"use client";

import { ProjectActivitiesView } from "@/components/ProjectActivitiesView";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function ProjectPage() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("id");

  if (!projectId) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-gray-500 mb-4">No project selected</p>
        <Link href="/" className="text-blue-500 hover:text-blue-700 underline">
          Return to Projects
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <Link
            href="/"
            className="text-blue-500 hover:text-blue-700 flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Projects
          </Link>
        </div>

        <ProjectActivitiesView projectId={projectId} />
      </div>
    </main>
  );
}
