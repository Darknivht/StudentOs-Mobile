import { Model } from '@nozbe/watermelondb';
import { field, text, date, readonly } from '@nozbe/watermelondb/decorators';

export class Note extends Model {
  static table = 'notes';

  @text('user_id') userId!: string;
  @text('course_id') courseId?: string;
  @text('title') title!: string;
  @text('content') content!: string;
  @text('source') source?: string;
  @readonly @date('created_at') createdAt!: Date;
  @date('updated_at') updatedAt!: Date;
  @field('synced_at') syncedAt?: number;
}