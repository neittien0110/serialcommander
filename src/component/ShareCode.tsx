import { QRCodeSVG } from 'qrcode.react'; // Thư viện tạo mã QR
import { useState } from 'react';
export type ShareCodeProps = {
  /** Mã chia sẻ cần hiển thị*/
  code: string;
};

export default function ShareCode({ code }: ShareCodeProps) {
  /// State lưu trạng thái copy mã URL vào clipboard và kiểm soát việc hiển thị thông báo trong vài giây
  const [IsCopyingCompleted, setCopyingCompleted] = useState<boolean>(false);
  
  // Lấy URL hiện tại và kết hợp với mã chia sẻ
  const shareUrl = `${window.location.href}${code}`;

  // Hám sự kiến xử lý copy to clipboard
  const onClickCopyToClipBoard = () => {
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        setCopyingCompleted(true);
        setTimeout(() => {
          setCopyingCompleted(false);
        }, 2000); // Ẩn thông báo sau 2 giây
      })
      .catch(() => {
        alert('Không thể sao chép URL vào clipboard. Vui lòng thử lại.');
      });
  };

  return (
    <>
      {/* 1. Nút bấm hiển thị mã chia sẻ, và để mở modal */}
      <button 
          type="button" 
          className="btn btn-danger fw-bold text-start" 
          style={{ minWidth: '90px' }}
          data-bs-toggle="modal" 
          data-bs-target="#shareModal"  // Đảm bảo target khớp với id của modal
      >
        <i className="bi bi-globe"></i> {code}
      </button>

      {/* 2. Modal popup */}
      <div className="modal fade" id="shareModal" tabIndex={-1} aria-labelledby="shareModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="shareModalLabel">Sử dụng kịch bản</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className="row">
                <div className="col-4 d-flex justify-content-center align-items-center">
                  <QRCodeSVG value={shareUrl} size={150} />
                </div>
                <div className="col-8 fs-6">
                  <p className="text-wrap">
                    Đây là URL của kịch bản hiện thời, đã chia sẻ. Bất cứ ai biết URL này đều có thể sử dụng.
                  </p>
                  
                  <div className="alert alert-info py-2 text-break fs-6 text-wrap" role="alert">
                    <strong className="d-block">{shareUrl}</strong>
                  </div>
                  
                  <div className="d-grid mt-2">
                    <button 
                      type="button" 
                      className="btn btn-outline-primary"
                      onClick={onClickCopyToClipBoard}
                    >
                        Sao chép vào clipboard
                    </button>
                    {/* Thông báo "Đã copy" chỉ hiển thị khi copySuccess là true */}
                    {IsCopyingCompleted && (
                      <small className="text-success text-end fst-italic fs-6 ">Đã copy! ✅</small>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>     
    </>
  );
}