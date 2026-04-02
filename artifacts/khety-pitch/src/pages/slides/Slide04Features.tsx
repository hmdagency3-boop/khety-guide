export default function Slide04Features() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#0C0904" }}>
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(202,163,84,0.08) 0%, transparent 55%)",
        }}
      />
      <div
        className="absolute top-0 left-0 right-0"
        style={{
          height: "0.3vh",
          background: "linear-gradient(90deg, transparent, #CAA354, transparent)",
        }}
      />
      <div className="absolute inset-0 flex flex-col" style={{ padding: "6vh 8vw" }}>
        <div className="mb-[5vh]">
          <p
            className="font-body mb-[1.5vh]"
            style={{ fontSize: "1.2vw", color: "#CAA354", fontWeight: 500, letterSpacing: "0.3em" }}
          >
            CORE FEATURES
          </p>
          <h2
            className="font-display font-bold tracking-tight"
            style={{ fontSize: "4vw", color: "#F5EDD6" }}
          >
            Everything a traveller needs
          </h2>
        </div>
        <div className="flex flex-1" style={{ gap: "2.5vw" }}>
          <div
            className="flex flex-col flex-1 rounded-2xl"
            style={{
              background: "rgba(202,163,84,0.05)",
              border: "1px solid rgba(202,163,84,0.18)",
              padding: "3.5vh 2.5vw",
            }}
          >
            <p
              className="font-display font-bold mb-[2vh]"
              style={{ fontSize: "1.1vw", color: "#CAA354", letterSpacing: "0.22em" }}
            >
              01
            </p>
            <h3
              className="font-display font-bold mb-[1.5vh]"
              style={{ fontSize: "2.1vw", color: "#F5EDD6", lineHeight: 1.2 }}
            >
              AI Chat Companion
            </h3>
            <div
              style={{ width: "2vw", height: "2px", background: "#CAA354", marginBottom: "2vh" }}
            />
            <p
              className="font-body"
              style={{ fontSize: "1.45vw", color: "rgba(245,237,214,0.65)", lineHeight: 1.75 }}
            >
              Conversational AI guide trained on Egyptian history, culture, food, and logistics. Always on. Never tired.
            </p>
            <p
              className="font-body mt-auto"
              style={{ fontSize: "1.2vw", color: "rgba(202,163,84,0.5)", marginTop: "3vh" }}
            >
              Available in 8 languages
            </p>
          </div>
          <div
            className="flex flex-col flex-1 rounded-2xl"
            style={{
              background: "rgba(202,163,84,0.1)",
              border: "1.5px solid rgba(202,163,84,0.42)",
              padding: "3.5vh 2.5vw",
            }}
          >
            <p
              className="font-display font-bold mb-[2vh]"
              style={{ fontSize: "1.1vw", color: "#CAA354", letterSpacing: "0.22em" }}
            >
              02
            </p>
            <h3
              className="font-display font-bold mb-[1.5vh]"
              style={{ fontSize: "2.1vw", color: "#F5EDD6", lineHeight: 1.2 }}
            >
              AR Monument Scanner
            </h3>
            <div
              style={{ width: "2vw", height: "2px", background: "#CAA354", marginBottom: "2vh" }}
            />
            <p
              className="font-body"
              style={{ fontSize: "1.45vw", color: "rgba(245,237,214,0.65)", lineHeight: 1.75 }}
            >
              Point your phone at any monument, temple, or carving to reveal its history, period, and cultural significance — in real time.
            </p>
            <p
              className="font-body mt-auto"
              style={{ fontSize: "1.2vw", color: "rgba(202,163,84,0.5)", marginTop: "3vh" }}
            >
              AI-powered image recognition
            </p>
          </div>
          <div
            className="flex flex-col flex-1 rounded-2xl"
            style={{
              background: "rgba(202,163,84,0.05)",
              border: "1px solid rgba(202,163,84,0.18)",
              padding: "3.5vh 2.5vw",
            }}
          >
            <p
              className="font-display font-bold mb-[2vh]"
              style={{ fontSize: "1.1vw", color: "#CAA354", letterSpacing: "0.22em" }}
            >
              03
            </p>
            <h3
              className="font-display font-bold mb-[1.5vh]"
              style={{ fontSize: "2.1vw", color: "#F5EDD6", lineHeight: 1.2 }}
            >
              Interactive Landmarks Map
            </h3>
            <div
              style={{ width: "2vw", height: "2px", background: "#CAA354", marginBottom: "2vh" }}
            />
            <p
              className="font-body"
              style={{ fontSize: "1.45vw", color: "rgba(245,237,214,0.65)", lineHeight: 1.75 }}
            >
              50+ curated landmarks across Egypt with ratings, opening hours, ticket prices, and expert travel tips.
            </p>
            <p
              className="font-body mt-auto"
              style={{ fontSize: "1.2vw", color: "rgba(202,163,84,0.5)", marginTop: "3vh" }}
            >
              From Cairo to Abu Simbel
            </p>
          </div>
        </div>
      </div>
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: "0.3vh",
          background: "linear-gradient(90deg, transparent, #CAA354, transparent)",
        }}
      />
    </div>
  );
}
