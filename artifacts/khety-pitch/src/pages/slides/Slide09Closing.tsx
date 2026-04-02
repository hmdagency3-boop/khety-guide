const base = import.meta.env.BASE_URL;

export default function Slide09Closing() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#0C0904" }}>
      <img
        src={`${base}hero-pyramids.png`}
        crossOrigin="anonymous"
        className="absolute inset-0 w-full h-full object-cover"
        alt="Pyramids of Giza"
        style={{ opacity: 0.28 }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(202,163,84,0.13) 0%, rgba(12,9,4,0.9) 60%)",
        }}
      />
      <div
        className="absolute top-0 left-0 right-0"
        style={{
          height: "0.4vh",
          background: "linear-gradient(90deg, transparent, #CAA354, transparent)",
        }}
      />
      <div
        className="absolute inset-0 flex flex-col items-center justify-center"
        style={{ padding: "0 18vw" }}
      >
        <p
          className="font-body text-center mb-[4vh]"
          style={{ fontSize: "1.2vw", color: "#CAA354", fontWeight: 500, letterSpacing: "0.35em" }}
        >
          AI TRAVEL COMPANION FOR EGYPT
        </p>
        <h1
          className="font-display font-bold tracking-widest leading-none mb-[3vh] text-center"
          style={{ fontSize: "9.5vw", color: "#F5EDD6" }}
        >
          KHETY
        </h1>
        <p
          className="font-display font-semibold text-center mb-[5vh]"
          style={{ fontSize: "2vw", color: "#CAA354", lineHeight: 1.4 }}
        >
          Your journey in the land of the Pharaohs begins here
        </p>
        <div
          style={{
            width: "6vw",
            height: "1px",
            background: "linear-gradient(90deg, transparent, #CAA354, transparent)",
            marginBottom: "5vh",
          }}
        />
        <p
          className="font-body text-center"
          style={{ fontSize: "1.5vw", color: "rgba(245,237,214,0.45)", letterSpacing: "0.18em" }}
        >
          khety.app
        </p>
      </div>
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: "0.4vh",
          background: "linear-gradient(90deg, transparent, #CAA354, transparent)",
        }}
      />
    </div>
  );
}
