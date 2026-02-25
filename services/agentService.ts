/**
 * Agent Service
 * Handles all agent-related API operations
 */

import { api } from './api';
import type {
  Agent,
  CreateAgentRequest,
  UpdateAgentRequest,
  InvokeAgentRequest,
  InvokeAgentResponse,
  AgentStats,
} from '../types/api';

export class AgentService {
  /**
   * List all agents for current tenant
   */
  async list(): Promise<Agent[]> {
    return api.get<Agent[]>('/api/agents');
  }

  /**
   * Get single agent by ID
   */
  async get(agentId: string): Promise<Agent> {
    return api.get<Agent>(`/api/agents/${agentId}`);
  }

  /**
   * Create new agent
   */
  async create(data: Omit<CreateAgentRequest, 'tenant_id'>): Promise<Agent> {
    // tenant_id will be added automatically from headers
    return api.post<Agent>('/api/agents', data);
  }

  /**
   * Update existing agent
   */
  async update(agentId: string, data: UpdateAgentRequest): Promise<Agent> {
    return api.patch<Agent>(`/api/agents/${agentId}`, data);
  }

  /**
   * Delete agent (soft delete)
   */
  async delete(agentId: string): Promise<void> {
    return api.delete<void>(`/api/agents/${agentId}`);
  }

  /**
   * Invoke agent with message
   */
  async invoke(data: Omit<InvokeAgentRequest, 'tenant_id'>): Promise<InvokeAgentResponse> {
    // tenant_id will be added automatically from headers
    return api.post<InvokeAgentResponse>('/api/agents/invoke', data);
  }

  /**
   * Get agent statistics
   */
  async getStats(
    agentId: string,
    periodStart?: string,
    periodEnd?: string
  ): Promise<AgentStats> {
    const params = new URLSearchParams();
    if (periodStart) params.append('period_start', periodStart);
    if (periodEnd) params.append('period_end', periodEnd);

    const query = params.toString();
    const endpoint = `/api/agents/${agentId}/stats${query ? `?${query}` : ''}`;

    return api.get<AgentStats>(endpoint);
  }

  /**
   * Toggle agent active status
   */
  async toggleActive(agentId: string, isActive: boolean): Promise<Agent> {
    return this.update(agentId, { is_active: isActive });
  }
}

// Export singleton instance
export const agentService = new AgentService();
