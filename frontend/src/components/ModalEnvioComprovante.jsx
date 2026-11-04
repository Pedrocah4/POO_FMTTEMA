import { useState } from 'react';
import { X, Upload, FileText, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

export default function ModalEnvioComprovante({ beneficiario, onClose, onSuccess, onError }) {
  const [arquivo, setArquivo] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [formErro, setFormErro] = useState('');

  if (!beneficiario) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setArquivo(file);
      setFormErro('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!arquivo) {
      setFormErro('Por favor, selecione um arquivo de comprovante (PDF ou Imagem).');
      return;
    }

    try {
      setEnviando(true);
      setFormErro('');

      const formData = new FormData();
      formData.append('arquivo', arquivo);
      if (beneficiario.tipo) {
        formData.append('tipo', beneficiario.tipo);
      }

      const response = await api.post(`/api/financeiro/anuidades/${beneficiario.id}/comprovante`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      onSuccess(response.data.url);
      onClose();
    } catch (err) {
      console.error('Erro ao enviar comprovante:', err);
      const msg = err.response?.data?.mensagem || 'Falha ao enviar arquivo. Verifique o formato e tente novamente.';
      onError(msg);
      setFormErro(msg);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-left border border-slate-200">
        
        {/* Cabeçalho */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-fmt-blue text-[11px] font-bold uppercase tracking-wider mb-1">
              <Upload className="w-3.5 h-3.5" />
              <span>Anexo de Anuidade</span>
            </div>
            <h3 className="font-heading font-extrabold text-lg text-fmt-blue">
              Enviar Comprovante de Pagamento
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={enviando}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Resumo */}
        <div className="my-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-slate-500 font-medium">Beneficiário:</span>
            <span className="font-bold text-slate-900">{beneficiario.nome}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Categoria:</span>
            <span className="font-semibold text-fmt-blue uppercase">{beneficiario.tipo}</span>
          </div>
        </div>

        {formErro && (
          <div className="p-3 mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formErro}</span>
          </div>
        )}

        {/* Formulário de Envio */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Selecione o arquivo do comprovante (PDF, PNG, JPG):
            </label>

            {arquivo ? (
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-blue-50 border border-blue-200">
                <div className="flex items-center gap-2.5 truncate">
                  <FileText className="w-5 h-5 text-fmt-blue shrink-0" />
                  <div className="truncate">
                    <span className="text-xs font-bold text-slate-900 block truncate">{arquivo.name}</span>
                    <span className="text-[11px] text-slate-500">{(arquivo.size / 1024).toFixed(1)} KB</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setArquivo(null)}
                  className="p-1 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 hover:border-fmt-blue rounded-xl bg-slate-50 hover:bg-blue-50/30 transition-all cursor-pointer">
                <Upload className="w-8 h-8 text-slate-400 mb-2" />
                <span className="text-xs font-bold text-slate-700">Clique para selecionar o comprovante</span>
                <span className="text-[11px] text-slate-400 mt-1">Formatos aceitos: PDF, PNG, JPG, JPEG ou WEBP (até 10MB)</span>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <p className="text-[11px] text-slate-500 leading-normal">
            Após o envio, a diretoria da FMTTEMA analisará o comprovante para homologar a regularidade da sua anuidade.
          </p>

          {/* Rodapé */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={enviando}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={enviando || !arquivo}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-lg bg-fmt-blue hover:bg-fmt-blue-hover text-white shadow-sm transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
            >
              {enviando ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              <span>{enviando ? 'Enviando...' : 'Enviar Comprovante'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
