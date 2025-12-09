"use client";

import { api } from "@/trpc/react";
import { useState } from "react";
import { FaEnvelope, FaUser, FaPaperPlane } from "react-icons/fa";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [postAnonymously, setPostAnonymously] = useState(false);

  const submitMessage = api.contact.submit.useMutation({
    onSuccess: () => {
      alert("Message sent successfully! I'll get back to you soon.");
      setFormData({ name: "", email: "", subject: "", message: "" });
      setPostAnonymously(false);
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMessage.mutate({
      name: postAnonymously ? undefined : formData.name || undefined,
      email: formData.email,
      subject: formData.subject || undefined,
      message: formData.message,
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="container mx-auto min-h-screen px-4 pt-24 pb-12">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1
            className="mb-4 text-5xl font-bold text-white md:text-6xl"
            style={{ fontFamily: "var(--font-salsa)" }}
          >
            Get In Touch
          </h1>
          <p
            className="text-xl text-white/80 md:text-2xl"
            style={{ fontFamily: "var(--font-kalam)" }}
          >
            Have a question or want to work together? Drop me a message!
          </p>
        </div>

        {/* Contact Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-white/20 bg-white/5 p-8 shadow-xl backdrop-blur-md"
        >
          {/* Anonymous Checkbox */}
          <div className="mb-6">
            <label className="flex items-center gap-2 text-white">
              <input
                type="checkbox"
                checked={postAnonymously}
                onChange={(e) => setPostAnonymously(e.target.checked)}
                className="h-4 w-4 rounded"
              />
              Send anonymously (name will be hidden)
            </label>
          </div>

          {/* Name Field */}
          {!postAnonymously && (
            <div className="mb-6">
              <label className="mb-2 block font-semibold text-white">
                <FaUser className="mr-2 inline" />
                Name (Optional)
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
                className="w-full rounded border border-white/30 bg-white/10 p-3 text-white placeholder-white/50 focus:border-blue-400 focus:outline-none"
              />
            </div>
          )}

          {/* Email Field */}
          <div className="mb-6">
            <label className="mb-2 block font-semibold text-white">
              <FaEnvelope className="mr-2 inline" />
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="your@email.com"
              className="w-full rounded border border-white/30 bg-white/10 p-3 text-white placeholder-white/50 focus:border-blue-400 focus:outline-none"
            />
          </div>

          {/* Subject Field */}
          <div className="mb-6">
            <label className="mb-2 block font-semibold text-white">
              Subject (Optional)
            </label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="What's this about?"
              className="w-full rounded border border-white/30 bg-white/10 p-3 text-white placeholder-white/50 focus:border-blue-400 focus:outline-none"
            />
          </div>

          {/* Message Field */}
          <div className="mb-6">
            <label className="mb-2 block font-semibold text-white">
              Message *
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={8}
              placeholder="Your message..."
              className="w-full rounded border border-white/30 bg-white/10 p-3 text-white placeholder-white/50 focus:border-blue-400 focus:outline-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitMessage.isPending}
            className="group flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600/50 px-8 py-3 text-white backdrop-blur-md transition hover:bg-blue-600/70 disabled:bg-gray-400/50"
          >
            <FaPaperPlane className="transition-transform group-hover:translate-x-1" />
            {submitMessage.isPending ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>
    </div>
  );
}
