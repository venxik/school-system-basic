import TeacherClassSubject from '../models/TeacherClassSubject';
import ClassStudent from '../models/ClassStudent';
import Teacher from '../models/Teacher';
import Class from '../models/Class';
import Subject from '../models/Subject';
import Student from '../models/Student';

export const initializeAssociations = (): void => {
  Teacher.hasMany(TeacherClassSubject, { foreignKey: 'teacherId' });
  Class.hasMany(TeacherClassSubject, { foreignKey: 'classId' });
  Subject.hasMany(TeacherClassSubject, { foreignKey: 'subjectId' });

  TeacherClassSubject.belongsTo(Teacher, { foreignKey: 'teacherId' });
  TeacherClassSubject.belongsTo(Class, { foreignKey: 'classId' });
  TeacherClassSubject.belongsTo(Subject, { foreignKey: 'subjectId' });

  Class.hasMany(ClassStudent, { foreignKey: 'classId' });
  Student.hasMany(ClassStudent, { foreignKey: 'studentId' });

  ClassStudent.belongsTo(Class, { foreignKey: 'classId' });
  ClassStudent.belongsTo(Student, { foreignKey: 'studentId' });
};
