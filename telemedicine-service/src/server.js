const app = require("./app");
require("dotenv").config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`
    ═══════════════════════════════════════
    🏥 Telemedicine Service
    ═══════════════════════════════════════
    📡 API: http://localhost:${PORT}
    🧪 Health: http://localhost:${PORT}/health
    🗄️  Database: PostgreSQL
    🎥 Video: Jitsi Meet
    ═══════════════════════════════════════
    `);
});
