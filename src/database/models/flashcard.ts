import { Model } from '@nozbe/watermelondb';
import { field, text, date, readonly } from '@nozbe/watermelondb/decorators';

export class Flashcard extends Model {
  static table = 'flashcards';

  @text('user_id') userId!: string;
  @text('course_id') courseId?: string;
  @text('note_id') noteId?: string;
  @text('front') front!: string;
  @text('back') back!: string;
  @field('ease_factor') easeFactor!: number;
  @field('interval_days') intervalDays!: number;
  @field('repetitions') repetitions!: number;
  @field('next_review') nextReview!: number;
  @readonly @date('created_at') createdAt!: Date;
  @date('updated_at') updatedAt!: Date;
  @field('synced_at') syncedAt?: number;
}