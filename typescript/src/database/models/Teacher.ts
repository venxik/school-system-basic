import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '@database/config/database';

interface TeacherAttributes {
  id: number;
  email: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}

class Teacher
  extends Model<TeacherAttributes, Optional<TeacherAttributes, 'id'>>
  implements TeacherAttributes
{
  public id!: number;
  public email!: string;
  public name!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Teacher.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
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
    tableName: 'teachers',
    timestamps: true,
  }
);

export default Teacher;
