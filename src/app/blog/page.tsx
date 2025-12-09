"use client";

import { api } from "@/trpc/react";
import Link from "next/link";
import { FaCalendar, FaTags } from "react-icons/fa";

export default function BlogPage() {
  const { data: posts, isLoading } = api.blog.getPublishedPosts.useQuery();

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

      {/* Posts List */}
      {posts && posts.length > 0 ? (
        <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
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
              <div className="flex flex-col p-6">
                {/* Title */}
                <h2
                  className="mb-3 text-2xl font-bold text-white transition-colors group-hover:text-blue-400"
                  style={{ fontFamily: "var(--font-salsa)" }}
                >
                  {post.title}
                </h2>

                {/* Excerpt */}
                <p
                  className="mb-4 flex-grow text-white/80"
                  style={{ fontFamily: "var(--font-kalam)" }}
                >
                  {post.excerpt}
                </p>

                {/* Meta */}
                <div className="space-y-2 text-sm text-white/60">
                  {post.publishedAt && (
                    <div className="flex items-center gap-2">
                      <FaCalendar className="flex-shrink-0" />
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
                      <FaTags className="mt-1 flex-shrink-0" />
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
          <p className="text-xl text-white/80">No posts published yet</p>
        </div>
      )}
    </div>
  );
}
