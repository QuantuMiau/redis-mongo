const mongoose = require("mongoose");

// conecta a mongo db a la uri especificada
const connectMongoDb = async () => {
  try {
    const mongoUri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/tienda";

    await mongoose.connect(mongoUri, {
      // mongoose v6+ no necesita estas opciones, pero las dejamos por compatibilidad
    });

    console.log("✅ conexión exitosa a mongoDB");
    return true;
  } catch (error) {
    console.error("❌ Error al conectar con mongoDb:", error.message);
    process.exit(1);
  }
};

const disconnectMongoDB = async () => {
  try {
    await mongoose.disconnect();
    console.log("🔌 desconectado de mongoDB");
  } catch (error) {
    console.error("Error al desconectar de mongoDB:", error.message);
  }
};

module.exports = {
  connectMongoDb,
  disconnectMongoDB,
};
