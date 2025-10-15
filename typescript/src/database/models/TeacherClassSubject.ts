import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '@database/config/database';

interface TeacherClassSubjectAttributes {
  id: number;
  teacherId: number;
  classId: number;
  subjectId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

class TeacherClassSubject
  extends Model<
    TeacherClassSubjectAttributes,
    Optional<TeacherClassSubjectAttributes, 'id'>
  >
  implements TeacherClassSubjectAttributes
{
  public id!: number;
  public teacherId!: number;
  public classId!: number;
  public subjectId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

TeacherClassSubject.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    teacherId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'teachers',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
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
    subjectId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'subjects',
        key: 'id',
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    },
  },
  {
    sequelize,
    tableName: 'teacher_class_subjects',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['teacherId', 'classId', 'subjectId'],
      },
      {
        fields: ['teacherId'],
      },
      {
        fields: ['classId'],
      },
      {
        fields: ['subjectId'],
      },
    ],
  }
);

export default TeacherClassSubject;
