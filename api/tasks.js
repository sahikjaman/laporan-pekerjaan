// api/tasks.js
import { google } from "googleapis";

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const SHEET_NAME = "Tasks";

const getGoogleAuth = () => {
  const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
  return new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
};

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    return res.status(200).json({});
  }

  try {
    const auth = getGoogleAuth();
    const sheets = google.sheets({ version: "v4", auth });

    // GET - Ambil semua task
    if (req.method === "GET") {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A2:H`,
      });

      const rows = response.data.values || [];
      const tasks = rows.map((row) => ({
        id: row[0],
        namaTask: row[1],
        deskripsi: row[2],
        prioritas: row[3],
        deadline: row[4],
        progress: parseInt(row[5]) || 0,
        status: row[6],
        createdAt: row[7],
      }));

      return res.status(200).json({ success: true, data: tasks });
    }

    // POST - Tambah task baru
    if (req.method === "POST") {
      const data = req.body;
      const newRow = [
        data.id,
        data.namaTask,
        data.deskripsi,
        data.prioritas || "medium",
        data.deadline || "",
        data.progress || 0,
        data.progress >= 100 ? "selesai" : "berlangsung",
        data.createdAt,
      ];

      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A:H`,
        valueInputOption: "USER_ENTERED",
        resource: {
          values: [newRow],
        },
      });

      return res
        .status(201)
        .json({ success: true, message: "Task berhasil ditambahkan" });
    }

    // PUT - Update task
    if (req.method === "PUT") {
      const data = req.body;

      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A2:A`,
      });

      const rows = response.data.values || [];
      const rowIndex = rows.findIndex((row) => row[0] === String(data.id));

      if (rowIndex === -1) {
        return res
          .status(404)
          .json({ success: false, message: "Task tidak ditemukan" });
      }

      const actualRowNumber = rowIndex + 2;
      const updatedRow = [
        data.id,
        data.namaTask,
        data.deskripsi,
        data.prioritas || "medium",
        data.deadline || "",
        data.progress || 0,
        data.progress >= 100 ? "selesai" : "berlangsung",
        data.updatedAt || data.createdAt,
      ];

      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A${actualRowNumber}:H${actualRowNumber}`,
        valueInputOption: "USER_ENTERED",
        resource: {
          values: [updatedRow],
        },
      });

      return res
        .status(200)
        .json({ success: true, message: "Task berhasil diupdate" });
    }

    // DELETE - Hapus task
    if (req.method === "DELETE") {
      const { id } = req.query;

      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A2:A`,
      });

      const rows = response.data.values || [];
      const rowIndex = rows.findIndex((row) => row[0] === String(id));

      if (rowIndex === -1) {
        return res
          .status(404)
          .json({ success: false, message: "Task tidak ditemukan" });
      }

      const actualRowNumber = rowIndex + 2;

      // Get sheet info to find correct sheetId
      const sheetInfo = await sheets.spreadsheets.get({
        spreadsheetId: SPREADSHEET_ID,
      });

      const taskSheet = sheetInfo.data.sheets.find(
        (s) => s.properties.title === SHEET_NAME
      );
      const sheetId = taskSheet ? taskSheet.properties.sheetId : 1;

      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        resource: {
          requests: [
            {
              deleteDimension: {
                range: {
                  sheetId: sheetId,
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
        .json({ success: true, message: "Task berhasil dihapus" });
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
