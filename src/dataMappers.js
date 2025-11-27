// Data Mappers untuk konversi antara format UI dan Supabase

// ============================================
// REPORTS MAPPERS
// ============================================

export const formDataToReport = (formData) => ({
  date: formData.tanggal,
  start_time: formData.jamMulai,
  end_time: formData.jamSelesai,
  location: formData.lokasi,
  project: formData.namaProyek,
  description: `${formData.jenisKegiatan} - ${formData.unitAlat}\n\n${formData.deskripsi}`,
  notes: formData.catatan || null,
});

export const reportToFormData = (report) => {
  const descParts = report.description.split('\n\n');
  const firstLine = descParts[0] || '';
  const [jenisKegiatan = '', unitAlat = ''] = firstLine.split(' - ');
  const deskripsi = descParts[1] || report.description;

  return {
    tanggal: report.date,
    jamMulai: report.start_time,
    jamSelesai: report.end_time,
    lokasi: report.location,
    namaProyek: report.project,
    jenisKegiatan,
    unitAlat,
    deskripsi,
    catatan: report.notes || '',
  };
};

export const reportToDisplay = (report) => {
  const descParts = report.description.split('\n\n');
  const firstLine = descParts[0] || '';
  const [jenisKegiatan = '', unitAlat = ''] = firstLine.split(' - ');
  const deskripsi = descParts[1] || report.description;

  return {
    id: report.id,
    tanggal: report.date,
    jamMulai: report.start_time,
    jamSelesai: report.end_time,
    lokasi: report.location,
    namaProyek: report.project,
    jenisKegiatan,
    unitAlat,
    deskripsi,
    catatan: report.notes,
    createdAt: report.created_at,
    updatedAt: report.updated_at,
  };
};

// ============================================
// TASKS MAPPERS
// ============================================

export const taskFormDataToTask = (formData) => ({
  title: formData.namaTask,
  description: formData.deskripsi,
  priority: capitalizeFirst(formData.prioritas),
  deadline: formData.deadline,
  progress: formData.progress || 0,
  status: formData.status || 'To Do',
});

export const taskToFormData = (task) => ({
  namaTask: task.title,
  deskripsi: task.description,
  prioritas: task.priority.toLowerCase(),
  deadline: task.deadline,
  progress: task.progress,
  status: task.status,
  progressLogs: [],
});

export const taskToDisplay = (task) => ({
  id: task.id,
  namaTask: task.title,
  deskripsi: task.description,
  prioritas: task.priority.toLowerCase(),
  status: task.status,
  progress: task.progress,
  deadline: task.deadline,
  progressLogs: [],
  createdAt: task.created_at,
  updatedAt: task.updated_at,
});

// ============================================
// PROGRESS LOGS MAPPERS
// ============================================

export const progressLogFormToData = (formData, taskId) => ({
  task_id: taskId,
  progress: formData.progress,
  note: formData.deskripsi,
});

export const progressLogToDisplay = (log) => ({
  id: log.id,
  tanggal: log.created_at.split('T')[0],
  deskripsi: log.note,
  progressIncrement: log.progress,
  createdAt: log.created_at,
});

// ============================================
// SPAREPARTS MAPPERS
// ============================================

export const sparepartFormDataToSparepart = (formData) => ({
  name: formData.namaPart,
  quantity: parseInt(formData.jumlah),
  unit: formData.unit,
  description: formData.deskripsi || null,
  status: capitalizeFirst(formData.status),
  order_date: formData.tanggalDipesan || null,
  arrival_date: formData.tanggalDatang || null,
});

export const sparepartToFormData = (sparepart) => ({
  namaPart: sparepart.name,
  jumlah: sparepart.quantity,
  unit: sparepart.unit,
  deskripsi: sparepart.description || '',
  status: sparepart.status.toLowerCase(),
  tanggalDipesan: sparepart.order_date || '',
  tanggalDatang: sparepart.arrival_date || '',
  createdBy: '',
});

export const sparepartToDisplay = (sparepart) => ({
  id: sparepart.id,
  namaPart: sparepart.name,
  jumlah: sparepart.quantity,
  unit: sparepart.unit,
  deskripsi: sparepart.description,
  status: sparepart.status.toLowerCase(),
  tanggalDipesan: sparepart.order_date,
  tanggalDatang: sparepart.arrival_date,
  createdAt: sparepart.created_at,
  updatedAt: sparepart.updated_at,
});

// ============================================
// REPAIRS MAPPERS
// ============================================

export const repairFormDataToRepair = (formData) => ({
  equipment: `${formData.itemRepair} - ${formData.unitAlat}`,
  issue: `${formData.deskripsiKerusakan}\n\nLokasi: ${formData.lokasiOperasi}\nTanggal Masuk: ${formData.tanggalMasuk}\nTanggal Mulai: ${formData.tanggalMulai}\nTanggal Selesai: ${formData.tanggalSelesai}`,
  status: capitalizeStatus(formData.status),
  priority: 'Medium',
  technician: null,
  notes: null,
});

export const repairToFormData = (repair) => {
  const [itemRepair = '', unitAlat = ''] = repair.equipment.split(' - ');
  const lines = repair.issue.split('\n');
  const deskripsiKerusakan = lines[0] || '';
  const lokasiMatch = repair.issue.match(/Lokasi: ([^\n]+)/);
  const tanggalMasukMatch = repair.issue.match(/Tanggal Masuk: ([^\n]+)/);
  const tanggalMulaiMatch = repair.issue.match(/Tanggal Mulai: ([^\n]+)/);
  const tanggalSelesaiMatch = repair.issue.match(/Tanggal Selesai: ([^\n]+)/);

  return {
    itemRepair,
    unitAlat,
    deskripsiKerusakan,
    lokasiOperasi: lokasiMatch ? lokasiMatch[1] : '',
    tanggalMasuk: tanggalMasukMatch ? tanggalMasukMatch[1] : '',
    tanggalMulai: tanggalMulaiMatch ? tanggalMulaiMatch[1] : '',
    tanggalSelesai: tanggalSelesaiMatch ? tanggalSelesaiMatch[1] : '',
    status: mapRepairStatus(repair.status),
  };
};

export const repairToDisplay = (repair) => {
  const formData = repairToFormData(repair);
  return {
    id: repair.id,
    ...formData,
    status: formData.status,
    createdAt: repair.created_at,
    updatedAt: repair.updated_at,
  };
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function capitalizeStatus(status) {
  const statusMap = {
    'received': 'Pending',
    'pending': 'Pending',
    'in-progress': 'In Progress',
    'in_progress': 'In Progress',
    'progress': 'In Progress',
    'completed': 'Completed',
    'done': 'Completed',
  };
  return statusMap[status.toLowerCase()] || 'Pending';
}

function mapRepairStatus(status) {
  const statusMap = {
    'Pending': 'received',
    'In Progress': 'in-progress',
    'Completed': 'completed',
  };
  return statusMap[status] || 'received';
}
