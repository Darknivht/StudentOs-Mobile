import { Model } from '@nozbe/watermelondb';
import { field, text, date, readonly } from '@nozbe/watermelondb/decorators';

export class Course extends Model {
  static table = 'courses';

  @text('user_id') userId!: string;
  @text('title') title!: string;
  @text('description') description?: string;
  @text('color') color?: string;
  @text('emoji') emoji?: string;
  @readonly @date('created_at') createdAt!: Date;
  @date('updated_at') updatedAt!: Date;
  @field('synced_at') syncedAt?: number;
}