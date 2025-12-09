"use client";

import { useState } from "react";
import { MediaType, type GalleryItem } from "@prisma/client";

interface MomentFormProps {
  initialData?: GalleryItem;
  onSubmit: (data: MomentFormData) => void;
  isSubmitting: boolean;
}

export interface MomentFormData {
  title: string;
  description?: string;
  caption?: string;
  mediaType: MediaType;
  image?: string;
  imageType?: string;
  videoUrl?: string;
  tags: string;
}

export function MomentForm({
  initialData,
  onSubmit,
  isSubmitting,
}: MomentFormProps) {
  const [formData, setFormData] = useState<MomentFormData>({
    title: initialData?.title ?? "",
    description: initialData?.description ?? "",
    caption: initialData?.caption ?? "",
    mediaType: initialData?.mediaType ?? MediaType.IMAGE,
    videoUrl: initialData?.videoUrl ?? "",
    tags: initialData?.tags ?? "",
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Only send fields relevant to the media type
    const submitData: MomentFormData = {
      title: formData.title,
      description: formData.description || undefined,
      caption: formData.caption || undefined,
      mediaType: formData.mediaType,
      tags: formData.tags,
    };

    if (formData.mediaType === MediaType.IMAGE) {
      // Only include image fields for IMAGE type
      submitData.image = formData.image;
      submitData.imageType = formData.imageType;
    } else {
      // Only include videoUrl for VIDEO type
      submitData.videoUrl = formData.videoUrl || undefined;
    }

    onSubmit(submitData);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setFormData((prev) => ({
        ...prev,
        image: base64.split(",")[1]!,
        imageType: file.type,
      }));
      setImagePreview(base64);
    };
    reader.readAsDataURL(file);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-lg border border-white/20 bg-white/5 p-8 shadow-xl backdrop-blur-md"
    >
      {/* Title */}
      <div>
        <label className="mb-2 block font-semibold text-white">Title *</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="w-full rounded border border-white/30 bg-white/10 p-3 text-white placeholder-white/50 focus:border-blue-400 focus:outline-none"
        />
      </div>

      {/* Media Type */}
      <div>
        <label className="mb-2 block font-semibold text-white">
          Media Type *
        </label>
        <select
          name="mediaType"
          value={formData.mediaType}
          onChange={handleChange}
          required
          className="w-full rounded border border-white/30 bg-white/10 p-3 text-white focus:border-blue-400 focus:outline-none"
        >
          <option value={MediaType.IMAGE} className="bg-gray-800">
            Image
          </option>
          <option value={MediaType.VIDEO} className="bg-gray-800">
            Video (YouTube)
          </option>
        </select>
      </div>

      {/* Conditional: Image Upload */}
      {formData.mediaType === MediaType.IMAGE && (
        <div>
          <label className="mb-2 block font-semibold text-white">Image *</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full rounded border border-white/30 bg-white/10 p-3 text-white file:mr-4 file:rounded file:border-0 file:bg-blue-600/50 file:px-4 file:py-2 file:text-white hover:file:bg-blue-600/70"
          />
          {imagePreview && (
            <div className="mt-4">
              <img
                src={imagePreview}
                alt="Preview"
                className="h-48 w-auto rounded border border-white/30 object-cover"
              />
            </div>
          )}
          {initialData?.imageType && !imagePreview && (
            <div className="mt-4">
              <img
                src={`/api/gallery/${initialData.id}/image`}
                alt="Current"
                className="h-48 w-auto rounded border border-white/30 object-cover"
              />
            </div>
          )}
        </div>
      )}

      {/* Conditional: Video URL */}
      {formData.mediaType === MediaType.VIDEO && (
        <div>
          <label className="mb-2 block font-semibold text-white">
            YouTube URL *
          </label>
          <input
            type="url"
            name="videoUrl"
            value={formData.videoUrl}
            onChange={handleChange}
            placeholder="https://www.youtube.com/watch?v=..."
            required
            className="w-full rounded border border-white/30 bg-white/10 p-3 text-white placeholder-white/50 focus:border-blue-400 focus:outline-none"
          />
          <p className="mt-1 text-sm text-white/50">
            Paste the full YouTube URL
          </p>
        </div>
      )}

      {/* Description */}
      <div>
        <label className="mb-2 block font-semibold text-white">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          placeholder="Optional description..."
          className="w-full rounded border border-white/30 bg-white/10 p-3 text-white placeholder-white/50 focus:border-blue-400 focus:outline-none"
        />
      </div>

      {/* Caption */}
      <div>
        <label className="mb-2 block font-semibold text-white">Caption</label>
        <input
          type="text"
          name="caption"
          value={formData.caption}
          onChange={handleChange}
          placeholder="Optional caption..."
          className="w-full rounded border border-white/30 bg-white/10 p-3 text-white placeholder-white/50 focus:border-blue-400 focus:outline-none"
        />
      </div>

      {/* Tags */}
      <div>
        <label className="mb-2 block font-semibold text-white">Tags *</label>
        <input
          type="text"
          name="tags"
          value={formData.tags}
          onChange={handleChange}
          placeholder="demo, cfd, certification"
          required
          className="w-full rounded border border-white/30 bg-white/10 p-3 text-white placeholder-white/50 focus:border-blue-400 focus:outline-none"
        />
        <p className="mt-1 text-sm text-white/50">Comma-separated tags</p>
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-blue-600/50 px-8 py-3 text-white backdrop-blur-md transition hover:bg-blue-600/70 disabled:bg-gray-400/50"
        >
          {isSubmitting
            ? "Saving..."
            : initialData
              ? "Update Moment"
              : "Create Moment"}
        </button>
        <a
          href="/admin/moments"
          className="rounded-lg bg-gray-500/50 px-8 py-3 text-white backdrop-blur-md transition hover:bg-gray-500/70"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
