export default function Slide05Travelers() {
  return (
    <div
      dir="rtl"
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: "#0C0904" }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at 50% 0%, rgba(202,163,84,0.09) 0%, transparent 52%), radial-gradient(ellipse at 50% 100%, rgba(202,163,84,0.06) 0%, transparent 45%)",
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
            مميزات التطبيق للسائح
          </p>
          <h2
            className="font-display font-bold"
            style={{ fontSize: "4vw", color: "#F5EDD6" }}
          >
            ست مميزات تُحوِّل رحلتك إلى تجربة استثنائية
          </h2>
        </div>
        <div className="flex flex-row-reverse flex-1" style={{ gap: "2vw" }}>
          <div className="flex flex-col flex-1" style={{ gap: "2vh" }}>
            <div
              className="flex-1 rounded-2xl"
              style={{ background: "rgba(202,163,84,0.07)", border: "1px solid rgba(202,163,84,0.22)", borderTop: "2px solid #CAA354", padding: "2.5vh 2vw" }}
            >
              <p className="font-display font-bold mb-[0.5vh]" style={{ fontSize: "0.95vw", color: "#CAA354", textAlign: "right", letterSpacing: "0.1em" }}>01</p>
              <p className="font-display font-bold mb-[0.8vh]" style={{ fontSize: "1.7vw", color: "#F5EDD6", textAlign: "right" }}>مساعد AI تفاعلي</p>
              <p className="font-body" style={{ fontSize: "1.25vw", color: "rgba(245,237,214,0.65)", lineHeight: 1.7, textAlign: "right" }}>
                يجيب على أسئلتك عن التاريخ والثقافة والأكل والخدمات بلغتك على مدار الساعة
              </p>
            </div>
            <div
              className="flex-1 rounded-2xl"
              style={{ background: "rgba(202,163,84,0.07)", border: "1px solid rgba(202,163,84,0.22)", borderTop: "2px solid #CAA354", padding: "2.5vh 2vw" }}
            >
              <p className="font-display font-bold mb-[0.5vh]" style={{ fontSize: "0.95vw", color: "#CAA354", textAlign: "right", letterSpacing: "0.1em" }}>02</p>
              <p className="font-display font-bold mb-[0.8vh]" style={{ fontSize: "1.7vw", color: "#F5EDD6", textAlign: "right" }}>ماسح AR للمعالم</p>
              <p className="font-body" style={{ fontSize: "1.25vw", color: "rgba(245,237,214,0.65)", lineHeight: 1.7, textAlign: "right" }}>
                وجّه كاميرتك نحو أي معلم لتكتشف تاريخه وحقبته فوراً عبر الواقع المعزز
              </p>
            </div>
          </div>
          <div className="flex flex-col flex-1" style={{ gap: "2vh" }}>
            <div
              className="flex-1 rounded-2xl"
              style={{ background: "rgba(202,163,84,0.14)", border: "1.5px solid rgba(202,163,84,0.45)", borderTop: "2px solid #E8C97A", padding: "2.5vh 2vw" }}
            >
              <p className="font-display font-bold mb-[0.5vh]" style={{ fontSize: "0.95vw", color: "#CAA354", textAlign: "right", letterSpacing: "0.1em" }}>03</p>
              <p className="font-display font-bold mb-[0.8vh]" style={{ fontSize: "1.7vw", color: "#F5EDD6", textAlign: "right" }}>خريطة المعالم التفاعلية</p>
              <p className="font-body" style={{ fontSize: "1.25vw", color: "rgba(245,237,214,0.65)", lineHeight: 1.7, textAlign: "right" }}>
                50+ موقعاً أثرياً مع أوقات العمل والأسعار والتقييمات والنصائح من القاهرة لأبو سمبل
              </p>
            </div>
            <div
              className="flex-1 rounded-2xl"
              style={{ background: "rgba(202,163,84,0.14)", border: "1.5px solid rgba(202,163,84,0.45)", borderTop: "2px solid #E8C97A", padding: "2.5vh 2vw" }}
            >
              <p className="font-display font-bold mb-[0.5vh]" style={{ fontSize: "0.95vw", color: "#CAA354", textAlign: "right", letterSpacing: "0.1em" }}>04</p>
              <p className="font-display font-bold mb-[0.8vh]" style={{ fontSize: "1.7vw", color: "#F5EDD6", textAlign: "right" }}>مركز الأمان والطوارئ</p>
              <p className="font-body" style={{ fontSize: "1.25vw", color: "rgba(245,237,214,0.65)", lineHeight: 1.7, textAlign: "right" }}>
                "محامي رقمي" في جيبك — الأسعار الحقيقية، تنبيهات الاستغلال، وحقوق السائح القانونية بدون إنترنت في أي مكان
              </p>
            </div>
          </div>
          <div className="flex flex-col flex-1" style={{ gap: "2vh" }}>
            <div
              className="flex-1 rounded-2xl"
              style={{ background: "rgba(202,163,84,0.07)", border: "1px solid rgba(202,163,84,0.22)", borderTop: "2px solid #CAA354", padding: "2.5vh 2vw" }}
            >
              <p className="font-display font-bold mb-[0.5vh]" style={{ fontSize: "0.95vw", color: "#CAA354", textAlign: "right", letterSpacing: "0.1em" }}>05</p>
              <p className="font-display font-bold mb-[0.8vh]" style={{ fontSize: "1.7vw", color: "#F5EDD6", textAlign: "right" }}>مجتمع المسافر المستقل</p>
              <p className="font-body" style={{ fontSize: "1.25vw", color: "rgba(245,237,214,0.65)", lineHeight: 1.7, textAlign: "right" }}>
                للـ Solo Traveler — شارك مساراتك وتجاربك واستلهم رحلة مخصصة من مجتمع عالمي بلا أتوبيس سياحي
              </p>
            </div>
            <div
              className="flex-1 rounded-2xl"
              style={{ background: "rgba(202,163,84,0.07)", border: "1px solid rgba(202,163,84,0.22)", borderTop: "2px solid #CAA354", padding: "2.5vh 2vw" }}
            >
              <p className="font-display font-bold mb-[0.5vh]" style={{ fontSize: "0.95vw", color: "#CAA354", textAlign: "right", letterSpacing: "0.1em" }}>06</p>
              <p className="font-display font-bold mb-[0.8vh]" style={{ fontSize: "1.7vw", color: "#F5EDD6", textAlign: "right" }}>دعم كل لغات العالم</p>
              <p className="font-body" style={{ fontSize: "1.25vw", color: "rgba(245,237,214,0.65)", lineHeight: 1.7, textAlign: "right" }}>
                يتحدث خيتي بلغة السائح مهما كانت نادرة — حيث لا يوجد مرشد بشري في مصر يتكلمها
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
