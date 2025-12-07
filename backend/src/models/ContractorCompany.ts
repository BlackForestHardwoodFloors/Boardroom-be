import { DataTypes } from "sequelize";
import sequelize from "../config/database";

// Define ContractorCompany model
const ContractorCompany = sequelize.define(
  "ContractorCompany",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    companyName: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "Company Name",
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: "contractor_company_email_unique",
      field: "Email",
    },
    phone: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "Phone",
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
    tableName: "contractorCompany",
    timestamps: false,
  }
);

export { ContractorCompany };
