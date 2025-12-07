import { DataTypes } from 'sequelize';
import sequelize from '../config/database';

const Project = sequelize.define('Project', {
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
    },
    projectId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    projectName: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    projectAddress: {
        type: DataTypes.BIGINT,
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
}, {
    tableName: 'projects',
    timestamps: false,
});

export { Project };
