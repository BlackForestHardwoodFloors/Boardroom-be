import { DataTypes } from 'sequelize';
import sequelize from '../config/database';

const ScopeOfWork = sequelize.define('ScopeOfWork', {
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
    },
    productImage: {
        type: DataTypes.TEXT,
    },
    type: {
        type: DataTypes.ENUM('Services', 'Materials', 'Finishing', 'Brands'),
        allowNull: false,
        defaultValue: 'Services',
    },
    serviceItemName: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    rate: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
    },
    unit: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM('Active', 'Inactive'),
        allowNull: false,
        defaultValue: 'Active',
    },
    isAddon: {
        type: DataTypes.ENUM('No', 'Yes'),
        allowNull: false,
        defaultValue: 'No',
    },
    createdBy: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    createdTime: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    modifiedBy: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    modifiedTime: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    delete: {
        type: DataTypes.STRING,
        defaultValue: 'No',
    },
}, {
    tableName: 'scopeOfWork',
    timestamps: false,
});

export { ScopeOfWork };
