import { DataTypes } from 'sequelize';
import sequelize from '../config/database';
import { Quote } from './Quote';

// Define VendorPrice model
const QuoteVendorPricing = sequelize.define('QuoteVendorPricing', {
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
    },
    quoteId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
    },
    vendor: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: 'Vendor',
    },
    contact: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: 'Contact',
    },
    brand: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    species: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: 'Species',
    },
    grade: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: 'Grade',
    },
    size: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: 'size',
    },
    availableQuantity: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'availableQuantity',
    },
    pricePerSqft: {
        type: DataTypes.DECIMAL(10, 2),
        field: 'pricePerSqft',
    },
    margin: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'margin',
    },
    totalPrice: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'totalPrice',
    },
    createdBy: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'Created By',
    },
    createdTime: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
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
        defaultValue: DataTypes.NOW,
        field: 'Modified Time',
    }
}, {
    tableName: 'quoteVendorPricing',
    timestamps: false,
});

export { QuoteVendorPricing };

QuoteVendorPricing.belongsTo(Quote, { foreignKey: 'quoteId' });
Quote.hasMany(QuoteVendorPricing, { foreignKey: 'quoteId' });