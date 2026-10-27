import { useState } from 'react';
import { X, CheckCircle, Upload, Link as LinkIcon, DollarSign, FileText, AlertCircle, RefreshCw } from 'lucide-react';
import api from '../services/api';

export default function ModalBaixaAnuidade({ beneficiario, onClose, onSuccess, onError }) {
  const [comprovante, setComprovante] = useState('');
  const [valor, setValor] = useState(beneficiario?.tipo === 'ACADEMIA' ? 300.0 : 150.0);
  const [observacoes, setObservacoes] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [formErro, setFormErro] = useState('');

  if (!beneficiario) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Cria um link local ou usa o nome do arquivo com timestamp para simulação realista
      const nomeSimulado = `comprovantes/${beneficiario.tipo.toLowerCase()}_${beneficiario.id}_${Date.now()}_${file.name}`;
      setComprovante(nomeSimulado);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comprovante || comprovante.trim() === '') {
      setFormErro('O link ou anexo do comprovante de pagamento é obrigatório.');
      return;
    }

    try {
      setSalvando(true);
      setFormErro('');

      const response = await api.patch(`/api/financeiro/anuidades/${beneficiario.id}/pagar`, {
        comprovante: comprovante.trim(),
        valor: Number(valor),
        tipoBeneficiario: beneficiario.tipo,
        observacoes: observacoes ? observacoes.trim() : null
      });

      onSuccess(response.data);
      onClose();
    } catch (err) {
      console.error('Erro ao dar baixa manual:', err);
      const msg = err.response?.data?.mensagem || 'Erro de conexão com a API ao tentar dar baixa na anuidade.';
      onError(msg);
      setFormErro(msg);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 sm:p-7 text-left border border-slate-200">
        
        {/* Cabeçalho */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold uppercase tracking-wider mb-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Baixa Manual de Anuidade</span>
            </div>
            <h3 className="font-heading font-extrabold text-xl text-fmt-blue">
              Confirmar Pagamento
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={salvando}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Resumo do Beneficiário */}
        <div className="my-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200/90 text-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-slate-500 font-medium">Beneficiário:</span>
            <span className="font-bold text-slate-900">{beneficiario.nome}</span>
          </div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-slate-500 font-medium">Categoria / Tipo:</span>
            <span className="font-semibold text-fmt-blue uppercase">{beneficiario.tipo}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Documento / Vínculo:</span>
            <span className="font-mono text-slate-700">{beneficiario.documento || beneficiario.academiaNome || '-'}</span>
          </div>
        </div>

        {formErro && (
          <div className="p-3 mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formErro}</span>
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Valor */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Valor da Anuidade (R$):
            </label>
            <div className="relative">
              <DollarSign className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm font-semibold rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-fmt-blue"
              />
            </div>
          </div>

          {/* Comprovante */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Link ou Caminho do Comprovante de Pagamento: <span className="text-red-500">*</span>
            </label>
            <div className="relative mb-2">
              <LinkIcon className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                required
                placeholder="Ex: https://drive.google.com/file/... ou código PIX / recibo"
                value={comprovante}
                onChange={(e) => setComprovante(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-fmt-blue"
              />
            </div>

            {/* Alternativa de selecionar arquivo local */}
            <div className="flex items-center gap-2">
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-slate-300 hover:border-fmt-blue bg-white text-slate-600 hover:text-fmt-blue text-xs font-medium cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span>Anexar Arquivo Local</span>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <span className="text-[11px] text-slate-400">PDF, PNG ou JPEG</span>
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Observações Administrativas (opcional):
            </label>
            <textarea
              rows="2"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Ex: Comprovante validado no extrato do Banco do Brasil..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-fmt-blue"
            />
          </div>

          {/* Rodapé com Ações */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={salvando}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
            >
              {salvando ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle className="w-3.5 h-3.5" />
              )}
              <span>Confirmar Baixa</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
