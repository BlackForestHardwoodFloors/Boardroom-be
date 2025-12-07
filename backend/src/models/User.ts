import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

// Defining the attributes of the User model
interface UserAttributes {
  firstName: string;
  lastName: string;
  id: number;
  phone: string;
  email: string;
  password: string;
  designationId: number;
  roleAndPermissionId: number;
  createdBy: number;
  createdTime: Date;
}

// User creation attributes, where 'id' is optional as it auto-increments
interface UserCreationAttributes extends Optional<UserAttributes, "id"> {}

class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public id!: number;
  public firstName!: string;
  public lastName!: string;
  public phone!: string;
  public email!: string;
  public password!: string;
  public designationId!: number;
  public roleAndPermissionId!: number;
  public createdBy!: number;
  public createdTime!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    firstName: {
      type: DataTypes.STRING,
      field: "first_name",
      allowNull: false,  
    },
    lastName: {
      type: DataTypes.STRING,
      field: "last_name",
      allowNull: false,  
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: 'user_unique',
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,  
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false, 
    },
    createdBy: {
      type: DataTypes.INTEGER,
      field: "created_by",
      allowNull: false, 
    },
    createdTime: {
      type: DataTypes.DATE,
      field: "created_time",
      allowNull: false,  
    },
    designationId: {
      type: DataTypes.INTEGER,
      field: "designation_id",
      allowNull: false, 
    },
    roleAndPermissionId: {
      type: DataTypes.INTEGER,
      field: "role_and_permission_id",
      allowNull: false, 
    },
  },
  {
    sequelize,
    modelName: "User",
  }
);

export { User, UserAttributes, UserCreationAttributes };
