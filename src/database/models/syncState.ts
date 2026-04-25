import { Model } from '@nozbe/watermelondb';
import { field, text } from '@nozbe/watermelondb/decorators';

export class SyncState extends Model {
  static table = 'sync_state';

  @text('table_name') tableName!: string;
  @field('last_synced_at') lastSyncedAt!: number;
  @field('pending_count') pendingCount!: number;
}