// api/reports.js
import { google } from "googleapis";

// Konfigurasi Google Sheets
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const SHEET_NAME = "Laporan";

// Setup Google Auth dari environment variable
const getGoogleAuth = () => {
  const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);

  return new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
};

// CORS Headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return res.status(200).json({});
  }

  try {
    const auth = getGoogleAuth();
    const sheets = google.sheets({ version: "v4", auth });

    // GET - Ambil semua data
    if (req.method === "GET") {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A2:L`,
      });

      const rows = response.data.values || [];
      const reports = rows.map((row) => ({
        id: row[0],
        tanggal: row[1],
        lokasi: row[2],
        namaProyek: row[3],
        jenisKegiatan: row[4],
        unitAlat: row[5],
        deskripsi: row[6],
        status: row[7],
        jamMulai: row[8],
        jamSelesai: row[9],
        catatan: row[10],
        createdAt: row[11],
      }));

      return res.status(200).json({ success: true, data: reports });
    }

    // POST - Tambah data baru
    if (req.method === "POST") {
      const data = req.body;
      const newRow = [
        data.id,
        data.tanggal,
        data.lokasi,
        data.namaProyek,
        data.jenisKegiatan,
        data.unitAlat || "",
        data.deskripsi,
        data.status,
        data.jamMulai || "",
        data.jamSelesai || "",
        data.catatan || "",
        data.createdAt,
      ];

      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A:L`,
        valueInputOption: "USER_ENTERED",
        resource: {
          values: [newRow],
        },
      });

      return res
        .status(201)
        .json({ success: true, message: "Data berhasil ditambahkan" });
    }

    // PUT - Update data
    if (req.method === "PUT") {
      const data = req.body;

      // Cari row dengan ID yang sama
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A2:A`,
      });

      const rows = response.data.values || [];
      const rowIndex = rows.findIndex((row) => row[0] === String(data.id));

      if (rowIndex === -1) {
        return res
          .status(404)
          .json({ success: false, message: "Data tidak ditemukan" });
      }

      const actualRowNumber = rowIndex + 2; // +2 karena array dimulai dari 0 dan header di row 1
      const updatedRow = [
        data.id,
        data.tanggal,
        data.lokasi,
        data.namaProyek,
        data.jenisKegiatan,
        data.unitAlat || "",
        data.deskripsi,
        data.status,
        data.jamMulai || "",
        data.jamSelesai || "",
        data.catatan || "",
        data.updatedAt || data.createdAt,
      ];

      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A${actualRowNumber}:L${actualRowNumber}`,
        valueInputOption: "USER_ENTERED",
        resource: {
          values: [updatedRow],
        },
      });

      return res
        .status(200)
        .json({ success: true, message: "Data berhasil diupdate" });
    }

    // DELETE - Hapus data
    if (req.method === "DELETE") {
      const { id } = req.query;

      // Cari row dengan ID yang sama
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A2:A`,
      });

      const rows = response.data.values || [];
      const rowIndex = rows.findIndex((row) => row[0] === String(id));

      if (rowIndex === -1) {
        return res
          .status(404)
          .json({ success: false, message: "Data tidak ditemukan" });
      }

      const actualRowNumber = rowIndex + 2;

      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        resource: {
          requests: [
            {
              deleteDimension: {
                range: {
                  sheetId: 0,
                  dimension: "ROWS",
                  startIndex: actualRowNumber - 1,
                  endIndex: actualRowNumber,
                },
              },
            },
          ],
        },
      });

      return res
        .status(200)
        .json({ success: true, message: "Data berhasil dihapus" });
    }

    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
      error: error.message,
    });
  }
}
