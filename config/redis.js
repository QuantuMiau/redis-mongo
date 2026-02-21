const { createClient } = require("redis");

// Construimos URL si hay password/username, de lo contrario usamos host/port
const REDIS_HOST = process.env.REDIS_HOST || "localhost";
const REDIS_PORT = process.env.REDIS_PORT || 6379;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || "";

let redisClient;
if (REDIS_PASSWORD) {
  redisClient = createClient({
    url: `redis://:${REDIS_PASSWORD}@${REDIS_HOST}:${REDIS_PORT}`,
  });
} else {
  redisClient = createClient({
    socket: { host: REDIS_HOST, port: REDIS_PORT },
  });
}

// eventos
redisClient.on("connect", () => {
  const isCloud =
    REDIS_HOST.includes("cloud.redislabs.com") || REDIS_HOST.includes("redis");
  const location = isCloud ? "☁️ en la nube" : "🎈 local";
  console.log(
    `🐸 Conexión a Redis exitosa ${location} (${REDIS_HOST}:${REDIS_PORT})`,
  );
});

redisClient.on("error", (err) => {
  console.error("⚠️ error en Redis:", err.message);
  if (err.message.includes("ECONNREFUSED")) {
    console.error(
      "Verifica que Redis esté corriendo o que las credenciales sean correctas.",
    );
  } else if (
    err.message.includes("WRONGPASS") ||
    err.message.includes("invalid password")
  ) {
    console.error(
      "Contraseña de Redis incorrecta, verifica REDIS_PASSWORD en .env",
    );
  } else if (err.message.includes("ENOTFOUND")) {
    console.error("Host de Redis no encontrado, verifica REDIS_HOST en .env");
  }
});

redisClient.on("reconnecting", () => {
  console.log("🔃 Intentando reconectar a Redis...");
});

const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log("✅ cliente redis conectado");
    return true;
  } catch (error) {
    console.error("❌ error conectando a redis:", error.message);
    throw error;
  }
};

const disconnectRedis = async () => {
  try {
    await redisClient.disconnect();
    console.log("🔌 cliente redis desconectado");
  } catch (error) {
    console.error("Error desconectando a redis", error.message);
  }
};

module.exports = {
  redisClient,
  connectRedis,
  disconnectRedis,
};
