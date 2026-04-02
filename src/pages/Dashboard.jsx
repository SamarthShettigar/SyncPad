import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FileText,
  Archive,
  Trash2,
  CheckSquare,
  Square,
  RotateCcw,
  Trash,
  X,
  Sparkles,
  Layers3,
  Search,
} from "lucide-react";
import API from "../api/axios";
import NoteForm from "../components/NoteForm";
import NoteCard from "../components/NoteCard";
import EditorDrawer from "../components/EditorDrawer";
import AppShell from "../components/layout/AppShell.jsx";

const FILTERS = [
  { key: "active", label: "All Notes", icon: FileText },
  { key: "archived", label: "Archived", icon: Archive },
  { key: "trashed", label: "Trash", icon: Trash2 },
];

function DashboardStatPill({ label, value, active = false }) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
        active
          ? "border border-sky-500/30 bg-sky-500/15 text-sky-100"
          : "border border-slate-200 bg-white text-slate-600 dark:border-slate-700/80 dark:bg-slate-900/80 dark:text-slate-300"
      }`}
    >
      <span>{label}</span>
      <span
        className={`rounded-full px-2 py-0.5 text-[11px] ${
          active
            ? "bg-sky-400/20 text-sky-100"
            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function SectionHeader({ title, subtitle, rightSlot }) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
          {subtitle}
        </p>
      </div>

      {rightSlot && (
        <div className="flex flex-wrap items-center gap-2">{rightSlot}</div>
      )}
    </div>
  );
}

function NotesLoadingGrid() {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {[...Array(6)].map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/80"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="h-6 w-28 rounded-xl bg-slate-200 dark:bg-slate-800" />
            <div className="h-10 w-10 rounded-2xl bg-slate-200 dark:bg-slate-800" />
          </div>

          <div className="mb-4 h-7 w-3/4 rounded-xl bg-slate-200 dark:bg-slate-800" />

          <div className="rounded-3xl bg-slate-100 p-4 dark:bg-slate-800/70">
            <div className="space-y-2">
              <div className="h-4 rounded-xl bg-slate-200 dark:bg-slate-700" />
              <div className="h-4 rounded-xl bg-slate-200 dark:bg-slate-700" />
              <div className="h-4 w-3/4 rounded-xl bg-slate-200 dark:bg-slate-700" />
            </div>
          </div>

          <div className="mt-5 flex gap-2">
            <div className="h-10 w-24 rounded-2xl bg-slate-200 dark:bg-slate-800" />
            <div className="h-10 w-28 rounded-2xl bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ icon, title, description, actionLabel, onAction }) {
  const Icon = icon;

  return (
    <div className="rounded-[32px] border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm dark:border-slate-700/80 dark:bg-slate-900/80">
      <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[28px] bg-slate-100 dark:bg-slate-800/80">
        <Icon className="h-8 w-8 text-slate-500 dark:text-slate-300" />
      </div>

      <h3 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
        {title}
      </h3>

      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
        {description}
      </p>

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 dark:border dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
        >
          <FileText size={16} />
          {actionLabel}
        </button>
      )}
    </div>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [notes, setNotes] = useState([]);
  const [counts, setCounts] = useState({
    active: 0,
    archived: 0,
    trashed: 0,
  });

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [tags, setTags] = useState([]);
  const [isPinned, setIsPinned] = useState(false);
  const [activeFilter, setActiveFilter] = useState("active");
  const [editorKey, setEditorKey] = useState(0);
  const [selectedNotes, setSelectedNotes] = useState([]);
  const [showEditorDrawer, setShowEditorDrawer] = useState(false);

  const fetchCounts = async () => {
    try {
      const [activeRes, archivedRes, trashedRes] = await Promise.all([
        API.get("/notes?filter=active"),
        API.get("/notes?filter=archived"),
        API.get("/notes?filter=trashed"),
      ]);

      setCounts({
        active: activeRes.data?.length || 0,
        archived: archivedRes.data?.length || 0,
        trashed: trashedRes.data?.length || 0,
      });
    } catch (error) {
      console.error("Fetch counts error:", error);
    }
  };

  const fetchNotes = async (filter = activeFilter) => {
    try {
      setLoading(true);
      const res = await API.get(`/notes?filter=${filter}`);
      setNotes(res.data || []);
    } catch (error) {
      console.error("Fetch notes error:", error);
      toast.error("Failed to load notes");
    } finally {
      setLoading(false);
    }
  };

  const refreshDashboardData = async (filter = activeFilter) => {
    await Promise.all([fetchNotes(filter), fetchCounts()]);
  };

  useEffect(() => {
    refreshDashboardData(activeFilter);
    setSelectedNotes([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter]);

  const resetEditor = () => {
    setTitle("");
    setContent("");
    setEditingId(null);
    setSaveStatus("");
    setAttachments([]);
    setTags([]);
    setIsPinned(false);
  };

  const closeEditorDrawer = () => {
    resetEditor();
    setEditorKey((prev) => prev + 1);
    setShowEditorDrawer(false);

    const nextQuery = new URLSearchParams(location.search);
    nextQuery.delete("edit");

    navigate(
      {
        pathname: "/dashboard",
        search: nextQuery.toString(),
      },
      { replace: true },
    );
  };

  const handleNewNote = () => {
    resetEditor();
    setEditorKey((prev) => prev + 1);
    setSearchTerm("");
    setActiveFilter("active");
    setSelectedNotes([]);
    setShowEditorDrawer(true);

    const nextQuery = new URLSearchParams(location.search);
    nextQuery.delete("edit");

    navigate(
      {
        pathname: "/dashboard",
        search: nextQuery.toString(),
      },
      { replace: true },
    );

    toast.success("Ready for a new note");
  };

  const handleEdit = (note) => {
    if (activeFilter !== "active") {
      toast.error("Only active notes can be edited");
      return;
    }

    setEditingId(note._id);
    setTitle(note.title || "");
    setContent(note.content || "");
    setAttachments(note.attachments || []);
    setTags(note.tags || []);
    setIsPinned(Boolean(note.isPinned));
    setSaveStatus("");
    setEditorKey((prev) => prev + 1);
    setShowEditorDrawer(true);
  };

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const editId = query.get("edit");

    if (!editId || notes.length === 0 || activeFilter !== "active") return;

    const noteToEdit = notes.find((note) => note._id === editId);
    if (!noteToEdit) return;

    handleEdit(noteToEdit);

    const nextQuery = new URLSearchParams(location.search);
    nextQuery.delete("edit");

    navigate(
      {
        pathname: location.pathname,
        search: nextQuery.toString(),
      },
      { replace: true },
    );
  }, [location.search, notes, activeFilter, navigate]);

  const filteredNotes = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    const result = notes.filter((note) => {
      if (!term) return true;

      const inTitle = (note.title || "").toLowerCase().includes(term);
      const inContent = (note.content || "").toLowerCase().includes(term);
      const inTags = (note.tags || []).some((tag) =>
        tag.toLowerCase().includes(term),
      );
      const inAttachments = (note.attachments || []).some((file) =>
        (file.originalName || file.fileName || file.filename || "")
          .toLowerCase()
          .includes(term),
      );

      return inTitle || inContent || inTags || inAttachments;
    });

    return result.sort((a, b) => {
      if (activeFilter === "active") {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
      }

      const aDate =
        activeFilter === "trashed"
          ? a.trashedAt || a.updatedAt
          : activeFilter === "archived"
            ? a.archivedAt || a.updatedAt
            : a.updatedAt;

      const bDate =
        activeFilter === "trashed"
          ? b.trashedAt || b.updatedAt
          : activeFilter === "archived"
            ? b.archivedAt || b.updatedAt
            : b.updatedAt;

      return new Date(bDate) - new Date(aDate);
    });
  }, [notes, searchTerm, activeFilter]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = document.activeElement?.tagName?.toLowerCase();
      const isTyping =
        tag === "input" ||
        tag === "textarea" ||
        document.activeElement?.isContentEditable;

      if (isTyping) return;

      if (e.key === "Escape" && selectedNotes.length > 0) {
        e.preventDefault();
        setSelectedNotes([]);
        toast.success("Selection cleared");
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a") {
        if (filteredNotes.length === 0) return;
        e.preventDefault();

        const everySelected = filteredNotes.every((note) =>
          selectedNotes.includes(note._id),
        );

        if (everySelected) {
          setSelectedNotes([]);
          toast.success("Selection cleared");
        } else {
          setSelectedNotes(filteredNotes.map((note) => note._id));
          toast.success("All visible notes selected");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedNotes, filteredNotes]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const plainTextContent = content.replace(/<[^>]*>/g, "").trim();

    if (!title.trim() && !plainTextContent && attachments.length === 0) {
      toast.error("Please add a title, content, or attachment");
      return;
    }

    try {
      if (editingId) {
        const res = await API.put(`/notes/${editingId}`, {
          title,
          content,
          attachments,
          tags,
          isPinned,
        });

        setNotes((prev) =>
          prev.map((note) => (note._id === editingId ? res.data : note)),
        );

        toast.success("Note updated successfully");
      } else {
        const res = await API.post("/notes", {
          title,
          content,
          attachments,
          tags,
          isPinned,
        });

        if (activeFilter === "active") {
          setNotes((prev) => [res.data, ...prev]);
        }

        toast.success("Note created successfully");
      }

      await fetchCounts();
      resetEditor();
      setEditorKey((prev) => prev + 1);
      setShowEditorDrawer(false);
    } catch (error) {
      console.error("Save note error:", error);
      toast.error("Failed to save note");
    }
  };

  const handleTrash = async (id) => {
    const confirmed = window.confirm("Move this note to trash?");
    if (!confirmed) return;

    try {
      await API.delete(`/notes/${id}`);
      setNotes((prev) => prev.filter((note) => note._id !== id));
      setSelectedNotes((prev) => prev.filter((noteId) => noteId !== id));

      if (editingId === id) {
        closeEditorDrawer();
      }

      await fetchCounts();
      toast.success("Note moved to trash");
    } catch (error) {
      console.error("Trash note error:", error);
      toast.error("Failed to move note to trash");
    }
  };

  const handleArchiveToggle = async (id, currentlyArchived = false) => {
    const confirmed = window.confirm(
      currentlyArchived ? "Restore this note from archive?" : "Archive this note?",
    );
    if (!confirmed) return;

    try {
      const res = await API.put(`/notes/${id}/archive`);
      const updatedNote = res.data.note;

      if (activeFilter === "active" || activeFilter === "archived") {
        setNotes((prev) => prev.filter((note) => note._id !== id));
      } else {
        setNotes((prev) =>
          prev.map((note) => (note._id === id ? updatedNote : note)),
        );
      }

      setSelectedNotes((prev) => prev.filter((noteId) => noteId !== id));

      if (editingId === id && updatedNote?.isArchived) {
        closeEditorDrawer();
      }

      await fetchCounts();
      toast.success(res.data.message || "Archive status updated");
    } catch (error) {
      console.error("Archive note error:", error);
      toast.error("Failed to update archive status");
    }
  };

  const handleRestore = async (id) => {
    const confirmed = window.confirm("Restore this note from trash?");
    if (!confirmed) return;

    try {
      const res = await API.put(`/notes/${id}/restore`);
      setNotes((prev) => prev.filter((note) => note._id !== id));
      setSelectedNotes((prev) => prev.filter((noteId) => noteId !== id));
      await fetchCounts();
      toast.success(res.data.message || "Note restored successfully");
    } catch (error) {
      console.error("Restore note error:", error);
      toast.error("Failed to restore note");
    }
  };

  const handlePermanentDelete = async (id) => {
    const confirmed = window.confirm(
      "This will permanently delete the note. This action cannot be undone.",
    );
    if (!confirmed) return;

    try {
      await API.delete(`/notes/${id}/permanent`);
      setNotes((prev) => prev.filter((note) => note._id !== id));
      setSelectedNotes((prev) => prev.filter((noteId) => noteId !== id));

      if (editingId === id) {
        closeEditorDrawer();
      }

      await fetchCounts();
      toast.success("Note permanently deleted");
    } catch (error) {
      console.error("Permanent delete error:", error);
      toast.error("Failed to permanently delete note");
    }
  };

  const handleFilterChange = (filterKey) => {
    setActiveFilter(filterKey);
    setSearchTerm("");
    setSelectedNotes([]);

    if (filterKey !== "active") {
      closeEditorDrawer();
    }
  };

  const currentFilterMeta =
    FILTERS.find((filter) => filter.key === activeFilter) || FILTERS[0];

  const showNewNoteButton = activeFilter === "active";

  const allVisibleSelected =
    filteredNotes.length > 0 &&
    filteredNotes.every((note) => selectedNotes.includes(note._id));

  const toggleSelectNote = (id) => {
    setSelectedNotes((prev) =>
      prev.includes(id) ? prev.filter((noteId) => noteId !== id) : [...prev, id],
    );
  };

  const toggleSelectAllVisible = () => {
    if (allVisibleSelected) {
      setSelectedNotes([]);
    } else {
      setSelectedNotes(filteredNotes.map((note) => note._id));
    }
  };

  const clearSelection = () => {
    setSelectedNotes([]);
  };

  const bulkArchive = async () => {
    if (selectedNotes.length === 0) return;
    const confirmed = window.confirm(`Archive ${selectedNotes.length} selected note(s)?`);
    if (!confirmed) return;

    try {
      await Promise.all(selectedNotes.map((id) => API.put(`/notes/${id}/archive`)));
      await refreshDashboardData(activeFilter);
      setSelectedNotes([]);
      toast.success("Selected notes archived");
    } catch (error) {
      console.error("Bulk archive error:", error);
      toast.error("Failed to archive selected notes");
    }
  };

  const bulkTrash = async () => {
    if (selectedNotes.length === 0) return;
    const confirmed = window.confirm(`Move ${selectedNotes.length} selected note(s) to trash?`);
    if (!confirmed) return;

    try {
      await Promise.all(selectedNotes.map((id) => API.delete(`/notes/${id}`)));
      await refreshDashboardData(activeFilter);
      setSelectedNotes([]);
      toast.success("Selected notes moved to trash");
    } catch (error) {
      console.error("Bulk trash error:", error);
      toast.error("Failed to move selected notes to trash");
    }
  };

  const bulkRestoreFromArchive = async () => {
    if (selectedNotes.length === 0) return;
    const confirmed = window.confirm(`Restore ${selectedNotes.length} selected archived note(s)?`);
    if (!confirmed) return;

    try {
      await Promise.all(selectedNotes.map((id) => API.put(`/notes/${id}/archive`)));
      await refreshDashboardData(activeFilter);
      setSelectedNotes([]);
      toast.success("Selected archived notes restored");
    } catch (error) {
      console.error("Bulk restore archive error:", error);
      toast.error("Failed to restore selected archived notes");
    }
  };

  const bulkRestoreFromTrash = async () => {
    if (selectedNotes.length === 0) return;
    const confirmed = window.confirm(`Restore ${selectedNotes.length} selected trashed note(s)?`);
    if (!confirmed) return;

    try {
      await Promise.all(selectedNotes.map((id) => API.put(`/notes/${id}/restore`)));
      await refreshDashboardData(activeFilter);
      setSelectedNotes([]);
      toast.success("Selected trashed notes restored");
    } catch (error) {
      console.error("Bulk restore trash error:", error);
      toast.error("Failed to restore selected trashed notes");
    }
  };

  const bulkPermanentDelete = async () => {
    if (selectedNotes.length === 0) return;
    const confirmed = window.confirm(
      `Permanently delete ${selectedNotes.length} selected note(s)? This cannot be undone.`,
    );
    if (!confirmed) return;

    try {
      await Promise.all(
        selectedNotes.map((id) => API.delete(`/notes/${id}/permanent`)),
      );
      await refreshDashboardData(activeFilter);
      setSelectedNotes([]);
      toast.success("Selected notes permanently deleted");
    } catch (error) {
      console.error("Bulk permanent delete error:", error);
      toast.error("Failed to permanently delete selected notes");
    }
  };

  const isSearchMode = searchTerm.trim().length > 0;
  const hasNoResults = !loading && filteredNotes.length === 0;

  return (
    <>
      <AppShell
        title={
          activeFilter === "archived"
            ? "Archived Notes"
            : activeFilter === "trashed"
              ? "Trash"
              : "Dashboard"
        }
        subtitle={
          activeFilter === "archived"
            ? "Review and restore archived notes."
            : activeFilter === "trashed"
              ? "Restore notes or remove them permanently."
              : "Manage your collaborative workspace."
        }
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onNewNote={handleNewNote}
        showNewNoteButton={showNewNoteButton}
      >
        <div className="space-y-8">
          <section className="grid gap-4 lg:grid-cols-4">
            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/80 dark:shadow-[0_0_0_1px_rgba(15,23,42,0.25)]">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-100">
                <Layers3 size={18} />
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Workspace Total
              </p>
              <h3 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                {counts.active + counts.archived + counts.trashed}
              </h3>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/80 dark:shadow-[0_0_0_1px_rgba(15,23,42,0.25)]">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-100">
                <FileText size={18} />
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Active Notes
              </p>
              <h3 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                {counts.active}
              </h3>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/80 dark:shadow-[0_0_0_1px_rgba(15,23,42,0.25)]">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-100">
                <Archive size={18} />
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Archived
              </p>
              <h3 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                {counts.archived}
              </h3>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/80 dark:shadow-[0_0_0_1px_rgba(15,23,42,0.25)]">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-100">
                <Sparkles size={18} />
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Selected
              </p>
              <h3 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                {selectedNotes.length}
              </h3>
            </div>
          </section>

          <section className="space-y-5">
            <div className="rounded-[28px] border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/80">
              <div className="flex flex-wrap items-center gap-3">
                {FILTERS.map((filter) => {
                  const Icon = filter.icon;
                  const isActive = activeFilter === filter.key;

                  return (
                    <button
                      key={filter.key}
                      onClick={() => handleFilterChange(filter.key)}
                      className={`group inline-flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                        isActive
                          ? "border border-sky-500/30 bg-sky-500/15 text-sky-100 shadow-sm"
                          : "border border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-slate-100"
                      }`}
                    >
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
                          isActive
                            ? "bg-sky-400/15 text-sky-100"
                            : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        <Icon size={16} />
                      </div>

                      <span>{filter.label}</span>

                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                          isActive
                            ? "bg-sky-400/20 text-sky-100"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        {counts[filter.key]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {filteredNotes.length > 0 && (
              <div className="sticky top-[88px] z-20 rounded-[28px] border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur dark:border-slate-800/80 dark:bg-slate-900/90">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={toggleSelectAllVisible}
                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700/80 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-700/80"
                    >
                      {allVisibleSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                      {allVisibleSelected ? "Deselect All" : "Select All"}
                    </button>

                    <DashboardStatPill label="Visible" value={filteredNotes.length} />

                    {selectedNotes.length > 0 && (
                      <DashboardStatPill
                        label="Selected"
                        value={selectedNotes.length}
                        active
                      />
                    )}

                    <span className="hidden text-xs text-slate-500 dark:text-slate-400 lg:inline">
                      Shortcuts: Ctrl/Cmd + A to select all, Esc to clear
                    </span>
                  </div>

                  {selectedNotes.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                      {activeFilter === "active" && (
                        <>
                          <button
                            type="button"
                            onClick={bulkArchive}
                            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700/80 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-700/80"
                          >
                            <Archive size={15} />
                            Archive Selected
                          </button>

                          <button
                            type="button"
                            onClick={bulkTrash}
                            className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300"
                          >
                            <Trash2 size={15} />
                            Trash Selected
                          </button>
                        </>
                      )}

                      {activeFilter === "archived" && (
                        <>
                          <button
                            type="button"
                            onClick={bulkRestoreFromArchive}
                            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700/80 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-700/80"
                          >
                            <RotateCcw size={15} />
                            Restore Selected
                          </button>

                          <button
                            type="button"
                            onClick={bulkTrash}
                            className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300"
                          >
                            <Trash2 size={15} />
                            Trash Selected
                          </button>
                        </>
                      )}

                      {activeFilter === "trashed" && (
                        <>
                          <button
                            type="button"
                            onClick={bulkRestoreFromTrash}
                            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700/80 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-700/80"
                          >
                            <RotateCcw size={15} />
                            Restore Selected
                          </button>

                          <button
                            type="button"
                            onClick={bulkPermanentDelete}
                            className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300"
                          >
                            <Trash size={15} />
                            Delete Forever
                          </button>
                        </>
                      )}

                      <button
                        type="button"
                        onClick={clearSelection}
                        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700/80 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-700/80"
                      >
                        <X size={15} />
                        Clear
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            <SectionHeader
              title={currentFilterMeta.label}
              subtitle={
                activeFilter === "active"
                  ? "Browse your workspace, open notes for editing, and manage them with ease."
                  : activeFilter === "archived"
                    ? "Archived notes stay hidden from your main workspace until restored."
                    : "Notes in trash can be restored or permanently removed."
              }
              rightSlot={
                <>
                  <DashboardStatPill label="Results" value={filteredNotes.length} />
                  {isSearchMode && (
                    <DashboardStatPill label="Search" value={`"${searchTerm}"`} />
                  )}
                </>
              }
            />

            {loading ? (
              <NotesLoadingGrid />
            ) : hasNoResults ? (
              isSearchMode ? (
                <EmptyState
                  icon={Search}
                  title="No search results"
                  description={`We couldn’t find anything for "${searchTerm}". Try a different keyword or clear the search to see all notes again.`}
                  actionLabel="Clear Search"
                  onAction={() => setSearchTerm("")}
                />
              ) : activeFilter === "active" ? (
                <EmptyState
                  icon={FileText}
                  title="No notes yet"
                  description="Start your workspace by creating your first note. Once you begin, your notes will appear here in a clean, organized view."
                  actionLabel="Create New Note"
                  onAction={handleNewNote}
                />
              ) : activeFilter === "archived" ? (
                <EmptyState
                  icon={Archive}
                  title="No archived notes"
                  description="Archived notes will appear here whenever you move them out of your active workspace."
                />
              ) : (
                <EmptyState
                  icon={Trash2}
                  title="Trash is empty"
                  description="Deleted notes will appear here. You can restore them or permanently remove them later."
                />
              )
            ) : (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {filteredNotes.map((note) => (
                  <NoteCard
                    key={note._id}
                    note={note}
                    viewMode={activeFilter}
                    onEdit={handleEdit}
                    onTrash={handleTrash}
                    onArchiveToggle={handleArchiveToggle}
                    onRestore={handleRestore}
                    onPermanentDelete={handlePermanentDelete}
                    isSelected={selectedNotes.includes(note._id)}
                    onToggleSelect={toggleSelectNote}
                    bulkMode={selectedNotes.length > 0}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </AppShell>

      <EditorDrawer
        open={showEditorDrawer}
        onClose={closeEditorDrawer}
        title={editingId ? "Edit Note" : "Create New Note"}
        subtitle={
          editingId
            ? "Refine your note with rich editing, AI assistance, and collaboration tools."
            : "Start writing with a focused workspace and premium editing experience."
        }
      >
        <NoteForm
          key={editorKey}
          title={title}
          content={content}
          setTitle={setTitle}
          setContent={setContent}
          editingId={editingId}
          handleSubmit={handleSubmit}
          handleCancelEdit={closeEditorDrawer}
          saveStatus={saveStatus}
          attachments={attachments}
          setAttachments={setAttachments}
          tags={tags}
          setTags={setTags}
          isPinned={isPinned}
          setIsPinned={setIsPinned}
        />
      </EditorDrawer>
    </>
  );
}

export default Dashboard;