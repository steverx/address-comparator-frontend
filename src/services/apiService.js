// src/services/apiService.js
export const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000';

export async function apiRequest(endpoint, formData, isExport = false) {
  try {
    const response = await fetch(`${API_URL}/${endpoint}`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Operation failed');
    }

    if (isExport) {
      const blob = await response.blob();
      const filename = `address_matches_${new Date().toISOString().slice(0,10)}.xlsx`;
      return { blob, filename };
    }

    return response.json();
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
}