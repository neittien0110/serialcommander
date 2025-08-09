import { SerialConfig } from "../../dto/SerialConfig";

export type ShareCodeProps = {
  /** Mã chia sẻ cần hiển thị*/
  code: string;   
  UpdateGUI: (id: number | null, shareCode: string | null) => Promise<SerialConfig | null>;
};

export default function ShareCode({ code, UpdateGUI }: ShareCodeProps) {
  return (
    <button type="button" className="btn btn-danger fw-bold" onClick={() => {
      const manualShareCode : string|null = prompt("Nhập mã chia sẻ để sử dụng", "");
      if (manualShareCode != null) {
        // Gọi hàm ngoài update lại giao diện
        UpdateGUI(null, manualShareCode);
      }
    }}>
      {code}
    </button>
  );
}