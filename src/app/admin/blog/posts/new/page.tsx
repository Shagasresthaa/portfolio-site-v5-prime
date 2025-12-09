"use client";

import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { BlogPostForm } from "../_components/BlogPostForm";

export default function NewBlogPostPage() {
  const router = useRouter();
  const createPost = api.blog.create.useMutation({
    onSuccess: () => {
      router.push("/admin/blog/posts");
    },
  });

  return (
    <div className="container mx-auto min-h-screen px-4 pt-24 pb-12">
      <h1 className="mb-8 text-4xl font-bold text-white">
        Create New Blog Post
      </h1>
      <div className="rounded-2xl border border-white/20 bg-white/5 p-8 backdrop-blur-md">
        <BlogPostForm
          onSubmit={(data) => createPost.mutate(data)}
          isSubmitting={createPost.isPending}
        />
      </div>
    </div>
  );
}
