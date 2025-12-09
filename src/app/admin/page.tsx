"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { FaProjectDiagram, FaBlog, FaSignOutAlt } from "react-icons/fa";

export default function AdminPage() {
  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const cards = [
    {
      title: "Projects",
      description: "Manage your portfolio projects",
      href: "/admin/projects",
      icon: <FaProjectDiagram className="h-16 w-16" />,
      color: "bg-blue-600/30 hover:bg-blue-600/50 backdrop-blur-md",
      disabled: false,
    },
    {
      title: "Blog",
      description: "Manage blog posts",
      href: "/admin/blog",
      icon: <FaBlog className="h-16 w-16" />,
      color: "bg-green-600/30 hover:bg-green-600/50 backdrop-blur-md",
      disabled: false,
    },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-4xl">
        <h1 className="mb-12 text-center text-5xl font-bold text-white">
          Admin Dashboard
        </h1>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Projects & Blog Cards */}
          {cards.map((card) => (
            <Link
              key={card.title}
              href={card.disabled ? "#" : card.href}
              className={`group relative flex flex-col items-center justify-center rounded-2xl border border-white/20 p-8 text-white shadow-xl transition-all duration-300 hover:scale-105 ${
                card.color
              } ${card.disabled ? "cursor-not-allowed opacity-50" : ""}`}
              onClick={(e) => card.disabled && e.preventDefault()}
            >
              <div className="mb-4 transition-transform duration-300 group-hover:scale-110">
                {card.icon}
              </div>
              <h2 className="mb-2 text-2xl font-bold">{card.title}</h2>
              <p className="text-center text-sm opacity-90">
                {card.description}
              </p>
              {card.disabled && (
                <span className="mt-2 text-xs italic opacity-75">
                  Coming Soon
                </span>
              )}
            </Link>
          ))}

          {/* Logout Card */}
          <button
            onClick={handleLogout}
            className="group flex flex-col items-center justify-center rounded-2xl border border-white/20 bg-red-600/30 p-8 text-white shadow-xl backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-red-600/50"
          >
            <div className="mb-4 transition-transform duration-300 group-hover:scale-110">
              <FaSignOutAlt className="h-16 w-16" />
            </div>
            <h2 className="mb-2 text-2xl font-bold">Logout</h2>
            <p className="text-center text-sm opacity-90">
              Sign out of admin panel
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
