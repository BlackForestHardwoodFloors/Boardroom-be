import { DataTypes } from "sequelize";
import sequelize from "../config/database";

const Units = sequelize.define('Units', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },
    unit: {
        type: DataTypes.STRING,
        allowNull: false
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
}, {
    tableName: 'units',
    timestamps: false,
})

export { Units }