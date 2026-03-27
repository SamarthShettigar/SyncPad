import React, { useState } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";
import {
  Pin,
  Share2,
  Trash2,
  Pencil,
  User,
  Users,
} from "lucide-react";

function NoteCard({
  note,
  handleEdit,
  handleDelete,
  currentUserId,
  fetchNotes,
}) {
  const ownerId = note.owner?._id || "";
  const ownerEmail = note.owner?.email || "Unknown owner";
  const sharedCount = note.sharedWith?.length || 0;

  const [shareEmail, setShareEmail] = useState("");
  const [sharing, setSharing] = useState(false);
  const [pinLoading, setPinLoading] = useState(false);

  const isOwner = ownerId && currentUserId && ownerId === currentUserId;

  const handleShare = async () => {
    if (!shareEmail.trim()) {
      toast.error("Enter email");
      return;
    }

    try {
      setSharing(true);
      await API.post(`/notes/${note._id}/share`, {
        email: shareEmail.trim(),
      });
      toast.success("Shared successfully");
      setShareEmail("");
      fetchNotes && fetchNotes();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Share failed",
      );
    } finally {
      setSharing(false);
    }
  };

  const handleTogglePin = async () => {
    try {
      setPinLoading(true);
      await API.put(`/notes/${note._id}/pin`);
      toast.success(note.isPinned ? "Note unpinned" : "Note pinned");
      fetchNotes && fetchNotes();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Pin failed",
      );
    } finally {
      setPinLoading(false);
    }
  };

  return (
    <div
      className={`group rounded-[28px] border bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:bg-[#1e293b] ${
        note.isPinned
          ? "border-yellow-300 ring-1 ring-yellow-200 dark:border-yellow-500/40 dark:ring-yellow-500/20"
          : "border-gray-200 dark:border-gray-700"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold text-gray-900 dark:text-white">
            {note.isPinned && "📌 "}
            {note.title || "Untitled Note"}
          </h3>

          <div className="mt-2 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <User size={14} />
            {ownerEmail}
          </div>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            isOwner
              ? "bg-gray-900 text-white"
              : "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300"
          }`}
        >
          {isOwner ? "Owner" : "Shared"}
        </span>
      </div>

      {note.tags?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {note.tags.map((tag, i) => (
            <span
              key={i}
              className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <p className="mt-4 line-clamp-3 text-sm text-gray-600 dark:text-gray-300">
        {note.content || "No content"}
      </p>

      <div className="mt-4 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        <Users size={14} />
        {sharedCount} user{sharedCount !== 1 ? "s" : ""}
      </div>

      {isOwner && (
        <div className="mt-4 rounded-2xl bg-gray-50 p-3 dark:bg-[#0f172a]">
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Share via email"
              value={shareEmail}
              onChange={(e) => setShareEmail(e.target.value)}
              className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400 dark:border-gray-700 dark:bg-[#1e293b] dark:text-white"
            />

            <button
              onClick={handleShare}
              disabled={sharing}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {sharing ? "..." : <Share2 size={16} />}
            </button>
          </div>
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          onClick={() => handleEdit(note)}
          className="flex items-center gap-2 rounded-xl bg-gray-900 px-3 py-2 text-sm font-semibold text-white hover:bg-black dark:bg-indigo-600 dark:hover:bg-indigo-700"
        >
          <Pencil size={14} />
          Edit
        </button>

        {isOwner && (
          <button
            onClick={handleTogglePin}
            disabled={pinLoading}
            className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70 ${
              note.isPinned
                ? "bg-amber-600 hover:bg-amber-700"
                : "bg-yellow-500 hover:bg-yellow-600"
            }`}
          >
            <Pin size={14} />
            {pinLoading ? "..." : note.isPinned ? "Unpin" : "Pin"}
          </button>
        )}

        {isOwner && (
          <button
            onClick={() => handleDelete(note._id)}
            className="flex items-center gap-2 rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            <Trash2 size={14} />
            Delete
          </button>
        )}
      </div>
    </div>
  );
}

export default NoteCard;