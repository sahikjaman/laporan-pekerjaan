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
  AlertCircle,
  TrendingUp,
  Users,
  RefreshCw,
} from "lucide-react";

const API_URL = "/api/reports"; // Untuk production Vercel
// const API_URL = 'http://localhost:3000/api/reports'; // Untuk development

export default function LaporanPekerjaan() {
  const [reports, setReports] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("semua");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  const [formData, setFormData] = useState({
    tanggal: "",
    lokasi: "",
    namaProyek: "",
    jenisKegiatan: "",
    deskripsi: "",
    status: "berlangsung",
    jamMulai: "",
    jamSelesai: "",
    catatan: "",
  });

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      const result = await response.json();

      if (result.success) {
        setReports(result.data);
      } else {
        console.error("Gagal memuat data:", result.message);
      }
    } catch (error) {
      console.error("Error memuat data:", error);
      alert("Gagal memuat data. Silakan refresh halaman.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (
      !formData.tanggal ||
      !formData.lokasi ||
      !formData.namaProyek ||
      !formData.jenisKegiatan ||
      !formData.deskripsi
    ) {
      alert("Harap isi semua field yang wajib diisi");
      return;
    }

    setSaving(true);

    try {
      if (editingId) {
        // Update existing report
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
          await loadReports(); // Reload data
          setEditingId(null);
        } else {
          alert("Gagal mengupdate data: " + result.message);
        }
      } else {
        // Add new report
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
          await loadReports(); // Reload data
        } else {
          alert("Gagal menyimpan data: " + result.message);
        }
      }

      setFormData({
        tanggal: "",
        lokasi: "",
        namaProyek: "",
        jenisKegiatan: "",
        deskripsi: "",
        status: "berlangsung",
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

  const handleEdit = (report) => {
    setFormData(report);
    setEditingId(report.id);
    setShowForm(true);
    setActiveTab("laporan");
  };

  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin menghapus laporan ini?")) return;

    setSaving(true);

    try {
      const response = await fetch(`${API_URL}?id=${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        await loadReports(); // Reload data
      } else {
        alert("Gagal menghapus data: " + result.message);
      }
    } catch (error) {
      console.error("Error menghapus data:", error);
      alert("Terjadi kesalahan saat menghapus data.");
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
      deskripsi: "",
      status: "berlangsung",
      jamMulai: "",
      jamSelesai: "",
      catatan: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.namaProyek?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.lokasi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.jenisKegiatan?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === "semua" || report.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "berlangsung":
        return "bg-blue-100 text-blue-800";
      case "selesai":
        return "bg-green-100 text-green-800";
      case "tertunda":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const totalReports = reports.length;
  const selesaiCount = reports.filter((r) => r.status === "selesai").length;
  const berlangungCount = reports.filter(
    (r) => r.status === "berlangsung"
  ).length;
  const tertundaCount = reports.filter((r) => r.status === "tertunda").length;

  const recentReports = [...reports]
    .sort(
      (a, b) =>
        new Date(b.createdAt || b.tanggal) - new Date(a.createdAt || a.tanggal)
    )
    .slice(0, 5);

  const lokasiCount = reports.reduce((acc, report) => {
    acc[report.lokasi] = (acc[report.lokasi] || 0) + 1;
    return acc;
  }, {});
  const topLokasi = Object.entries(lokasiCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const kegiatanCount = reports.reduce((acc, report) => {
    acc[report.jenisKegiatan] = (acc[report.jenisKegiatan] || 0) + 1;
    return acc;
  }, {});
  const topKegiatan = Object.entries(kegiatanCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw
            className="animate-spin mx-auto mb-4 text-indigo-600"
            size={48}
          />
          <div className="text-lg text-gray-600">
            Memuat data dari Google Sheets...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <div className="bg-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-800">
                Laporan Pekerjaan Lapangan
              </h1>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold flex items-center gap-1">
                <Users size={14} />
                Google Sheets Real-time
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={loadReports}
                disabled={loading}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors"
                title="Refresh data"
              >
                <RefreshCw
                  size={18}
                  className={loading ? "animate-spin" : ""}
                />
              </button>
              <button
                onClick={() => {
                  setShowForm(true);
                  setActiveTab("laporan");
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors"
              >
                <Plus size={18} />
                Laporan Baru
              </button>
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
              Semua Laporan
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-8">
        {/* Info Banner */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <Users size={24} />
            <div>
              <h3 className="font-bold text-lg">
                Mode Kolaborasi Real-time dengan Google Sheets
              </h3>
              <p className="text-sm text-green-50">
                Semua data tersimpan di Google Sheets dan tersinkronisasi secara
                real-time untuk semua pengguna.
              </p>
            </div>
          </div>
        </div>

        {/* Loading Overlay */}
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                  Selesai
                </h3>
                <p className="text-3xl font-bold text-gray-800">
                  {selesaiCount}
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Clock className="text-blue-600" size={24} />
                  </div>
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">
                  Berlangsung
                </h3>
                <p className="text-3xl font-bold text-gray-800">
                  {berlangungCount}
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <AlertCircle className="text-yellow-600" size={24} />
                  </div>
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">
                  Tertunda
                </h3>
                <p className="text-3xl font-bold text-gray-800">
                  {tertundaCount}
                </p>
              </div>
            </div>

            {/* Recent Reports & Top Stats */}
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
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-800">
                            {report.namaProyek}
                          </h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                              report.status
                            )}`}
                          >
                            {report.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{report.lokasi}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(report.tanggal).toLocaleDateString("id-ID")}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Top Locations */}
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
                    {topLokasi.map(([lokasi, count], index) => (
                      <div
                        key={lokasi}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">
                              {lokasi}
                            </p>
                            <p className="text-xs text-gray-500">
                              {count} laporan
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-indigo-600 h-2 rounded-full"
                              style={{
                                width: `${(count / totalReports) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Top Activities */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Jenis Kegiatan Terbanyak
              </h2>
              {topKegiatan.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Belum ada data</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {topKegiatan.map(([kegiatan, count]) => (
                    <div
                      key={kegiatan}
                      className="p-4 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg text-center"
                    >
                      <p className="text-2xl font-bold text-indigo-600 mb-1">
                        {count}
                      </p>
                      <p className="text-sm font-medium text-gray-700">
                        {kegiatan}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Laporan Tab */}
        {activeTab === "laporan" && (
          <div className="space-y-6">
            {/* Search & Filter */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search
                    className="absolute left-3 top-3 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Cari proyek, lokasi, atau kegiatan..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="semua">Semua Status</option>
                  <option value="berlangsung">Berlangsung</option>
                  <option value="selesai">Selesai</option>
                  <option value="tertunda">Tertunda</option>
                </select>
              </div>
            </div>

            {/* Form Input */}
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
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="berlangsung">Berlangsung</option>
                      <option value="selesai">Selesai</option>
                      <option value="tertunda">Tertunda</option>
                    </select>
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

            {/* List Laporan */}
            <div className="space-y-4">
              {filteredReports.length === 0 ? (
                <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                  <FileText size={64} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    {searchTerm || filterStatus !== "semua"
                      ? "Tidak ada laporan yang sesuai"
                      : "Belum ada laporan"}
                  </h3>
                  <p className="text-gray-500">
                    {searchTerm || filterStatus !== "semua"
                      ? "Coba ubah filter atau kata kunci pencarian"
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
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-800">
                            {report.namaProyek}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                              report.status
                            )}`}
                          >
                            {report.status?.charAt(0).toUpperCase() +
                              report.status?.slice(1)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 font-medium">
                          {report.jenisKegiatan}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(report)}
                          disabled={saving}
                          className="p-2 text-blue-600 hover:bg-blue-50 disabled:opacity-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(report.id)}
                          disabled={saving}
                          className="p-2 text-red-600 hover:bg-red-50 disabled:opacity-50 rounded-lg transition-colors"
                          title="Hapus"
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
      </div>
    </div>
  );
}
