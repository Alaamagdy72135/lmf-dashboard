exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { username, password } = JSON.parse(event.body);

  // Replace with your real logic or environment variables
  const validUsername = process.env.ADMIN_USERNAME || 'admin';
  const validPassword = process.env.ADMIN_PASSWORD || 'admin123';

  if (username === validUsername && password === validPassword) {
    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const user = { username, role: 'admin' };
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        token,
        user
      })
    };
  } else {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Invalid credentials' })
    };
  }
}; 