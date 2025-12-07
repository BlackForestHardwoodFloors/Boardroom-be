import { DataTypes } from 'sequelize';
import sequelize from '../config/database'; // Adjust the path to your database configuration

const GeneralTasks = sequelize.define('GeneralTasks', {
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
    },
    taskName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
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
    tableName: 'generalTasks',
    timestamps: false,
});

export { GeneralTasks };