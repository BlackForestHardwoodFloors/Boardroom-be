import { DataTypes } from 'sequelize';
import sequelize from '../config/database';

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  messageId: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: "message_unique",
    field: 'Message ID'
  },
  phoneNumber: {
    type: DataTypes.STRING(20),
    allowNull: false,
    field: 'Phone Number'
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'Message'
  },
  direction: {
    type: DataTypes.ENUM('inbound', 'outbound'),
    allowNull: false,
    field: 'Direction'
  },
  status: {
    type: DataTypes.ENUM('sent', 'delivered', 'failed', 'received'),
    allowNull: false,
    field: 'Status'
  },
  timestamp: {
    type: DataTypes.STRING(30), 
    allowNull: false,
    field: 'Timestamp',
    defaultValue: () => new Date().toISOString()
  },
  originationNumber: {
    type: DataTypes.STRING(20),
    allowNull: false,
    field: 'Origination Number'
  },
  delete: {
    type: DataTypes.TEXT,
    defaultValue: 'No',
  }
}, {
  tableName: 'messages',
  timestamps: false,
  indexes: [
    { fields: ['timestamp'] },
    { 
      fields: ['Phone Number'],
      name: 'idx_phone_number'
    }
  ]
});

export { Message };