const base = import.meta.env.BASE_URL;

export default function Slide08Plans() {
  return (
    <div
      dir="rtl"
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: "#080501" }}
    >
      <img
        src={`${base}karnak-hall.png`}
        crossOrigin="anonymous"
        className="absolute inset-0 w-full h-full object-cover"
        alt="معبد الكرنك"
        style={{ opacity: 0.18, objectPosition: "center 35%" }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(8,5,1,0.78) 0%, rgba(8,5,1,0.55) 45%, rgba(8,5,1,0.88) 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(202,163,84,0.1) 0%, transparent 50%)",
        }}
      />
      <div
        className="absolute top-0 left-0 right-0"
        style={{ height: "0.4vh", background: "linear-gradient(90deg, transparent, #CAA354, transparent)" }}
      />

      <div className="absolute inset-0 flex flex-col" style={{ padding: "5vh 7vw" }}>

        {/* Header */}
        <div className="mb-[3vh]" style={{ textAlign: "right" }}>
          <p
            className="font-body mb-[0.8vh]"
            style={{ fontSize: "1.1vw", color: "#CAA354", fontWeight: 700, letterSpacing: "0.15em" }}
          >
            الأثر القومي الاستراتيجي
          </p>
          <h2
            className="font-display font-bold"
            style={{ fontSize: "3.6vw", color: "#F5EDD6", lineHeight: 1.2 }}
          >
            خيتي ليس تطبيقاً — بل رافعة للاقتصاد الوطني
          </h2>
        </div>

        {/* 2×2 Grid */}
        <div className="grid flex-1" style={{ gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: "2vh 2.5vw" }}>

          {/* 1 — فتح الأسواق المجهولة */}
          <div
            className="rounded-2xl flex flex-col"
            style={{
              background: "rgba(202,163,84,0.12)",
              border: "1.5px solid rgba(202,163,84,0.45)",
              borderRight: "4px solid #E8C97A",
              padding: "2.5vh 2.5vw",
              backdropFilter: "blur(10px)",
            }}
          >
            <div className="flex flex-row-reverse items-start justify-between mb-[1.2vh]">
              <p className="font-display font-bold" style={{ fontSize: "3.5vw", color: "#CAA354", lineHeight: 1 }}>𓆓</p>
              <div
                style={{
                  background: "#E8C97A",
                  borderRadius: "4px",
                  padding: "0.3vh 0.9vw",
                }}
              >
                <p className="font-body" style={{ fontSize: "0.85vw", color: "#0C0904", fontWeight: 800, letterSpacing: "0.08em" }}>فرصة غير مستغَلة</p>
              </div>
            </div>
            <p className="font-display font-bold mb-[0.8vh]" style={{ fontSize: "1.75vw", color: "#F5EDD6", textAlign: "right" }}>
              فتح أسواق سياحية بكر
            </p>
            <p className="font-body" style={{ fontSize: "1.2vw", color: "rgba(245,237,214,0.75)", lineHeight: 1.75, textAlign: "right" }}>
              اليابان وكوريا وإندونيسيا تُصدّر عشرات الملايين من السياح سنوياً — لم يصلوا لمصر بسبب حاجز اللغة وحده. خيتي يُسقط هذا الحاجز ويفتح أسواقاً لم تطأها أقدام السياح المصرية من قبل.
            </p>
          </div>

          {/* 2 — بيانات استراتيجية للدولة */}
          <div
            className="rounded-2xl flex flex-col"
            style={{
              background: "rgba(8,5,1,0.85)",
              border: "1px solid rgba(202,163,84,0.3)",
              borderRight: "4px solid #CAA354",
              padding: "2.5vh 2.5vw",
              backdropFilter: "blur(10px)",
            }}
          >
            <div className="flex flex-row-reverse items-start justify-between mb-[1.2vh]">
              <p className="font-display font-bold" style={{ fontSize: "3.5vw", color: "#CAA354", lineHeight: 1 }}>𓂧</p>
              <div
                style={{
                  border: "1px solid rgba(202,163,84,0.5)",
                  borderRadius: "4px",
                  padding: "0.3vh 0.9vw",
                }}
              >
                <p className="font-body" style={{ fontSize: "0.85vw", color: "#CAA354", fontWeight: 700, letterSpacing: "0.08em" }}>شراكة حكومية</p>
              </div>
            </div>
            <p className="font-display font-bold mb-[0.8vh]" style={{ fontSize: "1.75vw", color: "#F5EDD6", textAlign: "right" }}>
              بيانات استراتيجية لوزارة السياحة
            </p>
            <p className="font-body" style={{ fontSize: "1.2vw", color: "rgba(245,237,214,0.75)", lineHeight: 1.75, textAlign: "right" }}>
              تحليلات سلوك السائح في الوقت الفعلي — أين يتجمعون، ما يُنفقون عليه، والمناطق ضعيفة الجذب. بيانات تُعيد توجيه الاستثمار في البنية التحتية السياحية بدقة علمية.
            </p>
          </div>

          {/* 3 — توجيه الإنفاق للداخل */}
          <div
            className="rounded-2xl flex flex-col"
            style={{
              background: "rgba(8,5,1,0.85)",
              border: "1px solid rgba(202,163,84,0.3)",
              borderRight: "4px solid #CAA354",
              padding: "2.5vh 2.5vw",
              backdropFilter: "blur(10px)",
            }}
          >
            <div className="flex flex-row-reverse items-start justify-between mb-[1.2vh]">
              <p className="font-display font-bold" style={{ fontSize: "3.5vw", color: "#CAA354", lineHeight: 1 }}>𓃀</p>
              <div
                style={{
                  border: "1px solid rgba(202,163,84,0.5)",
                  borderRadius: "4px",
                  padding: "0.3vh 0.9vw",
                }}
              >
                <p className="font-body" style={{ fontSize: "0.85vw", color: "#CAA354", fontWeight: 700, letterSpacing: "0.08em" }}>الاقتصاد غير الرسمي</p>
              </div>
            </div>
            <p className="font-display font-bold mb-[0.8vh]" style={{ fontSize: "1.75vw", color: "#F5EDD6", textAlign: "right" }}>
              إعادة الإنفاق السياحي للداخل المصري
            </p>
            <p className="font-body" style={{ fontSize: "1.2vw", color: "rgba(245,237,214,0.75)", lineHeight: 1.75, textAlign: "right" }}>
              السائح غير المُوجَّه ينفق في شركات أجنبية وسلاسل دولية. خيتي يُوصّله بالحرفي المحلي والمطعم الأصيل والمرشد المصري — فيتحول الإنفاق السياحي إلى دخل شعبي حقيقي.
            </p>
          </div>

          {/* 4 — تمديد موسم السياحة */}
          <div
            className="rounded-2xl flex flex-col"
            style={{
              background: "rgba(8,5,1,0.85)",
              border: "1px solid rgba(202,163,84,0.3)",
              borderRight: "4px solid #CAA354",
              padding: "2.5vh 2.5vw",
              backdropFilter: "blur(10px)",
            }}
          >
            <div className="flex flex-row-reverse items-start justify-between mb-[1.2vh]">
              <p className="font-display font-bold" style={{ fontSize: "3.5vw", color: "#CAA354", lineHeight: 1 }}>𓇼</p>
              <div
                style={{
                  border: "1px solid rgba(202,163,84,0.5)",
                  borderRadius: "4px",
                  padding: "0.3vh 0.9vw",
                }}
              >
                <p className="font-body" style={{ fontSize: "0.85vw", color: "#CAA354", fontWeight: 700, letterSpacing: "0.08em" }}>توزيع الضغط</p>
              </div>
            </div>
            <p className="font-display font-bold mb-[0.8vh]" style={{ fontSize: "1.75vw", color: "#F5EDD6", textAlign: "right" }}>
              تمديد الموسم السياحي طوال العام
            </p>
            <p className="font-body" style={{ fontSize: "1.2vw", color: "rgba(245,237,214,0.75)", lineHeight: 1.75, textAlign: "right" }}>
              70% من السياحة المصرية في موسم واحد. خيتي يُقنع السائح باكتشاف سيوة والواحات وجنوب مصر — يُوزّع الإنفاق على الجمهورية ويُخفّف ضغط الإفراط السياحي على القاهرة والأقصر.
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
