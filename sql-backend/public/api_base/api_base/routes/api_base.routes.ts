import { Router } from 'express';
import ApiBaseController from '../controller/[nom_proy].controller';

const router = Router();

router.get('/', ApiBaseController.getAll);
router.get('/:id', ApiBaseController.getById);
router.post('/', ApiBaseController.create);
router.put('/:id', ApiBaseController.update);
router.delete('/:id', ApiBaseController.delete);

export default router;