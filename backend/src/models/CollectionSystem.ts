import { DataTypes } from 'sequelize';
import sequelize from '../config/database';
import { Quote } from './Quote';

const CollectionSystem = sequelize.define('CollectionSystem', {
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
    },
    quoteId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
    },
    system: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    amount: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: false,
    },
}, {
    tableName: 'collectionSystem',
    timestamps: false,
});

CollectionSystem.belongsTo(Quote, { foreignKey: 'quoteId' });
Quote.hasMany(CollectionSystem, { foreignKey: 'quoteId' });

export { CollectionSystem };