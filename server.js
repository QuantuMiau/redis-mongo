require(dotenv).config();

const express = require("express");
const cors = require("cors");

const { connectMongoDb, diconnectMongoDB } = require("./config/mongodb");
const { connectRedis, disconnectRedis } = require("/config/redis");

const productsRoutes = require("./routes/products");

const app = express();

const PORT = process.env.PORT || 3000;
// all origins in cors
app.use(cors());
// parse a json
app.use(express.json());
// parse a url encoded
app.use(express.urlencoded({ extended: true }));
// login simple muestra info de cada solicitud
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString}] ${req.method} ${req.path}`);
  next();
});

app.use("/api/products", productsRoutes);

app.use((req, res) => {
  res.status(400).json({
    success: falsel,
    messsage: "ruta no encontrada",
  });
});

const startServer = async () => {
  try {
    await connectMongoDb();

    await connectRedis();
  } catch (err) {
    console.log("error al iniciar el servidor " + err);
    process.exit(1);
  }
};

startServer();
