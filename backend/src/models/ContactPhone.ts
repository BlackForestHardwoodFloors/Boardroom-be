import { DataTypes } from 'sequelize';
import sequelize from '../config/database';
import { Contact } from './Contact';

// Define ContactPhone model for storing multiple phone numbers per contact
const ContactPhone = sequelize.define('ContactPhone', {
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
    },
    contactId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        field: 'contact_id',
        references: {
            model: 'contacts',
            key: 'id'
        }
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'name',
        comment: 'Name of person this phone belongs to (e.g., Lisa, John, Assistant)'
    },
    number: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: 'number',
    },
    type: {
        type: DataTypes.ENUM('Mobile', 'Home', 'Work', 'Office', 'Fax', 'Other'),
        allowNull: false,
        defaultValue: 'Mobile',
        field: 'type',
    },
    isPrimary: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_primary',
    },
    receiveSMS: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'receive_sms',
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'created_at',
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'updated_at',
    },
}, {
    tableName: 'contact_phones',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

// Set up relationship
ContactPhone.belongsTo(Contact, {
    foreignKey: 'contactId',
    as: 'contact'
});

export { ContactPhone };
