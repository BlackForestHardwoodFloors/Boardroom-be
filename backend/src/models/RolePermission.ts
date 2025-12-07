import { DataTypes } from 'sequelize';
import sequelize from '../config/database';

const RolePermission = sequelize.define('RolePermission', {
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
    },
    role: {
        type: DataTypes.ENUM(
            'Super Admin',
            'Admin',
            'Team Manager',
            'Team Member'
        ),
        allowNull: false,
        field: 'Role',
    },
    createdBy: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'Created By',
    },
    createdTime: {
        type: DataTypes.DATE(),
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
        defaultValue: "No",
    },
}, {
    tableName: 'rolesPermissions',
    timestamps: false,
});

export { RolePermission };
