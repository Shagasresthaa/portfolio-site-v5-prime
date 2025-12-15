"use client";

import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { ProjectForm } from "../_components/ProjectForm";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";

export default function NewProjectPage() {
  const router = useRouter();
  const createProject = api.projects.addProject.useMutation({
    onSuccess: () => {
      router.push("/admin/projects");
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/admin/projects"
        className="mb-6 inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-white backdrop-blur-md transition hover:bg-white/20"
      >
        <FaArrowLeft />
        <span>Back to Projects</span>
      </Link>

      <h1 className="mb-8 text-4xl font-bold">Create New Project</h1>
      <ProjectForm
        onSubmit={(data) => createProject.mutate(data)}
        isSubmitting={createProject.isPending}
      />
    </div>
  );
}
