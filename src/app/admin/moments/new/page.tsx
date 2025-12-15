"use client";

import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { MomentForm } from "../_components/MomentForm";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";

export default function NewMomentPage() {
  const router = useRouter();
  const createMoment = api.gallery.create.useMutation({
    onSuccess: () => {
      router.push("/admin/moments");
    },
  });

  return (
    <div className="container mx-auto min-h-screen px-4 pt-24 pb-12">
      <Link
        href="/admin/moments"
        className="mb-6 inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-white backdrop-blur-md transition hover:bg-white/20"
      >
        <FaArrowLeft />
        <span>Back to Moments</span>
      </Link>

      <h1 className="mb-8 text-4xl font-bold text-white">Create New Moment</h1>
      <MomentForm
        onSubmit={(data) => createMoment.mutate(data)}
        isSubmitting={createMoment.isPending}
      />
    </div>
  );
}
