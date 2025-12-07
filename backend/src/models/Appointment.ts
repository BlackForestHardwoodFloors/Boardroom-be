import { DataTypes } from 'sequelize';
import sequelize from '../config/database';

const Appointment = sequelize.define('Appointment', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  purpose: {
    type: DataTypes.ENUM('Onsite Visit', 'Project', 'General', 'Wood Delivery'),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  startTime: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  endTime: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  contact: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  location: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  employeeName: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
  },
  createdBy: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  createdTime: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  modifiedBy: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  modifiedTime: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  delete: {
    type: DataTypes.STRING,
    defaultValue: 'No',
  },
}, {
  tableName: 'appointments',
  timestamps: false,
});

export { Appointment };
