import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, PlusCircle } from "lucide-react";
import toast from "react-hot-toast";
import API from "../api/axios";
import AppShell from "../components/layout/AppShell";
import NoteForm from "../components/NoteForm";
import NoteCard from "../components/NoteCard";

function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const currentUserId = localStorage.getItem("userId");

  const user = {
    _id: currentUserId,
    name: localStorage.getItem("userName"),
    email: localStorage.getItem("userEmail"),
  };

  const fetchNotes = async () => {
    try {
      const res = await API.get("/notes");
      setNotes(res.data || []);
    } catch (err) {
      console.error("Fetch notes error:", err);
      toast.error("Failed to load notes");
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    if (params.get("create")) {
      setEditingId(null);
      setTitle("");
      setContent("");
      setTags("");
    }

    const editId = params.get("edit");
    if (editId) {
      const note = notes.find((n) => n._id === editId);
      if (note) {
        setEditingId(editId);
        setTitle(note.title || "");
        setContent(note.content || "");
        setTags((note.tags || []).join(", "));
      }
    }
  }, [location.search, notes]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    try {
      const formattedTags = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      if (editingId) {
        await API.put(`/notes/${editingId}`, {
          title,
          content,
          tags: formattedTags,
        });
        toast.success("Note updated successfully");
      } else {
        await API.post("/notes", {
          title,
          content,
          tags: formattedTags,
        });
        toast.success("Note created successfully");
      }

      await fetchNotes();
      setTitle("");
      setContent("");
      setTags("");
      setEditingId(null);
      navigate("/dashboard");
    } catch (err) {
      console.error("Save note error:", err);
      toast.error(err?.response?.data?.message || "Failed to save note");
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/notes/${id}`);
      await fetchNotes();

      if (editingId === id) {
        setEditingId(null);
        setTitle("");
        setContent("");
        setTags("");
        navigate("/dashboard");
      }

      toast.success("Note deleted successfully");
    } catch (err) {
      console.error("Delete note error:", err);
      toast.error(err?.response?.data?.message || "Failed to delete note");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setTitle("");
    setContent("");
    setTags("");
    navigate("/dashboard");
  };

  const handleCreateNew = () => {
    navigate("/dashboard?create=true");
  };

  const handleEdit = (note) => {
    navigate(`/dashboard?edit=${note._id}`);
  };

  const showForm = editingId !== null || location.search.includes("create");

  const filteredNotes = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    const matchedNotes = notes.filter((note) => {
      if (!query) return true;

      const noteTitle = note.title?.toLowerCase() || "";
      const noteContent = note.content?.toLowerCase() || "";
      const noteTags = Array.isArray(note.tags) ? note.tags : [];

      return (
        noteTitle.includes(query) ||
        noteContent.includes(query) ||
        noteTags.some((tag) => tag.toLowerCase().includes(query))
      );
    });

    return matchedNotes.sort((a, b) => {
      if (a.isPinned !== b.isPinned) {
        return b.isPinned - a.isPinned;
      }

      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
  }, [notes, searchTerm]);

  return (
    <AppShell
      title="Dashboard"
      subtitle="Manage your notes"
      onNewNote={handleCreateNew}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
    >
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <AnimatePresence mode="wait">
          {showForm && (
            <motion.div
              key={editingId || "create-note"}
              initial={{ opacity: 0, y: 18, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.985 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="mb-8"
            >
              <NoteForm
                title={title}
                content={content}
                tags={tags}
                setTitle={setTitle}
                setContent={setContent}
                setTags={setTags}
                editingId={editingId}
                handleSubmit={handleSubmit}
                handleCancelEdit={handleCancelEdit}
                user={user}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {!showForm && filteredNotes.length === 0 ? (
          <div className="flex min-h-[420px] items-center justify-center">
            <div className="w-full max-w-2xl rounded-[32px] border border-slate-200 bg-white/80 p-10 text-center shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[#0f172a]/80">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300">
                <FileText size={28} />
              </div>

              <h3 className="mt-6 text-2xl font-semibold text-slate-900 dark:text-white">
                {searchTerm ? "No matching notes found" : "No notes yet"}
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">
                {searchTerm
                  ? "Try a different keyword or clear the search to see all notes."
                  : "Start by creating your first note. You’ll be able to edit, share, pin, and collaborate in real time once it’s created."}
              </p>

              {!searchTerm && (
                <button
                  onClick={handleCreateNew}
                  className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(79,70,229,0.28)] transition duration-300 hover:scale-[1.02]"
                >
                  <PlusCircle size={18} />
                  Create First Note
                </button>
              )}
            </div>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 gap-6 md:grid-cols-2"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {filteredNotes.map((note, index) => (
              <motion.div
                key={note._id}
                variants={cardVariants}
                custom={index}
                layout
              >
                <NoteCard
                  note={note}
                  handleEdit={handleEdit}
                  handleDelete={handleDelete}
                  currentUserId={currentUserId}
                  fetchNotes={fetchNotes}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </AppShell>
  );
}

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.28,
      ease: "easeOut",
    },
  },
};

export default Dashboard;