import { DataTypes } from 'sequelize';
import sequelize from '../config/database';
import { VendorCompany } from './VendorCompany';
import { ScopeOfWork } from './ScopeofWork';
import { VendorPrice } from './VendorPrice';

// Define VendorPrice model
const VendorPriceLogs = sequelize.define('VendorPriceLogs', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    vendorPriceId: { 
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
            model: VendorPrice,
            key: 'id',
        },
        onDelete: 'CASCADE',
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
    tableName: 'vendorPriceLogs',
    timestamps: false,
});

export { VendorPriceLogs };

VendorPriceLogs.belongsTo(VendorPrice, { foreignKey: 'vendorPriceId' });
VendorPrice.hasMany(VendorPriceLogs, { foreignKey: 'vendorPriceId' });