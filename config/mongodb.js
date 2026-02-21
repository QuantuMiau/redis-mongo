import { connect } from "mongoose";
// conecta a mongo db a la uri especificada

const connectMongoDb = async () => {
  try {
    const mongoUri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/tienda";

    await connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("conexio exitosa a mongoDB");
    return true;
  } catch (error) {
    console.log("Error al conectar con mongoDb: " + error.message);
    process.exit(1);
  }
};

const disconnectMongoDB = async () => {
  try {
    await mongoose.disconnect();
    console.log("desconectado de mongoDB");
  } catch (error) {
    console.log("Error al desconectar de mongoDB: " + error.message);
  }
};

module.exports = {
  connectMongoDb,
  disconnectMongoDB,
};
