import mmLogo from "@/assets/mad-monkey-logo-solid.png";

export function Footer() {
  return (
    <footer className="bg-mm-black px-5 pb-8 pt-10 text-mm-bone md:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 font-sticker text-[11px] tracking-[0.2em] text-mm-bone/70">
            <a href="https://madmonkeyhostels.com/terms-and-conditions/" target="_blank" rel="noopener noreferrer" className="hover:text-mm-lime">
              TERMS
            </a>
            <a href="https://madmonkeyhostels.com/privacy-policy/" target="_blank" rel="noopener noreferrer" className="hover:text-mm-lime">
              PRIVACY
            </a>
            <a href="mailto:hello@madmonkeyhostels.com" className="hover:text-mm-lime">
              CONTACT
            </a>
          </nav>
          <p className="mt-6 font-sticker text-[10px] tracking-[0.22em] text-mm-bone/50">
            © {new Date().getFullYear()} MAD MONKEY HOSTELS · ALL IN GROUP TRIPS
          </p>
        </div>
        <img src={mmLogo} alt="Mad Monkey Hostels" className="h-10 w-auto opacity-90" />
      </div>
    </footer>
  );
}
