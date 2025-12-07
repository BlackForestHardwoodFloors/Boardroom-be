import { DataTypes } from 'sequelize';
import sequelize from '../config/database';
import { Location } from './Locations';
import { Company } from './CompanyModel';
import { ContractorEmployee } from './ContractorEmployee';

// Define Contact model
const Contact = sequelize.define('Contact', {
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
    },
    clientSource: {
        type: DataTypes.ENUM('Direct', 'Contractor'),
        allowNull: false,
        defaultValue: 'Direct',
        field: 'Client Source',
    },
    clientDetailsAvailability: {
        type: DataTypes.ENUM('Yes', 'No'),
        allowNull: true,
        field: 'Client Details Availability',
    },
    firstName: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: 'First Name',
    },
    lastName: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'Last Name',
    },
    companyName: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'Company Name',
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: 'email_unique',
        field: 'Email',
    },
    doNotSendEmail: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
    },
    phone: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'Phone',
    },
    additionalPhone: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'Additional Phone',
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'Message',
    },
    operationsManager: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'Operations Manager',
    },
    contractorEmployee: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
        field: 'Contractor Employee',
    },
    companyId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
        field: 'Company Id',
    },
    jobImages: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    quoteImages: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    timelogImages: {
      type: DataTypes.JSON,
      allowNull: true,
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
    },
    
}, {
    tableName: 'contacts',
    timestamps: false,
});

Contact.belongsTo(Company, {
  foreignKey: 'companyId'
});

Contact.belongsTo(ContractorEmployee, {
  foreignKey: 'contractorEmployee'
});


export { Contact };
