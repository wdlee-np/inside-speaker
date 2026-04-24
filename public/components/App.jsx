/* global React, HomePage, CategoryPage, SpeakerDetail, Nav, Footer, FloatingInquiry, InquiryDrawer, TweaksPanel, TweakSection, TweakToggle, TweakRadio, TweakSlider, TweakColor, useTweaks */

const { useState, useEffect } = React;

function App() {
  const [route, setRoute] = useState({ name: "home" });
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [inquiryContext, setInquiryContext] = useState(null);

  const DEFAULTS = /*EDITMODE-BEGIN*/{
    "accent": "#14756b",
    "dark": false,
    "cardStyle": "portrait",
    "gridCols": 4,
    "heroTypeScale": 1
  }/*EDITMODE-END*/;

  const [tweaks, setTweaks] = useTweaks ? useTweaks(DEFAULTS) : [DEFAULTS, () => {}];

  // apply tweaks
  useEffect(() => {
    document.documentElement.style.setProperty("--accent", tweaks.accent);
    document.body.classList.toggle("theme-dark", !!tweaks.dark);
    document.documentElement.style.setProperty("--grid-cols", String(tweaks.gridCols || 4));
  }, [tweaks]);

  // hash routing
  useEffect(() => {
    const parse = () => {
      const h = window.location.hash.replace(/^#/, "");
      if (!h || h === "/") return setRoute({ name: "home" });
      const parts = h.split("/").filter(Boolean);
      if (parts[0] === "speaker" && parts[1]) setRoute({ name: "speaker", id: parts[1] });
      else if (parts[0] === "category" && parts[1]) setRoute({ name: "category", id: parts[1], sub: parts[2] });
      else setRoute({ name: "home" });
    };
    window.addEventListener("hashchange", parse);
    parse();
    return () => window.removeEventListener("hashchange", parse);
  }, []);

  const onRoute = (r) => {
    setRoute(r);
    if (r.name === "home") window.history.pushState(null, "", "#/");
    if (r.name === "category") window.history.pushState(null, "", `#/category/${r.id}${r.sub ? "/" + r.sub : ""}`);
    if (r.name === "speaker") window.history.pushState(null, "", `#/speaker/${r.id}`);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const openInquiry = (ctx) => {
    setInquiryContext(ctx && ctx.id ? ctx : null);
    setInquiryOpen(true);
  };

  // if on speaker detail, pass speaker context to inquiry
  const inquiryCtx = inquiryContext || (route.name === "speaker" ? window.getSpeakerById(route.id) : null);

  return (
    <>
      <Nav route={route} onRoute={onRoute} onOpenInquiry={() => openInquiry()} />
      {route.name === "home" && <HomePage onRoute={onRoute} onOpenInquiry={() => openInquiry()} />}
      {route.name === "category" && <CategoryPage route={route} onRoute={onRoute} onOpenInquiry={() => openInquiry()} />}
      {route.name === "speaker" && <SpeakerDetail speakerId={route.id} onRoute={onRoute} onOpenInquiry={() => openInquiry(window.getSpeakerById(route.id))} />}
      <Footer onOpenInquiry={() => openInquiry()} />
      <FloatingInquiry onOpen={() => openInquiry(route.name === "speaker" ? window.getSpeakerById(route.id) : null)} />
      <InquiryDrawer open={inquiryOpen} onClose={() => setInquiryOpen(false)} speakerContext={inquiryCtx} />

      {window.TweaksPanel && (
        <TweaksPanel>
          <TweakSection title="테마">
            <TweakToggle label="다크 모드" value={tweaks.dark} onChange={(v) => setTweaks({ dark: v })} />
            <TweakColor
              label="액센트 컬러"
              value={tweaks.accent}
              onChange={(v) => setTweaks({ accent: v })}
              presets={["#14756b", "#1a8e82", "#d94a3d", "#4a90c2", "#8aa660", "#141311"]}
            />
          </TweakSection>
          <TweakSection title="레이아웃">
            <TweakRadio
              label="그리드 열 수"
              value={String(tweaks.gridCols)}
              onChange={(v) => setTweaks({ gridCols: Number(v) })}
              options={[{ value: "3", label: "3열" }, { value: "4", label: "4열" }, { value: "5", label: "5열" }]}
            />
          </TweakSection>
        </TweaksPanel>
      )}
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
