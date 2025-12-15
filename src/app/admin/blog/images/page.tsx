"use client";

import { api } from "@/trpc/react";
import { useState } from "react";
import {
  FaUpload,
  FaCopy,
  FaTrash,
  FaCheck,
  FaArrowLeft,
} from "react-icons/fa";
import Link from "next/link";

export default function BlogImagesPage() {
  const { data: images, isLoading, refetch } = api.blog.getAllImages.useQuery();
  const uploadImage = api.blog.uploadImage.useMutation({
    onSuccess: () => {
      refetch();
      setImagePreview(null);
    },
  });
  const deleteImage = api.blog.deleteImage.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [altText, setAltText] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setImagePreview(base64);

      uploadImage.mutate({
        image: base64.split(",")[1]!,
        imageType: file.type,
        ...(altText && { altText }),
      });

      setAltText("");
    };
    reader.readAsDataURL(file);
  };

  const copyImageUrl = (id: string) => {
    const fullUrl = `${window.location.origin}/api/blog/images/${id}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this image?")) {
      deleteImage.mutate({ id });
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-xl text-white">Loading images...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto min-h-screen px-4 pt-24 pb-12">
      <Link
        href="/admin/blog"
        className="mb-6 inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-white backdrop-blur-md transition hover:bg-white/20"
      >
        <FaArrowLeft />
        <span>Back to Blog Admin</span>
      </Link>

      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold text-white">Blog Images</h1>
        <p className="text-white/70">
          Upload and manage images for your blog posts
        </p>
      </div>

      {/* Upload Section */}
      <div className="mb-12 rounded-2xl border border-white/20 bg-white/5 p-6 backdrop-blur-md">
        <h2 className="mb-4 text-2xl font-bold text-white">Upload New Image</h2>
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-white">
              Alt Text (Optional)
            </label>
            <input
              type="text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Describe the image..."
              className="w-full rounded border border-white/30 bg-white/10 p-3 text-white placeholder-white/50 focus:border-blue-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-white/30 bg-white/5 p-8 text-white transition hover:border-blue-400 hover:bg-white/10">
              <FaUpload className="h-6 w-6" />
              <span className="text-lg font-semibold">
                {uploadImage.isPending
                  ? "Uploading..."
                  : "Click to Upload Image"}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadImage.isPending}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Images Grid */}
      {images && images.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {images.map((image) => (
            <div
              key={image.id}
              className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/5 backdrop-blur-md transition-all hover:bg-white/10"
            >
              {/* Image */}
              <div className="relative h-64 w-full overflow-hidden bg-white/5">
                <img
                  src={`/api/blog/images/${image.id}`}
                  alt={image.altText || "Blog image"}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Info */}
              <div className="p-4">
                {image.altText && (
                  <p className="mb-2 text-sm text-white/70">{image.altText}</p>
                )}
                <p className="mb-4 text-xs text-white/50">
                  {new Date(image.createdAt).toLocaleDateString()}
                </p>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => copyImageUrl(image.id)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600/50 px-4 py-2 text-sm text-white transition hover:bg-blue-600/70"
                  >
                    {copiedId === image.id ? (
                      <>
                        <FaCheck /> Copied!
                      </>
                    ) : (
                      <>
                        <FaCopy /> Copy URL
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(image.id)}
                    disabled={deleteImage.isPending}
                    className="flex items-center gap-2 rounded-lg bg-red-500/50 px-4 py-2 text-sm text-white transition hover:bg-red-500/70 disabled:opacity-50"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/30 bg-white/5 p-12 backdrop-blur-md">
          <p className="text-xl text-white/80">No images uploaded yet</p>
        </div>
      )}
    </div>
  );
}
