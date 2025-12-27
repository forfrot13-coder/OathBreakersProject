export default function Footer() {
  return (
    <footer className="footer bg-secondary/30 border-t border-primary/20 mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-right">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <span className="text-2xl">⚔️</span>
              <span className="font-bold text-lg">OathBreakers</span>
            </div>
            <p className="text-sm text-muted">
              بازی کارت معاملاتی آنلاین
            </p>
          </div>

          <div className="flex items-center gap-6 text-sm text-muted">
            <a href="#" className="hover:text-primary transition-colors">
              قوانین
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              راهنما
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              تماس با ما
            </a>
          </div>

          <div className="text-sm text-muted">
            © 2024 OathBreakers. تمامی حقوق محفوظ است.
          </div>
        </div>
      </div>
    </footer>
  );
}
