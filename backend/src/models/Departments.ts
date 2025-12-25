import { DataTypes } from 'sequelize';
import sequelize from '../config/database'; // Adjust the path to your database configuration

const Department = sequelize.define('Department', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  departmentName: {
    type: DataTypes.ENUM(
      'Marketing',
      'Sales',
      'Operations',
      'Projects',
      'Support',
      'Accounts',
      'Admin',
      'Technician'
    ),
    allowNull: false,
    field: 'Department Name',
  },
  createdBy: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'Created By',
  },
  createdTime: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'Created Time',
  },
  modifiedBy: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'Modified By',
  },
  modifiedTime: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'Modified Time',
  },
  delete: {
    type: DataTypes.STRING,
    defaultValue: 'No',
  },
}, {
  tableName: 'departments',
  timestamps: false,
});

export {Department};
