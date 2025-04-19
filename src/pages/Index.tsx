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
  Search,
  CheckCircle2
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
            <Button variant="outline" onClick={() => navigate("/login")} className="border-primary text-primary hover:bg-primary/10 hover:text-primary">Вход</Button>
            <Button onClick={() => navigate("/catalog")} className="bg-primary text-white hover:bg-primary/90">Разгледайте продуктите</Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section with Image Background */}
        <section className="relative overflow-hidden" style={{ 
          backgroundImage: "url('https://images.pexels.com/photos/6608896/pexels-photo-6608896.jpeg?auto=compress&cs=tinysrgb&w=1920')", 
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: "750px"
        }}>
          <div className="absolute inset-0 bg-black/60 bg-gradient-to-r from-black/80 to-black/40"></div>
          
          <div className="relative container mx-auto px-4 py-20 md:py-32 h-full flex items-center">
            <div className="max-w-3xl">
              <div className="relative mb-12">
                <div className="absolute -left-6 top-0 w-1 h-32 bg-primary"></div>
                <Badge className="mb-6 bg-primary/90 text-white hover:bg-primary/95 transition-colors">
                  Премиум дървени материали
                </Badge>
                <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
                  <span className="block mb-3">Персонализирани</span>
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/90 to-primary/70 mb-3">
                    дървени решения
                  </span>
                  <div className="flex items-center">
                    <span className="block bg-white/10 backdrop-blur-sm p-2 pl-4 rounded-lg">за всеки проект</span>
                    <div className="ml-4 h-1 w-24 bg-primary/70 rounded-full"></div>
                  </div>
                </h1>
              </div>
              <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-xl relative">
                <span className="absolute -left-4 top-0 w-1 h-full bg-white/30"></span>
                Конфигурирайте, изчислете и поръчайте премиум дървени продукти според вашите изисквания. Бързо, точно и без излишни усилия.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 relative">
                <div className="absolute -left-10 -bottom-12 w-32 h-32 rounded-full border-2 border-dashed border-primary/30 z-0"></div>
                <Button 
                  size="lg" 
                  className="bg-primary text-white hover:bg-primary/90 relative z-10"
                  onClick={() => navigate("/catalog")}
                >
                  Започнете с вашата оферта
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white/20 transition-colors relative z-10"
                  onClick={() => navigate("/catalog")}
                >
                  Разгледайте продуктите
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
                  Бърза калкулация
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-woodwise-text">
                  Вземете моментална ценова оферта
                </h2>
                <p className="text-lg mb-6 text-muted-foreground max-w-xl">
                  Използвайте нашия калкулатор за бърза ориентировъчна цена. За прецизни оферти с персонализирани спецификации, използвайте пълния ни калкулатор за оферти.
                </p>
                <div className="space-y-4 mb-8">
                  <div className="flex items-center text-woodwise-text">
                    <Calculator className="mr-2 h-5 w-5 text-primary" />
                    <span>Моментални изчисления според размерите</span>
                  </div>
                  <div className="flex items-center text-woodwise-text">
                    <RefreshCw className="mr-2 h-5 w-5 text-primary" />
                    <span>Променяйте параметрите в реално време</span>
                  </div>
                  <div className="flex items-center text-woodwise-text">
                    <Search className="mr-2 h-5 w-5 text-primary" />
                    <span>Разгледайте различни видове дървесина</span>
                  </div>
                </div>
                <Button onClick={() => navigate("/catalog")}>Създайте пълна оферта<ArrowRight className="ml-2 h-5 w-5" /></Button>
              </div>
              
              <div>
                <Card className="border border-border shadow-lg">
                  <CardHeader>
                    <CardTitle>Базов калкулатор</CardTitle>
                    <CardDescription>Въведете размери за ориентировъчна цена</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Дължина (см)</label>
                          <Input 
                            type="number" 
                            value={length}
                            onChange={(e) => setLength(e.target.value)}
                            min="1"
                            placeholder="Length"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Ширина (см)</label>
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
                            <TabsTrigger value="pine" className="flex-1">Бор</TabsTrigger>
                            <TabsTrigger value="oak" className="flex-1">Дъб</TabsTrigger>
                            <TabsTrigger value="maple" className="flex-1">Клен</TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t p-4 bg-woodwise-light/30">
                    <div>
                      <p className="text-sm text-muted-foreground">Ориентировъчна цена:</p>
                      <p className="text-2xl font-bold">{calculateEstimate()} лв.</p>
                    </div>
                    <Button onClick={() => navigate("/catalog")}>Прецизирайте офертата</Button>
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
              <Badge className="mb-4 bg-primary/10 text-primary">Категории продукти</Badge>
              <h2 className="text-3xl font-bold mb-4">Разгледайте нашите дървени решения</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Разгледайте нашата гама от висококачествени дървени продукти, подходящи за търговски и жилищни приложения.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Конструкционна дървесина",
                  image: "https://images.pexels.com/photos/6474462/pexels-photo-6474462.jpeg?auto=compress&cs=tinysrgb&w=800",
                  description: "Високоякостна дървесина за строителни проекти – греди, колони и рамки.",
                  icon: <Home className="h-5 w-5" />
                },
                {
                  title: "Декинг материали",
                  image: "https://images.pexels.com/photos/7028544/pexels-photo-7028544.jpeg?auto=compress&cs=tinysrgb&w=800",
                  description: "Премиум дървесина, устойчива на атмосферни влияния – идеална за тераси и външни пространства.",
                  icon: <Settings className="h-5 w-5" />
                },
                {
                  title: "Интериорно обзавеждане",
                  image: "https://images.pexels.com/photos/7319316/pexels-photo-7319316.jpeg?auto=compress&cs=tinysrgb&w=800",
                  description: "Фина дървесина за вътрешни приложения – подове, панели и лайсни.",
                  icon: <SquarePen className="h-5 w-5" />
                },
              ].map((category, index) => (
                <Card key={index} className="overflow-hidden group cursor-pointer hover:shadow-md transition-shadow border border-border/50"
                      onClick={() => navigate("/catalog")}>
                  <div className="h-52 relative overflow-hidden">
                    <img 
                      src={category.image} 
                      alt={category.title} 
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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
                      Виж продукти
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </span>
                  </CardFooter>
                </Card>
              ))}
            </div>
            
            <div className="text-center mt-10">
              <Button variant="outline" onClick={() => navigate("/catalog")}>Виж всички категории<ChevronRight className="ml-1 h-4 w-4" /></Button>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-16 md:py-20 bg-woodwise-light">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge className="mb-4">Нашите предимства</Badge>
              <h2 className="text-3xl font-bold mb-4">Защо да изберете Валекс</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Ние предлагаме първокласни дървени продукти с отлично обслужване и конкурентни цени.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: <Ruler className="h-10 w-10" />,
                  title: "Персонализирани размери",
                  description: "Дървесина, изрязана по вашите изисквания – по-малко отпадък и спестено време."
                },
                {
                  icon: <ThumbsUp className="h-10 w-10" />,
                  title: "Премиум качество",
                  description: "Всички продукти отговарят на най-високите стандарти за здравина и издръжливост."
                },
                {
                  icon: <CircleDollarSign className="h-10 w-10" />,
                  title: "Конкурентни цени",
                  description: "Прозрачни цени и отстъпки при по-големи поръчки."
                },
                {
                  icon: <Truck className="h-10 w-10" />,
                  title: "Бърза доставка",
                  description: "Бърза и надеждна доставка до вашия дом, обект или бизнес."
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
              <Badge className="mb-4 bg-primary/10 text-primary">Отзиви</Badge>
              <h2 className="text-3xl font-bold mb-4">Какво казват нашите клиенти</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Не вярвайте само на нашите думи – вижте мненията на клиенти, използвали нашите продукти и калкулатор за оферти.
              </p>
            </div>
            
            <Carousel className="w-full max-w-4xl mx-auto">
              <CarouselContent>
                {[
                  {
                    quote: "Калкулаторът за оферти направи процеса изключително лесен и получих точна цена за моята тераса. Дървесината пристигна точно по спецификация и качеството беше отлично.",
                    author: "Михаил Т.",
                    title: "Собственик на жилище",
                    rating: 5,
                    image: "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150"
                  },
                  {
                    quote: "Като строителен предприемач имам нужда от надеждни доставчици. Валекс винаги доставя качествена дървесина навреме, а системата за оферти ми спестява часове.",
                    author: "Сара Ж.",
                    title: "Строителен предприемач",
                    rating: 5,
                    image: "https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=150"
                  },
                  {
                    quote: "Реновирах дома си и имах нужда от специфични размери за лайсни. Персонализираните опции бяха идеални, а цените бяха по-добри от големите магазини.",
                    author: "Давид Л.",
                    title: "Любител майстор",
                    rating: 4,
                    image: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150"
                  }
                ].map((testimonial, index) => (
                  <CarouselItem key={index}>
                    <Card className="border border-border/30 shadow-md bg-woodwise-background/30">
                      <CardContent className="pt-8 px-6 md:px-8">
                        <div className="flex mb-4">
                          {Array(testimonial.rating).fill(0).map((_, i) => (
                            <Star key={i} className="h-5 w-5 text-amber-500 fill-amber-500" />
                          ))}
                          {Array(5 - testimonial.rating).fill(0).map((_, i) => (
                            <Star key={i} className="h-5 w-5 text-amber-100" />
                          ))}
                        </div>
                        <p className="text-lg md:text-xl mb-6 italic text-woodwise-text">"{testimonial.quote}"</p>
                        <div className="flex items-center">
                          {testimonial.image ? (
                            <img
                              src={testimonial.image}
                              alt={testimonial.author}
                              className="h-12 w-12 rounded-full object-cover mr-4"
                            />
                          ) : (
                            <div className="bg-primary/10 text-primary h-12 w-12 rounded-full flex items-center justify-center mr-4">
                              {testimonial.author.charAt(0)}
                            </div>
                          )}
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
              <Badge className="mb-4 bg-primary/10 text-primary">Вдъхновение</Badge>
              <h2 className="text-3xl font-bold mb-4">Галерия проекти</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Вижте как нашите продукти се използват в реални проекти от клиенти и професионалисти.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: "Модерна тераса", category: "Външно", image: "https://images.pexels.com/photos/4946775/pexels-photo-4946775.jpeg?auto=compress&cs=tinysrgb&w=800" },
                { title: "Рустик кухня", category: "Интериор", image: "https://images.pexels.com/photos/6782567/pexels-photo-6782567.jpeg?auto=compress&cs=tinysrgb&w=800" },
                { title: "Градинска пергола", category: "Външно", image: "https://images.pexels.com/photos/5997993/pexels-photo-5997993.jpeg?auto=compress&cs=tinysrgb&w=800" },
                { title: "Дървени рафтове", category: "Интериор", image: "https://images.pexels.com/photos/7005439/pexels-photo-7005439.jpeg?auto=compress&cs=tinysrgb&w=800" },
                { title: "Дървена къща", category: "Конструкция", image: "https://images.pexels.com/photos/2510067/pexels-photo-2510067.jpeg?auto=compress&cs=tinysrgb&w=800" },
                { title: "Градински мост", category: "Ландшафт", image: "https://images.pexels.com/photos/4846097/pexels-photo-4846097.jpeg?auto=compress&cs=tinysrgb&w=800" },
              ].map((project, index) => (
                <div key={index} className="group relative overflow-hidden rounded-lg cursor-pointer h-72 shadow-md">
                  <img 
                    src={project.image} 
                    alt={project.title} 
                    className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-80 flex flex-col justify-end p-6 text-white">
                    <Badge className="self-start mb-2 bg-primary hover:bg-primary/90">{project.category}</Badge>
                    <h3 className="text-xl font-semibold group-hover:text-primary/90 transition-colors">{project.title}</h3>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-10">
              <Button onClick={() => navigate("/catalog")} className="mt-6">Вземете материали за вашия проект<ArrowRight className="ml-2 h-5 w-5" /></Button>
            </div>
          </div>
        </section>

        {/* Sustainability Section */}
        <section className="py-16 bg-gradient-to-br from-woodwise-accent/10 to-woodwise-accent/20">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="mb-4 bg-woodwise-accent/20 text-woodwise-accent">
                  Устойчивост
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-woodwise-text">
                  Нашият ангажимент към околната среда
                </h2>
                <p className="text-lg mb-6 text-muted-foreground">
                  Във Валекс сме отдадени на отговорно управление на горите и устойчив добив на дървесина. Вярваме, че качествените продукти не трябва да са за сметка на природата.
                </p>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-start">
                    <div className="bg-woodwise-accent/10 p-2 rounded-full mr-3 text-woodwise-accent mt-1">
                      <Leaf className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Отговорен добив</h3>
                      <p className="text-muted-foreground">Всички продукти са от сертифицирани устойчиви гори и доставчици.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-woodwise-accent/10 p-2 rounded-full mr-3 text-woodwise-accent mt-1">
                      <RefreshCw className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Минимални отпадъци</h3>
                      <p className="text-muted-foreground">Персонализираните размери намаляват отпадъка, а всички остатъци се рециклират.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-woodwise-accent/10 p-2 rounded-full mr-3 text-woodwise-accent mt-1">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Качество и дълготрайност</h3>
                      <p className="text-muted-foreground">Дървените изделия с високо качество имат по-дълъг живот и допринасят за намаляване на потреблението.</p>
                    </div>
                  </div>
                </div>
                
                <Button variant="outline" className="border-woodwise-accent text-woodwise-accent hover:bg-woodwise-accent/10">
                  Научете повече за нашите практики
                </Button>
              </div>
              
              <div className="rounded-lg overflow-hidden shadow-lg">
                <img 
                  src="https://images.pexels.com/photos/1632790/pexels-photo-1632790.jpeg?auto=compress&cs=tinysrgb&w=800" 
                  alt="Sustainable forestry" 
                  className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-primary/10 text-primary">Услуги</Badge>
              <h2 className="text-3xl font-bold mb-4">Какво ви предлагаме</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                От качествени материали до професионални съвети - ние сме вашият партньор във всички проекти свързани с дървесина.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  title: "Качествени материали",
                  description: "Внимателно подбрана дървесина от проверени доставчици и устойчиви източници.",
                  image: "https://images.pexels.com/photos/6102837/pexels-photo-6102837.jpeg?auto=compress&cs=tinysrgb&w=800"
                },
                {
                  title: "Персонализирани размери",
                  description: "Предлагаме рязане на дървесина по вашите точни спецификации и изисквания.",
                  image: "https://images.pexels.com/photos/6308028/pexels-photo-6308028.jpeg?auto=compress&cs=tinysrgb&w=800"
                },
                {
                  title: "Професионални съвети",
                  description: "Нашият екип от експерти ще ви помогне да изберете най-подходящите материали за вашия проект.",
                  image: "https://images.pexels.com/photos/6422123/pexels-photo-6422123.jpeg?auto=compress&cs=tinysrgb&w=800"
                },
                {
                  title: "Бърза доставка",
                  description: "Осигуряваме навременна доставка до вашия обект или адрес с минимално закъснение.",
                  image: "https://images.pexels.com/photos/6233081/pexels-photo-6233081.jpeg?auto=compress&cs=tinysrgb&w=800"
                }
              ].map((service, index) => (
                <div key={index} className="group cursor-pointer">
                  <div className="rounded-lg overflow-hidden mb-4 shadow-md">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-48 object-cover object-center transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">{service.title}</h3>
                  <p className="text-muted-foreground">{service.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-primary to-primary/80 text-white">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto bg-white/10 p-8 md:p-12 rounded-lg backdrop-blur-sm">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Готови ли сте да започнете вашия проект?</h2>
              <p className="text-xl mb-8 max-w-2xl mx-auto text-white/90">
                Създайте профил, за да запазвате и следите вашите оферти, или разгледайте каталога ни веднага.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button 
                  size="lg" 
                  className="bg-white text-primary hover:bg-white/90"
                  onClick={() => navigate("/catalog")}
                >
                  Създайте оферта сега
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white/20 transition-colors"
                  onClick={() => navigate("/login")}
                >
                  Създайте профил
                </Button>
              </div>
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
                Премиум дървени продукти за всички ваши строителни и дърводелски нужди.
              </p>
              <div className="flex space-x-4">
                {/* Social icons would go here */}
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-lg mb-4">Продукти</h3>
              <ul className="space-y-2">
                <li>
                  <a onClick={() => navigate("/catalog")} className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                    Конструкционна дървесина
                  </a>
                </li>
                <li>
                  <a onClick={() => navigate("/catalog")} className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                    Декинг материали
                  </a>
                </li>
                <li>
                  <a onClick={() => navigate("/catalog")} className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                    Интериорно обзавеждане
                  </a>
                </li>
                <li>
                  <a onClick={() => navigate("/catalog")} className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                    Персонализирани решения
                  </a>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-lg mb-4">Ресурси</h3>
              <ul className="space-y-2">
                <li>
                  <a className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                    Ръководства за монтаж
                  </a>
                </li>
                <li>
                  <a className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                    Съвети за поддръжка
                  </a>
                </li>
                <li>
                  <a className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                    Идеи за проекти
                  </a>
                </li>
                <li>
                  <a className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                    Често задавани въпроси
                  </a>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-lg mb-4">Контакти</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>ВАЛЕКС ГРУП - 2 ЕООД</li>
                <li>Телефон: +359894417881</li>
                <li>Email: vgwoodcarving@gmail.com</li>
                <li>Адрес: ул.ВОЙНИШКА №3, Разлог, BG, 2760</li>
              </ul>
            </div>
          </div>
          
          <Separator className="my-8" />
          
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} ВАЛЕКС ГРУП - 2 ЕООД. Всички права запазени.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a className="hover:text-primary transition-colors cursor-pointer">Политика за поверителност</a>
              <a className="hover:text-primary transition-colors cursor-pointer">Общи условия</a>
              <a className="hover:text-primary transition-colors cursor-pointer">Политика за бисквитки</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
