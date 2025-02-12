export async function apiRequest(endpoint, formData, isExport = false) {
  try {
    const fullUrl = `${process.env.REACT_APP_API_URL}/${endpoint}`;
    console.log('Full API Request URL:', fullUrl);
    
    const response = await fetch(fullUrl, {
      method: 'POST',
      body: formData,
      credentials: 'include',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response status:', response.status);
      console.error('Response error:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return isExport ? response.blob() : response.json();
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
}