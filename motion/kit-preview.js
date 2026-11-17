// Browser preview only. Each effect registers a PAUSED timeline (HyperFrames seeks it frame by frame);
// opened with ?preview this loops it on GSAP's own clock, and ?t=1.5 freezes it at 1.5 s for screenshots.
// HyperFrames never passes either parameter, so none of this runs in a render.
(function () {
  const q = new URLSearchParams(location.search);
  if (!q.has("preview") && !q.has("t")) return;
  const id = document.getElementById("root").dataset.compositionId;
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => {
    const tl = window.__timelines[id];
    if (q.has("t")) { tl.time(parseFloat(q.get("t"))); document.documentElement.dataset.ready = "1"; return; }
    const loop = () => { tl.time(0); gsap.to(tl, { time: tl.duration(), duration: tl.duration(), ease: "none", onComplete: () => gsap.delayedCall(0.9, loop) }); };
    loop();
  });
})();
