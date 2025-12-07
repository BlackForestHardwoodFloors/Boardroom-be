import { DataTypes } from 'sequelize';
import sequelize from '../config/database';
import { Quote } from './Quote';

const FinishingChoices = sequelize.define('FinishingChoices', {
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
    finishingOptions: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true,
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
    tableName: 'finishingChoices',
    timestamps: false,
});

FinishingChoices.belongsTo(Quote, { foreignKey: 'quoteId' });
Quote.hasMany(FinishingChoices, { foreignKey: 'quoteId' });

export { FinishingChoices };
