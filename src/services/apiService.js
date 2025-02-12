export const API_URL = process.env.REACT_APP_API_URL 
  ? `https://${process.env.REACT_APP_API_URL}` 
  : 'http://127.0.0.1:5000';

export async function apiRequest(endpoint, formData, isExport = false) {
  try {
    const fullUrl = `https://address-comparator-backend-production.up.railway.app/${endpoint}`;
    
    console.log('Full API Request URL:', fullUrl);
    console.log('Request Payload:', Object.fromEntries(formData.entries()));

    const response = await fetch(fullUrl, {
      method: 'POST',
      body: formData,
      headers: {
        'Origin': 'https://address-comparator-frontend-production.up.railway.app'
      }
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(errorText || 'Operation failed');
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
    console.error('Full API Request Error:', error);
    throw error;
  }
}