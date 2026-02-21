const { createClient, ReconnectStrategyError } = require("redis");

// Opciones de conexión para Redis con reconexión automática y manejo de errores
const redisOptions = {
  socket: {
    host: process.env.REDIS_HOST || "localhost",
    port: process.env.REDIS_PORT || 6379,
    ReconnectStrategy: (retries) => {
      if (retries > 10) {
        console.log("Numero maximo de intentos de reconexion a redis");
        return new Error("Maximo numero de reintentos alcanzado");
      }
      return Math.min(retries * 50, 500);
    },
  },
};

if (process.env.REDIS_USERNAME) {
  redisOptions.password = process.env.REDIS_PASSWORD;
}

// crear cliente de redis con las opciones configuradas
const redisClient = createClient(redisOptions);

// manejo de evento cuando se conecta aredis
redisClient.on("connect", () => {
  const host = process.env.REDIS_HOST || "localhost";
  const port = process.env.REDIS_PORT || 6379;
  const isCloud =
    host.includes("cloud.redislabs.com") || host.includes("redis");
  const location = isCloud ? "☁️ en la nube" : "🎈 local";

  console.log(`🐸 Conexion a redis exitosa ${location}`);
  console.log(`Host: ${host}:${port}`);
});

redisClient.on("error", (err) => {
  console.log("😑 error en el redis", err.message);

  // segurir soluciones segun el tipo de error
  if (err.message.includes("ECONNREFUSED")) {
    console.error(
      "🦭 verifica que redis este corriendo o que las credenciales sean correctas",
    );
  } else if (
    err.message.includes("WRONGPASS") ||
    err.message.includes("ERR invalidad password")
  ) {
    console.error(
      "🦭 Contrasena a Redis incorrecta, verifica REDIS_PASSWORD .env",
    );
  } else if (err.message.includes("ENOTFOUND")) {
    console.error("🦭 Host de redis no encontrado, verifica REDIS_HOST .env");
  }
});

// manejo de eventos de reconexion

redisClient.on("reconnecting", () => {
  const host = process.env.REDIS_HOST || "localhost";
  const isCloud = host.includes("cloud.redislab.com") || host.includes("redis");
  const location = isCloud ? "☁️ en la nube" : "🎈 local";

  console.log(`🔃 Intentando reconectar a Redis ${location}....`);
});

const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log("🐸 cliente redis conectado");
    return true;
  } catch (error) {
    console.err("😑 error conectando a redis", error.message);
  }
};

const disconnectRedis = async () => {
  try {
    await redisClient.disconnect();
    console.log("Cliente Redis desconectado");
  } catch (error) {
    console.error("Error desconectando a redis", error.message);
  }
};

module.exports = {
  redisClient,
  connectRedis,
  disconnectRedis,
};
