const app = require("./src/app");
const { connectDB } = require("./src/config/database");

const PORT = process.env.PORT || 3000;

// Start server
const startServer = async () => {
  try {
    // Solo conectar DB si no estamos en modo testing
    if (!process.env.TESTING_MODE) {
      // Connect to database
      await connectDB();
      console.log("✅ Database connected successfully");
    } else {
      console.log("⚠️  Running in TESTING_MODE - Database disabled");
    }
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📱 API URL: http://localhost:${PORT}/api`);
      console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();