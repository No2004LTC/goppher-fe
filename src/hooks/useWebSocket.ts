import { useState, useEffect, useRef } from 'react';

export function useWebSocket(url: string | null) {
  const [latestData, setLatestData] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!url) return;

    // 🚀 Áo giáp TypeScript chuẩn Trình duyệt (Không bị lỗi NodeJS)
    let reconnectTimer: ReturnType<typeof setTimeout>;

    const connect = () => {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('🟢 [WS] Kết nối thành công');
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const parsedData = JSON.parse(event.data);
          setLatestData(parsedData);
        } catch (err) {
          console.error('❌ [WS] Lỗi parse JSON:', err);
        }
      };

      ws.onclose = () => {
        console.log('⚪ [WS] Đã ngắt kết nối. Đang thử kết nối lại sau 3s...');
        setIsConnected(false);
        // 🚀 TỰ ĐỘNG KẾT NỐI LẠI SAU 3 GIÂY NẾU BỊ ĐỨT (Máy chủ khởi động lại)
        reconnectTimer = setTimeout(connect, 3000);
      };

      ws.onerror = (error) => {
        if (ws.readyState !== WebSocket.CLOSED) {
          console.error('🔴 [WS] Lỗi kết nối WebSocket', error);
        }
      };
    };

    connect(); // Khởi chạy lần đầu

    // 🚀 Dọn dẹp sạch sẽ khi tắt Tab
    const handleBeforeUnload = () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close(1000, "Tab closed");
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      clearTimeout(reconnectTimer);
      if (wsRef.current) {
        // Ghi đè onclose để lúc unmount Component nó không tự reconnect lặp vô tận
        wsRef.current.onclose = null; 
        wsRef.current.close();
      }
    };
  }, [url]);

  return { latestData, isConnected };
}