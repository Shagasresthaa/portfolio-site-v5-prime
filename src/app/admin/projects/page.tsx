"use client";

import { api } from "@/trpc/react";
import Link from "next/link";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";

export default function AdminProjectsPage() {
  const { data, isLoading } = api.projects.fetchAllProjects.useQuery();
  const projects = data?.projects ?? [];

  const deleteProject = api.projects.deleteProject.useMutation({
    onSuccess: () => {
      window.location.reload();
    },
  });

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteProject.mutate({ id });
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-xl text-white">Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto min-h-screen px-4 pt-24">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-bold text-white">Manage Projects</h1>
        {projects && projects.length > 0 && (
          <Link
            href="/admin/projects/new"
            className="group flex items-center gap-2 rounded-lg bg-blue-600/30 px-6 py-3 text-white backdrop-blur-md transition hover:bg-blue-600/50"
          >
            <FaPlus className="transition-transform group-hover:rotate-90" />
            Add New Project
          </Link>
        )}
      </div>

      {projects && projects.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-white/20 bg-white/5 backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20 bg-white/10">
                  <th className="p-4 text-left text-sm font-semibold text-white">
                    Name
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-white">
                    Status
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-white">
                    Collab
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-white">
                    Affiliation
                  </th>
                  <th className="p-4 text-center text-sm font-semibold text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project, index) => (
                  <tr
                    key={project.id}
                    className={`border-b border-white/10 transition-colors hover:bg-white/10 ${
                      index % 2 === 0 ? "bg-white/5" : ""
                    }`}
                  >
                    <td className="p-4 text-white">{project.name}</td>
                    <td className="p-4">
                      <span className="rounded-full bg-blue-500/30 px-3 py-1 text-xs text-white">
                        {project.statusFlag.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="p-4 text-white/80">{project.collabMode}</td>
                    <td className="p-4 text-white/80">{project.affiliation}</td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <Link
                          href={`/admin/projects/edit/${project.id}`}
                          className="flex items-center gap-1 rounded-lg bg-yellow-500/30 px-3 py-1 text-white backdrop-blur-sm transition hover:bg-yellow-500/50"
                        >
                          <FaEdit />
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(project.id, project.name)}
                          className="flex items-center gap-1 rounded-lg bg-red-500/30 px-3 py-1 text-white backdrop-blur-sm transition hover:bg-red-500/50"
                          disabled={deleteProject.isPending}
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
          <p className="mb-4 text-xl text-white/80">No projects yet</p>
          <Link
            href="/admin/projects/new"
            className="flex items-center gap-2 rounded-lg bg-blue-600/30 px-6 py-3 text-white backdrop-blur-md transition hover:bg-blue-600/50"
          >
            <FaPlus />
            Add Project
          </Link>
        </div>
      )}
    </div>
  );
}
