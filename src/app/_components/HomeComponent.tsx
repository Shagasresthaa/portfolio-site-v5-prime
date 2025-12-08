"use client";

import {
  FaLinkedin,
  FaGithub,
  FaFilePdf,
  FaAward,
  FaSteam,
  FaChevronDown,
} from "react-icons/fa";

export default function HomeComponent() {
  const handleScrollToAbout = () => {
    const aboutSection = document.getElementById("about");
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const socialLinks = [
    {
      href: "https://www.linkedin.com/in/sresthaa-shaga-a5329b154",
      icon: <FaLinkedin className="h-8 w-8" />,
      hoverColor: "hover:text-blue-400",
      label: "LinkedIn",
    },
    {
      href: "https://github.com/Shagasresthaa",
      icon: <FaGithub className="h-8 w-8" />,
      hoverColor: "hover:text-gray-300",
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

  const timelineEvents = [
    {
      title: "Joined Developer Club WMU as Officer",
      position: "Head Lead Dev (Systems) & Lead Dev (Web)",
      institution: "Western Michigan University",
      date: "Mar, 2025 - Present",
    },
    {
      title: "Started Graduate Studies",
      position: "Student (MS Computer Science)",
      institution: "Western Michigan University",
      date: "Jan, 2024",
    },
    {
      title: "First Full Time Job",
      position: "Assistant Systems Engineer",
      institution: "Tata Consultancy Services",
      date: "Dec, 2021 - Nov, 2023",
      duration: "1 year 11 months",
    },
    {
      title: "Completed Undergraduate Studies",
      position: "Student (BTech Computer Science and Engineering)",
      institution: "ICFAI Foundation for Higher Education",
      date: "July, 2017 - Oct, 2021",
      duration: "4 years",
    },
    {
      title: "Internship Program 2",
      position: "Full Stack Dev / AWS Cloud Engineer (Intern)",
      institution: "Skillbanc Inc",
      date: "Aug, 2020 - Jan, 2021",
      duration: "6 months",
    },
    {
      title: "Technology Innovation Project Program 1",
      position: "Full Stack Dev / Data Analyst (Intern)",
      institution: "I Assist Innovation Labs",
      date: "March, 2020 - Aug, 2020",
      duration: "6 months",
    },
    {
      title: "Internship Program 1",
      position: "3D Game Artist (Intern)",
      institution: "CoreGlobal IT",
      date: "May, 2019 - June, 2019",
      duration: "2 months",
    },
    {
      title: "Started Undergraduate Studies",
      position: "Student (BTech Computer Science and Engineering)",
      institution: "ICFAI Foundation for Higher Education",
      date: "July, 2017",
      duration: "",
    },
    {
      title: "Senior Secondary Education",
      position: "Student",
      institution: "Sai Chaitanya Junior College",
      date: "2015 - 2017",
      duration: "2 years",
    },
  ];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section
        id="home"
        className="relative flex min-h-screen flex-col items-center justify-center px-4 text-white"
      >
        {/* Profile Picture */}
        <div className="mb-6">
          <img
            src="/assets/propic.jpg"
            alt="Shaga Sresthaa"
            className="h-48 w-48 rounded-full object-cover shadow-2xl ring-4 ring-white/20 transition-transform duration-300 hover:scale-105 md:h-45 md:w-45"
          />
        </div>

        {/* Introduction */}
        <div className="text-center">
          <h2
            className="mb-2 text-xl font-light tracking-wide sm:text-2xl md:text-xl"
            style={{ fontFamily: "var(--font-salsa)" }}
          >
            Greetings! My name is
          </h2>
          <h1
            className="mb-6 text-4xl font-bold tracking-wide sm:text-5xl md:text-4xl"
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
          className="mb-6 max-w-7xl space-y-1 text-center text-base sm:text-lg md:text-2xl lg:text-2xl"
          style={{ fontFamily: "var(--font-kalam)" }}
        >
          <p>CS Grad Student @ Western Michigan University</p>
          <p>TCS Alumni || Full Stack Developer</p>
          <p>Officer (Head Lead Developer) @ Developer Club WMU</p>
        </div>

        {/* Social Links */}
        <div className="mb-12 flex flex-wrap items-center justify-center gap-4 md:gap-6">
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`text-white transition-all duration-300 hover:scale-110 ${link.hoverColor}`}
              aria-label={link.label}
            >
              <div className="h-7 w-7 md:h-8 md:w-8">{link.icon}</div>
            </a>
          ))}
        </div>

        <p
          style={{
            fontFamily: "var(--font-salsa)",
            color: "var(--color-text-muted)",
          }}
        >
          Scroll down to find out more!
        </p>
        {/* Scroll Down Button */}
        <button
          onClick={handleScrollToAbout}
          className="group absolute bottom-8 animate-bounce"
          aria-label="Scroll to About section"
        >
          <div className="flex flex-col items-center gap-2">
            <FaChevronDown className="h-8 w-8 text-white transition-all duration-300 group-hover:text-[var(--color-text-blue-light)]" />
            <span
              className="text-sm opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{ fontFamily: "var(--font-kalam)" }}
            >
              Find out more!
            </span>
          </div>
        </button>
      </section>

      {/* About Me Section */}
      <section
        id="about"
        className="min-h-screen px-4 py-20 text-white md:px-8 lg:px-16"
      >
        <div className="mx-auto max-w-6xl">
          {/* Question Area */}
          <div className="mb-12 flex flex-col items-center gap-8 md:flex-row md:gap-12">
            <img
              src="/assets/about.jpg"
              alt="About Me"
              className="h-64 w-64 rounded-lg object-cover shadow-2xl ring-4 ring-white/20 md:h-50 md:w-50"
            />
            <p
              className="text-justify text-xl leading-relaxed font-bold md:text-justify md:text-xl"
              style={{
                fontFamily: "var(--font-kalam)",
                color: "var(--color-text-blue-light)",
              }}
            >
              Everyone's talking AI. Big Tech is pushing it everywhere. Every
              startup claims they need machine learning. Some applications are
              brilliant and justified. Others? Questionable at best. In a
              landscape full of buzzwords and hype, how do we cut through the
              noise and ask the hard questions? Is this the right tool, or just
              the trendy one that everyone's chasing? Does this problem really
              need AI, or does it just need good old solid engineering? That's
              where I come in.
            </p>
          </div>

          {/* Story */}
          <div
            className="mb-16 space-y-6 text-lg leading-relaxed md:text-xl"
            style={{ fontFamily: "var(--font-kalam)" }}
          >
            <p className="text-justify indent-12">
              I'm a Master's student in Computer Science at Western Michigan
              University, specializing in systems development and architecture.
              My core expertise lies in building robust, scalable systems, from
              backend infrastructure and database design to distributed systems
              and performance optimization.
            </p>

            <p className="text-justify indent-12">
              But I'm not dogmatic about any single approach. I've upskilled in
              Artificial Intelligence and Machine Learning because modern
              problems sometimes demand intelligent, adaptive solutions. The key
              word? Sometimes. I believe in reaching for the right tool for the
              job, whether that's a well-architected database, a clever
              algorithm, a distributed system, or yes, when truly justified,
              machine learning.
            </p>

            <p className="text-justify indent-12">
              My approach is grounded in asking "Okay but why?" before "how do
              we implement it?", understanding the problem deeply before
              choosing the solution. I build systems that are reliable,
              scalable, and maintainable, using whatever technology genuinely
              serves the goal rather than chasing what's trendy. I thrive in
              environments that value thoughtful engineering over hype, where
              teams solve real problems instead of collecting buzzwords. Whether
              it's designing systems that scale, optimizing performance
              bottlenecks, integrating intelligent features where they make
              sense, or knowing when simpler is better, I'm drawn to work that
              demands both technical rigor and critical thinking.
            </p>
            <p className="text-justify indent-12">
              If you're building systems that matter, want to discuss
              architecture patterns, debate when AI actually makes sense, or
              just appreciate the occasional sci-fi reference, let's connect.
              Always open to new opportunities and conversations.
            </p>
          </div>

          {/* Timeline */}
          <div className="relative">
            <h2
              className="mb-12 text-center text-4xl font-bold md:text-5xl"
              style={{
                fontFamily: "var(--font-salsa)",
                color: "var(--color-text-blue-light)",
              }}
            >
              My Journey so far
            </h2>

            {/* Timeline Line - Hidden on mobile */}
            <div className="absolute top-20 left-1/2 hidden h-full w-1 -translate-x-1/2 bg-gradient-to-b from-[var(--color-accent-primary)] to-[var(--color-accent-cyan)] md:block"></div>

            {/* Timeline Events */}
            <div className="space-y-12">
              {timelineEvents.map((event, index) => (
                <div
                  key={index}
                  className={`relative flex items-center ${
                    index % 2 === 0 ? "md:justify-start" : "md:justify-end"
                  }`}
                >
                  {/* Timeline Card */}
                  <div
                    className={`w-full rounded-lg bg-[var(--color-bg-secondary)] p-6 shadow-xl transition-all duration-300 hover:scale-105 hover:bg-[var(--color-bg-tertiary)] md:w-5/12 ${
                      index % 2 === 0 ? "md:mr-auto" : "md:ml-auto"
                    }`}
                  >
                    <h3
                      className="mb-2 text-xl font-bold md:text-2xl"
                      style={{
                        fontFamily: "var(--font-salsa)",
                        color: "var(--color-text-blue-light)",
                      }}
                    >
                      {event.title}
                    </h3>
                    <p
                      className="mb-1 text-lg font-semibold"
                      style={{ fontFamily: "var(--font-kalam)" }}
                    >
                      {event.position}
                    </p>
                    <p
                      className="mb-2 text-base"
                      style={{
                        fontFamily: "var(--font-kalam)",
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      {event.institution}
                    </p>
                    <div
                      className="flex flex-wrap gap-2 text-sm"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      <span>{event.date}</span>
                      {event.duration && (
                        <>
                          <span>•</span>
                          <span>{event.duration}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Timeline Dot - Hidden on mobile */}
                  <div className="absolute left-1/2 hidden h-6 w-6 -translate-x-1/2 rounded-full border-4 border-[var(--color-portfolio-bg)] bg-[var(--color-accent-primary)] shadow-lg md:block"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
