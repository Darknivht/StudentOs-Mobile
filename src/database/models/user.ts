import { Model } from '@nozbe/watermelondb';
import { field, text, date, readonly } from '@nozbe/watermelondb/decorators';

export class User extends Model {
  static table = 'users';

  @text('supabase_id') supabaseId!: string;
  @text('email') email!: string;
  @text('display_name') displayName!: string;
  @text('subscription_tier') subscriptionTier!: string;
  @readonly @date('created_at') createdAt!: Date;
  @date('updated_at') updatedAt!: Date;
  @field('synced_at') syncedAt?: number;
}