"use client";

import { api } from "@/trpc/react";
import { FaEnvelope, FaEnvelopeOpen, FaTrash, FaCheck } from "react-icons/fa";

export default function AdminContactPage() {
  const { data: messages, isLoading, refetch } = api.contact.getAll.useQuery();

  const markAsRead = api.contact.markAsRead.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const deleteMessage = api.contact.delete.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleMarkAsRead = (id: string) => {
    markAsRead.mutate({ id });
  };

  const handleDelete = (id: string, email: string) => {
    if (confirm(`Delete message from ${email}?`)) {
      deleteMessage.mutate({ id });
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-xl text-white">Loading messages...</p>
      </div>
    );
  }

  const unreadCount = messages?.filter((m) => !m.read).length ?? 0;

  return (
    <div className="container mx-auto min-h-screen px-4 pt-24 pb-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white">Contact Messages</h1>
          {unreadCount > 0 && (
            <p className="mt-2 text-white/70">
              {unreadCount} unread message{unreadCount !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>

      {messages && messages.length > 0 ? (
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`rounded-2xl border p-6 backdrop-blur-md transition-all ${
                message.read
                  ? "border-white/20 bg-white/5"
                  : "border-blue-400/50 bg-blue-600/10"
              }`}
            >
              {/* Header */}
              <div className="mb-4 flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    {message.read ? (
                      <FaEnvelopeOpen className="text-white/50" />
                    ) : (
                      <FaEnvelope className="text-blue-400" />
                    )}
                    <div>
                      <p className="font-semibold text-white">
                        {message.name || "Anonymous"}
                      </p>
                      <p className="text-sm text-white/70">{message.email}</p>
                    </div>
                  </div>
                  {message.subject && (
                    <p className="mt-2 font-semibold text-white/90">
                      Subject: {message.subject}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-white/50">
                    {new Date(message.createdAt).toLocaleString()}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {!message.read && (
                    <button
                      onClick={() => handleMarkAsRead(message.id)}
                      disabled={markAsRead.isPending}
                      className="rounded-lg bg-green-500/30 p-2 text-white transition hover:bg-green-500/50"
                      title="Mark as read"
                    >
                      <FaCheck />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(message.id, message.email)}
                    disabled={deleteMessage.isPending}
                    className="rounded-lg bg-red-500/30 p-2 text-white transition hover:bg-red-500/50"
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>

              {/* Message Content */}
              <div className="rounded-lg bg-white/5 p-4">
                <p className="whitespace-pre-wrap text-white/90">
                  {message.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/30 bg-white/5 p-12 backdrop-blur-md">
          <p className="text-xl text-white/80">No messages yet</p>
        </div>
      )}
    </div>
  );
}
