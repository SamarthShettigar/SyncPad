import React, { useEffect, useState } from "react";
import socket from "../socket";
import API from "../api/axios";
import toast from "react-hot-toast";
import NoteEditor from "./NoteEditor";
import AIAssistant from "./AIAssistant";
import AISmartBar from "./AISmartBar";
import AIMetadataBar from "./AIMetadataBar";
import AIResultPreview from "./AIResultPreview";
import AITemplateCards from "./AITemplateCards";
import AISmartActionsPanel from "./AISmartActionsPanel";
import NoteInsightsPanel from "./NoteInsightsPanel";
import AICollaborationPanel from "./AICollaborationPanel";
import AIFloatingButton from "./AIFloatingButton";
import AIDrawer from "./AIDrawer";

function NoteForm({
  title,
  content,
  tags = [],
  attachments = [],
  setTitle,
  setContent,
  setTags,
  editingId,
  handleSubmit,
  handleCancelEdit,
}) {
  const [collaborators, setCollaborators] = useState(0);
  const [isSomeoneTyping, setIsSomeoneTyping] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [versions, setVersions] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [aiPreviewResult, setAiPreviewResult] = useState("");
  const [aiPreviewTitle, setAiPreviewTitle] = useState("AI Result");
  const [slashLoading, setSlashLoading] = useState(false);

  const [showAIDrawer, setShowAIDrawer] = useState(false);
  const [aiResultHistory, setAiResultHistory] = useState([]);
  const [pinnedAIResults, setPinnedAIResults] = useState([]);

  const isEditing = Boolean(editingId);
  const isCreateMode = !isEditing;

  useEffect(() => {
    if (!editingId) {
      setCollaborators(0);
      setShowHistory(false);
      setVersions([]);
      return;
    }

    socket.emit("join-note", editingId);

    const handleCollaborators = (count) => setCollaborators(count);
    const handleTyping = (typing) => setIsSomeoneTyping(typing);

    socket.on("collaborators", handleCollaborators);
    socket.on("user-typing", handleTyping);

    return () => {
      socket.emit("leave-note", editingId);
      socket.off("collaborators", handleCollaborators);
      socket.off("user-typing", handleTyping);
    };
  }, [editingId]);

  useEffect(() => {
    if (editingId) {
      fetchVersions();
    } else {
      setVersions([]);
    }
  }, [editingId]);

  const fetchVersions = async () => {
    if (!editingId) return;

    try {
      setLoadingHistory(true);
      const res = await API.get(`/notes/${editingId}/versions`);
      setVersions(res.data || []);
    } catch {
      toast.error("Failed to load version history");
    } finally {
      setLoadingHistory(false);
    }
  };

  const pushAIHistory = (result, previewTitle) => {
    const item = {
      id: Date.now().toString(),
      title: previewTitle || "AI Result",
      result,
      createdAt: new Date().toISOString(),
    };

    setAiResultHistory((prev) => [item, ...prev].slice(0, 12));
  };

  const handleTogglePin = () => {
    if (!aiPreviewResult) {
      toast.error("No AI result to pin");
      return;
    }

    const item = {
      id: `${Date.now()}`,
      title: aiPreviewTitle || "AI Result",
      result: aiPreviewResult,
      createdAt: new Date().toISOString(),
    };

    setPinnedAIResults((prev) => [item, ...prev].slice(0, 10));
    toast.success("Pinned AI result");
  };

  const handleRestoreAIHistory = (item) => {
    setAiPreviewTitle(item.title);
    setAiPreviewResult(item.result);
    setShowAIDrawer(true);
    toast.success("AI result restored");
  };

  const handleToggleHistory = async () => {
    const next = !showHistory;
    setShowHistory(next);

    if (next && versions.length === 0) {
      await fetchVersions();
    }
  };

  const handleRestoreVersion = async (versionId) => {
    try {
      await API.put(`/notes/${editingId}/restore/${versionId}`);
      toast.success("Version restored");
      await fetchVersions();
    } catch {
      toast.error("Failed to restore version");
    }
  };

  const handlePreviewResult = (result, previewTitle = "AI Result") => {
    setAiPreviewResult(result);
    setAiPreviewTitle(previewTitle);
    pushAIHistory(result, previewTitle);
    setShowAIDrawer(true);
  };

  const handleApplyPreview = (html) => {
    setContent(html);
    setAiPreviewResult("");
  };

  const handleInsertPreview = (html) => {
    setContent((prev) => `${prev || ""}<hr /><p><br /></p>${html}`);
    setAiPreviewResult("");
  };

  const runAIAction = async (type, label) => {
    if (!content || !content.trim()) {
      toast.error("Write something in the note first");
      return;
    }

    try {
      setSlashLoading(true);

      const res = await API.post("/ai/action", {
        type,
        content,
      });

      const result = (res.data?.result || "").trim();

      if (!result) {
        toast.error("No AI result received");
        return;
      }

      if (type === "title") {
        setTitle(result);
        toast.success("AI title generated");
        return;
      }

      if (type === "tags") {
        const generatedTags = result
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
          .slice(0, 5);

        setTags(generatedTags);
        toast.success("AI tags generated");
        return;
      }

      handlePreviewResult(result, `${label} Preview`);
      toast.success(`${label} ready`);
    } catch {
      toast.error("AI action failed");
    } finally {
      setSlashLoading(false);
    }
  };

  const handleAISlashAction = async (type, label) => {
    await runAIAction(type, label);
  };

  const handleUseTemplate = (template) => {
    setTitle(template.noteTitle);
    setContent(template.html);
    toast.success(`${template.title} template added`);
  };

  const handleInsightSuggestion = async (item) => {
    switch (item.key) {
      case "missing-title":
        await runAIAction("title", "Generate Title");
        break;
      case "missing-tags":
        await runAIAction("tags", "Generate Tags");
        break;
      case "no-headings":
      case "too-long":
        await runAIAction("summarize", "Summarize");
        break;
      case "dense-writing":
        await runAIAction("improve", "Improve Writing");
        break;
      case "needs-bullets":
        await runAIAction("bullets", "Convert to Bullets");
        break;
      case "too-short":
        await runAIAction("expand", "Expand Note");
        break;
      default:
        break;
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0 flex-1">
              <input
                type="text"
                placeholder="Enter note title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-2xl font-bold tracking-tight text-slate-900 outline-none transition focus:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-slate-600"
              />

              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                {isEditing && (
                  <span className="rounded-full bg-slate-100 px-3 py-1.5 font-medium dark:bg-slate-800">
                    {collaborators} collaborator{collaborators !== 1 ? "s" : ""} online
                  </span>
                )}

                {isSomeoneTyping && (
                  <span className="rounded-full bg-slate-100 px-3 py-1.5 font-medium dark:bg-slate-800">
                    Someone is typing...
                  </span>
                )}

                {slashLoading && (
                  <span className="rounded-full bg-slate-900 px-3 py-1.5 font-medium text-white dark:bg-white dark:text-slate-900">
                    AI is working...
                  </span>
                )}

                <span className="rounded-full bg-slate-100 px-3 py-1.5 font-medium dark:bg-slate-800">
                  {content.replace(/<[^>]*>/g, "").trim().length} chars
                </span>
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap gap-2">
              {isEditing && (
                <button
                  type="button"
                  onClick={handleToggleHistory}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  {showHistory ? "Hide History" : "Show History"}
                </button>
              )}

              <button
                type="button"
                onClick={handleCancelEdit}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                className="rounded-2xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 dark:bg-white dark:text-slate-900"
              >
                {isEditing ? "Update Note" : "Create Note"}
              </button>
            </div>
          </div>
        </div>

        {isCreateMode && !content?.trim() && (
          <AITemplateCards onUseTemplate={handleUseTemplate} />
        )}

        <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <NoteEditor
            value={content}
            onChange={setContent}
            onAIMenuAction={handleAISlashAction}
          />
        </div>

        {aiPreviewResult && (
          <AIResultPreview
            result={aiPreviewResult}
            title={aiPreviewTitle}
            onApply={handleApplyPreview}
            onInsert={handleInsertPreview}
            onClose={() => setAiPreviewResult("")}
          />
        )}

        <div className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                AI Workspace
              </h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Use AI to improve, summarize, organize, and refine this note.
              </p>
            </div>

            <AIAssistant
              content={content}
              setContent={setContent}
              setTitle={setTitle}
            />
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <AISmartBar
              title={title}
              content={content}
              tags={tags}
              setTitle={setTitle}
              setTags={setTags}
              onPreviewResult={handlePreviewResult}
            />
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <AIMetadataBar title={title} tags={tags} />
          </div>

          {isEditing && (
            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <AISmartActionsPanel
                content={content}
                onPreviewResult={handlePreviewResult}
              />
            </div>
          )}

          {isEditing && (
            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <NoteInsightsPanel
                title={title}
                content={content}
                tags={tags}
                attachments={attachments}
                onSuggestionAction={handleInsightSuggestion}
              />
            </div>
          )}

          {isEditing && (
            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <AICollaborationPanel
                content={content}
                versions={versions}
                onPreviewResult={handlePreviewResult}
              />
            </div>
          )}
        </div>

        {showHistory && isEditing && (
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
              Version History
            </h3>

            {loadingHistory ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Loading history...
              </p>
            ) : versions.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No versions found.
              </p>
            ) : (
              <div className="space-y-3">
                {versions.map((version) => (
                  <div
                    key={version._id}
                    className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800 lg:flex-row lg:items-center lg:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 dark:text-white">
                        {version.title || "Untitled Version"}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {new Date(
                          version.editedAt || version.savedAt || Date.now(),
                        ).toLocaleString()}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRestoreVersion(version._id)}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      Restore
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="fixed bottom-6 right-6 z-[70]">
        <AIFloatingButton onClick={() => setShowAIDrawer(true)} />
      </div>

      <AIDrawer
        open={showAIDrawer}
        onClose={() => setShowAIDrawer(false)}
        result={aiPreviewResult}
        resultTitle={aiPreviewTitle}
        resultHistory={aiResultHistory}
        pinnedResults={pinnedAIResults}
        onApply={handleApplyPreview}
        onInsert={handleInsertPreview}
        onRestoreHistory={handleRestoreAIHistory}
        onTogglePin={handleTogglePin}
        editingId={editingId}
        noteTitle={title}
        fetchVersions={fetchVersions}
      />
    </>
  );
}

export default NoteForm;