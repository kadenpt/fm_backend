export type Exercise = {
  id: number;
  title: string;
  exercise_description: string;
  video_url: string | null;
  focus: string | null;
  duration: number | null;
  created_at: Date;
};

export type CreateExerciseBody = {
  title: string;
  exercise_description: string;
  video_url?: string | null;
  focus?: string | null;
  duration?: number | null;
};

export type UpdateExerciseBody = {
  title?: string;
  exercise_description?: string;
  video_url?: string | null;
  focus?: string | null;
  duration?: number | null;
};
