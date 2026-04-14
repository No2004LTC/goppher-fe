import { useEffect, useRef, useCallback, useState } from 'react';

export function useWebSocket(url: string | null, onMessage?: (data: any) => void) {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // 🔴 THUỐC ĐẶC TRỊ "STALE CLOSURE": 
  // Dùng useRef để luôn giữ bản sao mới nhất của hàm onMessage
  const savedOnMessage = useRef(onMessage);

  useEffect(() => {
    savedOnMessage.current = onMessage;
  }, [onMessage]);
  // ----------------------------------------------------

  useEffect(() => {
    if (!url) return;

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setConnectionError(null);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          // 🔴 Gọi hàm thông qua ref để luôn lấy được state mới nhất của ChatBox
          if (savedOnMessage.current) savedOnMessage.current(data);
        } catch {
          if (savedOnMessage.current) savedOnMessage.current({ content: event.data });
        }
      };

      ws.onerror = () => {
        setConnectionError('WebSocket connection error');
        setIsConnected(false);
      };

      ws.onclose = () => {
        setIsConnected(false);
      };
    } catch {
      setConnectionError('Failed to connect to WebSocket');
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [url]);

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  }, []);

  return { isConnected, connectionError, sendMessage };
}