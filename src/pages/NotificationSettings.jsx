import { useEffect, useState } from "react";
import AppShell from "../components/layout/AppShell";
import {
  getNotificationPrefs,
  setNotificationPrefs,
} from "../utils/notificationPreferences";

function NotificationSettings() {
  const [prefs, setPrefs] = useState({
    sound: true,
    toast: true,
    dnd: false,
  });

  useEffect(() => {
    setPrefs(getNotificationPrefs());
  }, []);

  const updatePref = (key) => {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    setNotificationPrefs(updated);
  };

  return (
    <AppShell title="Notification Settings">
      <div className="max-w-xl space-y-6">
        <h2 className="text-lg font-semibold">Preferences</h2>

        {/* SOUND */}
        <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-xl shadow">
          <span>🔊 Sound</span>
          <button onClick={() => updatePref("sound")}>
            {prefs.sound ? "ON" : "OFF"}
          </button>
        </div>

        {/* TOAST */}
        <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-xl shadow">
          <span>🔔 Toast Notifications</span>
          <button onClick={() => updatePref("toast")}>
            {prefs.toast ? "ON" : "OFF"}
          </button>
        </div>

        {/* DND */}
        <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-xl shadow">
          <span>🌙 Do Not Disturb</span>
          <button onClick={() => updatePref("dnd")}>
            {prefs.dnd ? "ON" : "OFF"}
          </button>
        </div>
      </div>
    </AppShell>
  );
}

export default NotificationSettings;