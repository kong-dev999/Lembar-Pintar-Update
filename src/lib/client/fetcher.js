const fetcher = async (url) => {
  // Get Cognito token from localStorage (set during login)
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('cognito_id_token')
    : null;

  const headers = {
    'Content-Type': 'application/json',
  };

  // Add Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { headers });

  if (!response.ok) {
    const error = new Error('An error occurred while fetching the data.');
    error.status = response.status;
    throw error;
  }

  return response.json();
};

export default fetcher;

