export const API_URL = 'https://address-comparator-backend-production.up.railway.app';

export async function apiRequest(endpoint, formData, isExport = false) {
  try {
    const fullUrl = `https://address-comparator-backend-production.up.railway.app/${endpoint}`;
    
    console.log('Full API Request URL:', fullUrl);
    console.log('Request Payload:', Object.fromEntries(formData.entries()));

    const response = await fetch(fullUrl, {
      method: 'POST',
      body: formData,
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Origin': 'https://address-comparator-frontend-production.up.railway.app'
      }
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(errorText || `HTTP error! status: ${response.status}`);
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