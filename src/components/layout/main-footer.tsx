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
              Премиум дървени продукти за всички ваши строителни и дърводелски нужди.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium text-lg mb-4">Бързи връзки</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/catalog" className="text-muted-foreground hover:text-primary transition-colors">
                  Каталог продукти
                </Link>
              </li>
              <li>
                <Link to="/quote" className="text-muted-foreground hover:text-primary transition-colors">
                  Текуща оферта
                </Link>
              </li>
              <li>
                <Link to="/quotes" className="text-muted-foreground hover:text-primary transition-colors">
                  История на оферти
                </Link>
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
        
        <div className="border-t border-border mt-8 pt-6 text-center text-sm text-muted-foreground">
          <p>© {currentYear} ВАЛЕКС ГРУП - 2 ЕООД. Всички права запазени.</p>
        </div>
      </div>
    </footer>
  );
}
