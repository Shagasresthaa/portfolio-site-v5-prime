"use client";

import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { ProjectForm } from "../_components/ProjectForm";

export default function NewProjectPage() {
  const router = useRouter();
  const createProject = api.projects.addProject.useMutation({
    onSuccess: () => {
      router.push("/admin/projects");
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-4xl font-bold">Create New Project</h1>
      <ProjectForm
        onSubmit={(data) => createProject.mutate(data)}
        isSubmitting={createProject.isPending}
      />
    </div>
  );
}
