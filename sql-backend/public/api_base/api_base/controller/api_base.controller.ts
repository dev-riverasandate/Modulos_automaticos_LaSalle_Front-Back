import { Request, Response } from 'express';
import ApiBaseService from '../services/[nom_proy].services';

const service = new ApiBaseService();

export default class ApiBaseController {
  static async getAll(req: Request, res: Response) {
    try {
      const data = await service.getAll();
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener los registros', error });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const data = await service.getById(id);
      if (!data) return res.status(404).json({ message: 'No encontrado' });
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener el registro', error });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      await service.create(req.body);
      res.status(201).json({ message: 'Creado correctamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al crear el registro', error });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      await service.update(id, req.body);
      res.json({ message: 'Actualizado correctamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar el registro', error });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      await service.delete(id);
      res.json({ message: 'Eliminado correctamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al eliminar el registro', error });
    }
  }
}