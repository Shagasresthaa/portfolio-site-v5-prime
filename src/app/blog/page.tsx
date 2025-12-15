"use client";

import { api } from "@/trpc/react";
import Link from "next/link";
import { useState, useMemo, useRef, useEffect } from "react";
import {
  FaCalendar,
  FaTags,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaChevronDown,
  FaChevronUp,
  FaArrowRight,
  FaTimes,
  FaFilter,
} from "react-icons/fa";

export default function BlogPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState(""); // What user is typing
  const [searchQuery, setSearchQuery] = useState(""); // What we actually search for
  const [appliedTags, setAppliedTags] = useState<string[]>([]); // Tags actually being searched
  const [pendingTags, setPendingTags] = useState<string[]>([]); // Tags selected but not applied yet
  const [isTagFilterOpen, setIsTagFilterOpen] = useState(false);
  const [tagSearchInput, setTagSearchInput] = useState("");
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());
  const [truncatedPosts, setTruncatedPosts] = useState<Set<string>>(new Set());
  const [cardMinHeight, setCardMinHeight] = useState<number>(0);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const excerptRefs = useRef<Map<string, HTMLParagraphElement>>(new Map());
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch all available tags
  const { data: allTagsData } = api.blog.getAllTags.useQuery();
  const allTags = allTagsData ?? [];

  const { data, isLoading } = api.blog.getPublishedPosts.useQuery({
    page,
    limit: 12,
    search: searchQuery || undefined,
    tags: appliedTags.length > 0 ? appliedTags : undefined,
  });

  // Reset to page 1 when search or applied tags change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, appliedTags]);

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

  // Filter tags based on search input in dropdown
  const filteredAvailableTags = useMemo(() => {
    if (!tagSearchInput) return allTags;
    return allTags.filter((tag) =>
      tag.toLowerCase().includes(tagSearchInput.toLowerCase()),
    );
  }, [allTags, tagSearchInput]);

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
    setPendingTags(appliedTags); // Start with currently applied tags
    setIsTagFilterOpen(true);
  };

  const toggleExpanded = (postId: string) => {
    setExpandedPosts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const isExpanded = (postId: string) => expandedPosts.has(postId);

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

  // Calculate max height of all cards when they first load (desktop only)
  useEffect(() => {
    const calculateHeights = () => {
      // Only calculate on desktop (md breakpoint = 768px)
      if (typeof window !== "undefined" && window.innerWidth >= 768) {
        if (data?.posts && data.posts.length > 0) {
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
  }, [data?.posts]);

  // Detect which excerpts are actually truncated
  useEffect(() => {
    if (data?.posts) {
      setTimeout(() => {
        const newTruncatedSet = new Set<string>();
        excerptRefs.current.forEach((element, postId) => {
          if (element) {
            // Get computed line-height
            const lineHeight = parseFloat(
              window.getComputedStyle(element).lineHeight,
            );
            // Calculate max height for 3 lines
            const maxHeight = lineHeight * 3;
            // Check natural scroll height against max
            if (element.scrollHeight > maxHeight + 5) {
              // +5px buffer for rounding
              newTruncatedSet.add(postId);
            }
          }
        });
        setTruncatedPosts(newTruncatedSet);
      }, 100);
    }
  }, [data?.posts]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-xl text-white">Loading posts...</p>
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
          Blog
        </h1>
        <p
          className="text-xl text-white/80 md:text-2xl"
          style={{ fontFamily: "var(--font-kalam)" }}
        >
          Documentation is a love letter to your future self! - Damian Conway
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
              placeholder="Search by title (min. 2 characters)..."
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

        {/* Tag Filter Button and Selected Tags */}
        <div className="flex flex-wrap items-center gap-2">
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

                {/* Tag list - vertical scrollable list, hide already selected tags */}
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

          {/* Selected Tags Chips */}
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

        {/* Results count */}
        {searchQuery && (
          <p className="text-sm text-white/60">
            Found {data?.total ?? 0} post{data?.total !== 1 ? "s" : ""}
          </p>
        )}
        {!searchQuery && appliedTags.length > 0 && (
          <p className="text-sm text-white/60">
            Found {data?.total ?? 0} post{data?.total !== 1 ? "s" : ""} with
            selected tags
          </p>
        )}
      </div>

      {/* Posts List */}
      {data?.posts && data.posts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-2 lg:grid-cols-3">
            {data.posts.map((post) => (
              <div
                key={post.id}
                ref={(el) => {
                  if (el) cardRefs.current.set(post.id, el);
                }}
                style={
                  cardMinHeight > 0
                    ? { minHeight: `${cardMinHeight}px` }
                    : undefined
                }
                className="group flex flex-col overflow-hidden rounded-2xl border border-white/20 bg-white/5 backdrop-blur-md transition-all duration-300 hover:bg-white/10"
              >
                {/* Cover Image */}
                {post.imageType && (
                  <Link href={`/blog/${post.slug}`} className="block">
                    <div className="relative h-48 w-full overflow-hidden bg-white/5">
                      <img
                        src={`/api/blog/posts/${post.id}/cover`}
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  </Link>
                )}

                {/* Content */}
                <div className="flex flex-1 flex-col p-6">
                  {/* Title */}
                  <Link href={`/blog/${post.slug}`}>
                    <h2
                      className="mb-3 text-2xl font-bold text-white transition-colors hover:text-blue-400"
                      style={{ fontFamily: "var(--font-salsa)" }}
                    >
                      {post.title}
                    </h2>
                  </Link>

                  {/* Excerpt */}
                  <div className="mb-4 grow">
                    <p
                      ref={(el) => {
                        if (el) excerptRefs.current.set(post.id, el);
                      }}
                      className={`text-white/80 ${
                        truncatedPosts.has(post.id) && !isExpanded(post.id)
                          ? "line-clamp-3"
                          : ""
                      }`}
                      style={{ fontFamily: "var(--font-kalam)" }}
                    >
                      {post.excerpt}
                    </p>
                    {truncatedPosts.has(post.id) && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          toggleExpanded(post.id);
                        }}
                        className="mt-2 flex items-center gap-1 text-sm text-blue-400 transition hover:text-blue-300"
                      >
                        {isExpanded(post.id) ? (
                          <>
                            <FaChevronUp /> Read less
                          </>
                        ) : (
                          <>
                            <FaChevronDown /> Read more
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Meta */}
                  <div className="space-y-2 text-sm text-white/60">
                    {post.publishedAt && (
                      <div className="flex items-center gap-2">
                        <FaCalendar className="shrink-0" />
                        <span>
                          {new Date(post.publishedAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}
                        </span>
                      </div>
                    )}
                    {post.tags && (
                      <div className="flex items-start gap-2">
                        <FaTags className="mt-1 shrink-0" />
                        <div className="flex flex-wrap gap-2">
                          {post.tags.split(",").map((tag, idx) => (
                            <span
                              key={idx}
                              className="rounded-full bg-white/10 px-2 py-1 text-xs text-white"
                            >
                              {tag.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Read Post Button */}
                  <div className="mt-auto pt-6">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="flex items-center justify-center gap-2 rounded-lg bg-blue-600/50 px-4 py-2 text-sm text-white transition hover:bg-blue-600/70"
                    >
                      Read Post
                      <FaArrowRight />
                    </Link>
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
            {searchQuery || appliedTags.length > 0
              ? "No posts found matching your filters"
              : "No posts published yet"}
          </p>
          {(searchQuery || appliedTags.length > 0) && (
            <button
              onClick={() => {
                setSearchInput("");
                setSearchQuery("");
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
    </div>
  );
}
