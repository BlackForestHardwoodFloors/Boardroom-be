import { DataTypes } from 'sequelize';
import sequelize from '../config/database';
import { Contract } from './Contract';

const JobsLog = sequelize.define('JobsLog', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    jobId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    action: {
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
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'Created Time',
    },
    delete: {
        type: DataTypes.STRING,
        defaultValue: 'No',
    },
}, {
    tableName: 'jobsLog',
    timestamps: false,
});

export { JobsLog };
