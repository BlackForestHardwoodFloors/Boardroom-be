import { DataTypes, STRING } from "sequelize";
import sequelize from "../config/database";
import { Contract } from "./Contract";

const Jobs = sequelize.define(
  "Jobs",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    contractId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
    jobName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    jobAddress: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    completedDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    contractValue: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    estimatedHours: {
      type: STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Ready To Start",
    },
    assignedEmployee: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    foreman: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    notes: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    contact: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    images: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    createdBy: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "Created By",
    },
    createdTime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
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
      defaultValue: sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"),
      field: "Modified Time",
    },
    delete: {
      type: DataTypes.STRING,
      defaultValue: "No",
    },
  },
  {
    tableName: "jobs",
    timestamps: false,
  }
);

// Jobs.belongsTo(Contract, { foreignKey: 'contractId' });
// Contract.hasOne(Jobs, { foreignKey: 'contractId' });

export { Jobs };
