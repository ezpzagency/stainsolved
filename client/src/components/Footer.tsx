import { Link } from "wouter";
import { Droplet, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Droplet className="h-5 w-5" />
              <h3 className="font-semibold text-lg">StainSolver</h3>
            </div>
            <p className="text-sm mb-6 text-primary-foreground/80">The ultimate resource for removing stains from any material. Trusted by cleaning professionals and homeowners alike.</p>
            <div className="flex gap-4">
              <a href="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors" aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors" aria-label="LinkedIn">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Popular Stains</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/remove/wine/cotton" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Wine Stains</Link></li>
              <li><Link href="/remove/coffee/cotton" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Coffee Stains</Link></li>
              <li><Link href="/remove/oil/cotton" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Oil & Grease</Link></li>
              <li><Link href="/remove/ink/cotton" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Ink Stains</Link></li>
              <li><Link href="/remove/blood/cotton" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Blood Stains</Link></li>
              <li><Link href="/remove/grass/cotton" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Grass Stains</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Common Materials</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/materials" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Cotton</Link></li>
              <li><Link href="/materials" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Wool</Link></li>
              <li><Link href="/materials" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Silk</Link></li>
              <li><Link href="/materials" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Carpet</Link></li>
              <li><Link href="/materials" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Upholstery</Link></li>
              <li><Link href="/materials" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Leather</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">About Us</Link></li>
              <li><Link href="/" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Contact</Link></li>
              <li><Link href="/" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Cleaning Blog</Link></li>
              <li><Link href="/" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">FAQ</Link></li>
              <li><Link href="/" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link href="/" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        
        <Separator className="my-8 bg-primary-foreground/20" />
        
        <div className="text-sm text-center text-primary-foreground/70">
          <p>© {new Date().getFullYear()} StainSolver. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
