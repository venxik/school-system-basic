import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '@database/config/database';

interface ClassStudentAttributes {
  id: number;
  classId: number;
  studentId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

class ClassStudent
  extends Model<ClassStudentAttributes, Optional<ClassStudentAttributes, 'id'>>
  implements ClassStudentAttributes
{
  public id!: number;
  public classId!: number;
  public studentId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ClassStudent.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    classId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'classes',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    studentId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'students',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  },
  {
    sequelize,
    tableName: 'class_students',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['classId', 'studentId'],
      },
      {
        fields: ['classId'],
      },
      {
        fields: ['studentId'],
      },
    ],
  }
);

export default ClassStudent;
