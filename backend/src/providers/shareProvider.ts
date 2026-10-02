import { SharedJourney } from '../types/index.js';
import crypto from 'crypto';

const SHARED_JOURNEYS_STORE: Map<string, SharedJourney> = new Map();

export class ShareProvider {
  async createShareLink(trainId: string): Promise<SharedJourney> {
    const token = crypto.randomBytes(6).toString('hex');
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 48 * 60 * 60 * 1000); // 48 hours

    const item: SharedJourney = {
      token,
      trainId,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString()
    };

    SHARED_JOURNEYS_STORE.set(token, item);
    return item;
  }

  async getShareLink(token: string): Promise<SharedJourney | null> {
    const item = SHARED_JOURNEYS_STORE.get(token);
    if (!item) return null;

    if (new Date(item.expiresAt).getTime() < Date.now()) {
      SHARED_JOURNEYS_STORE.delete(token);
      return null;
    }

    return item;
  }
}

export const shareProvider = new ShareProvider();
