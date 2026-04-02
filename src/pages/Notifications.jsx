import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  CheckCheck,
  ExternalLink,
  Filter,
  Loader2,
  Search,
  MessageCircle,
  Share2,
  PencilLine,
  AlertCircle,
  Archive,
  Trash2,
  BarChart3,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../api/axios";
import AppShell from "../components/layout/AppShell";

function Notifications() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [viewMode, setViewMode] = useState("active");
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [archivingRead, setArchivingRead] = useState(false);
  const [clearingAll, setClearingAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newIds, setNewIds] = useState([]);

  useEffect(() => {
    fetchNotifications(true);
  }, []);

  useEffect(() => {
    const handleUpdate = async () => {
      try {
        const res = await API.get("/notifications");
        const incoming = Array.isArray(res.data) ? res.data : [];

        setNotifications((prev) => {
          const prevIds = new Set(prev.map((item) => item._id));

          const newOnes = incoming.filter(
            (item) =>
              !prevIds.has(item._id) && !item.isRead && !item.isArchived,
          );

          if (newOnes.length > 0) {
            const ids = newOnes.map((item) => item._id);

            setNewIds((old) => [...new Set([...old, ...ids])]);

            setTimeout(() => {
              setNewIds((old) => old.filter((id) => !ids.includes(id)));
            }, 4000);
          }

          return incoming;
        });
      } catch (error) {
        console.error("Realtime update error:", error);
      }
    };

    window.addEventListener("syncpad-notifications-updated", handleUpdate);

    return () => {
      window.removeEventListener(
        "syncpad-notifications-updated",
        handleUpdate,
      );
    };
  }, []);

  const fetchNotifications = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);

      const res = await API.get("/notifications");
      setNotifications(res.data || []);
    } catch (error) {
      console.error("Fetch notifications error:", error);
      toast.error("Failed to load notifications");
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  const unreadCount = useMemo(
    () =>
      notifications.filter((n) => !n.isRead && !n.isArchived).length,
    [notifications],
  );

  const highPriorityCount = useMemo(
    () =>
      notifications.filter(
        (n) => n.priority === "high" && !n.isRead && !n.isArchived,
      ).length,
    [notifications],
  );

  const archivedCount = useMemo(
    () => notifications.filter((n) => n.isArchived).length,
    [notifications],
  );

  const shareCount = useMemo(
    () =>
      notifications.filter((n) => n.type === "share" && !n.isArchived).length,
    [notifications],
  );

  const chatCount = useMemo(
    () =>
      notifications.filter((n) => n.type === "chat" && !n.isArchived).length,
    [notifications],
  );

  const updateCount = useMemo(
    () =>
      notifications.filter((n) => n.type === "update" && !n.isArchived).length,
    [notifications],
  );

  const filteredNotifications = useMemo(() => {
    let data = [...notifications];

    if (viewMode === "active") {
      data = data.filter((n) => !n.isArchived);
    }

    if (viewMode === "archived") {
      data = data.filter((n) => n.isArchived);
    }

    if (filter === "unread") {
      data = data.filter((n) => !n.isRead);
    }

    if (filter === "read") {
      data = data.filter((n) => n.isRead);
    }

    if (typeFilter !== "all") {
      data = data.filter((n) => n.type === typeFilter);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      data = data.filter(
        (n) =>
          n.message?.toLowerCase().includes(q) ||
          n.note?.title?.toLowerCase().includes(q) ||
          n.senderName?.toLowerCase().includes(q),
      );
    }

    return data;
  }, [notifications, filter, typeFilter, viewMode, searchTerm]);

  const groupNotifications = (list) => {
    const groups = {
      Today: [],
      Yesterday: [],
      Older: [],
    };

    const now = new Date();

    list.forEach((item) => {
      const created = new Date(item.createdAt);

      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);

      const createdDay = new Date(
        created.getFullYear(),
        created.getMonth(),
        created.getDate(),
      );

      if (createdDay.getTime() === today.getTime()) {
        groups.Today.push(item);
      } else if (createdDay.getTime() === yesterday.getTime()) {
        groups.Yesterday.push(item);
      } else {
        groups.Older.push(item);
      }
    });

    return groups;
  };

  const grouped = groupNotifications(filteredNotifications);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;

    const mins = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins} min ago`;
    if (hours < 24) return `${hours} hr ago`;
    if (days === 1) return "Yesterday";

    return date.toLocaleDateString();
  };

  const getTypeIcon = (type) => {
    if (type === "share") return <Share2 size={16} />;
    if (type === "chat") return <MessageCircle size={16} />;
    return <PencilLine size={16} />;
  };

  const getTypeBadgeClass = (type) => {
    if (type === "share") {
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
    }
    if (type === "chat") {
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300";
    }
    return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300";
  };

  const handleMarkSingleAsRead = async (notificationId) => {
    try {
      await API.put(`/notifications/${notificationId}/read`);

      setNotifications((prev) =>
        prev.map((item) =>
          item._id === notificationId ? { ...item, isRead: true } : item,
        ),
      );

      window.dispatchEvent(new Event("syncpad-notifications-updated"));
    } catch (error) {
      console.error("Mark single read error:", error);
      toast.error("Failed to mark notification as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setMarkingAll(true);

      await API.put("/notifications/read-all");

      setNotifications((prev) =>
        prev.map((item) => ({ ...item, isRead: true })),
      );

      window.dispatchEvent(new Event("syncpad-notifications-updated"));
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Mark all read error:", error);
      toast.error("Failed to mark all notifications");
    } finally {
      setMarkingAll(false);
    }
  };

  const handleArchiveSingle = async (notificationId) => {
    try {
      await API.put(`/notifications/${notificationId}/archive`);

      setNotifications((prev) =>
        prev.map((item) =>
          item._id === notificationId ? { ...item, isArchived: true } : item,
        ),
      );

      toast.success("Notification archived");
      window.dispatchEvent(new Event("syncpad-notifications-updated"));
    } catch (error) {
      console.error("Archive single error:", error);
      toast.error("Failed to archive notification");
    }
  };

  const handleArchiveRead = async () => {
    try {
      setArchivingRead(true);

      await API.put("/notifications/archive-read");

      setNotifications((prev) =>
        prev.map((item) =>
          item.isRead ? { ...item, isArchived: true } : item,
        ),
      );

      toast.success("Read notifications archived");
      window.dispatchEvent(new Event("syncpad-notifications-updated"));
    } catch (error) {
      console.error("Archive read error:", error);
      toast.error("Failed to archive read notifications");
    } finally {
      setArchivingRead(false);
    }
  };

  const handleClearAll = async () => {
    try {
      setClearingAll(true);

      await API.delete("/notifications/clear-all");

      setNotifications([]);
      toast.success("All notifications cleared");
      window.dispatchEvent(new Event("syncpad-notifications-updated"));
    } catch (error) {
      console.error("Clear all error:", error);
      toast.error("Failed to clear notifications");
    } finally {
      setClearingAll(false);
    }
  };

  const handleOpenNotification = async (notification) => {
    if (!notification.isRead) {
      await handleMarkSingleAsRead(notification._id);
    }

    if (notification.note?._id) {
      navigate(`/dashboard?edit=${notification.note._id}`);
    } else {
      navigate("/dashboard");
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 16, scale: 0.985 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -8, scale: 0.985 },
  };

  const renderNotificationCard = (item, index) => {
    const isNew = newIds.includes(item._id);
    const isHighPriority = item.priority === "high";

    return (
      <motion.div
        key={item._id}
        layout
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={cardVariants}
        transition={{ delay: index * 0.03 }}
        className={`group relative overflow-hidden rounded-[24px] border p-5 text-left shadow-sm transition-all ${
          item.isRead
            ? "border-slate-200 bg-white hover:border-indigo-200 hover:shadow-md dark:border-white/10 dark:bg-[#0f172a] dark:hover:border-indigo-500/20"
            : "border-indigo-200 bg-gradient-to-r from-indigo-50 via-white to-white hover:shadow-lg dark:border-indigo-500/20 dark:bg-indigo-500/10"
        } ${isHighPriority ? "ring-2 ring-rose-200 dark:ring-rose-900/40" : ""}`}
      >
        <AnimatePresence>
          {isNew && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 rounded-[24px] bg-indigo-400/10"
            />
          )}
        </AnimatePresence>

        <div className="relative flex items-start gap-4">
          <div
            className={`mt-1.5 h-3 w-3 shrink-0 rounded-full ${
              item.isRead ? "bg-slate-300 dark:bg-slate-600" : "bg-indigo-500"
            }`}
          />

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${getTypeBadgeClass(item.type)}`}
                  >
                    {getTypeIcon(item.type)}
                    {item.type}
                  </span>

                  {isHighPriority && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-1 text-[11px] font-semibold text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
                      <AlertCircle size={14} />
                      important
                    </span>
                  )}

                  {item.isArchived && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                      <Archive size={14} />
                      archived
                    </span>
                  )}
                </div>

                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {item.message}
                </p>

                {item.note?.title && (
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Note: {item.note.title}
                  </p>
                )}

                <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                  {formatTime(item.createdAt)}
                </p>
              </div>

              <motion.button
                whileHover={{ x: 2 }}
                onClick={() => handleOpenNotification(item)}
                className="shrink-0 text-slate-400 transition hover:text-indigo-500"
              >
                <ExternalLink size={18} />
              </motion.button>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {!item.isRead && (
                <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                  Unread
                </span>
              )}

              {isNew && (
                <motion.span
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                >
                  New arrival
                </motion.span>
              )}

              {!item.isArchived && (
                <button
                  onClick={() => handleArchiveSingle(item._id)}
                  className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  Archive
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <AppShell
      title="Notifications"
      subtitle="Track shares, updates, chat activity, and archived history"
    >
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-[30px] border border-slate-200/70 bg-white p-5 shadow-xl shadow-slate-200/40 dark:border-white/10 dark:bg-[#0f172a] dark:shadow-none"
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-indigo-100 p-3 dark:bg-indigo-900/40">
                  <Bell className="text-indigo-600 dark:text-indigo-300" />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Notification Center
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Analytics, archive, and lifecycle controls
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-6">
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-white/10 dark:bg-slate-900/60">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Total
                  </p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">
                    {notifications.length}
                  </p>
                </div>

                <div className="rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3 shadow-sm dark:border-indigo-800 dark:bg-indigo-950/30">
                  <p className="text-xs text-indigo-600 dark:text-indigo-300">
                    Unread
                  </p>
                  <p className="text-lg font-bold text-indigo-700 dark:text-indigo-200">
                    {unreadCount}
                  </p>
                </div>

                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 shadow-sm dark:border-rose-800 dark:bg-rose-950/30">
                  <p className="text-xs text-rose-600 dark:text-rose-300">
                    Important
                  </p>
                  <p className="text-lg font-bold text-rose-700 dark:text-rose-200">
                    {highPriorityCount}
                  </p>
                </div>

                <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 shadow-sm dark:border-blue-800 dark:bg-blue-950/30">
                  <p className="text-xs text-blue-600 dark:text-blue-300">
                    Share
                  </p>
                  <p className="text-lg font-bold text-blue-700 dark:text-blue-200">
                    {shareCount}
                  </p>
                </div>

                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 shadow-sm dark:border-emerald-800 dark:bg-emerald-950/30">
                  <p className="text-xs text-emerald-600 dark:text-emerald-300">
                    Chat
                  </p>
                  <p className="text-lg font-bold text-emerald-700 dark:text-emerald-200">
                    {chatCount}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Archived
                  </p>
                  <p className="text-lg font-bold text-slate-700 dark:text-slate-200">
                    {archivedCount}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-white/10 dark:bg-slate-900/60">
                <Search size={17} className="text-slate-400" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-52 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-200"
                />
              </div>

              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleMarkAllAsRead}
                disabled={markingAll || unreadCount === 0}
                className="inline-flex items-center gap-2 rounded-2xl bg-black px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-900"
              >
                {markingAll ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <CheckCheck size={16} />
                )}
                Mark all read
              </motion.button>

              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleArchiveRead}
                disabled={archivingRead}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-800 px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-700"
              >
                {archivingRead ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Archive size={16} />
                )}
                Archive read
              </motion.button>

              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleClearAll}
                disabled={clearingAll || notifications.length === 0}
                className="inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {clearingAll ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Trash2 size={16} />
                )}
                Clear all
              </motion.button>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="flex flex-wrap items-center gap-3"
        >
          <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-white/10 dark:bg-slate-900/60">
            <BarChart3 size={16} className="text-slate-400" />
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
              View
            </span>
          </div>

          {["active", "archived"].map((item) => (
            <motion.button
              key={item}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setViewMode(item)}
              className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                viewMode === item
                  ? "bg-gradient-to-r from-slate-900 to-slate-700 text-white shadow-lg dark:from-white dark:to-slate-300 dark:text-slate-900"
                  : "border border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:text-indigo-600 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-200"
              }`}
            >
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </motion.button>
          ))}

          <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-white/10 dark:bg-slate-900/60">
            <Filter size={16} className="text-slate-400" />
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Status
            </span>
          </div>

          {["all", "unread", "read"].map((item) => (
            <motion.button
              key={item}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setFilter(item)}
              className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                filter === item
                  ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20"
                  : "border border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:text-indigo-600 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-200"
              }`}
            >
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </motion.button>
          ))}

          <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-white/10 dark:bg-slate-900/60">
            <Filter size={16} className="text-slate-400" />
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Type
            </span>
          </div>

          {["all", "share", "update", "chat"].map((item) => (
            <motion.button
              key={item}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setTypeFilter(item)}
              className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                typeFilter === item
                  ? "bg-gradient-to-r from-slate-900 to-slate-700 text-white shadow-lg dark:from-white dark:to-slate-300 dark:text-slate-900"
                  : "border border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:text-indigo-600 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-200"
              }`}
            >
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </motion.button>
          ))}
        </motion.div>

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <Loader2 className="animate-spin text-slate-400" size={28} />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-16 text-center dark:border-white/10 dark:bg-[#0f172a]"
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 dark:bg-slate-800">
              <Bell className="text-slate-500" />
            </div>

            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              No notifications found
            </h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Try changing your filters or search term.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {Object.entries(grouped).map(([label, items]) => {
              if (items.length === 0) return null;

              return (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                      {label}
                    </p>
                    <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
                  </div>

                  <div className="grid gap-4">
                    <AnimatePresence initial={false}>
                      {items.map((item, index) =>
                        renderNotificationCard(item, index),
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}

export default Notifications;