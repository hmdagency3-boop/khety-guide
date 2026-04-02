export default function Slide06HowItWorks() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#0C0904" }}>
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(202,163,84,0.07) 0%, transparent 60%)",
        }}
      />
      <div
        className="absolute top-0 left-0 right-0"
        style={{
          height: "0.3vh",
          background: "linear-gradient(90deg, #CAA354, transparent)",
        }}
      />
      <div
        className="absolute inset-0 flex flex-col justify-center"
        style={{ padding: "0 8vw" }}
      >
        <div className="mb-[8vh]">
          <p
            className="font-body mb-[1.5vh]"
            style={{ fontSize: "1.2vw", color: "#CAA354", fontWeight: 500, letterSpacing: "0.3em" }}
          >
            HOW IT WORKS
          </p>
          <h2
            className="font-display font-bold tracking-tight"
            style={{ fontSize: "4.5vw", color: "#F5EDD6" }}
          >
            Start exploring in three steps
          </h2>
        </div>
        <div className="flex items-start">
          <div className="flex flex-col" style={{ flex: 1 }}>
            <p
              className="font-display font-bold leading-none mb-[2.5vh]"
              style={{ fontSize: "5.5vw", color: "rgba(202,163,84,0.14)" }}
            >
              01
            </p>
            <div
              style={{
                width: "100%",
                height: "2px",
                background: "linear-gradient(90deg, #CAA354, rgba(202,163,84,0.15))",
                marginBottom: "2.5vh",
              }}
            />
            <h3
              className="font-display font-bold mb-[1.5vh]"
              style={{ fontSize: "2.1vw", color: "#F5EDD6" }}
            >
              Install Khety
            </h3>
            <p
              className="font-body"
              style={{
                fontSize: "1.45vw",
                color: "rgba(245,237,214,0.62)",
                lineHeight: 1.75,
                maxWidth: "22vw",
              }}
            >
              Add Khety to your home screen as a PWA — no app store required. Works on every device, anywhere in Egypt.
            </p>
          </div>
          <div
            className="flex items-center justify-center"
            style={{ width: "5vw", paddingTop: "2vh" }}
          >
            <div
              style={{ width: "3.5vw", height: "1px", background: "rgba(202,163,84,0.3)" }}
            />
          </div>
          <div className="flex flex-col" style={{ flex: 1 }}>
            <p
              className="font-display font-bold leading-none mb-[2.5vh]"
              style={{ fontSize: "5.5vw", color: "rgba(202,163,84,0.14)" }}
            >
              02
            </p>
            <div
              style={{
                width: "100%",
                height: "2px",
                background: "rgba(202,163,84,0.3)",
                marginBottom: "2.5vh",
              }}
            />
            <h3
              className="font-display font-bold mb-[1.5vh]"
              style={{ fontSize: "2.1vw", color: "#F5EDD6" }}
            >
              Build Your Profile
            </h3>
            <p
              className="font-body"
              style={{
                fontSize: "1.45vw",
                color: "rgba(245,237,214,0.62)",
                lineHeight: 1.75,
                maxWidth: "22vw",
              }}
            >
              Share your travel dates, interests, and preferred language. Khety adapts entirely to you.
            </p>
          </div>
          <div
            className="flex items-center justify-center"
            style={{ width: "5vw", paddingTop: "2vh" }}
          >
            <div
              style={{ width: "3.5vw", height: "1px", background: "rgba(202,163,84,0.3)" }}
            />
          </div>
          <div className="flex flex-col" style={{ flex: 1 }}>
            <p
              className="font-display font-bold leading-none mb-[2.5vh]"
              style={{ fontSize: "5.5vw", color: "rgba(202,163,84,0.14)" }}
            >
              03
            </p>
            <div
              style={{
                width: "100%",
                height: "2px",
                background: "linear-gradient(90deg, rgba(202,163,84,0.15), #CAA354)",
                marginBottom: "2.5vh",
              }}
            />
            <h3
              className="font-display font-bold mb-[1.5vh]"
              style={{ fontSize: "2.1vw", color: "#F5EDD6" }}
            >
              Explore the Land of Kemet
            </h3>
            <p
              className="font-body"
              style={{
                fontSize: "1.45vw",
                color: "rgba(245,237,214,0.62)",
                lineHeight: 1.75,
                maxWidth: "22vw",
              }}
            >
              Chat with Khety, scan monuments with AR, and discover 50+ iconic landmarks from Cairo to Abu Simbel.
            </p>
          </div>
        </div>
      </div>
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: "0.3vh",
          background: "linear-gradient(90deg, transparent, #CAA354)",
        }}
      />
    </div>
  );
}
