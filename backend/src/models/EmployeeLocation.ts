import { DataTypes } from 'sequelize';
import sequelize from '../config/database';
import { Employee } from './Employee';

const EmployeeLocation = sequelize.define('EmployeeLocation', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  employeeId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    unique: true,
    field: 'employee_id',
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: false,
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: false,
  },
  accuracy: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0,
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  address: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  source: {
    type: DataTypes.ENUM('gps', 'manual', 'checkin'),
    allowNull: false,
    defaultValue: 'gps',
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'created_at',
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'updated_at',
  },
}, {
  tableName: 'employee_locations',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// Set up relationship
EmployeeLocation.belongsTo(Employee, { foreignKey: 'employeeId', as: 'employee' });
Employee.hasOne(EmployeeLocation, { foreignKey: 'employeeId', as: 'location' });

export { EmployeeLocation };
