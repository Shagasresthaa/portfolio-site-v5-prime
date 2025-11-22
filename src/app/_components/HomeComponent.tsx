import {
  FaLinkedin,
  FaGithub,
  FaFilePdf,
  FaAward,
  FaSteam,
} from "react-icons/fa";
import { SiOrcid } from "react-icons/si";

export default function HomeComponent() {
  const socialLinks = [
    {
      href: "https://orcid.org/0009-0000-8522-4887",
      icon: <SiOrcid className="h-8 w-8" />,
      hoverColor: "hover:text-lime-400",
      label: "ORCID",
    },
    {
      href: "https://www.linkedin.com/in/sresthaa-shaga-a5329b154",
      icon: <FaLinkedin className="h-8 w-8" />,
      hoverColor: "hover:text-blue-400",
      label: "LinkedIn",
    },
    {
      href: "https://github.com/Shagasresthaa",
      icon: <FaGithub className="h-8 w-8" />,
      hoverColor: "hover:text-gray-900",
      label: "GitHub",
    },
    {
      href: "https://drive.google.com/file/d/13PJt4xrrdotOcVET3wA536C4uIQ-rJI0/view?usp=sharing",
      icon: <FaFilePdf className="h-8 w-8" />,
      hoverColor: "hover:text-red-500",
      label: "Resume",
    },
    {
      href: "https://drive.google.com/drive/folders/1bs98W8ON9Rfk_zj_zmxD6dYAP14xQQht?usp=sharing",
      icon: <FaAward className="h-8 w-8" />,
      hoverColor: "hover:text-orange-400",
      label: "Awards",
    },
    {
      href: "https://steamcommunity.com/id/maverick_017/",
      icon: <FaSteam className="h-8 w-8" />,
      hoverColor: "hover:text-blue-600",
      label: "Steam",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-white">
      {/* Profile Picture */}
      <div className="mb-6">
        <img
          src="/assets/propic.jpg"
          alt="Shaga Sresthaa"
          className="h-48 w-48 rounded-full object-cover shadow-2xl ring-4 ring-white/20 transition-transform duration-300 hover:scale-105 md:h-60 md:w-60"
        />
      </div>

      {/* Introduction */}
      <div className="text-center">
        <h2
          className="mb-2 text-2xl font-light tracking-wide md:text-3xl"
          style={{ fontFamily: "var(--font-salsa)" }}
        >
          Greetings! My name is
        </h2>
        <h1
          className="mb-8 text-5xl font-bold tracking-wide md:text-7xl"
          style={{
            fontFamily: "var(--font-salsa)",
            color: "var(--color-text-blue-light)",
          }}
        >
          Sresthaa Shaga
        </h1>
      </div>

      {/* Bio */}
      <div
        className="mb-8 max-w-5xl space-y-2 text-center text-lg md:text-2xl"
        style={{ fontFamily: "var(--font-salsa)" }}
      >
        <p>Computer Science Grad Student @ Western Michigan University</p>
        <p>
          Astronomy & Electronics Enthusiast || TCS Alumni || Full Stack
          Developer
        </p>
        <p>
          Member of IEEE Computer Society || Member of the Kalamazoo
          Astronomical Society
        </p>
        <p></p>
      </div>

      {/* Social Links */}
      <div className="flex flex-wrap items-center justify-center gap-6">
        {socialLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-white transition-all duration-300 hover:scale-110 ${link.hoverColor}`}
            aria-label={link.label}
          >
            {link.icon}
          </a>
        ))}
      </div>
    </div>
  );
}
