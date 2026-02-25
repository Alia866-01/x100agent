/**
 * Integration Service
 * Handles OAuth integrations (Gmail, Slack, etc.)
 */

import { api } from './api';
import type {
  Integration,
  ConnectedIntegration,
  ConnectIntegrationRequest,
  ConnectIntegrationResponse,
} from '../types/api';

export class IntegrationService {
  /**
   * List available integrations (app catalog)
   */
  async listAvailable(): Promise<Integration[]> {
    return api.get<Integration[]>('/api/integrations/apps');
  }

  /**
   * List connected integrations for an agent
   */
  async listConnected(agentId: string): Promise<ConnectedIntegration[]> {
    return api.get<ConnectedIntegration[]>(`/api/agents/${agentId}/integrations`);
  }

  /**
   * Connect new integration (initiate OAuth flow)
   */
  async connect(data: ConnectIntegrationRequest): Promise<ConnectIntegrationResponse> {
    return api.post<ConnectIntegrationResponse>('/api/integrations/connect', data);
  }

  /**
   * Disconnect integration
   */
  async disconnect(connectionId: string): Promise<void> {
    return api.delete<void>(`/api/integrations/${connectionId}`);
  }

  /**
   * Open OAuth popup and handle callback
   */
  async connectWithPopup(
    agentId: string,
    appName: string,
    redirectUrl?: string
  ): Promise<ConnectedIntegration> {
    // Initiate OAuth flow
    const response = await this.connect({
      agent_id: agentId,
      app_name: appName,
      redirect_url: redirectUrl || `${window.location.origin}/oauth/callback`,
    });

    if (!response.oauth_url) {
      throw new Error('No OAuth URL returned from server');
    }

    // Open OAuth popup
    return new Promise((resolve, reject) => {
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const popup = window.open(
        response.oauth_url,
        'oauth_popup',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      if (!popup) {
        reject(new Error('Failed to open OAuth popup. Please allow popups.'));
        return;
      }

      // Listen for OAuth callback
      const messageHandler = (event: MessageEvent) => {
        // Verify origin
        if (event.origin !== window.location.origin) {
          return;
        }

        if (event.data.type === 'oauth_success') {
          window.removeEventListener('message', messageHandler);
          popup.close();
          resolve(event.data.integration as ConnectedIntegration);
        } else if (event.data.type === 'oauth_error') {
          window.removeEventListener('message', messageHandler);
          popup.close();
          reject(new Error(event.data.error || 'OAuth failed'));
        }
      };

      window.addEventListener('message', messageHandler);

      // Check if popup was closed manually
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', messageHandler);
          reject(new Error('OAuth popup was closed'));
        }
      }, 500);
    });
  }
}

// Export singleton instance
export const integrationService = new IntegrationService();
