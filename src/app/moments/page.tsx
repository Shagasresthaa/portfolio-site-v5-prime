"use client";

import { api } from "@/trpc/react";
import { useState, useRef, useEffect } from "react";
import {
  FaTags,
  FaChevronLeft,
  FaChevronRight,
  FaFilter,
  FaTimes,
  FaSearch,
  FaEye,
} from "react-icons/fa";

export default function MomentsPage() {
  const [page, setPage] = useState(1);
  const [appliedTags, setAppliedTags] = useState<string[]>([]);
  const [pendingTags, setPendingTags] = useState<string[]>([]);
  const [isTagFilterOpen, setIsTagFilterOpen] = useState(false);
  const [tagSearchInput, setTagSearchInput] = useState("");
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [cardMinHeight, setCardMinHeight] = useState<number>(0);
  const [selectedMoment, setSelectedMoment] = useState<{
    id: string;
    title: string;
    caption: string | null;
  } | null>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch all available tags
  const { data: allTagsData } = api.gallery.getAllTags.useQuery();
  const allTags = allTagsData ?? [];

  const { data, isLoading } = api.gallery.getAll.useQuery({
    page,
    limit: 12,
    tags: appliedTags.length > 0 ? appliedTags : undefined,
  });

  // Reset to page 1 when tags change
  useEffect(() => {
    setPage(1);
  }, [appliedTags]);

  // Calculate max height of all cards when they first load (desktop only)
  useEffect(() => {
    const calculateHeights = () => {
      // Only calculate on desktop (md breakpoint = 768px)
      if (typeof window !== "undefined" && window.innerWidth >= 768) {
        if (data?.items && data.items.length > 0) {
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
  }, [data?.items]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsTagFilterOpen(false);
      }
    };

    if (isTagFilterOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isTagFilterOpen]);

  // Filter tags based on search input in dropdown
  const filteredAvailableTags = allTags.filter((tag) =>
    tagSearchInput
      ? tag.toLowerCase().includes(tagSearchInput.toLowerCase())
      : true,
  );

  // Toggle tag in pending selection
  const togglePendingTag = (tag: string) => {
    setPendingTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  // Remove tag from pending selection
  const removePendingTag = (tag: string) => {
    setPendingTags((prev) => prev.filter((t) => t !== tag));
  };

  // Apply pending tags to trigger actual search
  const applyTagFilter = () => {
    setAppliedTags(pendingTags);
    setIsTagFilterOpen(false);
  };

  // Clear all tags
  const clearAllTags = () => {
    setPendingTags([]);
    setAppliedTags([]);
    setIsTagFilterOpen(false);
  };

  // Open filter and sync pending with applied
  const openTagFilter = () => {
    setPendingTags(appliedTags);
    setIsTagFilterOpen(true);
  };

  // Extract YouTube video ID from URL
  const getYouTubeId = (url: string) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match?.[2]?.length === 11 ? match[2] : null;
  };

  const toggleExpanded = (itemId: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const isExpanded = (itemId: string) => expandedItems.has(itemId);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-xl text-white">Loading moments...</p>
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
          Moments
        </h1>
        <p
          className="text-xl text-white/80 md:text-2xl"
          style={{ fontFamily: "var(--font-kalam)" }}
        >
          A collection of highlights, demos, and achievements
        </p>
      </div>

      {/* Tag Filter */}
      <div className="mb-8 flex flex-wrap items-center gap-2">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={openTagFilter}
            className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-white backdrop-blur-md transition hover:bg-white/20"
          >
            <FaFilter />
            Filter by Tags
            {appliedTags.length > 0 && (
              <span className="rounded-full bg-blue-600/70 px-2 py-0.5 text-xs">
                {appliedTags.length}
              </span>
            )}
          </button>

          {/* Tag Filter Dropdown */}
          {isTagFilterOpen && (
            <div className="absolute top-full left-0 z-50 mt-2 w-80 rounded-2xl border border-white/20 bg-white/5 shadow-xl backdrop-blur-md">
              {/* Header with close button */}
              <div className="flex items-center justify-between border-b border-white/20 px-4 py-3">
                <span className="text-sm font-semibold text-white">
                  Select Tags
                </span>
                <button
                  onClick={() => setIsTagFilterOpen(false)}
                  className="text-white/70 transition hover:text-white"
                  aria-label="Close"
                >
                  <FaTimes />
                </button>
              </div>

              {/* Selected tags area */}
              {pendingTags.length > 0 && (
                <div className="border-b border-white/20 p-3">
                  <div className="flex flex-wrap gap-2">
                    {pendingTags.map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center gap-1 rounded-full bg-blue-600/50 px-3 py-1 text-xs text-white"
                      >
                        {tag}
                        <button
                          onClick={() => removePendingTag(tag)}
                          className="transition hover:text-red-300"
                          aria-label={`Remove ${tag}`}
                        >
                          <FaTimes className="text-xs" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Search tags */}
              <div className="border-b border-white/20 p-3">
                <div className="relative">
                  <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-sm text-white/50" />
                  <input
                    type="text"
                    value={tagSearchInput}
                    onChange={(e) => setTagSearchInput(e.target.value)}
                    placeholder="Search tags..."
                    className="w-full rounded-lg border border-white/30 bg-white/10 py-2 pr-3 pl-9 text-sm text-white placeholder-white/50 backdrop-blur-md focus:border-blue-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Tag list */}
              <div className="max-h-135 overflow-y-auto p-2">
                {filteredAvailableTags.filter(
                  (tag) => !pendingTags.includes(tag),
                ).length > 0 ? (
                  filteredAvailableTags
                    .filter((tag) => !pendingTags.includes(tag))
                    .map((tag) => (
                      <button
                        key={tag}
                        onClick={() => togglePendingTag(tag)}
                        className="w-full rounded-lg px-4 py-2 text-left text-sm text-white transition hover:bg-white/10"
                      >
                        {tag}
                      </button>
                    ))
                ) : (
                  <p className="px-3 py-4 text-center text-sm text-white/50">
                    {pendingTags.length > 0
                      ? "All tags selected"
                      : "No tags found"}
                  </p>
                )}
              </div>

              {/* Footer with Apply and Clear buttons */}
              <div className="space-y-2 border-t border-white/20 p-3">
                <button
                  onClick={applyTagFilter}
                  className="w-full rounded-lg bg-blue-600/50 px-4 py-2 text-sm text-white transition hover:bg-blue-600/70"
                >
                  Apply Filters{" "}
                  {pendingTags.length > 0 && `(${pendingTags.length})`}
                </button>
                {pendingTags.length > 0 && (
                  <button
                    onClick={() => setPendingTags([])}
                    className="w-full rounded-lg bg-white/10 px-4 py-2 text-sm text-white/70 transition hover:bg-white/20"
                  >
                    Clear Selection
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Applied Tag Chips */}
        {appliedTags.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-2 rounded-full bg-blue-600/50 px-3 py-1 text-sm text-white"
          >
            {tag}
            <button
              onClick={() => {
                setAppliedTags((prev) => prev.filter((t) => t !== tag));
              }}
              className="transition hover:text-red-300"
              aria-label={`Remove ${tag}`}
            >
              <FaTimes className="text-xs" />
            </button>
          </span>
        ))}
      </div>

      {/* Grid Layout */}
      {data?.items && data.items.length > 0 ? (
        <>
          <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data.items.map((item) => (
              <div
                key={item.id}
                ref={(el) => {
                  if (el) cardRefs.current.set(item.id, el);
                }}
                style={
                  cardMinHeight > 0
                    ? { minHeight: `${cardMinHeight}px` }
                    : undefined
                }
                className="flex flex-col rounded-2xl border border-white/20 bg-white/5 backdrop-blur-md transition-all duration-300 hover:bg-white/10"
              >
                {/* Media - Fixed aspect ratio container */}
                <div
                  className={`relative aspect-video w-full overflow-hidden rounded-t-2xl bg-black/20 ${item.mediaType === "IMAGE" ? "group cursor-pointer" : ""}`}
                  onClick={() => {
                    if (item.mediaType === "IMAGE") {
                      setSelectedMoment({
                        id: item.id,
                        title: item.title,
                        caption: item.caption,
                      });
                    }
                  }}
                >
                  {item.mediaType === "IMAGE" && item.imageType ? (
                    <>
                      <img
                        src={`/api/gallery/${item.id}/image`}
                        alt={item.title}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {/* Desktop hover overlay */}
                      <div className="absolute inset-0 hidden items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/30 md:flex">
                        <div className="flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-gray-800 opacity-0 shadow-lg transition-all duration-300 group-hover:opacity-100">
                          <FaEye className="h-4 w-4" />
                          <span className="text-sm font-medium">View</span>
                        </div>
                      </div>
                      {/* Mobile view button - always visible */}
                      <div className="absolute top-2 right-2 md:hidden">
                        <div className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-gray-800 shadow-lg">
                          <FaEye className="h-3.5 w-3.5" />
                          <span className="text-xs font-medium">View</span>
                        </div>
                      </div>
                    </>
                  ) : item.mediaType === "VIDEO" && item.videoUrl ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${getYouTubeId(item.videoUrl)}`}
                      title={item.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 h-full w-full"
                    />
                  ) : null}
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-4">
                  {/* Title and Description - grows to fill space */}
                  <div className="grow">
                    <h2
                      className="mb-2 text-xl font-bold text-white"
                      style={{ fontFamily: "var(--font-salsa)" }}
                    >
                      {item.title}
                    </h2>

                    {item.description && (
                      <div className="mb-3">
                        <p
                          className={`text-white/80 ${
                            !isExpanded(item.id) &&
                            item.description.length > 150
                              ? "line-clamp-3"
                              : ""
                          }`}
                          style={{ fontFamily: "var(--font-kalam)" }}
                        >
                          {item.description}
                        </p>
                        {item.description.length > 150 && (
                          <button
                            onClick={() => toggleExpanded(item.id)}
                            className="mt-1 text-sm text-blue-400 transition hover:text-blue-300"
                          >
                            {isExpanded(item.id) ? "Read less" : "Read more"}
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Caption and Tags - Always at bottom */}
                  <div className="mt-auto space-y-3 pt-3">
                    {item.caption && (
                      <p className="text-sm text-white/60 italic">
                        "{item.caption}"
                      </p>
                    )}

                    {/* Tags */}
                    {item.tags && (
                      <div className="flex flex-wrap gap-2">
                        {item.tags.split(",").map((tag, idx) => (
                          <span
                            key={idx}
                            className="rounded-full bg-white/10 px-2 py-1 text-xs text-white"
                          >
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
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
            {appliedTags.length > 0
              ? "No moments found with selected tags"
              : "No moments yet"}
          </p>
          {appliedTags.length > 0 && (
            <button
              onClick={() => {
                setAppliedTags([]);
                setPendingTags([]);
              }}
              className="mt-4 text-blue-400 hover:text-blue-300"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Image Modal */}
      {selectedMoment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedMoment(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-4xl overflow-hidden rounded-2xl bg-white/10 backdrop-blur-md"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedMoment(null)}
              className="absolute top-4 right-4 z-10 rounded-full bg-black/50 p-2 text-white transition hover:bg-black/70"
              aria-label="Close"
            >
              <FaTimes className="h-6 w-6" />
            </button>

            {/* Image */}
            <img
              src={`/api/gallery/${selectedMoment.id}/image`}
              alt={selectedMoment.title}
              className="max-h-[70vh] w-full object-contain"
            />

            {/* Caption */}
            {selectedMoment.caption && (
              <div className="border-t border-white/20 bg-black/30 p-4 text-center">
                <p
                  className="text-sm text-white/80 italic"
                  style={{ fontFamily: "var(--font-kalam)" }}
                >
                  "{selectedMoment.caption}"
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
