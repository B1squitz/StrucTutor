import { useCallback } from 'react';
import type { CourseProgressState, TutorPracticePersistedState } from '../types/syllabus';
import { saveTutorSessionToProgress } from '../utils/assessmentEngine';

export function useTutorSession(
  courseProgress: CourseProgressState,
  onPersistCourseProgress: (next: CourseProgressState) => void
) {
  const savedTutorSession = courseProgress.tutorPractice;

  const saveTutorStepState = useCallback(
    (nextSession: TutorPracticePersistedState) => {
      const updated = saveTutorSessionToProgress(courseProgress, nextSession);
      onPersistCourseProgress(updated);
    },
    [courseProgress, onPersistCourseProgress]
  );

  return {
    savedTutorSession,
    saveTutorStepState,
  };
}
