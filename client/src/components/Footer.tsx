import { Link } from "wouter";

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-semibold mb-4">StainSolver</h3>
            <p className="text-sm mb-4">The ultimate resource for removing stains from any material. Trusted by cleaning professionals and homeowners alike.</p>
            <div className="flex gap-4">
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <i className="ri-facebook-fill"></i>
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <i className="ri-twitter-fill"></i>
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <i className="ri-instagram-fill"></i>
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <i className="ri-pinterest-fill"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Popular Stains</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/stains/wine" className="hover:text-white transition-colors">Wine Stains</Link></li>
              <li><Link href="/stains/coffee" className="hover:text-white transition-colors">Coffee Stains</Link></li>
              <li><Link href="/stains/oil" className="hover:text-white transition-colors">Oil & Grease</Link></li>
              <li><Link href="/stains/ink" className="hover:text-white transition-colors">Ink Stains</Link></li>
              <li><Link href="/stains/blood" className="hover:text-white transition-colors">Blood Stains</Link></li>
              <li><Link href="/stains/grass" className="hover:text-white transition-colors">Grass Stains</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Common Materials</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/materials/cotton" className="hover:text-white transition-colors">Cotton</Link></li>
              <li><Link href="/materials/wool" className="hover:text-white transition-colors">Wool</Link></li>
              <li><Link href="/materials/silk" className="hover:text-white transition-colors">Silk</Link></li>
              <li><Link href="/materials/carpet" className="hover:text-white transition-colors">Carpet</Link></li>
              <li><Link href="/materials/upholstery" className="hover:text-white transition-colors">Upholstery</Link></li>
              <li><Link href="/materials/leather" className="hover:text-white transition-colors">Leather</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/blog" className="hover:text-white transition-colors">Cleaning Blog</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-800 mt-8 pt-8 text-sm text-center">
          <p>© {new Date().getFullYear()} StainSolver. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
