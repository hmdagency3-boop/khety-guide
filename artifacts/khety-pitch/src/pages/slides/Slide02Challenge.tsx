export default function Slide02Challenge() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#0C0904" }}>
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 80% 50%, rgba(202,163,84,0.07) 0%, transparent 60%)",
        }}
      />
      <div
        className="absolute top-0 left-0 right-0"
        style={{
          height: "0.3vh",
          background: "linear-gradient(90deg, #CAA354, rgba(202,163,84,0.1) 100%)",
        }}
      />
      <div className="absolute inset-0 flex" style={{ padding: "8vh 8vw" }}>
        <div
          className="flex flex-col justify-center"
          style={{ width: "38vw", paddingRight: "4vw" }}
        >
          <p
            className="font-body mb-[2vh]"
            style={{ fontSize: "1.2vw", color: "#CAA354", fontWeight: 500, letterSpacing: "0.3em" }}
          >
            THE CHALLENGE
          </p>
          <p
            className="font-display font-bold leading-none mb-[1.5vh]"
            style={{ fontSize: "12vw", color: "#CAA354" }}
          >
            15M
          </p>
          <p
            className="font-display font-semibold mb-[3vh]"
            style={{ fontSize: "2vw", color: "#F5EDD6", lineHeight: 1.3 }}
          >
            tourists visit Egypt every year
          </p>
          <p
            className="font-body"
            style={{ fontSize: "1.5vw", color: "rgba(245,237,214,0.6)", lineHeight: 1.75 }}
          >
            Yet most leave without truly understanding what they saw — held back by barriers technology can now solve.
          </p>
        </div>
        <div
          className="flex-shrink-0"
          style={{
            width: "1px",
            background:
              "linear-gradient(to bottom, transparent, rgba(202,163,84,0.5) 30%, rgba(202,163,84,0.5) 70%, transparent)",
            margin: "0 4vw",
          }}
        />
        <div className="flex flex-col justify-center" style={{ flex: 1 }}>
          <div className="mb-[5.5vh]">
            <p
              className="font-display font-bold mb-[1.2vh]"
              style={{ fontSize: "1.9vw", color: "#F5EDD6" }}
            >
              Language Barriers
            </p>
            <div
              style={{ width: "3vw", height: "2px", background: "#CAA354", marginBottom: "1.2vh" }}
            />
            <p
              className="font-body"
              style={{ fontSize: "1.45vw", color: "rgba(245,237,214,0.62)", lineHeight: 1.75 }}
            >
              Most tourists speak no Arabic. Signage, guides, and information remain inaccessible or unreliable.
            </p>
          </div>
          <div className="mb-[5.5vh]">
            <p
              className="font-display font-bold mb-[1.2vh]"
              style={{ fontSize: "1.9vw", color: "#F5EDD6" }}
            >
              Safety Concerns
            </p>
            <div
              style={{ width: "3vw", height: "2px", background: "#CAA354", marginBottom: "1.2vh" }}
            />
            <p
              className="font-body"
              style={{ fontSize: "1.45vw", color: "rgba(245,237,214,0.62)", lineHeight: 1.75 }}
            >
              Travellers struggle to find emergency contacts, recognise common scams, and understand their rights.
            </p>
          </div>
          <div>
            <p
              className="font-display font-bold mb-[1.2vh]"
              style={{ fontSize: "1.9vw", color: "#F5EDD6" }}
            >
              No Personalisation
            </p>
            <div
              style={{ width: "3vw", height: "2px", background: "#CAA354", marginBottom: "1.2vh" }}
            />
            <p
              className="font-body"
              style={{ fontSize: "1.45vw", color: "rgba(245,237,214,0.62)", lineHeight: 1.75 }}
            >
              Generic tours skim the surface. Travellers deserve deep, personalised engagement with 5,000 years of civilisation.
            </p>
          </div>
        </div>
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
