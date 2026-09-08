/* ============================================================
   The Art of Being Human — chapter engine
   Forked from projects/manifesto-2026-04-19/receipts.js

   Same architecture as Receipts: fixed stage, body scroll mapped to a
   float `progress`, eased render loop, Calm Kit motion respect, rail nav,
   static fallback. The canvas circle maths is gone — chapters are DOM
   layers that cross-dissolve, which keeps photographic quality intact and
   lets the GPU composite it.

   BEATS, not slides. A chapter owns an image; a beat owns a screen of copy.
   The sea runs its own beats over one seascape, and the moon and the
   following evening follow it as their own chapters — the direction doc
   fixes that sequence and says it must not be rearranged.

   Pacing note: every rate here is deliberately slow. The brief asks for an
   exhale, and an exhale cannot be rushed by an easing curve.
   ============================================================ */

(() => {

  // Chapter copy is VERBATIM from the client's WEB DIRECTION CREATION doc.
  // The doc's Golden Rule — "whenever we are tempted to add more text: REMOVE IT"
  // — is the acceptance criterion for this file. Do not pad these lines.
  //
  // ORDER IS THE CLIENT'S, given in writing 24 Aug 01:16, and matches the
  // direction doc section for section:
  //   hero · invitation · why egypt · the journey · integration · red sea ·
  //   full moon (past-life regression) · blue lotus (following evening) ·
  //   final sunrise + dance · the experience · who this is for · meet the hosts
  // The Anicca/Impermanence chapter that used to sit at 02 came from a
  // different source doc (Extra details Mehta) and was removed at her
  // instruction the same message — "the second page impermanence and 3rd
  // anicca don't belong there". Its frames were reused, not deleted.
  //
  // WORDING: ceremonies are named by EXPERIENCE AND INTENTION — never by what
  // is taken, how, or what it is supposed to do. That is the client's own rule,
  // written 24 Aug, and ./check-compliance.sh enforces it on every deploy. The
  // reasoning and the superseded wording are kept off the wire, in
  // projects/mehta-retreat-2026-08-11/CEREMONY-WORDING-2026-08-20.md.
  const CHAPTERS = [
    {
      num: '01', id: 'arrive', label: 'Arrive',
      img: 'img/01-blue-lagoon.jpg',
      alt: 'A turquoise bay held in bare desert mountains, the sun high over open sea',
      // Portrait source in a full-bleed frame: on a landscape screen `cover`
      // shows a horizontal band through the middle. Pinned just below centre
      // so the band keeps the bay and the sea horizon and loses the loose
      // foreground rock, which is the half that fights the opening copy.
      pos: 'center 48%',
      tint: ['#7FC4F0', '#4E93A6', '#5C4230'],
      beats: [{
        title: 'The Art of Being Human',
        meta: 'Egypt · November 18–28, 2026',
        lines: ['A 10-day journey into what it means to be human.'],
        // Enter button removed 8 Sep 2026 on her review — the scroll cue is
        // the only invitation the opening frame needs.
        opening: true,
      }],
    },
    {
      num: '02', id: 'invitation', label: 'The Invitation',
      img: 'img/02d-fireside.jpg',
      alt: 'A man kneeling to light a fire in the sand as the sky turns violet',
      tint: ['#E9BE93', '#5D608A', '#171626'],
      beats: [{
        title: 'What if you didn’t have to become anything?',
        lines: ['What if you could simply arrive?'],
        soft: ['With your light.', 'Your shadow.', 'Your questions.', 'Your contradictions.',
               'Your pleasure.', 'Your grief.', 'Your laughter.'],
      }, {
        lines: ['What if there was nothing to fix?', 'Only something to experience.'],
        soft: ['An invitation to slow down, feel deeply', 'and meet yourself exactly where you are.'],
      }],
    },
    {
      num: '03', id: 'egypt', label: 'Why Egypt',
      img: 'img/03-karnak.jpg',
      alt: 'Sunlight breaking low between the great carved columns of a temple hall, an obelisk standing beyond',
      // The sunburst — the whole point of the frame — sits at roughly 78% of
      // the image height, which a centred crop cuts off entirely on a laptop.
      // Pinned low so the band keeps the sun, the obelisk and the paved floor.
      pos: 'center 66%',
      tint: ['#E8D2A8', '#A8763F', '#3E2A1A'],
      beats: [{
        title: 'Why Egypt?',
        lines: ['Some places you visit.', 'Some places you feel.', 'Egypt is one of them.'],
        soft: ['Ancient. Alive. Contrasting.', 'Impossible to explain completely.'],
      }, {
        img: 'img/02b-stone-and-water.jpg',
        alt: 'Clear shallow water against bare mountains — stone meeting sea',
        lines: ['Stone and water.', 'Desert and sea.', 'Past and present.'],
        soft: ['We begin here.'],
      }],
    },
    {
      num: '04', id: 'desert', label: 'The Journey',
      img: 'img/03-desert.jpg',
      alt: 'Sinai mountains and open sand, immense and empty',
      tint: ['#D9B99B', '#9C7550', '#3E2C1E'],
      beats: [{
        title: 'Three days in the desert.',
        lines: ['The world becomes quieter.'],
        soft: ['We walk.', 'We sleep in a cave.', 'We gather around the fire.'],
      }, {
        img: 'img/03b-strip-away.jpg',
        alt: 'A lone acacia against the sun, low mountains behind it',
        lines: ['We let the desert do what it does.', "Strip away what isn't necessary."],
      }, {
        // Was inheriting the chapter frame, so this read as a repeat of beat 1.
        img: 'img/04c-nothing-to-prove.jpg',
        alt: 'Range behind range at dusk, the desert going pink and violet to the horizon',
        lines: ['Nothing to prove.', 'Nowhere to rush.', 'Just here.'],
      }],
    },
    {
      num: '05', id: 'ceremony', label: 'The Desert Ceremony',
      img: 'img/04-inner-journey.jpg',
      alt: 'Firelight on skin and hands, eyes closed, deliberately anonymous',
      tint: ['#C4622D', '#7A3418', '#20140C'],
      beats: [{
        // Her sentence, near enough word for word, from the 24 Aug wording note.
        title: 'And then, we go inward.',
        lines: ['As the afternoon unfolds,', 'we enter a carefully held desert ceremony.'],
        soft: ['The vastness of the landscape.', 'The silence.', 'The setting sun.'],
      }, {
        lines: ['Space for a deeper encounter', 'with ourselves.'],
        soft: ['Nothing to force.', 'Nothing to perform.', 'Whatever is ready to be met, we meet.'],
      }],
    },
    {
      num: '06', id: 'integration', label: 'Integration',
      // Three frames of the oasis itself, supplied by her 8 Sep 2026. The third
      // beat previously had no `img` and fell back to the chapter frame, so
      // slides 1 and 3 were the same picture — the same fault as chapter 04.
      img: 'img/06-malakot-day.jpg',
      alt: 'Domed earth shelters and woven rugs around a fire pit, mountains behind',
      tint: ['#B2C9C4', '#5E8079', '#1C2E2C'],
      beats: [{
        title: 'Return to the body.',
        lines: ['At Malakot Mountain Oasis,', 'we soften.'],
        soft: ['We rebirth in the temazcal, the mother’s womb.'],
      }, {
        img: 'img/06-malakot-ice.jpg',
        alt: 'Ice floating in a cold plunge pool, a lantern and herbs set on the stone edge',
        soft: ['Heat.', 'Cold.', 'Water.', 'Flowers.', 'Fire.', 'Breath.'],
      }, {
        img: 'img/06-malakot-night.jpg',
        // The domes, the lanterns and the fire are all in the lower half; a
        // centred crop lands on bare mountain. Pinned low, on her review.
        pos: 'center 78%',
        alt: 'The oasis at night — lanterns, a fire, the group gathered under stars',
        lines: ['We let the experience settle.', 'We integrate.', 'We come back.'],
      }],
    },
    {
      num: '07', id: 'sea', label: 'The Red Sea',
      img: 'img/07-wake.jpg',
      alt: 'The wake of a boat running back to a flat horizon, open blue in every direction',
      tint: ['#5DB6C4', '#1B4A5A', '#0A1F2A'],
      beats: [{
        title: 'Then, the land disappears.',
        lines: ['The Red Sea opens.'],
      }, {
        // Split out 8 Sep 2026 so the chapter runs water, water, dolphin.
        img: 'img/07-ocean-sunset.jpg',
        alt: 'Low sun breaking through cloud over a calm open sea',
        soft: ['We sail.', 'We swim.', 'We float.', 'We laugh.', 'We rest.'],
      }, {
        img: 'img/06d-dolphin.jpg',
        alt: 'A dolphin turning below the surface, a swimmer above it in open blue water',
        lines: ['And somewhere between the water and the sky,', 'time begins to disappear.'],
      }],
    },
    {
      num: '08', id: 'fullmoon', label: 'The Full Moon',
      // Copy is hers, from the THE FULL MOON section of her own timeline
      // (8 Sep 2026), used verbatim and only broken into beats. One frame
      // carries all three, at her request.
      img: 'img/08-moon.jpg',
      pos: 'center 26%',
      alt: 'A full moon breaking through cloud, its light laid across open water',
      tint: ['#8FA6C4', '#33506E', '#0A1420'],
      beats: [{
        title: 'The full moon rises.',
        lines: ['Tonight, 24 November,', 'the full moon rises over the Red Sea.'],
        soft: ['As the sun begins to set, we gather for a past-life regression',
               'beneath the full moon.'],
      }, {
        lines: ['A journey through memory, imagination, symbolism', 'and the deeper landscapes of the self.'],
        soft: ['We allow the moon, the sea and the night', 'to hold the space.'],
      }, {
        lines: ['Whatever arises is yours to explore.'],
        soft: ['A story.', 'An image.', 'A feeling.', 'A question.',
               'Or simply a sense of mystery.', '',
               'We don’t need to explain everything.', 'We simply listen.'],
      }],
    },
    {
      num: '09', id: 'lotus', label: 'The Blue Lotus Ceremony',
      // Deliberately NOT a second moon-over-water frame — chapter 08 already
      // owns that image, and back to back the two nights read as a stall. This
      // one is the source lotus frame graded down into the night palette
      // (build step in the project record); the doc's "no stock wellness
      // photography" rule is why the original saturated macro does not ship.
      img: 'img/09-blue-lotus-night.jpg',
      pos: '26% 34%',
      alt: 'A blue lotus in near-darkness, its petals barely lit',
      tint: ['#7E8FBE', '#2E3B63', '#0A0E1C'],
      beats: [{
        title: 'The following evening.',
        lines: ['A Blue Lotus ceremony,', 'inspired by ancient Egyptian symbolism.'],
        soft: ['The threshold between waking and dreaming.',
               'A quiet space for inner listening,', 'imagination,',
               'and the mysteries of the night.'],
      }],
    },
    {
      // Was 'The Last Sunrise' until 8 Sep 2026. Her own updated timeline heads
      // this day THE FINAL SUNSET and closes it "as the sun sets over the Red
      // Sea" — and the day now ends by turning for Hurghada, which only works
      // at dusk. Everything else in her wording was already identical: cacao,
      // fresh fruit, music, dancing. The id stays 'sunrise' so the #ch-sunrise
      // anchor in any link she has already shared does not break.
      num: '10', id: 'sunrise', label: 'The Final Sunset',
      img: 'img/07-last-sunrise.jpg',
      alt: 'Sunset over the Red Sea, bodies moving on deck in the last light',
      tint: ['#F2B45C', '#D4692E', '#3A1C10'],
      beats: [{
        title: 'And then, sunset.',
        lines: ['Our last evening at sea.'],
        soft: ['Cacao.', 'Music.', 'Fresh fruit.', 'The last light.'],
      }, {
        img: 'img/07b-we-dance.jpg',
        alt: 'Raised hands in silhouette against a burning sunset sky',
        lines: ['And we dance.'],
        soft: ['Not because we have somewhere to go.', 'But because we are here.', 'Alive.', 'Together.'],
      }, {
        title: 'An exhale.',
        climax: true,
      }],
    },
    {
      num: '11', id: 'experience', label: 'The Experience',
      img: 'img/02a-nothing-stays.jpg',
      alt: 'Moving water, its surface pulled into long soft streaks',
      tint: ['#C9D3D6', '#6E7E86', '#212B31'],
      beats: [{
        title: 'What it feels like to be there.',
        soft: ['Space to breathe.', 'Time in nature.', 'Movement.', 'Connection.', 'Silence.',
               'Laughter.', 'Deep conversations.', 'Fire.', 'Water.', 'The unknown.'],
      }, {
        lines: ['You don’t need to perform transformation.', 'You simply need to arrive.'],
        soft: ['Moments of being held.', 'Moments of letting go.', 'Moments that cannot be planned.'],
      }],
    },
    {
      num: '12', id: 'circle', label: 'Who This Is For',
      img: 'img/08-human-circle.jpg',
      alt: 'The group together, unposed — laughing, resting, leaning in',
      tint: ['#E0C9AE', '#96725A', '#2E211A'],
      beats: [{
        title: 'For all of us.',
        soft: ['All genders.', 'All orientations.', 'All identities.', 'All ways of being.'],
      }, {
        lines: ['There is no particular way you need to be to belong here.', 'Come as you are.'],
        soft: ['Different stories.', 'Different bodies.', 'Different lives.', 'One human circle.'],
      }, {
        title: 'We are all just being human.',
        climax: true,
      }],
    },
    {
      num: '13', id: 'story', label: 'Meet Mehta & Trish',
      // Cropped in from the full frame on her review, 8 Sep 2026 — "slide it
      // down so both faces are there… zoom in to them and their warm smiles."
      // Pinned to 33% so a laptop's letterbox crop lands on the two faces
      // rather than centring blindly between them and the ground.
      img: 'img/13-mehta-trish-faces.jpg',
      pos: 'center 33%',
      alt: 'Mehta and Trish together, leaning in, both smiling at the camera',
      tint: ['#D6BFA8', '#8A6A52', '#2A1D15'],
      beats: [{
        title: 'How this began',
        lines: ['This is not something I invented.', 'It is something I have lived.'],
        soft: ['A story about Egypt. Travel. The body. Movement.',
               'Connection. Women. Human. Culture.',
               'And the questions that keep bringing me deeper into what it means to be human.'],
        ctas: [{ label: 'Meet Mehta', href: 'mehta.html' },
               { label: 'Meet Trish', href: 'trish.html' }],
      }],
    },
    {
      num: '14', id: 'come', label: 'Come With Us',
      img: 'img/10-come-with-us.jpg',
      alt: 'A tiny figure walking away into an immense open landscape',
      tint: ['#EBD9C0', '#7E93A0', '#16222B'],
      beats: [{
        title: 'You don’t have to know exactly why you’re here.',
        lines: ['You don’t have to have it figured out.'],
        soft: ['Maybe something in you simply said:', 'Yes.', 'And maybe that’s enough.'],
      }, {
        soft: ['Ten days.', 'Desert.', 'Sea.', 'Fire.', 'Water.', 'Moonlight.', 'Sunrise.'],
      }, {
        title: 'The Art of Being Human',
        meta: 'Egypt · November 18–28, 2026',
        lines: ['Come as you are.'],
        cta: { label: 'Come with us', href: '#enquire', primary: true },
        closing: true,
      }],
    },
  ];

  // ---- Flatten chapters → beats, and record each chapter's beat span ----
  const BEATS = [];
  CHAPTERS.forEach((ch, ci) => {
    ch.start = BEATS.length;
    ch.beats.forEach((b) => BEATS.push({ ...b, chapter: ch, chapterIndex: ci }));
    ch.end = BEATS.length - 1;
  });
  const totalBeats = BEATS.length;

  // A chapter is a unit of NARRATIVE; a scene is a unit of PICTURE. They used to
  // be the same thing, which meant one chapter held one frame however many
  // screens of copy ran over it. Beats may now carry their own
  // `img`, and consecutive beats sharing a frame collapse back into one scene —
  // so an unchanged chapter still costs exactly one layer, as before.
  const SCENES = [];
  BEATS.forEach((b, i) => {
    const img = b.img || b.chapter.img;
    const prev = SCENES[SCENES.length - 1];
    if (prev && prev.img === img) { prev.end = i; return; }
    SCENES.push({
      img,
      // Portrait frames cover-crop hard on a landscape viewport; `pos` keeps the
      // subject (the moon, a horizon) inside the crop instead of centring blindly.
      pos: b.pos || b.chapter.pos || 'center',
      alt: b.alt || b.chapter.alt,
      tint: b.chapter.tint,
      // Only the chapter's opening scene carries the anchor id the [ENTER] cta targets
      id: i === b.chapter.start ? b.chapter.id : null,
      start: i, end: i,
    });
  });

  const stage = document.getElementById('stage');
  const railEl = document.getElementById('rail');
  if (!stage) return;

  // ---- Build the DOM ----
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const layers = SCENES.map((ch) => {
    const el = document.createElement('div');
    el.className = 'ch-layer';
    if (ch.id) el.id = 'ch-' + ch.id;
    el.style.setProperty('--tint-1', ch.tint[0]);
    el.style.setProperty('--tint-2', ch.tint[1]);
    el.style.setProperty('--tint-3', ch.tint[2]);
    // Image sits over the tint gradient. Until the real photograph lands the
    // gradient carries the chapter on its own — a missing file degrades to a
    // colour field rather than a broken frame.
    // The URL is parked in data-src, NOT background-image.
    //
    // WHY: every layer is built up-front, so setting background-image here made
    // the browser request all 23 photographs at once. The hero then queued
    // behind 28 competing downloads — measured at 1.6Mbps / 150ms RTT, the
    // opening image took 27.8 SECONDS to appear, and until it did the page was
    // a brown gradient. On a phone that reads as broken, not as slow.
    // hydrate() below attaches the image only for the chapters in view.
    el.innerHTML = `<div class="ch-img" role="img" aria-label="${esc(ch.alt)}"
        data-src="${esc(ch.img)}"
        style="background-position:${esc(ch.pos)}"></div><div class="ch-veil"></div>`;
    stage.appendChild(el);
    return el;
  });

  /** Attach photographs for the chapters within reach of `centre`, and drop
   *  the ones far behind so a long scroll doesn't hold 23 decoded bitmaps.
   *  AHEAD is deliberately larger than BEHIND: reading is forward motion. */
  const AHEAD = 2, BEHIND = 1;
  function hydrate(centre) {
    layers.forEach((el, i) => {
      const img = el.firstElementChild;
      if (!img) return;
      const want = i >= centre - BEHIND && i <= centre + AHEAD;
      if (want && !img.style.backgroundImage) {
        img.style.backgroundImage = `url('${img.dataset.src}')`;
      } else if (!want && img.style.backgroundImage && i < centre - BEHIND - 2) {
        img.style.backgroundImage = '';   // far behind — let the tint carry it again
      }
    });
  }
  hydrate(0);   // hero first, alone, so it lands immediately

  const copyWrap = document.createElement('div');
  copyWrap.className = 'ch-copy-wrap';
  stage.appendChild(copyWrap);

  const copies = BEATS.map((b, i) => {
    const el = document.createElement('div');
    el.className = 'ch-copy'
      + (b.opening ? ' is-opening' : '') + (b.closing ? ' is-closing' : '')
      + (b.climax ? ' is-climax' : '');
    const parts = [];
    if (i === b.chapter.start) {
      parts.push(`<p class="ch-num">${b.chapter.num} — ${esc(b.chapter.label)}</p>`);
    }
    if (b.title) parts.push(`<h2 class="ch-title">${esc(b.title)}</h2>`);
    if (b.meta) parts.push(`<p class="ch-meta">${esc(b.meta)}</p>`);
    if (b.lines) parts.push(`<p class="ch-lines">${b.lines.map(esc).join('<br />')}</p>`);
    if (b.soft) parts.push(`<p class="ch-soft">${b.soft.map(esc).join('<br />')}</p>`);
    // A beat may carry one cta or several — the hosts beat offers two doors,
    // per the direction doc's "Meet Mehta -> and the co-facilitator ->".
    const ctas = b.ctas || (b.cta ? [b.cta] : []);
    ctas.forEach((c) => parts.push(
      `<a class="ch-cta${c.primary ? ' is-primary' : ''}" href="${esc(c.href)}">${esc(c.label)}</a>`));
    el.innerHTML = parts.join('\n');
    copyWrap.appendChild(el);
    return el;
  });

  // Rail — one dot per chapter, not per beat
  CHAPTERS.forEach((ch, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'rail-dot';
    b.dataset.chapter = i;
    b.setAttribute('aria-label', `Chapter ${ch.num} — ${ch.label}`);
    b.innerHTML = `<span class="rail-label">${ch.num} ${esc(ch.label)}</span>`;
    b.addEventListener('click', () => scrollToBeat(ch.start));
    railEl.appendChild(b);
  });
  const railDots = railEl.querySelectorAll('.rail-dot');

  // Scroll driver height — one screen per beat
  const scroller = document.getElementById('scroll-driver');

  // Height is measured in PIXELS, not vh. Mobile browsers change the value of
  // 1vh every time the URL bar hides or reappears; across a 2300vh driver that
  // resized the whole scroll mid-gesture and threw progress sideways — read by
  // a reader as the page glitching and the words vanishing. Lock the pixel
  // height, and only remeasure when the layout has genuinely changed: a width
  // change, or a height change too large to be browser chrome.
  let lockedW = window.innerWidth, lockedH = window.innerHeight;
  const sizeDriver = () => {
    scroller.style.height = `${totalBeats * window.innerHeight}px`;
    lockedW = window.innerWidth; lockedH = window.innerHeight;
  };
  sizeDriver();

  // ---- Scroll → progress ----
  let progress = 0, rendered = 0, running = true, lastChapter = -1;

  // Beat progress is measured against the DRIVER, not the document.
  //
  // It used to divide by full document height, which silently coupled the beat
  // mapping to everything below the journey: adding the Practical and Come With
  // Us sections stretched the same scroll across a taller page, so the final
  // chapter only landed once the reader had scrolled past all of it. Measuring
  // the driver's own box keeps the journey exactly one screen per beat however
  // much page follows it.
  const driverRange = () => Math.max(0, scroller.offsetHeight - window.innerHeight);
  const scrollY = () => window.scrollY || document.documentElement.scrollTop || 0;
  const onScroll = () => {
    const h = driverRange();
    const t = h > 0 ? Math.min(1, Math.max(0, scrollY() / h)) : 0;
    progress = t * (totalBeats - 1);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => {
    // 120px of vertical movement with no width change is the URL bar, not a
    // rotation or a resized window. Ignore it; remeasuring here is the bug.
    if (window.innerWidth !== lockedW || Math.abs(window.innerHeight - lockedH) > 120) sizeDriver();
    onScroll();
  });
  onScroll();

  function scrollToBeat(idx) {
    window.scrollTo({ top: (idx / (totalBeats - 1)) * driverRange(), behavior: 'smooth' });
  }

  const getMotion = () => {
    const h = document.documentElement;
    if (h.classList.contains('ck-motion-off')) return 'off';
    if (h.classList.contains('ck-motion-low')) return 'low';
    return 'full';
  };
  let motion = getMotion();

  const clamp01 = (v) => v < 0 ? 0 : v > 1 ? 1 : v;

  // ---- Render ----
  const frame = () => {
    if (!running) return;
    motion = getMotion();
    if (motion === 'off') { requestAnimationFrame(frame); return; }

    // Slow on purpose. 0.055 reads as drift; anything near 0.2 reads as a slideshow.
    // But a fixed 0.055 also means a fast phone flick leaves `rendered` seconds
    // behind the finger, so copy kept arriving for scroll that had already
    // happened. Add a catch-up term proportional to how far behind it is: a
    // slow scroll keeps the drift, a flick lands where the reader put it.
    const behind = Math.abs(progress - rendered);
    const follow = (motion === 'low' ? 0.10 : 0.055) + Math.min(0.28, behind * 0.55);
    rendered += (progress - rendered) * follow;

    // --- Chapter image layers ---
    // Symmetric fading (both layers at ~0.5 mid-transition) double-exposed the
    // two photographs into mud. Layers are DOM siblings, so a later chapter
    // already paints above an earlier one: hold the outgoing frame fully opaque
    // and fade the incoming one down over the top of it. One image is always
    // solid, so a transition reads as a dissolve rather than a blend.
    let topSolid = 0;
    SCENES.forEach((ch, i) => {
      if (rendered >= ch.start) topSolid = i;
    });
    SCENES.forEach((ch, i) => {
      const op = rendered >= ch.start
        ? 1                                          // current, or passed and covered
        // x2.2 compresses the dissolve into the last ~45% of the beat gap
        // (at 1x, two photographs sat blended for a full screen of scrolling)
        // and MATCHES the copy rate below, so a chapter's words and its image
        // arrive together instead of the copy leading the picture.
        : clamp01(1 - (ch.start - rendered) * 2.2);   // upcoming: fades in on top
      const el = layers[i];
      if (op > 0.005) hydrate(i);   // a scene about to be seen gets its picture
      el.style.opacity = op.toFixed(3);
      // Anything fully covered by a solid layer above it stops compositing
      el.style.visibility = (op < 0.005 || i < topSolid) ? 'hidden' : 'visible';
      if (op > 0.005 && i >= topSolid && motion === 'full') {
        // Ken Burns: a slow push across the chapter's own span, never a zoom-out
        const span = Math.max(1, ch.end - ch.start + 1);
        const local = clamp01((rendered - ch.start + 0.5) / span);
        el.querySelector('.ch-img').style.transform =
          `scale(${(1.05 + local * 0.05).toFixed(4)}) translate3d(0, ${(local * -1.4).toFixed(2)}%, 0)`;
      }
    });

    // --- Beat copy: tighter cross-fade with a small parallax lift ---
    copies.forEach((el, i) => {
      const d = Math.abs(rendered - i);
      // A rate of 2.2 made a beat's words visible only while d < 0.45 — so for
      // 55% of every gap between beats NO copy was on screen at all, and the
      // midpoint was reliably blank. Reported 23 Aug as "the text disappears
      // after it appears", and it was doing exactly that.
      //
      // Text cannot cross-dissolve in place without turning to mud, so the two
      // never overlap: each beat reaches zero at the midpoint and its neighbour
      // takes over there. Smoothstep holds it perceptually solid for ~85% of
      // the beat and spends the blankness in an instant at the handover instead
      // of half the scroll.
      const t = clamp01((0.5 - d) * 6.5);
      const op = t * t * (3 - 2 * t);
      el.style.opacity = op.toFixed(3);
      el.style.visibility = op < 0.005 ? 'hidden' : 'visible';
      if (op > 0.005) {
        el.style.transform = `translate3d(0, ${((rendered - i) * -2.2).toFixed(2)}rem, 0)`;
      }
    });

    // --- Rail + document state ---
    const nearest = BEATS[Math.max(0, Math.min(totalBeats - 1, Math.round(rendered)))];
    if (nearest.chapterIndex !== lastChapter) {
      lastChapter = nearest.chapterIndex;
      railDots.forEach((d, i) => d.classList.toggle('is-active', i === lastChapter));
      document.body.dataset.chapter = CHAPTERS[lastChapter].id;
      const c = document.getElementById('counter');
      if (c) c.textContent = `${CHAPTERS[lastChapter].num} / ${CHAPTERS[CHAPTERS.length - 1].num}`;
    }

    // Scroll cue retires once they've started
    document.body.classList.toggle('has-moved', rendered > 0.25);

    requestAnimationFrame(frame);
  };

  // ---- Keyboard: arrows step one BEAT, so every screen of copy is reachable ----
  document.addEventListener('keydown', (e) => {
    const cur = Math.round(rendered);
    if (e.key === 'ArrowDown' || e.key === 'PageDown') {
      e.preventDefault(); scrollToBeat(Math.min(totalBeats - 1, cur + 1));
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault(); scrollToBeat(Math.max(0, cur - 1));
    } else if (e.key === 'Home') { e.preventDefault(); scrollToBeat(0); }
    else if (e.key === 'End')  { e.preventDefault(); scrollToBeat(totalBeats - 1); }
  });

  // In-page anchors (the [ENTER] cta) must move the scroll driver, not jump the DOM
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#ch-"]');
    if (!a) return;
    const ch = CHAPTERS.find((c) => 'ch-' + c.id === a.getAttribute('href'));
    if (ch) { e.preventDefault(); scrollToBeat(ch.start); }
  });

  const boot = () => {
    motion = getMotion();
    onScroll();
    rendered = progress;
    if (motion !== 'off') frame();
  };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(boot); else boot();

  document.addEventListener('calm-kit-change', () => {
    motion = getMotion();
    if (motion !== 'off' && !running) { running = true; frame(); }
  });

})();
