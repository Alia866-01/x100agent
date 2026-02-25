/**
 * Channel Service
 * Handles channel management (WhatsApp, Telegram, Email, etc.)
 */

import { api } from './api';
import type {
  Channel,
  CreateChannelRequest,
  ToggleChannelRequest,
} from '../types/api';

export class ChannelService {
  /**
   * List all channels for an agent
   */
  async list(agentId: string): Promise<Channel[]> {
    return api.get<Channel[]>(`/api/agents/${agentId}/channels`);
  }

  /**
   * Get single channel by ID
   */
  async get(channelId: string): Promise<Channel> {
    return api.get<Channel>(`/api/channels/${channelId}`);
  }

  /**
   * Create new channel for agent
   */
  async create(data: CreateChannelRequest): Promise<Channel> {
    return api.post<Channel>(`/api/agents/${data.agent_id}/channels`, data);
  }

  /**
   * Toggle channel active status
   */
  async toggle(channelId: string, isActive: boolean): Promise<Channel> {
    const data: ToggleChannelRequest = { is_active: isActive };
    return api.post<Channel>(`/api/channels/${channelId}/toggle`, data);
  }

  /**
   * Delete channel
   */
  async delete(channelId: string): Promise<void> {
    return api.delete<void>(`/api/channels/${channelId}`);
  }
}

// Export singleton instance
export const channelService = new ChannelService();
