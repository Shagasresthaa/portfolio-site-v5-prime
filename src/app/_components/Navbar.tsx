"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaHome,
  FaLaptopCode,
  FaRss,
  FaEnvelope,
  FaBars,
  FaTimes,
  FaImages,
} from "react-icons/fa";

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
    { href: "/blog", icon: FaRss, label: "Blog" },
    { href: "/moments", icon: FaImages, label: "Moments" },
    { href: "/contact", icon: FaEnvelope, label: "Contact" },
  ];

  const handleSmoothScroll = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
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
    <nav className="fixed top-0 right-0 left-0 z-50 flex justify-end px-6 py-4 transition-all duration-300">
      {/* Desktop Navigation - positioned to the right with gap */}
      <div
        className={`hidden items-center gap-4 transition-all duration-300 md:flex ${
          isScrolled ? "bg-portfolio-bg rounded-full px-6 py-3 shadow-lg" : ""
        }`}
        style={{ marginRight: "1.5rem" }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={(e) => handleSmoothScroll(e, item.href)}
              className={`group flex items-center gap-2 rounded-full px-4 py-2 transition-all duration-300 ${
                isActive
                  ? "bg-accent-primary text-white"
                  : "bg-bg-secondary text-text-secondary hover:bg-accent-primary hover:text-white"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
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
        className="bg-bg-secondary hover:bg-accent-primary rounded-full p-3 text-white transition-all duration-300 md:hidden"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? (
          <FaTimes className="h-5 w-5" />
        ) : (
          <FaBars className="h-5 w-5" />
        )}
      </button>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="bg-portfolio-bg fixed top-20 right-4 z-40 w-auto rounded-2xl p-4 shadow-2xl md:hidden">
          <div className="flex flex-col gap-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleSmoothScroll(e, item.href)}
                  className={`flex items-center gap-3 rounded-full px-5 py-3 text-base whitespace-nowrap transition-all duration-300 ${
                    isActive
                      ? "bg-accent-primary text-white"
                      : "bg-bg-secondary text-text-secondary hover:bg-accent-primary hover:text-white"
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
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
