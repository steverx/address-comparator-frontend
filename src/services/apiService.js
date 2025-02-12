export async function apiRequest(endpoint, formData, isExport = false) {
  try {
    const fullUrl = `${process.env.REACT_APP_API_URL}/${endpoint}`;
    console.log('Full API Request URL:', fullUrl);
    console.log('Request Payload:', formData);

    const response = await fetch(fullUrl, {
      method: 'POST',
      body: formData,
      mode: 'cors',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Origin': 'https://address-comparator-frontend-production.up.railway.app'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (isExport) {
      return response.blob();
    }
    return response.json();
  } catch (error) {
    console.error('Full API Request Error:', error);
    throw error;
  }
}