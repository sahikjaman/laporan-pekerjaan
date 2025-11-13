// api/spareparts.js
import { google } from "googleapis";

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const SHEET_NAME = "Spareparts";

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

    // GET - Ambil semua sparepart
    if (req.method === "GET") {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A2:J`,
      });

      const rows = response.data.values || [];
      const spareparts = rows.map((row) => ({
        id: row[0],
        namaPart: row[1],
        deskripsi: row[2],
        jumlah: parseInt(row[3]) || 0,
        unit: row[4],
        status: row[5] || "pending", // pending, ordered, arrived
        tanggalDipesan: row[6] || "",
        tanggalDatang: row[7] || "",
        createdBy: row[8] || "",
        createdAt: row[9] || "",
      }));

      return res.status(200).json({ success: true, data: spareparts });
    }

    // POST - Tambah sparepart baru
    if (req.method === "POST") {
      const { namaPart, deskripsi, jumlah, unit, createdBy } = req.body;
      const id = Date.now().toString();
      const createdAt = new Date().toISOString();

      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A2:J`,
        valueInputOption: "RAW",
        requestBody: {
          values: [
            [
              id,
              namaPart,
              deskripsi,
              jumlah,
              unit,
              "pending",
              "",
              "",
              createdBy,
              createdAt,
            ],
          ],
        },
      });

      return res.status(201).json({
        success: true,
        data: {
          id,
          namaPart,
          deskripsi,
          jumlah,
          unit,
          status: "pending",
          tanggalDipesan: "",
          tanggalDatang: "",
          createdBy,
          createdAt,
        },
      });
    }

    // PUT - Update sparepart
    if (req.method === "PUT") {
      const {
        id,
        namaPart,
        deskripsi,
        jumlah,
        unit,
        status,
        tanggalDipesan,
        tanggalDatang,
        createdBy,
        createdAt,
      } = req.body;

      const getResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A2:J`,
      });

      const rows = getResponse.data.values || [];
      const rowIndex = rows.findIndex((row) => row[0] === id);

      if (rowIndex === -1) {
        return res
          .status(404)
          .json({ success: false, error: "Sparepart tidak ditemukan" });
      }

      const sheetRow = rowIndex + 2;
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A${sheetRow}:J${sheetRow}`,
        valueInputOption: "RAW",
        requestBody: {
          values: [
            [
              id,
              namaPart,
              deskripsi,
              jumlah,
              unit,
              status,
              tanggalDipesan,
              tanggalDatang,
              createdBy,
              createdAt,
            ],
          ],
        },
      });

      return res.status(200).json({
        success: true,
        data: {
          id,
          namaPart,
          deskripsi,
          jumlah,
          unit,
          status,
          tanggalDipesan,
          tanggalDatang,
          createdBy,
          createdAt,
        },
      });
    }

    // DELETE - Hapus sparepart
    if (req.method === "DELETE") {
      const { id } = req.body;

      const getResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A2:J`,
      });

      const rows = getResponse.data.values || [];
      const rowIndex = rows.findIndex((row) => row[0] === id);

      if (rowIndex === -1) {
        return res
          .status(404)
          .json({ success: false, error: "Sparepart tidak ditemukan" });
      }

      const sheetRow = rowIndex + 2;
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [
            {
              deleteDimension: {
                range: {
                  sheetId: 0,
                  dimension: "ROWS",
                  startIndex: sheetRow - 1,
                  endIndex: sheetRow,
                },
              },
            },
          ],
        },
      });

      return res.status(200).json({ success: true });
    }

    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  } catch (error) {
    console.error("Spareparts API Error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
