const base = import.meta.env.BASE_URL;

export default function Slide03Solution() {
  return (
    <div
      dir="rtl"
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: "#080501" }}
    >
      <img
        src={`${base}tourists-luxor.png`}
        crossOrigin="anonymous"
        className="absolute inset-0 w-full h-full object-cover"
        alt="سياح في معبد الأقصر"
        style={{ opacity: 0.45, objectPosition: "center 40%" }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(8,5,1,0.7) 0%, rgba(8,5,1,0.4) 40%, rgba(8,5,1,0.8) 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(270deg, rgba(8,5,1,0.15) 0%, rgba(8,5,1,0.0) 50%, rgba(8,5,1,0.35) 100%)",
        }}
      />
      <div
        className="absolute top-0 left-0 right-0"
        style={{ height: "0.4vh", background: "linear-gradient(90deg, transparent, #CAA354, transparent)" }}
      />
      <div className="absolute inset-0 flex flex-col" style={{ padding: "5vh 7vw" }}>
        <div className="mb-[4vh]" style={{ textAlign: "right" }}>
          <p
            className="font-body mb-[1vh]"
            style={{ fontSize: "1.1vw", color: "#CAA354", fontWeight: 700, letterSpacing: "0.15em" }}
          >
            الفئة المستهدفة
          </p>
          <h2
            className="font-display font-bold"
            style={{ fontSize: "4.2vw", color: "#F5EDD6", textShadow: "0 2px 20px rgba(0,0,0,0.8)" }}
          >
            من سيستفيد من خيتي؟
          </h2>
        </div>
        <div className="flex flex-row-reverse flex-1" style={{ gap: "2vw" }}>
          <div
            className="flex flex-col flex-1 rounded-2xl"
            style={{
              background: "rgba(8,5,1,0.82)",
              border: "1px solid rgba(202,163,84,0.3)",
              borderTop: "3px solid #CAA354",
              padding: "3vh 2vw",
              backdropFilter: "blur(8px)",
            }}
          >
            <p className="font-body mb-[1vh]" style={{ fontSize: "0.95vw", color: "#CAA354", fontWeight: 700, textAlign: "right", letterSpacing: "0.12em" }}>
              الفئة الأولى
            </p>
            <h3 className="font-display font-bold mb-[2vh]" style={{ fontSize: "1.9vw", color: "#F5EDD6", lineHeight: 1.2, textAlign: "right" }}>
              السائح الدولي
            </h3>
            <p className="font-body mb-[1.5vh]" style={{ fontSize: "1.4vw", color: "#CAA354", fontWeight: 700, textAlign: "right" }}>
              15 مليون+ سنوياً
            </p>
            <p className="font-body" style={{ fontSize: "1.28vw", color: "rgba(245,237,214,0.7)", lineHeight: 1.75, textAlign: "right" }}>
              سياح من 190+ دولة يحتاجون إرشاداً بلغاتهم وتجربة ثقافية عميقة وضمان أمان في رحلتهم
            </p>
          </div>
          <div
            className="flex flex-col flex-1 rounded-2xl"
            style={{
              background: "rgba(202,163,84,0.18)",
              border: "2px solid rgba(202,163,84,0.65)",
              borderTop: "4px solid #E8C97A",
              padding: "3vh 2vw",
              backdropFilter: "blur(8px)",
              boxShadow: "0 0 32px rgba(202,163,84,0.18)",
            }}
          >
            <div className="flex flex-row-reverse items-center justify-between mb-[1vh]">
              <p className="font-body" style={{ fontSize: "0.95vw", color: "#CAA354", fontWeight: 700, letterSpacing: "0.12em" }}>
                الفئة الثانية
              </p>
              <div
                style={{
                  background: "#CAA354",
                  borderRadius: "4px",
                  padding: "0.3vh 0.8vw",
                }}
              >
                <p className="font-body" style={{ fontSize: "0.9vw", color: "#0C0904", fontWeight: 800 }}>الهدف الرئيسي</p>
              </div>
            </div>
            <h3 className="font-display font-bold mb-[1vh]" style={{ fontSize: "1.9vw", color: "#F5EDD6", lineHeight: 1.2, textAlign: "right" }}>
              جيل الاستكشاف
            </h3>
            <p className="font-body mb-[1.5vh]" style={{ fontSize: "1.4vw", color: "#E8C97A", fontWeight: 700, textAlign: "right" }}>
              18 — 35 سنة
            </p>
            <p className="font-body" style={{ fontSize: "1.22vw", color: "rgba(245,237,214,0.78)", lineHeight: 1.75, textAlign: "right" }}>
              الفئة الأقل حضوراً في مصر حالياً رغم أنها الأعلى استهلاكاً للتجارب الرقمية. مسافرون مستقلون يريدون تجربة تاريخية غامرة بتقنية AR بعيداً عن الجولات التقليدية.
            </p>
          </div>
          <div
            className="flex flex-col flex-1 rounded-2xl"
            style={{
              background: "rgba(8,5,1,0.82)",
              border: "1px solid rgba(202,163,84,0.3)",
              borderTop: "3px solid #CAA354",
              padding: "3vh 2vw",
              backdropFilter: "blur(8px)",
            }}
          >
            <p className="font-body mb-[1vh]" style={{ fontSize: "0.95vw", color: "#CAA354", fontWeight: 700, textAlign: "right", letterSpacing: "0.12em" }}>
              الفئة الثالثة
            </p>
            <h3 className="font-display font-bold mb-[2vh]" style={{ fontSize: "1.9vw", color: "#F5EDD6", lineHeight: 1.2, textAlign: "right" }}>
              الباحثون والأكاديميون
            </h3>
            <p className="font-body mb-[1.5vh]" style={{ fontSize: "1.4vw", color: "#CAA354", fontWeight: 700, textAlign: "right" }}>
              طلاب ومختصون
            </p>
            <p className="font-body" style={{ fontSize: "1.28vw", color: "rgba(245,237,214,0.7)", lineHeight: 1.75, textAlign: "right" }}>
              يبحثون عن معلومات تاريخية موثوقة وتقارير أثرية تدعم أبحاثهم وزياراتهم الميدانية
            </p>
          </div>
          <div
            className="flex flex-col flex-1 rounded-2xl"
            style={{
              background: "rgba(8,5,1,0.82)",
              border: "1px solid rgba(202,163,84,0.3)",
              borderTop: "3px solid #CAA354",
              padding: "3vh 2vw",
              backdropFilter: "blur(8px)",
            }}
          >
            <p className="font-body mb-[1vh]" style={{ fontSize: "0.95vw", color: "#CAA354", fontWeight: 700, textAlign: "right", letterSpacing: "0.12em" }}>
              الفئة الرابعة
            </p>
            <h3 className="font-display font-bold mb-[2vh]" style={{ fontSize: "1.9vw", color: "#F5EDD6", lineHeight: 1.2, textAlign: "right" }}>
              السائح العائلي
            </h3>
            <p className="font-body mb-[1.5vh]" style={{ fontSize: "1.4vw", color: "#CAA354", fontWeight: 700, textAlign: "right" }}>
              عائلات ومجموعات
            </p>
            <p className="font-body" style={{ fontSize: "1.28vw", color: "rgba(245,237,214,0.7)", lineHeight: 1.75, textAlign: "right" }}>
              يحتاجون خطط رحلة متكاملة وضمان أمان وتجربة ترفيهية تعليمية مناسبة لجميع الأعمار
            </p>
          </div>
        </div>
      </div>
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{ height: "0.4vh", background: "linear-gradient(90deg, transparent, #CAA354, transparent)" }}
      />
    </div>
  );
}
