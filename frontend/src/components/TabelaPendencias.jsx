import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Check, 
  X, 
  AlertTriangle, 
  Clock, 
  UserCheck, 
  Building2, 
  ShieldAlert, 
  RefreshCw 
} from 'lucide-react';

export default function TabelaPendencias() {
  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // Estado para controle do modal de dupla confirmação de rejeição
  const [usuarioParaRejeitar, setUsuarioParaRejeitar] = useState(null);
  const [processandoId, setProcessandoId] = useState(null);

  const carregarPendencias = async () => {
    setCarregando(true);
    setErro(null);
    try {
      const response = await api.get('/api/usuarios/pendentes');
      setUsuarios(response.data || []);
    } catch (err) {
      console.error('Erro ao carregar pendências:', err);
      setErro('Não foi possível carregar a lista de credenciamentos pendentes.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarPendencias();
  }, []);

  const handleAprovar = async (usuario) => {
    setProcessandoId(usuario.id);
    try {
      await api.patch(`/api/usuarios/${usuario.id}/status`, { status: 'ATIVO' });
      
      // Critério de conclusão: a linha desaparece da tabela de pendências
      setUsuarios((prev) => prev.filter((u) => u.id !== usuario.id));
      
      setFeedback({
        tipo: 'sucesso',
        mensagem: `Cadastro de ${usuario.nome || usuario.email} aprovado com sucesso! Usuário agora está ATIVO.`,
      });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      console.error('Erro ao aprovar usuário:', err);
      setFeedback({
        tipo: 'erro',
        mensagem: 'Erro ao aprovar credenciamento. Verifique se possui permissão de ADMIN.',
      });
      setTimeout(() => setFeedback(null), 4000);
    } finally {
      setProcessandoId(null);
    }
  };

  const confirmarRejeicao = async () => {
    if (!usuarioParaRejeitar) return;
    
    const usuario = usuarioParaRejeitar;
    setProcessandoId(usuario.id);
    try {
      await api.patch(`/api/usuarios/${usuario.id}/status`, { status: 'REJEITADO' });
      
      // Remove da tabela de pendências
      setUsuarios((prev) => prev.filter((u) => u.id !== usuario.id));
      
      setFeedback({
        tipo: 'info',
        mensagem: `O cadastro de ${usuario.nome || usuario.email} foi rejeitado.`,
      });
      setTimeout(() => setFeedback(null), 4000);
      setUsuarioParaRejeitar(null);
    } catch (err) {
      console.error('Erro ao rejeitar usuário:', err);
      setFeedback({
        tipo: 'erro',
        mensagem: 'Erro ao rejeitar cadastro. Tente novamente.',
      });
      setTimeout(() => setFeedback(null), 4000);
    } finally {
      setProcessandoId(null);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-6 mb-8 text-left">
      {/* Cabeçalho da Seção */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-amber-50 text-amber-600 border border-amber-200">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-base text-fmt-blue">
              Fila de Homologação e Credenciamento (US03)
            </h3>
            <p className="text-xs text-slate-500">
              Solicitações de atletas e academias aguardando análise da diretoria federativa
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
            {usuarios.length} {usuarios.length === 1 ? 'pendência' : 'pendências'}
          </span>
          <button
            onClick={carregarPendencias}
            disabled={carregando}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
            title="Recarregar pendências"
          >
            <RefreshCw className={`w-4 h-4 ${carregando ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Alerta de Feedback (Sucesso/Erro) */}
      {feedback && (
        <div
          className={`p-3.5 mb-4 rounded-lg text-xs font-medium border flex items-center justify-between transition-all ${
            feedback.tipo === 'sucesso'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : feedback.tipo === 'erro'
              ? 'bg-rose-50 text-rose-800 border-rose-200'
              : 'bg-slate-100 text-slate-800 border-slate-300'
          }`}
        >
          <span>{feedback.mensagem}</span>
          <button onClick={() => setFeedback(null)} className="ml-2 font-bold hover:opacity-75">
            ✕
          </button>
        </div>
      )}

      {/* Estado de Carregamento */}
      {carregando && (
        <div className="py-12 text-center text-slate-400 text-sm flex flex-col items-center gap-2">
          <RefreshCw className="w-6 h-6 animate-spin text-fmt-blue" />
          <span>Consultando cadastros pendentes...</span>
        </div>
      )}

      {/* Estado de Erro */}
      {!carregando && erro && (
        <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
          <span>{erro}</span>
          <button
            onClick={carregarPendencias}
            className="underline font-bold hover:text-rose-900"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Estado Vazio (Sem pendências) */}
      {!carregando && !erro && usuarios.length === 0 && (
        <div className="py-10 text-center text-slate-500 text-xs sm:text-sm flex flex-col items-center gap-2">
          <UserCheck className="w-10 h-10 text-emerald-500 mb-1" />
          <span className="font-semibold text-slate-700">Nenhum credenciamento pendente no momento!</span>
          <p className="text-slate-400 text-xs max-w-md">
            Todos os novos cadastros de atletas e academias já foram homologados ou revisados.
          </p>
        </div>
      )}

      {/* Tabela de Pendências */}
      {!carregando && !erro && usuarios.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/75">
                <th className="py-3 px-3">Identificação</th>
                <th className="py-3 px-3">Perfil</th>
                <th className="py-3 px-3">Documento / Local</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {usuarios.map((usuario) => (
                <tr key={usuario.id} className="hover:bg-slate-50/60 transition">
                  {/* Nome e E-mail */}
                  <td className="py-3.5 px-3">
                    <div className="font-bold text-slate-800 text-sm">
                      {usuario.nome || 'Cadastro sem nome'}
                    </div>
                    <div className="text-slate-500 text-xs font-mono">{usuario.email}</div>
                  </td>

                  {/* Perfil */}
                  <td className="py-3.5 px-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${
                        usuario.perfil === 'ATLETA'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : usuario.perfil === 'ACADEMIA'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {usuario.perfil === 'ACADEMIA' ? (
                        <Building2 className="w-3 h-3" />
                      ) : (
                        <UserCheck className="w-3 h-3" />
                      )}
                      {usuario.perfil}
                    </span>
                  </td>

                  {/* Documento / Local */}
                  <td className="py-3.5 px-3 text-slate-600 font-mono">
                    {usuario.documento || '-'}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/80">
                      <Clock className="w-3 h-3 text-amber-500" />
                      Pendente
                    </span>
                  </td>

                  {/* Ações (Aprovar / Rejeitar) */}
                  <td className="py-3.5 px-3 text-right">
                    <div className="inline-flex items-center gap-2 justify-end">
                      {/* Botão Aprovar (Verde com ícone Check) */}
                      <button
                        onClick={() => handleAprovar(usuario)}
                        disabled={processandoId === usuario.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition shadow-sm disabled:opacity-50"
                        title="Aprovar e ativar credenciamento"
                      >
                        <Check className="w-4 h-4 stroke-[2.5]" />
                        <span>Aprovar</span>
                      </button>

                      {/* Botão Rejeitar (Vermelho com ícone X) */}
                      <button
                        onClick={() => setUsuarioParaRejeitar(usuario)}
                        disabled={processandoId === usuario.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-xs transition disabled:opacity-50"
                        title="Rejeitar cadastro"
                      >
                        <X className="w-4 h-4 stroke-[2.5]" />
                        <span>Rejeitar</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de Dupla Confirmação para Rejeição de Cadastro */}
      {usuarioParaRejeitar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-left">
            <div className="flex items-center gap-3 text-rose-600 mb-4">
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h4 className="font-heading font-extrabold text-lg text-slate-900">
                  Confirmar Rejeição
                </h4>
                <p className="text-xs text-slate-500">Ação irreversível de credenciamento</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 mb-2 leading-relaxed">
              Você está prestes a rejeitar o cadastro de:
            </p>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg mb-5">
              <div className="font-bold text-slate-800 text-sm">
                {usuarioParaRejeitar.nome || 'Cadastro sem nome'}
              </div>
              <div className="text-xs text-slate-500 font-mono mt-0.5">
                {usuarioParaRejeitar.email}
              </div>
              <div className="text-[11px] font-semibold text-rose-600 mt-1 uppercase">
                Perfil: {usuarioParaRejeitar.perfil}
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg mb-6 text-xs text-amber-800">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Atenção:</strong> Ao confirmar, o usuário não terá acesso liberado ao sistema federativo e esta solicitação será arquivada como <strong>REJEITADO</strong>.
              </span>
            </div>

            {/* Ações do Modal */}
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setUsuarioParaRejeitar(null)}
                disabled={processandoId === usuarioParaRejeitar.id}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarRejeicao}
                disabled={processandoId === usuarioParaRejeitar.id}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition shadow-sm flex items-center gap-1.5 disabled:opacity-50"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
                <span>Sim, Confirmar Rejeição</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
