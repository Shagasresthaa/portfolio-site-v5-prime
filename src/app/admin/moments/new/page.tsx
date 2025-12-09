"use client";

import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { MomentForm } from "../_components/MomentForm";

export default function NewMomentPage() {
  const router = useRouter();
  const createMoment = api.gallery.create.useMutation({
    onSuccess: () => {
      router.push("/admin/moments");
    },
  });

  return (
    <div className="container mx-auto min-h-screen px-4 pt-24 pb-12">
      <h1 className="mb-8 text-4xl font-bold text-white">Create New Moment</h1>
      <MomentForm
        onSubmit={(data) => createMoment.mutate(data)}
        isSubmitting={createMoment.isPending}
      />
    </div>
  );
}
