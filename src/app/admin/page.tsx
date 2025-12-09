"use client";

import Link from "next/link";
import {
  FaProjectDiagram,
  FaPenFancy,
  FaImages,
  FaEnvelope,
  FaSignOutAlt,
} from "react-icons/fa";
import { signOut } from "next-auth/react";

export default function AdminDashboardPage() {
  const cards = [
    {
      title: "Projects",
      description: "Manage your portfolio projects",
      href: "/admin/projects",
      icon: <FaProjectDiagram className="h-16 w-16" />,
      color: "bg-blue-600/30 hover:bg-blue-600/50 backdrop-blur-md",
    },
    {
      title: "Blog",
      description: "Write and manage blog posts",
      href: "/admin/blog",
      icon: <FaPenFancy className="h-16 w-16" />,
      color: "bg-green-600/30 hover:bg-green-600/50 backdrop-blur-md",
    },
    {
      title: "Moments",
      description: "Manage gallery items",
      href: "/admin/moments",
      icon: <FaImages className="h-16 w-16" />,
      color: "bg-purple-600/30 hover:bg-purple-600/50 backdrop-blur-md",
    },
    {
      title: "Contact",
      description: "View contact messages",
      href: "/admin/contact",
      icon: <FaEnvelope className="h-16 w-16" />,
      color: "bg-yellow-600/30 hover:bg-yellow-600/50 backdrop-blur-md",
    },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-6xl">
        <h1 className="mb-12 text-center text-5xl font-bold text-white">
          Admin Dashboard
        </h1>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
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

        <div className="mt-12 text-center">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="group inline-flex items-center gap-2 rounded-lg bg-red-600/30 px-6 py-3 text-white backdrop-blur-md transition hover:bg-red-600/50"
          >
            <FaSignOutAlt className="transition-transform group-hover:translate-x-1" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
