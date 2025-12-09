"use client";

import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { MomentForm } from "../../_components/MomentForm";
import { use } from "react";

export default function EditMomentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const { data: moment, isLoading } = api.gallery.getById.useQuery({ id });
  const updateMoment = api.gallery.update.useMutation({
    onSuccess: () => {
      router.push("/admin/moments");
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-xl text-white">Loading moment...</p>
      </div>
    );
  }

  if (!moment) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-xl text-white">Moment not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto min-h-screen px-4 pt-24 pb-12">
      <h1 className="mb-8 text-4xl font-bold text-white">Edit Moment</h1>
      <MomentForm
        initialData={moment}
        onSubmit={(data) => updateMoment.mutate({ id, data })}
        isSubmitting={updateMoment.isPending}
      />
    </div>
  );
}
