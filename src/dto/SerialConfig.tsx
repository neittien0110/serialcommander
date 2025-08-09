import { SerialAction } from "./SerialAction";

// Định nghĩa một interface cho cấu hình
export interface SerialConfig {
  id: number;
  name: string;
  delayTime: number;
  description: string;
  baudrate: number; // Thêm thuộc tính baudrate
  isShared: boolean;
  shareCode: string;
  leftBanner: string;
  rightBanner: string;
  components: SerialAction[]; // Hoặc định nghĩa kiểu cụ thể hơn
  createdAt: Date;
  updatedAt: Date;
  userId: number;
}