import { DataTypes } from 'sequelize';
import sequelize from '../config/database';
import { Department } from './Departments';
import { RolePermission } from './RolePermission';

const Employee = sequelize.define('Employee', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  firstName: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'First Name',
  },
  lastName: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'Last Name',
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: 'employee_unique',
    field: 'Email',
  },
  phone: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'Phone',
  },
  department: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    field: 'Department',
  },
  rolesPermissions: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    field: 'Roles & Permissions',
  },
  portalStatus:{
    type: DataTypes.TEXT,
    field:'portalStatus'
  },
  color: {
    type: DataTypes.TEXT,
    field: 'color',
  },
  reportingManager: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false, 
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
  status: {
    type: DataTypes.ENUM('Active', 'Inactive'),
    allowNull: false,
    defaultValue: 'Active',
    field: 'Status',
  },
  delete: {
    type: DataTypes.TEXT,
    defaultValue: 'No',
  },
}, {
  tableName: 'employees',
  timestamps: false,
});

Employee.belongsTo(Department, { foreignKey: 'department' });
Employee.belongsTo(RolePermission, { foreignKey: 'rolesPermissions'});

RolePermission.hasMany(Employee, { foreignKey: 'rolesPermissions' });
Department.hasMany(Employee, { foreignKey: 'department' });

export { Employee };
