import { DataTypes } from 'sequelize';
import sequelize from '../config/database';
import { Quote } from './Quote';

const AdditionalWork = sequelize.define('AdditionalWork', {
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
    sqFeets: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: false,
    },
    rate: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: false,
    },
    amount: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: false,
    },
    checked: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
    },
}, {
    tableName: 'additionalWork',
    timestamps: false,
});

AdditionalWork.belongsTo(Quote, { foreignKey: 'quoteId' });
Quote.hasMany(AdditionalWork, { foreignKey: 'quoteId' });

export { AdditionalWork };
