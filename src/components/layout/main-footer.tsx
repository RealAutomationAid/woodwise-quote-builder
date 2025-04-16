
import { Logo } from "@/components/ui/logo";
import { Link } from "react-router-dom";

export function MainFooter() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Logo className="mb-4" />
            <p className="text-muted-foreground">
              Premium timber products for all your construction and woodworking needs.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/catalog" className="text-muted-foreground hover:text-primary transition-colors">
                  Product Catalog
                </Link>
              </li>
              <li>
                <Link to="/quote" className="text-muted-foreground hover:text-primary transition-colors">
                  Current Quote
                </Link>
              </li>
              <li>
                <Link to="/quotes" className="text-muted-foreground hover:text-primary transition-colors">
                  Quote History
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-lg mb-4">Contact</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>Email: info@woodwise.com</li>
              <li>Phone: +1 (555) 123-4567</li>
              <li>Address: 123 Timber Lane, Woodland, CA 12345</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border mt-8 pt-6 text-center text-sm text-muted-foreground">
          <p>© {currentYear} WoodWise. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
