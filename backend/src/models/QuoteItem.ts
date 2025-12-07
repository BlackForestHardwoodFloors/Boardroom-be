import { DataTypes } from 'sequelize';
import sequelize from '../config/database';

const QuoteItem = sequelize.define('QuoteItem', {
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
}, {
    tableName: 'quoteItems',
    timestamps: false,
});


export { QuoteItem };