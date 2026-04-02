const base = import.meta.env.BASE_URL;

export default function Slide01Title() {
  return (
    <div
      dir="rtl"
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: "#0C0904" }}
    >
      <img
        src={`${base}hero-pyramids.png`}
        crossOrigin="anonymous"
        className="absolute inset-0 w-full h-full object-cover"
        alt="أهرام الجيزة"
        style={{ opacity: 0.65, transform: "scale(1.04)" }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(270deg, rgba(8,5,1,0.98) 0%, rgba(8,5,1,0.8) 42%, rgba(8,5,1,0.25) 72%, rgba(8,5,1,0.6) 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 70% 50%, transparent 35%, rgba(8,5,1,0.55) 100%)",
        }}
      />
      <div
        className="absolute top-0 left-0 right-0"
        style={{
          height: "0.5vh",
          background: "linear-gradient(270deg, #E8C97A 0%, #CAA354 55%, rgba(202,163,84,0.08) 100%)",
        }}
      />

      <div
        className="absolute top-0 right-0 bottom-0 flex flex-col justify-center"
        style={{ width: "62vw", padding: "0 7vw" }}
      >
        <p
          className="font-body mb-[2.5vh]"
          style={{ fontSize: "1.15vw", color: "#CAA354", fontWeight: 700, textAlign: "right", letterSpacing: "0.18em", textTransform: "uppercase" }}
        >
          تطوير قطاع السياحة المصري
        </p>
        <h1
          className="font-display font-bold leading-none mb-[1.8vh]"
          style={{ fontSize: "10.5vw", color: "#F5EDD6", textAlign: "right", letterSpacing: "0.04em" }}
        >
          KHETY
        </h1>
        <div
          style={{
            width: "100%",
            height: "2px",
            background: "linear-gradient(270deg, #CAA354 0%, rgba(202,163,84,0.2) 100%)",
            marginBottom: "2.2vh",
          }}
        />
        <p
          className="font-display font-bold mb-[3vh]"
          style={{ fontSize: "3.8vw", color: "#CAA354", lineHeight: 1.2, textAlign: "right" }}
        >
          رفيق كيميت الذكي
        </p>
        <p
          className="font-body mb-[5vh]"
          style={{ fontSize: "1.7vw", color: "rgba(245,237,214,0.72)", lineHeight: 1.7, textAlign: "right", maxWidth: "42vw" }}
        >
          توظيف الذكاء الاصطناعي وتقنية AR لتحويل السياحة المصرية وتعزيز الإيرادات القومية
        </p>
        <div className="flex flex-row-reverse" style={{ gap: "2.5vw" }}>
          <div
            className="rounded-xl"
            style={{ background: "rgba(202,163,84,0.12)", border: "1px solid rgba(202,163,84,0.35)", padding: "1.5vh 2vw" }}
          >
            <p className="font-display font-bold" style={{ fontSize: "2.2vw", color: "#CAA354", textAlign: "right" }}>15M</p>
            <p className="font-body" style={{ fontSize: "1.1vw", color: "rgba(245,237,214,0.6)", textAlign: "right" }}>سائح سنوياً</p>
          </div>
          <div
            className="rounded-xl"
            style={{ background: "rgba(202,163,84,0.12)", border: "1px solid rgba(202,163,84,0.35)", padding: "1.5vh 2vw" }}
          >
            <p className="font-display font-bold" style={{ fontSize: "2.2vw", color: "#CAA354", textAlign: "right" }}>12%</p>
            <p className="font-body" style={{ fontSize: "1.1vw", color: "rgba(245,237,214,0.6)", textAlign: "right" }}>من الناتج المحلي</p>
          </div>
          <div
            className="rounded-xl"
            style={{ background: "rgba(202,163,84,0.12)", border: "1px solid rgba(202,163,84,0.35)", padding: "1.5vh 2vw" }}
          >
            <p className="font-display font-bold" style={{ fontSize: "2.2vw", color: "#CAA354", textAlign: "right" }}>∞</p>
            <p className="font-body" style={{ fontSize: "1.1vw", color: "rgba(245,237,214,0.6)", textAlign: "right" }}>كل اللغات العالمية</p>
          </div>
        </div>
      </div>

      <div
        className="absolute flex flex-col justify-center"
        style={{ left: "2.5vw", top: 0, bottom: 0, width: "33vw" }}
      >
        <div
          style={{
            background: "rgba(6,4,2,0.55)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            border: "1px solid rgba(202,163,84,0.2)",
            borderRadius: "16px",
            padding: "3vh 2.2vw",
          }}
        >
          <div style={{ borderBottom: "1px solid rgba(202,163,84,0.2)", paddingBottom: "2vh", marginBottom: "2vh" }}>
            <p className="font-body" style={{ fontSize: "0.8vw", color: "#CAA354", fontWeight: 700, letterSpacing: "0.15em", marginBottom: "1vh" }}>
              إعداد الطالب
            </p>
            <p className="font-body" style={{ fontSize: "1.25vw", color: "#F5EDD6", lineHeight: 1.5 }}>
              يوسف أحمد عبدالله محمد الصباح
            </p>
          </div>
          <div>
            <p className="font-body" style={{ fontSize: "0.8vw", color: "#CAA354", fontWeight: 700, letterSpacing: "0.15em", marginBottom: "1.2vh" }}>
              تحت إشراف
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.8vh" }}>
              {["د. إسراء رضا فرحات", "د. رفاء سمير أحمد", "د. سامح سمير", "د. سامي إبراهيم أحمد"].map((name) => (
                <div key={name} className="flex items-center" style={{ gap: "0.7vw" }}>
                  <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#CAA354", flexShrink: 0 }} />
                  <p className="font-body" style={{ fontSize: "1.1vw", color: "rgba(245,237,214,0.82)", lineHeight: 1.5 }}>{name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 flex items-center justify-between"
        style={{ padding: "0 7vw 2.5vh" }}
      >
        <p className="font-body" style={{ fontSize: "1.05vw", color: "rgba(202,163,84,0.45)", letterSpacing: "0.12em" }}>2026</p>
        <p className="font-body" style={{ fontSize: "1.05vw", color: "rgba(202,163,84,0.45)", letterSpacing: "0.12em" }}>khety.app</p>
      </div>
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: "0.45vh",
          background: "linear-gradient(270deg, #E8C97A 0%, #CAA354 55%, rgba(202,163,84,0.08) 100%)",
        }}
      />
    </div>
  );
}
