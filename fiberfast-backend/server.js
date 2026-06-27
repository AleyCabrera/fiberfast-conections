// server.js - Servidor principal
require("dotenv").config();

const app = require("./src/app");
const { initTables } = require("./src/config/init-tables");

const PORT = process.env.PORT || 3000;

// Inicializar base de datos
async function initializeDatabase() {
  try {
    console.log("📦 Inicializando base de datos...");
    await initTables();
    console.log("✅ Base de datos inicializada correctamente");
  } catch (error) {
    console.error("❌ Error inicializando base de datos:", error.message);
    console.log("⚠️  Continuando sin base de datos (modo memoria)");
  }
}

// Iniciar servidor
async function startServer() {
  await initializeDatabase();

  const server = app.listen(PORT, () => {
    console.log("\n" + "=".repeat(60));
    console.log("🚀 FIBERFAST BACKEND");
    console.log("=".repeat(60));
    console.log(`📡 Puerto: ${PORT}`);
    console.log(`🌐 Entorno: ${process.env.NODE_ENV || "development"}`);
    console.log(
      `🗄️  Base de datos: ${process.env.DB_HOST ? "MySQL" : "Memoria"}`,
    );
    console.log("=".repeat(60));
    console.log("\n📋 ENDPOINTS PRINCIPALES:");
    console.log(`📍 Health: http://localhost:${PORT}/api/health`);
    console.log(`📍 API: http://localhost:${PORT}/api`);
    console.log(`📍 Auth: http://localhost:${PORT}/api/auth`);
    console.log(`📍 Planes: http://localhost:${PORT}/api/planes`);
    console.log(`📍 Solicitudes: http://localhost:${PORT}/api/solicitudes`);
    console.log(`📍 Tickets: http://localhost:${PORT}/api/tickets`);
    console.log(`📍 Admin: http://localhost:${PORT}/api/admin`);
    console.log("=".repeat(60) + "\n");
  });

  // Cierre graceful
  const shutdown = () => {
    console.log("\n👋 Cerrando servidor...");
    server.close(() => {
      console.log("✅ Servidor cerrado correctamente");
      process.exit(0);
    });
    setTimeout(() => {
      console.error("⚠️ Timeout - Forzando cierre");
      process.exit(1);
    }, 10000);
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

startServer();
