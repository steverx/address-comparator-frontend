import React, { useState } from 'react';
import { read, utils } from 'xlsx';
import { saveAs } from 'file-saver';

interface FileUploadProps {
  onDataLoaded: (data: any[], headers: string[]) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onDataLoaded }) => {
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const buffer = await file.arrayBuffer();
      const workbook = read(buffer);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = utils.sheet_to_json(worksheet);
      const headers = Object.keys(data[0] || {});

      onDataLoaded(data, headers);
    } catch (error) {
      console.error('Error reading Excel file:', error);
      alert('Error reading Excel file. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <label className="block">
        <span className="text-gray-700">Upload Excel File</span>
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileUpload}
          className="mt-1 block w-full"
          disabled={loading}
        />
      </label>
      {loading && (
        <div className="mt-2 text-blue-600">Loading file...</div>
      )}
    </div>
  );
};

export default FileUpload;