"use client";

import { api } from "@/trpc/react";
import Link from "next/link";
import { useState } from "react";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaImage,
  FaVideo,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

export default function AdminMomentsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = api.gallery.getAll.useQuery({ page, limit: 12 });

  const deleteItem = api.gallery.delete.useMutation({
    onSuccess: () => {
      window.location.reload();
    },
  });

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteItem.mutate({ id });
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-xl text-white">Loading moments...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto min-h-screen px-4 pt-24 pb-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-bold text-white">Manage Moments</h1>
        <Link
          href="/admin/moments/new"
          className="group flex items-center gap-2 rounded-lg bg-blue-600/30 px-6 py-3 text-white backdrop-blur-md transition hover:bg-blue-600/50"
        >
          <FaPlus className="transition-transform group-hover:rotate-90" />
          New Moment
        </Link>
      </div>

      {data && data.items.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data.items.map((item) => (
              <div
                key={item.id}
                className="group overflow-hidden rounded-2xl border border-white/20 bg-white/5 backdrop-blur-md transition-all hover:bg-white/10"
              >
                {/* Media Preview */}
                <div className="relative h-48 w-full bg-white/5">
                  {item.mediaType === "IMAGE" ? (
                    item.imageType ? (
                      <img
                        src={`/api/gallery/${item.id}/image`}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <FaImage className="h-12 w-12 text-white/30" />
                      </div>
                    )
                  ) : (
                    <div className="flex h-full items-center justify-center bg-red-500/20">
                      <FaVideo className="h-12 w-12 text-white/50" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h2 className="mb-2 text-xl font-bold text-white">
                    {item.title}
                  </h2>
                  {item.description && (
                    <p className="mb-3 line-clamp-2 text-sm text-white/70">
                      {item.description}
                    </p>
                  )}

                  {/* Tags */}
                  {item.tags && (
                    <div className="mb-3 flex flex-wrap gap-2">
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

                  {/* Meta */}
                  <p className="mb-4 text-xs text-white/50">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/moments/edit/${item.id}`}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-yellow-500/30 px-3 py-2 text-sm text-white transition hover:bg-yellow-500/50"
                    >
                      <FaEdit />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(item.id, item.title)}
                      disabled={deleteItem.isPending}
                      className="flex items-center gap-2 rounded-lg bg-red-500/30 px-3 py-2 text-sm text-white transition hover:bg-red-500/50 disabled:opacity-50"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
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
          <p className="text-xl text-white/80">No moments yet</p>
        </div>
      )}
    </div>
  );
}
