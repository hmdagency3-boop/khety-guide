const base = import.meta.env.BASE_URL;

export default function Slide06HowItWorks() {
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
        style={{ opacity: 0.4, objectPosition: "center 30%" }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(8,5,1,0.72) 0%, rgba(8,5,1,0.45) 45%, rgba(8,5,1,0.85) 100%)",
        }}
      />
      <div
        className="absolute top-0 left-0 right-0"
        style={{ height: "0.4vh", background: "linear-gradient(90deg, transparent, #CAA354, transparent)" }}
      />
      <div className="absolute inset-0 flex flex-col justify-center" style={{ padding: "0 7vw" }}>
        <div className="mb-[5vh]" style={{ textAlign: "right" }}>
          <p
            className="font-body mb-[1.5vh]"
            style={{ fontSize: "1.1vw", color: "#CAA354", fontWeight: 700, letterSpacing: "0.15em" }}
          >
            الأثر المتوقع على قطاع السياحة
          </p>
          <h2
            className="font-display font-bold"
            style={{ fontSize: "4vw", color: "#F5EDD6", textShadow: "0 2px 24px rgba(0,0,0,0.9)" }}
          >
            خيتي يُعيد تشكيل تجربة السياحة في مصر
          </h2>
        </div>
        <div className="flex flex-row-reverse" style={{ gap: "2.5vw" }}>
          <div
            className="flex flex-col flex-1 rounded-2xl"
            style={{ background: "rgba(8,5,1,0.85)", border: "1px solid rgba(202,163,84,0.28)", borderTop: "3px solid #CAA354", padding: "3.5vh 2.5vw", backdropFilter: "blur(10px)" }}
          >
            <p className="font-display font-bold leading-none mb-[1vh]" style={{ fontSize: "5.8vw", color: "#CAA354", textAlign: "right" }}>
              +35%
            </p>
            <p className="font-display font-bold mb-[1.5vh]" style={{ fontSize: "1.55vw", color: "#F5EDD6", textAlign: "right" }}>
              متوسط مدة الإقامة
            </p>
            <div style={{ width: "2vw", height: "1.5px", background: "#CAA354", marginBottom: "1.5vh", marginLeft: "auto" }} />
            <p className="font-body" style={{ fontSize: "1.25vw", color: "rgba(245,237,214,0.65)", lineHeight: 1.7, textAlign: "right" }}>
              التجربة الغنية تحفّز السياح على تمديد إقامتهم واكتشاف مزيد من المواقع
            </p>
          </div>
          <div
            className="flex flex-col flex-1 rounded-2xl"
            style={{ background: "rgba(202,163,84,0.18)", border: "2px solid rgba(202,163,84,0.5)", borderTop: "3px solid #E8C97A", padding: "3.5vh 2.5vw", backdropFilter: "blur(10px)" }}
          >
            <p className="font-display font-bold leading-none mb-[1vh]" style={{ fontSize: "5.8vw", color: "#CAA354", textAlign: "right" }}>
              +28%
            </p>
            <p className="font-display font-bold mb-[1.5vh]" style={{ fontSize: "1.55vw", color: "#F5EDD6", textAlign: "right" }}>
              متوسط إنفاق السائح
            </p>
            <div style={{ width: "2vw", height: "1.5px", background: "#CAA354", marginBottom: "1.5vh", marginLeft: "auto" }} />
            <p className="font-body" style={{ fontSize: "1.25vw", color: "rgba(245,237,214,0.65)", lineHeight: 1.7, textAlign: "right" }}>
              السائح المُوجَّه ينفق أكثر على التجارب والمنتجات المحلية بفضل الإرشاد الذكي
            </p>
          </div>
          <div
            className="flex flex-col flex-1 rounded-2xl"
            style={{ background: "rgba(8,5,1,0.85)", border: "1px solid rgba(202,163,84,0.28)", borderTop: "3px solid #CAA354", padding: "3.5vh 2.5vw", backdropFilter: "blur(10px)" }}
          >
            <p className="font-display font-bold leading-none mb-[1vh]" style={{ fontSize: "5.8vw", color: "#CAA354", textAlign: "right" }}>
              95%
            </p>
            <p className="font-display font-bold mb-[1.5vh]" style={{ fontSize: "1.55vw", color: "#F5EDD6", textAlign: "right" }}>
              معدل رضا المستخدمين
            </p>
            <div style={{ width: "2vw", height: "1.5px", background: "#CAA354", marginBottom: "1.5vh", marginLeft: "auto" }} />
            <p className="font-body" style={{ fontSize: "1.25vw", color: "rgba(245,237,214,0.65)", lineHeight: 1.7, textAlign: "right" }}>
              تجربة مخصصة ومتكاملة تضمن رضا السائح وتحوّله سفيراً لمصر
            </p>
          </div>
          <div
            className="flex flex-col flex-1 rounded-2xl"
            style={{ background: "rgba(8,5,1,0.85)", border: "1px solid rgba(202,163,84,0.28)", borderTop: "3px solid #CAA354", padding: "3.5vh 2.5vw", backdropFilter: "blur(10px)" }}
          >
            <p className="font-display font-bold leading-none mb-[1vh]" style={{ fontSize: "5.8vw", color: "#CAA354", textAlign: "right" }}>
              +40%
            </p>
            <p className="font-display font-bold mb-[1.5vh]" style={{ fontSize: "1.55vw", color: "#F5EDD6", textAlign: "right" }}>
              معدل العودة للزيارة
            </p>
            <div style={{ width: "2vw", height: "1.5px", background: "#CAA354", marginBottom: "1.5vh", marginLeft: "auto" }} />
            <p className="font-body" style={{ fontSize: "1.25vw", color: "rgba(245,237,214,0.65)", lineHeight: 1.7, textAlign: "right" }}>
              السائح الراضي يعود ويُوصي الآخرين ويرفع معدلات التسويق الشفهي
            </p>
          </div>
        </div>
        <p className="font-body mt-[3vh]" style={{ fontSize: "1.05vw", color: "rgba(202,163,84,0.4)", textAlign: "left" }}>
          * أرقام مستهدفة بناءً على دراسات مقارنة لتطبيقات السياحة الذكية عالمياً
        </p>
      </div>
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{ height: "0.4vh", background: "linear-gradient(90deg, transparent, #CAA354, transparent)" }}
      />
    </div>
  );
}
