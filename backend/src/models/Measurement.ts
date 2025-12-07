import { DataTypes } from 'sequelize';
import sequelize from '../config/database';
import { Quote } from './Quote';

const Measurement = sequelize.define('Measurement', {
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
    },
    quoteId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
    },
    areas: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    dimensions: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    sqFeets: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: false,
    },
    install: {
        type: DataTypes.ENUM('Yes', 'No'),
        allowNull: false,
    },
    sf: {
        type: DataTypes.ENUM('Yes', 'No'),
        allowNull: false,
    },
    carpet: {
        type: DataTypes.ENUM('Yes', 'No'),
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
    tableName: 'measurements',
    timestamps: false,
});

Measurement.belongsTo(Quote, { foreignKey: 'quoteId' });
Quote.hasMany(Measurement, { foreignKey: 'quoteId' });

export { Measurement };
