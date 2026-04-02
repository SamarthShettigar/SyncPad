import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";

function AppShell({
  children,
  title = "Dashboard",
  subtitle = "Manage your collaborative workspace.",
  onNewNote,
  searchTerm = "",
  setSearchTerm = () => {},
  showNewNoteButton = true,
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-[#020617] dark:text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <Sidebar />

        <main className="relative min-w-0 flex-1">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(148,163,184,0.08),transparent_38%)] dark:bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.08),transparent_30%)]" />

          <div className="relative z-10 flex min-h-screen flex-col">
            <Topbar
              title={title}
              subtitle={subtitle}
              onNewNote={onNewNote}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              showNewNoteButton={showNewNoteButton}
            />

            <div className="flex-1 px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
              <div className="mx-auto max-w-7xl">
                <div className="rounded-[32px] border border-slate-200/80 bg-white/70 p-4 shadow-sm backdrop-blur-sm dark:border-slate-800/80 dark:bg-slate-950/35 sm:p-5 lg:p-6">
                  {children}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AppShell;