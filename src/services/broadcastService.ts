/**
 * Broadcast Service
 * Polls for admin broadcast messages and displays notifications
 */

import { API_URL } from '@/config';
import { notificationService } from './notificationService';

interface BroadcastMessage {
  id: string;
  text: string;
  timestamp: number;
  read_count: number;
}

class BroadcastService {
  private pollInterval: number = 10000; // Poll every 10 seconds
  private pollTimer: ReturnType<typeof setInterval> | null = null;
  private lastPollTime: number = Date.now();
  private receivedMessageIds = new Set<string>();

  /**
   * Start polling for messages
   */
  start() {
    console.log('🔔 Starting broadcast message polling...');
    this.poll();

    // Set up interval
    this.pollTimer = setInterval(() => {
      this.poll();
    }, this.pollInterval);
  }

  /**
   * Stop polling
   */
  stop() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
      console.log('🔔 Stopped broadcast message polling');
    }
  }

  /**
   * Poll for new messages
   */
  private async poll() {
    try {
      if (!API_URL || API_URL.includes('localhost') && window.location.hostname !== 'localhost') return;

      const response = await fetch(
        `${API_URL}/messages?since=${this.lastPollTime}`
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const messages: BroadcastMessage[] = data.messages || [];
      this.lastPollTime = data.timestamp || Date.now();

      // Process new messages
      for (const msg of messages) {
        // Skip if already seen
        if (this.receivedMessageIds.has(msg.id)) {
          continue;
        }

        this.receivedMessageIds.add(msg.id);

        // Send notification
        console.log('📢 New broadcast message:', msg.text);
        await this.showNotification(msg);
      }
    } catch (error) {
      console.error('❌ Broadcast poll error:', error);
    }
  }

  /**
   * Show notification for broadcast message
   */
  private async showNotification(msg: BroadcastMessage) {
    try {
      await notificationService.show('📢 Сообщение от администратора', {
        body: msg.text,
        icon: '/logo.svg',
        badge: '/logo.svg',
        tag: `broadcast_${msg.id}`,
        requireInteraction: false,
        data: { broadcast: true, messageId: msg.id },
      });
    } catch (error) {
      console.error('❌ Failed to show broadcast notification:', error);
    }
  }

  /**
   * Get current poll interval
   */
  getInterval(): number {
    return this.pollInterval;
  }

  /**
   * Set poll interval (in milliseconds)
   */
  setInterval(interval: number) {
    this.pollInterval = Math.max(5000, interval); // Minimum 5 seconds
    this.stop();
    this.start();
  }
}

// Export singleton
export const broadcastService = new BroadcastService();
export default BroadcastService;
