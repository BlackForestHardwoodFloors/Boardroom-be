import { DataTypes } from "sequelize";
import sequelize from "../config/database";
import { Company } from "./CompanyModel";

const ContractorEmployee = sequelize.define(
  "ContractorEmployee",
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
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: "contractor_employee_email_unique",
      field: "Email",
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
    companyId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      field: "Company Id",
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
    tableName: "contractorEmployees",
    timestamps: false,
  }
);

ContractorEmployee.belongsTo(Company, {
  foreignKey: "companyId",
  as: "company",
});

export { ContractorEmployee };
