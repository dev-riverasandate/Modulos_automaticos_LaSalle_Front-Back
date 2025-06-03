import { Router } from 'express';
import MdNivelesController from '../controller/md_niveles.controller';

const router = Router();

router.get('/', MdNivelesController.getAll);
router.get('/:id', MdNivelesController.getById);
router.post('/', MdNivelesController.create);
router.put('/:id', MdNivelesController.update);
router.delete('/:id', MdNivelesController.delete);

export default router;