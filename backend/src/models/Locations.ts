import { DataTypes } from 'sequelize';
import sequelize from '../config/database';
import { Contact } from './Contact';

const Location = sequelize.define(
    'Location',
    {
        id: {
            type: DataTypes.BIGINT.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
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
        contactId: {
            type: DataTypes.BIGINT.UNSIGNED
        },
        contactName: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'ContactName',
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
    },
    {
        tableName: 'locations',
        timestamps: false,
    }
);

Location.belongsTo(Contact, { foreignKey: 'contactId' });
Contact.hasMany(Location, { foreignKey: 'contactId' });

export { Location };
