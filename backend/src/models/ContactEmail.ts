import { DataTypes } from 'sequelize';
import sequelize from '../config/database';
import { Contact } from './Contact';

// Define ContactEmail model for storing multiple email addresses per contact
const ContactEmail = sequelize.define('ContactEmail', {
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
        comment: 'Name of person this email belongs to (e.g., Lisa, John, Assistant)'
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'email',
    },
    isPrimary: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_primary',
    },
    receiveNotifications: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'receive_notifications',
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
    tableName: 'contact_emails',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

// Set up relationship
ContactEmail.belongsTo(Contact, {
    foreignKey: 'contactId',
    as: 'contact'
});

export { ContactEmail };
