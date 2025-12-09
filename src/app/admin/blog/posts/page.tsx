"use client";

import { api } from "@/trpc/react";
import Link from "next/link";
import { FaEdit, FaTrash, FaPlus, FaEye, FaEyeSlash } from "react-icons/fa";

export default function AdminBlogPostsPage() {
  const { data: posts, isLoading } = api.blog.getAllPosts.useQuery();
  const deletePost = api.blog.delete.useMutation({
    onSuccess: () => {
      window.location.reload();
    },
  });

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      deletePost.mutate({ id });
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-xl text-white">Loading posts...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto min-h-screen px-4 pt-24 pb-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-bold text-white">Manage Blog Posts</h1>
        <Link
          href="/admin/blog/posts/new"
          className="group flex items-center gap-2 rounded-lg bg-blue-600/30 px-6 py-3 text-white backdrop-blur-md transition hover:bg-blue-600/50"
        >
          <FaPlus className="transition-transform group-hover:rotate-90" />
          New Post
        </Link>
      </div>

      {posts && posts.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-white/20 bg-white/5 backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20 bg-white/10">
                  <th className="p-4 text-left text-sm font-semibold text-white">
                    Title
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-white">
                    Status
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-white">
                    Comments
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-white">
                    Updated
                  </th>
                  <th className="p-4 text-center text-sm font-semibold text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post, index) => (
                  <tr
                    key={post.id}
                    className={`border-b border-white/10 transition-colors hover:bg-white/10 ${
                      index % 2 === 0 ? "bg-white/5" : ""
                    }`}
                  >
                    <td className="p-4">
                      <div>
                        <p className="font-semibold text-white">{post.title}</p>
                        <p className="text-sm text-white/60">/{post.slug}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {post.published ? (
                          <>
                            <FaEye className="text-green-400" />
                            <span className="rounded-full bg-green-500/30 px-3 py-1 text-xs text-white">
                              Published
                            </span>
                          </>
                        ) : (
                          <>
                            <FaEyeSlash className="text-yellow-400" />
                            <span className="rounded-full bg-yellow-500/30 px-3 py-1 text-xs text-white">
                              Draft
                            </span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-white/80">
                      {post._count.comments}
                    </td>
                    <td className="p-4 text-white/80">
                      {new Date(post.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <Link
                          href={`/admin/blog/posts/edit/${post.id}`}
                          className="flex items-center gap-1 rounded-lg bg-yellow-500/30 px-3 py-1 text-white backdrop-blur-sm transition hover:bg-yellow-500/50"
                        >
                          <FaEdit />
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(post.id, post.title)}
                          className="flex items-center gap-1 rounded-lg bg-red-500/30 px-3 py-1 text-white backdrop-blur-sm transition hover:bg-red-500/50"
                          disabled={deletePost.isPending}
                        >
                          <FaTrash />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/30 bg-white/5 p-12 backdrop-blur-md">
          <p className="text-xl text-white/80">No blog posts yet</p>
        </div>
      )}
    </div>
  );
}
