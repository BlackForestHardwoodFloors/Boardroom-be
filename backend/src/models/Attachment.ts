import { DataTypes } from 'sequelize';
import sequelize from '../config/database';

const Attachment = sequelize.define('Attachment', {
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
    },
    project: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    room: {
        type: DataTypes.ENUM(
            'Entry',
            'Living room',
            'Family room',
            'Great room',
            'Dining room',
            'Hallway',
            'Kitchen',
            'Bathroom',
            'Master Bedroom',
            'One Bedroom',
            'Two Bedrooms',
            'Three Bedrooms',
            'Four Bedrooms',
            'Five Bedrooms',
            'Office',
            'Laundry room',
            'Others'
        ),
        allowNull: false,
    },
    images: {
        type: DataTypes.BLOB('long'),
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
}, {
    tableName: 'attachments',
    timestamps: false,
});

export { Attachment };
