import { Map, CalendarDays, Wallet, Users, ArrowRight } from "lucide-react";
import { LeadForm } from "@/components/LeadForm";
import { Ticker } from "@/components/Ticker";
import { Footer } from "@/components/Footer";
import { Sticker } from "@/components/Sticker";
import heroImg from "@/assets/home-hero.png";
import allInLogo from "@/assets/all-in-logo.png";

const GUIDE_CONTENTS = [
  {
    icon: Map,
    title: "EVERY ROUTE",
    desc: "Indonesia, Cambodia and Vietnam — mapped stop by stop, so you know exactly where you're waking up.",
  },
  {
    icon: CalendarDays,
    title: "EVERY DATE",
    desc: "The full departure calendar, plus which trips are filling up fastest.",
  },
  {
    icon: Wallet,
    title: "THE REAL PRICE",
    desc: "What's in, what's not, and what you'll actually spend. No mystery add-ons.",
  },
];

const PROOF = [
  { stat: "53,000+", label: "IN THE CREW" },
  { stat: "3", label: "COUNTRIES" },
  { stat: "24", label: "MAX CREW SIZE" },
  { stat: "$99", label: "HOLDS YOUR SPOT" },
];

export default function Index() {
  return (
    <main className="min-h-screen bg-mm-black text-mm-bone">
      {/* ============ HERO + FORM ============ */}
      <section className="relative isolate overflow-hidden border-b-[4px] border-mm-bone">
        {/* Background image + overlays */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroImg}
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover object-[60%_center]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-mm-black/80 via-mm-black/60 to-mm-black/95" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(10,10,10,0.92)_0%,rgba(10,10,10,0.72)_45%,rgba(10,10,10,0.35)_100%)]" />
        </div>

        <div className="relative z-10 mx-auto grid max-w-6xl gap-10 px-5 pb-14 pt-10 md:grid-cols-[1.05fr_minmax(360px,0.95fr)] md:items-center md:gap-12 md:px-8 md:pb-20 md:pt-16">
          {/* ---- Left: the pitch ---- */}
          <div>
            <img src={allInLogo} alt="ALL IN" className="h-11 w-auto md:h-14" />

            <h1 className="mt-6 font-display text-[clamp(2.6rem,11vw,4.5rem)] leading-[0.9] text-mm-bone">
              TRIPS THAT
              <br />
              ACTUALLY MAKE IT
              <br />
              <span className="text-mm-lime">OUT OF THE</span>{" "}
              <span className="text-mm-orange">GROUP CHAT.</span>
            </h1>

            <p className="mt-5 max-w-md text-[15px] font-semibold leading-snug text-mm-bone/85 md:text-base">
              Group backpacker trips through Indonesia, Cambodia and Vietnam. Real Mad Monkey hostels
              every night, a crew of up to 24, and none of the planning.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Sticker color="lime" rotate={-3}>
                FREE TRIP GUIDE
              </Sticker>
              <Sticker color="cyan" rotate={2}>
                NO PLANNING NEEDED
              </Sticker>
            </div>

            {/* Mobile-only nudge down to the form */}
            <a
              href="#get-the-guide"
              className="mt-7 inline-flex items-center gap-2 border-[3px] border-mm-bone bg-mm-pink px-5 py-3 font-sticker text-xs tracking-[0.14em] text-mm-black shadow-mm-bone-sm md:hidden"
            >
              GET THE GUIDE <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>

          {/* ---- Right: the form ---- */}
          <div className="md:pl-4">
            <LeadForm />
          </div>
        </div>
      </section>

      <Ticker />

      {/* ============ WHAT'S IN THE GUIDE ============ */}
      <section className="bg-mm-bone px-5 py-14 text-mm-black md:px-8 md:py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-display text-[2rem] leading-[0.95] md:text-[2.75rem]">
            WHAT'S IN
            <br className="md:hidden" />{" "}
            <span className="bg-mm-lime px-1.5">THE GUIDE.</span>
          </h2>

          <div className="mt-8 grid gap-5 md:mt-12 md:grid-cols-3 md:gap-6">
            {GUIDE_CONTENTS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="border-[3px] border-mm-black bg-mm-paper p-6 shadow-mm-sm">
                <Icon className="h-7 w-7" aria-hidden="true" />
                <h3 className="mt-4 font-display text-xl leading-none">{title}</h3>
                <p className="mt-3 text-sm font-semibold leading-snug text-mm-black/70">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ PROOF ============ */}
      <section className="border-y-[4px] border-mm-bone bg-mm-black px-5 py-12 md:px-8 md:py-14">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 text-center md:grid-cols-4">
          {PROOF.map(({ stat, label }) => (
            <div key={label}>
              <p className="font-display text-[2.25rem] leading-none text-mm-lime md:text-[3rem]">{stat}</p>
              <p className="mt-2 font-sticker text-[10px] tracking-[0.18em] text-mm-bone/70">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="bg-mm-orange px-5 py-14 text-mm-black md:px-8 md:py-20">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <Users className="h-8 w-8" aria-hidden="true" />
          <h2 className="mt-4 font-display text-[2rem] leading-[0.95] md:text-[3rem]">
            SOLO? NOT FOR LONG.
          </h2>
          <p className="mt-4 max-w-lg text-sm font-semibold leading-snug text-mm-black/75 md:text-base">
            Send me the guide and see where the crew is heading next. It's free, and it takes 20 seconds.
          </p>
          <a
            href="#get-the-guide"
            className="mt-7 inline-flex items-center gap-2 border-[3px] border-mm-black bg-mm-black px-7 py-4 font-display text-base text-mm-bone shadow-mm-paper transition-transform hover:-translate-x-[2px] hover:-translate-y-[2px]"
          >
            GET THE FREE GUIDE <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </section>

      <Footer />
    </main>
  );
}
