/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Task,
  AlarmItem,
  WallpaperItem,
  CustomSound,
  AppSettings,
  AppPage,
} from './types';
import {
  DEFAULT_SETTINGS,
  TRANSLATIONS,
  BUILTIN_SOUNDS,
} from './constants';
import { loadStorage, saveStorage } from './utils/storage';
import {
  playAudioSound,
  stopAudioPlayback,
  triggerVibration,
  requestNotificationPermission,
  sendSystemNotification,
} from './utils/audio';
import {
  sendAndroidSystemNotification,
  initNotifications,
  scheduleNativeAlarm,
  cancelNativeAlarm,
} from './utils/notifications';
import { motion, AnimatePresence, type Variants } from 'motion/react';

const PAGE_ORDER: AppPage[] = ['dash', 'alarm', 'set'];

import { Header } from './components/Header';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { AlarmView } from './components/AlarmView';
import { SettingsView } from './components/SettingsView';
import { AddTaskModal } from './components/AddTaskModal';
import { AlarmRingingModal } from './components/AlarmRingingModal';
import { Toast } from './components/Toast';
import { WallpaperBackground } from './components/WallpaperBackground';

export default function App() {
  // Application State
  const [settings, setSettings] = useState<AppSettings>(() =>
    loadStorage<AppSettings>('st', DEFAULT_SETTINGS)
  );
  const [tasks, setTasks] = useState<Task[]>(() => loadStorage<Task[]>('tk', []));
  const [alarms, setAlarms] = useState<AlarmItem[]>(() =>
    loadStorage<AlarmItem[]>('al', [])
  );
  const [wallpapers, setWallpapers] = useState<WallpaperItem[]>(() =>
    loadStorage<WallpaperItem[]>('wl', [])
  );
  const [customSounds, setCustomSounds] = useState<CustomSound[]>(() =>
    loadStorage<CustomSound[]>('sd', [])
  );

  const [currentPage, setCurrentPage] = useState<AppPage>('dash');
  const [direction, setDirection] = useState<number>(0);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isRinging, setIsRinging] = useState(false);
  const [ringingSoundId, setRingingSoundId] = useState<string>('beep');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  const lastCheckedSecondRef = useRef<string>('');
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const t = TRANSLATIONS[settings.lang];

  // Helper for showing in-app toast + optional system notification
  const showToast = useCallback(
    (msg: string) => {
      setToastMessage(msg);
      sendSystemNotification('AryNotes', { body: msg });
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = setTimeout(() => {
        setToastMessage(null);
      }, 5000);
    },
    []
  );

  // Initialize notifications (both Capacitor Android channels & Web Service Worker)
  useEffect(() => {
    initNotifications();
  }, []);

  // Sync settings theme & accent color to DOM
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = settings.theme;
    root.classList.toggle('dark', settings.theme === 'dark');
    root.style.setProperty('--ac', settings.ac);
    saveStorage('st', settings);
  }, [settings]);

  // Persist tasks, alarms, wallpapers, custom sounds
  useEffect(() => {
    saveStorage('tk', tasks);
  }, [tasks]);

  useEffect(() => {
    saveStorage('al', alarms);
  }, [alarms]);

  useEffect(() => {
    saveStorage('wl', wallpapers);
  }, [wallpapers]);

  useEffect(() => {
    saveStorage('sd', customSounds);
  }, [customSounds]);

  // Auto-purge completed tasks older than 7 days (604800000 ms)
  const purgeOldTasks = useCallback(() => {
    const now = Date.now();
    setTasks((prev) => {
      const filtered = prev.filter(
        (task) => !task.d || now - task.d < 604800000
      );
      if (filtered.length !== prev.length) {
        saveStorage('tk', filtered);
        return filtered;
      }
      return prev;
    });
  }, []);

  // Main background ticker for alarms, overdue alerts, and scheduled reminders
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentSecondKey = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;

      if (currentSecondKey !== lastCheckedSecondRef.current) {
        lastCheckedSecondRef.current = currentSecondKey;

        // 1. Check Alarms
        const matchingAlarm = alarms.find(
          (a) =>
            Boolean(a.on) &&
            a.h === now.getHours() &&
            a.m === now.getMinutes() &&
            a.s === now.getSeconds()
        );

        if (matchingAlarm) {
          setIsRinging(true);
          setRingingSoundId(matchingAlarm.snd);
          playAudioSound(matchingAlarm.snd, true, customSounds);
          triggerVibration([400, 200, 400]);
          sendAndroidSystemNotification('⏰ Alarm Berbunyi - AryNotes', {
            body: `Alarm ${String(matchingAlarm.h).padStart(2, '0')}:${String(matchingAlarm.m).padStart(2, '0')}:${String(matchingAlarm.s).padStart(2, '0')} sedang aktif! Ketuk untuk membuka aplikasi.`,
            tag: 'alarm-ring',
          });
        }

        // 2. Check Custom Reminder
        const unfinishedCount = tasks.filter((x) => !x.d).length;
        if (
          unfinishedCount > 0 &&
          settings.rem === 'custom' &&
          (settings.cd || []).includes(now.getDay()) &&
          settings.ch === now.getHours() &&
          settings.cm === now.getMinutes() &&
          settings.cs === now.getSeconds()
        ) {
          showToast(`${t.remMsg} (${unfinishedCount})`);
          sendAndroidSystemNotification('AryNotes - Pengingat Tugas', {
            body: `${t.remMsg} (${unfinishedCount} tugas belum selesai)`,
            tag: 'custom-reminder',
          });
        }

        // 3. Check Daily / Weekly interval reminders
        const reminderIntervalMs =
          settings.rem === 'daily'
            ? 86400000
            : settings.rem === 'weekly'
            ? 604800000
            : 0;

        if (
          reminderIntervalMs > 0 &&
          Date.now() - settings.last >= reminderIntervalMs
        ) {
          setSettings((prev) => ({ ...prev, last: Date.now() }));
          if (unfinishedCount > 0) {
            showToast(`${t.remMsg} (${unfinishedCount})`);
            sendAndroidSystemNotification('AryNotes - Pengingat Rutin', {
              body: `${t.remMsg} (${unfinishedCount} tugas belum selesai)`,
              tag: 'interval-reminder',
            });
          }
        }

        // 4. Check Overdue Tasks
        const overdueTasks = tasks.filter(
          (x) => x.e && !x.d && !x.nt && Date.now() > x.e
        );
        if (overdueTasks.length > 0) {
          setTasks((prev) =>
            prev.map((item) =>
              item.e && !item.d && !item.nt && Date.now() > item.e
                ? { ...item, nt: 1 }
                : item
            )
          );
          showToast(
            `${t.late}: ${overdueTasks.map((x) => x.n).join(', ')}`
          );
          sendAndroidSystemNotification(`⚠️ ${t.late}`, {
            body: overdueTasks.map((x) => x.n).join(', '),
            tag: 'overdue-tasks',
          });
        }

        // Periodic purge of old completed tasks
        purgeOldTasks();
      }
    }, 500);

    return () => clearInterval(interval);
  }, [
    alarms,
    customSounds,
    tasks,
    settings,
    showToast,
    purgeOldTasks,
    t.ringTitle,
    t.remMsg,
    t.late,
  ]);

  // Request notification permissions on user interaction
  const handleUserGesture = () => {
    requestNotificationPermission();
  };

  // Task actions
  const handleAddTask = (name: string, deadline: number) => {
    handleUserGesture();
    const newTask: Task = {
      i: Date.now(),
      n: name,
      d: 0,
      e: deadline,
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleQuickAdd = (name: string) => {
    handleAddTask(name, 0);
  };

  const handleToggleTask = (id: number) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.i === id ? { ...task, d: task.d ? 0 : Date.now() } : task
      )
    );
  };

  const handleDeleteTask = (id: number) => {
    setTasks((prev) => prev.filter((task) => task.i !== id));
  };

  // Alarm actions
  const handleAddAlarm = (
    h: number,
    m: number,
    s: number,
    soundId: string
  ) => {
    handleUserGesture();
    const newAlarm: AlarmItem = {
      i: Date.now(),
      h,
      m,
      s,
      on: 1,
      snd: soundId,
    };
    setAlarms((prev) => [...prev, newAlarm]);

    // Schedule native Android alarm in AlarmManager
    const trigger = new Date();
    trigger.setHours(h, m, s, 0);
    if (trigger.getTime() <= Date.now()) {
      trigger.setDate(trigger.getDate() + 1);
    }
    scheduleNativeAlarm(
      newAlarm.i,
      '⏰ Alarm Berbunyi - AryNotes',
      `Alarm ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')} sedang aktif!`,
      trigger
    );

    showToast(
      `${t.alarm}: ${String(h).padStart(2, '0')}:${String(m).padStart(
        2,
        '0'
      )}:${String(s).padStart(2, '0')}`
    );
  };

  const handleToggleAlarm = (id: number) => {
    setAlarms((prev) =>
      prev.map((alarm) => {
        if (alarm.i === id) {
          const nextOn = alarm.on ? 0 : 1;
          if (nextOn === 1) {
            const trigger = new Date();
            trigger.setHours(alarm.h, alarm.m, alarm.s, 0);
            if (trigger.getTime() <= Date.now()) {
              trigger.setDate(trigger.getDate() + 1);
            }
            scheduleNativeAlarm(
              alarm.i,
              '⏰ Alarm Berbunyi - AryNotes',
              `Alarm ${String(alarm.h).padStart(2, '0')}:${String(alarm.m).padStart(2, '0')}:${String(alarm.s).padStart(2, '0')} sedang aktif!`,
              trigger
            );
          } else {
            cancelNativeAlarm(alarm.i);
          }
          return { ...alarm, on: nextOn };
        }
        return alarm;
      })
    );
  };

  const handleDeleteAlarm = (id: number) => {
    cancelNativeAlarm(id);
    setAlarms((prev) => prev.filter((alarm) => alarm.i !== id));
  };

  const handleStopRinging = () => {
    setIsRinging(false);
    stopAudioPlayback();
  };

  // Sound actions
  const handleSelectSound = (soundId: string) => {
    setSettings((prev) => ({ ...prev, snd: soundId }));
  };

  const handlePreviewSound = (soundId: string) => {
    setIsPlayingPreview(true);
    playAudioSound(soundId, false, customSounds, () => {
      setIsPlayingPreview(false);
    });
  };

  const handleStopPreviewSound = () => {
    setIsPlayingPreview(false);
    stopAudioPlayback();
  };

  const handleUploadSound = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const id = 'c' + Date.now();
      const newSound: CustomSound = {
        id,
        n: file.name,
        u: reader.result as string,
      };
      const updated = [...customSounds, newSound];
      const saved = saveStorage('sd', updated);
      if (!saved) {
        showToast(t.nosave);
        return;
      }
      setCustomSounds(updated);
      setSettings((prev) => ({ ...prev, snd: id }));
      showToast(`+ ${file.name}`);
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteCustomSound = (id: string) => {
    setCustomSounds((prev) => prev.filter((s) => s.id !== id));
    if (settings.snd === id) {
      setSettings((prev) => ({ ...prev, snd: 'beep' }));
    }
    stopAudioPlayback();
    setIsPlayingPreview(false);
  };

  // Wallpaper actions
  const handleAddWallpaper = (file: File) => {
    const img = new Image();
    img.onload = () => {
      const maxDim = 900;
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        const id = 'w' + Date.now();
        const newWallpaper: WallpaperItem = {
          id,
          u: dataUrl,
          x: 50,
          y: 50,
          z: 100,
        };
        const updated = [...wallpapers, newWallpaper];
        const ok = saveStorage('wl', updated);
        if (!ok) {
          showToast(t.nosave);
          return;
        }
        setWallpapers(updated);
        setSettings((prev) => ({ ...prev, wp: id }));
      }
    };
    img.src = URL.createObjectURL(file);
  };

  const handleDeleteWallpaper = (id: string) => {
    setWallpapers((prev) => prev.filter((w) => w.id !== id));
    if (settings.wp === id) {
      setSettings((prev) => ({ ...prev, wp: null }));
    }
  };

  const handleUpdateWallpaperParams = (
    id: string,
    params: { x?: number; y?: number; z?: number }
  ) => {
    setWallpapers((prev) =>
      prev.map((w) => (w.id === id ? { ...w, ...params } : w))
    );
  };

  const handleApplyWallpaper = (id: string) => {
    setSettings((prev) => ({ ...prev, wp: id }));
    showToast(t.use);
  };

  const handleResetWallpaper = () => {
    setSettings((prev) => ({ ...prev, wp: null }));
    showToast(t.reset);
  };

  // Screen transition variants for directional sliding
  const screenVariants: Variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 44 : dir < 0 ? -44 : 0,
      opacity: 0,
      filter: 'blur(3px)',
    }),
    center: {
      x: 0,
      opacity: 1,
      filter: 'blur(0px)',
      transition: {
        type: 'spring' as const,
        stiffness: 340,
        damping: 28,
        mass: 0.8,
      },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -44 : dir < 0 ? 44 : 0,
      opacity: 0,
      filter: 'blur(3px)',
      transition: {
        duration: 0.18,
        ease: [0.4, 0, 0.2, 1],
      },
    }),
  };

  // Page navigation with direction awareness
  const handleNavigate = (page: AppPage) => {
    if (page === currentPage) return;
    const currentIndex = PAGE_ORDER.indexOf(currentPage);
    const newIndex = PAGE_ORDER.indexOf(page);
    setDirection(newIndex > currentIndex ? 1 : -1);
    handleUserGesture();
    stopAudioPlayback();
    setIsPlayingPreview(false);
    setCurrentPage(page);
  };

  const handleToggleTheme = () => {
    setSettings((prev) => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }));
  };

  const activeWallpaper = wallpapers.find((w) => w.id === settings.wp) || null;
  const activeAlarmCount = alarms.filter((a) => a.on).length;
  const unfinishedTasks = tasks.filter((x) => !x.d);

  const getSoundDisplayName = (id: string) => {
    if (BUILTIN_SOUNDS[id]) return BUILTIN_SOUNDS[id].n;
    const c = customSounds.find((s) => s.id === id);
    return c ? c.n : 'Beep';
  };

  return (
    <div
      onClick={handleUserGesture}
      className="app-bg h-full w-full flex flex-col justify-between overflow-hidden relative select-none"
    >
      {/* Centered App Container */}
      <div className="w-full max-w-md mx-auto h-full flex flex-col relative overflow-hidden">
        {/* Background Wallpaper for Dashboard */}
        <WallpaperBackground
          wallpaper={activeWallpaper}
          isVisible={currentPage === 'dash'}
        />

        {/* In-app Toast Banner */}
        <Toast
          message={toastMessage}
          onClose={() => setToastMessage(null)}
        />

        {/* Fullscreen Alarm Ringing Modal */}
        <AlarmRingingModal
          isOpen={isRinging}
          onStop={handleStopRinging}
          lang={settings.lang}
          soundName={getSoundDisplayName(ringingSoundId)}
          unfinishedTasks={unfinishedTasks}
        />

        {/* Add Task Modal Bottom Sheet */}
        <AddTaskModal
          isOpen={isAddTaskOpen}
          onClose={() => setIsAddTaskOpen(false)}
          onAdd={handleAddTask}
          lang={settings.lang}
        />

        {/* Header with Top Navigation Tabs */}
        <Header
          currentPage={currentPage}
          onNavigate={handleNavigate}
          lang={settings.lang}
          theme={settings.theme}
          onToggleTheme={handleToggleTheme}
          activeAlarmCount={activeAlarmCount}
          pendingTaskCount={unfinishedTasks.length}
        />

        {/* Main Content Area with Screen Transition Animation */}
        <main className="flex-1 min-h-0 flex flex-col relative z-10 overflow-hidden">
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <motion.div
              key={currentPage}
              custom={direction}
              variants={screenVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full h-full flex flex-col min-h-0 overflow-hidden"
            >
              {currentPage === 'dash' && (
                <Dashboard
                  tasks={tasks}
                  onToggleTask={handleToggleTask}
                  onDeleteTask={handleDeleteTask}
                  onOpenAddModal={() => setIsAddTaskOpen(true)}
                  onQuickAdd={handleQuickAdd}
                  lang={settings.lang}
                  theme={settings.theme}
                />
              )}

              {currentPage === 'alarm' && (
                <AlarmView
                  alarms={alarms}
                  customSounds={customSounds}
                  selectedSound={settings.snd || 'beep'}
                  onSelectSound={handleSelectSound}
                  onAddAlarm={handleAddAlarm}
                  onToggleAlarm={handleToggleAlarm}
                  onDeleteAlarm={handleDeleteAlarm}
                  onUploadSound={handleUploadSound}
                  onDeleteCustomSound={handleDeleteCustomSound}
                  onPreviewSound={handlePreviewSound}
                  onStopPreviewSound={handleStopPreviewSound}
                  isPlayingPreview={isPlayingPreview}
                  lang={settings.lang}
                />
              )}

              {currentPage === 'set' && (
                <SettingsView
                  settings={settings}
                  wallpapers={wallpapers}
                  onUpdateSettings={(updates) =>
                    setSettings((prev) => ({ ...prev, ...updates }))
                  }
                  onAddWallpaper={handleAddWallpaper}
                  onDeleteWallpaper={handleDeleteWallpaper}
                  onUpdateWallpaperParams={handleUpdateWallpaperParams}
                  onResetWallpaper={handleResetWallpaper}
                  onApplyWallpaper={handleApplyWallpaper}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Bottom Navigation Dock */}
        <Navbar
          currentPage={currentPage}
          onNavigate={handleNavigate}
          lang={settings.lang}
          theme={settings.theme}
          activeAlarmCount={activeAlarmCount}
          pendingTaskCount={unfinishedTasks.length}
        />
      </div>
    </div>
  );
}
