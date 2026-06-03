/**
 * Database types for the typed Supabase client.
 *
 * This is a hand-maintained version that matches supabase/migrations. To
 * regenerate from a live project instead, run:
 *   npm run db:gen-types
 * (requires the Supabase CLI and SUPABASE_PROJECT_ID in your env).
 */
import type {
  EquipmentAccess,
  ExperienceLevel,
  Gender,
  MealType,
  PhotoPose,
  PrimaryGoal,
  SplitType,
  UnitSystem,
  WorkoutStatus,
} from './enums';

type Timestamp = string;
type IsoDate = string;

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          name: string | null;
          age: number | null;
          gender: Gender | null;
          height_cm: number | null;
          weight_kg: number | null;
          experience: ExperienceLevel | null;
          equipment: EquipmentAccess | null;
          days_per_week: number | null;
          session_duration_min: number | null;
          primary_goal: PrimaryGoal | null;
          physique_goal_id: string | null;
          split_type: SplitType | null;
          unit_system: UnitSystem;
          onboarding_completed: boolean;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: Partial<Database['public']['Tables']['profiles']['Row']> & { id: string };
        Update: Partial<Database['public']['Tables']['profiles']['Row']>;
        Relationships: [];
      };
      settings: {
        Row: {
          user_id: string;
          theme: 'system' | 'light' | 'dark';
          unit_system: UnitSystem;
          rest_timer_default_seconds: number;
          notifications_enabled: boolean;
          updated_at: Timestamp;
        };
        Insert: Partial<Database['public']['Tables']['settings']['Row']> & { user_id: string };
        Update: Partial<Database['public']['Tables']['settings']['Row']>;
        Relationships: [];
      };
      workout_programs: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          split_type: SplitType;
          physique_goal_id: string | null;
          days_per_week: number;
          session_duration_min: number;
          experience: ExperienceLevel;
          equipment: EquipmentAccess;
          primary_goal: PrimaryGoal;
          is_active: boolean;
          generated_config: Record<string, unknown>;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: Partial<Database['public']['Tables']['workout_programs']['Row']> & {
          user_id: string;
          name: string;
          split_type: SplitType;
          days_per_week: number;
          session_duration_min: number;
          experience: ExperienceLevel;
          equipment: EquipmentAccess;
          primary_goal: PrimaryGoal;
        };
        Update: Partial<Database['public']['Tables']['workout_programs']['Row']>;
        Relationships: [];
      };
      program_days: {
        Row: {
          id: string;
          program_id: string;
          user_id: string;
          day_index: number;
          name: string;
          focus: string | null;
          exercises: unknown;
          created_at: Timestamp;
        };
        Insert: Partial<Database['public']['Tables']['program_days']['Row']> & {
          program_id: string;
          user_id: string;
          day_index: number;
          name: string;
        };
        Update: Partial<Database['public']['Tables']['program_days']['Row']>;
        Relationships: [];
      };
      workouts: {
        Row: {
          id: string;
          user_id: string;
          program_id: string | null;
          program_day_id: string | null;
          name: string;
          date: IsoDate;
          status: WorkoutStatus;
          duration_seconds: number | null;
          total_volume: number;
          notes: string | null;
          started_at: Timestamp | null;
          completed_at: Timestamp | null;
          created_at: Timestamp;
        };
        Insert: Partial<Database['public']['Tables']['workouts']['Row']> & {
          user_id: string;
          name: string;
        };
        Update: Partial<Database['public']['Tables']['workouts']['Row']>;
        Relationships: [];
      };
      workout_set_logs: {
        Row: {
          id: string;
          user_id: string;
          workout_id: string;
          exercise_id: string;
          exercise_name: string;
          set_index: number;
          target_reps: number | null;
          reps: number | null;
          weight_kg: number | null;
          rpe: number | null;
          is_warmup: boolean;
          completed: boolean;
          rest_seconds: number | null;
          created_at: Timestamp;
        };
        Insert: Partial<Database['public']['Tables']['workout_set_logs']['Row']> & {
          user_id: string;
          workout_id: string;
          exercise_id: string;
          exercise_name: string;
          set_index: number;
        };
        Update: Partial<Database['public']['Tables']['workout_set_logs']['Row']>;
        Relationships: [];
      };
      personal_records: {
        Row: {
          id: string;
          user_id: string;
          exercise_id: string;
          exercise_name: string;
          record_type: 'est_1rm' | 'max_weight' | 'max_reps' | 'max_volume';
          value: number;
          unit: string;
          workout_id: string | null;
          achieved_at: Timestamp;
        };
        Insert: Partial<Database['public']['Tables']['personal_records']['Row']> & {
          user_id: string;
          exercise_id: string;
          exercise_name: string;
          record_type: 'est_1rm' | 'max_weight' | 'max_reps' | 'max_volume';
          value: number;
        };
        Update: Partial<Database['public']['Tables']['personal_records']['Row']>;
        Relationships: [];
      };
      foods: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          brand: string | null;
          serving_size: number;
          serving_unit: string;
          calories: number;
          protein_g: number;
          carbs_g: number;
          fat_g: number;
          fiber_g: number | null;
          sugar_g: number | null;
          barcode: string | null;
          source: 'custom' | 'seed' | 'usda';
          created_at: Timestamp;
        };
        Insert: Partial<Database['public']['Tables']['foods']['Row']> & {
          name: string;
          calories: number;
        };
        Update: Partial<Database['public']['Tables']['foods']['Row']>;
        Relationships: [];
      };
      nutrition_logs: {
        Row: {
          id: string;
          user_id: string;
          food_id: string | null;
          date: IsoDate;
          meal: MealType;
          name: string;
          servings: number;
          calories: number;
          protein_g: number;
          carbs_g: number;
          fat_g: number;
          created_at: Timestamp;
        };
        Insert: Partial<Database['public']['Tables']['nutrition_logs']['Row']> & {
          user_id: string;
          name: string;
        };
        Update: Partial<Database['public']['Tables']['nutrition_logs']['Row']>;
        Relationships: [];
      };
      weight_entries: {
        Row: {
          id: string;
          user_id: string;
          date: IsoDate;
          weight_kg: number;
          body_fat_pct: number | null;
          notes: string | null;
          created_at: Timestamp;
        };
        Insert: Partial<Database['public']['Tables']['weight_entries']['Row']> & {
          user_id: string;
          weight_kg: number;
        };
        Update: Partial<Database['public']['Tables']['weight_entries']['Row']>;
        Relationships: [];
      };
      progress_photos: {
        Row: {
          id: string;
          user_id: string;
          date: IsoDate;
          pose: PhotoPose;
          storage_path: string;
          weight_kg: number | null;
          notes: string | null;
          created_at: Timestamp;
        };
        Insert: Partial<Database['public']['Tables']['progress_photos']['Row']> & {
          user_id: string;
          pose: PhotoPose;
          storage_path: string;
        };
        Update: Partial<Database['public']['Tables']['progress_photos']['Row']>;
        Relationships: [];
      };
      exercises: {
        Row: { id: string; name: string; primary_muscle: string; equipment: string; difficulty: string | null; data: Record<string, unknown> };
        Insert: { id: string; name: string; primary_muscle: string; equipment: string; difficulty?: string | null; data?: Record<string, unknown> };
        Update: Partial<Database['public']['Tables']['exercises']['Row']>;
        Relationships: [];
      };
      physique_goals: {
        Row: { id: string; name: string; data: Record<string, unknown> };
        Insert: { id: string; name: string; data?: Record<string, unknown> };
        Update: Partial<Database['public']['Tables']['physique_goals']['Row']>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      gender: Gender;
      experience_level: ExperienceLevel;
      equipment_access: EquipmentAccess;
      primary_goal: PrimaryGoal;
      unit_system: UnitSystem;
      split_type: SplitType;
      workout_status: WorkoutStatus;
      meal_type: MealType;
      photo_pose: PhotoPose;
    };
  };
}
