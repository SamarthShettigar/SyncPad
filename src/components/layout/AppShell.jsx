import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function AppShell({
  children,
  title,
  subtitle,
  onNewNote,
  searchTerm,
  setSearchTerm,
}) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 transition-colors duration-300 dark:bg-[#020617] dark:text-white">
      <div className="mx-auto flex min-h-screen max-w-[1550px]">
        <Sidebar />

        <main className="min-w-0 flex-1">
          <Topbar
            title={title}
            subtitle={subtitle}
            onNewNote={onNewNote}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />

          <div className="px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
            <div className="mx-auto max-w-6xl">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AppShell;