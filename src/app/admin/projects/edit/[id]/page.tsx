"use client";

import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { ProjectForm } from "../../_components/ProjectForm";
import { use } from "react";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";

export default function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const utils = api.useUtils();

  const { data: project, isLoading } = api.projects.fetchProjectById.useQuery({
    id,
  });
  const updateProject = api.projects.updateProject.useMutation({
    onSuccess: async () => {
      await utils.projects.invalidate();
      router.push("/admin/projects");
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-xl">Loading project...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-xl">Project not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/admin/projects"
        className="mb-6 inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-white backdrop-blur-md transition hover:bg-white/20"
      >
        <FaArrowLeft />
        <span>Back to Projects</span>
      </Link>

      <h1 className="mb-8 text-4xl font-bold">Edit Project</h1>
      <ProjectForm
        initialData={project}
        onSubmit={(data) => updateProject.mutate({ id, data })}
        isSubmitting={updateProject.isPending}
      />
    </div>
  );
}
