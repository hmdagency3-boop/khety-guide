const base = import.meta.env.BASE_URL;

export default function Slide02Challenge() {
  return (
    <div
      dir="rtl"
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: "#0C0904" }}
    >
      <img
        src={`${base}karnak-hall.png`}
        crossOrigin="anonymous"
        className="absolute inset-0 w-full h-full object-cover"
        alt="قاعة هيبوستيل في معبد الكرنك"
        style={{ opacity: 0.22, objectPosition: "center" }}
      />
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse at 18% 50%, rgba(202,163,84,0.1) 0%, transparent 58%)" }}
      />
      <div
        className="absolute top-0 left-0 right-0"
        style={{ height: "0.4vh", background: "linear-gradient(270deg, #CAA354, rgba(202,163,84,0.1))" }}
      />
      <div className="absolute inset-0 flex" style={{ padding: "7vh 7vw" }}>
        <div className="flex flex-col justify-center" style={{ flex: 1, paddingLeft: "4.5vw" }}>
          <p
            className="font-body mb-[1.5vh]"
            style={{ fontSize: "1.1vw", color: "#CAA354", fontWeight: 700, textAlign: "right", letterSpacing: "0.15em" }}
          >
            مشكلة البحث
          </p>
          <p
            className="font-display font-bold mb-[5vh]"
            style={{ fontSize: "2.8vw", color: "#F5EDD6", textAlign: "right", lineHeight: 1.3 }}
          >
            قطاع السياحة المصري يملك إمكانات ضخمة لم تُستغَل
          </p>
          <div className="flex flex-col" style={{ gap: "3vh" }}>
            <div
              className="rounded-xl"
              style={{ background: "rgba(12,9,4,0.7)", border: "1px solid rgba(202,163,84,0.25)", borderRight: "3px solid #CAA354", padding: "2.2vh 2vw 2.2vh 2vw" }}
            >
              <p className="font-display font-bold mb-[0.8vh]" style={{ fontSize: "1.65vw", color: "#F5EDD6", textAlign: "right" }}>
                حاجز اللغة — وخاصةً اللغات النادرة
              </p>
              <p className="font-body" style={{ fontSize: "1.35vw", color: "rgba(245,237,214,0.65)", lineHeight: 1.7, textAlign: "right" }}>
                سياح من دول كاليابان وكوريا وإندونيسيا والدول الاسكندنافية لا يجدون مرشدين في مصر يتحدثون لغاتهم — فيغادرون دون أن يفهموا ما رأوه
              </p>
            </div>
            <div
              className="rounded-xl"
              style={{ background: "rgba(12,9,4,0.7)", border: "1px solid rgba(202,163,84,0.25)", borderRight: "3px solid #CAA354", padding: "2.2vh 2vw" }}
            >
              <p className="font-display font-bold mb-[0.8vh]" style={{ fontSize: "1.65vw", color: "#F5EDD6", textAlign: "right" }}>
                المعلومات المشوَّهة والنصب السياحي
              </p>
              <p className="font-body" style={{ fontSize: "1.35vw", color: "rgba(245,237,214,0.65)", lineHeight: 1.7, textAlign: "right" }}>
                غياب مرجع رقمي موثوق يخبر السائح بالسعر الحقيقي وحقوقه القانونية لحظة المشكلة — فيقع ضحية الاستغلال بلا حماية ولا مرجع
              </p>
            </div>
            <div
              className="rounded-xl"
              style={{ background: "rgba(202,163,84,0.1)", border: "1.5px solid rgba(202,163,84,0.45)", borderRight: "3px solid #E8C97A", padding: "2.2vh 2vw" }}
            >
              <p className="font-display font-bold mb-[0.8vh]" style={{ fontSize: "1.65vw", color: "#E8C97A", textAlign: "right" }}>
                غياب السائح الشاب — فرصة ضائعة
              </p>
              <p className="font-body" style={{ fontSize: "1.35vw", color: "rgba(245,237,214,0.75)", lineHeight: 1.7, textAlign: "right" }}>
                أغلب سياح مصر الحاليين فوق الـ 50 سنة — فئة الشباب (18–35) غائبة تقريباً رغم أنها الأعلى إنفاقاً على التجارب الرقمية والاستكشاف في العالم
              </p>
            </div>
          </div>
        </div>
        <div
          className="flex-shrink-0"
          style={{
            width: "1px",
            background: "linear-gradient(to bottom, transparent, rgba(202,163,84,0.45) 25%, rgba(202,163,84,0.45) 75%, transparent)",
            margin: "0 4vw",
          }}
        />
        <div className="flex flex-col justify-center" style={{ width: "27vw" }}>
          <p className="font-body mb-[1vh]" style={{ fontSize: "1.1vw", color: "#CAA354", fontWeight: 700, textAlign: "right" }}>
            حجم الفرصة
          </p>
          <p
            className="font-display font-bold leading-none mb-[0.3vh]"
            style={{ fontSize: "11vw", color: "#CAA354", textAlign: "right" }}
          >
            15M
          </p>
          <p className="font-display font-semibold mb-[3vh]" style={{ fontSize: "1.6vw", color: "#F5EDD6", textAlign: "right" }}>
            سائح دولي سنوياً
          </p>
          <div style={{ height: "1px", background: "rgba(202,163,84,0.35)", marginBottom: "2.5vh" }} />
          <p className="font-body mb-[0.5vh]" style={{ fontSize: "1.1vw", color: "#CAA354", fontWeight: 700, textAlign: "right" }}>
            مساهمة السياحة في الناتج المحلي
          </p>
          <p className="font-display font-bold leading-none mb-[0.5vh]" style={{ fontSize: "7.5vw", color: "#F5EDD6", textAlign: "right" }}>
            12%
          </p>
          <p className="font-body mb-[2.5vh]" style={{ fontSize: "1.3vw", color: "rgba(245,237,214,0.5)", textAlign: "right" }}>
            من الناتج المحلي الإجمالي لمصر
          </p>
          <div style={{ height: "1px", background: "rgba(202,163,84,0.35)", marginBottom: "2.5vh" }} />
          <p className="font-body mb-[0.5vh]" style={{ fontSize: "1.1vw", color: "#CAA354", fontWeight: 700, textAlign: "right" }}>
            الإيرادات السياحية السنوية
          </p>
          <p className="font-display font-bold leading-none" style={{ fontSize: "5.5vw", color: "#F5EDD6", textAlign: "right" }}>
            $13B
          </p>
        </div>
      </div>
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{ height: "0.4vh", background: "linear-gradient(270deg, rgba(202,163,84,0.1), #CAA354)" }}
      />
    </div>
  );
}
