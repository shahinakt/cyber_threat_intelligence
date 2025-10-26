const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:8000/ws';

class WebSocketService {
  constructor() {
    this.ws = null;
    this.listeners = [];
    this.reconnectInterval = 5000;
    this.reconnectTimer = null;
  }

  connect(userId) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      this.ws = new WebSocket(`${WS_URL}/${userId}`);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.notifyListeners(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.reconnect(userId);
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      this.reconnect(userId);
    }
  }

  reconnect(userId) {
    if (this.reconnectTimer) return;

    this.reconnectTimer = setTimeout(() => {
      console.log('Attempting to reconnect WebSocket...');
      this.connect(userId);
    }, this.reconnectInterval);
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.listeners = [];
  }

  send(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
    }
  }

  addListener(callback) {
    this.listeners.push(callback);
  }

  removeListener(callback) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  notifyListeners(data) {
    this.listeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error('Error in WebSocket listener:', error);
      }
    });
  }
}

export const websocketService = new WebSocketService();