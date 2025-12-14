"use client";

import { api } from "@/trpc/react";
import Link from "next/link";
import { useState, useMemo } from "react";
import { FaCalendar, FaTags, FaSearch } from "react-icons/fa";

export default function BlogPage() {
  const { data: posts, isLoading } = api.blog.getPublishedPosts.useQuery();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Get all unique tags
  const allTags = useMemo(() => {
    if (!posts) return [];
    const tagSet = new Set<string>();
    posts.forEach((post) => {
      if (post.tags) {
        post.tags.split(",").forEach((tag) => tagSet.add(tag.trim()));
      }
    });
    return Array.from(tagSet).sort();
  }, [posts]);

  // Filter posts by search query and selected tag
  const filteredPosts = useMemo(() => {
    if (!posts) return [];

    return posts.filter((post) => {
      const matchesSearch = searchQuery
        ? post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
        : true;

      const matchesTag = selectedTag
        ? post.tags
            .split(",")
            .map((t) => t.trim())
            .includes(selectedTag)
        : true;

      return matchesSearch && matchesTag;
    });
  }, [posts, searchQuery, selectedTag]);

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
          Thoughts, learnings, and occasional rants
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <FaSearch className="absolute top-1/2 left-4 -translate-y-1/2 text-white/50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search posts by title or content..."
            className="w-full rounded-lg border border-white/30 bg-white/10 py-3 pr-4 pl-12 text-white placeholder-white/50 backdrop-blur-md focus:border-blue-400 focus:outline-none"
          />
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
        {(searchQuery || selectedTag) && (
          <p className="text-sm text-white/60">
            Found {filteredPosts.length} post
            {filteredPosts.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* Posts List */}
      {filteredPosts && filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-white/20 bg-white/5 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-white/10"
            >
              {/* Cover Image */}
              {post.imageType && (
                <div className="relative h-48 w-full overflow-hidden bg-white/5">
                  <img
                    src={`/api/blog/posts/${post.id}/cover`}
                    alt={post.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              )}

              {/* Content */}
              <div className="flex flex-1 flex-col p-6">
                {/* Title */}
                <h2
                  className="mb-3 text-2xl font-bold text-white transition-colors group-hover:text-blue-400"
                  style={{ fontFamily: "var(--font-salsa)" }}
                >
                  {post.title}
                </h2>

                {/* Excerpt */}
                <p
                  className="grow text-white/80"
                  style={{ fontFamily: "var(--font-kalam)" }}
                >
                  {post.excerpt}
                </p>

                {/* Meta - Always at bottom */}
                <div className="mt-auto space-y-2 pt-4 text-sm text-white/60">
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
              </div>
            </Link>
          ))}
        </div>
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
