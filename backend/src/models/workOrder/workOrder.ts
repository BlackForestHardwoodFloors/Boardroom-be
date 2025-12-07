import { DataTypes } from 'sequelize';
import sequelize from '../../config/database';
import { Contract } from '../Contract';

const WorkOrder = sequelize.define('WorkOrder', {
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
    },
    contractId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
    },
    jobForeman: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    supportTeam: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    placeYardSign: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    estimatedJobHours: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    scheduled: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    notes: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    finishType: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'Finish Type',
    },
    finishSheen: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'Finish Sheen',
    },
    stained: {
        type: DataTypes.ENUM('Yes', 'No'),
        allowNull: true,
        field: 'Stained',
    },
    stain: {
        type: DataTypes.ENUM('Yes', 'No'),
        allowNull: true,
        field: 'Stain',
    },
    hourlyRate: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    workDescription: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    moistureReadings: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    installation: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    sanding: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    finishing: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    dustControl: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    generalJobCleanup: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    tools: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    materials: {
        type: DataTypes.JSON,
        allowNull: true,
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
    modifiedBy: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'Modified By',
    },
    modifiedTime: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
        field: 'Modified Time',
    },
    delete: {
        type: DataTypes.TEXT,
        defaultValue: "No",
    },
}, {
    tableName: 'workOrder',
    timestamps: false,
});

WorkOrder.belongsTo(Contract, { foreignKey: 'contractId' });
Contract.hasOne(WorkOrder, { foreignKey: 'contractId' });

export { WorkOrder };
