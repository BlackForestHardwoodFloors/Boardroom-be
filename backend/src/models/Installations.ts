import { DataTypes } from 'sequelize';
import sequelize from '../config/database';
import { Quote } from './Quote';

const Installations = sequelize.define('Installations', {
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
    },
    quoteId: {
        type: DataTypes.BIGINT.UNSIGNED,
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
    materialPricePerSqft: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: false,
        defaultValue: 0
    },
    amount: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: false,
    },
    phase: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    tableName: 'installations',
    timestamps: false,
});

Installations.belongsTo(Quote, { foreignKey: 'quoteId' });
Quote.hasMany(Installations, { foreignKey: 'quoteId' });

export { Installations };
