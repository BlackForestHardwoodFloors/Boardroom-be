import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface DescriptionAttributes {
  id: number;
  name: string;
  color: string | null;
  isJobType: boolean;
  lastUsed: Date;
  createdAt: Date;
}

interface DescriptionCreationAttributes extends Optional<DescriptionAttributes, 'id' | 'color' | 'isJobType' | 'lastUsed' | 'createdAt'> {}

export class Description extends Model<DescriptionAttributes, DescriptionCreationAttributes> implements DescriptionAttributes {
  public id!: number;
  public name!: string;
  public color!: string | null;
  public isJobType!: boolean;
  public lastUsed!: Date;
  public createdAt!: Date;
}

Description.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    color: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: null,
    },
    isJobType: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    lastUsed: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'descriptions',
    timestamps: false,
  }
);

export default Description;
