import { DataTypes } from 'sequelize';
import sequelize from '../config/database';
import { VendorCompany } from './VendorCompany';
import { ScopeOfWork } from './ScopeofWork';

// Define VendorPrice model
const VendorPrice = sequelize.define('VendorPrice', {
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
    },
    material: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
            model: ScopeOfWork,
            key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        field: 'Material',
    },
    rate: {
        type: DataTypes.DECIMAL(10, 2),
        field: 'rate',
    },
    vendor: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        field: 'Vendor',
    },
    validTill: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: 'validTill',
    },
    woodSpecies: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: 'Wood Species',
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
    updatedDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: 'updatedDate',
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
    },
    delete: {
        type: DataTypes.STRING,
        defaultValue: 'No',
    },
}, {
    tableName: 'vendorPriceList',
    timestamps: false,
});

export { VendorPrice };


VendorPrice.belongsTo(VendorCompany, { foreignKey: 'vendor' });
VendorCompany.hasMany(VendorPrice, { foreignKey: 'vendor' });

VendorPrice.belongsTo(ScopeOfWork, { foreignKey: 'material' });
ScopeOfWork.hasMany(VendorPrice, { foreignKey: 'material' });