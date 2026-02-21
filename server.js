require("dotenv").config();

const express = require("express");
const cors = require("cors");

const { connectMongoDb, disconnectMongoDB } = require("./config/mongodb");
const { connectRedis, disconnectRedis } = require("./config/redis");

const productsRoutes = require("./routes/products");

const app = express();

const PORT = process.env.PORT || 3000;

// middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// log simple
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.use("/api/products", productsRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "ruta no encontrada",
  });
});

const startServer = async () => {
  try {
    await connectMongoDb();
    await connectRedis();

    app.listen(PORT, () => {
      console.log(`🚀 Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("error al iniciar el servidor", err);
    process.exit(1);
  }
};

// manejar cierre limpio
process.on("SIGINT", async () => {
  console.log("\n🔔 SIGINT recibido — cerrando conexiones...");
  await disconnectRedis();
  await disconnectMongoDB();
  process.exit(0);
});

startServer();
