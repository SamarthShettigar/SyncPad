import React, { useEffect, useRef, useState } from "react";
import socket from "../socket";
import API from "../api/axios";
import toast from "react-hot-toast";
import {
  Users,
  PencilLine,
  History,
  MessageSquare,
  Send,
  X,
  Save,
  Tags,
} from "lucide-react";

function NoteForm({
  title,
  content,
  tags,
  setTitle,
  setContent,
  setTags,
  editingId,
  handleSubmit,
  handleCancelEdit,
  user,
}) {
  const [collaborators, setCollaborators] = useState(0);
  const [isSomeoneTyping, setIsSomeoneTyping] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [versions, setVersions] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [messages, setMessages] = useState([]);
  const [chatText, setChatText] = useState("");
  const [liveCursors, setLiveCursors] = useState({});

  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);
  const editorWrapperRef = useRef(null);

  useEffect(() => {
    if (!editingId || !user?._id) {
      setCollaborators(0);
      setIsSomeoneTyping(false);
      setShowHistory(false);
      setVersions([]);
      setMessages([]);
      setChatText("");
      setLiveCursors({});
      return;
    }

    setCollaborators(0);
    setIsSomeoneTyping(false);
    setShowHistory(false);
    setVersions([]);
    setMessages([]);
    setChatText("");
    setLiveCursors({});

    socket.emit("join-note", {
      noteId: editingId,
      userId: user._id,
      userName: user.name,
    });

    const fetchMessages = async () => {
      try {
        const res = await API.get(`/chat/${editingId}`);
        setMessages(res.data);
      } catch (error) {
        console.error("Fetch chat messages error:", error);
        toast.error("Failed to load chat messages");
      }
    };

    fetchMessages();

    const handleReceiveChanges = (newContent) => {
      setContent(newContent);
    };

    const handleReceiveTitle = (newTitle) => {
      setTitle(newTitle);
    };

    const handleCollaboratorsUpdate = ({ count }) => {
      setCollaborators(count);
    };

    const handleUserTyping = () => {
      setIsSomeoneTyping(true);
    };

    const handleUserStopTyping = () => {
      setIsSomeoneTyping(false);
    };

    const handleReceiveMessage = (message) => {
      setMessages((prev) => [...prev, message]);
    };

    const handleLiveCursors = (users) => {
      const cursorMap = {};
      users.forEach((cursor) => {
        if (cursor.userId !== user._id) {
          cursorMap[cursor.socketId] = cursor;
        }
      });
      setLiveCursors(cursorMap);
    };

    const handleCursorUpdate = (cursor) => {
      if (cursor.userId === user._id) return;
      setLiveCursors((prev) => ({
        ...prev,
        [cursor.socketId]: cursor,
      }));
    };

    const handleRemoveCursor = ({ socketId }) => {
      setLiveCursors((prev) => {
        const updated = { ...prev };
        delete updated[socketId];
        return updated;
      });
    };

    socket.on("receive-changes", handleReceiveChanges);
    socket.on("receive-title-changes", handleReceiveTitle);
    socket.on("collaborators-update", handleCollaboratorsUpdate);
    socket.on("user-typing", handleUserTyping);
    socket.on("user-stop-typing", handleUserStopTyping);
    socket.on("receive-message", handleReceiveMessage);
    socket.on("live-cursors", handleLiveCursors);
    socket.on("cursor-update", handleCursorUpdate);
    socket.on("remove-cursor", handleRemoveCursor);

    return () => {
      socket.off("receive-changes", handleReceiveChanges);
      socket.off("receive-title-changes", handleReceiveTitle);
      socket.off("collaborators-update", handleCollaboratorsUpdate);
      socket.off("user-typing", handleUserTyping);
      socket.off("user-stop-typing", handleUserStopTyping);
      socket.off("receive-message", handleReceiveMessage);
      socket.off("live-cursors", handleLiveCursors);
      socket.off("cursor-update", handleCursorUpdate);
      socket.off("remove-cursor", handleRemoveCursor);

      clearTimeout(typingTimeoutRef.current);
      socket.emit("stop-typing", { noteId: editingId });
    };
  }, [editingId, user?._id, user?.name, setContent, setTitle]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleMouseMove = (e) => {
    if (!editingId || !editorWrapperRef.current) return;

    const rect = editorWrapperRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    socket.emit("cursor-move", {
      noteId: editingId,
      x,
      y,
    });
  };

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);

    if (editingId) {
      socket.emit("send-changes", {
        noteId: editingId,
        content: newContent,
      });

      socket.emit("typing", {
        noteId: editingId,
        userName: user?.name,
      });

      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("stop-typing", { noteId: editingId });
      }, 1000);
    }
  };

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);

    if (editingId) {
      socket.emit("send-title-changes", {
        noteId: editingId,
        title: newTitle,
      });
    }
  };

  const handleTagsChange = (e) => {
    setTags(e.target.value);
  };

  const fetchVersions = async () => {
    if (!editingId) return;

    try {
      setLoadingHistory(true);
      const res = await API.get(`/notes/${editingId}/versions`);
      setVersions(res.data);
    } catch (error) {
      console.error("Fetch versions error:", error);
      toast.error("Failed to fetch version history");
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleToggleHistory = async () => {
    if (!showHistory && editingId) {
      await fetchVersions();
      toast.success("Version history loaded");
    }
    setShowHistory((prev) => !prev);
  };

  const handleRestoreVersion = async (versionId) => {
    try {
      const res = await API.put(`/notes/${editingId}/restore/${versionId}`);

      setTitle(res.data.title);
      setContent(res.data.content);
      setTags((res.data.tags || []).join(", "));

      if (editingId) {
        socket.emit("send-title-changes", {
          noteId: editingId,
          title: res.data.title,
        });

        socket.emit("send-changes", {
          noteId: editingId,
          content: res.data.content,
        });
      }

      toast.success("Version restored successfully");
      fetchVersions();
    } catch (error) {
      console.error("Restore version error:", error);
      toast.error(error.response?.data?.message || "Failed to restore version");
    }
  };

  const handleSendMessage = () => {
    if (!editingId || !user?._id) {
      toast.error("Open a note to use chat");
      return;
    }

    if (!chatText.trim()) {
      toast.error("Message cannot be empty");
      return;
    }

    socket.emit("send-message", {
      noteId: editingId,
      userId: user._id,
      text: chatText.trim(),
    });

    setChatText("");
  };

  const handleChatKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCancel = () => {
    clearTimeout(typingTimeoutRef.current);

    if (editingId) {
      socket.emit("stop-typing", { noteId: editingId });
    }

    setCollaborators(0);
    setIsSomeoneTyping(false);
    setShowHistory(false);
    setVersions([]);
    setMessages([]);
    setChatText("");
    setLiveCursors({});
    setTags("");

    handleCancelEdit();
    toast.success("Editing cancelled");
  };

  return (
    <div
      className={`grid gap-6 ${editingId ? "xl:grid-cols-[1.7fr_1fr]" : "grid-cols-1"}`}
    >
      <form
        onSubmit={handleSubmit}
        className="rounded-[30px] border border-white/70 bg-white p-6 shadow-[0_14px_40px_rgba(15,23,42,0.08)] sm:p-7"
      >
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-indigo-600">
              {editingId ? "Editing mode" : "New note"}
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
              {editingId ? "Edit Note" : "Create Note"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Write, organize, collaborate, and save everything in one workspace.
            </p>
          </div>

          {editingId && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700">
                <Users size={14} />
                {collaborators} collaborator{collaborators !== 1 ? "s" : ""}
              </span>

              {isSomeoneTyping && (
                <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
                  <PencilLine size={14} />
                  Someone is typing...
                </span>
              )}
            </div>
          )}
        </div>

        <div
          ref={editorWrapperRef}
          onMouseMove={handleMouseMove}
          className="relative mt-6 space-y-4"
        >
          <input
            type="text"
            placeholder="Enter note title"
            value={title}
            onChange={handleTitleChange}
            required
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-base font-medium text-slate-900 outline-none transition duration-300 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
          />

          <div className="relative">
            <Tags
              size={16}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Enter tags separated by commas (example: work, urgent, project)"
              value={tags}
              onChange={handleTagsChange}
              className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition duration-300 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
            />
          </div>

          <textarea
            placeholder="Write your note..."
            value={content}
            onChange={handleContentChange}
            rows="10"
            required
            className="min-h-[280px] w-full resize-y rounded-[24px] border border-slate-200 bg-white px-4 py-4 text-sm leading-7 text-slate-900 outline-none transition duration-300 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
          />

          {Object.values(liveCursors).map((cursor) => (
            <div
              key={cursor.socketId}
              className="pointer-events-none absolute z-10"
              style={{
                left: `${cursor.x}px`,
                top: `${cursor.y}px`,
              }}
            >
              <div
                className="h-3.5 w-3.5 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: cursor.color }}
              />
              <div
                className="mt-1 inline-block rounded-md px-2 py-1 text-[11px] font-semibold text-white shadow-sm"
                style={{ backgroundColor: cursor.color }}
              >
                {cursor.userName}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(79,70,229,0.28)] transition duration-300 hover:scale-[1.02]"
          >
            <Save size={16} />
            {editingId ? "Update Note" : "Add Note"}
          </button>

          {editingId && (
            <>
              <button
                type="button"
                onClick={handleCancel}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition duration-300 hover:bg-slate-50"
              >
                <X size={16} />
                Cancel
              </button>

              <button
                type="button"
                onClick={handleToggleHistory}
                className="inline-flex items-center gap-2 rounded-2xl border border-violet-200 bg-violet-50 px-5 py-3 text-sm font-semibold text-violet-700 transition duration-300 hover:bg-violet-100"
              >
                <History size={16} />
                {showHistory ? "Hide History" : "View History"}
              </button>
            </>
          )}
        </div>

        {showHistory && (
          <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <div className="mb-4 flex items-center gap-2">
              <History size={18} className="text-violet-600" />
              <h3 className="text-lg font-semibold text-slate-900">
                Version History
              </h3>
            </div>

            {loadingHistory ? (
              <p className="text-sm text-slate-500">Loading history...</p>
            ) : versions.length === 0 ? (
              <p className="text-sm text-slate-500">No versions found.</p>
            ) : (
              <div className="space-y-3">
                {versions.map((version) => (
                  <div
                    key={version._id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <p className="text-sm text-slate-700">
                      <strong>Title:</strong> {version.title}
                    </p>
                    <p className="mt-1 text-sm text-slate-700">
                      <strong>Tags:</strong>{" "}
                      {version.tags?.length ? version.tags.join(", ") : "No tags"}
                    </p>
                    <p className="mt-1 text-sm text-slate-700">
                      <strong>Content:</strong> {version.content}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      <strong>Saved At:</strong>{" "}
                      {new Date(version.editedAt).toLocaleString()}
                    </p>

                    <button
                      type="button"
                      onClick={() => handleRestoreVersion(version._id)}
                      className="mt-3 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                    >
                      Restore
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </form>

      {editingId && (
        <div className="rounded-[30px] border border-white/70 bg-white p-6 shadow-[0_14px_40px_rgba(15,23,42,0.08)]">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-4">
            <MessageSquare size={18} className="text-indigo-600" />
            <h3 className="text-xl font-semibold text-slate-950">Note Chat</h3>
          </div>

          <div className="mt-4 flex h-[420px] flex-col rounded-[24px] border border-slate-200 bg-slate-50 p-3">
            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
              {messages.length === 0 ? (
                <p className="pt-10 text-center text-sm text-slate-500">
                  No messages yet
                </p>
              ) : (
                messages.map((msg) => {
                  const senderId =
                    typeof msg.sender === "object" ? msg.sender?._id : msg.sender;

                  const isOwn = senderId === user?._id;

                  return (
                    <div
                      key={msg._id}
                      className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                        isOwn
                          ? "ml-auto bg-indigo-100 text-slate-900"
                          : "bg-white text-slate-900"
                      }`}
                    >
                      <div className="mb-1 text-xs font-semibold text-slate-600">
                        {msg.senderName}
                      </div>
                      <div className="leading-6">{msg.text}</div>
                      <small className="mt-2 block text-[11px] text-slate-400">
                        {new Date(msg.createdAt).toLocaleTimeString()}
                      </small>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="mt-3 flex gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                value={chatText}
                onChange={(e) => setChatText(e.target.value)}
                onKeyDown={handleChatKeyDown}
                className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition duration-300 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              />

              <button
                type="button"
                onClick={handleSendMessage}
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                <Send size={16} />
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NoteForm;