import { teacherClassSubjectRepository } from '@repositories';
import Logger from '@config/logger';

const LOG = new Logger('WorkloadReportService');

interface SubjectWorkload {
  subjectCode: string;
  subjectName: string;
  numberOfClasses: number;
}

interface WorkloadReport {
  [teacherName: string]: SubjectWorkload[];
}

interface TeacherClassSubjectRelation {
  Teacher?: {
    id: number;
    name: string;
  };
  Subject?: {
    id: number;
    code: string;
    name: string;
  };
  Class?: {
    id: number;
  };
}

export class WorkloadReportService {
  async generateReport(): Promise<WorkloadReport> {
    try {
      const teacherRelations =
        await teacherClassSubjectRepository.findAllWithDetails();

      LOG.info(
        `Found ${teacherRelations.length} teacher-class-subject relationships`
      );

      const reportMap = new Map<string, Map<string, SubjectWorkload>>();

      for (const relation of teacherRelations) {
        const plainRelation = relation.get({
          plain: true, // to only retrieve the data without any metadata
        }) as TeacherClassSubjectRelation;
        const teacher = plainRelation.Teacher;
        const subject = plainRelation.Subject;

        if (!teacher || !subject) {
          LOG.warn('Skipping relation with missing teacher or subject data');
          continue;
        }

        const teacherName = teacher.name;
        const subjectCode = subject.code;
        const subjectName = subject.name;

        if (!reportMap.has(teacherName)) {
          reportMap.set(teacherName, new Map());
        }

        const teacherSubjects = reportMap.get(teacherName);
        if (!teacherSubjects) {
          continue;
        }

        if (!teacherSubjects.has(subjectCode)) {
          teacherSubjects.set(subjectCode, {
            subjectCode,
            subjectName,
            numberOfClasses: 0,
          });
        }
        const subjectWorkload = teacherSubjects.get(subjectCode);
        if (subjectWorkload) {
          subjectWorkload.numberOfClasses += 1;
        }
      }

      const report: WorkloadReport = {};

      for (const [teacherName, subjectsMap] of reportMap.entries()) {
        report[teacherName] = Array.from(subjectsMap.values());
      }

      return report;
    } catch (error) {
      LOG.error('Error generating workload report', error);
      throw error;
    }
  }
}

export default new WorkloadReportService();
