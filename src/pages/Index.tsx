
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { ArrowRight } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <header className="bg-woodwise-background">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Logo />
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => navigate("/login")}>
              Log In
            </Button>
            <Button onClick={() => navigate("/catalog")}>
              Browse Products
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/90 to-primary py-16 md:py-24 text-white">
          <div className="container mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Premium Timber Products for Your Projects
              </h1>
              <p className="text-lg md:text-xl mb-8 text-white/90">
                Build your custom quote for high-quality timber materials tailored to your specific needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  variant="secondary"
                  onClick={() => navigate("/catalog")}
                  className="bg-white text-primary hover:bg-white/90"
                >
                  Browse Products
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={() => navigate("/login")}
                  className="border-white text-white hover:bg-white/10"
                >
                  Log In / Register
                </Button>
              </div>
            </div>
            <div className="hidden md:block">
              <img 
                src="/placeholder.svg" 
                alt="Timber products" 
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6 rounded-lg">
                <div className="bg-primary/10 text-primary h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Browse Products</h3>
                <p className="text-muted-foreground">
                  Explore our comprehensive catalog of high-quality timber products.
                </p>
              </div>
              <div className="text-center p-6 rounded-lg">
                <div className="bg-primary/10 text-primary h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Configure & Build Quote</h3>
                <p className="text-muted-foreground">
                  Select materials, dimensions, and quantities to build your custom quote.
                </p>
              </div>
              <div className="text-center p-6 rounded-lg">
                <div className="bg-primary/10 text-primary h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Receive Offers</h3>
                <p className="text-muted-foreground">
                  Submit your quote and receive competitive pricing from our team.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-woodwise-light">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto text-muted-foreground">
              Create an account to save and track your quotes, or start browsing our catalog right away.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" onClick={() => navigate("/catalog")}>
                Browse Products
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/login")}>
                Create Account
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-border">
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
                  <a onClick={() => navigate("/catalog")} className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                    Product Catalog
                  </a>
                </li>
                <li>
                  <a onClick={() => navigate("/login")} className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                    Login / Register
                  </a>
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
            <p>© {new Date().getFullYear()} WoodWise. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
