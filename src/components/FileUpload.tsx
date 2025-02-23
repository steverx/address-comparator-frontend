import React, { useState } from 'react';
import { read, utils } from 'xlsx';
import { saveAs } from 'file-saver';
import { ComparisonResult } from '../types/address';

interface FileUploadProps {
  onDataLoaded: (data: Record<string, string>[], headers: string[]) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onDataLoaded }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = read(buffer);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = utils.sheet_to_json<Record<string, string>>(worksheet);
      const headers = Object.keys(data[0] || {});

      onDataLoaded(data, headers);
    } catch (error) {
      setError('Error reading file. Please check the file format.');
      console.error('File upload error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <input
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleFileUpload}
        className="block w-full"
        disabled={loading}
      />
      {error && <div className="mt-2 text-red-600">{error}</div>}
      {loading && <div className="mt-2 text-blue-600">Loading file...</div>}
    </div>
  );
};

export default FileUpload;