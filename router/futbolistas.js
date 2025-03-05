"use strict";
const express = require("express");
const router = express.Router();
const Futbolistas = require("../models/futbolistas");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// 📌 Configuración de multer para almacenar imágenes en `public/uploads/`
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Evita nombres duplicados
    }
});

const upload = multer({ storage: storage });

// 📌 Obtener todos los futbolistas
router.get("/", async (req, res) => {
    try {
        const arrayFutbolistas = await Futbolistas.find();
        res.render("futbolistas", {
            titulo: "Listado de Futbolistas",
            arrayFutbolistas
        });
    } catch (error) {
        console.error("❌ Error al obtener futbolistas:", error);
        res.status(500).send("Error al recuperar los futbolistas.");
    }
});

// 📌 Obtener un solo futbolista (Para el modal de edición)
router.get("/:id", async (req, res) => {
    try {
        const futbolista = await Futbolistas.findById(req.params.id);
        if (!futbolista) {
            return res.status(404).json({ estado: false, mensaje: "Futbolista no encontrado" });
        }
        res.json(futbolista); // Devuelve los datos en formato JSON para que los use el modal
    } catch (error) {
        console.error("❌ Error al obtener futbolista:", error);
        res.status(500).json({ estado: false, mensaje: "Error al obtener el futbolista." });
    }
});

// 📌 Crear un nuevo futbolista con imagen
router.post("/", upload.single("imagen"), async (req, res) => {
    try {
        const { id, nombre, posicion, nacionalidad } = req.body;
        const imagen = req.file ? `/uploads/${req.file.filename}` : "";

        const nuevoFutbolista = new Futbolistas({ id, nombre, posicion, nacionalidad, imagen });
        await nuevoFutbolista.save();

        res.status(201).json({ estado: true, mensaje: "Futbolista creado correctamente" });
    } catch (error) {
        console.error("❌ Error al agregar futbolista:", error);
        res.status(500).json({ estado: false, mensaje: "Error al guardar el futbolista en la base de datos." });
    }
});

// 📌 Actualizar un futbolista con imagen nueva
router.put("/:id", upload.single("imagen"), async (req, res) => {
    try {
        const { id, nombre, posicion, nacionalidad, imagenActual } = req.body;
        let imagen = imagenActual; // Mantener la imagen actual si no se sube una nueva

        // Buscar el futbolista antes de actualizar para eliminar la imagen antigua si es necesario
        const futbolista = await Futbolistas.findById(req.params.id);

        if (!futbolista) {
            return res.status(404).json({ estado: false, mensaje: "Futbolista no encontrado." });
        }

        // Si se sube una nueva imagen, eliminar la anterior del servidor
        if (req.file) {
            imagen = `/uploads/${req.file.filename}`;

            // Verificar que la imagen anterior no sea la predeterminada y eliminarla
            if (futbolista.imagen && futbolista.imagen !== "" && fs.existsSync("public" + futbolista.imagen)) {
                fs.unlinkSync("public" + futbolista.imagen); // Eliminar el archivo anterior
            }
        }

        // Actualizar futbolista con el nuevo ID y demás datos
        const futbolistaActualizado = await Futbolistas.findByIdAndUpdate(
            req.params.id,
            { id, nombre, posicion, nacionalidad, imagen },
            { new: true }
        );

        res.json({ estado: true, mensaje: "Futbolista actualizado", futbolista: futbolistaActualizado });
    } catch (error) {
        console.error("❌ Error al actualizar futbolista:", error);
        res.status(500).json({ estado: false, mensaje: "Error al actualizar el futbolista." });
    }
});


// 📌 Eliminar un futbolista
router.delete("/:id", async (req, res) => {
    try {
        const futbolistaEliminado = await Futbolistas.findByIdAndDelete(req.params.id);
        if (!futbolistaEliminado) {
            return res.status(404).json({ estado: false, mensaje: "No se encontró el futbolista." });
        }

        // Eliminar la imagen del servidor si existe
        if (futbolistaEliminado.imagen && fs.existsSync("public" + futbolistaEliminado.imagen)) {
            fs.unlinkSync("public" + futbolistaEliminado.imagen);
        }

        res.json({ estado: true, mensaje: "Futbolista eliminado" });
    } catch (error) {
        console.error("❌ Error al eliminar futbolista:", error);
        res.status(500).json({ estado: false, mensaje: "Error al eliminar el futbolista." });
    }
});

module.exports = router;
