import { Link } from "wouter";

const Header = () => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-primary text-2xl"><i className="ri-water-flash-line"></i></span>
          <span className="font-semibold text-lg">StainSolver</span>
        </Link>
        <nav>
          <ul className="flex gap-6">
            <li>
              <Link href="/stains" className="text-sm font-medium text-slate-700 hover:text-primary transition-colors">
                Stains
              </Link>
            </li>
            <li>
              <Link href="/materials" className="text-sm font-medium text-slate-700 hover:text-primary transition-colors">
                Materials
              </Link>
            </li>
            <li>
              <Link href="/guides" className="text-sm font-medium text-slate-700 hover:text-primary transition-colors">
                Guides
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
