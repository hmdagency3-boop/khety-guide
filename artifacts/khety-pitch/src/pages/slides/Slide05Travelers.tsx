export default function Slide05Travelers() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#0C0904" }}>
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 100%, rgba(202,163,84,0.08) 0%, transparent 55%)",
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
            BUILT FOR REAL TRAVELLERS
          </p>
          <h2
            className="font-display font-bold tracking-tight"
            style={{ fontSize: "4vw", color: "#F5EDD6" }}
          >
            Safety. Community. Language.
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
              04
            </p>
            <h3
              className="font-display font-bold mb-[1.5vh]"
              style={{ fontSize: "2.1vw", color: "#F5EDD6", lineHeight: 1.2 }}
            >
              Emergency Safety Hub
            </h3>
            <div
              style={{ width: "2vw", height: "2px", background: "#CAA354", marginBottom: "2vh" }}
            />
            <p
              className="font-body"
              style={{ fontSize: "1.45vw", color: "rgba(245,237,214,0.65)", lineHeight: 1.75 }}
            >
              Tourist police, embassies, hospitals, common scam alerts, and your legal rights as a visitor — available offline.
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
              05
            </p>
            <h3
              className="font-display font-bold mb-[1.5vh]"
              style={{ fontSize: "2.1vw", color: "#F5EDD6", lineHeight: 1.2 }}
            >
              Community Feed
            </h3>
            <div
              style={{ width: "2vw", height: "2px", background: "#CAA354", marginBottom: "2vh" }}
            />
            <p
              className="font-body"
              style={{ fontSize: "1.45vw", color: "rgba(245,237,214,0.65)", lineHeight: 1.75 }}
            >
              Share photos, tips, and discoveries with a global community of travellers. Earn golden points and rise through the ranks.
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
              06
            </p>
            <h3
              className="font-display font-bold mb-[1.5vh]"
              style={{ fontSize: "2.1vw", color: "#F5EDD6", lineHeight: 1.2 }}
            >
              8 Languages
            </h3>
            <div
              style={{ width: "2vw", height: "2px", background: "#CAA354", marginBottom: "2vh" }}
            />
            <p
              className="font-body"
              style={{ fontSize: "1.45vw", color: "rgba(245,237,214,0.65)", lineHeight: 1.75 }}
            >
              Arabic, English, French, German, Spanish, Italian, Chinese, and Russian — every screen and every feature fully localised.
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
