import { DataTypes } from 'sequelize';
import sequelize from '../config/database';
import { VendorCompany } from './VendorCompany';


// Define VendorContact model
const VendorContact = sequelize.define('VendorContact', {
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
    },
    firstName: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: 'First Name',
    },
    lastName: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: 'Last Name',
    },
    vendorCompany: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        field: 'Vendor Company',
        references: {
            model: VendorCompany,
            key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    },
    phone: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'Phone',
    },
    designation: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'Designation',
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
    tableName: 'vendorContacts',
    timestamps: false,
});

VendorContact.belongsTo(VendorCompany, { foreignKey: 'vendorCompany' });
VendorCompany.hasMany(VendorContact, { foreignKey: 'vendorCompany' });

export { VendorContact };
