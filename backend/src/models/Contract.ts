import { DataTypes } from 'sequelize';
import sequelize from '../config/database';
import { Quote } from './Quote';

const Contract = sequelize.define('Contract', {
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
    },
    quoteId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
    },
    installations: {
        type: DataTypes.JSON,
    },
    finishing: {
        type: DataTypes.JSON,
    },
    addOn: {
        type: DataTypes.JSON,
    },
    customStain: {
        type: DataTypes.JSON,
    },
    additionalWork: {
        type: DataTypes.JSON,
    },
    phases: {
        type: DataTypes.JSON,
    },
    personalInformation: {
        type: DataTypes.JSON,
    },
    ownerOrOccupantSignature: {
        type: DataTypes.STRING,
    },
    ownerOrOccupantName: {
        type: DataTypes.STRING,
    },
    dateOfContract: {
        type: DataTypes.STRING,
    },
    startDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    completedDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    contractStatus: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Draft',
    },
    woodDeliveryDate: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'woodDeliveryDate',
    },
    createdBy: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'Created By',
    },
    createdByEmail: {
        type: DataTypes.STRING(255),
        allowNull: false,
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
    tableName: 'contracts',
    timestamps: false,
});

Contract.belongsTo(Quote, { foreignKey: 'quoteId' });
Quote.hasOne(Contract, { foreignKey: 'quoteId' });

export { Contract };
