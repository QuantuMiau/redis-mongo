const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      trim: true,
      minLenght: [3, "El nombre debe tener almenos 3 caracteres"],
      maxLenght: [100, "El nombre no puede tener mas de 100 caracteres"],
    },

    precio: {
      type: Number,
      required: [true, "El precio es obligatorio"],
      min: [0, "El precio no puede ser negativo"],
    },

    categoria: {
      type: String,
      required: [true, "La categoria es obligatoria"],
      trim: true,
      enum: {
        values: ["electronica", "ropa", "alimentos", "libros"],
        message:
          "La categoria debe ser una de las siguientes: electronica, ropa, alimentos, libros",
      },
    },

    stock: {
      type: Number,
      required: [true, "El stock es obligatorio"],
      min: [0, "El stock no puede ser negativo"],
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
