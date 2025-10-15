import { CsvItem } from '@shared/types/CsvItem';
import Logger from '@config/logger';
import {
  teacherRepository,
  studentRepository,
  classRepository,
  subjectRepository,
  teacherClassSubjectRepository,
  classStudentRepository,
  TTransaction,
} from '@repositories';

const LOG = new Logger('DataUploadService');

export class DataUploadService {
  async processData(
    csvData: CsvItem[],
    transaction: TTransaction
  ): Promise<void> {
    try {
      const teacherMap = new Map<string, string>();
      const studentMap = new Map<string, string>();
      const classMap = new Map<string, string>();
      const subjectMap = new Map<string, string>();
      const activeRelationshipKeys = new Set<string>();

      for (const row of csvData) {
        teacherMap.set(row.teacherEmail, row.teacherName);
        studentMap.set(row.studentEmail, row.studentName);
        classMap.set(row.classCode, row.classname);
        subjectMap.set(row.subjectCode, row.subjectName);

        if (row.toDelete === '0') {
          activeRelationshipKeys.add(
            `${row.teacherEmail}|${row.classCode}|${row.subjectCode}`
          );
        }
      }

      const existingTeachers = await teacherRepository.findByEmails(
        Array.from(teacherMap.keys()),
        transaction
      );
      const existingStudents = await studentRepository.findByEmails(
        Array.from(studentMap.keys()),
        transaction
      );
      const existingClasses = await classRepository.findByCodes(
        Array.from(classMap.keys()),
        transaction
      );
      const existingSubjects = await subjectRepository.findByCodes(
        Array.from(subjectMap.keys()),
        transaction
      );

      const existingTeacherMap = new Map(
        existingTeachers.map((t) => [t.email, t.name])
      );
      const existingStudentMap = new Map(
        existingStudents.map((s) => [s.email, s.name])
      );
      const existingClassMap = new Map(
        existingClasses.map((c) => [c.code, c.name])
      );
      const existingSubjectMap = new Map(
        existingSubjects.map((s) => [s.code, s.name])
      );

      const teachersToUpsert = Array.from(teacherMap.entries())
        .filter(
          ([email, name]) =>
            !existingTeacherMap.has(email) ||
            existingTeacherMap.get(email) !== name
        )
        .map(([email, name]) => ({ email, name }));

      const studentsToUpsert = Array.from(studentMap.entries())
        .filter(
          ([email, name]) =>
            !existingStudentMap.has(email) ||
            existingStudentMap.get(email) !== name
        )
        .map(([email, name]) => ({ email, name }));

      const classesToUpsert = Array.from(classMap.entries())
        .filter(
          ([code, name]) =>
            !existingClassMap.has(code) || existingClassMap.get(code) !== name
        )
        .map(([code, name]) => ({ code, name }));

      const subjectsToUpsert = Array.from(subjectMap.entries())
        .filter(
          ([code, name]) =>
            !existingSubjectMap.has(code) ||
            existingSubjectMap.get(code) !== name
        )
        .map(([code, name]) => ({ code, name }));

      if (teachersToUpsert.length > 0) {
        await teacherRepository.bulkUpsert(teachersToUpsert, transaction);
      }

      if (studentsToUpsert.length > 0) {
        await studentRepository.bulkUpsert(studentsToUpsert, transaction);
      }

      if (classesToUpsert.length > 0) {
        await classRepository.bulkUpsert(classesToUpsert, transaction);
      }

      if (subjectsToUpsert.length > 0) {
        await subjectRepository.bulkUpsert(subjectsToUpsert, transaction);
      }

      const teachers = await teacherRepository.findByEmails(
        Array.from(teacherMap.keys()),
        transaction
      );
      const students = await studentRepository.findByEmails(
        Array.from(studentMap.keys()),
        transaction
      );
      const classes = await classRepository.findByCodes(
        Array.from(classMap.keys()),
        transaction
      );
      const subjects = await subjectRepository.findByCodes(
        Array.from(subjectMap.keys()),
        transaction
      );

      const teacherLookup = new Map(teachers.map((t) => [t.email, t]));
      const studentLookup = new Map(students.map((s) => [s.email, s]));
      const classLookup = new Map(classes.map((c) => [c.code, c]));
      const subjectLookup = new Map(subjects.map((s) => [s.code, s]));

      const activeTeacherClassSubjects = new Set<string>();
      for (const key of activeRelationshipKeys) {
        const [email, code, subjectCode] = key.split('|');
        const teacher = teacherLookup.get(email);
        const classEntity = classLookup.get(code);
        const subject = subjectLookup.get(subjectCode);

        if (teacher && classEntity && subject) {
          activeTeacherClassSubjects.add(
            `${teacher.id}-${classEntity.id}-${subject.id}`
          );
        }
      }

      for (const row of csvData) {
        const teacher = teacherLookup.get(row.teacherEmail);
        const student = studentLookup.get(row.studentEmail);
        const classEntity = classLookup.get(row.classCode);
        const subject = subjectLookup.get(row.subjectCode);

        if (!teacher || !student || !classEntity || !subject) {
          continue;
        }

        if (row.toDelete === '1') {
          const studentDeleted =
            await classStudentRepository.deleteByRelationship(
              classEntity.id,
              student.id,
              transaction
            );
          if (studentDeleted) {
            LOG.info(
              `Deleted student from class: ${student.email} from ${classEntity.code}`
            );
          }

          const tcsKey = `${teacher.id}-${classEntity.id}-${subject.id}`;
          if (!activeTeacherClassSubjects.has(tcsKey)) {
            const teacherDeleted =
              await teacherClassSubjectRepository.deleteByRelationship(
                teacher.id,
                classEntity.id,
                subject.id,
                transaction
              );
            if (teacherDeleted) {
              LOG.info(
                `Deleted teacher-class-subject relationship: ${teacher.email}, ${classEntity.code}, ${subject.code}`
              );
            }
          }
        } else {
          try {
            await teacherClassSubjectRepository.findOrCreateRelationship(
              teacher.id,
              classEntity.id,
              subject.id,
              transaction
            );

            await classStudentRepository.findOrCreateData(
              classEntity.id,
              student.id,
              transaction
            );
          } catch (error) {
            LOG.error(
              `Error creating relationships for row: ${JSON.stringify(row)}`,
              error
            );
            throw error;
          }
        }
      }
    } catch (error) {
      LOG.error('Error processing data upload', error);
      throw error;
    }
  }
}

export default new DataUploadService();
