"use client";

import { api } from "@/trpc/react";
import { useState, useRef, useEffect } from "react";
import {
  FaGithub,
  FaExternalLinkAlt,
  FaLock,
  FaChevronDown,
  FaChevronUp,
  FaCalendar,
  FaClock,
} from "react-icons/fa";
import { StatusFlags } from "@prisma/client";

export default function ProjectsPage() {
  const { data: projects, isLoading } =
    api.projects.fetchAllProjects.useQuery();
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(
    new Set(),
  );
  const [cardMinHeight, setCardMinHeight] = useState<number>(0);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Calculate max height of all cards when they first load (desktop only)
  useEffect(() => {
    const calculateHeights = () => {
      // Only calculate on desktop (md breakpoint = 768px)
      if (typeof window !== "undefined" && window.innerWidth >= 768) {
        if (projects && projects.length > 0) {
          setTimeout(() => {
            let maxHeight = 0;
            cardRefs.current.forEach((element) => {
              if (element) {
                const height = element.offsetHeight;
                if (height > maxHeight) {
                  maxHeight = height;
                }
              }
            });
            if (maxHeight > 0) {
              setCardMinHeight(maxHeight);
            }
          }, 100);
        }
      } else {
        // Reset height on mobile
        setCardMinHeight(0);
      }
    };

    calculateHeights();

    // Recalculate on resize (e.g., orientation change)
    const handleResize = () => {
      setCardMinHeight(0); // Reset first
      setTimeout(calculateHeights, 150);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [projects]);

  const toggleExpand = (projectId: string) => {
    setExpandedProjects((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  };

  const getStatusColor = (status: StatusFlags) => {
    switch (status) {
      case StatusFlags.PLANNING:
        return "bg-gray-500/30 text-white";
      case StatusFlags.IN_PROGRESS:
        return "bg-yellow-500/30 text-white";
      case StatusFlags.COMPLETED:
        return "bg-green-500/30 text-white";
      case StatusFlags.MAINTAINED:
        return "bg-blue-500/30 text-white";
      case StatusFlags.ARCHIVED:
        return "bg-red-500/30 text-white";
      default:
        return "bg-gray-500/30 text-white";
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  const formatDateRange = (
    startDate: Date,
    endDate: Date | null,
    status: StatusFlags,
  ) => {
    const start = formatDate(startDate);

    // PLANNING status: only show start date
    if (status === StatusFlags.PLANNING) {
      return `Expected: ${start}`;
    }

    // IN_PROGRESS with no end date: show "Present"
    if (status === StatusFlags.IN_PROGRESS && !endDate) {
      return `${start} - Present`;
    }

    // All other cases with end date
    if (endDate) {
      return `${start} - ${formatDate(endDate)}`;
    }

    // Fallback: just show start date
    return start;
  };

  const calculateDuration = (
    start: Date,
    end: Date | null,
    status: StatusFlags,
  ) => {
    // PLANNING doesn't show duration
    if (status === StatusFlags.PLANNING) {
      return null;
    }

    const startDate = new Date(start);
    const endDate = end ? new Date(end) : new Date(); // Use current date if no end date

    const months =
      (endDate.getFullYear() - startDate.getFullYear()) * 12 +
      (endDate.getMonth() - startDate.getMonth());

    if (months < 1) return "< 1 month";
    if (months === 1) return "1 month";
    if (months < 12) return `${months} months`;

    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    if (remainingMonths === 0)
      return `${years} ${years === 1 ? "year" : "years"}`;
    return `${years} ${years === 1 ? "year" : "years"} ${remainingMonths} ${remainingMonths === 1 ? "month" : "months"}`;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-xl text-white">Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto min-h-screen px-4 pt-24 pb-12">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1
          className="mb-4 text-5xl font-bold text-white md:text-6xl"
          style={{ fontFamily: "var(--font-salsa)" }}
        >
          Projects
        </h1>
        <p
          className="text-xl text-white/80 md:text-2xl"
          style={{ fontFamily: "var(--font-kalam)" }}
        >
          Things I've built, broken, and rebuilt
        </p>
      </div>

      {/* Projects Grid */}
      {projects && projects.length > 0 ? (
        <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const isExpanded = expandedProjects.has(project.id);

            return (
              <div
                key={project.id}
                ref={(el) => {
                  if (el) cardRefs.current.set(project.id, el);
                }}
                style={
                  cardMinHeight > 0
                    ? { minHeight: `${cardMinHeight}px` }
                    : undefined
                }
                className="group flex flex-col overflow-hidden rounded-2xl border border-white/20 bg-white/5 backdrop-blur-md transition-all duration-300 hover:bg-white/10"
              >
                {/* Project Image */}
                {project.imageType && (
                  <div className="relative h-48 w-full overflow-hidden bg-white/5">
                    <img
                      src={`/api/projects/${project.id}/image`}
                      alt={project.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                )}

                {/* Card Content */}
                <div className="flex flex-col p-6">
                  {/* Header */}
                  <div className="mb-4">
                    <h2
                      className="mb-2 text-2xl font-bold text-white"
                      style={{ fontFamily: "var(--font-salsa)" }}
                    >
                      {project.name}
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs ${getStatusColor(project.statusFlag)}`}
                      >
                        {project.statusFlag.replace(/_/g, " ")}
                      </span>
                      <span className="rounded-full bg-purple-500/30 px-3 py-1 text-xs text-white">
                        {project.collabMode}
                      </span>
                    </div>
                  </div>

                  {/* Timeline & Affiliation */}
                  <div className="mb-4 space-y-2 text-sm text-white/70">
                    <div className="flex items-center gap-2">
                      <FaCalendar className="shrink-0" />
                      <span>
                        {formatDateRange(
                          project.startDate,
                          project.endDate,
                          project.statusFlag,
                        )}
                      </span>
                    </div>
                    {calculateDuration(
                      project.startDate,
                      project.endDate,
                      project.statusFlag,
                    ) && (
                      <div className="flex items-center gap-2">
                        <FaClock className="shrink-0" />
                        <span>
                          {calculateDuration(
                            project.startDate,
                            project.endDate,
                            project.statusFlag,
                          )}
                        </span>
                      </div>
                    )}
                    <div className="flex items-start gap-2">
                      <span className="shrink-0">🏢</span>
                      <span>
                        {project.affiliation} (
                        {project.affiliationType.replace(/_/g, " ")})
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-4 grow">
                    <p
                      className="text-white/80"
                      style={{ fontFamily: "var(--font-kalam)" }}
                    >
                      {project.shortDesc}
                    </p>

                    {project.longDesc && (
                      <>
                        {isExpanded && (
                          <p
                            className="mt-3 text-white/80"
                            style={{ fontFamily: "var(--font-kalam)" }}
                          >
                            {project.longDesc}
                          </p>
                        )}
                        <button
                          onClick={() => toggleExpand(project.id)}
                          className="mt-2 flex items-center gap-1 text-sm text-blue-400 transition hover:text-blue-300"
                        >
                          {isExpanded ? (
                            <>
                              <FaChevronUp /> Show Less
                            </>
                          ) : (
                            <>
                              <FaChevronDown /> Read More
                            </>
                          )}
                        </button>
                      </>
                    )}
                  </div>

                  {/* Tech Stack */}
                  <div className="mb-4">
                    <p className="mb-2 text-sm font-semibold text-white/60">
                      Tech Stack:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {project.techStacks.split(",").map((tech, idx) => (
                        <span
                          key={idx}
                          className="rounded-lg bg-white/10 px-2 py-1 text-xs text-white"
                        >
                          {tech.trim()}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Links */}
                  <div className="flex gap-3">
                    {project.sourceCodeAvailibility === "OPEN_SOURCE" &&
                    project.projectUrl ? (
                      <a
                        href={project.projectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-lg bg-gray-700/50 px-4 py-2 text-sm text-white transition hover:bg-gray-700/70"
                      >
                        <FaGithub />
                        Code
                      </a>
                    ) : project.sourceCodeAvailibility === "UNDER_NDA" ? (
                      <div className="flex items-center gap-2 rounded-lg bg-gray-700/30 px-4 py-2 text-sm text-white/50">
                        <FaLock />
                        NDA
                      </div>
                    ) : null}

                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-lg bg-blue-600/50 px-4 py-2 text-sm text-white transition hover:bg-blue-600/70"
                      >
                        <FaExternalLinkAlt />
                        Live Demo
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/30 bg-white/5 p-12 backdrop-blur-md">
          <p className="text-xl text-white/80">No projects to display yet</p>
        </div>
      )}
    </div>
  );
}
