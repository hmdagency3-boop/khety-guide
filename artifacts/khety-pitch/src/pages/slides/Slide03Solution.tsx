export default function Slide03Solution() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#0E0B05" }}>
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 25% 50%, rgba(202,163,84,0.11) 0%, transparent 55%)",
        }}
      />
      <div
        className="absolute top-0 left-0 right-0"
        style={{
          height: "0.3vh",
          background: "linear-gradient(90deg, #CAA354, rgba(202,163,84,0.1) 100%)",
        }}
      />
      <div
        className="absolute inset-0 flex flex-col justify-center"
        style={{ padding: "0 8vw" }}
      >
        <p
          className="font-body mb-[3vh]"
          style={{ fontSize: "1.2vw", color: "#CAA354", fontWeight: 500, letterSpacing: "0.3em" }}
        >
          THE SOLUTION
        </p>
        <h2
          className="font-display font-bold tracking-tight leading-none mb-[2vh]"
          style={{ fontSize: "6.5vw", color: "#F5EDD6" }}
        >
          Meet Khety
        </h2>
        <p
          className="font-display font-semibold mb-[5vh]"
          style={{ fontSize: "2.4vw", color: "#CAA354", maxWidth: "65vw", lineHeight: 1.35 }}
        >
          An AI companion that transforms how you experience ancient Egypt
        </p>
        <div className="flex" style={{ gap: "5vw", maxWidth: "82vw" }}>
          <div style={{ flex: 1 }}>
            <div
              style={{ width: "2.5vw", height: "3px", background: "#CAA354", marginBottom: "1.8vh" }}
            />
            <p
              className="font-display font-bold mb-[1.2vh]"
              style={{ fontSize: "1.85vw", color: "#F5EDD6" }}
            >
              Conversational AI
            </p>
            <p
              className="font-body"
              style={{ fontSize: "1.45vw", color: "rgba(245,237,214,0.62)", lineHeight: 1.75 }}
            >
              Ask anything about Egyptian history, culture, food, or logistics — answered in your own language, any time.
            </p>
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{ width: "2.5vw", height: "3px", background: "#CAA354", marginBottom: "1.8vh" }}
            />
            <p
              className="font-display font-bold mb-[1.2vh]"
              style={{ fontSize: "1.85vw", color: "#F5EDD6" }}
            >
              AR Monument Scanner
            </p>
            <p
              className="font-body"
              style={{ fontSize: "1.45vw", color: "rgba(245,237,214,0.62)", lineHeight: 1.75 }}
            >
              Point your camera at any monument to reveal its historical period, significance, and stories — instantly.
            </p>
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{ width: "2.5vw", height: "3px", background: "#CAA354", marginBottom: "1.8vh" }}
            />
            <p
              className="font-display font-bold mb-[1.2vh]"
              style={{ fontSize: "1.85vw", color: "#F5EDD6" }}
            >
              Traveller Safety Hub
            </p>
            <p
              className="font-body"
              style={{ fontSize: "1.45vw", color: "rgba(245,237,214,0.62)", lineHeight: 1.75 }}
            >
              Emergency contacts, scam alerts, and tourist rights — all available offline, the moment you need them.
            </p>
          </div>
        </div>
      </div>
      <div
        className="absolute right-0 top-0 bottom-0 flex items-center pointer-events-none"
        style={{ opacity: 0.035, paddingRight: "2vw" }}
      >
        <p
          className="font-display font-bold"
          style={{ fontSize: "22vw", color: "#CAA354", whiteSpace: "nowrap" }}
        >
          KHETY
        </p>
      </div>
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: "0.3vh",
          background: "linear-gradient(90deg, rgba(202,163,84,0.1), #CAA354)",
        }}
      />
    </div>
  );
}
