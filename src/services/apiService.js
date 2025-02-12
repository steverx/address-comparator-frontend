// src/services/apiService.js
export const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000';

export async function apiRequest(endpoint, formData, isExport = false) {
  try {
    console.log('API Request:', {
      url: `${API_URL}/${endpoint}`,
      method: 'POST',
      formData: Object.fromEntries(formData.entries())
    });

    const response = await fetch(`${API_URL}/${endpoint}`, {
      method: 'POST',
      body: formData,
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(errorText || 'Operation failed');
    }

    // For debugging
    if (isExport) {
      const contentType = response.headers.get('content-type');
      console.log('Content-Type:', contentType);
    }

    if (isExport) {
      const blob = await response.blob();
      const filename = `address_matches_${new Date().toISOString().slice(0,10)}.xlsx`;
      return { blob, filename };
    }

    const jsonResponse = await response.json();
    console.log('JSON Response:', jsonResponse);
    return jsonResponse;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
}