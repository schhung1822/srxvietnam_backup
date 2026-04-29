import React from 'react';

const deliveryTruckStyles = `
  .car-container {
    position: absolute;
    width: 400px;
    height: 400px;
    margin: auto;
    inset: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
  }

  .car {
    position: absolute;
    background-color: rgb(204, 204, 204);
    width: 200px;
    height: 120px;
    left: 50px;
    border-top: 4px solid rgb(162, 162, 162);
    top: 135px;
    animation: bounce 0.4s infinite;
  }

  @keyframes bounce {
    0% {
      top: 135px;
    }
    50% {
      top: 132px;
    }
  }

  .car::before {
    content: "";
    position: absolute;
    width: 290px;
    height: 20px;
    background-color: rgb(46, 46, 81);
    bottom: -10px;
  }

  .car::after {
    content: "";
    position: absolute;
    background-color: rgb(229, 229, 229);
    width: 80px;
    height: 90px;
    right: -90px;
    bottom: 10px;
    clip-path: polygon(0% 0%, 50% 0, 100% 60%, 100% 100%, 0% 100%);
  }

  .window {
    position: absolute;
    background-color: rgb(126, 191, 226);
    width: 50px;
    height: 40px;
    right: -75px;
    top: 26px;
    z-index: 1;
    clip-path: polygon(0% 0%, 40% 0, 100% 100%, 0% 100%);
    border: 2px solid rgb(135, 135, 135);
  }

  .window::before {
    content: "";
    position: absolute;
    background-color: rgb(186, 225, 247);
    width: 5px;
    height: 40px;
    left: 5px;
    transform: skew(-36deg);
    box-shadow: 9px 0px rgb(186, 225, 247);
  }

  .window::after {
    content: "";
    position: absolute;
    background-color: rgb(108, 107, 107);
    width: 10px;
    height: 10px;
    bottom: 2px;
    right: 10px;
    box-shadow:
      2px 6px 0px -2px rgb(229, 229, 229),
      inset 2px 0px rgb(203, 203, 204);
  }

  .wheels {
    position: absolute;
    width: 45px;
    height: 45px;
    border-radius: 50%;
    background-color: #bcbcbc;
    border: 10px solid rgb(4, 4, 4);
    bottom: 108px;
    left: 90px;
    box-shadow: 0px 0px 0px 4px;
    animation: rotation 0.3s linear infinite;
  }

  @keyframes rotation {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .wheels::before {
    content: "";
    position: absolute;
    width: 5px;
    height: 5px;
    background-color: rgb(67, 67, 67);
    top: 10px;
    left: 3px;
    border-radius: 50%;
    box-shadow:
      14.5px 0px rgb(67, 67, 67),
      7px -7px rgb(67, 67, 67),
      7px 7px rgb(67, 67, 67),
      7px 0px 0px 4px rgb(67, 67, 67);
  }

  .wheels2 {
    left: 270px;
  }

  .cargo-details {
    position: absolute;
    width: 185px;
    height: 20px;
    background-color: #e9e9e9;
    left: 8px;
    top: 5px;
    box-shadow:
      0px 23px #e9e9e9,
      0px 46px #e9e9e9,
      0px 69px #e9e9e9;
  }

  .cargo-details::before {
    position: absolute;
    content: "";
    width: 10px;
    height: 4px;
    background-color: red;
    bottom: -72px;
    box-shadow:
      10px 0px white,
      20px 0px red,
      30px 0px white,
      40px 0px red,
      50px 0px white,
      60px 0px red,
      70px 0px white,
      80px 0px red,
      90px 0px white,
      100px 0px red,
      110px 0px white,
      120px 0px red,
      130px 0px white,
      140px 0px red,
      150px 0px white,
      160px 0px red,
      170px 0px white,
      175px 0px red;
  }

  .cargo-details::after {
    position: absolute;
    content: "";
    width: 10px;
    height: 6px;
    background-color: rgb(135, 135, 135);
    top: -6px;
    left: -10px;
    box-shadow:
      195px 0px rgb(135, 135, 135),
      0px 125px rgb(46, 46, 81);
  }

  .door {
    position: absolute;
    width: 10px;
    height: 4px;
    background-color: black;
    right: -31px;
    bottom: 40px;
    z-index: 2;
  }

  .door::before {
    content: "";
    position: absolute;
    width: 10px;
    height: 20px;
    background-color: rgb(85, 84, 85);
    left: -21px;
    z-index: -1;
    bottom: -30px;
    box-shadow: inset 0px 4px rgb(163, 163, 163);
  }

  .lights {
    position: absolute;
    width: 12px;
    height: 20px;
    background-color: rgb(255, 237, 191);
    right: -90px;
    bottom: 0px;
    z-index: 1;
    box-shadow: inset 0px -8px rgba(172, 2, 2, 0.719);
    animation: lighting1 1.5s infinite ease-in-out;
  }

  @keyframes lighting1 {
    0% {
      background-color: rgb(255, 237, 191);
      box-shadow: inset 0px -8px rgba(172, 2, 2, 0.719);
    }

    50% {
      box-shadow: inset 0px -8px rgba(217, 83, 1, 0.719);
    }
  }

  .lights::before {
    content: "";
    position: absolute;
    width: 6px;
    height: 15px;
    background-color: rgb(207, 2, 2);
    left: -280px;
    bottom: 0px;
    box-shadow: inset 0px 7px rgb(207, 2, 2);
    animation: lighting 1.5s infinite ease-in-out;
  }

  @keyframes lighting {
    0% {
      box-shadow: inset 0px 9px rgb(207, 2, 2);
    }

    50% {
      box-shadow: inset 0px 9px rgb(255, 0, 0);
    }
  }

  .lights::after {
    content: "";
    position: absolute;
    width: 8px;
    height: 2px;
    background-color: rgb(81, 81, 81);
    top: -8px;
    box-shadow:
      0px -6px rgb(81, 81, 81),
      0px -12px rgb(81, 81, 81);
    right: 0px;
  }

  .street {
    height: 2px;
    width: 70px;
    background-color: black;
    position: absolute;
    bottom: 105px;
    left: 0;
    box-shadow:
      90px 0,
      180px 0,
      270px 0,
      360px 0;
    animation: motion 2s linear infinite;
  }

  .street::before {
    content: "";
    height: 2px;
    width: 70px;
    background-color: black;
    position: absolute;
    bottom: 0;
    left: 450px;
    box-shadow:
      90px 0,
      180px 0,
      270px 0,
      360px 0;
  }

  @keyframes motion {
    0% {
      left: 0;
    }
    100% {
      left: -450px;
    }
  }

  .post {
    position: absolute;
    width: 5px;
    height: 180px;
    background-color: black;
    right: -15px;
    top: 115px;
    animation: moving 2.9s infinite linear;
    z-index: -2;
  }

  @keyframes moving {
    0% {
      transform: translateX(0px);
    }
    100% {
      transform: translateX(-650px);
    }
  }

  .post::before {
    width: 20px;
    height: 20px;
    position: absolute;
    content: "";
    background-color: black;
    top: -15px;
    left: -7px;
    clip-path: polygon(0% 0%, 100% 0%, 80% 100%, 20% 100%);
  }

  .post::after {
    content: "";
    position: absolute;
    width: 0;
    height: 0;
    border-bottom: 20px solid transparent;
    border-left: 10px solid transparent;
    border-left: 20px solid black;
    transform: rotate(45deg);
    top: -23px;
    left: -7px;
  }
`;

export default function DeliveryPolicyPage() {
    return (
        <div className="bg-white min-h-screen">
            <section className="py-16 lg:py-24">
                <div className="md:max-w-[700px] lg:max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Title */}
                    <div className="text-center mb-12">
                        <h1 className="text-[32px] md:text-[40px] lg:text-[48px] font-bold text-black mb-4">
                            CHÍNH SÁCH GIAO HÀNG
                        </h1>
                    </div>

                    <div className="space-y-4 text-[15px] lg:text-[16px] text-gray-800 leading-relaxed">
                        <p>
                            SRX hỗ trợ giao hàng trên toàn quốc thông qua các đơn vị vận chuyển đối tác. Phạm vi giao hàng áp dụng cho các khu vực mà đơn vị vận chuyển có thể tiếp nhận và phát thành công.
                        </p>
                        <p>
                            Sau khi đơn hàng được xác nhận, SRX sẽ tiến hành đóng gói và bàn giao cho đơn vị vận chuyển trong thời gian sớm nhất. Thời gian giao hàng có thể thay đổi tùy theo địa chỉ nhận hàng, điều kiện giao thông, thời tiết, thời điểm cao điểm hoặc quy định riêng của đơn vị vận chuyển.
                        </p>
                        <p>
                            Thời gian giao hàng dự kiến:
                        </p>
                        <ul>
                            <li><p>• Khu vực nội thành: khoảng 1–3 ngày làm việc.</p></li>
                            <li><p>• Khu vực ngoại thành, tỉnh thành khác: khoảng 3–7 ngày làm việc.</p></li>
                            <li><p>• Khu vực huyện, xã xa trung tâm hoặc vùng đặc biệt: thời gian có thể kéo dài hơn.</p></li>
                        </ul>
                        <p>
                            Phí vận chuyển sẽ được hiển thị khi khách hàng đặt hàng hoặc được nhân viên SRX thông báo trước khi xác nhận đơn. Trong một số chương trình khuyến mãi, SRX có thể hỗ trợ miễn phí vận chuyển hoặc giảm phí vận chuyển theo điều kiện cụ thể.
                        </p>
                        <p>
                            Khi nhận hàng, khách hàng vui lòng kiểm tra tình trạng bên ngoài của kiện hàng. Nếu phát hiện kiện hàng có dấu hiệu rách, móp méo, ướt, bị mở trước hoặc sai thông tin người nhận, khách hàng nên chụp ảnh lại và liên hệ ngay với SRX để được hỗ trợ.
                        </p>
                        <p>
                            Trường hợp khách hàng cung cấp sai địa chỉ, sai số điện thoại, không nghe máy hoặc từ chối nhận hàng không có lý do phù hợp, SRX có quyền hủy đơn hoặc yêu cầu khách hàng thanh toán chi phí vận chuyển phát sinh nếu có.
                        </p>
                    </div>
                </div>

                <div className="mx-auto w-full max-w-[560px]">
                    <div className="py-8">
                        <div className="relative h-[480px] overflow-hidden">
                            <div className="car-container">
                                <div className="car">
                                    <div className="window" />
                                    <div className="cargo-details" />
                                    <div className="door" />
                                    <div className="lights" />
                                </div>
                                <div className="wheels wheels1" />
                                <div className="wheels wheels2" />
                                <div className="street" />
                                <div className="post" />
                            </div>
                        </div>
                    </div>
                </div>

                <style>{deliveryTruckStyles}</style>

            </section>
        </div>
    );
}
