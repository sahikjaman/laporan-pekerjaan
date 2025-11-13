import React, { useState, useEffect } from "react";
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
} from "lucide-react";

const API_URL = "/api/reports";
const TASK_API_URL = "/api/tasks";
const SPAREPART_API_URL = "/api/spareparts";

export default function LaporanPekerjaan() {
  const [reports, setReports] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [spareparts, setSpareparts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showSparepartForm, setShowSparepartForm] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingSparepartId, setEditingSparepartId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

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
      alert("Harap isi semua field yang wajib diisi");
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
          alert("Gagal mengupdate data: " + result.message);
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
          alert("Gagal menyimpan data: " + result.message);
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
      alert("Terjadi kesalahan saat menyimpan data.");
    } finally {
      setSaving(false);
    }
  };

  const handleTaskSubmit = async () => {
    if (!taskFormData.namaTask || !taskFormData.deskripsi) {
      alert("Harap isi nama task dan deskripsi");
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
      alert("Terjadi kesalahan saat menyimpan task.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (report) => {
    setFormData(report);
    setEditingId(report.id);
    setShowForm(true);
    setActiveTab("laporan");
    // Auto scroll to form
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
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
    setActiveTab("tasks");
    // Auto scroll to form
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  };

  const handleTaskCardClick = (task) => {
    setSelectedTask(task);
    setShowProgressModal(true);
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
  };

  const handleAddProgressLog = () => {
    if (!newProgressLog.deskripsi.trim()) {
      alert("Harap isi deskripsi progress");
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
      alert("Gagal menyimpan progress");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateProgressLog = () => {
    if (!newProgressLog.deskripsi.trim()) {
      alert("Harap isi deskripsi progress");
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
      alert("Harap isi nama part dan jumlah");
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
      alert("Gagal menyimpan sparepart");
    } finally {
      setSaving(false);
    }
  };

  const handleEditSparepart = (sparepart) => {
    setEditingSparepartId(sparepart.id);
    setSparepartFormData(sparepart);
    setShowSparepartForm(true);
  };

  const handleDeleteSparepart = async (id) => {
    if (!confirm("Yakin ingin menghapus sparepart ini?")) return;

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
      alert("Gagal menghapus sparepart");
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
        tanggalDipesan: newStatus === "ordered" ? new Date().toISOString().split("T")[0] : sparepart.tanggalDipesan,
        tanggalDatang: newStatus === "arrived" ? new Date().toISOString().split("T")[0] : sparepart.tanggalDatang,
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
      alert("Gagal update status sparepart");
    } finally {
      setSaving(false);
    }
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
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw
            className="animate-spin mx-auto mb-4 text-green-600 dark:text-green-400"
            size={48}
          />
          <div className="text-lg text-gray-600 dark:text-gray-300">
            Memuat data...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <div className="bg-white dark:bg-gray-800 shadow-md border-b-4 border-green-600 dark:border-green-500">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <img
                  src="/logo-spil.png"
                  alt="SPIL Logo"
                  className="w-16 h-16 object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800 dark:text-white">
                  HVE ELECTRICAL SPIL
                </h1>
              </div>
            </div>
            <div className="flex gap-2">
              {/* Theme Toggle Button */}
              <button
                onClick={cycleTheme}
                className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors"
                title={`Current: ${getThemeLabel()} - Click to change`}
              >
                {getThemeIcon()}
                <span className="hidden md:inline text-sm">
                  {getThemeLabel()}
                </span>
              </button>
              <button
                onClick={loadReports}
                disabled={loading}
                className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors"
              >
                <RefreshCw
                  size={18}
                  className={loading ? "animate-spin" : ""}
                />
              </button>
              {activeTab === "laporan" && (
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors"
                >
                  <Plus size={18} />
                  Laporan Baru
                </button>
              )}
              {activeTab === "tasks" && (
                <button
                  onClick={() => setShowTaskForm(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors"
                >
                  <Plus size={18} />
                  Task Baru
                </button>
              )}
              {activeTab === "spareparts" && (
                <button
                  onClick={() => setShowSparepartForm(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors"
                >
                  <Plus size={18} />
                  Sparepart Baru
                </button>
              )}
            </div>
          </div>
          <div className="flex gap-4 border-t dark:border-gray-700">
            <button
              onClick={() => {
                setActiveTab("dashboard");
                setShowForm(false);
                setShowTaskForm(false);
              }}
              className={`px-4 py-3 font-semibold transition-colors ${
                activeTab === "dashboard"
                  ? "text-green-600 dark:text-green-400 border-b-2 border-green-600 dark:border-green-400"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
              }`}
            >
              <BarChart3 size={18} className="inline mr-2" />
              Dashboard
            </button>
            <button
              onClick={() => {
                setActiveTab("laporan");
                setShowTaskForm(false);
              }}
              className={`px-4 py-3 font-semibold transition-colors ${
                activeTab === "laporan"
                  ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
              }`}
            >
              <FileText size={18} className="inline mr-2" />
              Laporan
            </button>
            <button
              onClick={() => {
                setActiveTab("tasks");
                setShowForm(false);
              }}
              className={`px-4 py-3 font-semibold transition-colors ${
                activeTab === "tasks"
                  ? "text-green-600 dark:text-green-400 border-b-2 border-green-600 dark:border-green-400"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
              }`}
            >
              <ListTodo size={18} className="inline mr-2" />
              Task
            </button>
            <button
              onClick={() => {
                setActiveTab("spareparts");
                setShowForm(false);
                setShowTaskForm(false);
              }}
              className={`px-4 py-3 font-semibold transition-colors ${
                activeTab === "spareparts"
                  ? "text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
              }`}
            >
              <Wrench size={18} className="inline mr-2" />
              Sparepart
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-8">
        {saving && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 flex items-center gap-3">
              <RefreshCw
                className="animate-spin text-green-600 dark:text-green-400"
                size={24}
              />
              <span className="text-lg font-semibold dark:text-white">
                Menyimpan data...
              </span>
            </div>
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* Quick Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => {
                  setActiveTab("laporan");
                  setShowForm(true);
                  setShowTaskForm(false);
                }}
                className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white p-6 rounded-xl shadow-lg flex items-center justify-between transition-all hover:shadow-xl group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white bg-opacity-20 rounded-lg group-hover:scale-110 transition-transform">
                    <FileText size={32} />
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl font-bold">Buat Laporan Baru</h3>
                    <p className="text-sm text-blue-100">
                      Catat pekerjaan lapangan Anda
                    </p>
                  </div>
                </div>
                <Plus
                  size={32}
                  className="group-hover:rotate-90 transition-transform"
                />
              </button>

              <button
                onClick={() => {
                  setActiveTab("tasks");
                  setShowTaskForm(true);
                  setShowForm(false);
                }}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white p-6 rounded-xl shadow-lg flex items-center justify-between transition-all hover:shadow-xl group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white bg-opacity-20 rounded-lg group-hover:scale-110 transition-transform">
                    <ListTodo size={32} />
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl font-bold">Buat Task Baru</h3>
                    <p className="text-sm text-green-100">
                      Rencanakan pekerjaan Anda
                    </p>
                  </div>
                </div>
                <Plus
                  size={32}
                  className="group-hover:rotate-90 transition-transform"
                />
              </button>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
                    <FileText
                      className="text-indigo-600 dark:text-indigo-400"
                      size={24}
                    />
                  </div>
                  <TrendingUp
                    className="text-indigo-600 dark:text-indigo-400"
                    size={20}
                  />
                </div>
                <h3 className="text-gray-600 dark:text-gray-300 text-sm font-medium mb-1">
                  Total Laporan
                </h3>
                <p className="text-3xl font-bold text-gray-800 dark:text-white">
                  {totalReports}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-lg">
                    <CheckCircle
                      className="text-green-600 dark:text-green-400"
                      size={24}
                    />
                  </div>
                </div>
                <h3 className="text-gray-600 dark:text-gray-300 text-sm font-medium mb-1">
                  Task Selesai
                </h3>
                <p className="text-3xl font-bold text-gray-800 dark:text-white">
                  {completedTasks}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                    <Target
                      className="text-blue-600 dark:text-blue-400"
                      size={24}
                    />
                  </div>
                </div>
                <h3 className="text-gray-600 dark:text-gray-300 text-sm font-medium mb-1">
                  Task Berlangsung
                </h3>
                <p className="text-3xl font-bold text-gray-800 dark:text-white">
                  {ongoingTasks}
                </p>
              </div>
            </div>

            {/* Recent Reports & Top Locations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recent Reports */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                  Laporan Terbaru
                </h2>
                {recentReports.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    Belum ada laporan
                  </p>
                ) : (
                  <div className="space-y-3">
                    {recentReports.map((report) => (
                      <div
                        key={report.id}
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                        onClick={() => handleEdit(report)}
                      >
                        <h3 className="font-semibold text-gray-800 dark:text-white">
                          {report.namaProyek}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {report.lokasi}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(report.tanggal).toLocaleDateString("id-ID")}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Top Locations with Unit Names */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                  Lokasi Terbanyak
                </h2>
                {topLokasi.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    Belum ada data
                  </p>
                ) : (
                  <div className="space-y-3">
                    {topLokasi.map((item, index) => (
                      <div
                        key={item.lokasi}
                        className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
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
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                  Task Berlangsung (Prioritas)
                </h2>
                {tasks.filter((t) => t.progress < 100).length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    Tidak ada task berlangsung
                  </p>
                ) : (
                  <div className="space-y-3">
                    {tasks
                      .filter((t) => t.progress < 100)
                      .sort((a, b) => {
                        const priorityOrder = { high: 3, medium: 2, low: 1 };
                        return (priorityOrder[b.prioritas] || 0) - (priorityOrder[a.prioritas] || 0);
                      })
                      .slice(0, 5)
                      .map((task) => (
                        <div
                          key={task.id}
                          className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
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
                                { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
                              )}
                            </p>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Ongoing Tasks by Deadline */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                  Task Berlangsung (Deadline)
                </h2>
                {tasks.filter((t) => t.progress < 100 && t.deadline).length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    Tidak ada task dengan deadline
                  </p>
                ) : (
                  <div className="space-y-3">
                    {tasks
                      .filter((t) => t.progress < 100 && t.deadline)
                      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
                      .slice(0, 5)
                      .map((task) => (
                        <div
                          key={task.id}
                          className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
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
                              { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
                            )}
                          </p>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Completed Tasks */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                  Task Selesai
                </h2>
                {tasks.filter((t) => t.progress >= 100).length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    Belum ada task selesai
                  </p>
                ) : (
                  <div className="space-y-3">
                    {tasks
                      .filter((t) => t.progress >= 100)
                      .slice(0, 5)
                      .map((task) => (
                        <div
                          key={task.id}
                          className="p-4 border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 rounded-lg"
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
          </div>
        )}

        {/* Laporan Tab */}
        {activeTab === "laporan" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search
                    className="absolute left-3 top-3 text-gray-400 dark:text-gray-500"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Cari proyek, lokasi, kegiatan, atau unit alat..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  />
                </div>
              </div>
            </div>

            {showForm && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                  {editingId ? "Edit Laporan" : "Buat Laporan Baru"}
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Tanggal *
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
                        Lokasi *
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
                        Nama Proyek *
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
                        Jenis Kegiatan *
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
                        Unit Alat *
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
                        Jam Mulai
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
                        Jam Selesai
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
                      Deskripsi Pekerjaan *
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
                      Catatan Tambahan
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
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                    >
                      {saving ? (
                        <RefreshCw className="animate-spin" size={20} />
                      ) : (
                        <Check size={20} />
                      )}
                      {editingId ? "Update Laporan" : "Simpan Laporan"}
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={saving}
                      className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:bg-gray-100 text-gray-800 dark:text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                    >
                      <X size={20} />
                      Batal
                    </button>
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
                    {searchTerm
                      ? "Tidak ada laporan yang sesuai"
                      : "Belum ada laporan"}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {searchTerm
                      ? "Coba ubah kata kunci pencarian"
                      : 'Klik tombol "Laporan Baru" untuk mulai mendata pekerjaan'}
                  </p>
                </div>
              ) : (
                filteredReports.map((report) => (
                  <div
                    key={report.id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
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
                          onClick={() => handleEdit(report)}
                          disabled={saving}
                          className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 disabled:opacity-50 rounded-lg transition-colors"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(report.id)}
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
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search
                    className="absolute left-3 top-3 text-gray-400 dark:text-gray-500"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Cari task..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  />
                </div>
              </div>
            </div>

            {showTaskForm && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                  {editingTaskId ? "Edit Task" : "Buat Task Baru"}
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Nama Task *
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
                        Prioritas
                      </label>
                      <select
                        name="prioritas"
                        value={taskFormData.prioritas}
                        onChange={handleTaskInputChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="low">Rendah</option>
                        <option value="medium">Sedang</option>
                        <option value="high">Tinggi</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Deadline
                      </label>
                      <input
                        type="date"
                        name="deadline"
                        value={taskFormData.deadline}
                        onChange={handleTaskInputChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Progress (Otomatis dari Riwayat)
                      </label>
                      <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            Total Progress
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
                          Progress dihitung otomatis dari total riwayat progress
                          yang ditambahkan
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Deskripsi Task */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Deskripsi Task *
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

                  {/* Progress Logs Section */}
                  <div
                    className={`p-4 rounded-lg ${
                      editingLogId
                        ? "bg-blue-50 dark:bg-blue-900/20"
                        : "bg-gray-50 dark:bg-gray-700/50"
                    }`}
                  >
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                      {editingLogId ? "Edit Progress" : "Tambah Progress"}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
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
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                          Penambahan Progress (%)
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
                            (a, b) => new Date(b.tanggal) - new Date(a.tanggal)
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
                                      {new Date(log.tanggal).toLocaleDateString(
                                        "id-ID",
                                        {
                                          day: "numeric",
                                          month: "long",
                                          year: "numeric",
                                        }
                                      )}
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
            )}

            <div className="space-y-4">
              {filteredTasks.length === 0 ? (
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
                filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
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
                        <span className="hidden sm:inline">Update Progress</span>
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
                      .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))
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
                                onClick={() => handleDeleteProgressLog(log.id)}
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
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                Sparepart
              </h2>
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
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
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
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            📅 Dipesan:{" "}
                            {new Date(part.tanggalDipesan).toLocaleDateString(
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
                        {part.tanggalDatang && (
                          <p className="text-xs text-green-600 dark:text-green-400 mt-1 font-semibold">
                            ✅ Datang:{" "}
                            {new Date(part.tanggalDatang).toLocaleDateString(
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
                      <div className="flex flex-col gap-2 ml-4">
                        {part.status === "pending" && (
                          <button
                            onClick={() =>
                              handleUpdateSparepartStatus(part, "ordered")
                            }
                            disabled={saving}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold disabled:opacity-50"
                          >
                            Tandai Dipesan
                          </button>
                        )}
                        {part.status === "ordered" && (
                          <button
                            onClick={() =>
                              handleUpdateSparepartStatus(part, "arrived")
                            }
                            disabled={saving}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-semibold disabled:opacity-50"
                          >
                            Tandai Datang
                          </button>
                        )}
                        <button
                          onClick={() => handleEditSparepart(part)}
                          disabled={saving}
                          className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteSparepart(part.id)}
                          disabled={saving}
                          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-6 py-4 flex justify-between items-center z-10">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                {editingSparepartId ? "Edit Sparepart" : "Tambah Sparepart Baru"}
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
                  Nama Sparepart *
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
                  Deskripsi
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
                    Jumlah *
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
                    Satuan
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
                  {editingSparepartId ? "Update" : "Simpan"}
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

      {/* Footer Copyright */}
      <footer className="mt-12 py-6 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          © Copyright 2025
        </div>
      </footer>
    </div>
  );
}
