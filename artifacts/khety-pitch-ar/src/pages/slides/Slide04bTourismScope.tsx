import type { ComponentType } from "react";
import { IconWaves, IconDunes, IconPillars, IconCoral } from "@/components/Icons";

const base = import.meta.env.BASE_URL;

interface TourismType {
  num: string;
  glyph?: string;
  Icon?: ComponentType<{ size?: string | number; color?: string; strokeWidth?: number }>;
  label: string;
  sub: string;
  tags: string[];
  badge: string;
  featured: boolean;
  borderColor: string;
}

const types: TourismType[] = [
  {
    num: "01",
    glyph: "𓇳",
    label: "الحضارة الفرعونية",
    sub: "التاريخ · الهوية · الأصالة",
    tags: ["الأهرامات", "الكرنك", "أبو سمبل", "الأقصر"],
    badge: "الأكثر زيارةً عالمياً",
    featured: true,
    borderColor: "#E8C97A",
  },
  {
    num: "02",
    glyph: "𓋴",
    label: "الإسلامية والقبطية",
    sub: "الروحانية · التعايش · التراث",
    tags: ["المعز", "الأزهر", "الأديرة"],
    badge: "حضارة ألفي عام",
    featured: false,
    borderColor: "#CAA354",
  },
  {
    num: "03",
    Icon: IconWaves,
    label: "السياحة الشاطئية",
    sub: "الترفيه · الاسترخاء · الجمال",
    tags: ["الغردقة", "شرم الشيخ", "دهب"],
    badge: "#1 في البحر المتوسط",
    featured: false,
    borderColor: "#B8956A",
  },
  {
    num: "04",
    Icon: IconDunes,
    label: "الصحراء والطبيعة",
    sub: "المغامرة · الهدوء · الجمال الخام",
    tags: ["سيوة", "الواحات", "وادي الريان"],
    badge: "وجهات غير مكتشفة",
    featured: false,
    borderColor: "#CAA354",
  },
  {
    num: "05",
    Icon: IconPillars,
    label: "الثقافية الحديثة",
    sub: "المعرفة · الفن · الابتكار",
    tags: ["GEM", "متحف الحضارة", "القاهرة الإبداعية"],
    badge: "أضخم متحف في العالم",
    featured: false,
    borderColor: "#CAA354",
  },
  {
    num: "06",
    Icon: IconCoral,
    label: "المغامرات والغطس",
    sub: "الإثارة · الطبيعة · الرياضة",
    tags: ["البحر الأحمر", "الشعاب المرجانية", "راس محمد"],
    badge: "أفضل 10 مواقع غطس عالمياً",
    featured: false,
    borderColor: "#B8956A",
  },
];

export default function Slide04bTourismScope() {
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
        style={{ opacity: 0.08, objectPosition: "center 30%" }}
        alt=""
      />

      {/* Radial glow */}
      <div
        className="absolute"
        style={{
          top: "-10vh",
          left: "50%",
          transform: "translateX(-50%)",
          width: "60vw",
          height: "40vh",
          background: "radial-gradient(ellipse, rgba(202,163,84,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Subtle grid lines */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(202,163,84,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(202,163,84,0.03) 1px, transparent 1px)",
          backgroundSize: "8vw 8vh",
          pointerEvents: "none",
        }}
      />

      <div
        className="absolute top-0 left-0 right-0"
        style={{ height: "0.4vh", background: "linear-gradient(90deg, transparent, #CAA354, transparent)" }}
      />

      <div className="absolute inset-0 flex flex-col" style={{ padding: "4.5vh 6vw 3vh" }}>

        {/* ── Header ── */}
        <div className="mb-[3vh] flex flex-row-reverse items-end justify-between">
          <div style={{ textAlign: "right" }}>
            <p
              className="font-body mb-[0.6vh]"
              style={{ fontSize: "0.95vw", color: "#CAA354", fontWeight: 700, letterSpacing: "0.18em" }}
            >
              نطاق خدمة التطبيق
            </p>
            <h2
              className="font-display font-bold"
              style={{ fontSize: "3.2vw", color: "#F5EDD6", lineHeight: 1.15 }}
            >
              مصر أكثر من الأهرامات
            </h2>
            <p className="font-display" style={{ fontSize: "3.2vw", lineHeight: 1.15 }}>
              <span style={{ color: "#CAA354" }}>وخيتي</span>
              <span style={{ color: "rgba(245,237,214,0.5)" }}> يعرف ذلك</span>
            </p>
          </div>

          <div
            style={{
              border: "1px solid rgba(202,163,84,0.3)",
              borderRadius: "100px",
              padding: "1.2vh 2vw",
              background: "rgba(202,163,84,0.07)",
              backdropFilter: "blur(8px)",
              maxWidth: "28vw",
              textAlign: "center",
            }}
          >
            <p className="font-body" style={{ fontSize: "1.1vw", color: "rgba(245,237,214,0.65)", lineHeight: 1.6 }}>
              يرافق السائح من الأهرامات إلى الشعاب المرجانية — في كل محافظة وكل موسم
            </p>
          </div>
        </div>

        {/* ── Cards Grid 3×2 ── */}
        <div
          className="flex-1"
          style={{
            display: "grid",
            gridTemplateColumns: "1.35fr 1fr 1fr",
            gridTemplateRows: "1fr 1fr",
            gap: "1.5vh 1.8vw",
          }}
        >
          {types.map((t) => {
            const iconColor = t.featured ? "#E8C97A" : "#CAA354";
            const iconSize = t.featured ? "3.2vw" : "2.4vw";

            return (
              <div
                key={t.num}
                className="rounded-2xl flex flex-col relative overflow-hidden"
                style={{
                  background: t.featured
                    ? "linear-gradient(135deg, rgba(202,163,84,0.18) 0%, rgba(202,163,84,0.06) 100%)"
                    : "rgba(255,255,255,0.028)",
                  border: t.featured
                    ? "1.5px solid rgba(202,163,84,0.5)"
                    : "1px solid rgba(202,163,84,0.15)",
                  borderTop: `3px solid ${t.borderColor}`,
                  padding: "2vh 1.8vw",
                  backdropFilter: "blur(12px)",
                }}
              >
                {/* Ghost number */}
                <p
                  className="font-display font-bold absolute"
                  style={{
                    fontSize: "8vw",
                    color: "rgba(202,163,84,0.04)",
                    lineHeight: 1,
                    bottom: "-1vh",
                    left: "0.5vw",
                    userSelect: "none",
                    pointerEvents: "none",
                  }}
                >
                  {t.num}
                </p>

                {/* Top row: icon + badge */}
                <div className="flex flex-row-reverse items-start justify-between mb-[1.2vh]">

                  {/* Icon: SVG or glyph */}
                  {t.Icon ? (
                    <div style={{ width: iconSize, height: iconSize, flexShrink: 0 }}>
                      <t.Icon color={iconColor} strokeWidth={1.4} />
                    </div>
                  ) : (
                    <p
                      style={{
                        fontSize: iconSize,
                        lineHeight: 1,
                        color: iconColor,
                        fontFamily: "serif",
                        flexShrink: 0,
                      }}
                    >
                      {t.glyph}
                    </p>
                  )}

                  {/* Badge */}
                  <div
                    style={{
                      background: t.featured ? "#E8C97A" : "rgba(202,163,84,0.12)",
                      border: t.featured ? "none" : "1px solid rgba(202,163,84,0.3)",
                      borderRadius: "100px",
                      padding: "0.3vh 0.8vw",
                      alignSelf: "flex-start",
                    }}
                  >
                    <p
                      className="font-body"
                      style={{
                        fontSize: "0.72vw",
                        color: t.featured ? "#0C0904" : "#CAA354",
                        fontWeight: 700,
                        letterSpacing: "0.05em",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {t.badge}
                    </p>
                  </div>
                </div>

                {/* Label */}
                <p
                  className="font-display font-bold mb-[0.3vh]"
                  style={{
                    fontSize: t.featured ? "1.6vw" : "1.3vw",
                    color: "#F5EDD6",
                    textAlign: "right",
                    lineHeight: 1.3,
                  }}
                >
                  {t.label}
                </p>

                {/* Sub */}
                <p
                  className="font-body mb-[1.2vh]"
                  style={{ fontSize: "0.9vw", color: "rgba(202,163,84,0.7)", textAlign: "right", letterSpacing: "0.04em" }}
                >
                  {t.sub}
                </p>

                {/* Divider */}
                <div style={{ height: "1px", background: "rgba(202,163,84,0.15)", marginBottom: "1.2vh" }} />

                {/* Tags */}
                <div className="flex flex-row-reverse flex-wrap" style={{ gap: "0.5vh 0.5vw" }}>
                  {t.tags.map((tag) => (
                    <span
                      key={tag}
                      className="font-body"
                      style={{
                        fontSize: "0.85vw",
                        color: "rgba(245,237,214,0.5)",
                        background: "rgba(202,163,84,0.07)",
                        border: "1px solid rgba(202,163,84,0.12)",
                        borderRadius: "6px",
                        padding: "0.2vh 0.6vw",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Bottom Stats Bar ── */}
        <div
          className="flex flex-row-reverse items-center justify-center mt-[2.5vh]"
          style={{
            background: "rgba(202,163,84,0.05)",
            border: "1px solid rgba(202,163,84,0.15)",
            borderRadius: "100px",
            padding: "1.2vh 0",
          }}
        >
          {[
            { num: "6", label: "وجوه سياحية متكاملة" },
            { num: "27", label: "محافظة مصرية" },
            { num: "∞", label: "لغة — بلا استثناء" },
            { num: "1", label: "تطبيق يجمعها كلها" },
          ].map((s, i) => (
            <div
              key={i}
              className="flex items-center"
              style={{
                gap: "0.6vw",
                padding: "0 2.5vw",
                borderLeft: i < 3 ? "1px solid rgba(202,163,84,0.2)" : "none",
              }}
            >
              <p
                className="font-display font-bold"
                style={{ fontSize: "2vw", color: i === 3 ? "#E8C97A" : "#CAA354", lineHeight: 1 }}
              >
                {s.num}
              </p>
              <p className="font-body" style={{ fontSize: "0.95vw", color: "rgba(245,237,214,0.5)" }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0"
        style={{ height: "0.4vh", background: "linear-gradient(90deg, transparent, #CAA354, transparent)" }}
      />
    </div>
  );
}
