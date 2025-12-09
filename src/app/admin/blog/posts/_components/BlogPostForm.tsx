"use client";

import { useState } from "react";
import { type BlogPost } from "@prisma/client";

interface BlogPostFormProps {
  initialData?: BlogPost;
  onSubmit: (data: BlogPostFormData) => void;
  isSubmitting: boolean;
}

export interface BlogPostFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  imageType?: string;
  published: boolean;
  publishedAt?: Date | null;
  tags: string;
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
}

export function BlogPostForm({
  initialData,
  onSubmit,
  isSubmitting,
}: BlogPostFormProps) {
  const [formData, setFormData] = useState<BlogPostFormData>({
    title: initialData?.title ?? "",
    slug: initialData?.slug ?? "",
    excerpt: initialData?.excerpt ?? "",
    content: initialData?.content ?? "",
    published: initialData?.published ?? false,
    publishedAt: initialData?.publishedAt ?? null,
    tags: initialData?.tags ?? "",
    metaTitle: initialData?.metaTitle ?? "",
    metaDescription: initialData?.metaDescription ?? "",
    ogImage: initialData?.ogImage ?? "",
  });

  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Set publishedAt to now if publishing for first time
    if (formData.published && !formData.publishedAt) {
      onSubmit({ ...formData, publishedAt: new Date() });
    } else if (!formData.published) {
      onSubmit({ ...formData, publishedAt: null });
    } else {
      onSubmit(formData);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSlugGenerate = () => {
    const slug = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    setFormData((prev) => ({ ...prev, slug }));
  };

  const handleCoverImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
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
        coverImage: base64.split(",")[1],
        imageType: file.type,
      }));
      setCoverPreview(base64);
    };
    reader.readAsDataURL(file);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title & Slug */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
        <div>
          <label className="mb-2 block font-semibold text-white">Slug *</label>
          <div className="flex gap-2">
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              required
              className="flex-1 rounded border border-white/30 bg-white/10 p-3 text-white placeholder-white/50 focus:border-blue-400 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleSlugGenerate}
              className="rounded bg-purple-600/50 px-4 text-white transition hover:bg-purple-600/70"
            >
              Generate
            </button>
          </div>
        </div>
      </div>

      {/* Cover Image */}
      <div>
        <label className="mb-2 block font-semibold text-white">
          Cover Image
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleCoverImageChange}
          className="w-full rounded border border-white/30 bg-white/10 p-3 text-white file:mr-4 file:rounded file:border-0 file:bg-blue-600/50 file:px-4 file:py-2 file:text-white hover:file:bg-blue-600/70"
        />
        {coverPreview && (
          <div className="mt-4">
            <img
              src={coverPreview}
              alt="Cover preview"
              className="h-48 w-auto rounded border border-white/30 object-cover"
            />
          </div>
        )}
        {initialData?.imageType && !coverPreview && (
          <div className="mt-4">
            <img
              src={`/api/blog/posts/${initialData.id}/cover`}
              alt="Current cover"
              className="h-48 w-auto rounded border border-white/30 object-cover"
            />
          </div>
        )}
      </div>

      {/* Excerpt */}
      <div>
        <label className="mb-2 block font-semibold text-white">Excerpt *</label>
        <textarea
          name="excerpt"
          value={formData.excerpt}
          onChange={handleChange}
          required
          rows={3}
          placeholder="A short preview of your post..."
          className="w-full rounded border border-white/30 bg-white/10 p-3 text-white placeholder-white/50 focus:border-blue-400 focus:outline-none"
        />
      </div>

      {/* Content */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="font-semibold text-white">
            Content (Markdown) *
          </label>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            {showPreview ? "Hide Preview" : "Show Preview"}
          </button>
        </div>
        {showPreview ? (
          <div className="prose prose-invert max-w-none rounded border border-white/30 bg-white/5 p-4">
            <div dangerouslySetInnerHTML={{ __html: formData.content }} />
          </div>
        ) : (
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            required
            rows={20}
            placeholder="Write your post in Markdown..."
            className="w-full rounded border border-white/30 bg-white/10 p-3 font-mono text-sm text-white placeholder-white/50 focus:border-blue-400 focus:outline-none"
          />
        )}
      </div>

      {/* Tags */}
      <div>
        <label className="mb-2 block font-semibold text-white">Tags</label>
        <input
          type="text"
          name="tags"
          value={formData.tags}
          onChange={handleChange}
          placeholder="programming, typescript, nextjs"
          className="w-full rounded border border-white/30 bg-white/10 p-3 text-white placeholder-white/50 focus:border-blue-400 focus:outline-none"
        />
        <p className="mt-1 text-sm text-white/50">Comma-separated tags</p>
      </div>

      {/* SEO Fields (Collapsible) */}
      <details className="rounded border border-white/30 bg-white/5 p-4">
        <summary className="cursor-pointer font-semibold text-white">
          SEO Settings (Optional)
        </summary>
        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-white">
              Meta Title
            </label>
            <input
              type="text"
              name="metaTitle"
              value={formData.metaTitle}
              onChange={handleChange}
              className="w-full rounded border border-white/30 bg-white/10 p-3 text-white placeholder-white/50 focus:border-blue-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-white">
              Meta Description
            </label>
            <textarea
              name="metaDescription"
              value={formData.metaDescription}
              onChange={handleChange}
              rows={3}
              className="w-full rounded border border-white/30 bg-white/10 p-3 text-white placeholder-white/50 focus:border-blue-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-white">
              OG Image URL
            </label>
            <input
              type="text"
              name="ogImage"
              value={formData.ogImage}
              onChange={handleChange}
              className="w-full rounded border border-white/30 bg-white/10 p-3 text-white placeholder-white/50 focus:border-blue-400 focus:outline-none"
            />
          </div>
        </div>
      </details>

      {/* Published Toggle */}
      <div className="flex items-center gap-4 rounded border border-white/30 bg-white/5 p-4">
        <input
          type="checkbox"
          id="published"
          checked={formData.published}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, published: e.target.checked }))
          }
          className="h-5 w-5 rounded"
        />
        <label htmlFor="published" className="font-semibold text-white">
          Publish this post
        </label>
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
              ? "Update Post"
              : "Create Post"}
        </button>
        <a
          href="/admin/blog/posts"
          className="rounded-lg bg-gray-500/50 px-8 py-3 text-white backdrop-blur-md transition hover:bg-gray-500/70"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
