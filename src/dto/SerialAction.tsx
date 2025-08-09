// Định nghĩa một Action , lệnh gửi Serial
export interface SerialAction {
    id: number;
    name: string;
    type: string;
    list: string[];
    defaultValue: string;
    configId: number;
}