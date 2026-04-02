const base = import.meta.env.BASE_URL;

export default function Slide01Title() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#0C0904" }}>
      <img
        src={`${base}hero-pyramids.png`}
        crossOrigin="anonymous"
        className="absolute inset-0 w-full h-full object-cover"
        alt="Pyramids of Giza at golden hour"
        style={{ opacity: 0.58 }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(12,9,4,0.93) 0%, rgba(12,9,4,0.65) 48%, rgba(12,9,4,0.22) 100%)",
        }}
      />
      <div
        className="absolute top-0 left-0 right-0"
        style={{
          height: "0.4vh",
          background: "linear-gradient(90deg, #CAA354 0%, #E8C97A 40%, rgba(202,163,84,0.1) 100%)",
        }}
      />
      <div
        className="absolute top-0 left-0 bottom-0 flex flex-col justify-center"
        style={{ width: "58vw", padding: "0 8vw" }}
      >
        <p
          className="font-body mb-[2.5vh]"
          style={{
            fontSize: "1.25vw",
            color: "#CAA354",
            fontWeight: 500,
            letterSpacing: "0.35em",
          }}
        >
          AI TRAVEL COMPANION FOR EGYPT
        </p>
        <h1
          className="font-display font-bold tracking-widest leading-none mb-[2vh]"
          style={{ fontSize: "9.5vw", color: "#F5EDD6" }}
        >
          KHETY
        </h1>
        <p
          className="font-display font-semibold mb-[4vh]"
          style={{ fontSize: "2.8vw", color: "#CAA354", lineHeight: 1.3 }}
        >
          Your Guide in the Land of Kemet
        </p>
        <p
          className="font-body"
          style={{
            fontSize: "1.6vw",
            color: "rgba(245,237,214,0.68)",
            lineHeight: 1.8,
            maxWidth: "36vw",
          }}
        >
          An intelligent AI companion that speaks your language, reads ancient monuments, and guides you through 5,000 years of history — in your pocket.
        </p>
        <div
          className="mt-[5vh]"
          style={{
            width: "6vw",
            height: "2px",
            background: "linear-gradient(90deg, #CAA354, transparent)",
          }}
        />
      </div>
      <div
        className="absolute bottom-0 left-0 right-0 flex items-center justify-between"
        style={{ padding: "0 8vw 2.5vh" }}
      >
        <p
          className="font-body"
          style={{ fontSize: "1.1vw", color: "rgba(202,163,84,0.5)", letterSpacing: "0.25em" }}
        >
          khety.app
        </p>
        <p
          className="font-body"
          style={{ fontSize: "1.1vw", color: "rgba(202,163,84,0.5)", letterSpacing: "0.25em" }}
        >
          2026
        </p>
      </div>
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: "0.35vh",
          background: "linear-gradient(90deg, #CAA354 0%, rgba(202,163,84,0.1) 100%)",
        }}
      />
    </div>
  );
}
