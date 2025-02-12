export async function apiRequest(endpoint, formData, isExport = false) {
  try {
      const fullUrl = `${process.env.REACT_APP_API_URL}/${endpoint}`;
      console.log('API Request URL:', fullUrl);
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

      // Add response debugging
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      return isExport ? response.blob() : response.json();
  } catch (error) {
      console.error('API Request Error:', error);
      throw error;
  }
}