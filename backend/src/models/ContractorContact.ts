import { DataTypes } from "sequelize";
import sequelize from "../config/database";

const ContractorContact = sequelize.define(
  "ContractorContact",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    firstName: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: "First Name",
    },
    lastName: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: "Last Name",
    },
    companyName: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "Company Name",
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: "contractor_email_unique",
      field: "Email",
    },
    doNotSendEmail: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "Phone",
    },
    additionalPhone: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "Additional Phone",
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "Message",
    },
    operationsManager: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: "Operations Manager",
    },
    createdBy: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "Created By",
    },
    createdTime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "Created Time",
    },
    modifiedBy: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "Modified By",
    },
    modifiedTime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "Modified Time",
    },
    delete: {
      type: DataTypes.TEXT,
      defaultValue: "No",
    },
  },
  {
    tableName: "contractorContacts",
    timestamps: false,
  }
);

export { ContractorContact };
