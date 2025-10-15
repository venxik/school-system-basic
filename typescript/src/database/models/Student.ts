import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '@database/config/database';

interface StudentAttributes {
  id: number;
  email: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}

class Student
  extends Model<StudentAttributes, Optional<StudentAttributes, 'id'>>
  implements StudentAttributes
{
  public id!: number;
  public email!: string;
  public name!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Student.init(
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
    tableName: 'students',
    timestamps: true,
  }
);

export default Student;
