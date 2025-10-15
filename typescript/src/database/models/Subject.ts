import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '@database/config/database';

interface SubjectAttributes {
  id: number;
  code: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}

class Subject
  extends Model<SubjectAttributes, Optional<SubjectAttributes, 'id'>>
  implements SubjectAttributes
{
  public id!: number;
  public code!: string;
  public name!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Subject.init(
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
    tableName: 'subjects',
    timestamps: true,
  }
);

export default Subject;
