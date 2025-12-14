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
} from "react-icons/fa";

export default function BlogPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState(""); // What user is typing
  const [searchQuery, setSearchQuery] = useState(""); // What we actually search for
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());
  const [cardMinHeight, setCardMinHeight] = useState<number>(0);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const { data, isLoading } = api.blog.getPublishedPosts.useQuery({
    page,
    limit: 12,
    search: searchQuery || undefined,
  });

  // Reset to page 1 when search changes
  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

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

  // Get all unique tags
  const allTags = useMemo(() => {
    if (!data?.posts) return [];
    const tagSet = new Set<string>();
    data.posts.forEach((post) => {
      if (post.tags) {
        post.tags.split(",").forEach((tag) => tagSet.add(tag.trim()));
      }
    });
    return Array.from(tagSet).sort();
  }, [data?.posts]);

  // Filter posts by selected tag (client-side on current page results)
  // Search is now handled server-side
  const filteredPosts = useMemo(() => {
    if (!data?.posts) return [];

    return data.posts.filter((post) => {
      const matchesTag = selectedTag
        ? post.tags
            .split(",")
            .map((t) => t.trim())
            .includes(selectedTag)
        : true;

      return matchesTag;
    });
  }, [data?.posts, selectedTag]);

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

  // Calculate max height of all cards when they first load (desktop only)
  useEffect(() => {
    const calculateHeights = () => {
      // Only calculate on desktop (md breakpoint = 768px)
      if (typeof window !== "undefined" && window.innerWidth >= 768) {
        if (filteredPosts && filteredPosts.length > 0) {
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
  }, [filteredPosts]);

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
          Documentation is a love letter to your future self. - Damian Conway
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

        {/* Tag Filters */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-white/70">
              Filter by tag:
            </span>
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

        {/* Results count */}
        {searchQuery && (
          <p className="text-sm text-white/60">
            Found {data?.total ?? 0} post{data?.total !== 1 ? "s" : ""}{" "}
            {selectedTag ? `with tag "${selectedTag}"` : ""}
          </p>
        )}
        {!searchQuery && selectedTag && (
          <p className="text-sm text-white/60">
            Found {filteredPosts.length} post
            {filteredPosts.length !== 1 ? "s" : ""} with tag "{selectedTag}" on
            this page
          </p>
        )}
      </div>

      {/* Posts List */}
      {filteredPosts && filteredPosts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map((post) => (
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
                      className={`text-white/80 ${
                        !isExpanded(post.id) && post.excerpt.length > 150
                          ? "line-clamp-3"
                          : ""
                      }`}
                      style={{ fontFamily: "var(--font-kalam)" }}
                    >
                      {post.excerpt}
                    </p>
                    {post.excerpt.length > 150 && (
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
            {searchQuery || selectedTag
              ? "No posts found matching your filters"
              : "No posts published yet"}
          </p>
          {(searchQuery || selectedTag) && (
            <button
              onClick={() => {
                setSearchInput("");
                setSearchQuery("");
                setSelectedTag(null);
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
