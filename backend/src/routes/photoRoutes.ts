import { Router } from 'express';
import multer from 'multer';
import {
  uploadPhoto,
  getPhotosByJob,
  getPhotosByEmployee,
  getAllPhotos,
  updatePhoto,
  deletePhoto,
  bulkSelectForClientPortal,
  bulkTagUpdate,
  updatePhotoWithAnnotation,
  restoreOriginalPhoto,
  getOriginalPhoto
} from '../controllers/photoController';

const router = Router();

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Routes
router.post('/upload', upload.array('files', 10), uploadPhoto);
router.get('/job/:jobId', getPhotosByJob);
router.get('/employee/:employeeId', getPhotosByEmployee);
router.get('/all', getAllPhotos);
router.put('/:photoId', updatePhoto);
router.put('/:photoId/annotate', updatePhotoWithAnnotation);
router.get('/:photoId/original', getOriginalPhoto);
router.post('/:photoId/restore', restoreOriginalPhoto);
router.delete('/:photoId', deletePhoto);
router.post('/bulk/selectForClientPortal', bulkSelectForClientPortal);
router.post('/bulk/tag', bulkTagUpdate);

export default router;
