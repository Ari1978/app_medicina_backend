// src/controllers/carrito.controller.js
import { CarritoService } from "../services/carrito.service.js";
import { carritoItemDTO } from "../dto/carrito.dto.js";

export const CarritoController = {
  async getCarrito(req, res) {
    try {
      const userId = req.user._id;
      const turnos = await CarritoService.getCarrito(userId);
      return res.status(200).json(turnos.map(carritoItemDTO));
    } catch (err) {
      console.error("❌ [CarritoController] getCarrito:", err);
      return res.status(500).json({ message: err.message });
    }
  },

  async addToCarrito(req, res) {
    try {
      const userId = req.user._id;
      const turno = await CarritoService.addTurno(userId, req.body);
      return res.status(201).json(carritoItemDTO(turno));
    } catch (err) {
      console.error("❌ [CarritoController] addToCarrito:", err);
      return res.status(400).json({ message: err.message });
    }
  },

  async deleteTurnoCarrito(req, res) {
    try {
      const userId = req.user._id;
      const { id } = req.params;
      await CarritoService.eliminarTurno(userId, id);
      return res
        .status(200)
        .json({ message: "🗑️ Turno eliminado correctamente" });
    } catch (err) {
      console.error("❌ [CarritoController] deleteTurnoCarrito:", err);
      return res.status(400).json({ message: err.message });
    }
  },

  async clearCarrito(req, res) {
    try {
      const userId = req.user._id;
      await CarritoService.vaciarCarrito(userId);
      return res
        .status(200)
        .json({ message: "🧹 Carrito vaciado correctamente" });
    } catch (err) {
      console.error("❌ [CarritoController] clearCarrito:", err);
      return res.status(500).json({ message: err.message });
    }
  },

  async confirmarCarrito(req, res) {
    try {
      const userId = req.user._id;
      const result = await CarritoService.confirmarCarrito(userId);
      return res.status(200).json({
        message: "✅ Turnos confirmados correctamente",
        count: result.modifiedCount || 0,
      });
    } catch (err) {
      console.error("❌ [CarritoController] confirmarCarrito:", err);
      return res.status(500).json({ message: err.message });
    }
  },
};
