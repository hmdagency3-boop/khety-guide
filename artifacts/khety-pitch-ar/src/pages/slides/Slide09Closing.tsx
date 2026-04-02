import { QRCodeSVG } from "qrcode.react";

const base = import.meta.env.BASE_URL;

export default function Slide09Closing() {
  return (
    <div
      dir="rtl"
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: "#060402" }}
    >
      <img
        src={`${base}hero-pyramids.png`}
        crossOrigin="anonymous"
        className="absolute inset-0 w-full h-full object-cover"
        alt="أهرام الجيزة"
        style={{ opacity: 0.45, transform: "scale(1.06)" }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 42%, rgba(6,4,2,0.55) 0%, rgba(6,4,2,0.97) 70%)",
        }}
      />
      <div className="absolute inset-0" style={{ background: "rgba(6,4,2,0.45)" }} />
      <div
        className="absolute top-0 left-0 right-0"
        style={{ height: "0.5vh", background: "linear-gradient(90deg, transparent, #CAA354, transparent)" }}
      />

      <div
        className="absolute inset-0 flex flex-col items-center justify-center"
        style={{ padding: "0 14vw 12vh" }}
      >
        <p
          className="font-body text-center mb-[2vh]"
          style={{ fontSize: "1.05vw", color: "#CAA354", fontWeight: 700, letterSpacing: "0.2em" }}
        >
          تطوير قطاع السياحة المصري — 2026
        </p>
        <h1
          className="font-display font-bold tracking-widest leading-none mb-[1.5vh] text-center"
          style={{ fontSize: "9vw", color: "#F5EDD6", textShadow: "0 4px 40px rgba(202,163,84,0.25)" }}
        >
          KHETY
        </h1>
        <div
          style={{
            width: "10vw",
            height: "2px",
            background: "linear-gradient(90deg, transparent, #CAA354, transparent)",
            marginBottom: "2vh",
          }}
        />
        <p
          className="font-display font-bold text-center mb-[2vh]"
          style={{ fontSize: "3.2vw", color: "#CAA354", lineHeight: 1.3 }}
        >
          رفيق كيميت الذكي
        </p>
        <p
          className="font-body text-center mb-[2.5vh]"
          style={{ fontSize: "1.55vw", color: "rgba(245,237,214,0.6)", lineHeight: 1.6, maxWidth: "50vw" }}
        >
          توظيف الذكاء الاصطناعي لتحويل السياحة المصرية وتعزيز الاقتصاد القومي
        </p>
        <p
          className="font-body text-center mb-[3vh]"
          style={{ fontSize: "1.4vw", color: "#CAA354", fontWeight: 600 }}
        >
          شكراً لحسن الاستماع
        </p>

        <div className="flex flex-col items-center" style={{ gap: "1vh" }}>
          <div
            style={{
              background: "rgba(245,237,214,0.96)",
              borderRadius: "12px",
              padding: "1.2vh 1.2vw",
              boxShadow: "0 0 32px rgba(202,163,84,0.35)",
              border: "2px solid #CAA354",
            }}
          >
            <QRCodeSVG
              value="https://khety-guide.netlify.app/"
              size={110}
              bgColor="rgba(245,237,214,0.96)"
              fgColor="#0C0904"
              level="H"
            />
          </div>
          <p className="font-body text-center" style={{ fontSize: "0.9vw", color: "rgba(202,163,84,0.7)", letterSpacing: "0.08em" }}>
            امسح لتجربة التطبيق
          </p>
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0"
        style={{ padding: "0 6vw 3vh" }}
      >
        <div
          style={{
            height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(202,163,84,0.4), transparent)",
            marginBottom: "2.5vh",
          }}
        />
        <div className="flex flex-row-reverse items-start" style={{ gap: "0" }}>
          <div style={{ flex: 1 }}>
            <p
              className="font-body mb-[1.2vh]"
              style={{ fontSize: "1vw", color: "#CAA354", fontWeight: 700, textAlign: "right", letterSpacing: "0.12em" }}
            >
              إعداد الطالب
            </p>
            <p
              className="font-display font-bold"
              style={{ fontSize: "1.55vw", color: "#F5EDD6", textAlign: "right", lineHeight: 1.4 }}
            >
              يوسف أحمد عبدالله محمد الصباح
            </p>
          </div>
          <div
            style={{
              width: "1px",
              background: "linear-gradient(to bottom, transparent, rgba(202,163,84,0.4), transparent)",
              margin: "0 4vw",
              alignSelf: "stretch",
            }}
          />
          <div style={{ flex: 1 }}>
            <p
              className="font-body mb-[1.2vh]"
              style={{ fontSize: "1vw", color: "#CAA354", fontWeight: 700, textAlign: "right", letterSpacing: "0.12em" }}
            >
              تحت إشراف
            </p>
            <div className="flex flex-row-reverse" style={{ gap: "2.5vw" }}>
              <div>
                <p className="font-body" style={{ fontSize: "1.3vw", color: "rgba(245,237,214,0.85)", textAlign: "right", lineHeight: 1.9 }}>
                  د. إسراء رضا فرحات
                </p>
                <p className="font-body" style={{ fontSize: "1.3vw", color: "rgba(245,237,214,0.85)", textAlign: "right", lineHeight: 1.9 }}>
                  د. رفاء سمير أحمد
                </p>
              </div>
              <div>
                <p className="font-body" style={{ fontSize: "1.3vw", color: "rgba(245,237,214,0.85)", textAlign: "right", lineHeight: 1.9 }}>
                  د. سامح سمير
                </p>
                <p className="font-body" style={{ fontSize: "1.3vw", color: "rgba(245,237,214,0.85)", textAlign: "right", lineHeight: 1.9 }}>
                  د. سامي إبراهيم أحمد
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0"
        style={{ height: "0.5vh", background: "linear-gradient(90deg, transparent, #CAA354, transparent)" }}
      />
    </div>
  );
}
