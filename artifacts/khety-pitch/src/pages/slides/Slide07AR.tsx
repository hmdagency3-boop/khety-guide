const base = import.meta.env.BASE_URL;

export default function Slide07AR() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#0C0904" }}>
      <img
        src={`${base}ar-experience.png`}
        crossOrigin="anonymous"
        className="absolute inset-0 w-full h-full object-cover"
        alt="AR scanner revealing ancient Egyptian monument history"
        style={{ opacity: 0.62 }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(12,9,4,0.94) 0%, rgba(12,9,4,0.62) 48%, rgba(12,9,4,0.28) 100%)",
        }}
      />
      <div
        className="absolute top-0 left-0 right-0"
        style={{
          height: "0.4vh",
          background: "linear-gradient(90deg, #CAA354 0%, rgba(202,163,84,0.1) 100%)",
        }}
      />
      <div
        className="absolute top-0 left-0 bottom-0 flex flex-col justify-center"
        style={{ width: "58vw", padding: "0 8vw" }}
      >
        <p
          className="font-body mb-[3.5vh]"
          style={{ fontSize: "1.2vw", color: "#CAA354", fontWeight: 500, letterSpacing: "0.3em" }}
        >
          AR MONUMENT SCANNER
        </p>
        <h2
          className="font-display font-bold tracking-tight leading-tight mb-[4.5vh]"
          style={{ fontSize: "5.2vw", color: "#F5EDD6" }}
        >
          Point. Scan. Discover 5,000 Years of History.
        </h2>
        <p
          className="font-body mb-[4vh]"
          style={{
            fontSize: "1.6vw",
            color: "rgba(245,237,214,0.7)",
            lineHeight: 1.78,
            maxWidth: "40vw",
          }}
        >
          Khety's AR scanner uses AI image recognition to identify any Egyptian monument, carving, or artefact — and delivers rich historical context in your language, instantly.
        </p>
        <div
          style={{
            width: "5vw",
            height: "2px",
            background: "linear-gradient(90deg, #CAA354, transparent)",
          }}
        />
      </div>
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: "0.35vh",
          background: "linear-gradient(90deg, #CAA354, rgba(202,163,84,0.1) 100%)",
        }}
      />
    </div>
  );
}
