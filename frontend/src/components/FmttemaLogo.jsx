import logoImg from '../assets/fmttema-logo.jpg';

export default function FmttemaLogo({ size = 'md', showText = true, light = false }) {
  const sizeClasses = {
    sm: 'w-9 h-9',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  return (
    <div className="flex items-center gap-3">
      {/* Imagem Oficial do Escudo da FMTTEMA */}
      <img
        src={logoImg}
        alt="Escudo Oficial FMTTEMA"
        className={`${sizeClasses[size] || 'w-12 h-12'} rounded-full object-cover shrink-0 drop-shadow-sm select-none`}
      />

      {showText && (
        <div className="flex flex-col text-left">
          <span className={`font-heading font-extrabold tracking-tight leading-none text-base sm:text-lg ${light ? 'text-white' : 'text-fmt-blue'}`}>
            FMTTEMA
          </span>
          <span className={`text-[10px] sm:text-[11px] font-medium tracking-wider uppercase mt-1 leading-tight ${light ? 'text-slate-200' : 'text-slate-600'}`}>
            Federação de Muaythai Tradicional - MA
          </span>
        </div>
      )}
    </div>
  );
}
