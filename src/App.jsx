import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Plus,
  Search,
  Calendar,
  MapPin,
  FileText,
  Trash2,
  Edit2,
  Check,
  X,
  BarChart3,
  Clock,
  CheckCircle,
  TrendingUp,
  RefreshCw,
  Wrench,
  ListTodo,
  Target,
  Sun,
  Moon,
  Monitor,
  ClipboardList,
  MessageSquare,
  Menu,
  Globe,
  ChevronDown,
  Gauge,
} from "lucide-react";

const API_URL = "/api/reports";
const TASK_API_URL = "/api/tasks";
const SPAREPART_API_URL = "/api/spareparts";
const REPAIR_API_URL = "/api/repairs";

// Translations
const translations = {
  id: {
    // Navigation & Header
    appTitle: "HVE ELECTRICAL SPIL",
    appSubtitle: "Heavy Equipment Electrical PT. Salam Pasific Indonesia Lines",
    menu: "Menu",
    refresh: "Refresh",
    loading: "Memuat data...",
    saving: "Menyimpan data...",

    // Tabs
    dashboard: "Dasbor",
    reports: "Laporan Lapangan",
    tasks: "Tugas",
    spareparts: "Suku Cadang",
    repairs: "Repair",
    monitoring: "Monitoring",
    reachStacker: "Reach Stacker",
    fuelMonitoring: "Monitoring BBM",

    // Buttons
    newReport: "Laporan Baru",
    newTask: "Tugas Baru",
    newSparepart: "Tambah",
    newRepair: "Repair Baru",
    downloadExcel: "Download Excel",
    downloadPDF: "Download PDF",
    save: "Simpan",
    cancel: "Batal",
    edit: "Ubah",
    delete: "Hapus",
    update: "Perbarui",
    create: "Buat",
    close: "Tutup",
    search: "Cari",
    sort: "Urutkan",

    // Dashboard
    createNewReport: "Buat Laporan Lapangan Baru",
    recordFieldWork: "Catat pekerjaan lapangan Anda",
    createNewTask: "Buat Tugas Baru",
    planYourWork: "Rencanakan pekerjaan Anda",
    orderSparepart: "Pesan Suku Cadang",
    addSparepartRequest: "Tambahkan permintaan suku cadang",
    manageInventory: "Kelola inventori suku cadang",
    totalReports: "Total Laporan",
    totalSpareparts: "Total Suku Cadang",
    completedTasks: "Tugas Selesai",
    noCompletedTasks: "Belum ada tugas selesai",
    ongoingTasks: "Tugas Berlangsung",
    ongoingTasksByPriority: "Tugas Berlangsung (Prioritas)",
    ongoingTasksByDeadline: "Tugas Berlangsung (Tenggat Waktu)",
    noOngoingTasks: "Tidak ada tugas berlangsung",
    noTasksWithDeadline: "Tidak ada tugas dengan tenggat waktu",
    noDataYet: "Belum ada data",
    noReportsYet: "Belum ada laporan",
    sparepartOrdered: "Suku Cadang Dipesan",
    recentReports: "Laporan Terbaru",
    topLocations: "Lokasi Terbanyak",
    sparepartSummary: "Ringkasan Suku Cadang",

    // Field Reports
    searchReports: "Cari proyek, lokasi, kegiatan, atau unit alat...",
    noReports: "Belum ada laporan lapangan",
    noReportsFound: "Tidak ada laporan lapangan yang sesuai",
    createFirstReport: 'Klik tombol "Laporan Baru" untuk mulai membuat laporan lapangan',
    tryDifferentKeyword: "Coba ubah kata kunci pencarian",
    editReport: "Edit Laporan Lapangan",
    createReport: "Buat Laporan Lapangan Baru",
    date: "Tanggal",
    location: "Lokasi",
    projectName: "Nama Proyek",
    activityType: "Jenis Kegiatan",
    equipment: "Unit Alat",
    description: "Deskripsi",
    startTime: "Jam Mulai",
    endTime: "Jam Selesai",
    notes: "Catatan",
    duration: "Durasi",
    hours: "jam",

    // Tasks
    searchTasks: "Cari tugas...",
    sortByDeadline: "Urutkan: Tenggat Waktu",
    sortByPriority: "Urutkan: Prioritas",
    sortByName: "Urutkan: Nama (A-Z)",
    noTasks: "Belum ada tugas",
    noTasksFound: "Tidak ada tugas yang sesuai",
    createFirstTask: 'Klik tombol "Tugas Baru" untuk mulai membuat tugas',
    editTask: "Ubah Tugas",
    createTask: "Buat Tugas Baru",
    taskName: "Nama Tugas",
    priority: "Prioritas",
    "priority.high": "Tinggi",
    "priority.medium": "Sedang",
    "priority.low": "Rendah",
    deadline: "Tenggat Waktu",
    progress: "Progres",
    high: "Tinggi",
    medium: "Sedang",
    low: "Rendah",
    completed: "Selesai",
    addProgressLog: "Tambah Riwayat Progres",
    progressLogs: "Riwayat Progres",
    noProgressLogs: "Belum ada riwayat progres",
    progressUpdate: "Pembaruan Progres",
    progressIncrement: "Penambahan Progres",

    // Spareparts
    noSpareparts: "Belum ada suku cadang yang dipesan",
    editSparepart: "Ubah Suku Cadang",
    createSparepart: "Pesan Suku Cadang Baru",
    partName: "Nama Suku Cadang",
    quantity: "Jumlah",
    unit: "Satuan",
    status: "Status",
    pending: "Belum Dipesan",
    ordered: "Sudah Dipesan",
    arrived: "Sudah Datang",
    orderedDate: "Tanggal Dipesan",
    arrivedDate: "Tanggal Datang",
    orderedBy: "Dipesan Oleh",
    editDates: "Ubah Tanggal Suku Cadang",
    required: "wajib diisi",
    optional: "Opsional",
    enterOrderDate: "Masukkan tanggal saat suku cadang dipesan",
    enterArrivalDate: "Masukkan tanggal saat suku cadang tiba",
    statusPendingInfo:
      'Suku cadang belum dipesan. Ubah status ke "Sudah Dipesan" untuk memasukkan tanggal pemesanan.',

    // Repairs
    noRepairs: "Belum ada repair",
    noRepairsFound: "Tidak ada repair yang sesuai",
    createFirstRepair: 'Klik tombol "Repair Baru" untuk mulai membuat repair',
    editRepair: "Edit Repair",
    createRepair: "Buat Repair Baru",
    repairItem: "Item Repair",
    dateReceived: "Tanggal Masuk",
    dateStarted: "Tanggal Mulai Dikerjakan",
    dateCompleted: "Tanggal Selesai",
    equipmentUnit: "Unit Alat",
    operatingLocation: "Lokasi Operasi Alat",
    damageDescription: "Deskripsi Kerusakan",
    repairStatus: "Status Repair",
    statusReceived: "Sudah Masuk",
    statusInProgress: "Sedang Dikerjakan",
    statusCompleted: "Selesai",
    searchRepairs: "Cari item repair, unit alat, atau lokasi...",
    totalRepairs: "Total Repair",
    recentRepairs: "Repair Terbaru",
    repairSummary: "Ringkasan Repair",

    // Messages
    confirmDelete: "Yakin ingin menghapus",
    deleteSuccess: "Berhasil dihapus",
    deleteFailed: "Gagal menghapus",
    saveSuccess: "Berhasil disimpan",
    saveFailed: "Gagal menyimpan",
    updateFailed: "Gagal memperbarui data",
    errorSaving: "Terjadi kesalahan saat menyimpan data",
    fillRequired: "Harap isi semua kolom yang wajib diisi",
    fillTaskRequired: "Harap isi nama tugas dan deskripsi",
    fillPartRequired: "Harap isi nama suku cadang dan jumlah",
    fillProgressRequired: "Harap isi deskripsi progres",
    orderDateRequired:
      "Tanggal dipesan harus diisi untuk status 'Sudah Dipesan'",
    arrivalDateRequired:
      "Tanggal datang harus diisi untuk status 'Sudah Datang'",
  },
  en: {
    // Navigation & Header
    appTitle: "HVE ELECTRICAL SPIL",
    appSubtitle: "Heavy Equipment Electrical PT. Salam Pacific Indonesia Lines",
    menu: "Menu",
    refresh: "Refresh",
    loading: "Loading data...",
    saving: "Saving data...",

    // Tabs
    dashboard: "Dashboard",
    reports: "Field Reports",
    tasks: "Tasks",
    spareparts: "Spareparts",
    repairs: "Repairs",
    monitoring: "Monitoring",
    reachStacker: "Reach Stacker",
    fuelMonitoring: "Fuel Monitoring",

    // Buttons
    newReport: "New Report",
    newTask: "New Task",
    newSparepart: "Add",
    newRepair: "New Repair",
    downloadExcel: "Download Excel",
    downloadPDF: "Download PDF",
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    update: "Update",
    create: "Create",
    close: "Close",
    search: "Search",
    sort: "Sort",

    // Dashboard
    createNewReport: "Create New Field Report",
    recordFieldWork: "Record your field work",
    createNewTask: "Create New Task",
    planYourWork: "Plan your work",
    orderSparepart: "Order Sparepart",
    addSparepartRequest: "Add sparepart request",
    manageInventory: "Manage sparepart inventory",
    totalReports: "Total Reports",
    totalSpareparts: "Total Spareparts",
    completedTasks: "Completed Tasks",
    noCompletedTasks: "No completed tasks yet",
    ongoingTasks: "Ongoing Tasks",
    ongoingTasksByPriority: "Ongoing Tasks (Priority)",
    ongoingTasksByDeadline: "Ongoing Tasks (Deadline)",
    noOngoingTasks: "No ongoing tasks",
    noTasksWithDeadline: "No tasks with deadline",
    noDataYet: "No data yet",
    noReportsYet: "No reports yet",
    sparepartOrdered: "Spareparts Ordered",
    recentReports: "Recent Reports",
    topLocations: "Top Locations",
    sparepartSummary: "Sparepart Summary",

    // Field Reports
    searchReports: "Search project, location, activity, or equipment...",
    noReports: "No field reports yet",
    noReportsFound: "No matching field reports found",
    createFirstReport: 'Click "New Report" button to start creating field reports',
    tryDifferentKeyword: "Try different search keywords",
    editReport: "Edit Field Report",
    createReport: "Create New Field Report",
    date: "Date",
    location: "Location",
    projectName: "Project Name",
    activityType: "Activity Type",
    equipment: "Equipment Unit",
    description: "Description",
    startTime: "Start Time",
    endTime: "End Time",
    notes: "Notes",
    duration: "Duration",
    hours: "hours",

    // Tasks
    searchTasks: "Search tasks...",
    sortByDeadline: "Sort: Deadline",
    sortByPriority: "Sort: Priority",
    sortByName: "Sort: Name (A-Z)",
    noTasks: "No tasks yet",
    noTasksFound: "No matching tasks found",
    createFirstTask: 'Click "New Task" button to start creating tasks',
    editTask: "Edit Task",
    createTask: "Create New Task",
    taskName: "Task Name",
    priority: "Priority",
    "priority.high": "High",
    "priority.medium": "Medium",
    "priority.low": "Low",
    deadline: "Deadline",
    progress: "Progress",
    high: "High",
    medium: "Medium",
    low: "Low",
    completed: "Completed",
    addProgressLog: "Add Progress Log",
    progressLogs: "Progress Logs",
    noProgressLogs: "No progress logs yet",
    progressUpdate: "Progress Update",
    progressIncrement: "Progress Increment",

    // Spareparts
    noSpareparts: "No spareparts ordered yet",
    editSparepart: "Edit Sparepart",
    createSparepart: "Order New Sparepart",
    partName: "Part Name",
    quantity: "Quantity",
    unit: "Unit",
    status: "Status",
    pending: "Not Ordered",
    ordered: "Ordered",
    arrived: "Arrived",
    orderedDate: "Order Date",
    arrivedDate: "Arrival Date",
    orderedBy: "Ordered By",
    editDates: "Edit Sparepart Dates",
    required: "required",
    optional: "Optional",
    enterOrderDate: "Enter the date when sparepart was ordered",
    enterArrivalDate: "Enter the date when sparepart arrived",
    statusPendingInfo:
      'Sparepart not ordered yet. Change status to "Ordered" to enter order date.',

    // Repairs
    noRepairs: "No repairs yet",
    noRepairsFound: "No matching repairs found",
    createFirstRepair: 'Click "New Repair" button to start creating repairs',
    editRepair: "Edit Repair",
    createRepair: "Create New Repair",
    repairItem: "Repair Item",
    dateReceived: "Date Received",
    dateStarted: "Date Started",
    dateCompleted: "Date Completed",
    equipmentUnit: "Equipment Unit",
    operatingLocation: "Operating Location",
    damageDescription: "Damage Description",
    repairStatus: "Repair Status",
    statusReceived: "Received",
    statusInProgress: "In Progress",
    statusCompleted: "Completed",
    searchRepairs: "Search repair item, equipment, or location...",
    totalRepairs: "Total Repairs",
    recentRepairs: "Recent Repairs",
    repairSummary: "Repair Summary",

    // Messages
    confirmDelete: "Are you sure you want to delete",
    deleteSuccess: "Successfully deleted",
    deleteFailed: "Failed to delete",
    saveSuccess: "Successfully saved",
    saveFailed: "Failed to save",
    updateFailed: "Failed to update data",
    errorSaving: "An error occurred while saving data",
    fillRequired: "Please fill all required fields",
    fillTaskRequired: "Please fill task name and description",
    fillPartRequired: "Please fill part name and quantity",
    fillProgressRequired: "Please fill progress description",
    orderDateRequired: "Order date is required for 'Ordered' status",
    arrivalDateRequired: "Arrival date is required for 'Arrived' status",
  },
};

export default function LaporanPekerjaan() {
  const [reports, setReports] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [spareparts, setSpareparts] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showSparepartForm, setShowSparepartForm] = useState(false);
  const [showRepairForm, setShowRepairForm] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showSparepartDateModal, setShowSparepartDateModal] = useState(false);
  const [selectedSparepart, setSelectedSparepart] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingSparepartId, setEditingSparepartId] = useState(null);
  const [editingRepairId, setEditingRepairId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    const hash = window.location.hash.slice(1) || "dashboard";
    return hash;
  });
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [taskSortBy, setTaskSortBy] = useState("deadline"); // 'deadline', 'priority', 'name'

  // Language: 'id' | 'en'
  const LANGUAGE_KEY = "language";
  const [language, setLanguage] = useState(() => {
    try {
      return localStorage.getItem(LANGUAGE_KEY) || "id";
    } catch (e) {
      return "id";
    }
  });

  // Translation helper
  const t = (key) => translations[language][key] || key;

  // Save language to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LANGUAGE_KEY, language);
    } catch (e) {
      console.error("Failed to save language:", e);
    }
  }, [language]);

  // Handle browser history for tab navigation
  useEffect(() => {
    const handlePopState = (event) => {
      const hash = window.location.hash.slice(1) || "dashboard";
      setActiveTab(hash);
      
      // Close modals when navigating back
      if (event.state?.modal) {
        // If the state has modal info, we're going back to a modal
        if (event.state.modal === "form") setShowForm(true);
        else if (event.state.modal === "taskForm") setShowTaskForm(true);
        else if (event.state.modal === "sparepartForm") setShowSparepartForm(true);
        else if (event.state.modal === "progressModal") setShowProgressModal(true);
      } else {
        // Close all modals when going back to main view
        setShowForm(false);
        setShowTaskForm(false);
        setShowSparepartForm(false);
        setShowProgressModal(false);
        setShowSparepartDateModal(false);
      }
    };

    window.addEventListener("popstate", handlePopState);
    
    // Set initial URL
    if (!window.location.hash) {
      window.history.replaceState({ tab: "dashboard" }, "", "#dashboard");
    }

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  // Update URL when tab changes
  useEffect(() => {
    if (window.location.hash.slice(1) !== activeTab) {
      window.history.pushState({ tab: activeTab }, "", `#${activeTab}`);
    }
  }, [activeTab]);

  const toggleLanguage = () => {
    setLanguage((current) => (current === "id" ? "en" : "id"));
  };

  // Theme: 'system' | 'light' | 'dark'
  const THEME_KEY = "theme";
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem(THEME_KEY) || "system";
    } catch (e) {
      return "system";
    }
  });

  useEffect(() => {
    const root = document.documentElement;

    const apply = (t) => {
      if (t === "system") {
        const prefersDark =
          window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches;
        root.classList.toggle("dark", prefersDark);
      } else {
        root.classList.toggle("dark", t === "dark");
      }
    };

    apply(theme);

    // listen to system changes when in 'system' mode
    let mq;
    const mqHandler = () => {
      if (theme === "system") apply("system");
    };
    if (window.matchMedia) {
      mq = window.matchMedia("(prefers-color-scheme: dark)");
      if (mq.addEventListener) mq.addEventListener("change", mqHandler);
      else if (mq.addListener) mq.addListener(mqHandler);
    }

    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {}

    return () => {
      if (mq) {
        if (mq.removeEventListener) mq.removeEventListener("change", mqHandler);
        else if (mq.removeListener) mq.removeListener(mqHandler);
      }
    };
  }, [theme]);

  const cycleTheme = () => {
    setTheme((current) => {
      if (current === "light") return "dark";
      if (current === "dark") return "system";
      return "light";
    });
  };

  const getThemeIcon = () => {
    if (theme === "light") return <Sun size={18} />;
    if (theme === "dark") return <Moon size={18} />;
    return <Monitor size={18} />;
  };

  const getThemeLabel = () => {
    if (theme === "light") return "Light";
    if (theme === "dark") return "Dark";
    return "System";
  };

  const [formData, setFormData] = useState({
    tanggal: "",
    lokasi: "",
    namaProyek: "",
    jenisKegiatan: "",
    unitAlat: "",
    deskripsi: "",
    jamMulai: "",
    jamSelesai: "",
    catatan: "",
  });

  const [taskFormData, setTaskFormData] = useState({
    namaTask: "",
    deskripsi: "",
    prioritas: "medium",
    deadline: "",
    progress: 0,
    progressLogs: [],
  });

  const [sparepartFormData, setSparepartFormData] = useState({
    namaPart: "",
    deskripsi: "",
    jumlah: 0,
    unit: "",
    status: "pending",
    tanggalDipesan: "",
    tanggalDatang: "",
    createdBy: "",
  });

  const [repairFormData, setRepairFormData] = useState({
    itemRepair: "",
    tanggalMasuk: "",
    tanggalMulai: "",
    tanggalSelesai: "",
    unitAlat: "",
    lokasiOperasi: "",
    deskripsiKerusakan: "",
    status: "received",
  });

  const [newProgressLog, setNewProgressLog] = useState({
    tanggal: new Date().toISOString().split("T")[0],
    deskripsi: "",
    progressIncrement: 0,
  });

  const [editingLogId, setEditingLogId] = useState(null);

  useEffect(() => {
    loadReports();
    loadTasks();
    loadSpareparts();
    loadRepairs();
  }, []);

  // Auto-refresh every 30 minutes and when user returns to tab
  useEffect(() => {
    // Refresh every 30 minutes
    const intervalId = setInterval(() => {
      loadReports();
      loadTasks();
      loadSpareparts();
      loadRepairs();
    }, 1800000); // 1800000ms = 30 minutes

    // Refresh when user returns to tab (visibility change)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // User returned to tab, refresh data
        loadReports();
        loadTasks();
        loadSpareparts();
        loadRepairs();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup on component unmount
    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      const result = await response.json();

      if (result.success) {
        setReports(result.data);
      }
    } catch (error) {
      console.error("Error memuat data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadTasks = async () => {
    try {
      const response = await fetch(TASK_API_URL);
      const result = await response.json();

      if (result.success) {
        setTasks(result.data);
      }
    } catch (error) {
      console.error("Error memuat task:", error);
    }
  };

  const loadSpareparts = async () => {
    try {
      const response = await fetch(SPAREPART_API_URL);
      const result = await response.json();

      if (result.success) {
        setSpareparts(result.data);
      }
    } catch (error) {
      console.error("Error memuat spareparts:", error);
    }
  };

  const loadRepairs = async () => {
    try {
      const response = await fetch(REPAIR_API_URL);
      const result = await response.json();

      if (result.success) {
        setRepairs(result.data);
      }
    } catch (error) {
      console.error("Error memuat repairs:", error);
    }
  };

  const calculateDuration = (start, end) => {
    if (!start || !end) return 0;
    const [startH, startM] = start.split(":").map(Number);
    const [endH, endM] = end.split(":").map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    return (endMinutes - startMinutes) / 60;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTaskInputChange = (e) => {
    const { name, value } = e.target;
    setTaskFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (
      !formData.tanggal ||
      !formData.lokasi ||
      !formData.namaProyek ||
      !formData.jenisKegiatan ||
      !formData.unitAlat ||
      !formData.deskripsi
    ) {
      alert(t("fillRequired"));
      return;
    }

    setSaving(true);

    try {
      if (editingId) {
        const response = await fetch(API_URL, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            id: editingId,
            updatedAt: new Date().toISOString(),
          }),
        });

        const result = await response.json();
        if (result.success) {
          await loadReports();
          setEditingId(null);
        } else {
          alert(t("updateFailed") + ": " + result.message);
        }
      } else {
        const newReport = {
          ...formData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        };

        const response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newReport),
        });

        const result = await response.json();
        if (result.success) {
          await loadReports();
        } else {
          alert(t("saveFailed") + ": " + result.message);
        }
      }

      setFormData({
        tanggal: "",
        lokasi: "",
        namaProyek: "",
        jenisKegiatan: "",
        unitAlat: "",
        deskripsi: "",
        jamMulai: "",
        jamSelesai: "",
        catatan: "",
      });
      setShowForm(false);
    } catch (error) {
      console.error("Error menyimpan data:", error);
      alert(t("errorSaving"));
    } finally {
      setSaving(false);
    }
  };

  const handleTaskSubmit = async () => {
    if (!taskFormData.namaTask || !taskFormData.deskripsi) {
      alert(t("fillTaskRequired"));
      return;
    }

    setSaving(true);

    try {
      if (editingTaskId) {
        const response = await fetch(TASK_API_URL, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...taskFormData,
            id: editingTaskId,
            updatedAt: new Date().toISOString(),
          }),
        });

        const result = await response.json();
        if (result.success) {
          await loadTasks();
          setEditingTaskId(null);
        }
      } else {
        const newTask = {
          ...taskFormData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          status: taskFormData.progress >= 100 ? "selesai" : "berlangsung",
        };

        const response = await fetch(TASK_API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newTask),
        });

        const result = await response.json();
        if (result.success) {
          await loadTasks();
        }
      }

      setTaskFormData({
        namaTask: "",
        deskripsi: "",
        prioritas: "medium",
        deadline: "",
        progress: 0,
        progressLogs: [],
      });
      setShowTaskForm(false);
      setNewProgressLog({
        tanggal: new Date().toISOString().split("T")[0],
        deskripsi: "",
        progressIncrement: 0,
      });
    } catch (error) {
      console.error("Error menyimpan task:", error);
      alert(t("errorSaving"));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (report) => {
    setFormData(report);
    setEditingId(report.id);
    setShowForm(true);
    window.history.pushState({ tab: "laporan", modal: "form" }, "", "#laporan");
  };

  const handleEditTask = (task, event) => {
    // Stop propagation to prevent card click
    if (event) event.stopPropagation();

    setTaskFormData({
      ...task,
      progressLogs: task.progressLogs || [],
    });
    setEditingTaskId(task.id);
    setShowTaskForm(true);
    setShowProgressModal(false);
    window.history.pushState({ tab: "tasks", modal: "taskForm" }, "", "#tasks");
  };

  const handleTaskCardClick = (task) => {
    setSelectedTask(task);
    setShowProgressModal(true);
    window.history.pushState({ tab: activeTab, modal: "progressModal" }, "", `#${activeTab}`);
    setNewProgressLog({
      tanggal: new Date().toISOString().split("T")[0],
      deskripsi: "",
      progressIncrement: 0,
    });
    setEditingLogId(null);
  };

  const handleCloseProgressModal = () => {
    setShowProgressModal(false);
    setSelectedTask(null);
    setEditingLogId(null);
    setNewProgressLog({
      tanggal: new Date().toISOString().split("T")[0],
      deskripsi: "",
      progressIncrement: 0,
    });
  };

  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin menghapus laporan ini?")) return;

    setSaving(true);
    try {
      const response = await fetch(`${API_URL}?id=${id}`, { method: "DELETE" });
      const result = await response.json();
      if (result.success) await loadReports();
    } catch (error) {
      console.error("Error menghapus data:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTask = async (id) => {
    if (!confirm("Yakin ingin menghapus task ini?")) return;

    setSaving(true);
    try {
      const response = await fetch(`${TASK_API_URL}?id=${id}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (result.success) await loadTasks();
    } catch (error) {
      console.error("Error menghapus task:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      tanggal: "",
      lokasi: "",
      namaProyek: "",
      jenisKegiatan: "",
      unitAlat: "",
      deskripsi: "",
      jamMulai: "",
      jamSelesai: "",
      catatan: "",
    });
    setEditingId(null);
    setShowForm(false);
    if (window.history.state?.modal) {
      window.history.back();
    }
  };

  const handleTaskCancel = () => {
    setTaskFormData({
      namaTask: "",
      deskripsi: "",
      prioritas: "medium",
      deadline: "",
      progress: 0,
      progressLogs: [],
    });
    setEditingTaskId(null);
    setShowTaskForm(false);
    setNewProgressLog({
      tanggal: new Date().toISOString().split("T")[0],
      deskripsi: "",
      progressIncrement: 0,
    });
    if (window.history.state?.modal) {
      window.history.back();
    }
  };

  const handleAddProgressLog = () => {
    if (!newProgressLog.deskripsi.trim()) {
      alert(t("fillProgressRequired"));
      return;
    }

    const logEntry = {
      id: Date.now().toString(),
      tanggal: newProgressLog.tanggal,
      deskripsi: newProgressLog.deskripsi,
      progressIncrement: parseInt(newProgressLog.progressIncrement) || 0,
      createdAt: new Date().toISOString(),
    };

    // For modal mode
    if (showProgressModal && selectedTask) {
      const updatedLogs = [...(selectedTask.progressLogs || []), logEntry];
      const newProgress = Math.min(
        100,
        selectedTask.progress +
          (parseInt(newProgressLog.progressIncrement) || 0)
      );

      // Update via API
      updateTaskProgress(selectedTask.id, updatedLogs, newProgress);
      return;
    }

    // For form mode
    const updatedLogs = [...(taskFormData.progressLogs || []), logEntry];
    const newProgress = Math.min(
      100,
      taskFormData.progress + (parseInt(newProgressLog.progressIncrement) || 0)
    );

    setTaskFormData({
      ...taskFormData,
      progressLogs: updatedLogs,
      progress: newProgress,
    });

    setNewProgressLog({
      tanggal: new Date().toISOString().split("T")[0],
      deskripsi: "",
      progressIncrement: 0,
    });
  };

  const updateTaskProgress = async (taskId, progressLogs, progress) => {
    setSaving(true);
    try {
      const taskToUpdate = tasks.find((t) => t.id === taskId);
      const response = await fetch(TASK_API_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...taskToUpdate,
          progressLogs,
          progress,
          updatedAt: new Date().toISOString(),
        }),
      });

      const result = await response.json();
      if (result.success) {
        await loadTasks();
        setSelectedTask({
          ...taskToUpdate,
          progressLogs,
          progress,
        });
        setNewProgressLog({
          tanggal: new Date().toISOString().split("T")[0],
          deskripsi: "",
          progressIncrement: 0,
        });
      }
    } catch (error) {
      console.error("Error updating task progress:", error);
      alert(t("saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateProgressLog = () => {
    if (!newProgressLog.deskripsi.trim()) {
      alert(t("fillProgressRequired"));
      return;
    }

    // For modal mode
    if (showProgressModal && selectedTask) {
      const updatedLogs = (selectedTask.progressLogs || []).map((log) =>
        log.id === editingLogId
          ? {
              ...log,
              tanggal: newProgressLog.tanggal,
              deskripsi: newProgressLog.deskripsi,
              progressIncrement:
                parseInt(newProgressLog.progressIncrement) || 0,
            }
          : log
      );

      const totalProgress = updatedLogs.reduce(
        (sum, log) => sum + (log.progressIncrement || 0),
        0
      );
      const newProgress = Math.min(100, totalProgress);

      updateTaskProgress(selectedTask.id, updatedLogs, newProgress);
      setEditingLogId(null);
      return;
    }

    // For form mode
    const updatedLogs = (taskFormData.progressLogs || []).map((log) =>
      log.id === editingLogId
        ? {
            ...log,
            tanggal: newProgressLog.tanggal,
            deskripsi: newProgressLog.deskripsi,
            progressIncrement: parseInt(newProgressLog.progressIncrement) || 0,
          }
        : log
    );

    const totalProgress = updatedLogs.reduce(
      (sum, log) => sum + (log.progressIncrement || 0),
      0
    );
    const newProgress = Math.min(100, totalProgress);

    setTaskFormData({
      ...taskFormData,
      progressLogs: updatedLogs,
      progress: newProgress,
    });

    setNewProgressLog({
      tanggal: new Date().toISOString().split("T")[0],
      deskripsi: "",
      progressIncrement: 0,
    });
    setEditingLogId(null);
  };

  const handleDeleteProgressLog = (logId) => {
    if (!confirm("Yakin ingin menghapus log progress ini?")) return;

    // For modal mode
    if (showProgressModal && selectedTask) {
      const logToDelete = (selectedTask.progressLogs || []).find(
        (log) => log.id === logId
      );
      const updatedLogs = (selectedTask.progressLogs || []).filter(
        (log) => log.id !== logId
      );
      const newProgress = Math.max(
        0,
        selectedTask.progress - (logToDelete?.progressIncrement || 0)
      );

      updateTaskProgress(selectedTask.id, updatedLogs, newProgress);
      return;
    }

    // For form mode
    const logToDelete = taskFormData.progressLogs.find(
      (log) => log.id === logId
    );
    const updatedLogs = taskFormData.progressLogs.filter(
      (log) => log.id !== logId
    );
    const newProgress = Math.max(
      0,
      taskFormData.progress - (logToDelete?.progressIncrement || 0)
    );

    setTaskFormData({
      ...taskFormData,
      progressLogs: updatedLogs,
      progress: newProgress,
    });
  };

  const handleEditProgressLog = (log) => {
    setEditingLogId(log.id);
    setNewProgressLog({
      tanggal: log.tanggal,
      deskripsi: log.deskripsi,
      progressIncrement: log.progressIncrement,
    });
  };

  const handleCancelEditLog = () => {
    setEditingLogId(null);
    setNewProgressLog({
      tanggal: new Date().toISOString().split("T")[0],
      deskripsi: "",
      progressIncrement: 0,
    });
  };

  // Sparepart Functions
  const handleSparepartInputChange = (e) => {
    const { name, value } = e.target;
    setSparepartFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSparepartSubmit = async () => {
    if (!sparepartFormData.namaPart.trim() || !sparepartFormData.jumlah) {
      alert(t("fillPartRequired"));
      return;
    }

    setSaving(true);
    try {
      const url = editingSparepartId ? SPAREPART_API_URL : SPAREPART_API_URL;
      const method = editingSparepartId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...sparepartFormData,
          id: editingSparepartId,
        }),
      });

      const result = await response.json();
      if (result.success) {
        await loadSpareparts();
        setShowSparepartForm(false);
        setEditingSparepartId(null);
        setSparepartFormData({
          namaPart: "",
          deskripsi: "",
          jumlah: 0,
          unit: "",
          status: "pending",
          tanggalDipesan: "",
          tanggalDatang: "",
          createdBy: "",
        });
      }
    } catch (error) {
      console.error("Error menyimpan sparepart:", error);
      alert(t("saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  const handleEditSparepart = (sparepart) => {
    setEditingSparepartId(sparepart.id);
    setSparepartFormData(sparepart);
    setShowSparepartForm(true);
  };

  const handleEditSparepartDates = (sparepart) => {
    setSelectedSparepart(sparepart);
    setShowSparepartDateModal(true);
  };

  const handleSparepartCardClick = (sparepart) => {
    // Open date modal instead of form modal when clicking card
    setSelectedSparepart(sparepart);
    setShowSparepartDateModal(true);
    window.history.pushState({ tab: "spareparts", modal: "sparepartDateModal" }, "", "#spareparts");
  };

  const handleUpdateSparepartDates = async () => {
    if (!selectedSparepart) return;

    // Validate required fields based on status
    if (
      selectedSparepart.status === "ordered" &&
      !selectedSparepart.tanggalDipesan
    ) {
      alert(t("orderDateRequired"));
      return;
    }

    if (
      selectedSparepart.status === "arrived" &&
      !selectedSparepart.tanggalDatang
    ) {
      alert(t("arrivalDateRequired"));
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(SPAREPART_API_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedSparepart),
      });

      const result = await response.json();
      if (result.success) {
        await loadSpareparts();
        setShowSparepartDateModal(false);
        setSelectedSparepart(null);
      }
    } catch (error) {
      console.error("Error update tanggal sparepart:", error);
      alert(t("updateFailed"));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSparepart = async (id) => {
    if (!confirm(t("confirmDelete") + "?")) return;

    setSaving(true);
    try {
      const response = await fetch(SPAREPART_API_URL, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const result = await response.json();
      if (result.success) {
        await loadSpareparts();
      }
    } catch (error) {
      console.error("Error menghapus sparepart:", error);
      alert(t("deleteFailed"));
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateSparepartStatus = async (sparepart, newStatus) => {
    setSaving(true);
    try {
      const updatedSparepart = {
        ...sparepart,
        status: newStatus,
        tanggalDipesan:
          newStatus === "ordered"
            ? new Date().toISOString().split("T")[0]
            : sparepart.tanggalDipesan,
        tanggalDatang:
          newStatus === "arrived"
            ? new Date().toISOString().split("T")[0]
            : sparepart.tanggalDatang,
      };

      const response = await fetch(SPAREPART_API_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedSparepart),
      });

      const result = await response.json();
      if (result.success) {
        await loadSpareparts();
      }
    } catch (error) {
      console.error("Error update status sparepart:", error);
      alert(t("updateFailed"));
    } finally {
      setSaving(false);
    }
  };

  // Repair Handlers
  const handleSubmitRepair = async (e) => {
    e.preventDefault();

    if (!repairFormData.itemRepair || !repairFormData.tanggalMasuk) {
      alert(t("fillRequired"));
      return;
    }

    setSaving(true);
    try {
      const method = editingRepairId ? "PUT" : "POST";
      const payload = editingRepairId
        ? { id: editingRepairId, ...repairFormData }
        : repairFormData;

      const response = await fetch(REPAIR_API_URL, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (result.success) {
        await loadRepairs();
        setShowRepairForm(false);
        setEditingRepairId(null);
        setRepairFormData({
          itemRepair: "",
          tanggalMasuk: "",
          tanggalMulai: "",
          tanggalSelesai: "",
          unitAlat: "",
          lokasiOperasi: "",
          deskripsiKerusakan: "",
          status: "received",
        });
      }
    } catch (error) {
      console.error("Error menyimpan repair:", error);
      alert(t("saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  const handleEditRepair = (repair) => {
    setEditingRepairId(repair.id);
    setRepairFormData(repair);
    setShowRepairForm(true);
  };

  const handleDeleteRepair = async (id) => {
    if (!confirm(t("confirmDelete") + "?")) return;

    setSaving(true);
    try {
      const response = await fetch(REPAIR_API_URL, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const result = await response.json();
      if (result.success) {
        await loadRepairs();
      }
    } catch (error) {
      console.error("Error menghapus repair:", error);
      alert(t("deleteFailed"));
    } finally {
      setSaving(false);
    }
  };

  // Download Functions
  const downloadExcel = (data, filename, headers) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data");
    XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  const downloadPDF = (data, filename, columns, title) => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text(title, 14, 15);
    
    // Add date
    doc.setFontSize(10);
    doc.text(`Tanggal: ${new Date().toLocaleDateString("id-ID")}`, 14, 22);
    
    // Add table using autoTable
    autoTable(doc, {
      startY: 30,
      head: [columns.map(col => col.header)],
      body: data.map(row => columns.map(col => col.field ? row[col.field] : col.render(row))),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [79, 70, 229], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { top: 30 },
    });
    
    doc.save(`${filename}.pdf`);
  };

  const handleDownloadReportsExcel = () => {
    const data = filteredReports.map(report => ({
      "Tanggal": new Date(report.tanggal).toLocaleDateString("id-ID"),
      "Nama Proyek": report.namaProyek,
      "Lokasi": report.lokasi,
      "Jenis Kegiatan": report.jenisKegiatan,
      "Unit Alat": report.unitAlat,
      "Jam Kerja": report.jamKerja,
      "Catatan": report.catatan || "-"
    }));
    downloadExcel(data, "Laporan_Lapangan", Object.keys(data[0] || {}));
  };

  const handleDownloadReportsPDF = () => {
    const columns = [
      { header: "Tanggal", render: (r) => new Date(r.tanggal).toLocaleDateString("id-ID") },
      { header: "Nama Proyek", field: "namaProyek" },
      { header: "Lokasi", field: "lokasi" },
      { header: "Jenis Kegiatan", field: "jenisKegiatan" },
      { header: "Unit Alat", field: "unitAlat" },
      { header: "Jam Kerja", field: "jamKerja" },
      { header: "Catatan", render: (r) => r.catatan || "-" }
    ];
    downloadPDF(filteredReports, "Laporan_Lapangan", columns, "LAPORAN LAPANGAN");
  };

  const handleDownloadTasksExcel = () => {
    const data = filteredTasks.map(task => ({
      "Nama Tugas": task.namaTask,
      "Deskripsi": task.deskripsi,
      "Prioritas": task.prioritas === "high" ? "Tinggi" : task.prioritas === "medium" ? "Sedang" : "Rendah",
      "Progress": `${task.progress}%`,
      "Deadline": task.deadline ? new Date(task.deadline).toLocaleDateString("id-ID") : "-"
    }));
    downloadExcel(data, "Daftar_Tugas", Object.keys(data[0] || {}));
  };

  const handleDownloadTasksPDF = () => {
    const columns = [
      { header: "Nama Tugas", field: "namaTask" },
      { header: "Deskripsi", field: "deskripsi" },
      { header: "Prioritas", render: (t) => t.prioritas === "high" ? "Tinggi" : t.prioritas === "medium" ? "Sedang" : "Rendah" },
      { header: "Progress", render: (t) => `${t.progress}%` },
      { header: "Deadline", render: (t) => t.deadline ? new Date(t.deadline).toLocaleDateString("id-ID") : "-" }
    ];
    downloadPDF(filteredTasks, "Daftar_Tugas", columns, "DAFTAR TUGAS");
  };

  const handleDownloadSparepartsExcel = () => {
    const data = spareparts.filter(part =>
      part.namaPart?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.deskripsi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.unit?.toLowerCase().includes(searchTerm.toLowerCase())
    ).map(part => ({
      "Nama Sparepart": part.namaPart,
      "Jumlah": part.jumlah,
      "Unit": part.unit,
      "Deskripsi": part.deskripsi || "-",
      "Status": part.status === "arrived" ? "Datang" : part.status === "ordered" ? "Dipesan" : "Pending",
      "Tanggal Order": part.tanggalOrder ? new Date(part.tanggalOrder).toLocaleDateString("id-ID") : "-",
      "Tanggal Datang": part.tanggalDatang ? new Date(part.tanggalDatang).toLocaleDateString("id-ID") : "-"
    }));
    downloadExcel(data, "Sparepart", Object.keys(data[0] || {}));
  };

  const handleDownloadSparepartsPDF = () => {
    const filteredData = spareparts.filter(part =>
      part.namaPart?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.deskripsi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.unit?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const columns = [
      { header: "Nama Sparepart", field: "namaPart" },
      { header: "Jumlah", field: "jumlah" },
      { header: "Unit", field: "unit" },
      { header: "Deskripsi", render: (p) => p.deskripsi || "-" },
      { header: "Status", render: (p) => p.status === "arrived" ? "Datang" : p.status === "ordered" ? "Dipesan" : "Pending" }
    ];
    downloadPDF(filteredData, "Sparepart", columns, "DAFTAR SPAREPART");
  };

  const handleDownloadRepairsExcel = () => {
    const data = filteredRepairs.map(repair => ({
      "Item Repair": repair.itemRepair,
      "Unit Alat": repair.unitAlat,
      "Lokasi Operasi": repair.lokasiOperasi,
      "Tanggal Masuk": new Date(repair.tanggalMasuk).toLocaleDateString("id-ID"),
      "Tanggal Mulai": repair.tanggalMulai ? new Date(repair.tanggalMulai).toLocaleDateString("id-ID") : "-",
      "Tanggal Selesai": repair.tanggalSelesai ? new Date(repair.tanggalSelesai).toLocaleDateString("id-ID") : "-",
      "Deskripsi Kerusakan": repair.deskripsiKerusakan || "-",
      "Status": repair.status === "completed" ? "Selesai" : repair.status === "in-progress" ? "Dalam Proses" : "Diterima"
    }));
    downloadExcel(data, "Repair", Object.keys(data[0] || {}));
  };

  const handleDownloadRepairsPDF = () => {
    const columns = [
      { header: "Item Repair", field: "itemRepair" },
      { header: "Unit Alat", field: "unitAlat" },
      { header: "Lokasi", field: "lokasiOperasi" },
      { header: "Tgl Masuk", render: (r) => new Date(r.tanggalMasuk).toLocaleDateString("id-ID") },
      { header: "Deskripsi", render: (r) => r.deskripsiKerusakan || "-" },
      { header: "Status", render: (r) => r.status === "completed" ? "Selesai" : r.status === "in-progress" ? "Proses" : "Diterima" }
    ];
    downloadPDF(filteredRepairs, "Repair", columns, "DAFTAR REPAIR");
  };

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.namaProyek?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.lokasi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.jenisKegiatan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.unitAlat?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const filteredTasks = tasks.filter((task) => {
    return (
      task.namaTask?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.deskripsi?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const filteredRepairs = repairs.filter((repair) => {
    return (
      repair.itemRepair?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repair.unitAlat?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repair.lokasiOperasi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repair.deskripsiKerusakan?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Sort tasks based on selected option
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (taskSortBy === "deadline") {
      // Sort by deadline (earliest first), tasks without deadline go to end
      if (!a.deadline && !b.deadline) return 0;
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline) - new Date(b.deadline);
    } else if (taskSortBy === "priority") {
      // Sort by priority: high > medium > low
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return (
        (priorityOrder[b.prioritas] || 0) - (priorityOrder[a.prioritas] || 0)
      );
    } else if (taskSortBy === "name") {
      // Sort alphabetically by name
      return (a.namaTask || "").localeCompare(b.namaTask || "");
    }
    return 0;
  });

  const totalReports = reports.length;
  const completedTasks = tasks.filter((t) => t.progress >= 100).length;
  const ongoingTasks = tasks.filter((t) => t.progress < 100).length;

  const recentReports = [...reports]
    .sort(
      (a, b) =>
        new Date(b.createdAt || b.tanggal) - new Date(a.createdAt || a.tanggal)
    )
    .slice(0, 5);

  const lokasiStats = reports.reduce((acc, report) => {
    if (!acc[report.lokasi]) {
      acc[report.lokasi] = { count: 0, totalHours: 0, units: [] };
    }
    acc[report.lokasi].count += 1;
    acc[report.lokasi].totalHours += calculateDuration(
      report.jamMulai,
      report.jamSelesai
    );
    if (
      report.unitAlat &&
      !acc[report.lokasi].units.includes(report.unitAlat)
    ) {
      acc[report.lokasi].units.push(report.unitAlat);
    }
    return acc;
  }, {});

  const topLokasi = Object.entries(lokasiStats)
    .map(([lokasi, stats]) => ({
      lokasi,
      count: stats.count,
      totalHours: stats.totalHours,
      units: stats.units,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const getPriorityColor = (prioritas) => {
    switch (prioritas) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen relative">
        {/* Background Image */}
        <div className="fixed inset-0 z-0">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url(/background.webp)" }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-br from-green-900/50 via-emerald-900/45 to-teal-900/50 dark:from-gray-900/70 dark:via-gray-800/65 dark:to-gray-900/70"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <RefreshCw
              className="animate-spin mx-auto mb-4 text-green-400 dark:text-green-300"
              size={48}
            />
            <div className="text-lg text-white dark:text-gray-200">
              {t("loading")}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Background Image with Overlay */}
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed"
          style={{ backgroundImage: "url(/background.webp)" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-br from-white/75 via-green-50/70 to-emerald-50/75 dark:from-gray-900/85 dark:via-gray-800/80 dark:to-gray-900/85"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Navigation - Sticky Header */}
        <div className="sticky top-0 z-50 bg-white/90 dark:bg-gray-800/90 shadow-md border-b-4 border-green-600 dark:border-green-500 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-8">
            <div className="flex items-center justify-between gap-4 py-2 sm:py-4">
              {/* Logo and Title */}
              <div 
                className="flex items-center gap-2 sm:gap-3 cursor-pointer flex-shrink-0" 
                onClick={() => {
                  setActiveTab("dashboard");
                  window.history.pushState({ tab: "dashboard" }, "", "#dashboard");
                }}
              >
                <div className="flex-shrink-0">
                  <img
                    src="/logo-spil.png"
                    alt="SPIL Logo"
                    className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 object-contain transition-transform duration-300 hover:scale-110 cursor-pointer"
                  />
                </div>
                <div className="hidden md:block">
                  <h1 className="text-xs sm:text-sm md:text-base font-bold text-gray-800 dark:text-white leading-tight flex">
                    {t("appTitle").split("").map((char, index) => (
                      <span
                        key={index}
                        className="inline-block transition-all duration-300 ease-out hover:scale-150 hover:text-green-600 dark:hover:text-green-400 hover:-translate-y-1"
                      >
                        {char === " " ? "\u00A0" : char}
                      </span>
                    ))}
                  </h1>
                  <p className="text-[8px] sm:text-[10px] text-gray-600 dark:text-gray-400 flex">
                    {t("appSubtitle").split("").map((char, index) => (
                      <span
                        key={index}
                        className="inline-block transition-all duration-300 ease-out hover:scale-125 hover:text-green-500 dark:hover:text-green-300"
                      >
                        {char === " " ? "\u00A0" : char}
                      </span>
                    ))}
                  </p>
                </div>
              </div>

              {/* Desktop Tab Navigation - Horizontal */}
              <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
                <button
                  onClick={() => {
                    setActiveTab("dashboard");
                    setShowForm(false);
                    setShowTaskForm(false);
                    window.history.pushState({ tab: "dashboard" }, "", "#dashboard");
                  }}
                  className={`px-3 py-2 font-semibold transition-all duration-200 whitespace-nowrap text-sm flex items-center gap-2 rounded-lg ${
                    activeTab === "dashboard"
                      ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <BarChart3 size={16} />
                  <span>{t("dashboard")}</span>
                </button>
                
                <button
                  onClick={() => {
                    setActiveTab("laporan");
                    setShowTaskForm(false);
                    window.history.pushState({ tab: "laporan" }, "", "#laporan");
                  }}
                  className={`px-3 py-2 font-semibold transition-all duration-200 whitespace-nowrap text-sm flex items-center gap-2 rounded-lg ${
                    activeTab === "laporan"
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <FileText size={16} />
                  <span>{t("reports")}</span>
                </button>
                
                <button
                  onClick={() => {
                    setActiveTab("tasks");
                    setShowForm(false);
                    window.history.pushState({ tab: "tasks" }, "", "#tasks");
                  }}
                  className={`px-3 py-2 font-semibold transition-all duration-200 whitespace-nowrap text-sm flex items-center gap-2 rounded-lg ${
                    activeTab === "tasks"
                      ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <ListTodo size={16} />
                  <span>{t("tasks")}</span>
                </button>
                
                <button
                  onClick={() => {
                    setActiveTab("spareparts");
                    setShowForm(false);
                    setShowTaskForm(false);
                    window.history.pushState({ tab: "spareparts" }, "", "#spareparts");
                  }}
                  className={`px-3 py-2 font-semibold transition-all duration-200 whitespace-nowrap text-sm flex items-center gap-2 rounded-lg ${
                    activeTab === "spareparts"
                      ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <Wrench size={16} />
                  <span>{t("spareparts")}</span>
                </button>
                
                <button
                  onClick={() => {
                    setActiveTab("repairs");
                    setShowForm(false);
                    setShowTaskForm(false);
                    setShowSparepartForm(false);
                    window.history.pushState({ tab: "repairs" }, "", "#repairs");
                  }}
                  className={`px-3 py-2 font-semibold transition-all duration-200 whitespace-nowrap text-sm flex items-center gap-2 rounded-lg ${
                    activeTab === "repairs"
                      ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <ClipboardList size={16} />
                  <span>{t("repairs")}</span>
                </button>
                
                {/* Monitoring Dropdown */}
                <div className="relative group">
                  <button
                    className="px-3 py-2 font-semibold transition-all duration-200 whitespace-nowrap text-sm flex items-center gap-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Monitor size={16} />
                    <span>{t("monitoring")}</span>
                    <ChevronDown size={14} className="transition-transform group-hover:rotate-180" />
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-2">
                      <a
                        href="https://reach-stacker-monitor.vercel.app/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                      >
                        <Monitor size={16} />
                        <div>
                          <div className="font-semibold">Reach Stacker</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Monitor alat berat</div>
                        </div>
                      </a>
                      <a
                        href="https://bbm-dashboard.vercel.app/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                      >
                        <Gauge size={16} />
                        <div>
                          <div className="font-semibold">Monitoring BBM</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Dashboard konsumsi BBM</div>
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
              </nav>

              {/* Right Actions */}
              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                {/* Mobile Menu Button */}
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="lg:hidden bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 p-2 rounded-lg font-semibold flex items-center transition-colors"
                  title="Menu"
                >
                  <Menu size={20} />
                </button>

                {/* Theme Toggle Button */}
                <button
                  onClick={cycleTheme}
                  className="hidden lg:flex bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 p-2 rounded-lg font-semibold items-center transition-colors"
                  title={`Current: ${getThemeLabel()} - Click to change`}
                >
                  {getThemeIcon()}
                </button>

                {/* Language Toggle Button */}
                <button
                  onClick={toggleLanguage}
                  className="hidden lg:flex bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 p-2 rounded-lg font-semibold items-center transition-colors"
                  title="Change Language"
                >
                  <Globe size={16} />
                </button>

                {/* Refresh Button */}
                <button
                  onClick={loadReports}
                  disabled={loading}
                  className="hidden lg:flex bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 p-2 rounded-lg font-semibold items-center transition-colors"
                  title="Refresh"
                >
                  <RefreshCw
                    size={16}
                    className={loading ? "animate-spin" : ""}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu Sidebar */}
        {showMobileMenu && (
          <div className="lg:hidden fixed inset-0 z-[100]">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black bg-opacity-60"
              onClick={() => setShowMobileMenu(false)}
            ></div>

            {/* Sidebar */}
            <div className="absolute top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 shadow-2xl transform transition-transform duration-300">
              <div className="p-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                    {t("menu")}
                  </h2>
                  <button
                    onClick={() => setShowMobileMenu(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <X size={20} className="text-gray-600 dark:text-gray-300" />
                  </button>
                </div>

                {/* Navigation Links */}
                <nav className="space-y-2">
                  <button
                    onClick={() => {
                      setActiveTab("dashboard");
                      setShowForm(false);
                      setShowTaskForm(false);
                      setShowMobileMenu(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-colors ${
                      activeTab === "dashboard"
                        ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <BarChart3 size={20} />
                    <span>{t("dashboard")}</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab("laporan");
                      setShowTaskForm(false);
                      setShowMobileMenu(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-colors ${
                      activeTab === "laporan"
                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <FileText size={20} />
                    <span>{t("reports")}</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab("tasks");
                      setShowForm(false);
                      setShowMobileMenu(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-colors ${
                      activeTab === "tasks"
                        ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <ListTodo size={20} />
                    <span>{t("tasks")}</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab("spareparts");
                      setShowForm(false);
                      setShowTaskForm(false);
                      setShowMobileMenu(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-colors ${
                      activeTab === "spareparts"
                        ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <Wrench size={20} />
                    <span>{t("spareparts")}</span>
                  </button>

                  {/* Monitoring Section */}
                  <div className="pt-2">
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t("monitoring")}
                    </div>
                    <a
                      href="https://reach-stacker-monitor.vercel.app/"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setShowMobileMenu(false)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-colors text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400"
                    >
                      <Monitor size={20} />
                      <span>{t("reachStacker")}</span>
                    </a>
                    <a
                      href="https://bbm-dashboard.vercel.app/"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setShowMobileMenu(false)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-colors text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400"
                    >
                      <Gauge size={20} />
                      <span>{t("fuelMonitoring")}</span>
                    </a>
                  </div>
                </nav>

                {/* Divider */}
                <div className="my-6 border-t border-gray-200 dark:border-gray-700"></div>

                {/* Additional Actions */}
                <div className="space-y-2">
                  <button
                    onClick={cycleTheme}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    {getThemeIcon()}
                    <span>{getThemeLabel()} Mode</span>
                  </button>

                  <button
                    onClick={toggleLanguage}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Globe size={20} />
                    <span>
                      {language === "id" ? "Bahasa Indonesia" : "English"}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      loadReports();
                      setShowMobileMenu(false);
                    }}
                    disabled={loading}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw
                      size={20}
                      className={loading ? "animate-spin" : ""}
                    />
                    <span>{t("refresh")} Data</span>
                  </button>
                </div>

                {/* Quick Add Buttons */}
                {activeTab !== "dashboard" && (
                  <>
                    <div className="my-6 border-t border-gray-200 dark:border-gray-700"></div>
                    <div className="space-y-2">
                      {activeTab === "laporan" && (
                        <button
                          onClick={() => {
                            setShowForm(true);
                            setShowMobileMenu(false);
                          }}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                        >
                          <Plus size={20} />
                          <span>{t("createNewReport")}</span>
                        </button>
                      )}
                      {activeTab === "tasks" && (
                        <button
                          onClick={() => {
                            setShowTaskForm(true);
                            setShowMobileMenu(false);
                          }}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
                        >
                          <Plus size={20} />
                          <span>{t("createNewTask")}</span>
                        </button>
                      )}
                      {activeTab === "spareparts" && (
                        <button
                          onClick={() => {
                            setShowSparepartForm(true);
                            setShowMobileMenu(false);
                          }}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
                        >
                          <Plus size={20} />
                          <span>{t("orderSparepart")}</span>
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="max-w-6xl mx-auto p-3 sm:p-4 md:p-8">
          {saving && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[100] modal-backdrop">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 flex items-center gap-3 modal-content">
                <RefreshCw
                  className="animate-spin text-green-600 dark:text-green-400"
                  size={24}
                />
                <span className="text-lg font-semibold dark:text-white">
                  {t("saving")}
                </span>
              </div>
            </div>
          )}

          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div className="space-y-8 tab-content">
              {/* Quick Action Buttons */}
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                  <Plus className="text-indigo-600 dark:text-indigo-400" size={24} />
                  Aksi Cepat
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <button
                    onClick={() => {
                      setActiveTab("laporan");
                      setShowForm(true);
                      setShowTaskForm(false);
                      setShowSparepartForm(false);
                    }}
                    className="bg-gradient-to-br from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white p-5 rounded-xl shadow-lg transition-all hover:shadow-xl group hover-lift"
                  >
                    <div className="flex items-center justify-center mb-3">
                      <div className="p-3 bg-white bg-opacity-20 rounded-lg group-hover:scale-110 transition-transform">
                        <FileText size={28} />
                      </div>
                    </div>
                    <div className="text-center">
                      <h3 className="text-base font-bold mb-1">
                        {t("createNewReport")}
                      </h3>
                      <p className="text-xs text-blue-100">
                        {t("recordFieldWork")}
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab("tasks");
                      setShowTaskForm(true);
                      setShowForm(false);
                      setShowSparepartForm(false);
                    }}
                    className="bg-gradient-to-br from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white p-5 rounded-xl shadow-lg transition-all hover:shadow-xl group hover-lift"
                  >
                    <div className="flex items-center justify-center mb-3">
                      <div className="p-3 bg-white bg-opacity-20 rounded-lg group-hover:scale-110 transition-transform">
                        <ListTodo size={28} />
                      </div>
                    </div>
                    <div className="text-center">
                      <h3 className="text-base font-bold mb-1">
                        {t("createNewTask")}
                      </h3>
                      <p className="text-xs text-green-100">
                        {t("planYourWork")}
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab("spareparts");
                      setShowSparepartForm(true);
                      setShowForm(false);
                      setShowTaskForm(false);
                    }}
                    className="bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white p-5 rounded-xl shadow-lg transition-all hover:shadow-xl group hover-lift"
                  >
                    <div className="flex items-center justify-center mb-3">
                      <div className="p-3 bg-white bg-opacity-20 rounded-lg group-hover:scale-110 transition-transform">
                        <Wrench size={28} />
                      </div>
                    </div>
                    <div className="text-center">
                      <h3 className="text-base font-bold mb-1">
                        {t("orderSparepart")}
                      </h3>
                      <p className="text-xs text-purple-100">
                        {t("addSparepartRequest")}
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab("repairs");
                      setShowRepairForm(true);
                      setShowForm(false);
                      setShowTaskForm(false);
                      setShowSparepartForm(false);
                    }}
                    className="bg-gradient-to-br from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white p-5 rounded-xl shadow-lg transition-all hover:shadow-xl group hover-lift"
                  >
                    <div className="flex items-center justify-center mb-3">
                      <div className="p-3 bg-white bg-opacity-20 rounded-lg group-hover:scale-110 transition-transform">
                        <ClipboardList size={28} />
                      </div>
                    </div>
                    <div className="text-center">
                      <h3 className="text-base font-bold mb-1">
                        {t("newRepair")}
                      </h3>
                      <p className="text-xs text-orange-100">
                        Input repair request
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Statistics Overview */}
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="text-green-600 dark:text-green-400" size={24} />
                  Statistik Overview
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 hover-lift card-transition stagger-item">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 sm:p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
                      <FileText
                        className="text-indigo-600 dark:text-indigo-400"
                        size={20}
                      />
                    </div>
                    <TrendingUp
                      className="text-indigo-600 dark:text-indigo-400"
                      size={18}
                    />
                  </div>
                  <h3 className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm font-medium mb-1">
                    {t("totalReports")}
                  </h3>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
                    {totalReports}
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 hover-lift card-transition stagger-item">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 sm:p-3 bg-green-100 dark:bg-green-900/50 rounded-lg">
                      <CheckCircle
                        className="text-green-600 dark:text-green-400"
                        size={20}
                      />
                    </div>
                  </div>
                  <h3 className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm font-medium mb-1">
                    {t("completedTasks")}
                  </h3>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
                    {completedTasks}
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 hover-lift card-transition stagger-item">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                      <Target
                        className="text-blue-600 dark:text-blue-400"
                        size={20}
                      />
                    </div>
                  </div>
                  <h3 className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm font-medium mb-1">
                    {t("ongoingTasks")}
                  </h3>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
                    {ongoingTasks}
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 hover-lift card-transition stagger-item">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 sm:p-3 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                      <Wrench
                        className="text-purple-600 dark:text-purple-400"
                        size={20}
                      />
                    </div>
                  </div>
                  <h3 className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm font-medium mb-1">
                    {t("totalSpareparts")}
                  </h3>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
                    {spareparts.length}
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 hover-lift card-transition stagger-item">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 sm:p-3 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
                      <ClipboardList
                        className="text-orange-600 dark:text-orange-400"
                        size={20}
                      />
                    </div>
                  </div>
                  <h3 className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm font-medium mb-1">
                    {t("totalRepairs")}
                  </h3>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
                    {repairs.length}
                  </p>
                </div>
              </div>
              </div>

              {/* Recent Reports & Top Locations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Recent Reports */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 fade-in">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                    {t("recentReports")}
                  </h2>
                  {recentReports.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                      {t("noReportsYet")}
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {recentReports.map((report) => (
                        <div
                          key={report.id}
                          className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors hover-lift"
                          onClick={() => handleEdit(report)}
                        >
                          <h3 className="font-semibold text-gray-800 dark:text-white">
                            {report.namaProyek}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {report.lokasi}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {new Date(report.tanggal).toLocaleDateString(
                              "id-ID"
                            )}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Top Locations with Unit Names */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 fade-in">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                    {t("topLocations")}
                  </h2>
                  {topLokasi.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                      {t("noDataYet")}
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {topLokasi.map((item, index) => (
                        <div
                          key={item.lokasi}
                          className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover-lift"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-indigo-600 dark:bg-indigo-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                {index + 1}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-800 dark:text-white">
                                  {item.lokasi}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {item.count} laporan •{" "}
                                  {item.totalHours.toFixed(1)} jam
                                </p>
                              </div>
                            </div>
                          </div>
                          {item.units.length > 0 && (
                            <div className="ml-11 mt-2">
                              <div className="flex flex-wrap gap-1">
                                {item.units.map((unit, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-1 bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 text-xs rounded-full flex items-center gap-1"
                                  >
                                    <Wrench size={12} />
                                    {unit}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Tasks Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Ongoing Tasks by Priority */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 fade-in">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                    {t("ongoingTasksByPriority")}
                  </h2>
                  {tasks.filter((t) => t.progress < 100).length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                      {t("noOngoingTasks")}
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {tasks
                        .filter((t) => t.progress < 100)
                        .sort((a, b) => {
                          const priorityOrder = { high: 3, medium: 2, low: 1 };
                          return (
                            (priorityOrder[b.prioritas] || 0) -
                            (priorityOrder[a.prioritas] || 0)
                          );
                        })
                        .slice(0, 5)
                        .map((task) => (
                          <div
                            key={task.id}
                            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors hover-lift"
                            onClick={() => handleTaskCardClick(task)}
                          >
                            <div className="flex justify-between items-start mb-3">
                              <h3 className="font-semibold text-gray-800 dark:text-white">
                                {task.namaTask}
                              </h3>
                              <div className="flex gap-2 items-center">
                                <button
                                  onClick={(e) => handleEditTask(task, e)}
                                  className="p-1 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded transition-colors"
                                  title="Edit Task"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(
                                    task.prioritas
                                  )}`}
                                >
                                  {task.prioritas === "high"
                                    ? "Tinggi"
                                    : task.prioritas === "medium"
                                    ? "Sedang"
                                    : "Rendah"}
                                </span>
                              </div>
                            </div>
                            <div className="mb-2">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-xs text-gray-600 dark:text-gray-300">
                                  Progress
                                </span>
                                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                                  {task.progress}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                <div
                                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full transition-all duration-300"
                                  style={{ width: `${task.progress}%` }}
                                ></div>
                              </div>
                            </div>
                            {task.deadline && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                ⏰{" "}
                                {new Date(task.deadline).toLocaleDateString(
                                  "id-ID",
                                  {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  }
                                )}
                              </p>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* Ongoing Tasks by Deadline */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 fade-in">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                    {t("ongoingTasksByDeadline")}
                  </h2>
                  {tasks.filter((t) => t.progress < 100 && t.deadline)
                    .length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                      {t("noTasksWithDeadline")}
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {tasks
                        .filter((t) => t.progress < 100 && t.deadline)
                        .sort(
                          (a, b) => new Date(a.deadline) - new Date(b.deadline)
                        )
                        .slice(0, 5)
                        .map((task) => (
                          <div
                            key={task.id}
                            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors hover-lift"
                            onClick={() => handleTaskCardClick(task)}
                          >
                            <div className="flex justify-between items-start mb-3">
                              <h3 className="font-semibold text-gray-800 dark:text-white">
                                {task.namaTask}
                              </h3>
                              <div className="flex gap-2 items-center">
                                <button
                                  onClick={(e) => handleEditTask(task, e)}
                                  className="p-1 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded transition-colors"
                                  title="Edit Task"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(
                                    task.prioritas
                                  )}`}
                                >
                                  {task.prioritas === "high"
                                    ? "Tinggi"
                                    : task.prioritas === "medium"
                                    ? "Sedang"
                                    : "Rendah"}
                                </span>
                              </div>
                            </div>
                            <div className="mb-2">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-xs text-gray-600 dark:text-gray-300">
                                  Progress
                                </span>
                                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                                  {task.progress}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                <div
                                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full transition-all duration-300"
                                  style={{ width: `${task.progress}%` }}
                                ></div>
                              </div>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-semibold">
                              ⏰{" "}
                              {new Date(task.deadline).toLocaleDateString(
                                "id-ID",
                                {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )}
                            </p>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* Completed Tasks */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 fade-in">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                    {t("completedTasks")}
                  </h2>
                  {tasks.filter((t) => t.progress >= 100).length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                      {t("noCompletedTasks")}
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {tasks
                        .filter((t) => t.progress >= 100)
                        .slice(0, 5)
                        .map((task) => (
                          <div
                            key={task.id}
                            className="p-4 border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 rounded-lg hover-lift"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle
                                className="text-green-600 dark:text-green-400"
                                size={20}
                              />
                              <h3 className="font-semibold text-gray-800 dark:text-white">
                                {task.namaTask}
                              </h3>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                              {task.deskripsi}
                            </p>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Sparepart Summary */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-4">
                  Ringkasan Sparepart
                </h2>
                {spareparts.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    Belum ada sparepart
                  </p>
                ) : (
                  <div className="space-y-4">
                    {/* Status Summary */}
                    <div className="grid grid-cols-3 gap-2 sm:gap-4">
                      <div className="p-3 sm:p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <p className="text-xs text-yellow-700 dark:text-yellow-400 mb-1">
                          Pending
                        </p>
                        <p className="text-xl sm:text-2xl font-bold text-yellow-800 dark:text-yellow-300">
                          {
                            spareparts.filter((s) => s.status === "pending")
                              .length
                          }
                        </p>
                      </div>
                      <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <p className="text-xs text-blue-700 dark:text-blue-400 mb-1">
                          Dipesan
                        </p>
                        <p className="text-xl sm:text-2xl font-bold text-blue-800 dark:text-blue-300">
                          {
                            spareparts.filter((s) => s.status === "ordered")
                              .length
                          }
                        </p>
                      </div>
                      <div className="p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <p className="text-xs text-green-700 dark:text-green-400 mb-1">
                          Datang
                        </p>
                        <p className="text-xl sm:text-2xl font-bold text-green-800 dark:text-green-300">
                          {
                            spareparts.filter((s) => s.status === "arrived")
                              .length
                          }
                        </p>
                      </div>
                    </div>

                    {/* Recent Spareparts */}
                    <div>
                      <h3 className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        Sparepart Terbaru
                      </h3>
                      <div className="space-y-2">
                        {spareparts.slice(0, 5).map((part) => (
                          <div
                            key={part.id}
                            onClick={() => {
                              setSelectedSparepart(part);
                              setShowSparepartDateModal(true);
                              window.history.pushState(
                                { tab: "spareparts", modal: "sparepartDateModal" },
                                "",
                                "#spareparts"
                              );
                            }}
                            className="p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-between gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-800 dark:text-white text-xs sm:text-sm truncate">
                                {part.namaPart}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {part.jumlah} {part.unit}
                              </p>
                            </div>
                            <span
                              className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                                part.status === "arrived"
                                  ? "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300"
                                  : part.status === "ordered"
                                  ? "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300"
                                  : "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300"
                              }`}
                            >
                              {part.status === "arrived"
                                ? "Datang"
                                : part.status === "ordered"
                                ? "Dipesan"
                                : "Pending"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Repair Summary */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-4">
                  {t("repairSummary")}
                </h2>
                {repairs.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    {t("noRepairs")}
                  </p>
                ) : (
                  <div className="space-y-4">
                    {/* Status Summary */}
                    <div className="grid grid-cols-3 gap-2 sm:gap-4">
                      <div className="p-3 sm:p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <p className="text-xs text-yellow-700 dark:text-yellow-400 mb-1">
                          {t("statusReceived")}
                        </p>
                        <p className="text-xl sm:text-2xl font-bold text-yellow-800 dark:text-yellow-300">
                          {repairs.filter((r) => r.status === "received").length}
                        </p>
                      </div>
                      <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <p className="text-xs text-blue-700 dark:text-blue-400 mb-1">
                          {t("statusInProgress")}
                        </p>
                        <p className="text-xl sm:text-2xl font-bold text-blue-800 dark:text-blue-300">
                          {repairs.filter((r) => r.status === "in-progress").length}
                        </p>
                      </div>
                      <div className="p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <p className="text-xs text-green-700 dark:text-green-400 mb-1">
                          {t("statusCompleted")}
                        </p>
                        <p className="text-xl sm:text-2xl font-bold text-green-800 dark:text-green-300">
                          {repairs.filter((r) => r.status === "completed").length}
                        </p>
                      </div>
                    </div>

                    {/* Recent Repairs */}
                    <div>
                      <h3 className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        {t("recentRepairs")}
                      </h3>
                      <div className="space-y-2">
                        {repairs.slice(0, 5).map((repair) => (
                          <div
                            key={repair.id}
                            onClick={() => {
                              handleEditRepair(repair);
                            }}
                            className="p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-between gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-800 dark:text-white text-xs sm:text-sm truncate">
                                {repair.itemRepair}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {repair.unitAlat} - {repair.lokasiOperasi}
                              </p>
                            </div>
                            <span
                              className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                                repair.status === "completed"
                                  ? "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300"
                                  : repair.status === "in-progress"
                                  ? "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300"
                                  : "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300"
                              }`}
                            >
                              {repair.status === "completed"
                                ? t("statusCompleted").slice(0, 7)
                                : repair.status === "in-progress"
                                ? "Progress"
                                : t("statusReceived").slice(0, 7)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Laporan Tab */}
          {activeTab === "laporan" && (
            <div className="space-y-6 tab-content">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 fade-in">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search
                      className="absolute left-3 top-3 text-gray-400 dark:text-gray-500"
                      size={20}
                    />
                    <input
                      type="text"
                      placeholder={t("searchReports")}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDownloadReportsExcel}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors whitespace-nowrap"
                      title={t("downloadExcel")}
                    >
                      <FileText size={18} />
                      <span className="hidden sm:inline">Excel</span>
                    </button>
                    <button
                      onClick={handleDownloadReportsPDF}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors whitespace-nowrap"
                      title={t("downloadPDF")}
                    >
                      <FileText size={18} />
                      <span className="hidden sm:inline">PDF</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowForm(true);
                        setEditingId(null);
                        setFormData({
                          tanggal: new Date().toISOString().split("T")[0],
                          lokasi: "",
                          namaProyek: "",
                          jenisKegiatan: "",
                          unitAlat: "",
                          jamMulai: "",
                          jamSelesai: "",
                          deskripsi: "",
                          catatan: "",
                        });
                        window.history.pushState({ tab: "laporan", modal: "form" }, "", "#laporan");
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors hover-lift whitespace-nowrap"
                    >
                      <Plus size={20} />
                      {t("newReport")}
                    </button>
                  </div>
                </div>
              </div>

              {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-[100] flex items-center justify-center p-4 modal-backdrop" onClick={handleCancel}>
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto modal-content" onClick={(e) => e.stopPropagation()}>
                    <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-6 py-4 flex justify-between items-center z-10">
                      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                        {editingId ? t("editReport") : t("createReport")}
                      </h2>
                      <button
                        onClick={handleCancel}
                        disabled={saving}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                      >
                        <X size={24} />
                      </button>
                    </div>
                    <div className="p-6">
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          {t("date")} *
                        </label>
                        <input
                          type="date"
                          name="tanggal"
                          value={formData.tanggal}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          {t("location")} *
                        </label>
                        <input
                          type="text"
                          name="lokasi"
                          value={formData.lokasi}
                          onChange={handleInputChange}
                          placeholder="Contoh: Jakarta Pusat"
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          {t("projectName")} *
                        </label>
                        <input
                          type="text"
                          name="namaProyek"
                          value={formData.namaProyek}
                          onChange={handleInputChange}
                          placeholder="Contoh: Instalasi Jaringan"
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          {t("activityType")} *
                        </label>
                        <input
                          type="text"
                          name="jenisKegiatan"
                          value={formData.jenisKegiatan}
                          onChange={handleInputChange}
                          placeholder="Contoh: Survey, Instalasi, Maintenance"
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          {t("equipment")} *
                        </label>
                        <input
                          type="text"
                          name="unitAlat"
                          value={formData.unitAlat}
                          onChange={handleInputChange}
                          placeholder="Contoh: Generator, Trafo, Panel"
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                        />
                      </div>
                      <div></div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          {t("startTime")}
                        </label>
                        <input
                          type="time"
                          name="jamMulai"
                          value={formData.jamMulai}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          {t("endTime")}
                        </label>
                        <input
                          type="time"
                          name="jamSelesai"
                          value={formData.jamSelesai}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        {t("description")} *
                      </label>
                      <textarea
                        name="deskripsi"
                        value={formData.deskripsi}
                        onChange={handleInputChange}
                        rows={3}
                        placeholder="Jelaskan pekerjaan yang dilakukan..."
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        {t("notes")}
                      </label>
                      <textarea
                        name="catatan"
                        value={formData.catatan}
                        onChange={handleInputChange}
                        rows={2}
                        placeholder="Kendala, material yang digunakan, dll (opsional)"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors btn-pulse"
                      >
                        {saving ? (
                          <RefreshCw className="animate-spin" size={20} />
                        ) : (
                          <Check size={20} />
                        )}
                        {editingId ? t("update") : t("save")}
                      </button>
                      <button
                        onClick={handleCancel}
                        disabled={saving}
                        className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:bg-gray-100 text-gray-800 dark:text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                      >
                        <X size={20} />
                        {t("cancel")}
                      </button>
                    </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {filteredReports.length === 0 ? (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
                    <FileText
                      size={64}
                      className="mx-auto text-gray-300 dark:text-gray-600 mb-4"
                    />
                    <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
                      {searchTerm ? t("noReportsFound") : t("noReports")}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      {searchTerm
                        ? t("tryDifferentKeyword")
                        : t("createFirstReport")}
                    </p>
                  </div>
                ) : (
                  filteredReports.map((report) => (
                    <div
                      key={report.id}
                      onClick={() => handleEdit(report)}
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow card-transition hover-lift cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                            {report.namaProyek}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                            {report.jenisKegiatan}
                          </p>
                          {report.unitAlat && (
                            <div className="flex items-center gap-1 mt-1">
                              <Wrench
                                size={14}
                                className="text-orange-600 dark:text-orange-400"
                              />
                              <span className="text-sm text-gray-600 dark:text-gray-300">
                                {report.unitAlat}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(report);
                            }}
                            disabled={saving}
                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 disabled:opacity-50 rounded-lg transition-colors"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(report.id);
                            }}
                            disabled={saving}
                            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 disabled:opacity-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                          <Calendar size={16} />
                          <span className="text-sm">
                            {new Date(report.tanggal).toLocaleDateString(
                              "id-ID",
                              {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                          <MapPin size={16} />
                          <span className="text-sm">{report.lokasi}</span>
                        </div>
                        {report.jamMulai && report.jamSelesai && (
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                            <Clock size={16} />
                            <span className="text-sm">
                              {report.jamMulai} - {report.jamSelesai}
                            </span>
                            <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                              (
                              {calculateDuration(
                                report.jamMulai,
                                report.jamSelesai
                              ).toFixed(1)}{" "}
                              jam)
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="border-t dark:border-gray-700 pt-4">
                        <p className="text-gray-700 dark:text-gray-200 mb-2">
                          <span className="font-semibold">Deskripsi:</span>{" "}
                          {report.deskripsi}
                        </p>
                        {report.catatan && (
                          <p className="text-gray-600 dark:text-gray-300 text-sm">
                            <span className="font-semibold">Catatan:</span>{" "}
                            {report.catatan}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Tasks Tab */}
          {activeTab === "tasks" && (
            <div className="space-y-6 tab-content">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 fade-in">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search
                      className="absolute left-3 top-3 text-gray-400 dark:text-gray-500"
                      size={20}
                    />
                    <input
                      type="text"
                      placeholder={t("searchTasks")}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    />
                  </div>
                  <div className="md:w-56">
                    <select
                      value={taskSortBy}
                      onChange={(e) => setTaskSortBy(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="deadline">{t("sortByDeadline")}</option>
                      <option value="priority">{t("sortByPriority")}</option>
                      <option value="name">{t("sortByName")}</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDownloadTasksExcel}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors whitespace-nowrap"
                      title={t("downloadExcel")}
                    >
                      <FileText size={18} />
                      <span className="hidden sm:inline">Excel</span>
                    </button>
                    <button
                      onClick={handleDownloadTasksPDF}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors whitespace-nowrap"
                      title={t("downloadPDF")}
                    >
                      <FileText size={18} />
                      <span className="hidden sm:inline">PDF</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowTaskForm(true);
                        setEditingTaskId(null);
                        setTaskFormData({
                          namaTask: "",
                          deskripsi: "",
                          prioritas: "medium",
                          deadline: "",
                          progress: 0,
                          progressLogs: [],
                        });
                        window.history.pushState({ tab: "tasks", modal: "taskForm" }, "", "#tasks");
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors hover-lift whitespace-nowrap"
                    >
                      <Plus size={20} />
                      {t("newTask")}
                    </button>
                  </div>
                </div>
              </div>

              {showTaskForm && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-[100] flex items-center justify-center p-4 modal-backdrop" onClick={handleTaskCancel}>
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto modal-content" onClick={(e) => e.stopPropagation()}>
                    <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-6 py-4 flex justify-between items-center z-10">
                      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                        {editingTaskId ? t("editTask") : t("createTask")}
                      </h2>
                      <button
                        onClick={handleTaskCancel}
                        disabled={saving}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                      >
                        <X size={24} />
                      </button>
                    </div>
                    <div className="p-6">
                      <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          {t("taskName")} *
                        </label>
                        <input
                          type="text"
                          name="namaTask"
                          value={taskFormData.namaTask}
                          onChange={handleTaskInputChange}
                          placeholder="Contoh: Maintenance Generator A"
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          {t("priority")}
                        </label>
                        <select
                          name="prioritas"
                          value={taskFormData.prioritas}
                          onChange={handleTaskInputChange}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="low">{t("low")}</option>
                          <option value="medium">{t("medium")}</option>
                          <option value="high">{t("high")}</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          {t("deadline")}
                        </label>
                        <input
                          type="date"
                          name="deadline"
                          value={taskFormData.deadline}
                          onChange={handleTaskInputChange}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      {editingTaskId && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          {t("progress")} ({t("progressUpdate")})
                        </label>
                        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              Total Progres
                            </span>
                            <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                              {taskFormData.progress}%
                            </span>
                          </div>
                          <div
                            className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3"
                            style={{
                              background: `linear-gradient(to right, 
                              ${
                                taskFormData.progress >= 100
                                  ? "#10b981"
                                  : taskFormData.progress >= 75
                                  ? "#3b82f6"
                                  : taskFormData.progress >= 50
                                  ? "#f59e0b"
                                  : taskFormData.progress >= 25
                                  ? "#ef4444"
                                  : "#9ca3af"
                              } ${taskFormData.progress}%, 
                              #e5e7eb ${taskFormData.progress}%)`,
                            }}
                          ></div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            Progres dihitung otomatis dari total riwayat progres
                            yang ditambahkan
                          </p>
                        </div>
                      </div>
                      )}
                    </div>

                    {/* Deskripsi Task */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        {t("description")} *
                      </label>
                      <textarea
                        name="deskripsi"
                        value={taskFormData.deskripsi}
                        onChange={handleTaskInputChange}
                        rows={4}
                        placeholder="Jelaskan detail task, lokasi, peralatan yang digunakan, dll..."
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      />
                    </div>

                    {/* Progress Logs Section - Only show when editing existing task */}
                    {editingTaskId && (
                    <>
                    <div
                      className={`p-4 rounded-lg ${
                        editingLogId
                          ? "bg-blue-50 dark:bg-blue-900/20"
                          : "bg-gray-50 dark:bg-gray-700/50"
                      }`}
                    >
                      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                        {editingLogId
                          ? t("edit") + " " + t("progress")
                          : t("addProgressLog")}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                            {t("date")}
                          </label>
                          <input
                            type="date"
                            value={newProgressLog.tanggal}
                            onChange={(e) =>
                              setNewProgressLog({
                                ...newProgressLog,
                                tanggal: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                            {t("progressIncrement")} (%)
                          </label>
                          <input
                            type="number"
                            value={newProgressLog.progressIncrement}
                            onChange={(e) =>
                              setNewProgressLog({
                                ...newProgressLog,
                                progressIncrement: e.target.value,
                              })
                            }
                            min="0"
                            max="100"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                            {t("description")}
                          </label>
                          <input
                            type="text"
                            value={newProgressLog.deskripsi}
                            onChange={(e) =>
                              setNewProgressLog({
                                ...newProgressLog,
                                deskripsi: e.target.value,
                              })
                            }
                            placeholder="Deskripsi progress..."
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        {editingLogId ? (
                          <>
                            <button
                              onClick={handleUpdateProgressLog}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                            >
                              <Check className="w-4 h-4" />
                              Update Progress
                            </button>
                            <button
                              onClick={handleCancelEditLog}
                              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center gap-2"
                            >
                              <X className="w-4 h-4" />
                              Batal
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={handleAddProgressLog}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            Tambah Progress
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Riwayat Progress Logs */}
                    <div className="mt-6">
                      <div className="flex items-center gap-2 mb-4">
                        <ClipboardList
                          className="text-indigo-600 dark:text-indigo-400"
                          size={20}
                        />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          Riwayat Progress
                        </h3>
                      </div>
                      {taskFormData.progressLogs &&
                      taskFormData.progressLogs.length > 0 ? (
                        <div className="space-y-3 max-h-60 overflow-y-auto">
                          {taskFormData.progressLogs
                            .sort(
                              (a, b) =>
                                new Date(b.tanggal) - new Date(a.tanggal)
                            )
                            .map((log) => (
                              <div
                                key={log.id}
                                className={`p-4 rounded-lg border transition-colors group ${
                                  editingLogId === log.id
                                    ? "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700"
                                    : "bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                                }`}
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        {new Date(
                                          log.tanggal
                                        ).toLocaleDateString("id-ID", {
                                          day: "numeric",
                                          month: "long",
                                          year: "numeric",
                                        })}
                                      </span>
                                      <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded text-sm font-semibold">
                                        +{log.progressIncrement}%
                                      </span>
                                    </div>
                                    <p className="text-gray-700 dark:text-gray-300">
                                      {log.deskripsi}
                                    </p>
                                  </div>
                                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={() => handleEditProgressLog(log)}
                                      className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded"
                                      title="Edit"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteProgressLog(log.id)
                                      }
                                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                                      title="Hapus"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                          Belum ada riwayat progress. Tambahkan progress pertama
                          di atas.
                        </p>
                      )}
                    </div>
                    </>
                    )}

                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={handleTaskSubmit}
                        disabled={saving}
                        className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                      >
                        {saving ? (
                          <RefreshCw className="animate-spin" size={20} />
                        ) : (
                          <Check size={20} />
                        )}
                        {editingTaskId ? "Update Task" : "Simpan Task"}
                      </button>
                      <button
                        onClick={handleTaskCancel}
                        disabled={saving}
                        className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:bg-gray-100 text-gray-800 dark:text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                      >
                        <X size={20} />
                        Batal
                      </button>
                    </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {sortedTasks.length === 0 ? (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
                    <ListTodo
                      size={64}
                      className="mx-auto text-gray-300 dark:text-gray-600 mb-4"
                    />
                    <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
                      {searchTerm
                        ? "Tidak ada task yang sesuai"
                        : "Belum ada task"}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      {searchTerm
                        ? "Coba ubah kata kunci pencarian"
                        : 'Klik tombol "Task Baru" untuk mulai membuat task'}
                    </p>
                  </div>
                ) : (
                  sortedTasks.map((task) => (
                    <div
                      key={task.id}
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer card-transition hover-lift"
                      onClick={() => handleTaskCardClick(task)}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                              {task.namaTask}
                            </h3>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(
                                task.prioritas
                              )}`}
                            >
                              {task.prioritas === "high"
                                ? "Tinggi"
                                : task.prioritas === "medium"
                                ? "Sedang"
                                : "Rendah"}
                            </span>
                            {task.progress >= 100 && (
                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 flex items-center gap-1">
                                <CheckCircle size={14} />
                                Selesai
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                            {task.deskripsi}
                          </p>
                          {task.deadline && (
                            <div className="flex items-center gap-2 mt-2 text-gray-600 dark:text-gray-300">
                              <Calendar size={14} />
                              <span className="text-xs">
                                Deadline:{" "}
                                {new Date(task.deadline).toLocaleDateString(
                                  "id-ID"
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => handleEditTask(task, e)}
                            disabled={saving}
                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 disabled:opacity-50 rounded-lg transition-colors"
                            title="Edit Task"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTask(task.id);
                            }}
                            disabled={saving}
                            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 disabled:opacity-50 rounded-lg transition-colors"
                            title="Hapus Task"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                            Progress
                          </span>
                          <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                            {task.progress}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 shadow-inner">
                          <div
                            className={`h-4 rounded-full transition-all duration-500 ${
                              task.progress >= 100
                                ? "bg-gradient-to-r from-green-500 to-emerald-600"
                                : task.progress >= 75
                                ? "bg-gradient-to-r from-blue-500 to-indigo-600"
                                : task.progress >= 50
                                ? "bg-gradient-to-r from-yellow-400 to-orange-500"
                                : task.progress >= 25
                                ? "bg-gradient-to-r from-orange-400 to-red-500"
                                : "bg-gradient-to-r from-gray-400 to-gray-600"
                            } shadow-sm`}
                            style={{ width: `${task.progress}%` }}
                          >
                            {task.progress > 10 && (
                              <span className="flex items-center justify-end pr-2 h-full text-xs font-bold text-white">
                                {task.progress}%
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-between mt-1 text-xs text-gray-400 dark:text-gray-500">
                          <span>Start</span>
                          <span
                            className={
                              task.progress >= 50
                                ? "text-indigo-600 dark:text-indigo-400 font-semibold"
                                : ""
                            }
                          >
                            Halfway
                          </span>
                          <span
                            className={
                              task.progress >= 100
                                ? "text-green-600 dark:text-green-400 font-semibold"
                                : ""
                            }
                          >
                            Complete
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Progress Modal */}
        {showProgressModal && selectedTask && (
          <div className="fixed inset-0 bg-black bg-opacity-60 z-[100] flex items-center justify-center p-2 sm:p-4 modal-backdrop">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto modal-content">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4 sm:p-6">
                <div className="flex justify-between items-start gap-2 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white break-words">
                      {selectedTask.namaTask}
                    </h2>
                    {selectedTask.deskripsi && (
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2 whitespace-pre-wrap break-words">
                        {selectedTask.deskripsi}
                      </p>
                    )}
                    <p className="text-xs sm:text-sm font-semibold text-indigo-600 dark:text-indigo-400 mt-2">
                      Progress: {selectedTask.progress}%
                    </p>
                  </div>
                  <button
                    onClick={handleCloseProgressModal}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex-shrink-0"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-4 sm:p-6">
                {/* Add/Edit Progress Form */}
                <div
                  className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg ${
                    editingLogId
                      ? "bg-blue-50 dark:bg-blue-900/20"
                      : "bg-gray-50 dark:bg-gray-700/50"
                  }`}
                >
                  <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white">
                    {editingLogId ? "Edit Progress" : "Tambah Progress"}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2 text-gray-700 dark:text-gray-300">
                        Tanggal
                      </label>
                      <input
                        type="date"
                        value={newProgressLog.tanggal}
                        onChange={(e) =>
                          setNewProgressLog({
                            ...newProgressLog,
                            tanggal: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Progress (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={newProgressLog.progressIncrement}
                        onChange={(e) =>
                          setNewProgressLog({
                            ...newProgressLog,
                            progressIncrement: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Deskripsi
                      </label>
                      <input
                        type="text"
                        value={newProgressLog.deskripsi}
                        onChange={(e) =>
                          setNewProgressLog({
                            ...newProgressLog,
                            deskripsi: e.target.value,
                          })
                        }
                        placeholder="Deskripsi progress..."
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 mt-3 sm:mt-4">
                    {editingLogId ? (
                      <>
                        <button
                          onClick={handleUpdateProgressLog}
                          disabled={saving}
                          className="flex-1 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base"
                        >
                          <Check className="w-4 h-4" />
                          <span className="hidden sm:inline">
                            Update Progress
                          </span>
                          <span className="sm:hidden">Update</span>
                        </button>
                        <button
                          onClick={handleCancelEditLog}
                          className="flex-1 px-3 sm:px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center justify-center gap-2 text-sm sm:text-base"
                        >
                          <X className="w-4 h-4" />
                          Batal
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={handleAddProgressLog}
                        disabled={saving}
                        className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base"
                      >
                        <Plus className="w-4 h-4" />
                        Tambah Progress
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress Logs List */}
                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white">
                    Riwayat Progress
                  </h3>
                  {!selectedTask.progressLogs ||
                  selectedTask.progressLogs.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                      Belum ada riwayat progress
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {selectedTask.progressLogs
                        .sort(
                          (a, b) => new Date(b.tanggal) - new Date(a.tanggal)
                        )
                        .map((log) => (
                          <div
                            key={log.id}
                            className={`p-3 sm:p-4 rounded-lg border transition-colors group ${
                              editingLogId === log.id
                                ? "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700"
                                : "bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                            }`}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                                  <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                                    {new Date(log.tanggal).toLocaleDateString(
                                      "id-ID",
                                      {
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                      }
                                    )}
                                  </span>
                                  <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded text-xs sm:text-sm font-semibold w-fit">
                                    +{log.progressIncrement}%
                                  </span>
                                </div>
                                <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                                  {log.deskripsi}
                                </p>
                              </div>
                              <div className="flex sm:opacity-0 sm:group-hover:opacity-100 transition-opacity gap-1 sm:gap-2 flex-shrink-0">
                                <button
                                  onClick={() => handleEditProgressLog(log)}
                                  className="p-1.5 sm:p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded"
                                  title="Edit"
                                >
                                  <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteProgressLog(log.id)
                                  }
                                  className="p-1.5 sm:p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                                  title="Hapus"
                                >
                                  <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sparepart Tab */}
        {activeTab === "spareparts" && (
          <div className="space-y-6 tab-content">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 fade-in max-w-6xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  {t("spareparts")}
                </h2>
                <div className="flex gap-3">
                  <button
                    onClick={handleDownloadSparepartsExcel}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors"
                  >
                    <FileText size={18} />
                    {t("downloadExcel")}
                  </button>
                  <button
                    onClick={handleDownloadSparepartsPDF}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors"
                  >
                    <FileText size={18} />
                    {t("downloadPDF")}
                  </button>
                  <button
                    onClick={() => {
                      setShowSparepartForm(true);
                      setEditingSparepartId(null);
                      setSparepartFormData({
                        namaPart: "",
                        deskripsi: "",
                        jumlah: 0,
                        unit: "",
                        status: "pending",
                        tanggalDipesan: "",
                        tanggalDatang: "",
                        createdBy: "",
                      });
                      window.history.pushState({ tab: "spareparts", modal: "sparepartForm" }, "", "#spareparts");
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors hover-lift"
                  >
                    <Plus size={20} />
                    {t("newSparepart")}
                  </button>
                </div>
              </div>

              {/* Sparepart List */}
              <div className="space-y-4">
                {spareparts.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                    Belum ada sparepart yang diorder
                  </p>
                ) : (
                  spareparts.map((part) => (
                    <div
                      key={part.id}
                      onClick={() => handleSparepartCardClick(part)}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer card-transition hover-lift"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg text-gray-800 dark:text-white">
                              {part.namaPart}
                            </h3>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                part.status === "arrived"
                                  ? "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300"
                                  : part.status === "ordered"
                                  ? "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300"
                                  : "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300"
                              }`}
                            >
                              {part.status === "arrived"
                                ? "Sudah Datang"
                                : part.status === "ordered"
                                ? "Sudah Dipesan"
                                : "Belum Dipesan"}
                            </span>
                          </div>
                          {part.deskripsi && (
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 whitespace-pre-wrap">
                              {part.deskripsi}
                            </p>
                          )}
                          <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-semibold">
                              Jumlah: {part.jumlah} {part.unit}
                            </span>
                          </div>
                          {part.tanggalDipesan && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 flex items-center gap-1">
                              <Calendar size={12} className="text-blue-500" />
                              <span className="font-medium">Dipesan:</span>{" "}
                              {new Date(part.tanggalDipesan).toLocaleDateString(
                                "id-ID",
                                {
                                  weekday: "short",
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                            </p>
                          )}
                          {part.tanggalDatang && (
                            <p className="text-xs text-green-600 dark:text-green-400 mt-1 font-semibold flex items-center gap-1">
                              <CheckCircle size={12} className="text-green-500" />
                              <span>Datang:</span>{" "}
                              {new Date(part.tanggalDatang).toLocaleDateString(
                                "id-ID",
                                {
                                  weekday: "short",
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                            </p>
                          )}
                          {!part.tanggalDipesan && part.status === "pending" && (
                            <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2 flex items-center gap-1">
                              <Clock size={12} />
                              <span className="italic">Belum ada tanggal pemesanan</span>
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col gap-2 ml-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditSparepart(part);
                            }}
                            disabled={saving}
                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                            title="Edit Sparepart Info"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSparepart(part.id);
                            }}
                            disabled={saving}
                            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                            title="Hapus Sparepart"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Sparepart Form Modal */}
        {showSparepartForm && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[100] modal-backdrop" onClick={() => {
            setShowSparepartForm(false);
            setEditingSparepartId(null);
            setSparepartFormData({
              namaPart: "",
              deskripsi: "",
              jumlah: 0,
              unit: "",
              status: "pending",
              tanggalDipesan: "",
              tanggalDatang: "",
              createdBy: "",
            });
          }}>
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-6 py-4 flex justify-between items-center z-10">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  {editingSparepartId
                    ? t("editSparepart")
                    : t("createSparepart")}
                </h2>
                <button
                  onClick={() => {
                    setShowSparepartForm(false);
                    setEditingSparepartId(null);
                    setSparepartFormData({
                      namaPart: "",
                      deskripsi: "",
                      jumlah: 0,
                      unit: "",
                      status: "pending",
                      tanggalDipesan: "",
                      tanggalDatang: "",
                      createdBy: "",
                    });
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    {t("partName")} *
                  </label>
                  <input
                    type="text"
                    name="namaPart"
                    value={sparepartFormData.namaPart}
                    onChange={handleSparepartInputChange}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Contoh: Bearing SKF 6205"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    {t("description")}
                  </label>
                  <textarea
                    name="deskripsi"
                    value={sparepartFormData.deskripsi}
                    onChange={handleSparepartInputChange}
                    rows={3}
                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Detail spesifikasi atau catatan tambahan"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      {t("quantity")} *
                    </label>
                    <input
                      type="number"
                      name="jumlah"
                      value={sparepartFormData.jumlah}
                      onChange={handleSparepartInputChange}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      {t("unit")}
                    </label>
                    <input
                      type="text"
                      name="unit"
                      value={sparepartFormData.unit}
                      onChange={handleSparepartInputChange}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="pcs, set, unit, dll"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSparepartSubmit}
                    disabled={saving}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50"
                  >
                    {editingSparepartId ? t("update") : t("save")}
                  </button>
                  <button
                    onClick={() => {
                      setShowSparepartForm(false);
                      setEditingSparepartId(null);
                      setSparepartFormData({
                        namaPart: "",
                        deskripsi: "",
                        jumlah: 0,
                        unit: "",
                        status: "pending",
                        tanggalDipesan: "",
                        tanggalDatang: "",
                        createdBy: "",
                      });
                    }}
                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white"
                  >
                    Batal
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sparepart Date Edit Modal */}
        {showSparepartDateModal && selectedSparepart && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[100] modal-backdrop">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full shadow-2xl modal-content max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-6 py-4 flex justify-between items-center z-10">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  Update Status Sparepart
                </h2>
                <button
                  onClick={() => {
                    setShowSparepartDateModal(false);
                    setSelectedSparepart(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Sparepart Info Display (Read-only) */}
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-lg text-gray-800 dark:text-white mb-2">
                    {selectedSparepart.namaPart}
                  </h3>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <p>
                      <span className="font-medium">Jumlah:</span> {selectedSparepart.jumlah} {selectedSparepart.unit}
                    </p>
                    {selectedSparepart.deskripsi && (
                      <p>
                        <span className="font-medium">Deskripsi:</span> {selectedSparepart.deskripsi}
                      </p>
                    )}
                  </div>
                </div>

                {/* Status & Date Management Section */}
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                  <h3 className="font-semibold text-lg text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                    <Calendar size={18} className="text-purple-600" />
                    Status & Tanggal
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Status Pemesanan
                      </label>
                      <select
                        value={selectedSparepart.status}
                        onChange={(e) => {
                          const newStatus = e.target.value;
                          setSelectedSparepart({
                            ...selectedSparepart,
                            status: newStatus,
                            // Clear dates based on status
                            tanggalDipesan:
                              newStatus === "pending"
                                ? ""
                                : selectedSparepart.tanggalDipesan,
                            tanggalDatang:
                              newStatus === "pending" || newStatus === "ordered"
                                ? ""
                                : selectedSparepart.tanggalDatang,
                          });
                        }}
                        className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        <option value="pending">Belum Dipesan</option>
                        <option value="ordered">Sudah Dipesan</option>
                        <option value="arrived">Sudah Datang</option>
                      </select>
                    </div>

                    {/* Conditional Date Fields based on Status */}
                    {selectedSparepart.status === "ordered" && (
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                          Tanggal Dipesan <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={selectedSparepart.tanggalDipesan || ""}
                          onChange={(e) =>
                            setSelectedSparepart({
                              ...selectedSparepart,
                              tanggalDipesan: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          required
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Masukkan tanggal saat sparepart dipesan
                        </p>
                      </div>
                    )}

                    {selectedSparepart.status === "arrived" && (
                      <>
                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                            Tanggal Dipesan
                          </label>
                          <input
                            type="date"
                            value={selectedSparepart.tanggalDipesan || ""}
                            onChange={(e) =>
                              setSelectedSparepart({
                                ...selectedSparepart,
                                tanggalDipesan: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Opsional: Tanggal saat sparepart dipesan
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                            Tanggal Datang <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="date"
                            value={selectedSparepart.tanggalDatang || ""}
                            onChange={(e) =>
                              setSelectedSparepart({
                                ...selectedSparepart,
                                tanggalDatang: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            required
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Masukkan tanggal saat sparepart tiba
                          </p>
                        </div>
                      </>
                    )}

                    {selectedSparepart.status === "pending" && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <p className="text-sm text-blue-800 dark:text-blue-300">
                          <strong>Status: Belum Dipesan</strong>
                          <br />
                          Sparepart belum dipesan. Ubah status ke "Sudah Dipesan"
                          untuk memasukkan tanggal pemesanan.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleUpdateSparepartDates}
                    disabled={saving}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50"
                  >
                    Simpan
                  </button>
                  <button
                    onClick={() => {
                      setShowSparepartDateModal(false);
                      setSelectedSparepart(null);
                    }}
                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white"
                  >
                    Batal
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Repairs Tab */}
        {activeTab === "repairs" && (
          <div className="space-y-6 tab-content">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 fade-in max-w-6xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  {t("repairs")}
                </h2>
                <div className="flex gap-3">
                  <button
                    onClick={handleDownloadRepairsExcel}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors"
                  >
                    <FileText size={18} />
                    {t("downloadExcel")}
                  </button>
                  <button
                    onClick={handleDownloadRepairsPDF}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors"
                  >
                    <FileText size={18} />
                    {t("downloadPDF")}
                  </button>
                  <button
                    onClick={() => {
                      setShowRepairForm(true);
                      setEditingRepairId(null);
                      setRepairFormData({
                        itemRepair: "",
                        tanggalMasuk: "",
                        tanggalMulai: "",
                        tanggalSelesai: "",
                        unitAlat: "",
                        lokasiOperasi: "",
                        deskripsiKerusakan: "",
                        status: "received",
                      });
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors hover-lift"
                  >
                    <Plus size={20} />
                    {t("newRepair")}
                  </button>
                </div>
              </div>

              {/* Repair List */}
              <div className="space-y-4">
                {filteredRepairs.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                    {t("noRepairs")}
                  </p>
                ) : (
                  filteredRepairs.map((repair) => (
                    <div
                      key={repair.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer card-transition hover-lift"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg text-gray-800 dark:text-white">
                              {repair.itemRepair}
                            </h3>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                repair.status === "completed"
                                  ? "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300"
                                  : repair.status === "in-progress"
                                  ? "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300"
                                  : "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300"
                              }`}
                            >
                              {repair.status === "completed"
                                ? t("statusCompleted")
                                : repair.status === "in-progress"
                                ? t("statusInProgress")
                                : t("statusReceived")}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                            <p>
                              <strong>{t("equipmentUnit")}:</strong> {repair.unitAlat}
                            </p>
                            <p>
                              <strong>{t("operatingLocation")}:</strong> {repair.lokasiOperasi}
                            </p>
                            <p>
                              <strong>{t("dateReceived")}:</strong>{" "}
                              {new Date(repair.tanggalMasuk).toLocaleDateString("id-ID")}
                            </p>
                            {repair.tanggalSelesai && (
                              <p>
                                <strong>{t("dateCompleted")}:</strong>{" "}
                                {new Date(repair.tanggalSelesai).toLocaleDateString("id-ID")}
                              </p>
                            )}
                          </div>
                          {repair.deskripsiKerusakan && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                              <strong>{t("damageDescription")}:</strong> {repair.deskripsiKerusakan}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col gap-2 ml-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditRepair(repair);
                            }}
                            disabled={saving}
                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                            title="Edit Repair"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteRepair(repair.id);
                            }}
                            disabled={saving}
                            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                            title="Hapus Repair"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Repair Form Modal */}
        {showRepairForm && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[100] modal-backdrop">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl modal-content">
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-6 py-4 flex justify-between items-center z-10">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  {editingRepairId ? t("editRepair") : t("createRepair")}
                </h2>
                <button
                  onClick={() => {
                    setShowRepairForm(false);
                    setEditingRepairId(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmitRepair} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      {t("repairItem")} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={repairFormData.itemRepair}
                      onChange={(e) =>
                        setRepairFormData({
                          ...repairFormData,
                          itemRepair: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      {t("equipmentUnit")} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={repairFormData.unitAlat}
                      onChange={(e) =>
                        setRepairFormData({
                          ...repairFormData,
                          unitAlat: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      {t("operatingLocation")} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={repairFormData.lokasiOperasi}
                      onChange={(e) =>
                        setRepairFormData({
                          ...repairFormData,
                          lokasiOperasi: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      {t("dateReceived")} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={repairFormData.tanggalMasuk}
                      onChange={(e) =>
                        setRepairFormData({
                          ...repairFormData,
                          tanggalMasuk: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      {t("dateStarted")}
                    </label>
                    <input
                      type="date"
                      value={repairFormData.tanggalMulai}
                      onChange={(e) =>
                        setRepairFormData({
                          ...repairFormData,
                          tanggalMulai: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      {t("dateCompleted")}
                    </label>
                    <input
                      type="date"
                      value={repairFormData.tanggalSelesai}
                      onChange={(e) =>
                        setRepairFormData({
                          ...repairFormData,
                          tanggalSelesai: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      {t("repairStatus")} <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={repairFormData.status}
                      onChange={(e) =>
                        setRepairFormData({
                          ...repairFormData,
                          status: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    >
                      <option value="received">{t("statusReceived")}</option>
                      <option value="in-progress">{t("statusInProgress")}</option>
                      <option value="completed">{t("statusCompleted")}</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      {t("damageDescription")} <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={repairFormData.deskripsiKerusakan}
                      onChange={(e) =>
                        setRepairFormData({
                          ...repairFormData,
                          deskripsiKerusakan: e.target.value,
                        })
                      }
                      rows={4}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50"
                  >
                    {saving ? t("saving") : editingRepairId ? t("update") : t("save")}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowRepairForm(false);
                      setEditingRepairId(null);
                    }}
                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white"
                  >
                    {t("cancel")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Footer Copyright */}
        <footer className="mt-12 py-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            © 2025 PT SALAM PACIFIC INDONESIA LINES. All rights reserved
          </div>
        </footer>
      </div>
      {/* End of Main Content */}
    </div>
  );
}
