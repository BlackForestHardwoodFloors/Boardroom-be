import { DataTypes } from 'sequelize';
import sequelize from '../config/database';

// Define VendorCompany model
const VendorCompany = sequelize.define('VendorCompany', {
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
    },
    companyName: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: 'Company Name',
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: 'email_unique',
        field: 'Email',
    },
    phone: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'Phone',
    },
    street: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'Street',
    },
    city: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'City',
    },
    state: {
        type: DataTypes.ENUM(
            'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
            'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
            'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
            'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
            'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
        ),
        allowNull: true,
        field: 'State',
    },
    country: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'United States',
        field: 'Country',
    },
    zipcode: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'Zipcode',
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
    tableName: 'vendorCompany',
    timestamps: false,
});

export { VendorCompany };