import { DataTypes } from "sequelize";
import sequelize from "../config/database";

const Taxes = sequelize.define('Taxes', {
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
    },
    city: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    state: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    taxRate: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: false,
    },
    taxCode: {
        type: DataTypes.STRING,
        allowNull: false,
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
        type: DataTypes.TEXT,
        defaultValue: "No",
    },
}, {
    tableName: 'taxes',
    timestamps: false,
})

export { Taxes }