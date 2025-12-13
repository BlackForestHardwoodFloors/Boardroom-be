import { DataTypes } from 'sequelize';
import sequelize from '../config/database';
import { Jobs } from './Jobs';
import { Employee } from './Employee';

const Photo = sequelize.define('Photo', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  jobId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    field: 'job_id',
  },
  employeeId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: true,
    field: 'employee_id',
  },
  fileUrl: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'file_url',
  },
  thumbnailUrl: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'thumbnail_url',
  },
  uploadedByName: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'uploaded_by_name',
  },
  timestampUploaded: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'timestamp_uploaded',
  },
  gpsLat: {
    type: DataTypes.FLOAT,
    allowNull: true,
    field: 'gps_lat',
  },
  gpsLng: {
    type: DataTypes.FLOAT,
    allowNull: true,
    field: 'gps_lng',
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  visibility: {
    type: DataTypes.ENUM('internal', 'client', 'hidden'),
    allowNull: false,
    defaultValue: 'internal',
  },
  selectedForClientPortal: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'selected_for_client_portal',
  },
  selectedForReviewSuggestions: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'selected_for_review_suggestions',
  },
  fileType: {
    type: DataTypes.ENUM('photo', 'video'),
    allowNull: false,
    defaultValue: 'photo',
    field: 'file_type',
  },
  mimeType: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'mime_type',
  },
  fileSizeBytes: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'file_size_bytes',
  },
  delete: {
    type: DataTypes.STRING(3),
    defaultValue: 'No',
  },
}, {
  tableName: 'photos',
  timestamps: false,
});

// Relationships
Photo.belongsTo(Jobs, { foreignKey: 'jobId', as: 'job' });
Photo.belongsTo(Employee, { foreignKey: 'employeeId', as: 'employee' });

Jobs.hasMany(Photo, { foreignKey: 'jobId', as: 'photos' });
Employee.hasMany(Photo, { foreignKey: 'employeeId', as: 'photos' });

export { Photo };