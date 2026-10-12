import Navbar from './Navbar';

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-fmt-light text-fmt-dark flex flex-col font-sans antialiased">
      {/* Barra de Navegação Institucional */}
      <Navbar />

      {/* Conteúdo Central */}
      <div className="flex-1 w-full">
        {children}
      </div>

      {/* Rodapé Institucional Oficial */}
      <footer className="bg-white border-t border-slate-200 mt-16 py-8 text-slate-600 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <p className="font-heading font-bold text-fmt-blue text-sm">
              Federação de Muaythai Tradicional do Estado do Maranhão - FMTTEMA
            </p>
            <p className="text-slate-500 mt-1">
              CNPJ: 25.194.198/0001-** &bull; Fundada em 17/06/2016 &bull; São Luís - MA
            </p>
          </div>
          <div className="text-slate-500 text-[11px]">
            Sistema Oficial de Gestão Esportiva &bull; POO / UNDB 2026
          </div>
        </div>
      </footer>
    </div>
  );
}
