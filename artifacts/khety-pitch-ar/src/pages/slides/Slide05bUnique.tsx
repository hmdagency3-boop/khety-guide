export default function Slide05bUnique() {
  return (
    <div
      dir="rtl"
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: "#080501" }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 70% 20%, rgba(202,163,84,0.1) 0%, transparent 45%), radial-gradient(ellipse at 20% 80%, rgba(202,163,84,0.07) 0%, transparent 40%)",
        }}
      />
      <div
        className="absolute top-0 left-0 right-0"
        style={{ height: "0.4vh", background: "linear-gradient(90deg, transparent, #CAA354, transparent)" }}
      />

      <div className="absolute inset-0 flex flex-col" style={{ padding: "5vh 7vw" }}>
        <div className="mb-[3.5vh]" style={{ textAlign: "right" }}>
          <p
            className="font-body mb-[0.8vh]"
            style={{ fontSize: "1.1vw", color: "#CAA354", fontWeight: 700, letterSpacing: "0.15em" }}
          >
            مميزات حصرية
          </p>
          <h2
            className="font-display font-bold"
            style={{ fontSize: "3.8vw", color: "#F5EDD6" }}
          >
            ما لا يملكه أي منافس آخر
          </h2>
        </div>

        <div className="grid flex-1" style={{ gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: "2.2vh 2.5vw" }}>

          {/* العصر الذهبي */}
          <div
            className="rounded-2xl flex flex-col justify-between"
            style={{
              background: "rgba(202,163,84,0.1)",
              border: "1.5px solid rgba(202,163,84,0.45)",
              borderTop: "3px solid #E8C97A",
              padding: "3vh 2.5vw",
              backdropFilter: "blur(10px)",
            }}
          >
            <div>
              <div className="flex flex-row-reverse items-center justify-between mb-[1.5vh]">
                <p style={{ fontSize: "2.8vw", lineHeight: 1 }}>𓇳</p>
                <span
                  style={{
                    fontSize: "0.85vw",
                    color: "#0C0904",
                    background: "#E8C97A",
                    padding: "0.3vh 0.8vw",
                    borderRadius: "4px",
                    fontWeight: 800,
                    letterSpacing: "0.1em",
                  }}
                  className="font-body"
                >
                  حصري عالمياً
                </span>
              </div>
              <p className="font-display font-bold mb-[1vh]" style={{ fontSize: "1.8vw", color: "#F5EDD6", textAlign: "right" }}>
                العصر الذهبي
              </p>
              <p className="font-body" style={{ fontSize: "1.25vw", color: "rgba(245,237,214,0.72)", lineHeight: 1.75, textAlign: "right" }}>
                وجّه كاميرتك نحو أي أثر فرعوني — والذكاء الاصطناعي يُعيد له ألوانه وبريقه كما كان منذ آلاف السنين. تقنية لا يوجد مثيل لها في أي تطبيق سياحي في العالم.
              </p>
            </div>
          </div>

          {/* ابحث عن مرشد */}
          <div
            className="rounded-2xl flex flex-col justify-between"
            style={{
              background: "rgba(8,5,1,0.85)",
              border: "1px solid rgba(202,163,84,0.28)",
              borderTop: "3px solid #CAA354",
              padding: "3vh 2.5vw",
              backdropFilter: "blur(10px)",
            }}
          >
            <div>
              <div className="flex flex-row-reverse items-center justify-between mb-[1.5vh]">
                <p style={{ fontSize: "2.2vw", lineHeight: 1 }}>𓂀</p>
                <span
                  style={{
                    fontSize: "0.85vw",
                    color: "#CAA354",
                    border: "1px solid rgba(202,163,84,0.5)",
                    padding: "0.3vh 0.8vw",
                    borderRadius: "4px",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                  }}
                  className="font-body"
                >
                  يدعم الاقتصاد المحلي
                </span>
              </div>
              <p className="font-display font-bold mb-[1vh]" style={{ fontSize: "1.8vw", color: "#F5EDD6", textAlign: "right" }}>
                ابحث عن مرشد بشري
              </p>
              <p className="font-body" style={{ fontSize: "1.25vw", color: "rgba(245,237,214,0.72)", lineHeight: 1.75, textAlign: "right" }}>
                مرشدون سياحيون مرخصون مصنَّفون بالتقييم واللغة والسعر والتخصص. خيتي لا يُلغي المرشد البشري — بل يُوصّل السائح بالمرشد المناسب لغته وميزانيته.
              </p>
            </div>
          </div>

          {/* دليل المواصلات */}
          <div
            className="rounded-2xl flex flex-col justify-between"
            style={{
              background: "rgba(8,5,1,0.85)",
              border: "1px solid rgba(202,163,84,0.28)",
              borderTop: "3px solid #CAA354",
              padding: "3vh 2.5vw",
              backdropFilter: "blur(10px)",
            }}
          >
            <div>
              <div className="flex flex-row-reverse items-center justify-between mb-[1.5vh]">
                <p style={{ fontSize: "2.2vw", lineHeight: 1 }}>𓂉</p>
                <span
                  style={{
                    fontSize: "0.85vw",
                    color: "#CAA354",
                    border: "1px solid rgba(202,163,84,0.5)",
                    padding: "0.3vh 0.8vw",
                    borderRadius: "4px",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                  }}
                  className="font-body"
                >
                  استقلالية تامة
                </span>
              </div>
              <p className="font-display font-bold mb-[1vh]" style={{ fontSize: "1.8vw", color: "#F5EDD6", textAlign: "right" }}>
                دليل المواصلات العامة
              </p>
              <p className="font-body" style={{ fontSize: "1.25vw", color: "rgba(245,237,214,0.72)", lineHeight: 1.75, textAlign: "right" }}>
                مترو القاهرة بكامل خطوطه الثلاثة، 70+ محطة، أوقات التشغيل، وتفاصيل التحويل — حماية السائح من الاستغلال وتحقيق استقلالية حقيقية في التنقل.
              </p>
            </div>
          </div>

          {/* محتوى موثق + إشعارات */}
          <div
            className="rounded-2xl flex flex-col justify-between"
            style={{
              background: "rgba(8,5,1,0.85)",
              border: "1px solid rgba(202,163,84,0.28)",
              borderTop: "3px solid #CAA354",
              padding: "3vh 2.5vw",
              backdropFilter: "blur(10px)",
            }}
          >
            <div>
              <div className="flex flex-row-reverse items-center justify-between mb-[1.5vh]">
                <p style={{ fontSize: "2.2vw", lineHeight: 1 }}>𓃭</p>
                <span
                  style={{
                    fontSize: "0.85vw",
                    color: "#CAA354",
                    border: "1px solid rgba(202,163,84,0.5)",
                    padding: "0.3vh 0.8vw",
                    borderRadius: "4px",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                  }}
                  className="font-body"
                >
                  ثقة وموثوقية
                </span>
              </div>
              <p className="font-display font-bold mb-[1vh]" style={{ fontSize: "1.8vw", color: "#F5EDD6", textAlign: "right" }}>
                محتوى موثَّق + إشعارات ذكية
              </p>
              <p className="font-body" style={{ fontSize: "1.25vw", color: "rgba(245,237,214,0.72)", lineHeight: 1.75, textAlign: "right" }}>
                شارة KHETY الرسمية على كل معلومة يولّدها الذكاء الاصطناعي، مع إشعارات استباقية تصل للسائح حتى قبل فتح التطبيق — تنبيهات أمان، توقيت مواقع، وعروض.
              </p>
            </div>
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
