export async function apiRequest(endpoint, formData, isExport = false) {
  try {
    const fullUrl = `${process.env.REACT_APP_API_URL}/${endpoint}`;
    console.log('Full API Request URL:', fullUrl);
    console.log('Request Payload:', formData);

    const response = await fetch(fullUrl, {
      method: 'POST',
      body: formData,
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response error:', errorText);
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