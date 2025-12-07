import { DataTypes } from 'sequelize';
import sequelize from '../config/database';
import { Contact } from './Contact';

const Quote = sequelize.define('Quote', {
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
    },
    proposalSubmittedTo: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
        field: 'Proposal Submitted To',
    },
    woodSpecies: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'Wood Species',
    },
    grade: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'Grade',
    },
    widthThickness: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'Width/Thickness',
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
    notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'Notes',
    },
    totalSquareFootage: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        field: 'Total Square Footage',
    },
    totalAddOnAmount: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: true,
        field: 'Total Add On Amount',
    },
    totalFinishingAmount: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: true,
        field: 'Total Finishing Amount',
    },
    materialsDeposit: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: true,
        field: 'Materials Deposit',
    },
    totalCustomStainAmount: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: true,
        field: 'Total Custom Stain Amount',
    },
    quoteStatus: {
        type: DataTypes.ENUM(
            'Draft',
            'Sent',
            'Accepted',
            'Rejected'
        ),
        allowNull: true,
        defaultValue: 'Draft',
        field: 'Quote Status',
    },
    jobData: {
        type: DataTypes.JSON,
        allowNull: true,
        field: 'jobData',
    },
    checkedPhases: {
        type: DataTypes.JSON,
        allowNull: true,
        field: 'checkedPhases',
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
    sentDate: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    acceptedDate: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    createdTime: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'Created Time',
    },
    modifiedBy: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'Modified By',
    },
    modifiedTime: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'Modified Time',
    },
    delete: {
        type: DataTypes.TEXT,
        defaultValue: 'No',
    },
}, {
    tableName: 'quotes',
    timestamps: false,
});

Quote.belongsTo(Contact, { foreignKey: 'proposalSubmittedTo' });
Contact.hasMany(Quote, { foreignKey: 'proposalSubmittedTo' });

export { Quote };
