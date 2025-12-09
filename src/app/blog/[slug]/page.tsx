"use client";

import { api } from "@/trpc/react";
import { use, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { FaCalendar, FaTags } from "react-icons/fa";

export default function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const {
    data: post,
    isLoading,
    refetch,
  } = api.blog.getBySlug.useQuery({ slug });

  const [commentName, setCommentName] = useState("");
  const [commentContent, setCommentContent] = useState("");
  const [postAnonymously, setPostAnonymously] = useState(false);

  const addComment = api.blog.addComment.useMutation({
    onSuccess: () => {
      setCommentName("");
      setCommentContent("");
      setPostAnonymously(false);
      refetch();
    },
  });

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!post) return;

    addComment.mutate({
      postId: post.id,
      name: postAnonymously ? undefined : commentName || undefined,
      content: commentContent,
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-xl text-white">Loading post...</p>
      </div>
    );
  }

  if (!post || !post.published) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-xl text-white">Post not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto min-h-screen px-4 pt-24 pb-12">
      <article className="mx-auto max-w-7xl rounded-2xl border border-white/20 bg-white/5 p-8 shadow-xl backdrop-blur-md">
        {/* Cover Image */}
        {post.imageType && (
          <div className="-mx-8 -mt-8 mb-8 overflow-hidden rounded-t-2xl">
            <img
              src={`/api/blog/posts/${post.id}/cover`}
              alt={post.title}
              className="h-96 w-full object-cover"
            />
          </div>
        )}

        {/* Header */}
        <header className="mb-8">
          <h1
            className="mb-4 text-5xl font-bold text-white md:text-6xl"
            style={{ fontFamily: "var(--font-salsa)" }}
          >
            {post.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap gap-4 text-white/70">
            {post.publishedAt && (
              <div className="flex items-center gap-2">
                <FaCalendar />
                <span>
                  {new Date(post.publishedAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            )}
            {post.tags && (
              <div className="flex items-center gap-2">
                <FaTags />
                <div className="flex flex-wrap gap-2">
                  {post.tags.split(",").map((tag, idx) => (
                    <span
                      key={idx}
                      className="rounded-full bg-white/10 px-3 py-1 text-xs text-white"
                    >
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <div
          className="markdown-content mb-12 max-w-none"
          style={{ fontFamily: "var(--font-kalam)" }}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, inline, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || "");
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={vscDarkPlus}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                  >
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {post.content}
          </ReactMarkdown>
        </div>

        {/* Comments Section */}
        <section className="mt-12 border-t border-white/20 pt-8">
          <h2
            className="mb-6 text-3xl font-bold text-white"
            style={{ fontFamily: "var(--font-salsa)" }}
          >
            Comments ({post.comments.length})
          </h2>

          {/* Comment Form */}
          <form
            onSubmit={handleCommentSubmit}
            className="mb-8 rounded-2xl border border-white/20 bg-white/5 p-6 backdrop-blur-md"
          >
            <div className="mb-4">
              <label className="flex items-center gap-2 text-white">
                <input
                  type="checkbox"
                  checked={postAnonymously}
                  onChange={(e) => setPostAnonymously(e.target.checked)}
                  className="h-4 w-4 rounded"
                />
                Post anonymously
              </label>
            </div>

            {!postAnonymously && (
              <div className="mb-4">
                <input
                  type="text"
                  value={commentName}
                  onChange={(e) => setCommentName(e.target.value)}
                  placeholder="Your name (optional)"
                  className="w-full rounded border border-white/30 bg-white/10 p-3 text-white placeholder-white/50 focus:border-blue-400 focus:outline-none"
                />
              </div>
            )}

            <textarea
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              required
              rows={4}
              placeholder="Write your comment..."
              className="mb-4 w-full rounded border border-white/30 bg-white/10 p-3 text-white placeholder-white/50 focus:border-blue-400 focus:outline-none"
            />

            <button
              type="submit"
              disabled={addComment.isPending}
              className="rounded-lg bg-blue-600/50 px-6 py-2 text-white backdrop-blur-md transition hover:bg-blue-600/70 disabled:bg-gray-400/50"
            >
              {addComment.isPending ? "Posting..." : "Post Comment"}
            </button>
          </form>

          {/* Comments List */}
          <div className="space-y-4">
            {post.comments.length > 0 ? (
              post.comments.map((comment) => (
                <div
                  key={comment.id}
                  className="rounded-2xl border border-white/20 bg-white/5 p-6 backdrop-blur-md"
                >
                  <div className="mb-2">
                    <span className="font-semibold text-white">
                      {comment.name || "Anonymous"}
                    </span>
                    <span className="ml-3 text-sm text-white/50">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p
                    className="text-white/80"
                    style={{ fontFamily: "var(--font-kalam)" }}
                  >
                    {comment.content}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-center text-white/60">
                No comments yet. Be the first to comment!
              </p>
            )}
          </div>
        </section>
      </article>
    </div>
  );
}
