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
  FaChevronLeft,
  FaChevronRight,
  FaFilter,
  FaTimes,
  FaSearch,
} from "react-icons/fa";
import { StatusFlags, SourceCodeAvailibility } from "@prisma/client";

export default function ProjectsPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState(""); // What user is typing
  const [searchQuery, setSearchQuery] = useState(""); // What we actually search for
  const [appliedTechStacks, setAppliedTechStacks] = useState<string[]>([]);
  const [pendingTechStacks, setPendingTechStacks] = useState<string[]>([]);
  const [isTechStackFilterOpen, setIsTechStackFilterOpen] = useState(false);
  const [techStackSearchInput, setTechStackSearchInput] = useState("");
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(
    new Set(),
  );
  const [cardMinHeight, setCardMinHeight] = useState<number>(0);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch all available tech stacks
  const { data: allTechStacksData } = api.projects.getAllTechStacks.useQuery();
  const allTechStacks = allTechStacksData ?? [];

  const { data, isLoading } = api.projects.fetchAllProjects.useQuery({
    page,
    limit: 12,
    search: searchQuery || undefined,
    techStacks: appliedTechStacks.length > 0 ? appliedTechStacks : undefined,
  });

  // Reset to page 1 when search or tech stacks change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, appliedTechStacks]);

  // Calculate max height of all cards when they first load (desktop only)
  useEffect(() => {
    const calculateHeights = () => {
      // Only calculate on desktop (md breakpoint = 768px)
      if (typeof window !== "undefined" && window.innerWidth >= 768) {
        if (data?.projects && data.projects.length > 0) {
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
  }, [data?.projects]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsTechStackFilterOpen(false);
      }
    };

    if (isTechStackFilterOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isTechStackFilterOpen]);

  // Handle search button click
  const handleSearch = () => {
    const trimmed = searchInput.trim();

    // Client-side validation - silently prevent invalid searches
    if (trimmed.length === 0) {
      setSearchQuery("");
      return;
    }

    // Enforce min 2 chars, max 200 chars, must contain alphanumeric
    if (
      trimmed.length < 2 ||
      trimmed.length > 200 ||
      !/[a-zA-Z0-9]/.test(trimmed)
    ) {
      // Don't make the request - invalid search
      return;
    }

    setSearchQuery(trimmed);
  };

  // Check if current search input is valid
  const isSearchValid = () => {
    const trimmed = searchInput.trim();
    if (trimmed.length === 0) return true; // Empty is valid (clears search)
    return (
      trimmed.length >= 2 &&
      trimmed.length <= 200 &&
      /[a-zA-Z0-9]/.test(trimmed)
    );
  };

  // Handle Enter key in search input
  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
  };

  // Filter tech stacks based on search input in dropdown
  const filteredAvailableTechStacks = allTechStacks.filter((stack) =>
    techStackSearchInput
      ? stack.toLowerCase().includes(techStackSearchInput.toLowerCase())
      : true,
  );

  // Toggle tech stack in pending selection
  const togglePendingTechStack = (stack: string) => {
    setPendingTechStacks((prev) =>
      prev.includes(stack) ? prev.filter((s) => s !== stack) : [...prev, stack],
    );
  };

  // Remove tech stack from pending selection
  const removePendingTechStack = (stack: string) => {
    setPendingTechStacks((prev) => prev.filter((s) => s !== stack));
  };

  // Apply pending tech stacks to trigger actual search
  const applyTechStackFilter = () => {
    setAppliedTechStacks(pendingTechStacks);
    setIsTechStackFilterOpen(false);
  };

  // Clear all tech stacks
  const clearAllTechStacks = () => {
    setPendingTechStacks([]);
    setAppliedTechStacks([]);
    setIsTechStackFilterOpen(false);
  };

  // Open filter and sync pending with applied
  const openTechStackFilter = () => {
    setPendingTechStacks(appliedTechStacks);
    setIsTechStackFilterOpen(true);
  };

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

  const getSourceCodeColor = (availability: SourceCodeAvailibility) => {
    switch (availability) {
      case SourceCodeAvailibility.OPEN_SOURCE:
        return "bg-green-500/30 text-white";
      case SourceCodeAvailibility.UNDER_NDA:
        return "bg-orange-500/30 text-white";
      case SourceCodeAvailibility.CLOSED_SOURCE:
        return "bg-gray-500/30 text-white";
      default:
        return "bg-gray-500/30 text-white";
    }
  };

  const getSourceCodeLabel = (availability: SourceCodeAvailibility) => {
    switch (availability) {
      case SourceCodeAvailibility.OPEN_SOURCE:
        return "Open Source";
      case SourceCodeAvailibility.UNDER_NDA:
        return "Under NDA";
      case SourceCodeAvailibility.CLOSED_SOURCE:
        return "Closed Source";
      default:
        return "Unknown";
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
          “Simplicity is the ultimate sophistication” - Leonardo da Vinci
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <FaSearch className="absolute top-1/2 left-4 -translate-y-1/2 text-white/50" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              placeholder="Search by project name (min. 2 characters)..."
              className="w-full rounded-lg border border-white/30 bg-white/10 py-3 pr-4 pl-12 text-white placeholder-white/50 backdrop-blur-md focus:border-blue-400 focus:outline-none"
            />
            {searchInput && (
              <button
                onClick={handleClearSearch}
                className="absolute top-1/2 right-4 -translate-y-1/2 text-white/50 transition hover:text-white"
                aria-label="Clear search"
              >
                <FaTimes />
              </button>
            )}
          </div>
          <button
            onClick={handleSearch}
            disabled={!isSearchValid()}
            className="flex items-center gap-2 rounded-lg bg-blue-600/50 px-6 py-3 text-white transition hover:bg-blue-600/70 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FaSearch />
            Search
          </button>
        </div>

        {/* Tech Stack Filter and Applied Chips */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={openTechStackFilter}
              className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-white backdrop-blur-md transition hover:bg-white/20"
            >
              <FaFilter />
              Filter by Tech Stack
              {appliedTechStacks.length > 0 && (
                <span className="rounded-full bg-blue-600/70 px-2 py-0.5 text-xs">
                  {appliedTechStacks.length}
                </span>
              )}
            </button>

            {/* Tech Stack Filter Dropdown */}
            {isTechStackFilterOpen && (
              <div className="absolute top-full left-0 z-50 mt-2 w-80 rounded-2xl border border-white/20 bg-white/5 shadow-xl backdrop-blur-md">
                {/* Header with close button */}
                <div className="flex items-center justify-between border-b border-white/20 px-4 py-3">
                  <span className="text-sm font-semibold text-white">
                    Select Tech Stacks
                  </span>
                  <button
                    onClick={() => setIsTechStackFilterOpen(false)}
                    className="text-white/70 transition hover:text-white"
                    aria-label="Close"
                  >
                    <FaTimes />
                  </button>
                </div>

                {/* Selected tech stacks area */}
                {pendingTechStacks.length > 0 && (
                  <div className="border-b border-white/20 p-3">
                    <div className="flex flex-wrap gap-2">
                      {pendingTechStacks.map((stack) => (
                        <span
                          key={stack}
                          className="flex items-center gap-1 rounded-full bg-blue-600/50 px-3 py-1 text-xs text-white"
                        >
                          {stack}
                          <button
                            onClick={() => removePendingTechStack(stack)}
                            className="transition hover:text-red-300"
                            aria-label={`Remove ${stack}`}
                          >
                            <FaTimes className="text-xs" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Search tech stacks */}
                <div className="border-b border-white/20 p-3">
                  <div className="relative">
                    <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-sm text-white/50" />
                    <input
                      type="text"
                      value={techStackSearchInput}
                      onChange={(e) => setTechStackSearchInput(e.target.value)}
                      placeholder="Search tech stacks..."
                      className="w-full rounded-lg border border-white/30 bg-white/10 py-2 pr-3 pl-9 text-sm text-white placeholder-white/50 backdrop-blur-md focus:border-blue-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Tech stack list */}
                <div className="max-h-135 overflow-y-auto p-2">
                  {filteredAvailableTechStacks.filter(
                    (stack) => !pendingTechStacks.includes(stack),
                  ).length > 0 ? (
                    filteredAvailableTechStacks
                      .filter((stack) => !pendingTechStacks.includes(stack))
                      .map((stack) => (
                        <button
                          key={stack}
                          onClick={() => togglePendingTechStack(stack)}
                          className="w-full rounded-lg px-4 py-2 text-left text-sm text-white transition hover:bg-white/10"
                        >
                          {stack}
                        </button>
                      ))
                  ) : (
                    <p className="px-3 py-4 text-center text-sm text-white/50">
                      {pendingTechStacks.length > 0
                        ? "All tech stacks selected"
                        : "No tech stacks found"}
                    </p>
                  )}
                </div>

                {/* Footer with Apply and Clear buttons */}
                <div className="space-y-2 border-t border-white/20 p-3">
                  <button
                    onClick={applyTechStackFilter}
                    className="w-full rounded-lg bg-blue-600/50 px-4 py-2 text-sm text-white transition hover:bg-blue-600/70"
                  >
                    Apply Filters{" "}
                    {pendingTechStacks.length > 0 &&
                      `(${pendingTechStacks.length})`}
                  </button>
                  {pendingTechStacks.length > 0 && (
                    <button
                      onClick={() => setPendingTechStacks([])}
                      className="w-full rounded-lg bg-white/10 px-4 py-2 text-sm text-white/70 transition hover:bg-white/20"
                    >
                      Clear Selection
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Applied Tech Stack Chips */}
          {appliedTechStacks.map((stack) => (
            <span
              key={stack}
              className="flex items-center gap-2 rounded-full bg-blue-600/50 px-3 py-1 text-sm text-white"
            >
              {stack}
              <button
                onClick={() => {
                  setAppliedTechStacks((prev) =>
                    prev.filter((s) => s !== stack),
                  );
                }}
                className="transition hover:text-red-300"
                aria-label={`Remove ${stack}`}
              >
                <FaTimes className="text-xs" />
              </button>
            </span>
          ))}
        </div>

        {/* Results count */}
        {searchQuery && (
          <p className="mb-4 text-sm text-white/60">
            Found {data?.total ?? 0} project{data?.total !== 1 ? "s" : ""}
          </p>
        )}
        {!searchQuery && appliedTechStacks.length > 0 && (
          <p className="mb-4 text-sm text-white/60">
            Found {data?.total ?? 0} project{data?.total !== 1 ? "s" : ""} with
            selected tech stacks
          </p>
        )}
      </div>

      {/* Projects Grid */}
      {data?.projects && data.projects.length > 0 ? (
        <>
          <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-2 lg:grid-cols-3">
            {data.projects.map((project) => {
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
                    <div className="relative h-60 w-full overflow-hidden bg-white/5">
                      <img
                        src={`/api/projects/${project.id}/image`}
                        alt={project.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  )}

                  {/* Card Content */}
                  <div className="flex flex-1 flex-col p-6">
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
                        <span
                          className={`rounded-full px-3 py-1 text-xs ${getSourceCodeColor(project.sourceCodeAvailibility)}`}
                        >
                          {getSourceCodeLabel(project.sourceCodeAvailibility)}
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
                    <div className="grow">
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

                    {/* Tech Stack & Links - Always at bottom */}
                    <div className="mt-auto space-y-4 pt-4">
                      {/* Tech Stack */}
                      <div>
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
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-white backdrop-blur-md transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FaChevronLeft />
                Previous
              </button>

              <div className="flex items-center gap-2">
                {Array.from({ length: data.totalPages }, (_, i) => i + 1).map(
                  (pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`h-10 w-10 rounded-lg transition ${
                        page === pageNum
                          ? "bg-blue-600/50 text-white"
                          : "bg-white/10 text-white/70 hover:bg-white/20"
                      }`}
                    >
                      {pageNum}
                    </button>
                  ),
                )}
              </div>

              <button
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
                className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-white backdrop-blur-md transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
                <FaChevronRight />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/30 bg-white/5 p-12 backdrop-blur-md">
          <p className="text-xl text-white/80">
            {searchQuery || appliedTechStacks.length > 0
              ? "No projects found matching your filters"
              : "No projects to display yet"}
          </p>
          {(searchQuery || appliedTechStacks.length > 0) && (
            <button
              onClick={() => {
                setSearchInput("");
                setSearchQuery("");
                setAppliedTechStacks([]);
                setPendingTechStacks([]);
              }}
              className="mt-4 text-blue-400 hover:text-blue-300"
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
