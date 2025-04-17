import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { 
  ArrowRight, 
  Ruler, 
  Leaf, 
  Star, 
  ChevronRight, 
  ThumbsUp, 
  Settings, 
  SquarePen, 
  Home, 
  CircleDollarSign, 
  Truck,
  Calculator,
  RefreshCw,
  Search
} from "lucide-react";
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const Index = () => {
  const navigate = useNavigate();
  const [length, setLength] = useState("10");
  const [width, setWidth] = useState("5");

  // Simple estimate calculation
  const calculateEstimate = () => {
    const l = parseFloat(length) || 0;
    const w = parseFloat(width) || 0;
    if (l <= 0 || w <= 0) return "0.00";
    
    // Base price per square meter
    const basePrice = 75;
    const area = (l * w) / 100; // Convert from cm to m²
    return (area * basePrice).toFixed(2);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-woodwise-background border-b border-border">
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
        {/* Hero Section with Image Background */}
        <section className="relative overflow-hidden" style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1562937825-61a266fef65f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')", 
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}>
          <div className="absolute inset-0 bg-black/50"></div>
          
          <div className="relative container mx-auto px-4 py-20 md:py-32">
            <div className="max-w-3xl">
              <Badge className="mb-4 bg-white/20 text-white hover:bg-white/25 transition-colors">
                Online Quote Builder
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white leading-tight">
                Custom Timber Solutions <br />for Every Project
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-2xl">
                Configure, quote, and order premium timber products tailored to your exact specifications. Fast, accurate, and hassle-free.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-white text-primary hover:bg-white/90"
                  onClick={() => navigate("/catalog")}
                >
                  Start Building Your Quote
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-primary bg-white/80 hover:bg-white"
                  onClick={() => navigate("/catalog")}
                >
                  Explore Products
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Quote Calculator Preview */}
        <section className="py-16 md:py-20 bg-woodwise-background">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="mb-4 bg-primary/10 text-primary">
                  Quick Estimate
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-woodwise-text">
                  Get an Instant Price Estimate
                </h2>
                <p className="text-lg mb-6 text-muted-foreground max-w-xl">
                  Try our simple calculator for a quick price range. For precise quotes with custom specifications, use our full quote builder.
                </p>
                <div className="space-y-4 mb-8">
                  <div className="flex items-center text-woodwise-text">
                    <Calculator className="mr-2 h-5 w-5 text-primary" />
                    <span>Instant calculations based on dimensions</span>
                  </div>
                  <div className="flex items-center text-woodwise-text">
                    <RefreshCw className="mr-2 h-5 w-5 text-primary" />
                    <span>Adjust specifications in real-time</span>
                  </div>
                  <div className="flex items-center text-woodwise-text">
                    <Search className="mr-2 h-5 w-5 text-primary" />
                    <span>Explore various timber options</span>
                  </div>
                </div>
                <Button onClick={() => navigate("/catalog")}>
                  Build Full Quote
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
              
              <div>
                <Card className="border border-border shadow-lg">
                  <CardHeader>
                    <CardTitle>Basic Price Estimator</CardTitle>
                    <CardDescription>Enter dimensions for a rough estimate</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Length (cm)</label>
                          <Input 
                            type="number" 
                            value={length}
                            onChange={(e) => setLength(e.target.value)}
                            min="1"
                            placeholder="Length"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Width (cm)</label>
                          <Input 
                            type="number" 
                            value={width}
                            onChange={(e) => setWidth(e.target.value)}
                            min="1"
                            placeholder="Width"
                          />
                        </div>
                      </div>
                      
                      <div className="pt-2">
                        <Tabs defaultValue="pine">
                          <TabsList className="w-full">
                            <TabsTrigger value="pine" className="flex-1">Pine</TabsTrigger>
                            <TabsTrigger value="oak" className="flex-1">Oak</TabsTrigger>
                            <TabsTrigger value="maple" className="flex-1">Maple</TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t p-4 bg-woodwise-light/30">
                    <div>
                      <p className="text-sm text-muted-foreground">Estimated Price:</p>
                      <p className="text-2xl font-bold">${calculateEstimate()}</p>
                    </div>
                    <Button onClick={() => navigate("/catalog")}>
                      Refine Quote
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Categories */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge className="mb-4">Product Categories</Badge>
              <h2 className="text-3xl font-bold mb-4">Explore Our Timber Solutions</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Browse our range of high-quality timber products, designed for both commercial and residential applications.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Structural Timber",
                  image: "https://images.unsplash.com/photo-1582450871972-ab5ca641643d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                  description: "High-strength timber for construction projects, including beams, columns, and frames.",
                  icon: <Home className="h-5 w-5" />
                },
                {
                  title: "Decking Materials",
                  image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                  description: "Premium weather-resistant timber perfect for outdoor living spaces and decks.",
                  icon: <Settings className="h-5 w-5" />
                },
                {
                  title: "Interior Finishing",
                  image: "https://images.unsplash.com/photo-1580693815118-4a1d5d417226?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                  description: "Fine-grade timber for interior applications like flooring, panels, and trim.",
                  icon: <SquarePen className="h-5 w-5" />
                },
              ].map((category, index) => (
                <Card key={index} className="overflow-hidden group cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => navigate("/catalog")}>
                  <div className="h-48 bg-woodwise-light relative overflow-hidden">
                    <img 
                      src={category.image} 
                      alt={category.title} 
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <span className="bg-primary/10 p-2 rounded-full mr-3 text-primary">
                        {category.icon}
                      </span>
                      {category.title}
                    </CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardFooter className="border-t pt-4">
                    <span className="text-primary flex items-center text-sm font-medium group-hover:underline">
                      View Products
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </span>
                  </CardFooter>
                </Card>
              ))}
            </div>
            
            <div className="text-center mt-10">
              <Button variant="outline" onClick={() => navigate("/catalog")}>
                View All Categories
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-16 md:py-20 bg-woodwise-light">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge className="mb-4">Our Advantage</Badge>
              <h2 className="text-3xl font-bold mb-4">Why Choose Валекс</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                We're dedicated to providing superior timber products with exceptional service at competitive prices.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: <Ruler className="h-10 w-10" />,
                  title: "Custom Sizes",
                  description: "Get timber cut precisely to your specifications, minimizing waste and saving you time."
                },
                {
                  icon: <ThumbsUp className="h-10 w-10" />,
                  title: "Premium Quality",
                  description: "All our timber products meet the highest industry standards for strength and durability."
                },
                {
                  icon: <CircleDollarSign className="h-10 w-10" />,
                  title: "Competitive Pricing",
                  description: "Transparent pricing with volume discounts available for larger projects."
                },
                {
                  icon: <Truck className="h-10 w-10" />,
                  title: "Fast Delivery",
                  description: "Quick and reliable delivery service to your home, worksite, or business."
                },
              ].map((feature, index) => (
                <Card key={index} className="text-center h-full flex flex-col border-none shadow-sm bg-white">
                  <CardHeader>
                    <div className="mx-auto p-3 bg-primary/10 text-primary rounded-full mb-4">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge className="mb-4">Testimonials</Badge>
              <h2 className="text-3xl font-bold mb-4">What Our Customers Say</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Don't just take our word for it - hear from customers who have used our timber products and quote builder.
              </p>
            </div>
            
            <Carousel className="w-full max-w-4xl mx-auto">
              <CarouselContent>
                {[
                  {
                    quote: "The quote builder made it incredibly easy to get accurate pricing for my deck project. The timber arrived exactly as specified and the quality was excellent.",
                    author: "Michael T.",
                    title: "Homeowner",
                    rating: 5
                  },
                  {
                    quote: "As a contractor, I need reliable suppliers. WoodWise consistently delivers quality timber on time and their quote system saves me hours compared to calling around for prices.",
                    author: "Sarah J.",
                    title: "Building Contractor",
                    rating: 5
                  },
                  {
                    quote: "I was renovating my home and needed specific trim dimensions. The custom sizing option was perfect, and their pricing beat the big box stores by a mile.",
                    author: "David L.",
                    title: "DIY Enthusiast",
                    rating: 4
                  }
                ].map((testimonial, index) => (
                  <CarouselItem key={index}>
                    <Card className="border border-border/30 shadow-sm">
                      <CardContent className="pt-8 px-6">
                        <div className="flex mb-4">
                          {Array(testimonial.rating).fill(0).map((_, i) => (
                            <Star key={i} className="h-5 w-5 text-amber-500 fill-amber-500" />
                          ))}
                        </div>
                        <p className="text-lg mb-6 italic">"{testimonial.quote}"</p>
                        <div className="flex items-center">
                          <div className="bg-primary/10 text-primary h-10 w-10 rounded-full flex items-center justify-center mr-3">
                            {testimonial.author.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold">{testimonial.author}</p>
                            <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="flex justify-center mt-8">
                <CarouselPrevious className="relative mr-2 static translate-y-0" />
                <CarouselNext className="relative ml-2 static translate-y-0" />
              </div>
            </Carousel>
          </div>
        </section>

        {/* Project Gallery */}
        <section className="py-16 bg-woodwise-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge className="mb-4">Inspiration</Badge>
              <h2 className="text-3xl font-bold mb-4">Project Gallery</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                See how our timber products have been used in real-world projects by homeowners and professionals.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: "Modern Deck", category: "Outdoor", image: "https://images.unsplash.com/photo-1604014059716-34a3cc0e3156?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
                { title: "Rustic Kitchen", category: "Interior", image: "https://images.unsplash.com/photo-1582037928769-351569db0392?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
                { title: "Garden Pergola", category: "Outdoor", image: "https://images.unsplash.com/photo-1597767521589-fec27bf12b19?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
                { title: "Custom Shelving", category: "Interior", image: "https://images.unsplash.com/photo-1551216223-163e0870c264?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
                { title: "Timber Frame Home", category: "Structural", image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
                { title: "Garden Bridge", category: "Landscape", image: "https://images.unsplash.com/photo-1586351012965-861624544334?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
              ].map((project, index) => (
                <div key={index} className="group relative overflow-hidden rounded-lg cursor-pointer h-64">
                  <img 
                    src={project.image} 
                    alt={project.title} 
                    className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4 text-white">
                    <Badge className="self-start mb-2 bg-primary">{project.category}</Badge>
                    <h3 className="text-lg font-semibold">{project.title}</h3>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-10">
              <Button onClick={() => navigate("/catalog")}>
                Get Materials For Your Project
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>

        {/* Sustainability Section */}
        <section className="py-16 bg-gradient-to-br from-woodwise-accent/10 to-woodwise-accent/20">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="mb-4 bg-woodwise-accent/20 text-woodwise-accent">
                  Sustainability
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-woodwise-text">
                  Our Commitment to the Environment
                </h2>
                <p className="text-lg mb-6 text-muted-foreground">
                  At Валекс, we're dedicated to responsible forestry practices and sustainable timber sourcing. We believe quality timber products shouldn't come at the expense of our environment.
                </p>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-start">
                    <div className="bg-woodwise-accent/10 p-2 rounded-full mr-3 text-woodwise-accent mt-1">
                      <Leaf className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Responsibly Sourced</h3>
                      <p className="text-muted-foreground">All our timber is sourced from certified sustainable forests and suppliers.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-woodwise-accent/10 p-2 rounded-full mr-3 text-woodwise-accent mt-1">
                      <RefreshCw className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Minimal Waste</h3>
                      <p className="text-muted-foreground">Our custom sizing helps reduce waste, and we recycle all timber offcuts and sawdust.</p>
                    </div>
                  </div>
                </div>
                
                <Button variant="outline" className="border-woodwise-accent text-woodwise-accent hover:bg-woodwise-accent/10">
                  Learn More About Our Practices
                </Button>
              </div>
              
              <div className="rounded-lg overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1473116763249-2faaef81ccda?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                  alt="Sustainable forestry" 
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Your Project?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto text-white/90">
              Create an account to save and track your quotes, or start browsing our catalog right away.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-white/90"
                onClick={() => navigate("/catalog")}
              >
                Build Your Quote Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white/10"
                onClick={() => navigate("/login")}
              >
                Create Account
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <Logo className="mb-4" />
              <p className="text-muted-foreground mb-4">
                Premium timber products for all your construction and woodworking needs.
              </p>
              <div className="flex space-x-4">
                {/* Social icons would go here */}
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-lg mb-4">Products</h3>
              <ul className="space-y-2">
                <li>
                  <a onClick={() => navigate("/catalog")} className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                    Structural Timber
                  </a>
                </li>
                <li>
                  <a onClick={() => navigate("/catalog")} className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                    Decking Materials
                  </a>
                </li>
                <li>
                  <a onClick={() => navigate("/catalog")} className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                    Interior Finishing
                  </a>
                </li>
                <li>
                  <a onClick={() => navigate("/catalog")} className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                    Custom Solutions
                  </a>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-lg mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <a className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                    Installation Guides
                  </a>
                </li>
                <li>
                  <a className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                    Wood Care Tips
                  </a>
                </li>
                <li>
                  <a className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                    Project Ideas
                  </a>
                </li>
                <li>
                  <a className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                    FAQ
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
                <li>Hours: Mon-Fri: 8am-5pm</li>
              </ul>
            </div>
          </div>
          
          <Separator className="my-8" />
          
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} WoodWise. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a className="hover:text-primary transition-colors cursor-pointer">Privacy Policy</a>
              <a className="hover:text-primary transition-colors cursor-pointer">Terms of Service</a>
              <a className="hover:text-primary transition-colors cursor-pointer">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
