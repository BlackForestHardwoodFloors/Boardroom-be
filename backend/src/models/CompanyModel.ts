import { DataTypes } from 'sequelize';
import sequelize from '../config/database';

// Define Company model
const Company = sequelize.define('Company', {
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
    },
    companyName: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'Company Name',
    },
    street: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: 'Street',
    },
    city: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: 'City',
    },
    state: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'State',
    },
    country: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'United States',
        field: 'Country',
    },
    zipcode: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'Zipcode',
    },
    addressType: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'addressType',
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
        type: DataTypes.TEXT,
        defaultValue: 'No',
    }
}, {
    tableName: 'companies',
    timestamps: false,
});

export { Company };
