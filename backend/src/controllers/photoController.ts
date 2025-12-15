import { Request, RequestHandler, Response } from 'express';
import { Photo } from '../models/Photo';
import { Jobs } from '../models/Jobs';
import { Employee } from '../models/Employee';
import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { Op } from 'sequelize';
import dotenv from 'dotenv';
import https from 'https';
import http from 'http';

dotenv.config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
});

// Upload photo
export const uploadPhoto: RequestHandler = async (req: Request, res: Response): Promise<any> => {
  try {
    const files = req.files as Express.Multer.File[];
    const { jobId, employeeId, notes, tags, visibility, selectedForClientPortal, selectedForReviewSuggestions, gpsLat, gpsLng } = req.body;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'At least one file is required.' });
    }

    if (!jobId) {
      return res.status(400).json({ error: 'jobId is required.' });
    }

    // Get employee name if employeeId provided
    let uploadedByName = 'Unknown';
    if (employeeId) {
      const employee: any = await Employee.findByPk(employeeId);
      if (employee) {
        uploadedByName = `${employee['First Name']} ${employee['Last Name']}`;
      }
    }

    const uploadedPhotos = [];

    for (const file of files) {
      const fileKey = `photos/jobs/${jobId}/${Date.now()}-${file.originalname}`;

      const upload = new Upload({
        client: s3Client,
        params: {
          Bucket: process.env.AWS_BUCKET_NAME!,
          Key: fileKey,
          Body: file.buffer,
          ContentType: file.mimetype,
        },
      });

      await upload.done();

      const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;

      // Determine file type
      const fileType = file.mimetype.startsWith('video/') ? 'video' : 'photo';

      // Parse tags if string
      let parsedTags = [];
      if (tags) {
        parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
      }

      const photo = await Photo.create({
        jobId,
        employeeId: employeeId || null,
        fileUrl,
        thumbnailUrl: fileUrl, // Use same URL for now
        uploadedByName,
        timestampUploaded: new Date(),
        gpsLat: gpsLat || null,
        gpsLng: gpsLng || null,
        tags: parsedTags,
        notes: notes || null,
        visibility: visibility || 'internal',
        selectedForClientPortal: selectedForClientPortal === 'true' || selectedForClientPortal === true,
        selectedForReviewSuggestions: selectedForReviewSuggestions === 'true' || selectedForReviewSuggestions === true,
        fileType,
        mimeType: file.mimetype,
        fileSizeBytes: file.size,
      });

      uploadedPhotos.push(photo);
    }

    return res.status(201).json({ 
      success: true, 
      photos: uploadedPhotos,
      message: `${uploadedPhotos.length} photo(s) uploaded successfully` 
    });

  } catch (error: any) {
    console.error('Upload Photo Error:', error);
    return res.status(500).json({ error: 'Photo upload failed.', details: error.message });
  }
};

// Get photos by job
export const getPhotosByJob: RequestHandler = async (req: Request, res: Response): Promise<any> => {
  try {
    const { jobId } = req.params;
    const { employeeId, startDate, endDate, visibility, fileType, tags, includeHidden } = req.query;

    const whereClause: any = { 
      jobId,
      delete: 'No'
    };

    // By default, hide photos with visibility 'hidden' unless includeHidden=true
    if (includeHidden !== 'true') {
      whereClause.visibility = { [Op.ne]: 'hidden' };
    }

    if (employeeId) {
      whereClause.employeeId = employeeId;
    }

    if (startDate && endDate) {
      whereClause.timestampUploaded = {
        [Op.between]: [new Date(startDate as string), new Date(endDate as string)]
      };
    }

    if (visibility && visibility !== 'hidden') {
      whereClause.visibility = visibility;
    }

    if (fileType) {
      whereClause.fileType = fileType;
    }

    if (tags) {
      const tagArray = typeof tags === 'string' ? tags.split(',') : tags;
      whereClause.tags = {
        [Op.contains]: tagArray
      };
    }

    const photos = await Photo.findAll({
      where: whereClause,
      include: [
        {
          model: Jobs,
          as: 'job',
          attributes: ['id', 'jobName', 'jobAddress']
        },
        {
          model: Employee,
          as: 'employee',
          attributes: ['id', 'First Name', 'Last Name']
        }
      ],
      order: [['timestampUploaded', 'DESC']]
    });

    return res.status(200).json({ 
      success: true, 
      photos,
      count: photos.length 
    });

  } catch (error: any) {
    console.error('Get Photos By Job Error:', error);
    return res.status(500).json({ error: 'Failed to fetch photos.', details: error.message });
  }
};

// Get photos by employee
export const getPhotosByEmployee: RequestHandler = async (req: Request, res: Response): Promise<any> => {
  try {
    const { employeeId } = req.params;

    const photos = await Photo.findAll({
      where: { 
        employeeId,
        delete: 'No',
        visibility: { [Op.ne]: 'hidden' }
      },
      include: [
        {
          model: Jobs,
          as: 'job',
          attributes: ['id', 'jobName', 'jobAddress']
        }
      ],
      order: [['timestampUploaded', 'DESC']]
    });

    return res.status(200).json({ 
      success: true, 
      photos,
      count: photos.length 
    });

  } catch (error: any) {
    console.error('Get Photos By Employee Error:', error);
    return res.status(500).json({ error: 'Failed to fetch photos.', details: error.message });
  }
};

// Get all photos (with filters)
export const getAllPhotos: RequestHandler = async (req: Request, res: Response): Promise<any> => {
  try {
    const { employeeId, startDate, endDate, visibility, fileType, jobId, search, includeHidden } = req.query;

    const whereClause: any = { delete: 'No' };

    // By default, hide photos with visibility 'hidden'
    if (includeHidden !== 'true') {
      whereClause.visibility = { [Op.ne]: 'hidden' };
    }

    if (employeeId) {
      whereClause.employeeId = employeeId;
    }

    if (jobId) {
      whereClause.jobId = jobId;
    }

    if (startDate && endDate) {
      whereClause.timestampUploaded = {
        [Op.between]: [new Date(startDate as string), new Date(endDate as string)]
      };
    }

    if (visibility && visibility !== 'hidden') {
      whereClause.visibility = visibility;
    }

    if (fileType) {
      whereClause.fileType = fileType;
    }

    if (search) {
      whereClause[Op.or] = [
        { notes: { [Op.like]: `%${search}%` } },
        { uploadedByName: { [Op.like]: `%${search}%` } }
      ];
    }

    const photos = await Photo.findAll({
      where: whereClause,
      include: [
        {
          model: Jobs,
          as: 'job',
          attributes: ['id', 'jobName', 'jobAddress']
        },
        {
          model: Employee,
          as: 'employee',
          attributes: ['id', 'First Name', 'Last Name']
        }
      ],
      order: [['timestampUploaded', 'DESC']]
    });

    return res.status(200).json({ 
      success: true, 
      photos,
      count: photos.length 
    });

  } catch (error: any) {
    console.error('Get All Photos Error:', error);
    return res.status(500).json({ error: 'Failed to fetch photos.', details: error.message });
  }
};

// Update photo
export const updatePhoto: RequestHandler = async (req: Request, res: Response): Promise<any> => {
  try {
    const { photoId } = req.params;
    const { notes, tags, visibility, selectedForClientPortal, selectedForReviewSuggestions } = req.body;

    const photo: any = await Photo.findByPk(photoId);

    if (!photo) {
      return res.status(404).json({ error: 'Photo not found.' });
    }

    const updateData: any = {};

    if (notes !== undefined) updateData.notes = notes;
    if (tags !== undefined) updateData.tags = tags;
    if (visibility !== undefined) updateData.visibility = visibility;
    if (selectedForClientPortal !== undefined) updateData.selectedForClientPortal = selectedForClientPortal;
    if (selectedForReviewSuggestions !== undefined) updateData.selectedForReviewSuggestions = selectedForReviewSuggestions;

    await photo.update(updateData);

    return res.status(200).json({ 
      success: true, 
      photo,
      message: 'Photo updated successfully' 
    });

  } catch (error: any) {
    console.error('Update Photo Error:', error);
    return res.status(500).json({ error: 'Failed to update photo.', details: error.message });
  }
};

// Delete photo (soft delete)
export const deletePhoto: RequestHandler = async (req: Request, res: Response): Promise<any> => {
  try {
    const { photoId } = req.params;

    const photo: any = await Photo.findByPk(photoId);

    if (!photo) {
      return res.status(404).json({ error: 'Photo not found.' });
    }

    await photo.update({ delete: 'Yes' });

    return res.status(200).json({ 
      success: true, 
      message: 'Photo deleted successfully' 
    });

  } catch (error: any) {
    console.error('Delete Photo Error:', error);
    return res.status(500).json({ error: 'Failed to delete photo.', details: error.message });
  }
};

// Bulk select for client portal
export const bulkSelectForClientPortal: RequestHandler = async (req: Request, res: Response): Promise<any> => {
  try {
    const { photoIds, selectedForClientPortal } = req.body;

    if (!photoIds || !Array.isArray(photoIds)) {
      return res.status(400).json({ error: 'photoIds array is required.' });
    }

    await Photo.update(
      { selectedForClientPortal },
      { where: { id: photoIds } }
    );

    return res.status(200).json({ 
      success: true, 
      message: `${photoIds.length} photo(s) updated successfully` 
    });

  } catch (error: any) {
    console.error('Bulk Select Error:', error);
    return res.status(500).json({ error: 'Bulk update failed.', details: error.message });
  }
};

// Bulk tag update
export const bulkTagUpdate: RequestHandler = async (req: Request, res: Response): Promise<any> => {
  try {
    const { photoIds, tagsToAdd, tagsToRemove } = req.body;

    if (!photoIds || !Array.isArray(photoIds)) {
      return res.status(400).json({ error: 'photoIds array is required.' });
    }

    const photos: any[] = await Photo.findAll({ where: { id: photoIds } });

    for (const photo of photos) {
      let currentTags = photo.tags || [];

      if (tagsToAdd && Array.isArray(tagsToAdd)) {
        currentTags = [...new Set([...currentTags, ...tagsToAdd])];
      }

      if (tagsToRemove && Array.isArray(tagsToRemove)) {
        currentTags = currentTags.filter((tag: string) => !tagsToRemove.includes(tag));
      }

      await photo.update({ tags: currentTags });
    }

    return res.status(200).json({ 
      success: true, 
      message: `${photoIds.length} photo(s) tags updated successfully` 
    });

  } catch (error: any) {
    console.error('Bulk Tag Update Error:', error);
    return res.status(500).json({ error: 'Bulk tag update failed.', details: error.message });
  }
};

// Create annotated version of photo (hides original, creates new record with link back)
// Now accepts annotations array and merges server-side to avoid CORS issues
export const updatePhotoWithAnnotation: RequestHandler = async (req: Request, res: Response): Promise<any> => {
  try {
    const { photoId } = req.params;
    const { annotations, displayWidth, displayHeight, imageData } = req.body;

    // Support both old (imageData) and new (annotations) format
    if (!imageData && (!annotations || annotations.length === 0)) {
      return res.status(400).json({ error: 'annotations array or imageData is required.' });
    }

    // Get the original photo
    const originalPhoto: any = await Photo.findByPk(photoId);

    if (!originalPhoto) {
      return res.status(404).json({ error: 'Photo not found.' });
    }

    // Check if this photo is already an annotated version - if so, find the TRUE original
    let trueOriginalId = originalPhoto.id;
    let currentPhoto = originalPhoto;
    
    // Trace back to find the TRUE original (for storing the reference)
    while (currentPhoto) {
      const parentMatch = currentPhoto.notes?.match(/\[originalId:(\d+)\]/);
      if (parentMatch) {
        trueOriginalId = parseInt(parentMatch[1]);
        currentPhoto = await Photo.findByPk(trueOriginalId);
      } else {
        // This is the true original
        trueOriginalId = currentPhoto.id;
        break;
      }
    }

    let buffer: Buffer;
    let contentType = 'image/png';

    if (imageData) {
      // Old format: base64 image already merged on client
      const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
      buffer = Buffer.from(base64Data, 'base64');
      const contentTypeMatch = imageData.match(/^data:(image\/\w+);base64,/);
      contentType = contentTypeMatch ? contentTypeMatch[1] : 'image/png';
    } else {
      // New format: merge annotations server-side
      // Handle both camelCase and snake_case column naming
      const imageUrl = originalPhoto.fileUrl || originalPhoto.file_url;
      console.log('Fetching original image from:', imageUrl);
      console.log('Annotations count:', annotations.length);
      console.log('Display dimensions:', displayWidth, 'x', displayHeight);
      console.log('Annotations data:', JSON.stringify(annotations));

      if (!imageUrl) {
        return res.status(400).json({ error: 'Original photo has no file URL.' });
      }

      // Fetch the original image
      const imageResponse = await new Promise<Buffer>((resolve, reject) => {
        const protocol = imageUrl.startsWith('https') ? https : http;
        protocol.get(imageUrl, (res) => {
          const chunks: Buffer[] = [];
          res.on('data', (chunk) => chunks.push(chunk));
          res.on('end', () => resolve(Buffer.concat(chunks)));
          res.on('error', reject);
        }).on('error', reject);
      });

      console.log('Original image fetched, size:', imageResponse.length);

      // Use canvas to draw annotations on the image
      const { createCanvas, loadImage } = require('canvas');
      const img = await loadImage(imageResponse);
      
      const canvas = createCanvas(img.width, img.height);
      const ctx = canvas.getContext('2d');

      // Draw original image
      ctx.drawImage(img, 0, 0);

      // Calculate scale factor
      const scaleX = img.width / displayWidth;
      const scaleY = img.height / displayHeight;

      console.log('Scale factors:', scaleX, scaleY);

      // Draw annotations
      annotations.forEach((ann: any) => {
        ctx.strokeStyle = ann.stroke || ann.fill || '#FF0000';
        ctx.fillStyle = ann.fill || ann.stroke || '#FF0000';
        ctx.lineWidth = (ann.strokeWidth || 3) * scaleX;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (ann.type === 'path') {
          ctx.beginPath();
          const commands = ann.d.split(/(?=[ML])/);
          commands.forEach((cmd: string) => {
            const parts = cmd.trim().split(' ');
            if (parts[0] === 'M') {
              ctx.moveTo(parseFloat(parts[1]) * scaleX, parseFloat(parts[2]) * scaleY);
            } else if (parts[0] === 'L') {
              ctx.lineTo(parseFloat(parts[1]) * scaleX, parseFloat(parts[2]) * scaleY);
            }
          });
          ctx.stroke();
        } else if (ann.type === 'arrow') {
          const x1 = ann.x1 * scaleX, y1 = ann.y1 * scaleY;
          const x2 = ann.x2 * scaleX, y2 = ann.y2 * scaleY;
          const headLength = 15 * scaleX;
          const angle = Math.atan2(y2 - y1, x2 - x1);

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(x2, y2);
          ctx.lineTo(x2 - headLength * Math.cos(angle - Math.PI / 6), y2 - headLength * Math.sin(angle - Math.PI / 6));
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(x2, y2);
          ctx.lineTo(x2 - headLength * Math.cos(angle + Math.PI / 6), y2 - headLength * Math.sin(angle + Math.PI / 6));
          ctx.stroke();
        } else if (ann.type === 'rectangle') {
          ctx.strokeRect(ann.x * scaleX, ann.y * scaleY, ann.width * scaleX, ann.height * scaleY);
        } else if (ann.type === 'circle') {
          ctx.beginPath();
          ctx.arc(ann.cx * scaleX, ann.cy * scaleY, ann.r * scaleX, 0, 2 * Math.PI);
          ctx.stroke();
        } else if (ann.type === 'text') {
          ctx.font = `bold ${(ann.fontSize || 18) * scaleX}px Arial`;
          ctx.fillText(ann.text, ann.x * scaleX, ann.y * scaleY);
        } else if (ann.type === 'measurement') {
          const x1 = ann.x1 * scaleX, y1 = ann.y1 * scaleY;
          const x2 = ann.x2 * scaleX, y2 = ann.y2 * scaleY;

          ctx.setLineDash([5 * scaleX, 5 * scaleX]);
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
          ctx.setLineDash([]);

          const midX = (x1 + x2) / 2;
          const midY = (y1 + y2) / 2;
          ctx.font = `bold ${(ann.strokeWidth || 3) * 5 * scaleX}px Arial`;
          const textWidth = ctx.measureText(ann.text).width;
          ctx.fillStyle = ann.stroke;
          ctx.fillRect(midX - textWidth / 2 - 5, midY - (ann.strokeWidth || 3) * 3 * scaleX, textWidth + 10, (ann.strokeWidth || 3) * 6 * scaleX);
          ctx.fillStyle = '#FFFFFF';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(ann.text, midX, midY);
          ctx.textAlign = 'left';
        }
      });

      console.log('Annotations drawn on canvas');

      // Convert canvas to buffer
      buffer = canvas.toBuffer('image/png');
      contentType = 'image/png';

      console.log('Canvas converted to buffer, size:', buffer.length);
    }

    const extension = contentType === 'image/jpeg' ? 'jpg' : 'png';

    // Create new S3 key for annotated image (root level, same as existing photos)
    const fileKey = `${Date.now()}-annotated.${extension}`;

    console.log('Uploading annotated image to S3:', fileKey);

    // Upload to S3
    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: fileKey,
        Body: buffer,
        ContentType: contentType,
      },
    });

    await upload.done();
    console.log('S3 upload completed successfully');

    const newFileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;

    // Hide the current photo (set visibility to 'hidden')
    await originalPhoto.update({ 
      visibility: 'hidden'
    });

    // Create NEW photo record with link to TRUE original (not the intermediate annotated version)
    const annotatedPhoto = await Photo.create({
      jobId: originalPhoto.jobId,
      employeeId: originalPhoto.employeeId,
      fileUrl: newFileUrl,
      thumbnailUrl: newFileUrl,
      uploadedByName: originalPhoto.uploadedByName,
      timestampUploaded: new Date(),
      gpsLat: originalPhoto.gpsLat,
      gpsLng: originalPhoto.gpsLng,
      tags: [...(originalPhoto.tags || []).filter((t: string) => t !== 'Annotated'), 'Annotated'],
      // Store TRUE original photo ID in notes for recovery (format: [originalId:123])
      notes: `[originalId:${trueOriginalId}]${originalPhoto.notes ? ' ' + originalPhoto.notes.replace(/\[originalId:\d+\]\s*/, '') : ''}`,
      visibility: originalPhoto.visibility === 'hidden' ? 'internal' : originalPhoto.visibility,
      selectedForClientPortal: originalPhoto.selectedForClientPortal,
      selectedForReviewSuggestions: originalPhoto.selectedForReviewSuggestions,
      fileType: 'photo',
      mimeType: contentType,
      fileSizeBytes: buffer.length,
    });

    return res.status(201).json({ 
      success: true, 
      photo: annotatedPhoto,
      originalPhotoId: trueOriginalId,
      message: 'Annotated photo created. Original photo is hidden but preserved.' 
    });

  } catch (error: any) {
    console.error('Update Photo With Annotation Error:', error);
    return res.status(500).json({ error: 'Failed to save annotated photo.', details: error.message });
  }
};

// Restore original photo (unhide TRUE original, delete ALL annotated versions in chain)
export const restoreOriginalPhoto: RequestHandler = async (req: Request, res: Response): Promise<any> => {
  try {
    const { photoId } = req.params;

    // Get the annotated photo
    const annotatedPhoto: any = await Photo.findByPk(photoId);

    if (!annotatedPhoto) {
      return res.status(404).json({ error: 'Photo not found.' });
    }

    // Extract original photo ID from notes [originalId:123]
    const match = annotatedPhoto.notes?.match(/\[originalId:(\d+)\]/);
    if (!match) {
      return res.status(400).json({ error: 'This photo does not have an original version to restore.' });
    }

    // Trace back to find the TRUE original (the one with no [originalId:X] in notes)
    let currentPhotoId = parseInt(match[1]);
    let trueOriginalPhoto: any = null;
    const annotatedPhotosToDelete: number[] = [parseInt(photoId)]; // Start with the current annotated photo

    while (currentPhotoId) {
      const photo: any = await Photo.findByPk(currentPhotoId);
      
      if (!photo) {
        return res.status(404).json({ error: `Photo in chain (ID: ${currentPhotoId}) not found.` });
      }

      // Check if this photo has an originalId (meaning it's also an annotated version)
      const parentMatch = photo.notes?.match(/\[originalId:(\d+)\]/);
      
      if (parentMatch) {
        // This is also an annotated photo, add to delete list and keep tracing
        annotatedPhotosToDelete.push(currentPhotoId);
        currentPhotoId = parseInt(parentMatch[1]);
      } else {
        // This is the TRUE original (no [originalId:X] in notes)
        trueOriginalPhoto = photo;
        break;
      }
    }

    if (!trueOriginalPhoto) {
      return res.status(404).json({ error: 'Could not find the original photo.' });
    }

    // Restore true original photo visibility
    await trueOriginalPhoto.update({ 
      visibility: 'internal'
    });

    // Soft delete ALL annotated photos in the chain
    for (const annotatedId of annotatedPhotosToDelete) {
      await Photo.update(
        { delete: 'Yes' },
        { where: { id: annotatedId } }
      );
    }

    return res.status(200).json({ 
      success: true, 
      restoredPhoto: trueOriginalPhoto,
      deletedAnnotatedPhotos: annotatedPhotosToDelete,
      message: 'Original photo restored successfully. All annotated versions have been removed.' 
    });

  } catch (error: any) {
    console.error('Restore Original Photo Error:', error);
    return res.status(500).json({ error: 'Failed to restore original photo.', details: error.message });
  }
};

// Get original photo for an annotated photo (returns TRUE original)
export const getOriginalPhoto: RequestHandler = async (req: Request, res: Response): Promise<any> => {
  try {
    const { photoId } = req.params;

    // Get the annotated photo
    const annotatedPhoto: any = await Photo.findByPk(photoId);

    if (!annotatedPhoto) {
      return res.status(404).json({ error: 'Photo not found.' });
    }

    // Extract original photo ID from notes [originalId:123]
    const match = annotatedPhoto.notes?.match(/\[originalId:(\d+)\]/);
    if (!match) {
      return res.status(400).json({ error: 'This photo does not have an original version.' });
    }

    // Trace back to find the TRUE original (the one with no [originalId:X] in notes)
    let currentPhotoId = parseInt(match[1]);
    let trueOriginalPhoto: any = null;

    while (currentPhotoId) {
      const photo: any = await Photo.findByPk(currentPhotoId);
      
      if (!photo) {
        return res.status(404).json({ error: `Photo in chain (ID: ${currentPhotoId}) not found.` });
      }

      // Check if this photo has an originalId (meaning it's also an annotated version)
      const parentMatch = photo.notes?.match(/\[originalId:(\d+)\]/);
      
      if (parentMatch) {
        // Keep tracing back
        currentPhotoId = parseInt(parentMatch[1]);
      } else {
        // This is the TRUE original (no [originalId:X] in notes)
        trueOriginalPhoto = photo;
        break;
      }
    }

    if (!trueOriginalPhoto) {
      return res.status(404).json({ error: 'Could not find the original photo.' });
    }

    return res.status(200).json({ 
      success: true, 
      originalPhoto: trueOriginalPhoto,
      message: 'Original photo found.' 
    });

  } catch (error: any) {
    console.error('Get Original Photo Error:', error);
    return res.status(500).json({ error: 'Failed to get original photo.', details: error.message });
  }
};

// Proxy image to avoid CORS issues when saving annotations
export const proxyImage: RequestHandler = async (req: Request, res: Response): Promise<any> => {
  try {
    const { photoId } = req.params;

    const photo: any = await Photo.findByPk(photoId);

    if (!photo) {
      return res.status(404).json({ error: 'Photo not found.' });
    }

    // Handle both camelCase and snake_case column naming
    const imageUrl = photo.fileUrl || photo.file_url;

    if (!imageUrl) {
      return res.status(400).json({ error: 'Photo has no file URL.' });
    }

    // Fetch the image from S3
    const protocol = imageUrl.startsWith('https') ? https : http;

    protocol.get(imageUrl, (imageResponse: any) => {
      // Set appropriate headers
      res.setHeader('Content-Type', imageResponse.headers['content-type'] || 'image/jpeg');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      
      // Pipe the image data to the response
      imageResponse.pipe(res);
    }).on('error', (err: any) => {
      console.error('Proxy Image Error:', err);
      return res.status(500).json({ error: 'Failed to proxy image.' });
    });

  } catch (error: any) {
    console.error('Proxy Image Error:', error);
    return res.status(500).json({ error: 'Failed to proxy image.', details: error.message });
  }
};
