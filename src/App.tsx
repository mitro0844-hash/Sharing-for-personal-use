import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  Briefcase,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Circle,
  Coffee,
  MoonStar,
  NotebookPen,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Sparkles,
  Target,
  TimerReset,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

type GoalKind = "恢复日" | "轻量日" | "标准日" | "冲刺日" | "修正日" | "交稿日" | "自定义";

type ProductionStage = "draft" | "color";

type MoodType = "" | "平稳" | "高兴" | "困" | "烦" | "无聊" | "有劲";

type NoteAccent = "aqua" | "sage" | "peach" | "lavender" | "rose";

type GoalEntry = {
  target: string;
  kind: GoalKind;
};

type TimeBlockIcon = "coffee" | "draw" | "work" | "moon";

type TimeBlock = {
  id: number;
  time: string;
  task: string;
  done: boolean;
  icon: TimeBlockIcon;
};

type TodoItem = {
  id: number;
  text: string;
  done: boolean;
};

type DailyLog = {
  draftFrames: number;
  colorFrames: number;
  timeBlocks: TimeBlock[];
  lifeNote: string;
  calendarNote: string;
  hp: number;
  mp: number;
  mood: MoodType;
  moodNote: string;
  noteAccent: NoteAccent;
  todoItems: TodoItem[];
  finishedFrames?: number;
};

type CurrentReviewState = {
  note: string;
};

type OverallPlanItem = {
  id: number;
  date: string;
  target: string;
  kind: GoalKind;
  note: string;
  done: boolean;
};

type CheckpointItem = {
  id: string;
  rangeLabel: string;
  draftTarget: number;
  colorTarget: number;
  anchorDate: string;
  note: string;
};

type BuiltInSound = "softBell" | "woodTap" | "digitalPing" | "glassChime";

type ReminderSettings = {
  enabled: boolean;
  permission: NotificationPermission | "default";
  leadMinutes: number;
  sound: boolean;
  soundPreset: BuiltInSound;
  soundVolume: number;
  notified: Record<string, boolean>;
};

type TopCardsContent = {
  heroTag: string;
  heroTitle: string;
  heroBody: string;
  leadTag: string;
  leadTitle: string;
  leadBody: string;
  noteTag: string;
  noteTitle: string;
  noteBodyPrimary: string;
  noteBodySecondary: string;
  noteBadge: string;
  dateCardTitle: string;
  dateCardDescription: string;
};

type PanelTextContent = {
  lifeTitle: string;
  lifeDescription: string;
  reviewTitle: string;
  reviewDescription: string;
  overallTitle: string;
  overallDescription: string;
};

type PomodoroMode = "focus" | "shortBreak" | "longBreak";

type PomodoroState = {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  currentMode: PomodoroMode;
  secondsLeft: number;
  isRunning: boolean;
  completedFocusCount: number;
  sessionEndAt: number | null;
  soundEnabled: boolean;
  soundPreset: BuiltInSound;
  soundVolume: number;
};

type StoreShape = {
  totalFrames: number;
  productionStage: ProductionStage;
  dailyLogs: Record<string, DailyLog>;
  currentReviews: Record<string, CurrentReviewState>;
  checkpoints: CheckpointItem[];
  overallPlans: OverallPlanItem[];
  reminderSettings: ReminderSettings;
  topCards: TopCardsContent;
  panelTexts: PanelTextContent;
  pomodoro: PomodoroState;
};

type PanelHeights = {
  life: number;
  review: number;
  overall: number;
};

type PanelKey = keyof PanelHeights;

type TopCardEditState = {
  hero: boolean;
  lead: boolean;
  note: boolean;
  date: boolean;
};

type MainTabKey = "dashboard" | "calendar" | "reminder" | "pomodoro";

type StatCardProps = {
  title: string;
  description: string;
  value: string;
  sublabel: string;
  progress: number;
  icon: React.ReactNode;
};

type DashboardLeadCardProps = {
  selectedDate: string;
  selectedLog: DailyLog;
  pomodoro: PomodoroState;
  content: TopCardsContent;
  onUpdate: (field: keyof TopCardsContent, value: string) => void;
  isEditing: boolean;
  onToggleEdit: () => void;
  onUpdateTodoItem: (todoId: number, value: string) => void;
  onToggleTodoItem: (todoId: number) => void;
  onAddTodoItem: (text: string) => void;
  onRemoveTodoItem: (todoId: number) => void;
  onPomodoroStartPause: () => void;
  onPomodoroReset: () => void;
};

type EditorialNoteCardProps = {
  selectedDate: string;
  totalFinished: number;
  selectedLog: DailyLog;
  isEditing: boolean;
  onToggleEdit: () => void;
  onUpdateMood: (value: MoodType) => void;
  onUpdateMoodNote: (value: string) => void;
  onUpdateStatusGauge: (key: "hp" | "mp", value: number) => void;
};

type DateHeaderCardProps = {
  selectedMonthLabel: string;
  selectedGoal: GoalEntry;
  selectedDate: string;
  content: TopCardsContent;
  onSelectDate: (value: string) => void;
  onUpdate: (field: keyof TopCardsContent, value: string) => void;
  isEditing: boolean;
  onToggleEdit: () => void;
};

type LifePlanningPanelProps = {
  selectedDate: string;
  selectedGoal: GoalEntry;
  selectedLog: DailyLog;
  productionStage: ProductionStage;
  panelTexts: PanelTextContent;
  bodyHeight: number;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onToggleBlock: (blockId: number) => void;
  onUpdateGoalTarget: (value: string) => void;
  onUpdateFinishedFrames: (value: string) => void;
  onUpdateLifeNote: (value: string) => void;
  onUpdateTimeBlock: (blockId: number, field: "time" | "task", value: string) => void;
  onAddTimeBlock: () => void;
  onRemoveTimeBlock: (blockId: number) => void;
  onApplyStageTemplate: (stage: ProductionStage) => void;
  onUpdatePanelText: (field: keyof PanelTextContent, value: string) => void;
};

type CurrentReviewPanelProps = {
  selectedDate: string;
  selectedGoal: GoalEntry;
  currentDraftCumulative: number;
  currentColorCumulative: number;
  checkpointRows: Array<CheckpointItem & {
    actualDraft: number;
    actualColor: number;
    passedDraft: boolean;
    passedColor: boolean;
  }>;
  review: CurrentReviewState;
  panelTexts: PanelTextContent;
  bodyHeight: number;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onUpdateNote: (value: string) => void;
  onUpdateCheckpoint: (checkpointId: string, field: "rangeLabel" | "draftTarget" | "colorTarget" | "anchorDate" | "note", value: string) => void;
  onAddCheckpoint: () => void;
  onRemoveCheckpoint: (checkpointId: string) => void;
  onUpdatePanelText: (field: keyof PanelTextContent, value: string) => void;
};

type OverallGoalPanelProps = {
  selectedDate: string;
  selectedGoal: GoalEntry;
  visiblePlans: OverallPlanItem[];
  selectedPlan: OverallPlanItem | undefined;
  dailyLogs: Record<string, DailyLog>;
  totalColored: number;
  totalFrames: number;
  panelTexts: PanelTextContent;
  bodyHeight: number;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onSelectDate: (date: string) => void;
  onTogglePlan: (planId: number) => void;
  onUpdatePlan: (planId: number, field: "date" | "target" | "kind" | "note", value: string) => void;
  onAddPlan: () => void;
  onRemovePlan: (planId: number) => void;
  onUpdateTotalFrames: (value: string) => void;
  onUpdatePanelText: (field: keyof PanelTextContent, value: string) => void;
};

type CalendarPanelProps = {
  visibleMonthDate: Date;
  monthDays: Array<Date | null>;
  selectedDate: string;
  goalsMap: Record<string, GoalEntry>;
  dailyLogs: Record<string, DailyLog>;
  selectedLog: DailyLog;
  onSelectDate: (date: string) => void;
  onNavigateMonth: (offset: number) => void;
  onUpdateCalendarNote: (value: string) => void;
  onUpdateCalendarAccent: (value: NoteAccent) => void;
};

type ReminderPanelProps = {
  reminderSettings: ReminderSettings;
  selectedLog: DailyLog;
  onRequestPermission: () => Promise<void>;
  onUpdateReminderSetting: (key: keyof ReminderSettings, value: ReminderSettings[keyof ReminderSettings]) => void;
  onPreviewSound: (preset: BuiltInSound, volume: number) => void;
};

type PomodoroPanelProps = {
  pomodoro: PomodoroState;
  onStartPause: () => void;
  onReset: () => void;
  onSwitchMode: (mode: PomodoroMode) => void;
  onUpdateMinutes: (key: "focusMinutes" | "shortBreakMinutes" | "longBreakMinutes", value: string) => void;
  onUpdateSoundSetting: (key: "soundEnabled" | "soundPreset" | "soundVolume", value: string | boolean) => void;
  onPreviewSound: (preset: BuiltInSound, volume: number) => void;
};

const STORAGE_KEY = "creative-dashboard-template-v1";
const PANEL_HEIGHTS_STORAGE_KEY = "creative-dashboard-template-panel-heights-v1";
const TOTAL_FRAMES = 100;

const DEFAULT_PANEL_HEIGHTS: PanelHeights = {
  life: 900,
  review: 900,
  overall: 900,
};

const seedDailyGoals: Record<string, GoalEntry> = {};

const CHECKPOINTS = [] as const;

const HOLIDAY_MAP: Record<string, { label: string; short: string; tint: string }> = {
  "2026-04-04": { label: "清明节", short: "清明", tint: "bg-[#f2d9dc] text-[#a05962] border-[#ddb6bc]" },
  "2026-04-05": { label: "清明假期", short: "休", tint: "bg-[#f5e7e1] text-[#99665d] border-[#dbc0b4]" },
  "2026-04-06": { label: "清明假期", short: "休", tint: "bg-[#f5e7e1] text-[#99665d] border-[#dbc0b4]" },
};

function buildStageTimeBlocks(stage: ProductionStage): TimeBlock[] {
  if (stage === "color") {
    return [
      { id: 1, time: "09:00", task: "开始今日安排", done: false, icon: "coffee" },
      { id: 2, time: "10:00-12:00", task: "主要任务 1", done: false, icon: "draw" },
      { id: 3, time: "12:00-13:00", task: "午间休息", done: false, icon: "coffee" },
      { id: 4, time: "13:00-15:00", task: "主要任务 2", done: false, icon: "draw" },
      { id: 5, time: "15:30-17:00", task: "次要任务 / 杂项", done: false, icon: "work" },
      { id: 6, time: "17:30-18:30", task: "晚间休息", done: false, icon: "coffee" },
      { id: 7, time: "19:00-21:00", task: "收尾 / 复盘", done: false, icon: "draw" },
      { id: 8, time: "21:00-21:30", task: "整理明日计划", done: false, icon: "moon" },
    ];
  }

  return [
    { id: 1, time: "09:00", task: "开始今日安排", done: false, icon: "coffee" },
    { id: 2, time: "10:00-12:00", task: "主要任务 1", done: false, icon: "draw" },
    { id: 3, time: "12:00-13:00", task: "午间休息", done: false, icon: "coffee" },
    { id: 4, time: "13:00-15:00", task: "主要任务 2", done: false, icon: "draw" },
    { id: 5, time: "15:30-17:00", task: "次要任务 / 杂项", done: false, icon: "work" },
    { id: 6, time: "17:30-18:30", task: "晚间休息", done: false, icon: "coffee" },
    { id: 7, time: "19:00-21:00", task: "收尾 / 复盘", done: false, icon: "draw" },
    { id: 8, time: "21:00-21:30", task: "整理明日计划", done: false, icon: "moon" },
  ];
}

const defaultTimeBlocks: TimeBlock[] = buildStageTimeBlocks("draft");

const defaultReminderSettings: ReminderSettings = {
  enabled: false,
  permission: "default",
  leadMinutes: 0,
  sound: true,
  soundPreset: "softBell",
  soundVolume: 0.55,
  notified: {},
};

const defaultTopCards: TopCardsContent = {
  heroTag: "creative dashboard template",
  heroTitle: "创作计划模板",
  heroBody: "这是一份可直接开写的空白模板。先选日期，再填写生活计划、阶段目标和总目标。顶部三块标题也都能自由改。",
  leadTag: "starter note",
  leadTitle: "先定今天要推进到哪里",
  leadBody: "可以把这里当作当天主目标。完成后再去下面三块补记录。",
  noteTag: "quick guide",
  noteTitle: "从空白模板开始",
  noteBodyPrimary: "先在总目标里加计划，再到生活记录里拆分当天任务。",
  noteBodySecondary: "所有内容默认只保存在本地浏览器。你也可以导出备份。",
  noteBadge: "template mode",
  dateCardTitle: "当前日期",
  dateCardDescription: "点月历格子切换日期，开始写自己的计划",
};

const defaultPanelTexts: PanelTextContent = {
  lifeTitle: "Life Planning",
  lifeDescription: "今日计划和记录",
  reviewTitle: "Checkpoint Review",
  reviewDescription: "阶段检查点",
  overallTitle: "Overall Goal",
  overallDescription: "总目标和排期",
};

const defaultPomodoroState: PomodoroState = {
  focusMinutes: 45,
  shortBreakMinutes: 10,
  longBreakMinutes: 20,
  currentMode: "focus",
  secondsLeft: 45 * 60,
  isRunning: false,
  completedFocusCount: 0,
  sessionEndAt: null,
  soundEnabled: true,
  soundPreset: "glassChime",
  soundVolume: 0.6,
};

const interactiveButtonClass =
  "transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-[0_10px_24px_rgba(73,61,48,0.14)] active:scale-[0.98]";
const interactiveCardClass =
  "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_42px_rgba(73,61,48,0.12)]";

const TAB_ITEMS: Array<{ key: MainTabKey; label: string }> = [
  { key: "dashboard", label: "主页" },
  { key: "calendar", label: "月历" },
  { key: "reminder", label: "提醒" },
  { key: "pomodoro", label: "番茄钟" },
];

const MOOD_OPTIONS: Array<{ value: Exclude<MoodType, "">; emoji: string; label: string; tone: string }> = [
  { value: "平稳", emoji: "🙂", label: "平稳", tone: "border-[#c9c1b3] bg-[#fffaf2] text-[#6d6457]" },
  { value: "高兴", emoji: "😄", label: "高兴", tone: "border-[#d6b986] bg-[#fff4da] text-[#8b6a2d]" },
  { value: "困", emoji: "😴", label: "困", tone: "border-[#b8bfd1] bg-[#eef2fb] text-[#55627d]" },
  { value: "烦", emoji: "😵", label: "烦", tone: "border-[#d1b3ab] bg-[#fbefec] text-[#8b5a52]" },
  { value: "无聊", emoji: "🥱", label: "无聊", tone: "border-[#c6c0ba] bg-[#f3efea] text-[#6c665f]" },
  { value: "有劲", emoji: "⚡", label: "有劲", tone: "border-[#c7bf92] bg-[#f7f1d8] text-[#7c6a1b]" },
];

const NOTE_ACCENT_OPTIONS: Array<{ value: NoteAccent; label: string; color: string }> = [
  { value: "aqua", label: "青蓝", color: "#8fcfd7" },
  { value: "sage", label: "豆绿", color: "#9dbf9f" },
  { value: "peach", label: "杏桃", color: "#e3b28f" },
  { value: "lavender", label: "雾紫", color: "#b8b3d9" },
  { value: "rose", label: "灰粉", color: "#d9a7ac" },
];

let resizeObserverPatched = false;

function patchResizeObserver(): void {
  if (typeof window === "undefined") return;
  if (resizeObserverPatched) return;
  if (!("ResizeObserver" in window)) return;

  const NativeResizeObserver = window.ResizeObserver;

  class SafeResizeObserver implements ResizeObserver {
    private observer: ResizeObserver;
    constructor(callback: ResizeObserverCallback) {
      this.observer = new NativeResizeObserver((entries, obs) => {
        window.requestAnimationFrame(() => {
          callback(entries, obs);
        });
      });
    }
    observe(target: Element, options?: ResizeObserverOptions): void {
      this.observer.observe(target, options);
    }
    unobserve(target: Element): void {
      this.observer.unobserve(target);
    }
    disconnect(): void {
      this.observer.disconnect();
    }
  }

  window.ResizeObserver = SafeResizeObserver as typeof ResizeObserver;
  resizeObserverPatched = true;
}

function cloneDefaultTimeBlocks(): TimeBlock[] {
  return defaultTimeBlocks.map((block) => ({ ...block }));
}

function buildSeedOverallPlans(): OverallPlanItem[] {
  return Object.entries(seedDailyGoals)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, goal], index) => ({
      id: index + 1,
      date,
      target: goal.target,
      kind: goal.kind,
      note: "",
      done: false,
    }));
}

function createDefaultStore(): StoreShape {
  return {
    totalFrames: TOTAL_FRAMES,
    productionStage: "draft",
    dailyLogs: {},
    currentReviews: {},
    checkpoints: CHECKPOINTS.map((item) => normalizeCheckpointItem({ ...item })),
    overallPlans: buildSeedOverallPlans().map((item) => normalizeOverallPlanItem(item)),
    reminderSettings: defaultReminderSettings,
    topCards: defaultTopCards,
    panelTexts: defaultPanelTexts,
    pomodoro: defaultPomodoroState,
  };
}

function getStageLifeNote(stage: ProductionStage): string {
  return stage === "draft"
    ? `当前阶段：阶段一
记录口径：今日重点 / 当前进度 / 待补内容`
    : `当前阶段：阶段二
记录口径：今日重点 / 当前进度 / 待补内容`;
}

function buildDefaultTodoItems(): TodoItem[] {
  return [
    { id: 1, text: "", done: false },
    { id: 2, text: "", done: false },
    { id: 3, text: "", done: false },
  ];
}

function normalizeTodoItems(items: unknown): TodoItem[] {
  if (!Array.isArray(items) || items.length === 0) return buildDefaultTodoItems();
  return items.map((item, index) => {
    if (typeof item === "string") {
      return { id: index + 1, text: item, done: false };
    }
    if (item && typeof item === "object") {
      const candidate = item as Partial<TodoItem>;
      return {
        id: typeof candidate.id === "number" ? candidate.id : index + 1,
        text: typeof candidate.text === "string" ? candidate.text : "",
        done: Boolean(candidate.done),
      };
    }
    return { id: index + 1, text: "", done: false };
  });
}

function createDailyLogForStage(stage: ProductionStage): DailyLog {
  return {
    draftFrames: 0,
    colorFrames: 0,
    timeBlocks: buildStageTimeBlocks(stage),
    lifeNote: getStageLifeNote(stage),
    calendarNote: "",
    hp: 72,
    mp: 68,
    mood: "",
    moodNote: "",
    noteAccent: "aqua",
    todoItems: buildDefaultTodoItems(),
  };
}

function ensureDailyLog(log?: DailyLog): DailyLog {
  if (log) {
    return {
      draftFrames: log.draftFrames ?? (log.finishedFrames ?? 0),
      colorFrames: log.colorFrames ?? 0,
      timeBlocks: normalizeTimeBlocks(log.timeBlocks ?? cloneDefaultTimeBlocks()),
      lifeNote: log.lifeNote ?? "",
      calendarNote: log.calendarNote ?? "",
      hp: log.hp ?? 72,
      mp: log.mp ?? 68,
      mood: log.mood ?? "",
      moodNote: log.moodNote ?? "",
      noteAccent: log.noteAccent ?? "aqua",
      todoItems: normalizeTodoItems(log.todoItems),
    };
  }
  return {
    draftFrames: 0,
    colorFrames: 0,
    timeBlocks: normalizeTimeBlocks(cloneDefaultTimeBlocks()),
    lifeNote: "",
    calendarNote: "",
    hp: 72,
    mp: 68,
    mood: "",
    moodNote: "",
    noteAccent: "aqua",
    todoItems: buildDefaultTodoItems(),
  };
}

function ensureReviewState(state?: CurrentReviewState): CurrentReviewState {
  if (state) return state;
  return { note: "" };
}

function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseDateKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

function formatMonthLabel(date: Date): string {
  return new Intl.DateTimeFormat("zh-CN", { year: "numeric", month: "long" }).format(date);
}

function displayDate(key: string): string {
  const [, m, d] = key.split("-");
  return `${m}/${d}`;
}

function parseTargetMidpoint(value: string): number {
  if (!value) return 0;
  if (value.includes("-")) {
    const [a, b] = value.split("-").map(Number);
    if (Number.isNaN(a) || Number.isNaN(b)) return 0;
    return Math.round((a + b) / 2);
  }
  const num = Number(value);
  return Number.isNaN(num) ? 0 : num;
}

function getMonthDays(year: number, monthIndex: number): Array<Date | null> {
  const first = new Date(year, monthIndex, 1);
  const last = new Date(year, monthIndex + 1, 0);
  const leading = first.getDay();
  const total = last.getDate();
  const cells: Array<Date | null> = [];
  for (let i = 0; i < leading; i += 1) cells.push(null);
  for (let day = 1; day <= total; day += 1) cells.push(new Date(year, monthIndex, day));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function buildGoalsMap(overallPlans: OverallPlanItem[]): Record<string, GoalEntry> {
  return overallPlans.reduce<Record<string, GoalEntry>>((acc, item) => {
    acc[item.date] = { target: item.target, kind: item.kind };
    return acc;
  }, {});
}

function getVisibleMonthPlans(plans: OverallPlanItem[], visibleMonthDate: Date): OverallPlanItem[] {
  const y = visibleMonthDate.getFullYear();
  const m = visibleMonthDate.getMonth();
  return plans
    .filter((plan) => {
      const parsed = parseDateKey(plan.date);
      return parsed.getFullYear() === y && parsed.getMonth() === m;
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

function getStatusTone(kind: GoalKind): string {
  switch (kind) {
    case "冲刺日":
      return "bg-[#eadad4] text-[#8c5a54] border-[#c4a196]";
    case "恢复日":
      return "bg-[#efe5c8] text-[#8b7247] border-[#ccb98a]";
    case "修正日":
    case "交稿日":
      return "bg-[#e0e3df] text-[#5b665f] border-[#adb6ae]";
    default:
      return "bg-[#e4e8e4] text-[#52605a] border-[#b4beb6]";
  }
}

function getBlockIcon(icon: TimeBlockIcon) {
  switch (icon) {
    case "coffee":
      return <Coffee className="h-4 w-4" />;
    case "work":
      return <Briefcase className="h-4 w-4" />;
    case "moon":
      return <MoonStar className="h-4 w-4" />;
    default:
      return <Sparkles className="h-4 w-4" />;
  }
}

function getMinutesFromTimeLabel(label: string): number | null {
  if (!label) return null;
  const part = label.split("-")[0]?.trim();
  if (!part) return null;
  const [hour, minute] = part.split(":").map(Number);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return null;
  return hour * 60 + minute;
}

function getPomodoroSecondsByMode(state: PomodoroState, mode: PomodoroMode): number {
  if (mode === "focus") return state.focusMinutes * 60;
  if (mode === "shortBreak") return state.shortBreakMinutes * 60;
  return state.longBreakMinutes * 60;
}

function formatPomodoroClock(totalSeconds: number): string {
  const safe = Math.max(0, totalSeconds);
  const minutes = Math.floor(safe / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(safe % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function getSoundLabel(preset: BuiltInSound): string {
  switch (preset) {
    case "woodTap":
      return "木质敲击";
    case "digitalPing":
      return "数字提示";
    case "glassChime":
      return "玻璃钟声";
    default:
      return "轻提示";
  }
}

function getProductionStageLabel(stage: ProductionStage): string {
  return stage === "draft" ? "阶段一" : "阶段二";
}

function getProductionStageDescription(stage: ProductionStage): string {
  return stage === "draft"
    ? "先把今天最重要的任务拆清楚，按顺序推进。"
    : "这里可以作为第二阶段，用来记录后续推进或收尾安排。";
}

function getProductionTargetLabel(stage: ProductionStage): string {
  return stage === "draft" ? "阶段一目标" : "阶段二目标";
}

function getProductionFinishedLabel(stage: ProductionStage): string {
  return stage === "draft" ? "阶段一完成" : "阶段二完成";
}

function getProductionSuggestedTarget(stage: ProductionStage): string {
  return stage === "draft" ? "3-5" : "2-4";
}

function getStageCount(log: DailyLog, stage: ProductionStage): number {
  return stage === "draft" ? log.draftFrames : log.colorFrames;
}

function getDraftCount(log?: DailyLog): number {
  return ensureDailyLog(log).draftFrames;
}

function getColorCount(log?: DailyLog): number {
  return ensureDailyLog(log).colorFrames;
}

const GOAL_TARGET_BY_KIND: Partial<Record<GoalKind, string>> = {
  "恢复日": "5",
  "轻量日": "6",
  "标准日": "7",
  "冲刺日": "8",
  "修正日": "4",
};

function resolveGoalTarget(target: string | undefined, kind: GoalKind): string {
  const safeTarget = (target || "").trim();
  if (safeTarget !== "" && Number.isFinite(Number(safeTarget))) return safeTarget;
  return GOAL_TARGET_BY_KIND[kind] || safeTarget;
}

function normalizeCheckpointLabel(label: string): string {
  const safeLabel = (label || "").trim();
  if (safeLabel === "45-50") return "45";
  if (safeLabel === "70-90") return "70";
  if (safeLabel === "100-110") return "100";
  if (safeLabel === "120-130") return "120";
  return safeLabel;
}

function normalizeTimeBlockTask(task: string): string {
  return (task || "").trim();
}

function normalizeTimeBlocks(blocks: TimeBlock[]): TimeBlock[] {
  return blocks.map((block) => ({
    ...block,
    task: normalizeTimeBlockTask(block.task),
  }));
}

function normalizeCheckpointItem(item: CheckpointItem): CheckpointItem {
  return {
    ...item,
    rangeLabel: normalizeCheckpointLabel(item.rangeLabel),
  };
}

function normalizeOverallPlanItem(item: OverallPlanItem): OverallPlanItem {
  return {
    ...item,
    target: resolveGoalTarget(item.target, item.kind),
  };
}

function getHpStatusMeta(hp: number) {
  if (hp <= 10) return { label: "濒死", tone: "border-[#cfa4a0] bg-[#f7e9e7] text-[#8b4f49]" };
  if (hp <= 35) return { label: "虚弱", tone: "border-[#d6b2aa] bg-[#fbefec] text-[#9a6159]" };
  if (hp >= 95) return { label: "健康", tone: "border-[#b8c8b0] bg-[#eef4ea] text-[#5f7757]" };
  if (hp >= 70) return { label: "稳定", tone: "border-[#c5cdbd] bg-[#f3f6ef] text-[#68725f]" };
  return { label: "受损", tone: "border-[#d5c2b2] bg-[#f8f0e7] text-[#8a6a53]" };
}

function getMpStatusMeta(mp: number) {
  if (mp <= 10) return { label: "疯狂", tone: "border-[#c7b6d6] bg-[#f3eef9] text-[#72598d]" };
  if (mp <= 35) return { label: "恍惚", tone: "border-[#cfc3da] bg-[#f6f1fa] text-[#7b678f]" };
  if (mp >= 95) return { label: "快乐", tone: "border-[#d8c58b] bg-[#fbf5df] text-[#8a6d1e]" };
  if (mp >= 70) return { label: "清醒", tone: "border-[#b9c9d6] bg-[#edf3f8] text-[#577083]" };
  return { label: "波动", tone: "border-[#c8cdd5] bg-[#f2f4f7] text-[#66707d]" };
}

function playBuiltInSound(preset: BuiltInSound, volume: number): void {
  if (typeof window === "undefined") return;
  const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return;

  const ctx = new AudioCtx();
  const safeVolume = Math.min(1, Math.max(0, volume));
  const now = ctx.currentTime;

  const scheduleTone = (frequency: number, start: number, duration: number, gainValue: number) => {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.type = preset === "woodTap" ? "triangle" : preset === "digitalPing" ? "square" : "sine";
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, gainValue), start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
  };

  if (preset === "woodTap") {
    scheduleTone(320, now, 0.12, safeVolume * 0.09);
    scheduleTone(240, now + 0.1, 0.16, safeVolume * 0.08);
  } else if (preset === "digitalPing") {
    scheduleTone(920, now, 0.08, safeVolume * 0.07);
    scheduleTone(1120, now + 0.11, 0.08, safeVolume * 0.06);
  } else if (preset === "glassChime") {
    scheduleTone(660, now, 0.28, safeVolume * 0.08);
    scheduleTone(990, now + 0.08, 0.38, safeVolume * 0.05);
  } else {
    scheduleTone(740, now, 0.18, safeVolume * 0.07);
    scheduleTone(880, now + 0.16, 0.2, safeVolume * 0.05);
  }

  window.setTimeout(() => {
    ctx.close().catch(() => undefined);
  }, 1200);
}

function panelClass(variant: "paper" | "note" | "accent" = "paper"): string {
  switch (variant) {
    case "note":
      return "rounded-[30px] border border-[#cbc0ae] bg-[#f8f1e6] shadow-[0_18px_34px_rgba(64,55,44,0.08)]";
    case "accent":
      return "rounded-[30px] border border-[#c8b7a7] bg-[#f5ece4] shadow-[0_18px_34px_rgba(64,55,44,0.08)]";
    default:
      return "rounded-[30px] border border-[#cfc5b5] bg-[#fffaf1] shadow-[0_18px_34px_rgba(64,55,44,0.08)]";
  }
}

function Tape({ side = "left" }: { side?: "left" | "right" }) {
  return (
    <div
      className={`absolute top-4 z-10 h-7 rounded-sm bg-[#d7ccb8]/70 backdrop-blur-[1px] ${
        side === "left" ? "left-8 w-20 -rotate-6" : "right-10 w-16 rotate-6"
      }`}
    />
  );
}

function SectionHeading({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <CardTitle className="text-2xl text-[#2d3942]" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
        {title}
      </CardTitle>
      <CardDescription className="text-[#766b5d]">{description}</CardDescription>
    </div>
  );
}

function ResizablePanelFrame({
  height,
  children,
}: {
  height: number;
  children: React.ReactNode;
}) {
  return (
    <div className="relative" style={{ minHeight: Math.max(540, height) }}>
      <div>{children}</div>
    </div>
  );
}

function runSanityChecks(): void {
  const checks: Array<[boolean, string]> = [
    [parseTargetMidpoint("3-5") === 4, "parseTargetMidpoint range failed"],
    [parseTargetMidpoint("8") === 8, "parseTargetMidpoint scalar failed"],
    [getMinutesFromTimeLabel("09:30") === 570, "getMinutesFromTimeLabel failed"],
    [getMonthDays(2026, 3).length >= 35, "getMonthDays grid failed"],
    [Array.isArray(buildSeedOverallPlans()), "buildSeedOverallPlans failed"],
    [Array.isArray(CHECKPOINTS), "checkpoints failed"],
    [shouldIgnoreResizeObserverError("ResizeObserver loop completed with undelivered notifications") === true, "resize observer filter failed"],
    [shouldIgnoreResizeObserverError("ordinary error") === false, "resize observer filter false positive"],
    [typeof patchResizeObserver === "function", "patchResizeObserver missing"],
  ];
  checks.forEach(([ok, message]) => {
    if (!ok) throw new Error(message);
  });
}

patchResizeObserver();
runSanityChecks();

function shouldIgnoreResizeObserverError(message: string): boolean {
  return (
    message.includes("ResizeObserver loop completed with undelivered notifications") ||
    message.includes("ResizeObserver loop limit exceeded")
  );
}

function StatCard({ title, description, value, sublabel, progress, icon }: StatCardProps) {
  return (
    <Card className={`${panelClass("note")} relative h-full overflow-hidden`}>
      <Tape side="left" />
      <CardHeader className="relative z-20">
        <CardTitle className="flex items-center gap-2 text-lg text-[#31404a]">
          {icon}
          {title}
        </CardTitle>
        <CardDescription className="text-[#766b5d]">{description}</CardDescription>
      </CardHeader>
      <CardContent className="relative z-20 space-y-3">
        <Progress value={progress} className="h-3 bg-[#ddd4c5]" />
        <div className="flex items-end justify-between">
          <div className="text-3xl font-semibold text-[#2d3942]" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
            {value}
          </div>
          <div className="text-sm text-[#766b5d]">{sublabel}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardLeadCard({
  selectedDate,
  selectedLog,
  pomodoro,
  content,
  onUpdate,
  isEditing,
  onToggleEdit,
  onUpdateTodoItem,
  onToggleTodoItem,
  onAddTodoItem,
  onRemoveTodoItem,
  onPomodoroStartPause,
  onPomodoroReset,
}: DashboardLeadCardProps) {
  const [newTodoText, setNewTodoText] = useState("");
  const completedCount = selectedLog.todoItems.filter((item) => item.done).length;

  return (
    <Card className={`${panelClass("paper")} ${interactiveCardClass} group relative overflow-hidden`}>
      <Tape side="left" />
      <Tape side="right" />
      <div className="absolute inset-y-0 right-0 w-24 bg-[#2f3b45]" />
      <CardHeader className="relative z-20 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {isEditing ? (
              <Input
                value={content.leadTag}
                onChange={(e) => onUpdate("leadTag", e.target.value)}
                className="h-8 max-w-[260px] rounded-full border-[#cfc5b5] bg-[#fffdf8] text-xs uppercase tracking-[0.18em] text-[#766b5d]"
              />
            ) : (
              <CardDescription className="text-[#766b5d] uppercase tracking-[0.18em]">{content.leadTag}</CardDescription>
            )}
          </div>
          <Button type="button" variant="outline" className={`rounded-full border-[#cfc5b5] bg-[#fffdf8] text-[#5c554c] ${interactiveButtonClass}`} onClick={onToggleEdit}>
            {isEditing ? <Check className="mr-2 h-4 w-4" /> : <NotebookPen className="mr-2 h-4 w-4" />}
            {isEditing ? "完成" : "编辑"}
          </Button>
        </div>
        {isEditing ? (
          <Textarea
            value={content.leadTitle}
            onChange={(e) => onUpdate("leadTitle", e.target.value)}
            className="min-h-[86px] rounded-[24px] border-[#cfc5b5] bg-[#fffdf8] text-[28px] leading-tight text-[#2d3942] resize-none md:text-[34px]"
          />
        ) : (
          <CardTitle className="max-w-xl text-[28px] leading-tight text-[#2d3942] md:text-[34px]" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
            {content.leadTitle}
          </CardTitle>
        )}
        {isEditing ? (
          <Input
            value={content.leadBody}
            onChange={(e) => onUpdate("leadBody", e.target.value)}
            className="rounded-full border-[#cfc5b5] bg-[#fffdf8] text-sm text-[#5d564d]"
          />
        ) : (
          <div className="text-sm text-[#5d564d]">{content.leadBody}</div>
        )}
      </CardHeader>
      <CardContent className="relative z-20 grid gap-4 md:grid-cols-[1fr_200px] md:items-start">
        <div className="rounded-[24px] border border-dashed border-[#cfc5b5] bg-[#f7f1e7] p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="text-xs uppercase tracking-[0.18em] text-[#766b5d]">today focus</div>
            <Badge variant="outline" className="rounded-full border-[#beb29f] bg-[#fffaf3] text-[11px] text-[#62594e]">
              done {completedCount}/{selectedLog.todoItems.length}
            </Badge>
          </div>
          <div className="max-h-[180px] overflow-y-auto pr-1">
            <div className="space-y-2">
              {selectedLog.todoItems.map((item, index) => (
                <div key={item.id} className="flex items-center gap-2 rounded-[18px] border border-[#d3c3b3] bg-[#fffdf8] px-3 py-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm">
                  <button type="button" onClick={() => onToggleTodoItem(item.id)} className="shrink-0">
                    {item.done ? <CheckCircle2 className="h-4 w-4 text-[#70896a]" /> : <Circle className="h-4 w-4 text-[#a39789]" />}
                  </button>
                  <Input
                    value={item.text}
                    onChange={(e) => onUpdateTodoItem(item.id, e.target.value)}
                    placeholder={`今日任务 ${index + 1}`}
                    className={`h-6 border-0 bg-transparent px-0 text-[13px] shadow-none focus-visible:ring-0 ${item.done ? "line-through text-[#9b9387]" : "text-[#4f4a43]"}`}
                  />
                  <Button type="button" variant="outline" size="icon" className={`h-7 w-7 shrink-0 rounded-full border-[#d3b9ac] text-[#8c5a54] ${interactiveButtonClass}`} onClick={() => onRemoveTodoItem(item.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
              <div className="sticky bottom-0 pt-2">
                <div className="rounded-[18px] border border-dashed border-[#cfc5b5] bg-[#f7f1e7]/95 px-3 py-2 backdrop-blur-[1px]">
                  <div className="flex items-center gap-2">
                    <Input
                      value={newTodoText}
                      onChange={(e) => setNewTodoText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const nextText = newTodoText.trim();
                          if (!nextText) return;
                          onAddTodoItem(nextText);
                          setNewTodoText("");
                        }
                      }}
                      placeholder="输入要添加的任务"
                      className="h-8 rounded-full border-[#cfc5b5] bg-[#fffdf8] text-[13px]"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className={`shrink-0 rounded-full border-[#cfc5b5] bg-[#fffdf8] text-[#5c554c] ${interactiveButtonClass}`}
                      onClick={() => {
                        const nextText = newTodoText.trim();
                        if (!nextText) return;
                        onAddTodoItem(nextText);
                        setNewTodoText("");
                      }}
                    >
                      <Plus className="mr-1.5 h-3.5 w-3.5" />新增
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-[24px] border border-[#d0c7b8] bg-[#fffdf8] p-4 text-center transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md">
          <div className="text-[11px] uppercase tracking-[0.18em] text-[#766b5d]">pomodoro</div>
          <div className="mt-2 text-4xl font-semibold text-[#2d3942]" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
            {formatPomodoroClock(pomodoro.secondsLeft)}
          </div>
          <div className="mt-1 text-xs text-[#766b5d]">
            {pomodoro.currentMode === "focus" ? "专注中" : pomodoro.currentMode === "shortBreak" ? "短休息" : "长休息"}
          </div>
          <div className="mt-4 flex justify-center gap-2">
            <Button type="button" variant="outline" size="sm" className={`rounded-full border-[#d3c3b3] ${interactiveButtonClass}`} onClick={onPomodoroStartPause}>
              {pomodoro.isRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            </Button>
            <Button type="button" variant="outline" size="sm" className={`rounded-full border-[#d3c3b3] ${interactiveButtonClass}`} onClick={onPomodoroReset}>
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="mt-3 text-xs text-[#d6d0c8]">{displayDate(selectedDate)}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function EditorialNoteCard({
  selectedDate,
  totalFinished,
  selectedLog,
  isEditing,
  onToggleEdit,
  onUpdateMood,
  onUpdateMoodNote,
  onUpdateStatusGauge,
}: EditorialNoteCardProps) {
  const title = `${selectedDate.replace(/-/g, ".")}的状态便签`;
  const activeMood = MOOD_OPTIONS.find((item) => item.value === selectedLog.mood);
  const hpStatus = getHpStatusMeta(selectedLog.hp);
  const mpStatus = getMpStatusMeta(selectedLog.mp);
  const [showMoodPicker, setShowMoodPicker] = useState(false);

  return (
    <Card className={`${panelClass("accent")} ${interactiveCardClass} group relative h-full overflow-hidden`}>
      <Tape side="right" />
      <CardHeader className="relative z-20 pb-2 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <CardDescription className="text-[#766b5d] uppercase tracking-[0.18em]">state note</CardDescription>
          <Button type="button" variant="outline" className={`rounded-full border-[#d3c3b3] bg-[#fffdf8] text-[#5c554c] ${interactiveButtonClass}`} onClick={onToggleEdit}>
            {isEditing ? <Check className="mr-2 h-4 w-4" /> : <NotebookPen className="mr-2 h-4 w-4" />}
            {isEditing ? "完成" : "编辑"}
          </Button>
        </div>
        <CardTitle className="text-xl text-[#2d3942]" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="relative z-20 space-y-3 text-sm text-[#5d564d]">
        <div className="grid gap-3 md:grid-cols-[1fr_108px] md:items-start">
          <div className="space-y-2.5">
            <div className="relative flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowMoodPicker((prev) => !prev)}
                className={`inline-flex h-10 min-w-[92px] items-center justify-center gap-2 rounded-full border px-3 text-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm ${activeMood ? activeMood.tone : "border-[#d3c3b3] bg-[#fffdf8] text-[#766b5d]"}`}
              >
                <span className="text-sm">{activeMood?.emoji || "○"}</span>
                <span>{activeMood?.label || "选状态"}</span>
              </button>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className={`rounded-full ${hpStatus.tone}`}>HP · {hpStatus.label}</Badge>
                <Badge variant="outline" className={`rounded-full ${mpStatus.tone}`}>MP · {mpStatus.label}</Badge>
              </div>
              {showMoodPicker ? (
                <div className="absolute left-0 top-12 z-30 flex w-[220px] flex-wrap gap-2 rounded-[18px] border border-[#d3c3b3] bg-[#fffdf8] p-2 shadow-[0_12px_28px_rgba(73,61,48,0.12)]">
                  {MOOD_OPTIONS.map((mood) => {
                    const active = selectedLog.mood === mood.value;
                    return (
                      <button
                        key={mood.value}
                        type="button"
                        onClick={() => {
                          onUpdateMood(mood.value);
                          setShowMoodPicker(false);
                        }}
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-all duration-200 hover:-translate-y-0.5 ${active ? mood.tone : "border-[#d3c3b3] bg-[#fffdf8] text-[#6b6155]"}`}
                      >
                        <span>{mood.emoji}</span>
                        <span>{mood.label}</span>
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </div>

          <div className="rounded-[20px] border border-dashed border-[#d3c3b3] bg-[#fff8f2] px-3 py-2.5 text-center md:self-start">
            <div className="text-[11px] text-[#766b5d]">当前累计</div>
            <div className="mt-1 text-[28px] font-semibold leading-none text-[#2d3942]" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
              {totalFinished}
            </div>
          </div>
        </div>

        <div className="rounded-[22px] border border-dashed border-[#d3c3b3] bg-[#fff8f2] p-3">
          <div className="mb-3 flex items-center justify-between gap-3 text-xs uppercase tracking-[0.16em] text-[#766b5d]">
            <span>status bars</span>
            <span className="text-[11px] normal-case tracking-normal">拖动调整</span>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-[18px] border border-[#d8c7bd] bg-[#fffdf8] px-3 py-2.5">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-[#7b5a58]">HP</span>
                <span className="text-sm font-semibold text-[#7b5a58]">{selectedLog.hp}</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={selectedLog.hp}
                onChange={(e) => onUpdateStatusGauge("hp", Number(e.target.value))}
                className="w-full accent-[#c58c85]"
              />
            </div>
            <div className="rounded-[18px] border border-[#d8c7bd] bg-[#fffdf8] px-3 py-2.5">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-[#5f7080]">MP</span>
                <span className="text-sm font-semibold text-[#5f7080]">{selectedLog.mp}</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={selectedLog.mp}
                onChange={(e) => onUpdateStatusGauge("mp", Number(e.target.value))}
                className="w-full accent-[#8ca7bb]"
              />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="text-sm text-[#766b5d]">小备注</div>
          {isEditing ? (
            <Input
              value={selectedLog.moodNote}
              onChange={(e) => onUpdateMoodNote(e.target.value)}
              placeholder="例如：工作规划缓慢推进中"
              className="h-10 rounded-2xl border-[#d3c3b3] bg-[#fffdf8]"
            />
          ) : (
            <div className="min-h-[36px] flex items-center rounded-[18px] border border-dashed border-[#d3c3b3] bg-[#fff8f2] px-3 py-2">
              {selectedLog.moodNote ? (
                <div className="inline-flex max-w-full items-center text-sm text-[#7b5f59] truncate">
                  {selectedLog.moodNote}
                </div>
              ) : (
                <span className="text-sm text-[#766b5d]">还没写</span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function DateHeaderCard({
  selectedMonthLabel,
  selectedGoal,
  selectedDate,
  content,
  onSelectDate,
  onUpdate,
  isEditing,
  onToggleEdit,
}: DateHeaderCardProps) {
  return (
    <Card className={`${panelClass("note")} ${interactiveCardClass} group relative h-full overflow-hidden`}>
      <Tape side="right" />
      <CardHeader className="relative z-20 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {isEditing ? (
              <Input
                value={content.dateCardTitle}
                onChange={(e) => onUpdate("dateCardTitle", e.target.value)}
                className="h-8 max-w-[220px] rounded-full border-[#cfc5b5] bg-[#fffdf8] text-xs uppercase tracking-[0.18em] text-[#766b5d]"
              />
            ) : (
              <CardDescription className="text-[#766b5d] uppercase tracking-[0.18em]">{content.dateCardTitle}</CardDescription>
            )}
          </div>
          <Button type="button" variant="outline" className={`rounded-full border-[#cfc5b5] bg-[#fffdf8] text-[#5c554c] ${interactiveButtonClass}`} onClick={onToggleEdit}>
            {isEditing ? <Check className="mr-2 h-4 w-4" /> : <NotebookPen className="mr-2 h-4 w-4" />}
            {isEditing ? "完成" : "编辑"}
          </Button>
        </div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-2xl text-[#2d3942]" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
              {selectedMonthLabel}
            </CardTitle>
            <div className="mt-2 text-sm text-[#766b5d]">{displayDate(selectedDate)} · {selectedGoal.kind} · 目标 {selectedGoal.target || "-"}</div>
            {isEditing ? (
              <Input
                value={content.dateCardDescription}
                onChange={(e) => onUpdate("dateCardDescription", e.target.value)}
                className="mt-3 rounded-full border-[#cfc5b5] bg-[#fffdf8] text-sm text-[#5d564d]"
              />
            ) : (
              <div className="mt-3 text-sm text-[#5d564d]">{content.dateCardDescription}</div>
            )}
          </div>
          <Button type="button" variant="outline" className={`rounded-full border-[#b9ae9d] bg-[#fffaf2] text-[#4e4a43] ${interactiveButtonClass}`} onClick={() => onSelectDate(formatDateKey(new Date()))}>
            今天
          </Button>
        </div>
      </CardHeader>
    </Card>
  );
}

function LifePlanningPanel({
  selectedDate,
  selectedGoal,
  selectedLog,
  productionStage,
  panelTexts,
  bodyHeight,
  collapsed,
  onToggleCollapse,
  onToggleBlock,
  onUpdateGoalTarget,
  onUpdateFinishedFrames,
  onUpdateLifeNote,
  onUpdateTimeBlock,
  onAddTimeBlock,
  onRemoveTimeBlock,
  onApplyStageTemplate,
  onUpdatePanelText,
}: LifePlanningPanelProps) {
  const [isHeaderEditing, setIsHeaderEditing] = useState(false);

  return (
    <Card className={`${panelClass("paper")} ${interactiveCardClass} group relative h-full overflow-hidden`}>
      <Tape side="left" />
      <Tape side="right" />
      <CardHeader className="relative z-20 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {isHeaderEditing ? (
              <div className="space-y-2">
                <Input
                  value={panelTexts.lifeTitle}
                  onChange={(e) => onUpdatePanelText("lifeTitle", e.target.value)}
                  className="h-10 rounded-2xl border-[#c4baa9] bg-[#fffdf8] text-2xl text-[#2d3942]"
                  style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
                />
                <Input
                  value={panelTexts.lifeDescription}
                  onChange={(e) => onUpdatePanelText("lifeDescription", e.target.value)}
                  className="h-9 rounded-2xl border-[#c4baa9] bg-[#fffdf8] text-sm text-[#766b5d]"
                />
              </div>
            ) : (
              <SectionHeading title={panelTexts.lifeTitle} description={`${displayDate(selectedDate)} 的${panelTexts.lifeDescription}`} />
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" className={`rounded-full border-[#bbae9a] ${interactiveButtonClass}`} onClick={() => setIsHeaderEditing((prev) => !prev)}>
              {isHeaderEditing ? <Check className="mr-2 h-4 w-4" /> : <NotebookPen className="mr-2 h-4 w-4" />}
              {isHeaderEditing ? "完成" : "编辑"}
            </Button>
            <Button type="button" variant="outline" className={`rounded-full border-[#bbae9a] bg-[#fffaf2] text-[#544e45] ${interactiveButtonClass}`} onClick={onToggleCollapse}>
              {collapsed ? <ChevronDown className="mr-2 h-4 w-4" /> : <ChevronUp className="mr-2 h-4 w-4" />}
              {collapsed ? "展开" : "收起"}
            </Button>
          </div>
        </div>
      </CardHeader>
      {!collapsed ? (
        <CardContent className="relative z-20 space-y-4 overflow-y-auto pr-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:w-0" style={{ height: bodyHeight }}>
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" className={`rounded-full ${productionStage === "draft" ? "bg-[#2f3b45] text-[#fbf5ec]" : "bg-[#fffaf2] text-[#4e4a43] border border-[#b9ae9d]"}`} onClick={() => onApplyStageTemplate("draft")}>阶段一</Button>
            <Button type="button" size="sm" className={`rounded-full ${productionStage === "color" ? "bg-[#8c5a54] text-[#fbf5ec]" : "bg-[#fffaf2] text-[#4e4a43] border border-[#b9ae9d]"}`} onClick={() => onApplyStageTemplate("color")}>切到阶段二</Button>
          </div>
          <div className="text-sm leading-6 text-[#5d564d]">{getProductionStageDescription(productionStage)}</div>
          <div className="rounded-[24px] border border-dashed border-[#d0c7b8] bg-[#f7f1e7] p-4">
            <div className="grid grid-cols-3 gap-2 text-sm">
              <Badge variant="outline" className="rounded-full border-[#beb29f] bg-[#fffaf3] text-[#62594e] justify-center">已完成 0/8</Badge>
              <Badge variant="outline" className="rounded-full border-[#beb29f] bg-[#fffaf3] text-[#62594e] justify-center">今日 {getStageCount(selectedLog, productionStage) || 0} 张</Badge>
              <Badge variant="outline" className="rounded-full border-[#beb29f] bg-[#fffaf3] text-[#62594e] justify-center">目标 {selectedGoal.target || getProductionSuggestedTarget(productionStage)}</Badge>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 rounded-[24px] border border-dashed border-[#d0c7b8] bg-[#f7f1e7] p-4">
            <div>
              <div className="mb-2 text-sm text-[#766b5d]">{getProductionTargetLabel(productionStage)}</div>
              <Input value={selectedGoal.target} onChange={(e) => onUpdateGoalTarget(e.target.value)} className="rounded-2xl border-[#c4baa9] bg-[#fffdf8]" />
            </div>
            <div>
              <div className="mb-2 text-sm text-[#766b5d]">{getProductionFinishedLabel(productionStage)}</div>
              <Input value={String(getStageCount(selectedLog, productionStage))} onChange={(e) => onUpdateFinishedFrames(e.target.value)} className="rounded-2xl border-[#c4baa9] bg-[#fffdf8]" />
            </div>
          </div>
          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {selectedLog.timeBlocks.map((block) => (
              <div key={block.id} className="rounded-[24px] border border-[#d0c7b8] bg-[#fffdf8] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-start gap-3">
                  <Input value={block.time} onChange={(e) => onUpdateTimeBlock(block.id, "time", e.target.value)} className="w-[110px] rounded-full border-[#c4baa9] bg-[#fffdf8]" />
                  <Input value={block.task} onChange={(e) => onUpdateTimeBlock(block.id, "task", e.target.value)} className="flex-1 rounded-full border-[#c4baa9] bg-[#fffdf8]" />
                  <button type="button" onClick={() => onToggleBlock(block.id)} className="shrink-0">
                    {block.done ? <CheckCircle2 className="h-6 w-6 text-[#70896a]" /> : <Circle className="h-6 w-6 text-[#a39789]" />}
                  </button>
                  <Button type="button" variant="outline" size="icon" className={`rounded-full border-[#d3b9ac] text-[#8c5a54] ${interactiveButtonClass}`} onClick={() => onRemoveTimeBlock(block.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-3 flex items-center gap-2 text-sm text-[#766b5d]">
                  <div className="rounded-full bg-[#ebe3d4] p-2 text-[#5d5a53]">{getBlockIcon(block.icon)}</div>
                  <span>生活执行条目</span>
                </div>
              </div>
            ))}
          </div>
          <Button type="button" variant="outline" className={`w-full rounded-[20px] border-dashed border-[#cfc5b5] ${interactiveButtonClass}`} onClick={onAddTimeBlock}>
            <Plus className="mr-2 h-4 w-4" />新增生活计划条目
          </Button>
          <div className="rounded-[24px] border border-dashed border-[#c7bcaa] bg-[#f6eee1] p-4">
            <div className="mb-2 text-sm text-[#766b5d]">生活记录</div>
            <Textarea value={selectedLog.lifeNote} onChange={(e) => onUpdateLifeNote(e.target.value)} className="min-h-[170px] rounded-[24px] border-[#c4baa8] bg-[#fffdf8] resize-none" />
          </div>
        </CardContent>
      ) : null}
    </Card>
  );
}

function CurrentReviewPanel({
  selectedDate,
  selectedGoal,
  currentDraftCumulative,
  currentColorCumulative,
  checkpointRows,
  review,
  panelTexts,
  bodyHeight,
  collapsed,
  onToggleCollapse,
  onUpdateNote,
  onUpdateCheckpoint,
  onAddCheckpoint,
  onRemoveCheckpoint,
  onUpdatePanelText,
}: CurrentReviewPanelProps) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <Card className={`${panelClass("paper")} ${interactiveCardClass} group relative h-full overflow-hidden`}>
      <Tape side="left" />
      <Tape side="right" />
      <CardHeader className="relative z-20 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {isEditing ? (
              <div className="space-y-2">
                <Input value={panelTexts.reviewTitle} onChange={(e) => onUpdatePanelText("reviewTitle", e.target.value)} className="h-10 rounded-2xl border-[#c4baa9] bg-[#fffdf8] text-2xl text-[#2d3942]" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }} />
                <Input value={panelTexts.reviewDescription} onChange={(e) => onUpdatePanelText("reviewDescription", e.target.value)} className="h-9 rounded-2xl border-[#c4baa9] bg-[#fffdf8] text-sm text-[#766b5d]" />
              </div>
            ) : (
              <SectionHeading title={panelTexts.reviewTitle} description={panelTexts.reviewDescription} />
            )}
          </div>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <Button type="button" variant="outline" className={`rounded-full border-[#bbae9a] ${interactiveButtonClass}`} onClick={onAddCheckpoint}>
                <Plus className="mr-2 h-4 w-4" />新增
              </Button>
            ) : null}
            <Button type="button" variant="outline" className={`rounded-full border-[#bbae9a] ${interactiveButtonClass}`} onClick={() => setIsEditing((prev) => !prev)}>
              {isEditing ? <Check className="mr-2 h-4 w-4" /> : <NotebookPen className="mr-2 h-4 w-4" />}
              {isEditing ? "完成" : "编辑"}
            </Button>
            <Button type="button" variant="outline" className={`rounded-full border-[#bbae9a] bg-[#fffaf2] text-[#544e45] ${interactiveButtonClass}`} onClick={onToggleCollapse}>
              {collapsed ? <ChevronDown className="mr-2 h-4 w-4" /> : <ChevronUp className="mr-2 h-4 w-4" />}
              {collapsed ? "展开" : "收起"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative z-20 space-y-4 overflow-y-auto pr-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:w-0" style={{ height: bodyHeight }}>
        {!collapsed ? (
          <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
            {checkpointRows.map((point, index) => (
              <div key={point.id} className="rounded-[24px] border border-[#d1c7b7] bg-[#fffdf8] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md" style={{ transform: `rotate(${index % 2 === 0 ? "-0.12deg" : "0.16deg"})` }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    {isEditing ? <Input value={point.note} onChange={(e) => onUpdateCheckpoint(point.id, "note", e.target.value)} className="h-9 rounded-full border-[#c4baa9] bg-[#fffdf8] text-sm text-[#766b5d]" /> : <div className="text-sm text-[#766b5d]">{point.note}</div>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {isEditing ? <Input type="date" value={point.anchorDate} onChange={(e) => onUpdateCheckpoint(point.id, "anchorDate", e.target.value)} className="h-9 w-[118px] rounded-full border-[#c4baa9] bg-[#fffdf8] text-sm" /> : <Badge variant="outline" className="rounded-full border-[#beb29f] bg-[#fffaf3] text-[#62594e]">{displayDate(point.anchorDate)}</Badge>}
                    {isEditing ? <Button type="button" variant="outline" size="icon" className={`rounded-full border-[#d3b9ac] text-[#8c5a54] ${interactiveButtonClass}`} onClick={() => onRemoveCheckpoint(point.id)}><Trash2 className="h-4 w-4" /></Button> : null}
                  </div>
                </div>
                <div className="mt-3">
                  {isEditing ? <Input value={point.rangeLabel} onChange={(e) => onUpdateCheckpoint(point.id, "rangeLabel", e.target.value)} className="h-12 rounded-2xl border-[#c4baa9] bg-[#fffdf8] text-3xl font-semibold text-[#2d3942]" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }} /> : <div className="text-3xl font-semibold text-[#2d3942]" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>{point.rangeLabel}</div>}
                </div>
                <div className="mt-4 space-y-3 rounded-[20px] border border-dashed border-[#cfc5b5] bg-[#f7f1e7] p-3">
                  <div className="grid gap-3 md:grid-cols-[52px_1fr_auto] md:items-center text-sm">
                    <span className="text-[#766b5d]">阶段一</span>
                    {isEditing ? <Input type="number" min="0" value={point.draftTarget} onChange={(e) => onUpdateCheckpoint(point.id, "draftTarget", e.target.value)} className="h-9 rounded-2xl border-[#c4baa9] bg-[#fffdf8]" /> : <div className="font-medium text-[#2d3942]">目标：{point.draftTarget}</div>}
                    <Badge variant="outline" className={`rounded-full ${point.passedDraft ? "border-[#a5b4a2] bg-[#edf2eb] text-[#597054]" : "border-[#d3b9ac] bg-[#fff8f2] text-[#8c5a54]"}`}>当前：{point.actualDraft}</Badge>
                  </div>
                  <div className="grid gap-3 md:grid-cols-[52px_1fr_auto] md:items-center text-sm">
                    <span className="text-[#766b5d]">阶段二</span>
                    {isEditing ? <Input type="number" min="0" value={point.colorTarget} onChange={(e) => onUpdateCheckpoint(point.id, "colorTarget", e.target.value)} className="h-9 rounded-2xl border-[#c4baa9] bg-[#fffdf8]" /> : <div className="font-medium text-[#2d3942]">目标：{point.colorTarget}</div>}
                    <Badge variant="outline" className={`rounded-full ${point.passedColor ? "border-[#a5b4a2] bg-[#edf2eb] text-[#597054]" : "border-[#d3b9ac] bg-[#fff8f2] text-[#8c5a54]"}`}>当前：{point.actualColor}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : <div className="rounded-[22px] border border-[#d0c7b8] bg-[#fffdf8] p-4 text-sm leading-6 text-[#766b5d]">累计目标区已收起。展开后查看和修改关键节点。</div>}
        <div className="rounded-[24px] border border-dashed border-[#c7bcaa] bg-[#f6eee1] p-4 transition-all duration-200 group-hover:shadow-sm">
          <div className="mb-2 flex items-center justify-between gap-3">
            <div className="text-sm text-[#766b5d]">阶段备注</div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={`rounded-full border ${getStatusTone(selectedGoal.kind)}`}>阶段一累计 {currentDraftCumulative}</Badge>
              <Badge variant="outline" className={`rounded-full border ${getStatusTone(selectedGoal.kind)}`}>阶段二累计 {currentColorCumulative}</Badge>
            </div>
          </div>
          <Textarea value={review.note} onChange={(e) => onUpdateNote(e.target.value)} placeholder="写今天的累计目标判断、偏差、缺口和临时调整。" className="min-h-[180px] resize-none rounded-[24px] border-[#c4baa8] bg-[#fffdf8] transition-all duration-200 focus:shadow-sm" />
        </div>
      </CardContent>
    </Card>
  );
}

function OverallGoalPanel({
  selectedDate,
  selectedGoal,
  visiblePlans,
  selectedPlan,
  dailyLogs,
  totalColored,
  totalFrames,
  panelTexts,
  bodyHeight,
  collapsed,
  onToggleCollapse,
  onSelectDate,
  onTogglePlan,
  onUpdatePlan,
  onAddPlan,
  onRemovePlan,
  onUpdateTotalFrames,
  onUpdatePanelText,
}: OverallGoalPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const doneCount = visiblePlans.filter((plan) => plan.done).length;
  const totalCount = visiblePlans.length;

  return (
    <Card className={`${panelClass("accent")} ${interactiveCardClass} group relative h-full overflow-hidden`}>
      <Tape side="left" />
      <Tape side="right" />
      <CardHeader className="relative z-20 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {isEditing ? (
              <div className="space-y-2">
                <Input value={panelTexts.overallTitle} onChange={(e) => onUpdatePanelText("overallTitle", e.target.value)} className="h-10 rounded-2xl border-[#c4baa9] bg-[#fffdf8] text-2xl text-[#2d3942]" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }} />
                <Input value={panelTexts.overallDescription} onChange={(e) => onUpdatePanelText("overallDescription", e.target.value)} className="h-9 rounded-2xl border-[#c4baa9] bg-[#fffdf8] text-sm text-[#766b5d]" />
              </div>
            ) : (
              <SectionHeading title={panelTexts.overallTitle} description={panelTexts.overallDescription} />
            )}
          </div>
          <div className="flex items-center gap-2">
            {isEditing ? <Button type="button" variant="outline" className={`rounded-full border-[#bbae9a] ${interactiveButtonClass}`} onClick={onAddPlan}><Plus className="mr-2 h-4 w-4" />新增</Button> : null}
            <Button type="button" variant="outline" className={`rounded-full border-[#bbae9a] ${interactiveButtonClass}`} onClick={() => setIsEditing((prev) => !prev)}>
              {isEditing ? <Check className="mr-2 h-4 w-4" /> : <NotebookPen className="mr-2 h-4 w-4" />}
              {isEditing ? "完成" : "编辑"}
            </Button>
            <Button type="button" variant="outline" className={`rounded-full border-[#bbae9a] bg-[#fffaf2] text-[#544e45] ${interactiveButtonClass}`} onClick={onToggleCollapse}>
              {collapsed ? <ChevronDown className="mr-2 h-4 w-4" /> : <ChevronUp className="mr-2 h-4 w-4" />}
              {collapsed ? "展开" : "收起"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative z-20 space-y-4 overflow-y-auto pr-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:w-0" style={{ height: bodyHeight }}>
        <div className="rounded-[24px] border border-dashed border-[#d7b4bb] bg-[#f8eef1] p-4 transition-all duration-200 group-hover:shadow-sm">
          <div className="mb-2 flex items-center justify-between gap-3">
            <div className="text-sm text-[#766b5d]">总目标</div>
            <Badge variant="outline" className="rounded-full border-[#beb29f] bg-[#fffaf3] text-[#62594e]">已完成 {doneCount}/{totalCount}</Badge>
          </div>
          <div className="flex items-end gap-3">
            <div className="text-4xl font-semibold text-[#2d3942]" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>{totalColored} / {totalFrames}</div>
            {isEditing ? <Input type="number" min="1" value={totalFrames} onChange={(e) => onUpdateTotalFrames(e.target.value)} className="h-9 max-w-[110px] rounded-2xl border-[#c4baa9] bg-[#fffdf8]" /> : null}
          </div>
          <div className="mt-2 text-sm text-[#766b5d]">这里记录最终完成的总数量</div>
        </div>
        {!collapsed ? (
          <div className="space-y-3 max-h-[430px] overflow-y-auto pr-1">
            {visiblePlans.map((plan, index) => {
              const isActive = plan.date === selectedDate;
              const isPast = plan.date < selectedDate;
              const actualColor = getColorCount(dailyLogs[plan.date]);

              if (!isEditing) {
                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => onSelectDate(plan.date)}
                    className={`w-full rounded-[22px] border p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                      isActive
                        ? "border-[#2f3b45] bg-[#2f3b45] text-[#fbf5ec]"
                        : isPast
                          ? "border-[#d4c7b5] bg-[#efe7db] text-[#4e463e]"
                          : "border-[#d1c7b7] bg-[#fffdf8] text-[#2d3942]"
                    }`}
                    style={{ transform: `rotate(${index % 2 === 0 ? "-0.12deg" : "0.16deg"})` }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className={`text-sm ${isActive ? "text-[#fbf5ec]/88" : isPast ? "text-[#7b6f62]" : "text-[#766b5d]"}`}>{displayDate(plan.date)}</div>
                        <div className={`mt-1 text-sm font-medium ${isActive ? "text-[#fbf5ec]" : isPast ? "text-[#5a5147]" : "text-[#2d3942]"}`}>{plan.kind}</div>
                      </div>
                      <div className={`text-2xl font-semibold ${isActive ? "text-[#fbf5ec]" : isPast ? "text-[#4e463e]" : "text-[#2d3942]"}`} style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
                        {plan.target || actualColor || 0}
                      </div>
                    </div>
                  </button>
                );
              }

              return (
                <div key={plan.id} className="rounded-[22px] border border-[#d1c7b7] bg-[#fffdf8] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md" style={{ transform: `rotate(${index % 2 === 0 ? "-0.12deg" : "0.16deg"})` }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1 space-y-2">
                      <Input type="date" value={plan.date} onChange={(e) => onUpdatePlan(plan.id, "date", e.target.value)} className="h-9 rounded-full border-[#c4baa9] bg-[#fffdf8]" />
                      <Select value={plan.kind} onValueChange={(value) => onUpdatePlan(plan.id, "kind", value)}>
                        <SelectTrigger className={`h-9 rounded-full border-[#c4baa9] bg-[#fffdf8] ${interactiveButtonClass}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="恢复日">恢复日</SelectItem>
                          <SelectItem value="轻量日">轻量日</SelectItem>
                          <SelectItem value="标准日">标准日</SelectItem>
                          <SelectItem value="冲刺日">冲刺日</SelectItem>
                          <SelectItem value="修正日">修正日</SelectItem>
                          <SelectItem value="交稿日">交稿日</SelectItem>
                          <SelectItem value="自定义">自定义</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-[92px] shrink-0 space-y-2">
                      <Input value={plan.target} onChange={(e) => onUpdatePlan(plan.id, "target", e.target.value)} className="h-9 rounded-full border-[#c4baa9] bg-[#fffdf8] text-right text-lg font-semibold text-[#2d3942]" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }} />
                      <div className="text-right text-xs text-[#766b5d]">完整稿 {actualColor} 张</div>
                    </div>
                  </div>
                  <div className="mt-3 space-y-2">
                    <Input value={plan.note} onChange={(e) => onUpdatePlan(plan.id, "note", e.target.value)} placeholder="给这一天留一句规划备注" className="h-9 rounded-full border-[#c4baa9] bg-[#fffdf8]" />
                    <div className="flex items-center justify-between gap-2">
                      <Button type="button" variant="outline" className={`rounded-full border-[#bbae9a] ${interactiveButtonClass}`} onClick={() => onTogglePlan(plan.id)}>
                        {plan.done ? "取消完成" : "标记完成"}
                      </Button>
                      <Button type="button" variant="outline" size="icon" className={`rounded-full border-[#d3b9ac] text-[#8c5a54] ${interactiveButtonClass}`} onClick={() => onRemovePlan(plan.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[22px] border border-[#d0c7b8] bg-[#fffdf8] p-4 text-sm leading-6 text-[#766b5d]">总目标区已收起。展开后查看和修改阶段目标列表。</div>
        )}
      </CardContent>
    </Card>
  );
}

function CalendarPanel({
  visibleMonthDate,
  monthDays,
  selectedDate,
  goalsMap,
  dailyLogs,
  selectedLog,
  onSelectDate,
  onNavigateMonth,
  onUpdateCalendarNote,
  onUpdateCalendarAccent,
}: CalendarPanelProps) {
  const [editingNoteDate, setEditingNoteDate] = useState<string | null>(null);
  const [focusedDate, setFocusedDate] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (editingNoteDate && editingNoteDate !== focusedDate) {
      setEditingNoteDate(null);
    }
  }, [editingNoteDate, focusedDate]);

  useEffect(() => {
    if (!focusedDate && !editingNoteDate) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (cardRef.current && target && cardRef.current.contains(target)) return;
      setFocusedDate(null);
      setEditingNoteDate(null);
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [focusedDate, editingNoteDate]);

  return (
    <>
      {focusedDate || editingNoteDate ? (
        <div
          className="fixed inset-0 z-10"
          onMouseDown={() => {
            setFocusedDate(null);
            setEditingNoteDate(null);
          }}
        />
      ) : null}
      <Card ref={cardRef} className={`${panelClass("paper")} ${interactiveCardClass} group relative z-20 h-full overflow-hidden`}>
      <Tape side="left" />
      <Tape side="right" />
      <CardHeader className="relative z-20">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-2xl text-[#2d3942]" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
              <CalendarDays className="h-6 w-6 transition-transform duration-200 group-hover:-rotate-6" />
              {formatMonthLabel(visibleMonthDate)}
            </CardTitle>
            <CardDescription className="text-[#766b5d]">月历打卡墙</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="icon" className={`rounded-full border-[#bbae9a] bg-[#fffaf2] text-[#544e45] ${interactiveButtonClass}`} onClick={() => onNavigateMonth(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button type="button" variant="outline" size="icon" className={`rounded-full border-[#bbae9a] bg-[#fffaf2] text-[#544e45] ${interactiveButtonClass}`} onClick={() => onNavigateMonth(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative z-20" onClick={() => {
        setFocusedDate(null);
        setEditingNoteDate(null);
      }}>
        <div className="mb-3 grid grid-cols-7 gap-3 text-center text-sm text-[#766b5d]">
          {[
            { label: "Sun", accent: "text-[#b87074]" },
            { label: "Mon" },
            { label: "Tue" },
            { label: "Wed" },
            { label: "Thu" },
            { label: "Fri" },
            { label: "Sat" },
          ].map((day) => (
            <div key={day.label} className={`py-2 ${day.accent || ""}`}>
              {day.label}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-3">
          {monthDays.map((date, index) => {
            if (!date) {
              return <div key={`empty-${index}`} className="aspect-[1/1.24] rounded-[24px] bg-[#ddd5c8]/55" />;
            }

            const key = formatDateKey(date);
            const goal = goalsMap[key];
            const log = dailyLogs[key];
            const isActive = focusedDate === key;
            const noteText = ensureDailyLog(log).calendarNote || "";
            const holiday = HOLIDAY_MAP[key];
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            const isEditingNote = editingNoteDate === key;
            const noteAccent = NOTE_ACCENT_OPTIONS.find((item) => item.value === ensureDailyLog(log).noteAccent) || NOTE_ACCENT_OPTIONS[0];

            if (isActive) {
              return (
                <div
                  key={key}
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectDate(key);
                    setFocusedDate(key);
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    onSelectDate(key);
                    setFocusedDate(key);
                    setEditingNoteDate(key);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelectDate(key);
                      setFocusedDate(key);
                    }
                  }}
                  className="aspect-[1/1.24] rounded-[26px] border border-[#2f3b45] bg-[#2f3b45] p-3 text-left text-[#fbf5ec] transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-md"
                >
                  <div className="flex h-full flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-sm font-medium">{date.getDate()}</div>
                      <div className="flex flex-wrap items-center justify-end gap-1">
                        {holiday ? (
                          <Badge variant="outline" className="rounded-full border-white/20 bg-white/12 px-2 text-[10px] text-white">
                            {holiday.short}
                          </Badge>
                        ) : null}
                        {goal?.kind ? (
                          <Badge variant="outline" className="rounded-full border-white/30 text-[10px] text-white">
                            {goal.kind.replace("日", "")}
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                    <div className="mt-2 text-[10px] text-[#d6d0c8]">目标</div>
                    <div className="text-sm font-semibold">{goal?.target || "-"}</div>
                    <div className="mt-2 flex items-center justify-between text-[10px] text-[#d6d0c8]">
                      <span>线 {getDraftCount(log)} / 色 {getColorCount(log)}</span>
                      <span>{holiday?.label || "备注"}</span>
                    </div>
                    <div
                      className="mt-2 h-[148px] overflow-hidden rounded-[18px] border border-white/16 bg-[#46525e] px-2 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        setFocusedDate(key);
                        setEditingNoteDate(key);
                      }}
                    >
                      <div className="flex items-center justify-between gap-2 text-[10px] text-white/70">
                        <div className="flex items-center gap-2">
                          <span className="h-8 w-1 rounded-full" style={{ backgroundColor: noteAccent.color }} />
                          <span>{holiday ? `${holiday.label} / 事项` : "我的事项"}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {NOTE_ACCENT_OPTIONS.map((option) => {
                            const active = option.value === selectedLog.noteAccent;
                            return (
                              <button
                                key={option.value}
                                type="button"
                                title={option.label}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onUpdateCalendarAccent(option.value);
                                }}
                                className={`h-3.5 w-3.5 rounded-full border transition-transform duration-200 hover:scale-110 ${active ? "border-white/90 ring-1 ring-white/40" : "border-white/25"}`}
                                style={{ backgroundColor: option.color }}
                              />
                            );
                          })}
                        </div>
                      </div>
                      {isEditingNote ? (
                        <Textarea
                          autoFocus
                          value={noteText}
                          onClick={(e) => e.stopPropagation()}
                          onDoubleClick={(e) => e.stopPropagation()}
                          onBlur={() => setEditingNoteDate(null)}
                          onKeyDown={(e) => {
                            if (e.key === "Escape") {
                              e.preventDefault();
                              setEditingNoteDate(null);
                            }
                          }}
                          onChange={(e) => onUpdateCalendarNote(e.target.value)}
                          placeholder="写备注"
                          className="mt-2 h-[106px] resize-none overflow-y-auto border-0 bg-transparent px-0 py-0 pr-2 text-[12px] leading-5 text-white placeholder:text-white/45 focus-visible:ring-0 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/30 hover:[&::-webkit-scrollbar-thumb]:bg-white/45"
                        />
                      ) : (
                        <div className="mt-2 h-[106px] overflow-y-auto pr-2 text-[12px] leading-[1.55] text-white whitespace-pre-wrap break-words [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/30 hover:[&::-webkit-scrollbar-thumb]:bg-white/45">
                          {noteText ? noteText : "双击进入备注编辑"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <button
                key={key}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectDate(key);
                  setFocusedDate(key);
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  onSelectDate(key);
                  setFocusedDate(key);
                  setEditingNoteDate(key);
                }}
                className={`aspect-[1/1.24] rounded-[26px] border border-[#d0c7b8] bg-[#fffdf8] p-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-md ${isWeekend ? "text-[#7b625e]" : "text-[#2d3942]"}`}
              >
                <div className="flex h-full flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div className={`text-sm font-medium ${holiday ? "text-[#ab6068]" : ""}`}>{date.getDate()}</div>
                    <div className="flex flex-wrap items-center justify-end gap-1">
                      {holiday ? (
                        <Badge variant="outline" className={`rounded-full px-2 text-[10px] ${holiday.tint}`}>
                          {holiday.short}
                        </Badge>
                      ) : null}
                      {goal?.kind ? (
                        <Badge variant="outline" className={`rounded-full text-[10px] transition-all duration-200 hover:scale-[1.03] ${getStatusTone(goal.kind)}`}>
                          {goal.kind.replace("日", "")}
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                  <div className="mt-2 text-[10px] text-[#766b5d]">目标</div>
                  <div className="text-sm font-semibold text-[#2d3942]">{goal?.target || "-"}</div>
                  <div className="mt-2 text-[10px] text-[#766b5d]">线 {getDraftCount(log)} / 色 {getColorCount(log)}</div>
                  {noteText ? (
                    <div className="mt-2 rounded-[16px] border border-[#d6cec1] bg-[#f8f3ea] px-2.5 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                      <div className="flex items-start gap-2.5">
                        <span className="mt-0.5 h-10 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: noteAccent.color }} />
                        <div className="min-w-0 text-[11px] leading-[1.45] text-[#5f564c] line-clamp-4 font-medium">{noteText}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 line-clamp-3 text-[11px] leading-[1.45] text-[#6f665b]">
                      {holiday ? holiday.label : "双击可进入备注编辑"}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
        <div className="mt-4 rounded-[20px] border border-dashed border-[#c7bcaa] bg-[#f6eee1] p-3 text-sm text-[#766b5d]">
          {focusedDate ? `当前选中 ${displayDate(focusedDate)}。单击切日期，双击当前格子进入备注编辑，点击背景可取消选中。` : "当前没有选中日期。单击日期切换，双击格子进入备注编辑，点击背景可恢复默认状态。"}
        </div>
      </CardContent>
    </Card>
    </>
  );
}

function ReminderPanel({ reminderSettings, selectedLog, onRequestPermission, onUpdateReminderSetting, onPreviewSound }: ReminderPanelProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <Card className={`${panelClass("paper")} ${interactiveCardClass} group relative h-full overflow-hidden`}>
        <Tape side="left" />
        <CardHeader className="relative z-20">
          <CardTitle className="flex items-center gap-2 text-2xl text-[#2d3942]" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
            <Bell className="h-5 w-5 transition-transform duration-200 group-hover:rotate-12" /> 提醒设置
          </CardTitle>
          <CardDescription className="text-[#766b5d]">适合页面打开时的桌面提醒</CardDescription>
        </CardHeader>
        <CardContent className="relative z-20 space-y-5">
          <div className="rounded-[22px] border border-[#d0c7b8] bg-[#fffdf8] p-4 transition-all duration-200 group-hover:shadow-sm">
            <div className="text-sm text-[#766b5d]">通知权限</div>
            <div className="mt-1 text-lg font-medium text-[#2f3b45]">{reminderSettings.permission}</div>
            <Button className={`mt-3 rounded-full bg-[#2f3b45] text-[#fbf5ec] hover:bg-[#243039] ${interactiveButtonClass}`} onClick={onRequestPermission}>
              请求提醒权限
            </Button>
          </div>
          <div className="space-y-4 rounded-[22px] border border-[#d0c7b8] bg-[#fffdf8] p-4 transition-all duration-200 group-hover:shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-medium text-[#2f3b45]">启用提醒</div>
                <div className="text-sm text-[#766b5d]">在时间块开始时提醒你</div>
              </div>
              <Switch checked={reminderSettings.enabled} disabled={reminderSettings.permission !== "granted"} onCheckedChange={(checked) => onUpdateReminderSetting("enabled", checked)} />
            </div>
            <div>
              <div className="mb-2 text-sm text-[#766b5d]">提前提醒</div>
              <Select value={String(reminderSettings.leadMinutes)} onValueChange={(value) => onUpdateReminderSetting("leadMinutes", Number(value))}>
                <SelectTrigger className={`rounded-2xl border-[#c4baa9] bg-[#fffdf8] ${interactiveButtonClass}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">准点提醒</SelectItem>
                  <SelectItem value="5">提前 5 分钟</SelectItem>
                  <SelectItem value="10">提前 10 分钟</SelectItem>
                  <SelectItem value="15">提前 15 分钟</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-medium text-[#2f3b45]">提示音</div>
                <div className="text-sm text-[#766b5d]">提醒触发时短音提示</div>
              </div>
              <Switch checked={reminderSettings.sound} onCheckedChange={(checked) => onUpdateReminderSetting("sound", checked)} />
            </div>
            <div>
              <div className="mb-2 text-sm text-[#766b5d]">提示音类型</div>
              <Select value={reminderSettings.soundPreset} onValueChange={(value) => onUpdateReminderSetting("soundPreset", value)}>
                <SelectTrigger className={`rounded-2xl border-[#c4baa9] bg-[#fffdf8] ${interactiveButtonClass}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="softBell">轻提示</SelectItem>
                  <SelectItem value="woodTap">木质敲击</SelectItem>
                  <SelectItem value="digitalPing">数字提示</SelectItem>
                  <SelectItem value="glassChime">玻璃钟声</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between gap-3 text-sm text-[#766b5d]">
                <span>音量</span>
                <span>{Math.round(reminderSettings.soundVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={Math.round(reminderSettings.soundVolume * 100)}
                onChange={(e) => onUpdateReminderSetting("soundVolume", Number(e.target.value) / 100)}
                className="w-full accent-[#2f3b45]"
              />
            </div>
            <Button type="button" variant="outline" className={`w-full rounded-[20px] border-[#c4baa9] ${interactiveButtonClass}`} onClick={() => onPreviewSound(reminderSettings.soundPreset, reminderSettings.soundVolume)}>
              试听 {getSoundLabel(reminderSettings.soundPreset)}
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card className={`${panelClass("accent")} ${interactiveCardClass} group relative h-full overflow-hidden`}>
        <Tape side="right" />
        <CardHeader className="relative z-20">
          <SectionHeading title="Reminder Preview" description="按当前日期的时间块来提醒" />
        </CardHeader>
        <CardContent className="relative z-20 space-y-3">
          {selectedLog.timeBlocks.map((block) => (
            <div key={block.id} className="flex items-center justify-between rounded-[22px] border border-[#d0c7b8] bg-[#fffdf8] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-[#ebe3d4] p-2 text-[#5d5a53] transition-all duration-200 hover:scale-105">{getBlockIcon(block.icon)}</div>
                <div>
                  <div className="text-sm text-[#766b5d]">{block.time}</div>
                  <div className="font-medium text-[#2f3b45]">{block.task}</div>
                </div>
              </div>
              <Badge variant="outline" className={`rounded-full transition-all duration-200 hover:scale-[1.03] ${block.done ? "border-[#a5b4a2] bg-[#edf2eb] text-[#597054]" : "border-[#c4baa8] bg-[#f5efe5] text-[#6a6257]"}`}>
                {block.done ? "已完成" : "待提醒"}
              </Badge>
            </div>
          ))}
          <div className="rounded-[22px] border border-dashed border-[#c7bcaa] bg-[#fff8ef]/80 p-4 text-sm leading-6 text-[#766b5d] transition-all duration-200 group-hover:shadow-sm">
            当前提醒音：{getSoundLabel(reminderSettings.soundPreset)}。页面打开、浏览器允许通知时可用。
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PomodoroPanel({ pomodoro, onStartPause, onReset, onSwitchMode, onUpdateMinutes, onUpdateSoundSetting, onPreviewSound }: PomodoroPanelProps) {
  const modeLabel = pomodoro.currentMode === "focus" ? "专注中" : pomodoro.currentMode === "shortBreak" ? "短休息" : "长休息";
  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <Card className={`${panelClass("paper")} ${interactiveCardClass} group relative h-full overflow-hidden`}>
        <Tape side="left" />
        <Tape side="right" />
        <CardHeader className="relative z-20 space-y-3">
          <SectionHeading title="Pomodoro" description="本地番茄钟" />
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className={`rounded-full ${pomodoro.currentMode === "focus" ? "border-[#2f3b45] bg-[#2f3b45] text-[#fbf5ec]" : "border-[#c4baa8] bg-[#fffdf8] text-[#766b5d]"}`}>专注</Badge>
            <Badge variant="outline" className={`rounded-full ${pomodoro.currentMode === "shortBreak" ? "border-[#8b7247] bg-[#efe5c8] text-[#705b36]" : "border-[#c4baa8] bg-[#fffdf8] text-[#766b5d]"}`}>短休息</Badge>
            <Badge variant="outline" className={`rounded-full ${pomodoro.currentMode === "longBreak" ? "border-[#8c5a54] bg-[#eadad4] text-[#724641]" : "border-[#c4baa8] bg-[#fffdf8] text-[#766b5d]"}`}>长休息</Badge>
          </div>
        </CardHeader>
        <CardContent className="relative z-20 space-y-6">
          <div className="rounded-[28px] border border-dashed border-[#c7bcaa] bg-[#f6eee1] p-6 text-center transition-all duration-200 group-hover:shadow-sm">
            <div className="text-sm text-[#766b5d]">{modeLabel}</div>
            <div className="mt-3 text-6xl font-semibold tracking-wide text-[#2d3942] md:text-7xl" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
              {formatPomodoroClock(pomodoro.secondsLeft)}
            </div>
            <div className="mt-3 text-sm text-[#766b5d]">已完成专注轮次 {pomodoro.completedFocusCount}</div>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <Button type="button" className={`rounded-full bg-[#2f3b45] text-[#fbf5ec] hover:bg-[#243039] ${interactiveButtonClass}`} onClick={onStartPause}>
              {pomodoro.isRunning ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
              {pomodoro.isRunning ? "暂停" : "开始"}
            </Button>
            <Button type="button" variant="outline" className={`rounded-full border-[#bbae9a] ${interactiveButtonClass}`} onClick={onReset}>
              <RotateCcw className="mr-2 h-4 w-4" />重置
            </Button>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <Button type="button" variant="outline" className={`rounded-[20px] border-[#c4baa8] ${interactiveButtonClass}`} onClick={() => onSwitchMode("focus")}>切到专注</Button>
            <Button type="button" variant="outline" className={`rounded-[20px] border-[#c4baa8] ${interactiveButtonClass}`} onClick={() => onSwitchMode("shortBreak")}>切到短休息</Button>
            <Button type="button" variant="outline" className={`rounded-[20px] border-[#c4baa8] ${interactiveButtonClass}`} onClick={() => onSwitchMode("longBreak")}>切到长休息</Button>
          </div>
        </CardContent>
      </Card>

      <Card className={`${panelClass("accent")} ${interactiveCardClass} group relative h-full overflow-hidden`}>
        <Tape side="right" />
        <CardHeader className="relative z-20">
          <SectionHeading title="Timer Setup" description="时长和声音可改" />
        </CardHeader>
        <CardContent className="relative z-20 space-y-4">
          <div className="rounded-[24px] border border-dashed border-[#c7bcaa] bg-[#f6eee1] p-4 transition-all duration-200 group-hover:shadow-sm">
            <div className="mb-2 text-sm text-[#766b5d]">专注时长</div>
            <Input type="number" min="1" value={pomodoro.focusMinutes} onChange={(e) => onUpdateMinutes("focusMinutes", e.target.value)} className="rounded-2xl border-[#c4baa9] bg-[#fffdf8]" />
          </div>
          <div className="rounded-[24px] border border-dashed border-[#c7bcaa] bg-[#f6eee1] p-4 transition-all duration-200 group-hover:shadow-sm">
            <div className="mb-2 text-sm text-[#766b5d]">短休息时长</div>
            <Input type="number" min="1" value={pomodoro.shortBreakMinutes} onChange={(e) => onUpdateMinutes("shortBreakMinutes", e.target.value)} className="rounded-2xl border-[#c4baa9] bg-[#fffdf8]" />
          </div>
          <div className="rounded-[24px] border border-dashed border-[#c7bcaa] bg-[#f6eee1] p-4 transition-all duration-200 group-hover:shadow-sm">
            <div className="mb-2 text-sm text-[#766b5d]">长休息时长</div>
            <Input type="number" min="1" value={pomodoro.longBreakMinutes} onChange={(e) => onUpdateMinutes("longBreakMinutes", e.target.value)} className="rounded-2xl border-[#c4baa9] bg-[#fffdf8]" />
          </div>
          <div className="rounded-[24px] border border-dashed border-[#c7bcaa] bg-[#f6eee1] p-4 transition-all duration-200 group-hover:shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-medium text-[#2f3b45]">结束提示音</div>
                <div className="text-sm text-[#766b5d]">番茄钟一段结束时播放</div>
              </div>
              <Switch checked={pomodoro.soundEnabled} onCheckedChange={(checked) => onUpdateSoundSetting("soundEnabled", checked)} />
            </div>
            <div>
              <div className="mb-2 text-sm text-[#766b5d]">提示音类型</div>
              <Select value={pomodoro.soundPreset} onValueChange={(value) => onUpdateSoundSetting("soundPreset", value)}>
                <SelectTrigger className={`rounded-2xl border-[#c4baa9] bg-[#fffdf8] ${interactiveButtonClass}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="softBell">轻提示</SelectItem>
                  <SelectItem value="woodTap">木质敲击</SelectItem>
                  <SelectItem value="digitalPing">数字提示</SelectItem>
                  <SelectItem value="glassChime">玻璃钟声</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between gap-3 text-sm text-[#766b5d]">
                <span>音量</span>
                <span>{Math.round(pomodoro.soundVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={Math.round(pomodoro.soundVolume * 100)}
                onChange={(e) => onUpdateSoundSetting("soundVolume", Number(e.target.value))}
                className="w-full accent-[#2f3b45]"
              />
            </div>
            <Button type="button" variant="outline" className={`w-full rounded-[20px] border-[#c4baa9] ${interactiveButtonClass}`} onClick={() => onPreviewSound(pomodoro.soundPreset, pomodoro.soundVolume)}>
              试听 {getSoundLabel(pomodoro.soundPreset)}
            </Button>
          </div>
          <div className="rounded-[22px] border border-dashed border-[#c7bcaa] bg-[#fff8ef]/80 p-4 text-sm leading-6 text-[#766b5d]">
            当前模式结束后会自动切到下一段。专注结束 4 轮后会切到长休息。
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CreativeWorkDashboard() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const todayKey = formatDateKey(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(todayKey);
  const [toast, setToast] = useState<string>("");
  const [lifeCollapsed, setLifeCollapsed] = useState(false);
  const [reviewCollapsed, setReviewCollapsed] = useState(false);
  const [overallCollapsed, setOverallCollapsed] = useState(false);
  const [topCardEditState, setTopCardEditState] = useState<TopCardEditState>({ hero: false, lead: false, note: false, date: false });
  const [activeTab, setActiveTab] = useState<MainTabKey>("dashboard");
  const [panelHeights, setPanelHeights] = useState<PanelHeights>(() => {
    if (typeof window === "undefined") return DEFAULT_PANEL_HEIGHTS;
    try {
      const saved = window.localStorage.getItem(PANEL_HEIGHTS_STORAGE_KEY);
      if (!saved) return DEFAULT_PANEL_HEIGHTS;
      return { ...DEFAULT_PANEL_HEIGHTS, ...(JSON.parse(saved) as Partial<PanelHeights>) };
    } catch {
      return DEFAULT_PANEL_HEIGHTS;
    }
  });
  const [store, setStore] = useState<StoreShape>(() => {
    if (typeof window === "undefined") return createDefaultStore();
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (!saved) return createDefaultStore();
      const parsed = JSON.parse(saved) as Partial<StoreShape>;
      return {
        ...createDefaultStore(),
        ...parsed,
        dailyLogs: parsed.dailyLogs || {},
        currentReviews: parsed.currentReviews || {},
        checkpoints: Array.isArray(parsed.checkpoints) && parsed.checkpoints.length > 0 ? parsed.checkpoints.map((item) => normalizeCheckpointItem(item)) : CHECKPOINTS.map((item) => normalizeCheckpointItem({ ...item })),
        overallPlans: Array.isArray(parsed.overallPlans) ? parsed.overallPlans.map((item) => normalizeOverallPlanItem(item)) : buildSeedOverallPlans().map((item) => normalizeOverallPlanItem(item)),
        reminderSettings: {
          ...defaultReminderSettings,
          ...(parsed.reminderSettings || {}),
          notified: parsed.reminderSettings?.notified || {},
        },
        pomodoro: {
          ...defaultPomodoroState,
          ...(parsed.pomodoro || {}),
        },
        topCards: {
          ...defaultTopCards,
          ...(parsed.topCards || {}),
        },
        panelTexts: {
          ...defaultPanelTexts,
          ...(parsed.panelTexts || {}),
        },
      };
    } catch {
      return createDefaultStore();
    }
  });

  const updateTopCardContent = (field: keyof TopCardsContent, value: string) => {
    setStore((prev) => ({
      ...prev,
      topCards: {
        ...prev.topCards,
        [field]: value,
      },
    }));
  };

  const updatePanelText = (field: keyof PanelTextContent, value: string) => {
    setStore((prev) => ({
      ...prev,
      panelTexts: {
        ...prev.panelTexts,
        [field]: value,
      },
    }));
  };

  const toggleTopCardEdit = (key: keyof TopCardEditState) => {
    setTopCardEditState((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const goalsMap = useMemo(() => buildGoalsMap(store.overallPlans), [store.overallPlans]);
  const selectedGoal = goalsMap[selectedDate] || { target: "", kind: "自定义" as GoalKind };
  const selectedLog = ensureDailyLog(store.dailyLogs[selectedDate]);
  const selectedReview = ensureReviewState(store.currentReviews[selectedDate]);

  const visibleMonthDate = useMemo(() => {
    const baseDate = parseDateKey(selectedDate);
    return new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
  }, [selectedDate]);

  const monthDays = useMemo(() => getMonthDays(visibleMonthDate.getFullYear(), visibleMonthDate.getMonth()), [visibleMonthDate]);
  const visiblePlans = useMemo(() => getVisibleMonthPlans(store.overallPlans, visibleMonthDate), [store.overallPlans, visibleMonthDate]);
  const selectedPlan = useMemo(() => store.overallPlans.find((plan) => plan.date === selectedDate), [store.overallPlans, selectedDate]);
  const selectedMonthLabel = useMemo(() => formatMonthLabel(visibleMonthDate), [visibleMonthDate]);
  const pomodoro = store.pomodoro;

  const totalFinished = useMemo(() => Object.values(store.dailyLogs).reduce((sum, item) => sum + getColorCount(item), 0), [store.dailyLogs]);
  const completionRate = Math.min(100, Math.round((totalFinished / store.totalFrames) * 100));

  const draftCumulativeByDate = useMemo(() => {
    const keys = Object.keys(store.dailyLogs).sort();
    let running = 0;
    const result: Record<string, number> = {};
    keys.forEach((key) => {
      running += getDraftCount(store.dailyLogs[key]);
      result[key] = running;
    });
    return result;
  }, [store.dailyLogs]);

  const colorCumulativeByDate = useMemo(() => {
    const keys = Object.keys(store.dailyLogs).sort();
    let running = 0;
    const result: Record<string, number> = {};
    keys.forEach((key) => {
      running += getColorCount(store.dailyLogs[key]);
      result[key] = running;
    });
    return result;
  }, [store.dailyLogs]);

  const currentDraftCumulative = draftCumulativeByDate[selectedDate] || 0;
  const currentColorCumulative = colorCumulativeByDate[selectedDate] || 0;

  const checkpointRows = useMemo(
    () =>
      store.checkpoints.map((point) => {
        const actualDraft = currentDraftCumulative;
        const actualColor = currentColorCumulative;
        return {
          ...point,
          actualDraft,
          actualColor,
          passedDraft: actualDraft >= point.draftTarget,
          passedColor: actualColor >= point.colorTarget,
        };
      }),
    [store.checkpoints, currentDraftCumulative, currentColorCumulative],
  );

  const activeTargetNumber = parseTargetMidpoint(selectedGoal.target);
  const activeFinishedNumber = getStageCount(selectedLog, store.productionStage);
  const todayRate = activeTargetNumber > 0 ? Math.min(100, Math.round((activeFinishedNumber / activeTargetNumber) * 100)) : 0;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleWindowError = (event: ErrorEvent) => {
      if (shouldIgnoreResizeObserverError(event.message || "")) {
        event.preventDefault();
      }
    };
    window.addEventListener("error", handleWindowError);
    return () => window.removeEventListener("error", handleWindowError);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  }, [store]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(PANEL_HEIGHTS_STORAGE_KEY, JSON.stringify(panelHeights));
  }, [panelHeights]);

  useEffect(() => {
    setStore((prev) => {
      const needsLog = !prev.dailyLogs[selectedDate];
      const needsReview = !prev.currentReviews[selectedDate];
      if (!needsLog && !needsReview) return prev;
      return {
        ...prev,
        dailyLogs: {
          ...prev.dailyLogs,
          [selectedDate]: needsLog ? createDailyLogForStage(prev.productionStage) : prev.dailyLogs[selectedDate],
        },
        currentReviews: {
          ...prev.currentReviews,
          [selectedDate]: needsReview ? ensureReviewState() : prev.currentReviews[selectedDate],
        },
      };
    });
  }, [selectedDate]);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    const permission = window.Notification.permission;
    setStore((prev) => {
      if (prev.reminderSettings.permission === permission) return prev;
      return {
        ...prev,
        reminderSettings: {
          ...prev.reminderSettings,
          permission,
        },
      };
    });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window)) return;
    if (!store.reminderSettings.enabled) return;
    if (store.reminderSettings.permission !== "granted") return;

    const interval = window.setInterval(() => {
      const now = new Date();
      const currentDateKey = formatDateKey(now);
      const todaysLog = store.dailyLogs[currentDateKey];
      if (!todaysLog?.timeBlocks) return;

      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const lead = Number(store.reminderSettings.leadMinutes || 0);

      todaysLog.timeBlocks.forEach((block) => {
        if (block.done) return;
        const blockMinutes = getMinutesFromTimeLabel(block.time);
        if (blockMinutes === null) return;
        const triggerAt = blockMinutes - lead;
        const reminderId = `${currentDateKey}-${block.id}-${lead}`;
        const alreadySent = store.reminderSettings.notified[reminderId];
        if (!alreadySent && currentMinutes >= triggerAt && currentMinutes < triggerAt + 1) {
          new window.Notification(`提醒：${block.task}`, { body: `${block.time} · ${displayDate(currentDateKey)}` });
          if (store.reminderSettings.sound) {
            playBuiltInSound(store.reminderSettings.soundPreset, store.reminderSettings.soundVolume);
          }
          setToast(`提醒已触发：${block.task}`);
          setStore((prev) => ({
            ...prev,
            reminderSettings: {
              ...prev.reminderSettings,
              notified: { ...prev.reminderSettings.notified, [reminderId]: true },
            },
          }));
        }
      });
    }, 20000);

    return () => window.clearInterval(interval);
  }, [store.dailyLogs, store.reminderSettings]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!pomodoro.isRunning || !pomodoro.sessionEndAt) return;

    const interval = window.setInterval(() => {
      const nextSeconds = Math.max(0, Math.ceil((pomodoro.sessionEndAt! - Date.now()) / 1000));
      if (nextSeconds <= 0) {
        setStore((prev) => {
          const current = prev.pomodoro;
          const completedFocusCount = current.currentMode === "focus" ? current.completedFocusCount + 1 : current.completedFocusCount;
          const nextMode: PomodoroMode = current.currentMode === "focus"
            ? completedFocusCount % 4 === 0
              ? "longBreak"
              : "shortBreak"
            : "focus";
          const nextSecondsLeft = getPomodoroSecondsByMode({ ...current, completedFocusCount }, nextMode);
          return {
            ...prev,
            pomodoro: {
              ...current,
              currentMode: nextMode,
              completedFocusCount,
              secondsLeft: nextSecondsLeft,
              isRunning: false,
              sessionEndAt: null,
            },
          };
        });
        if (pomodoro.soundEnabled) {
          playBuiltInSound(pomodoro.soundPreset, pomodoro.soundVolume);
        }
        setToast(pomodoro.currentMode === "focus" ? "一轮专注完成" : "休息结束，回到专注");
      } else {
        setStore((prev) => ({
          ...prev,
          pomodoro: {
            ...prev.pomodoro,
            secondsLeft: nextSeconds,
          },
        }));
      }
    }, 1000);

    return () => window.clearInterval(interval);
  }, [pomodoro.isRunning, pomodoro.sessionEndAt, pomodoro.currentMode]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const updateFinishedFrames = (value: string) => {
    const safeValue = Math.max(0, Number(value) || 0);
    setStore((prev) => {
      const current = ensureDailyLog(prev.dailyLogs[selectedDate]);
      return {
        ...prev,
        dailyLogs: {
          ...prev.dailyLogs,
          [selectedDate]: {
            ...current,
            draftFrames: prev.productionStage === "draft" ? safeValue : current.draftFrames,
            colorFrames: prev.productionStage === "color" ? safeValue : current.colorFrames,
          },
        },
      };
    });
  };

  const updateLifeNote = (value: string) => {
    setStore((prev) => ({
      ...prev,
      dailyLogs: {
        ...prev.dailyLogs,
        [selectedDate]: { ...ensureDailyLog(prev.dailyLogs[selectedDate]), lifeNote: value },
      },
    }));
  };

  const updateCalendarNote = (value: string) => {
    setStore((prev) => ({
      ...prev,
      dailyLogs: {
        ...prev.dailyLogs,
        [selectedDate]: { ...ensureDailyLog(prev.dailyLogs[selectedDate]), calendarNote: value },
      },
    }));
  };

  const updateCalendarAccent = (value: NoteAccent) => {
    setStore((prev) => ({
      ...prev,
      dailyLogs: {
        ...prev.dailyLogs,
        [selectedDate]: { ...ensureDailyLog(prev.dailyLogs[selectedDate]), noteAccent: value },
      },
    }));
  };

  const updateMood = (value: MoodType) => {
    setStore((prev) => ({
      ...prev,
      dailyLogs: {
        ...prev.dailyLogs,
        [selectedDate]: { ...ensureDailyLog(prev.dailyLogs[selectedDate]), mood: value },
      },
    }));
  };

  const updateMoodNote = (value: string) => {
    setStore((prev) => ({
      ...prev,
      dailyLogs: {
        ...prev.dailyLogs,
        [selectedDate]: { ...ensureDailyLog(prev.dailyLogs[selectedDate]), moodNote: value },
      },
    }));
  };

  const updateStatusGauge = (key: "hp" | "mp", value: number) => {
    const safeValue = Math.max(0, Math.min(100, value));
    setStore((prev) => ({
      ...prev,
      dailyLogs: {
        ...prev.dailyLogs,
        [selectedDate]: { ...ensureDailyLog(prev.dailyLogs[selectedDate]), [key]: safeValue },
      },
    }));
  };

  const updateTodoItem = (todoId: number, value: string) => {
    setStore((prev) => {
      const current = ensureDailyLog(prev.dailyLogs[selectedDate]);
      return {
        ...prev,
        dailyLogs: {
          ...prev.dailyLogs,
          [selectedDate]: {
            ...current,
            todoItems: current.todoItems.map((item) => (item.id === todoId ? { ...item, text: value } : item)),
          },
        },
      };
    });
  };

  const toggleTodoItem = (todoId: number) => {
    setStore((prev) => {
      const current = ensureDailyLog(prev.dailyLogs[selectedDate]);
      return {
        ...prev,
        dailyLogs: {
          ...prev.dailyLogs,
          [selectedDate]: {
            ...current,
            todoItems: current.todoItems.map((item) => (item.id === todoId ? { ...item, done: !item.done } : item)),
          },
        },
      };
    });
  };

  const addTodoItem = (text: string) => {
    const nextText = text.trim();
    if (!nextText) return;
    setStore((prev) => {
      const current = ensureDailyLog(prev.dailyLogs[selectedDate]);
      const nextId = Math.max(0, ...current.todoItems.map((item) => item.id)) + 1;
      return {
        ...prev,
        dailyLogs: {
          ...prev.dailyLogs,
          [selectedDate]: {
            ...current,
            todoItems: [...current.todoItems, { id: nextId, text: nextText, done: false }],
          },
        },
      };
    });
  };

  const removeTodoItem = (todoId: number) => {
    setStore((prev) => {
      const current = ensureDailyLog(prev.dailyLogs[selectedDate]);
      const nextItems = current.todoItems.filter((item) => item.id !== todoId);
      return {
        ...prev,
        dailyLogs: {
          ...prev.dailyLogs,
          [selectedDate]: {
            ...current,
            todoItems: nextItems.length > 0 ? nextItems : buildDefaultTodoItems(),
          },
        },
      };
    });
  };

  const applyProductionStageTemplate = (stage: ProductionStage) => {
    setStore((prev) => {
      const currentLog = prev.dailyLogs[selectedDate] || createDailyLogForStage(stage);
      const targetValue = getProductionSuggestedTarget(stage);
      const existing = prev.overallPlans.find((plan) => plan.date === selectedDate);

      return {
        ...prev,
        productionStage: stage,
        dailyLogs: {
          ...prev.dailyLogs,
          [selectedDate]: {
            ...currentLog,
            timeBlocks: buildStageTimeBlocks(stage),
            lifeNote: getStageLifeNote(stage),
          },
        },
        overallPlans: existing
          ? prev.overallPlans.map((plan) => (plan.date === selectedDate ? { ...plan, target: targetValue } : plan))
          : [
              ...prev.overallPlans,
              { id: Math.max(0, ...prev.overallPlans.map((plan) => plan.id)) + 1, date: selectedDate, target: targetValue, kind: "标准日", note: "", done: false },
            ],
      };
    });
  };

  const updateGoalTargetForSelectedDate = (value: string) => {
    setStore((prev) => {
      const existing = prev.overallPlans.find((plan) => plan.date === selectedDate);
      if (existing) {
        return {
          ...prev,
          overallPlans: prev.overallPlans.map((plan) => (plan.date === selectedDate ? { ...plan, target: value } : plan)),
        };
      }
      const nextId = Math.max(0, ...prev.overallPlans.map((plan) => plan.id)) + 1;
      return {
        ...prev,
        overallPlans: [...prev.overallPlans, { id: nextId, date: selectedDate, target: value, kind: "自定义", note: "", done: false }],
      };
    });
  };

  const toggleTimeBlock = (blockId: number) => {
    setStore((prev) => {
      const currentLog = ensureDailyLog(prev.dailyLogs[selectedDate]);
      return {
        ...prev,
        dailyLogs: {
          ...prev.dailyLogs,
          [selectedDate]: {
            ...currentLog,
            timeBlocks: currentLog.timeBlocks.map((block) => (block.id === blockId ? { ...block, done: !block.done } : block)),
          },
        },
      };
    });
  };

  const updateTimeBlock = (blockId: number, field: "time" | "task", value: string) => {
    setStore((prev) => {
      const currentLog = ensureDailyLog(prev.dailyLogs[selectedDate]);
      return {
        ...prev,
        dailyLogs: {
          ...prev.dailyLogs,
          [selectedDate]: {
            ...currentLog,
            timeBlocks: currentLog.timeBlocks.map((block) => (block.id === blockId ? { ...block, [field]: value } : block)),
          },
        },
      };
    });
  };

  const addTimeBlock = () => {
    setStore((prev) => {
      const currentLog = ensureDailyLog(prev.dailyLogs[selectedDate]);
      const nextId = Math.max(0, ...currentLog.timeBlocks.map((block) => block.id)) + 1;
      return {
        ...prev,
        dailyLogs: {
          ...prev.dailyLogs,
          [selectedDate]: {
            ...currentLog,
            timeBlocks: [...currentLog.timeBlocks, { id: nextId, time: "00:00-00:00", task: "新计划", done: false, icon: "draw" }],
          },
        },
      };
    });
  };

  const removeTimeBlock = (blockId: number) => {
    setStore((prev) => {
      const currentLog = ensureDailyLog(prev.dailyLogs[selectedDate]);
      return {
        ...prev,
        dailyLogs: {
          ...prev.dailyLogs,
          [selectedDate]: {
            ...currentLog,
            timeBlocks: currentLog.timeBlocks.filter((block) => block.id !== blockId),
          },
        },
      };
    });
  };

  const updateReviewNote = (value: string) => {
    setStore((prev) => ({
      ...prev,
      currentReviews: {
        ...prev.currentReviews,
        [selectedDate]: { ...ensureReviewState(prev.currentReviews[selectedDate]), note: value },
      },
    }));
  };

  const updateCheckpoint = (checkpointId: string, field: "rangeLabel" | "draftTarget" | "colorTarget" | "anchorDate" | "note", value: string) => {
    setStore((prev) => ({
      ...prev,
      checkpoints: prev.checkpoints.map((item) =>
        item.id === checkpointId
          ? {
              ...item,
              [field]: field === "draftTarget" || field === "colorTarget" ? Math.max(0, Number(value) || 0) : value,
            }
          : item,
      ),
    }));
  };

  const addCheckpoint = () => {
    setStore((prev) => ({
      ...prev,
      checkpoints: [
        ...prev.checkpoints,
        {
          id: `cp-${Date.now()}`,
          rangeLabel: "新节点",
          draftTarget: 0,
          colorTarget: 0,
          anchorDate: selectedDate,
          note: "阶段说明",
        },
      ],
    }));
  };

  const removeCheckpoint = (checkpointId: string) => {
    setStore((prev) => ({
      ...prev,
      checkpoints: prev.checkpoints.filter((item) => item.id !== checkpointId),
    }));
  };

  const updateTotalFrames = (value: string) => {
    const safeValue = Math.max(1, Number(value) || 1);
    setStore((prev) => ({
      ...prev,
      totalFrames: safeValue,
    }));
  };

  const togglePlan = (planId: number) => {
    setStore((prev) => ({
      ...prev,
      overallPlans: prev.overallPlans.map((plan) => (plan.id === planId ? { ...plan, done: !plan.done } : plan)),
    }));
  };

  const updatePlan = (planId: number, field: "date" | "target" | "kind" | "note", value: string) => {
    setStore((prev) => ({
      ...prev,
      overallPlans: prev.overallPlans.map((plan) => {
        if (plan.id !== planId) return plan;
        if (field === "kind") return { ...plan, kind: value as GoalKind };
        if (field === "date") return { ...plan, date: value };
        if (field === "target") return { ...plan, target: value };
        return { ...plan, note: value };
      }),
    }));
  };

  const addPlan = () => {
    setStore((prev) => {
      const nextId = Math.max(0, ...prev.overallPlans.map((plan) => plan.id)) + 1;
      return {
        ...prev,
        overallPlans: [...prev.overallPlans, { id: nextId, date: selectedDate, target: "", kind: "自定义", note: "", done: false }],
      };
    });
  };

  const removePlan = (planId: number) => {
    setStore((prev) => ({
      ...prev,
      overallPlans: prev.overallPlans.filter((plan) => plan.id !== planId),
    }));
  };

  const resetSelectedDay = () => {
    setStore((prev) => ({
      ...prev,
      dailyLogs: { ...prev.dailyLogs, [selectedDate]: createDailyLogForStage(prev.productionStage) },
      currentReviews: { ...prev.currentReviews, [selectedDate]: ensureReviewState() },
    }));
  };

  const requestPermission = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setToast("当前浏览器不支持桌面提醒");
      return;
    }
    const permission = await window.Notification.requestPermission();
    setStore((prev) => ({
      ...prev,
      reminderSettings: {
        ...prev.reminderSettings,
        permission,
        enabled: permission === "granted" ? prev.reminderSettings.enabled : false,
      },
    }));
    setToast(permission === "granted" ? "提醒权限已开启" : "提醒权限未开启");
  };

  const updateReminderSetting = (key: keyof ReminderSettings, value: ReminderSettings[keyof ReminderSettings]) => {
    setStore((prev) => ({
      ...prev,
      reminderSettings: {
        ...prev.reminderSettings,
        [key]: value,
      },
    }));
  };

  const handlePomodoroStartPause = () => {
    setStore((prev) => {
      const current = prev.pomodoro;
      if (current.isRunning) {
        return {
          ...prev,
          pomodoro: {
            ...current,
            isRunning: false,
            sessionEndAt: null,
          },
        };
      }
      return {
        ...prev,
        pomodoro: {
          ...current,
          isRunning: true,
          sessionEndAt: Date.now() + current.secondsLeft * 1000,
        },
      };
    });
  };

  const handlePomodoroReset = () => {
    setStore((prev) => ({
      ...prev,
      pomodoro: {
        ...prev.pomodoro,
        isRunning: false,
        sessionEndAt: null,
        secondsLeft: getPomodoroSecondsByMode(prev.pomodoro, prev.pomodoro.currentMode),
      },
    }));
  };

  const handlePomodoroSwitchMode = (mode: PomodoroMode) => {
    setStore((prev) => ({
      ...prev,
      pomodoro: {
        ...prev.pomodoro,
        currentMode: mode,
        isRunning: false,
        sessionEndAt: null,
        secondsLeft: getPomodoroSecondsByMode(prev.pomodoro, mode),
      },
    }));
  };

  const handlePomodoroMinutesUpdate = (key: "focusMinutes" | "shortBreakMinutes" | "longBreakMinutes", value: string) => {
    const safe = Math.max(1, Number(value) || 1);
    setStore((prev) => {
      const nextPomodoro = {
        ...prev.pomodoro,
        [key]: safe,
      };
      const isCurrentModeField =
        (key === "focusMinutes" && prev.pomodoro.currentMode === "focus") ||
        (key === "shortBreakMinutes" && prev.pomodoro.currentMode === "shortBreak") ||
        (key === "longBreakMinutes" && prev.pomodoro.currentMode === "longBreak");

      return {
        ...prev,
        pomodoro: {
          ...nextPomodoro,
          secondsLeft: prev.pomodoro.isRunning
            ? prev.pomodoro.secondsLeft
            : isCurrentModeField
              ? getPomodoroSecondsByMode(nextPomodoro, prev.pomodoro.currentMode)
              : prev.pomodoro.secondsLeft,
        },
      };
    });
  };

  const handlePomodoroSoundSetting = (key: "soundEnabled" | "soundPreset" | "soundVolume", value: string | boolean) => {
    setStore((prev) => ({
      ...prev,
      pomodoro: {
        ...prev.pomodoro,
        [key]: key === "soundVolume" ? Number(value) / 100 : value,
      },
    }));
  };

  const previewBuiltInSound = (preset: BuiltInSound, volume: number) => {
    playBuiltInSound(preset, volume);
  };

  const navigateMonth = (offset: number) => {
    const base = parseDateKey(selectedDate);
    const next = new Date(base.getFullYear(), base.getMonth() + offset, 1);
    setSelectedDate(formatDateKey(next));
  };


  const exportLocalBackup = () => {
    try {
      const payload = JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), store, panelHeights }, null, 2);
      const blob = new Blob([payload], { type: "application/json;charset=utf-8" });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `creative-dashboard-backup-${selectedDate}.json`;
      anchor.click();
      window.URL.revokeObjectURL(url);
      setToast("已导出本地备份");
    } catch {
      setToast("导出失败");
    }
  };

  const importLocalBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || "{}"));
        const importedStore = parsed.store ?? parsed;
        const importedPanelHeights = parsed.panelHeights ?? DEFAULT_PANEL_HEIGHTS;

        if (!importedStore || typeof importedStore !== "object") throw new Error("invalid store");

        setStore({
          ...createDefaultStore(),
          ...importedStore,
          dailyLogs: importedStore.dailyLogs || {},
          currentReviews: importedStore.currentReviews || {},
          overallPlans: importedStore.overallPlans || buildSeedOverallPlans(),
          reminderSettings: {
            ...defaultReminderSettings,
            ...(importedStore.reminderSettings || {}),
            notified: importedStore.reminderSettings?.notified || {},
          },
          topCards: {
            ...defaultTopCards,
            ...(importedStore.topCards || {}),
          },
        });

        setPanelHeights({
          ...DEFAULT_PANEL_HEIGHTS,
          ...(importedPanelHeights || {}),
        });

        setToast("已导入本地备份");
      } catch {
        setToast("备份文件读取失败");
      } finally {
        event.target.value = "";
      }
    };

    reader.readAsText(file, "utf-8");
  };

  return (
    <div
      translate="no"
      className="notranslate min-h-screen p-4 text-stone-900 md:p-8"
      style={{
        backgroundImage:
          "radial-gradient(circle at 15% 18%, rgba(255,255,255,0.3) 0, rgba(255,255,255,0) 22%), radial-gradient(circle at 85% 0%, rgba(117,100,84,0.08) 0, rgba(117,100,84,0) 25%), linear-gradient(180deg, #ede7db 0%, #e8e1d5 42%, #e4ddd1 100%)",
      }}
    >
      <div className="mx-auto max-w-7xl space-y-6">
        <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={importLocalBackup} />

        <div className="relative overflow-hidden rounded-[34px] border border-[#c8bfaf] bg-[#faf4ea] p-6 shadow-[0_24px_60px_rgba(60,50,36,0.10)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_28px_68px_rgba(60,50,36,0.14)] md:p-8">
          <div className="absolute inset-0 opacity-45" style={{ backgroundImage: "linear-gradient(rgba(91,79,61,0.05) 1px, transparent 1px)", backgroundSize: "100% 32px" }} />
          <div className="absolute right-0 top-0 h-full w-24 bg-[#30404b]" />
          <div className="absolute right-20 top-0 h-full w-4 bg-[#8f5f56]" />
          <div className="absolute right-[6.75rem] top-0 h-full w-3 bg-[#bca98d]" />
          <div className="absolute left-10 top-5 h-8 w-24 rotate-[-7deg] rounded-sm bg-[#d8cdbb]/75" />
          <div className="absolute left-40 top-6 h-7 w-16 rotate-[9deg] rounded-sm bg-[#c9baa3]/65" />
          <div className="relative z-20 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              {topCardEditState.hero ? (
                <div className="space-y-3">
                  <Input
                    value={store.topCards.heroTag}
                    onChange={(e) => updateTopCardContent("heroTag", e.target.value)}
                    className="h-8 max-w-[240px] rounded-full border-[#b7ad9d] bg-[#fffaf1] px-3 text-[11px] uppercase tracking-[0.32em] text-[#5f584e]"
                  />
                  <Textarea
                    value={store.topCards.heroTitle}
                    onChange={(e) => updateTopCardContent("heroTitle", e.target.value)}
                    className="min-h-[96px] rounded-[24px] border-[#cfc5b5] bg-[#fffdf8] text-3xl font-semibold tracking-tight text-[#2d3942] resize-none md:text-5xl"
                    style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
                  />
                  <Textarea
                    value={store.topCards.heroBody}
                    onChange={(e) => updateTopCardContent("heroBody", e.target.value)}
                    className="min-h-[88px] max-w-2xl rounded-[24px] border-[#cfc5b5] bg-[#fffdf8] text-sm leading-6 text-[#6d6457] resize-none md:text-base"
                  />
                </div>
              ) : (
                <>
                  <div className="inline-flex items-center rounded-full border border-[#b7ad9d] bg-[#fffaf1] px-3 py-1 text-[11px] uppercase tracking-[0.32em] text-[#5f584e]">{store.topCards.heroTag}</div>
                  <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[#2d3942] md:text-5xl" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
                    {store.topCards.heroTitle}
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6d6457] md:text-base">
                    {store.topCards.heroBody}
                  </p>
                </>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" className={`rounded-full border-[#b9ae9d] bg-[#fffaf2]/90 text-[#4e4a43] ${interactiveButtonClass}`} onClick={() => toggleTopCardEdit("hero")}>
                {topCardEditState.hero ? <Check className="mr-2 h-4 w-4" /> : <NotebookPen className="mr-2 h-4 w-4" />}
                {topCardEditState.hero ? "完成" : "编辑"}
              </Button>
              <Button variant="outline" className={`rounded-full border-[#b9ae9d] bg-[#fffaf2]/90 text-[#4e4a43] ${interactiveButtonClass}`} onClick={() => setSelectedDate(todayKey)}>
                今天
              </Button>
              <Button variant="outline" className={`rounded-full border-[#b9ae9d] bg-[#fffaf2]/90 text-[#4e4a43] ${interactiveButtonClass}`} onClick={resetSelectedDay}>
                <TimerReset className="mr-2 h-4 w-4" />重置当天
              </Button>
              <Button variant="outline" className={`rounded-full border-[#b9ae9d] bg-[#fffaf2]/90 text-[#4e4a43] ${interactiveButtonClass}`} onClick={exportLocalBackup}>
                导出备份
              </Button>
              <Button variant="outline" className={`rounded-full border-[#b9ae9d] bg-[#fffaf2]/90 text-[#4e4a43] ${interactiveButtonClass}`} onClick={() => fileInputRef.current?.click()}>
                导入备份
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <DashboardLeadCard
              selectedDate={selectedDate}
              selectedLog={selectedLog}
              pomodoro={pomodoro}
              content={store.topCards}
              onUpdate={updateTopCardContent}
              isEditing={topCardEditState.lead}
              onToggleEdit={() => toggleTopCardEdit("lead")}
              onUpdateTodoItem={updateTodoItem}
              onToggleTodoItem={toggleTodoItem}
              onAddTodoItem={addTodoItem}
              onRemoveTodoItem={removeTodoItem}
              onPomodoroStartPause={handlePomodoroStartPause}
              onPomodoroReset={handlePomodoroReset}
            />
          </div>
          <div className="lg:col-span-4">
            <EditorialNoteCard
              selectedDate={selectedDate}
              totalFinished={totalFinished}
              selectedLog={selectedLog}
              isEditing={topCardEditState.note}
              onToggleEdit={() => toggleTopCardEdit("note")}
              onUpdateMood={updateMood}
              onUpdateMoodNote={updateMoodNote}
              onUpdateStatusGauge={updateStatusGauge}
            />
          </div>
          <div className="lg:col-span-3">
            <StatCard title="总进度" description={`${totalFinished} / ${store.totalFrames} 张`} value={`${completionRate}%`} sublabel="总盘子" progress={completionRate} icon={<Target className="h-5 w-5" />} />
          </div>
          <div className="lg:col-span-3">
            <StatCard title="今日完成" description={`${activeFinishedNumber} / ${activeTargetNumber || "-"}`} value={`${todayRate}%`} sublabel="当日达成" progress={todayRate} icon={<CheckCircle2 className="h-5 w-5" />} />
          </div>
          <div className="lg:col-span-6">
            <DateHeaderCard
              selectedMonthLabel={selectedMonthLabel}
              selectedGoal={selectedGoal}
              selectedDate={selectedDate}
              content={store.topCards}
              onSelectDate={setSelectedDate}
              onUpdate={updateTopCardContent}
              isEditing={topCardEditState.date}
              onToggleEdit={() => toggleTopCardEdit("date")}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid w-full grid-cols-4 rounded-2xl border border-[#c4baa9] bg-[#f4ede2] md:w-[480px] transition-all duration-200 hover:shadow-sm">
            {TAB_ITEMS.map((item) => {
              const isActive = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActiveTab(item.key)}
                  className={`rounded-2xl px-4 py-2 text-sm transition-all duration-200 hover:scale-[1.02] ${
                    isActive
                      ? "bg-[#2f3b45] text-[#fbf5ec] shadow-sm"
                      : "bg-transparent text-[#5c554c]"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {activeTab === "dashboard" ? (
            <div className="space-y-6">
              <div className="grid gap-6 xl:grid-cols-3 items-start">
                <ResizablePanelFrame height={panelHeights.life}>
                  <LifePlanningPanel
                    selectedDate={selectedDate}
                    selectedGoal={selectedGoal}
                    selectedLog={selectedLog}
                    productionStage={store.productionStage}
                    panelTexts={store.panelTexts}
                    bodyHeight={panelHeights.life}
                    collapsed={lifeCollapsed}
                    onToggleCollapse={() => setLifeCollapsed((prev) => !prev)}
                    onToggleBlock={toggleTimeBlock}
                    onUpdateGoalTarget={updateGoalTargetForSelectedDate}
                    onUpdateFinishedFrames={updateFinishedFrames}
                    onUpdateLifeNote={updateLifeNote}
                    onUpdateTimeBlock={updateTimeBlock}
                    onAddTimeBlock={addTimeBlock}
                    onRemoveTimeBlock={removeTimeBlock}
                    onApplyStageTemplate={applyProductionStageTemplate}
                    onUpdatePanelText={updatePanelText}
                  />
                </ResizablePanelFrame>

                <ResizablePanelFrame height={panelHeights.review}>
                  <CurrentReviewPanel
                    selectedDate={selectedDate}
                    selectedGoal={selectedGoal}
                    currentDraftCumulative={currentDraftCumulative}
                    currentColorCumulative={currentColorCumulative}
                    checkpointRows={checkpointRows}
                    review={selectedReview}
                    panelTexts={store.panelTexts}
                    bodyHeight={panelHeights.review}
                    collapsed={reviewCollapsed}
                    onToggleCollapse={() => setReviewCollapsed((prev) => !prev)}
                    onUpdateNote={updateReviewNote}
                    onUpdateCheckpoint={updateCheckpoint}
                    onAddCheckpoint={addCheckpoint}
                    onRemoveCheckpoint={removeCheckpoint}
                    onUpdatePanelText={updatePanelText}
                  />
                </ResizablePanelFrame>

                <ResizablePanelFrame height={panelHeights.overall}>
                  <OverallGoalPanel
                    selectedDate={selectedDate}
                    selectedGoal={selectedGoal}
                    visiblePlans={visiblePlans}
                    selectedPlan={selectedPlan}
                    dailyLogs={store.dailyLogs}
                    totalColored={totalFinished}
                    totalFrames={store.totalFrames}
                    panelTexts={store.panelTexts}
                    bodyHeight={panelHeights.overall}
                    collapsed={overallCollapsed}
                    onToggleCollapse={() => setOverallCollapsed((prev) => !prev)}
                    onSelectDate={setSelectedDate}
                    onTogglePlan={togglePlan}
                    onUpdatePlan={updatePlan}
                    onAddPlan={addPlan}
                    onRemovePlan={removePlan}
                    onUpdateTotalFrames={updateTotalFrames}
                    onUpdatePanelText={updatePanelText}
                  />
                </ResizablePanelFrame>
              </div>
            </div>
          ) : null}

          {activeTab === "calendar" ? (
            <CalendarPanel
              visibleMonthDate={visibleMonthDate}
              monthDays={monthDays}
              selectedDate={selectedDate}
              goalsMap={goalsMap}
              dailyLogs={store.dailyLogs}
              selectedLog={selectedLog}
              onSelectDate={setSelectedDate}
              onNavigateMonth={navigateMonth}
              onUpdateCalendarNote={updateCalendarNote}
              onUpdateCalendarAccent={updateCalendarAccent}
            />
          ) : null}

          {activeTab === "reminder" ? (
            <ReminderPanel
              reminderSettings={store.reminderSettings}
              selectedLog={selectedLog}
              onRequestPermission={requestPermission}
              onUpdateReminderSetting={updateReminderSetting}
              onPreviewSound={previewBuiltInSound}
            />
          ) : null}

          {activeTab === "pomodoro" ? (
            <PomodoroPanel
              pomodoro={pomodoro}
              onStartPause={handlePomodoroStartPause}
              onReset={handlePomodoroReset}
              onSwitchMode={handlePomodoroSwitchMode}
              onUpdateMinutes={handlePomodoroMinutesUpdate}
              onUpdateSoundSetting={handlePomodoroSoundSetting}
              onPreviewSound={previewBuiltInSound}
            />
          ) : null}
        </div>

        {toast ? <div className="fixed bottom-6 right-6 z-50 rounded-full border border-[#c7bcab] bg-[#fffaf2] px-4 py-2 text-sm text-[#4f4a43] shadow-lg">{toast}</div> : null}
      </div>
    </div>
  );
}
