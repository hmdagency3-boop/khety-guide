const base = import.meta.env.BASE_URL;

export default function Slide07AR() {
  return (
    <div
      dir="rtl"
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: "#060402" }}
    >
      <img
        src={`${base}cairo-nile-aerial.png`}
        crossOrigin="anonymous"
        className="absolute inset-0 w-full h-full object-cover"
        alt="مدينة القاهرة ونهر النيل من الجو"
        style={{ opacity: 0.55, objectPosition: "center" }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(270deg, rgba(6,4,2,0.97) 0%, rgba(6,4,2,0.82) 40%, rgba(6,4,2,0.35) 70%, rgba(6,4,2,0.5) 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at 50% 100%, rgba(202,163,84,0.08) 0%, transparent 50%)",
        }}
      />
      <div
        className="absolute top-0 left-0 right-0"
        style={{ height: "0.4vh", background: "linear-gradient(90deg, transparent, #CAA354, transparent)" }}
      />
      <div className="absolute inset-0 flex" style={{ padding: "7vh 7vw" }}>
        <div className="flex flex-col justify-center" style={{ flex: 1, paddingLeft: "5vw" }}>
          <p
            className="font-body mb-[2vh]"
            style={{ fontSize: "1.1vw", color: "#CAA354", fontWeight: 700, textAlign: "right", letterSpacing: "0.15em" }}
          >
            الأثر الاقتصادي
          </p>
          <h2
            className="font-display font-bold leading-tight mb-[4vh]"
            style={{ fontSize: "3.8vw", color: "#F5EDD6", textAlign: "right", textShadow: "0 2px 20px rgba(0,0,0,0.8)" }}
          >
            كيف يُسهم خيتي في تنمية الاقتصاد المصري؟
          </h2>
          <div className="flex flex-col" style={{ gap: "2.8vh" }}>
            <div
              className="rounded-xl"
              style={{ background: "rgba(6,4,2,0.82)", border: "1px solid rgba(202,163,84,0.25)", borderRight: "3px solid #CAA354", padding: "2vh 2vw", backdropFilter: "blur(8px)" }}
            >
              <p className="font-display font-bold mb-[0.7vh]" style={{ fontSize: "1.7vw", color: "#F5EDD6", textAlign: "right" }}>
                خلق فرص العمل المباشرة وغير المباشرة
              </p>
              <p className="font-body" style={{ fontSize: "1.3vw", color: "rgba(245,237,214,0.68)", lineHeight: 1.7, textAlign: "right" }}>
                ميزة "ابحث عن مرشد" تُوصّل السياح بالمرشدين المرخصين مباشرةً — دخل مباشر للعمالة السياحية المصرية دون وسيط
              </p>
            </div>
            <div
              className="rounded-xl"
              style={{ background: "rgba(6,4,2,0.82)", border: "1px solid rgba(202,163,84,0.25)", borderRight: "3px solid #CAA354", padding: "2vh 2vw", backdropFilter: "blur(8px)" }}
            >
              <p className="font-display font-bold mb-[0.7vh]" style={{ fontSize: "1.7vw", color: "#F5EDD6", textAlign: "right" }}>
                رفع الإيرادات السياحية القومية
              </p>
              <p className="font-body" style={{ fontSize: "1.3vw", color: "rgba(245,237,214,0.68)", lineHeight: 1.7, textAlign: "right" }}>
                زيادة إنفاق السائح وإطالة مدة إقامته يضخّان مليارات إضافية في الاقتصاد الوطني
              </p>
            </div>
            <div
              className="rounded-xl"
              style={{ background: "rgba(6,4,2,0.82)", border: "1px solid rgba(202,163,84,0.25)", borderRight: "3px solid #CAA354", padding: "2vh 2vw", backdropFilter: "blur(8px)" }}
            >
              <p className="font-display font-bold mb-[0.7vh]" style={{ fontSize: "1.7vw", color: "#F5EDD6", textAlign: "right" }}>
                دعم المشاريع الصغيرة والمتوسطة المحلية
              </p>
              <p className="font-body" style={{ fontSize: "1.3vw", color: "rgba(245,237,214,0.68)", lineHeight: 1.7, textAlign: "right" }}>
                توجيه السياح للمحلات والمطاعم والحرفيين المحليين يُعزز الاقتصاد غير الرسمي
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
        <div className="flex flex-col justify-center" style={{ width: "26vw" }}>
          <p className="font-body mb-[1.5vh]" style={{ fontSize: "1.05vw", color: "rgba(202,163,84,0.7)", textAlign: "right", letterSpacing: "0.1em" }}>
            السياحة في الاقتصاد المصري
          </p>
          <p className="font-display font-bold leading-none mb-[0.4vh]" style={{ fontSize: "9vw", color: "#CAA354", textAlign: "right" }}>
            12%
          </p>
          <p className="font-body mb-[2.5vh]" style={{ fontSize: "1.4vw", color: "#F5EDD6", textAlign: "right" }}>
            من الناتج المحلي الإجمالي
          </p>
          <div style={{ height: "1px", background: "rgba(202,163,84,0.35)", marginBottom: "2.5vh" }} />
          <p className="font-display font-bold leading-none mb-[0.4vh]" style={{ fontSize: "6.5vw", color: "#CAA354", textAlign: "right" }}>
            3M+
          </p>
          <p className="font-body mb-[2.5vh]" style={{ fontSize: "1.4vw", color: "#F5EDD6", textAlign: "right" }}>
            وظيفة مباشرة وغير مباشرة
          </p>
          <div style={{ height: "1px", background: "rgba(202,163,84,0.35)", marginBottom: "2.5vh" }} />
          <p className="font-display font-bold leading-none mb-[0.4vh]" style={{ fontSize: "6.5vw", color: "#CAA354", textAlign: "right" }}>
            $13B
          </p>
          <p className="font-body" style={{ fontSize: "1.4vw", color: "#F5EDD6", textAlign: "right" }}>
            إيرادات سياحية سنوية
          </p>
        </div>
      </div>
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{ height: "0.4vh", background: "linear-gradient(90deg, transparent, #CAA354, transparent)" }}
      />
    </div>
  );
}
