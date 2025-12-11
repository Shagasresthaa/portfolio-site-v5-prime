"use client";

import { useState } from "react";
import {
  StatusFlags,
  CollabModes,
  AffiliationTypes,
  SourceCodeAvailibility,
} from "@prisma/client";

// Define a type that includes all fields we might need
interface Project {
  id: string;
  name: string;
  shortDesc: string;
  longDesc: string | null;
  statusFlag: StatusFlags;
  startDate: Date;
  endDate: Date | null;
  collabMode: CollabModes;
  affiliation: string;
  affiliationType: AffiliationTypes;
  sourceCodeAvailibility: SourceCodeAvailibility;
  techStacks: string;
  projectUrl: string | null;
  liveUrl: string | null;
  image?: Uint8Array | Buffer | null;
  imageType?: string | null;
}

interface ProjectFormProps {
  initialData?: Project;
  onSubmit: (data: ProjectFormData) => void;
  isSubmitting: boolean;
}

export interface ProjectFormData {
  name: string;
  shortDesc: string;
  longDesc?: string;
  statusFlag: StatusFlags;
  startDate: Date;
  endDate: Date | null;
  collabMode: CollabModes;
  affiliation: string;
  affiliationType: AffiliationTypes;
  sourceCodeAvailibility: SourceCodeAvailibility;
  techStacks: string;
  projectUrl?: string;
  liveUrl?: string;
  image?: string; // base64 encoded image
  imageType?: string;
}

export function ProjectForm({
  initialData,
  onSubmit,
  isSubmitting,
}: ProjectFormProps) {
  const [formData, setFormData] = useState<ProjectFormData>({
    name: initialData?.name ?? "",
    shortDesc: initialData?.shortDesc ?? "",
    longDesc: initialData?.longDesc ?? "",
    statusFlag: initialData?.statusFlag ?? StatusFlags.PLANNING,
    startDate: initialData?.startDate ?? new Date(),
    endDate: initialData?.endDate ?? null,
    collabMode: initialData?.collabMode ?? CollabModes.SOLO,
    affiliation: initialData?.affiliation ?? "",
    affiliationType:
      initialData?.affiliationType ?? AffiliationTypes.INDEPENDENT,
    sourceCodeAvailibility:
      initialData?.sourceCodeAvailibility ?? SourceCodeAvailibility.OPEN_SOURCE,
    techStacks: initialData?.techStacks ?? "",
    projectUrl: initialData?.projectUrl ?? "",
    liveUrl: initialData?.liveUrl ?? "",
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const hasExistingImage = initialData?.imageType; // Check if project has an image

  // Determine if end date should be shown and required based on status
  const shouldShowEndDate = formData.statusFlag !== StatusFlags.PLANNING;
  const isEndDateRequired =
    formData.statusFlag === StatusFlags.COMPLETED ||
    formData.statusFlag === StatusFlags.ARCHIVED;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;

    // If status is changing to PLANNING, clear the end date
    if (name === "statusFlag" && value === StatusFlags.PLANNING) {
      setFormData((prev) => ({ ...prev, [name]: value, endDate: null }));
    }
    // If status is changing to IN_PROGRESS from something else, clear end date (will show as "Present")
    else if (name === "statusFlag" && value === StatusFlags.IN_PROGRESS) {
      setFormData((prev) => ({ ...prev, [name]: value, endDate: null }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleDateChange = (name: "startDate" | "endDate", value: string) => {
    if (name === "endDate" && !value) {
      // Allow clearing the end date
      setFormData((prev) => ({ ...prev, [name]: null }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: new Date(value) }));
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB");
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setFormData((prev) => ({
        ...prev,
        image: base64.split(",")[1], // Remove data:image/...;base64, prefix
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
      {/* Name */}
      <div>
        <label className="mb-2 block font-semibold text-white">
          Project Name *
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full rounded border border-white/30 bg-white/10 p-3 text-white placeholder-white/50 focus:border-blue-400 focus:outline-none"
        />
      </div>

      {/* Image Upload */}
      <div>
        <label className="mb-2 block font-semibold text-white">
          Project Image
        </label>
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
        {hasExistingImage && !imagePreview && initialData?.id && (
          <div className="mt-4">
            <img
              src={`/api/projects/${initialData.id}/image`}
              alt="Current"
              className="h-48 w-auto rounded border border-white/30 object-cover"
            />
          </div>
        )}
      </div>

      {/* Rest of the form stays the same... */}
      {/* Short Description */}
      <div>
        <label className="mb-2 block font-semibold text-white">
          Short Description *
        </label>
        <textarea
          name="shortDesc"
          value={formData.shortDesc}
          onChange={handleChange}
          required
          rows={3}
          className="w-full rounded border border-white/30 bg-white/10 p-3 text-white placeholder-white/50 focus:border-blue-400 focus:outline-none"
        />
      </div>

      {/* Long Description */}
      <div>
        <label className="mb-2 block font-semibold text-white">
          Long Description
        </label>
        <textarea
          name="longDesc"
          value={formData.longDesc}
          onChange={handleChange}
          rows={6}
          className="w-full rounded border border-white/30 bg-white/10 p-3 text-white placeholder-white/50 focus:border-blue-400 focus:outline-none"
        />
      </div>

      {/* Status Flag */}
      <div>
        <label className="mb-2 block font-semibold text-white">Status *</label>
        <select
          name="statusFlag"
          value={formData.statusFlag}
          onChange={handleChange}
          required
          className="w-full rounded border border-white/30 bg-white/10 p-3 text-white focus:border-blue-400 focus:outline-none"
        >
          {Object.values(StatusFlags).map((status) => (
            <option key={status} value={status} className="bg-gray-800">
              {status.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block font-semibold text-white">
            Start Date *
          </label>
          <input
            type="date"
            value={formData.startDate.toISOString().split("T")[0]}
            onChange={(e) => handleDateChange("startDate", e.target.value)}
            required
            className="w-full rounded border border-white/30 bg-white/10 p-3 text-white focus:border-blue-400 focus:outline-none"
          />
        </div>
        {shouldShowEndDate && (
          <div>
            <label className="mb-2 block font-semibold text-white">
              End Date {isEndDateRequired && "*"}
            </label>
            <input
              type="date"
              value={
                formData.endDate
                  ? formData.endDate.toISOString().split("T")[0]
                  : ""
              }
              onChange={(e) => handleDateChange("endDate", e.target.value)}
              required={isEndDateRequired}
              className="w-full rounded border border-white/30 bg-white/10 p-3 text-white focus:border-blue-400 focus:outline-none"
            />
            <p className="mt-1 text-sm text-white/60">
              {formData.statusFlag === StatusFlags.IN_PROGRESS
                ? "Leave empty to show as 'Present'"
                : formData.statusFlag === StatusFlags.MAINTAINED
                  ? "Leave empty for ongoing maintenance"
                  : "Required for completed/archived projects"}
            </p>
          </div>
        )}
      </div>

      {/* Collab Mode */}
      <div>
        <label className="mb-2 block font-semibold text-white">
          Collaboration Mode *
        </label>
        <select
          name="collabMode"
          value={formData.collabMode}
          onChange={handleChange}
          required
          className="w-full rounded border border-white/30 bg-white/10 p-3 text-white focus:border-blue-400 focus:outline-none"
        >
          {Object.values(CollabModes).map((mode) => (
            <option key={mode} value={mode} className="bg-gray-800">
              {mode}
            </option>
          ))}
        </select>
      </div>

      {/* Affiliation */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block font-semibold text-white">
            Affiliation *
          </label>
          <input
            type="text"
            name="affiliation"
            value={formData.affiliation}
            onChange={handleChange}
            required
            className="w-full rounded border border-white/30 bg-white/10 p-3 text-white placeholder-white/50 focus:border-blue-400 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-2 block font-semibold text-white">
            Affiliation Type *
          </label>
          <select
            name="affiliationType"
            value={formData.affiliationType}
            onChange={handleChange}
            required
            className="w-full rounded border border-white/30 bg-white/10 p-3 text-white focus:border-blue-400 focus:outline-none"
          >
            {Object.values(AffiliationTypes).map((type) => (
              <option key={type} value={type} className="bg-gray-800">
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Source Code Availability */}
      <div>
        <label className="mb-2 block font-semibold text-white">
          Source Code Availability *
        </label>
        <select
          name="sourceCodeAvailibility"
          value={formData.sourceCodeAvailibility}
          onChange={handleChange}
          required
          className="w-full rounded border border-white/30 bg-white/10 p-3 text-white focus:border-blue-400 focus:outline-none"
        >
          {Object.values(SourceCodeAvailibility).map((avail) => (
            <option key={avail} value={avail} className="bg-gray-800">
              {avail.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>

      {/* Tech Stacks */}
      <div>
        <label className="mb-2 block font-semibold text-white">
          Tech Stacks *
        </label>
        <input
          type="text"
          name="techStacks"
          value={formData.techStacks}
          onChange={handleChange}
          placeholder="e.g., React, Node.js, PostgreSQL"
          required
          className="w-full rounded border border-white/30 bg-white/10 p-3 text-white placeholder-white/50 focus:border-blue-400 focus:outline-none"
        />
      </div>

      {/* URLs */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block font-semibold text-white">
            Project URL (GitHub, etc.)
          </label>
          <input
            type="url"
            name="projectUrl"
            value={formData.projectUrl}
            onChange={handleChange}
            className="w-full rounded border border-white/30 bg-white/10 p-3 text-white placeholder-white/50 focus:border-blue-400 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-2 block font-semibold text-white">
            Live URL
          </label>
          <input
            type="url"
            name="liveUrl"
            value={formData.liveUrl}
            onChange={handleChange}
            className="w-full rounded border border-white/30 bg-white/10 p-3 text-white placeholder-white/50 focus:border-blue-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-blue-600/50 px-8 py-3 text-white backdrop-blur-md transition hover:bg-blue-600/70 disabled:bg-gray-400/50"
        >
          {isSubmitting
            ? "Saving..."
            : initialData
              ? "Update Project"
              : "Create Project"}
        </button>
        <a
          href="/admin/projects"
          className="rounded-lg bg-gray-500/50 px-8 py-3 text-white backdrop-blur-md transition hover:bg-gray-500/70"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
