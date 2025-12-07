import { DataTypes } from 'sequelize';
import sequelize from '../config/database';
import { Quote } from './Quote';

const CustomStain = sequelize.define('CustomStain', {
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
    },
    quoteId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
    },
    rooms: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    customStain: {
        type: DataTypes.ENUM('Yes', 'No'),
        allowNull: false,
    },
    squareFoots: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: false,
    },
    pricePerSqft: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: false,
    },
    amount: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: false,
    },
    phase: {
        type: DataTypes.STRING,
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
    tableName: 'customStain',
    timestamps: false,
});

CustomStain.belongsTo(Quote, { foreignKey: 'quoteId' });
Quote.hasMany(CustomStain, { foreignKey: 'quoteId' });

export { CustomStain };
