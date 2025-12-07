import { DataTypes } from 'sequelize';
import sequelize from '../config/database';
import { Quote } from './Quote';

const AddOn = sequelize.define('AddOn', {
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
    },
    quoteId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
    },
    service: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    squareFeet: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: false,
    },
    pricePerSqft: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: false,
    },
    basePrice: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: true,
    },
    additionalPrice: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: true,
    },
    amount: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: false,
    },
    phase: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    note: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: ''
    },
    ventSize: {
        type: DataTypes.STRING,
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
}, {
    tableName: 'addOn',
    timestamps: false,
});

AddOn.belongsTo(Quote, { foreignKey: 'quoteId' });
Quote.hasMany(AddOn, { foreignKey: 'quoteId' });

export { AddOn };
