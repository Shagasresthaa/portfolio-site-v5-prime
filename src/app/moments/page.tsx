"use client";

import { api } from "@/trpc/react";
import { useState, useMemo, useRef, useEffect } from "react";
import { FaTags, FaChevronLeft, FaChevronRight } from "react-icons/fa";

export default function MomentsPage() {
  const [page, setPage] = useState(1);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [cardMinHeight, setCardMinHeight] = useState<number>(0);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const { data, isLoading } = api.gallery.getAll.useQuery({ page, limit: 12 });

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

  // Get all unique tags from current page
  const allTags = useMemo(() => {
    if (!data?.items) return [];
    const tagSet = new Set<string>();
    data.items.forEach((item) => {
      if (item.tags) {
        item.tags.split(",").forEach((tag) => tagSet.add(tag.trim()));
      }
    });
    return Array.from(tagSet).sort();
  }, [data?.items]);

  // Filter items by tag (client-side filtering on current page)
  const filteredItems = useMemo(() => {
    if (!data?.items) return [];

    return data.items.filter((item) => {
      const matchesTag = selectedTag
        ? item.tags
            .split(",")
            .map((t) => t.trim())
            .includes(selectedTag)
        : true;

      return matchesTag;
    });
  }, [data?.items, selectedTag]);

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

      {/* Tag Filters */}
      {allTags.length > 0 && (
        <div className="mb-8 flex flex-wrap items-center gap-2">
          <FaTags className="text-white/70" />
          <button
            onClick={() => setSelectedTag(null)}
            className={`rounded-full px-4 py-2 text-sm transition ${
              selectedTag === null
                ? "bg-blue-600/50 text-white"
                : "bg-white/10 text-white/70 hover:bg-white/20"
            }`}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`rounded-full px-4 py-2 text-sm transition ${
                selectedTag === tag
                  ? "bg-blue-600/50 text-white"
                  : "bg-white/10 text-white/70 hover:bg-white/20"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Grid Layout */}
      {filteredItems && filteredItems.length > 0 ? (
        <>
          <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
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
                <div className="relative aspect-video w-full overflow-hidden rounded-t-2xl bg-black/20">
                  {item.mediaType === "IMAGE" && item.imageType ? (
                    <img
                      src={`/api/gallery/${item.id}/image`}
                      alt={item.title}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
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
                <div className="p-4">
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
                          !isExpanded(item.id) && item.description.length > 150
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

                  {item.caption && (
                    <p className="mb-3 text-sm text-white/60 italic">
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
            {selectedTag ? "No moments found with this tag" : "No moments yet"}
          </p>
          {selectedTag && (
            <button
              onClick={() => setSelectedTag(null)}
              className="mt-4 text-blue-400 hover:text-blue-300"
            >
              Clear filter
            </button>
          )}
        </div>
      )}
    </div>
  );
}
