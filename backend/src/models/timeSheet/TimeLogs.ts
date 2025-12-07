import { DataTypes } from 'sequelize';
import sequelize from '../../config/database';

const TimeLogs = sequelize.define('TimeLogs', {
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
    },
    dateOfWork: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    logType: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    jobName: {
        type: DataTypes.TEXT,
    },
    taskName: {
        type: DataTypes.TEXT,
    },
    typeOfWork: {
        type: DataTypes.TEXT,
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
    breakTime: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    totalHours: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    employee: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    note: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    approval: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: "Pending"
    },
    images: {
        type: DataTypes.JSON,
        allowNull: true,
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
    tableName: 'timeLogss',
    timestamps: false,
});

export { TimeLogs };
