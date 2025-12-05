"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaHome, FaLaptopCode, FaPenFancy, FaEnvelope, FaBars, FaTimes } from "react-icons/fa";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { href: "/", icon: FaHome, label: "Home" },
    { href: "/projects", icon: FaLaptopCode, label: "Projects" },
    { href: "/blog", icon: FaPenFancy, label: "Blog" },
    { href: "/contact", icon: FaEnvelope, label: "Contact" },
  ];

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // If we're on homepage and clicking a section anchor
    if (pathname === "/" && href.startsWith("/#")) {
      e.preventDefault();
      const id = href.replace("/#", "");
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
    // Close mobile menu after clicking
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-end px-8 py-6 transition-all duration-300">
      {/* Desktop Navigation - positioned to the right with gap */}
      <div
        className={`hidden md:flex items-center gap-6 transition-all duration-300 ${
          isScrolled
            ? "rounded-full bg-[var(--color-portfolio-bg)] px-8 py-4 shadow-lg"
            : ""
        }`}
        style={{ marginRight: "2rem" }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={(e) => handleSmoothScroll(e, item.href)}
              className={`group flex items-center gap-3 rounded-full px-5 py-3 transition-all duration-300 ${
                isActive
                  ? "bg-[var(--color-accent-primary)] text-white"
                  : "bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-accent-primary)] hover:text-white"
              }`}
            >
              <Icon className="h-6 w-6 flex-shrink-0" />
              <span
                className={`max-w-0 overflow-hidden whitespace-nowrap transition-all duration-300 group-hover:max-w-[100px] ${
                  isActive ? "max-w-[100px]" : ""
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden rounded-full bg-[var(--color-bg-secondary)] p-4 text-white transition-all duration-300 hover:bg-[var(--color-accent-primary)]"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? (
          <FaTimes className="h-6 w-6" />
        ) : (
          <FaBars className="h-6 w-6" />
        )}
      </button>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed right-4 top-24 z-40 w-auto rounded-2xl bg-[var(--color-portfolio-bg)] p-6 shadow-2xl md:hidden">
          <div className="flex flex-col gap-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleSmoothScroll(e, item.href)}
                  className={`flex items-center gap-4 rounded-full px-6 py-4 text-lg transition-all duration-300 whitespace-nowrap ${
                    isActive
                      ? "bg-[var(--color-accent-primary)] text-white"
                      : "bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-accent-primary)] hover:text-white"
                  }`}
                >
                  <Icon className="h-6 w-6 flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}