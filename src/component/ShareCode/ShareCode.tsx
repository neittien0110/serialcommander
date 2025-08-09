
export type ShareCodeProps = {
  /** Mã chia sẻ cần hiển thị*/
  code: string;   
};

export default function ShareCode({ code }: ShareCodeProps) {
  return (
    <button type="button" className="btn btn-danger fw-bold" onClick={() => {
      const manualShareCode : string|null = prompt("Nhập mã chia sẻ để sử dụng", "");
      if (manualShareCode != null) {
        // loadConfigById(selectedConfigId)
      }
    }}>
      {code}
    </button>
  );
}