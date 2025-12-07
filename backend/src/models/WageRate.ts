import { DataTypes } from 'sequelize';
import sequelize from '../config/database';
import { Employee } from './Employee';

const WageRate = sequelize.define('WageRate', {
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
    },
    employee: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
    },
    baseRatePerHour: {
        type: DataTypes.DECIMAL(8, 2),
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
    delete: {
        type: DataTypes.STRING,
        defaultValue: 'No',
    },
}, {
    tableName: 'wageRate',
    timestamps: false,
});

WageRate.belongsTo(Employee, { foreignKey: 'employee' });
Employee.hasMany(WageRate, { foreignKey: 'employee' });

export { WageRate };
