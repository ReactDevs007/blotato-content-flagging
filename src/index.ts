import app from './server.js';

const PORT = process.env.PORT || 3000;

// Start server
app.listen(PORT, () => {
  console.log(`Content flagging server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API docs: http://localhost:${PORT}/api/docs`);
});

// Export the app for testing
export default app;
