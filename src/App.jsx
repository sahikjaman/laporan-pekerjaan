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
} from "lucide-react";

const API_URL = "/api/reports";
const TASK_API_URL = "/api/tasks";

export default function LaporanPekerjaan() {
  const [reports, setReports] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

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
  });

  useEffect(() => {
    loadReports();
    loadTasks();
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
      });
      setShowTaskForm(false);
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
  };

  const handleEditTask = (task) => {
    setTaskFormData(task);
    setEditingTaskId(task.id);
    setShowTaskForm(true);
    setActiveTab("tasks");
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
    });
    setEditingTaskId(null);
    setShowTaskForm(false);
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw
            className="animate-spin mx-auto mb-4 text-indigo-600"
            size={48}
          />
          <div className="text-lg text-gray-600">Memuat data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <div className="bg-white shadow-md border-b-4 border-red-600">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <img
                  src="/logo-spil.png"
                  alt="SPIL Logo"
                  className="w-16 h-16 object-contain"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.parentElement.innerHTML =
                      '<div class="w-16 h-16 bg-red-600 rounded-lg flex items-center justify-center"><span class="text-white font-bold text-2xl">SPIL</span></div>';
                  }}
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  Laporan Pekerjaan Lapangan
                </h1>
                <p className="text-sm font-semibold text-gray-600 border-b-2 border-gray-800 inline-block">
                  HVE Electrical
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={loadReports}
                disabled={loading}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors"
              >
                <RefreshCw
                  size={18}
                  className={loading ? "animate-spin" : ""}
                />
              </button>
              {activeTab === "laporan" && (
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors"
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
            </div>
          </div>
          <div className="flex gap-4 border-t">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`px-4 py-3 font-semibold transition-colors ${
                activeTab === "dashboard"
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <BarChart3 size={18} className="inline mr-2" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("laporan")}
              className={`px-4 py-3 font-semibold transition-colors ${
                activeTab === "laporan"
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <FileText size={18} className="inline mr-2" />
              Laporan
            </button>
            <button
              onClick={() => setActiveTab("tasks")}
              className={`px-4 py-3 font-semibold transition-colors ${
                activeTab === "tasks"
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <ListTodo size={18} className="inline mr-2" />
              Task
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-8">
        {saving && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 flex items-center gap-3">
              <RefreshCw className="animate-spin text-indigo-600" size={24} />
              <span className="text-lg font-semibold">Menyimpan data...</span>
            </div>
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-3 bg-indigo-100 rounded-lg">
                    <FileText className="text-indigo-600" size={24} />
                  </div>
                  <TrendingUp className="text-indigo-600" size={20} />
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">
                  Total Laporan
                </h3>
                <p className="text-3xl font-bold text-gray-800">
                  {totalReports}
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CheckCircle className="text-green-600" size={24} />
                  </div>
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">
                  Task Selesai
                </h3>
                <p className="text-3xl font-bold text-gray-800">
                  {completedTasks}
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Target className="text-blue-600" size={24} />
                  </div>
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">
                  Task Berlangsung
                </h3>
                <p className="text-3xl font-bold text-gray-800">
                  {ongoingTasks}
                </p>
              </div>
            </div>

            {/* Recent Reports & Top Locations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recent Reports */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Laporan Terbaru
                </h2>
                {recentReports.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Belum ada laporan
                  </p>
                ) : (
                  <div className="space-y-3">
                    {recentReports.map((report) => (
                      <div
                        key={report.id}
                        className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => handleEdit(report)}
                      >
                        <h3 className="font-semibold text-gray-800">
                          {report.namaProyek}
                        </h3>
                        <p className="text-sm text-gray-600">{report.lokasi}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(report.tanggal).toLocaleDateString("id-ID")}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Top Locations with Unit Names */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Lokasi Terbanyak
                </h2>
                {topLokasi.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Belum ada data
                  </p>
                ) : (
                  <div className="space-y-3">
                    {topLokasi.map((item, index) => (
                      <div
                        key={item.lokasi}
                        className="p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">
                                {item.lokasi}
                              </p>
                              <p className="text-xs text-gray-500">
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
                                  className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full flex items-center gap-1"
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Ongoing Tasks */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Task Berlangsung
                </h2>
                {tasks.filter((t) => t.progress < 100).length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Tidak ada task berlangsung
                  </p>
                ) : (
                  <div className="space-y-3">
                    {tasks
                      .filter((t) => t.progress < 100)
                      .slice(0, 5)
                      .map((task) => (
                        <div
                          key={task.id}
                          className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => handleEditTask(task)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-gray-800">
                              {task.namaTask}
                            </h3>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(
                                task.prioritas
                              )}`}
                            >
                              {task.prioritas}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${task.progress}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-600">
                            {task.progress}% selesai
                          </p>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Completed Tasks */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Task Selesai
                </h2>
                {tasks.filter((t) => t.progress >= 100).length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
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
                          className="p-4 border border-green-200 bg-green-50 rounded-lg"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="text-green-600" size={20} />
                            <h3 className="font-semibold text-gray-800">
                              {task.namaTask}
                            </h3>
                          </div>
                          <p className="text-xs text-gray-600">
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
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search
                    className="absolute left-3 top-3 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Cari proyek, lokasi, kegiatan, atau unit alat..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {showForm && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  {editingId ? "Edit Laporan" : "Buat Laporan Baru"}
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Tanggal *
                      </label>
                      <input
                        type="date"
                        name="tanggal"
                        value={formData.tanggal}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Lokasi *
                      </label>
                      <input
                        type="text"
                        name="lokasi"
                        value={formData.lokasi}
                        onChange={handleInputChange}
                        placeholder="Contoh: Jakarta Pusat"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Nama Proyek *
                      </label>
                      <input
                        type="text"
                        name="namaProyek"
                        value={formData.namaProyek}
                        onChange={handleInputChange}
                        placeholder="Contoh: Instalasi Jaringan"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Jenis Kegiatan *
                      </label>
                      <input
                        type="text"
                        name="jenisKegiatan"
                        value={formData.jenisKegiatan}
                        onChange={handleInputChange}
                        placeholder="Contoh: Survey, Instalasi, Maintenance"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Unit Alat *
                      </label>
                      <input
                        type="text"
                        name="unitAlat"
                        value={formData.unitAlat}
                        onChange={handleInputChange}
                        placeholder="Contoh: Generator, Trafo, Panel"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div></div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Jam Mulai
                      </label>
                      <input
                        type="time"
                        name="jamMulai"
                        value={formData.jamMulai}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Jam Selesai
                      </label>
                      <input
                        type="time"
                        name="jamSelesai"
                        value={formData.jamSelesai}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Deskripsi Pekerjaan *
                    </label>
                    <textarea
                      name="deskripsi"
                      value={formData.deskripsi}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Jelaskan pekerjaan yang dilakukan..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Catatan Tambahan
                    </label>
                    <textarea
                      name="catatan"
                      value={formData.catatan}
                      onChange={handleInputChange}
                      rows={2}
                      placeholder="Kendala, material yang digunakan, dll (opsional)"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                      className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-800 px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
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
                <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                  <FileText size={64} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    {searchTerm
                      ? "Tidak ada laporan yang sesuai"
                      : "Belum ada laporan"}
                  </h3>
                  <p className="text-gray-500">
                    {searchTerm
                      ? "Coba ubah kata kunci pencarian"
                      : 'Klik tombol "Laporan Baru" untuk mulai mendata pekerjaan'}
                  </p>
                </div>
              ) : (
                filteredReports.map((report) => (
                  <div
                    key={report.id}
                    className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">
                          {report.namaProyek}
                        </h3>
                        <p className="text-sm text-gray-600 font-medium">
                          {report.jenisKegiatan}
                        </p>
                        {report.unitAlat && (
                          <div className="flex items-center gap-1 mt-1">
                            <Wrench size={14} className="text-orange-600" />
                            <span className="text-sm text-gray-600">
                              {report.unitAlat}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(report)}
                          disabled={saving}
                          className="p-2 text-blue-600 hover:bg-blue-50 disabled:opacity-50 rounded-lg transition-colors"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(report.id)}
                          disabled={saving}
                          className="p-2 text-red-600 hover:bg-red-50 disabled:opacity-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                      <div className="flex items-center gap-2 text-gray-600">
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
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin size={16} />
                        <span className="text-sm">{report.lokasi}</span>
                      </div>
                      {report.jamMulai && report.jamSelesai && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock size={16} />
                          <span className="text-sm">
                            {report.jamMulai} - {report.jamSelesai}
                          </span>
                          <span className="text-xs text-blue-600 font-semibold">
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

                    <div className="border-t pt-4">
                      <p className="text-gray-700 mb-2">
                        <span className="font-semibold">Deskripsi:</span>{" "}
                        {report.deskripsi}
                      </p>
                      {report.catatan && (
                        <p className="text-gray-600 text-sm">
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
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search
                    className="absolute left-3 top-3 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Cari task..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {showTaskForm && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  {editingTaskId ? "Edit Task" : "Buat Task Baru"}
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Nama Task *
                      </label>
                      <input
                        type="text"
                        name="namaTask"
                        value={taskFormData.namaTask}
                        onChange={handleTaskInputChange}
                        placeholder="Contoh: Maintenance Generator A"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Prioritas
                      </label>
                      <select
                        name="prioritas"
                        value={taskFormData.prioritas}
                        onChange={handleTaskInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="low">Rendah</option>
                        <option value="medium">Sedang</option>
                        <option value="high">Tinggi</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Deadline
                      </label>
                      <input
                        type="date"
                        name="deadline"
                        value={taskFormData.deadline}
                        onChange={handleTaskInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Progress (%)
                      </label>
                      <input
                        type="number"
                        name="progress"
                        value={taskFormData.progress}
                        onChange={handleTaskInputChange}
                        min="0"
                        max="100"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Deskripsi *
                    </label>
                    <textarea
                      name="deskripsi"
                      value={taskFormData.deskripsi}
                      onChange={handleTaskInputChange}
                      rows={3}
                      placeholder="Jelaskan detail task..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
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
                      className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-800 px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
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
                <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                  <ListTodo size={64} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    {searchTerm
                      ? "Tidak ada task yang sesuai"
                      : "Belum ada task"}
                  </h3>
                  <p className="text-gray-500">
                    {searchTerm
                      ? "Coba ubah kata kunci pencarian"
                      : 'Klik tombol "Task Baru" untuk mulai membuat task'}
                  </p>
                </div>
              ) : (
                filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-800">
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
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 flex items-center gap-1">
                              <CheckCircle size={14} />
                              Selesai
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {task.deskripsi}
                        </p>
                        {task.deadline && (
                          <div className="flex items-center gap-2 mt-2 text-gray-600">
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
                          onClick={() => handleEditTask(task)}
                          disabled={saving}
                          className="p-2 text-blue-600 hover:bg-blue-50 disabled:opacity-50 rounded-lg transition-colors"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          disabled={saving}
                          className="p-2 text-red-600 hover:bg-red-50 disabled:opacity-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold text-gray-700">
                          Progress
                        </span>
                        <span className="text-sm font-bold text-indigo-600">
                          {task.progress}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all ${
                            task.progress >= 100
                              ? "bg-green-600"
                              : "bg-blue-600"
                          }`}
                          style={{ width: `${task.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
