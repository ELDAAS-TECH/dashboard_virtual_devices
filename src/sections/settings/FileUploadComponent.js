import React, { useState } from "react";
import { Stack, Typography, Button, Snackbar } from "@mui/material";
import * as XLSX from "xlsx";
import fileUploadPostApi from "../../services/settings/fileUploadPostApi";
import AlertPopup from "../../components/alert-popups/AlertPopup";

function FileUploadComponent() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState("No file chosen");
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setFileName(file ? file.name : "No file chosen");
  };
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleUpload = async () => {
    if (selectedFile) {
      const fileReader = new FileReader();

      fileReader.onload = async (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert Excel data to JSON format
        const excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Check if the Excel file has exactly 2 columns with headers "uuid" and "key"
        if (
          excelData.length !== 3 ||
          excelData[0].length !== 2 ||
          excelData[0][0] !== "uuid" ||
          excelData[0][1] !== "key"
        ) {
          console.error("Invalid format or headers");
          return;
        }

        // Process the data
        const tuya_credentials_list = excelData.slice(1);

        console.log("Processed data uploaded successfully:", tuya_credentials_list);
        try {
          const response = await fileUploadPostApi(tuya_credentials_list);

          if (response) {
            setSnackbarMessage("Uploaded Tuya credentials successfully");
            setSnackbarOpen(true);
          }
        } catch (error) {
          setSnackbarMessage("Error uploading processed data:");
          setSnackbarOpen(true);
          console.error("Error uploading processed data:", error);
        }
      };

      fileReader.readAsArrayBuffer(selectedFile);
    } else {
      console.log("No file selected");
    }
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Upload an Excel File</Typography>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileChange}
          style={{ display: "none" }}
          id="file-input"
        />
        <label htmlFor="file-input">
          <Button variant="contained" component="span">
            Choose File
          </Button>
        </label>
        <Typography>{fileName}</Typography>
        <Button
          variant="contained"
          color="primary"
          sx={{ minWidth: "100px" }}
          onClick={handleUpload}
        >
          Upload
        </Button>
      </Stack>
      {snackbarOpen && (
        <AlertPopup
          snackbarOpen={snackbarOpen}
          handleSnackbarClose={handleSnackbarClose}
          snackbarMessage={snackbarMessage}
        />
      )}
    </Stack>
  );
}

export default FileUploadComponent;
