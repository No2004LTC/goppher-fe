import { useEffect, useState, useRef } from 'react';

export const useWebSocket = (url: string | null) => {
  const [latestData, setLatestData] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!url) return;

    // Khởi tạo kết nối
    const socket = new WebSocket(url);
    ws.current = socket;

    socket.onopen = () => {
      console.log("🟢 [WS] Kết nối thông báo thành công");
      setIsConnected(true);
    };

    socket.onmessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data);
        setLatestData(parsedData);
      } catch (err) {
        console.error("🔴 [WS] Lỗi định dạng dữ liệu:", err);
      }
    };

    socket.onclose = () => {
      console.log("⚪ [WS] Đã ngắt kết nối");
      setIsConnected(false);
    };

    socket.onerror = (error) => {
      console.error("🔴 [WS] Lỗi kết nối WebSocket:", error);
    };

    // Hàm dọn dẹp khi Component bị hủy (quan trọng!)
    return () => {
      if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
        socket.close();
      }
    };
  }, [url]);

  return { latestData, isConnected };
};