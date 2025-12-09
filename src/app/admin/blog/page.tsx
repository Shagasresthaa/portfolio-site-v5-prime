"use client";

import Link from "next/link";
import { FaPenFancy, FaImages, FaComments } from "react-icons/fa";

export default function AdminBlogPage() {
  const cards = [
    {
      title: "Manage Blog Posts",
      description: "View and manage all blog posts",
      href: "/admin/blog/posts",
      icon: <FaPenFancy className="h-16 w-16" />,
      color: "bg-blue-600/30 hover:bg-blue-600/50 backdrop-blur-md",
    },
    {
      title: "Manage Images",
      description: "Upload and manage blog images",
      href: "/admin/blog/images",
      icon: <FaImages className="h-16 w-16" />,
      color: "bg-purple-600/30 hover:bg-purple-600/50 backdrop-blur-md",
    },
    {
      title: "Manage Comments",
      description: "Review and moderate comments",
      href: "/admin/blog/comments",
      icon: <FaComments className="h-16 w-16" />,
      color: "bg-green-600/30 hover:bg-green-600/50 backdrop-blur-md",
    },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-6xl">
        <h1 className="mb-12 text-center text-5xl font-bold text-white">
          Blog Management
        </h1>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {cards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className={`group flex flex-col items-center justify-center rounded-2xl border border-white/20 p-8 text-white shadow-xl transition-all duration-300 hover:scale-105 ${card.color}`}
            >
              <div className="mb-4 transition-transform duration-300 group-hover:scale-110">
                {card.icon}
              </div>
              <h2 className="mb-2 text-2xl font-bold">{card.title}</h2>
              <p className="text-center text-sm opacity-90">
                {card.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
