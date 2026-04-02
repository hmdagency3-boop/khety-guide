import { IconObelisk, IconMetroPath, IconShieldCheck, IconDiningPlate } from "@/components/Icons";

const base = import.meta.env.BASE_URL;

export default function Slide04Features() {
  return (
    <div
      dir="rtl"
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: "#080501" }}
    >
      <img
        src={`${base}ar-phone-monument.png`}
        crossOrigin="anonymous"
        className="absolute inset-0 w-full h-full object-cover"
        alt="تجربة السياحة في مصر"
        style={{ opacity: 0.12, objectPosition: "center" }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(8,5,1,0.85) 0%, rgba(8,5,1,0.6) 45%, rgba(8,5,1,0.92) 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 80% 20%, rgba(202,163,84,0.08) 0%, transparent 50%)",
        }}
      />
      <div
        className="absolute top-0 left-0 right-0"
        style={{ height: "0.4vh", background: "linear-gradient(90deg, transparent, #CAA354, transparent)" }}
      />

      <div className="absolute inset-0 flex flex-col" style={{ padding: "5vh 7vw" }}>

        {/* Header */}
        <div className="mb-[3.5vh]" style={{ textAlign: "right" }}>
          <p
            className="font-body mb-[0.8vh]"
            style={{ fontSize: "1.1vw", color: "#CAA354", fontWeight: 700, letterSpacing: "0.15em" }}
          >
            لماذا يحتاجه السائح فعلاً؟
          </p>
          <h2
            className="font-display font-bold"
            style={{ fontSize: "3.8vw", color: "#F5EDD6", lineHeight: 1.2 }}
          >
            أربع لحظات تُغيّر تجربة الزيارة كلها
          </h2>
        </div>

        {/* 2×2 grid of human moments */}
        <div className="grid flex-1" style={{ gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: "2vh 2.5vw" }}>

          {/* 1 */}
          <div
            className="rounded-2xl flex flex-col"
            style={{
              background: "rgba(202,163,84,0.1)",
              border: "1.5px solid rgba(202,163,84,0.4)",
              borderRight: "4px solid #E8C97A",
              padding: "2.5vh 2.5vw",
              backdropFilter: "blur(8px)",
            }}
          >
            <div className="flex flex-row-reverse items-start justify-between mb-[1.2vh]">
              <div style={{ width: "2.8vw", height: "2.8vw" }}><IconObelisk color="#E8C97A" /></div>
              <p
                className="font-body"
                style={{ fontSize: "0.9vw", color: "#E8C97A", fontWeight: 700, letterSpacing: "0.08em", border: "1px solid rgba(232,201,122,0.5)", borderRadius: "4px", padding: "0.3vh 0.8vw" }}
              >
                الفهم العميق
              </p>
            </div>
            <p className="font-display font-bold mb-[1vh]" style={{ fontSize: "1.65vw", color: "#F5EDD6", textAlign: "right" }}>
              أمام المعبد — لا مرشد يتحدث لغتها
            </p>
            <p className="font-body" style={{ fontSize: "1.2vw", color: "rgba(245,237,214,0.72)", lineHeight: 1.8, textAlign: "right" }}>
              سائحة كورية تقف أمام معبد الأقصر بلا تفسير. مع خيتي — تُصوّب هاتفها نحو المعبد وتسمع حكايته الكاملة بلغتها، في ثوانٍ. لا انتظار، لا حاجز لغوي.
            </p>
          </div>

          {/* 2 */}
          <div
            className="rounded-2xl flex flex-col"
            style={{
              background: "rgba(8,5,1,0.9)",
              border: "1px solid rgba(202,163,84,0.28)",
              borderRight: "4px solid #CAA354",
              padding: "2.5vh 2.5vw",
              backdropFilter: "blur(8px)",
            }}
          >
            <div className="flex flex-row-reverse items-start justify-between mb-[1.2vh]">
              <div style={{ width: "2.8vw", height: "2.8vw" }}><IconMetroPath /></div>
              <p
                className="font-body"
                style={{ fontSize: "0.9vw", color: "#CAA354", fontWeight: 700, letterSpacing: "0.08em", border: "1px solid rgba(202,163,84,0.4)", borderRadius: "4px", padding: "0.3vh 0.8vw" }}
              >
                الاستقلالية
              </p>
            </div>
            <p className="font-display font-bold mb-[1vh]" style={{ fontSize: "1.65vw", color: "#F5EDD6", textAlign: "right" }}>
              وسط المدينة — لا يعرف كيف يتنقل
            </p>
            <p className="font-body" style={{ fontSize: "1.2vw", color: "rgba(245,237,214,0.72)", lineHeight: 1.8, textAlign: "right" }}>
              باحث برازيلي يريد ركوب المترو من التحرير دون أن يُغبَن أو يضيع. خيتي يعطيه الخط والمحطة والسعر الحقيقي بالبرتغالية — ويصل بكرامته.
            </p>
          </div>

          {/* 3 */}
          <div
            className="rounded-2xl flex flex-col"
            style={{
              background: "rgba(8,5,1,0.9)",
              border: "1px solid rgba(202,163,84,0.28)",
              borderRight: "4px solid #CAA354",
              padding: "2.5vh 2.5vw",
              backdropFilter: "blur(8px)",
            }}
          >
            <div className="flex flex-row-reverse items-start justify-between mb-[1.2vh]">
              <div style={{ width: "2.8vw", height: "2.8vw" }}><IconShieldCheck /></div>
              <p
                className="font-body"
                style={{ fontSize: "0.9vw", color: "#CAA354", fontWeight: 700, letterSpacing: "0.08em", border: "1px solid rgba(202,163,84,0.4)", borderRadius: "4px", padding: "0.3vh 0.8vw" }}
              >
                الأمان الشخصي
              </p>
            </div>
            <p className="font-display font-bold mb-[1vh]" style={{ fontSize: "1.65vw", color: "#F5EDD6", textAlign: "right" }}>
              تسافر وحدها — وتشعر بالقلق
            </p>
            <p className="font-body" style={{ fontSize: "1.2vw", color: "rgba(245,237,214,0.72)", lineHeight: 1.8, textAlign: "right" }}>
              سيدة تسافر منفردة تريد زيارة المعز ليلاً وتخشى اتخاذ القرار بمفردها. خيتي يُقيّم الوضع، يقترح الوقت والمسار الأمثل، ويعطيها الثقة لتقول نعم.
            </p>
          </div>

          {/* 4 */}
          <div
            className="rounded-2xl flex flex-col"
            style={{
              background: "rgba(8,5,1,0.9)",
              border: "1px solid rgba(202,163,84,0.28)",
              borderRight: "4px solid #CAA354",
              padding: "2.5vh 2.5vw",
              backdropFilter: "blur(8px)",
            }}
          >
            <div className="flex flex-row-reverse items-start justify-between mb-[1.2vh]">
              <div style={{ width: "2.8vw", height: "2.8vw" }}><IconDiningPlate /></div>
              <p
                className="font-body"
                style={{ fontSize: "0.9vw", color: "#CAA354", fontWeight: 700, letterSpacing: "0.08em", border: "1px solid rgba(202,163,84,0.4)", borderRadius: "4px", padding: "0.3vh 0.8vw" }}
              >
                التجربة الأصيلة
              </p>
            </div>
            <p className="font-display font-bold mb-[1vh]" style={{ fontSize: "1.65vw", color: "#F5EDD6", textAlign: "right" }}>
              جائع في القاهرة — لا يثق في القرار
            </p>
            <p className="font-body" style={{ fontSize: "1.2vw", color: "rgba(245,237,214,0.72)", lineHeight: 1.8, textAlign: "right" }}>
              عائلة يابانية تريد أكلاً مصرياً حقيقياً لا سلسلة فندقية. خيتي يوجّهها لمطعم موثّق بشارة KHETY — يأكلون أفضل وجبة في رحلتهم وينفقون عند المصري.
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
