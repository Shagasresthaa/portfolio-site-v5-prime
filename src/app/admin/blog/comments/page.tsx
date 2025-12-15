"use client";

import { api } from "@/trpc/react";
import { FaTrash, FaArrowLeft } from "react-icons/fa";
import Link from "next/link";

export default function AdminCommentsPage() {
  const { data: posts, isLoading, refetch } = api.blog.getAllPosts.useQuery();
  const deleteComment = api.blog.deleteComment.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleDelete = (commentId: string, postTitle: string) => {
    if (confirm(`Delete comment from "${postTitle}"?`)) {
      deleteComment.mutate({ id: commentId });
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-xl text-white">Loading comments...</p>
      </div>
    );
  }

  // Get all posts with comments
  const postsWithComments =
    posts?.filter((post) => post._count.comments > 0) || [];

  return (
    <div className="container mx-auto min-h-screen px-4 pt-24 pb-12">
      <Link
        href="/admin/blog"
        className="mb-6 inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-white backdrop-blur-md transition hover:bg-white/20"
      >
        <FaArrowLeft />
        <span>Back to Blog Admin</span>
      </Link>

      <h1 className="mb-8 text-4xl font-bold text-white">Manage Comments</h1>

      {postsWithComments.length > 0 ? (
        <div className="space-y-8">
          {postsWithComments.map((post) => (
            <div
              key={post.id}
              className="rounded-2xl border border-white/20 bg-white/5 p-6 backdrop-blur-md"
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {post.title}
                  </h2>
                  <Link
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    className="text-sm text-blue-400 hover:text-blue-300"
                  >
                    View Post →
                  </Link>
                </div>
                <span className="rounded-full bg-blue-500/30 px-3 py-1 text-sm text-white">
                  {post._count.comments} comments
                </span>
              </div>

              {/* We need to fetch full post data with comments */}
              <CommentsForPost
                postId={post.id}
                onDelete={handleDelete}
                postTitle={post.title}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/30 bg-white/5 p-12 backdrop-blur-md">
          <p className="text-xl text-white/80">No comments yet</p>
        </div>
      )}
    </div>
  );
}

// Helper component to fetch and display comments for a post
function CommentsForPost({
  postId,
  onDelete,
  postTitle,
}: {
  postId: string;
  onDelete: (id: string, title: string) => void;
  postTitle: string;
}) {
  const { data: post } = api.blog.getByIdWithComments.useQuery({ id: postId });

  if (!post?.comments) return null;

  return (
    <div className="space-y-3">
      {post.comments.map((comment) => (
        <div
          key={comment.id}
          className="flex items-start justify-between rounded-lg border border-white/20 bg-white/10 p-4"
        >
          <div className="flex-1">
            <div className="mb-1 flex items-center gap-3">
              <span className="font-semibold text-white">
                {comment.name || "Anonymous"}
              </span>
              <span className="text-sm text-white/50">
                {new Date(comment.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="text-white/80">{comment.content}</p>
          </div>
          <button
            onClick={() => onDelete(comment.id, postTitle)}
            className="ml-4 rounded-lg bg-red-500/30 p-2 text-white transition hover:bg-red-500/50"
          >
            <FaTrash />
          </button>
        </div>
      ))}
    </div>
  );
}
