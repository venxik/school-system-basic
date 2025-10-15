import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '@database/config/database';

interface ClassAttributes {
  id: number;
  code: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}

class Class
  extends Model<ClassAttributes, Optional<ClassAttributes, 'id'>>
  implements ClassAttributes
{
  public id!: number;
  public code!: string;
  public name!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Class.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'classes',
    timestamps: true,
  }
);

export default Class;
