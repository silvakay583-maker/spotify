'use client';

import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  HelpCircle,
  Mail,
  MessageSquare,
  Send,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function SuportePage() {
  const [ticketSent, setTicketSent] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    protocol: '',
    category: 'earnings',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTicketSent(true);
  };

  return (
    <div className="min-h-screen bg-[#f3f6fb] text-slate-800 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Banner */}
      <aside className="bg-gradient-to-r from-indigo-600 via-blue-600 to-emerald-600 text-white text-xs py-2 px-4 shadow-sm text-center">
        <div className="max-w-5xl mx-auto flex items-center justify-center gap-2 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
          <span>Central Oficial de Atendimento e Suporte ao Avaliador • Next Offer Spot</span>
        </div>
      </aside>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-md shadow-indigo-600/25">
              NOS
            </div>
            <div>
              <span className="font-black text-slate-900 text-base block leading-none">Next Offer Spot</span>
              <span className="text-[10px] text-slate-500 font-medium">Central de Atendimento</span>
            </div>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Voltar para o Início</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* Hero Title */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-3">
            <HelpCircle size={14} />
            <span>Suporte ao Usuário</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-3">
            Como podemos te ajudar hoje?
          </h1>
          <p className="text-slate-600 text-sm sm:text-base">
            Tire dúvidas sobre seu saldo reservado, protocolo de caso, validação de cadastro ou funcionamento das campanhas.
          </p>
        </div>

        {/* Quick Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Mail size={20} />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">E-mail de Atendimento</h3>
            <p className="text-xs text-slate-500 mb-3 leading-relaxed">
              Para solicitações formais e dúvidas financeiras sobre campanhas.
            </p>
            <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
              suporte@nextofferspot.com
            </span>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <Clock size={20} />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">Tempo de Resposta</h3>
            <p className="text-xs text-slate-500 mb-3 leading-relaxed">
              Nossa equipe responde a tickets e solicitações por ordem de chegada.
            </p>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
              Até 24 horas úteis
            </span>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <ShieldCheck size={20} />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">Validação de Protocolo</h3>
            <p className="text-xs text-slate-500 mb-3 leading-relaxed">
              Tenha em mãos seu número de caso (gerado no início do chat da campanha).
            </p>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">
              Protocolo Obrigatório
            </span>
          </div>
        </div>

        {/* Contact Form & FAQ Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Ticket Form */}
          <div className="lg:col-span-3 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs">
            <h2 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
              <MessageSquare size={20} className="text-indigo-600" />
              <span>Abrir Chamado de Atendimento</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mb-6">
              Preencha o formulário abaixo para enviar sua solicitação diretamente aos analistas da plataforma.
            </p>

            {ticketSent ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center animate-fade-in">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 size={24} />
                </div>
                <h3 className="font-bold text-emerald-900 text-lg mb-1">Chamado Registrado com Sucesso!</h3>
                <p className="text-xs sm:text-sm text-emerald-700 max-w-md mx-auto mb-4">
                  Recebemos sua mensagem. Uma cópia de confirmação e as orientações serão enviadas para o e-mail informado em breve.
                </p>
                <button
                  type="button"
                  onClick={() => setTicketSent(false)}
                  className="text-xs font-bold text-emerald-800 hover:underline"
                >
                  Enviar outro chamado
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Seu Nome Completo *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Carlos Eduardo"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-600 focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Seu E-mail *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="seuemail@exemplo.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-600 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Número do Protocolo (Caso)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 870793 (se possuir)"
                      value={formData.protocol}
                      onChange={(e) => setFormData({ ...formData, protocol: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-600 focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Assunto Principal *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-600 focus:bg-white transition-all"
                    >
                      <option value="earnings">Liberação de Saldo / Saque</option>
                      <option value="registration">Dúvidas sobre Cadastro Oficial</option>
                      <option value="campaign">Informações sobre o Programa Spotify</option>
                      <option value="technical">Problemas Técnicos no Chat / Áudio</option>
                      <option value="other">Outros Assuntos</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Descrição Detalhada *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Descreva com detalhes o que aconteceu ou qual é a sua dúvida..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-sm text-slate-900 outline-none focus:border-indigo-600 focus:bg-white transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm py-3 px-6 rounded-xl transition-all shadow-md shadow-indigo-600/20"
                >
                  <Send size={16} />
                  <span>Enviar Chamado de Suporte</span>
                </button>
              </form>
            )}
          </div>

          {/* Quick FAQ / Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
              <h3 className="font-bold text-slate-900 text-sm mb-3">Dúvidas Mais Rápidas</h3>

              <div className="space-y-3 text-xs text-slate-600">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <strong className="block text-slate-900 font-bold mb-1">Onde vejo meu saldo reservado?</strong>
                  <span>O saldo é computado e exibido em tempo real no topo do funil de avaliação e consolidado no recibo oficial de pagamento assinado pelo CFO.</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <strong className="block text-slate-900 font-bold mb-1">Por que é necessário o cadastro oficial?</strong>
                  <span>Como medida de segurança e conformidade da marca, o cadastro confirma a identidade do avaliador para liberação dos pagamentos diários e prevenção de fraudes.</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <strong className="block text-slate-900 font-bold mb-1">Como acesso a campanha do Spotify?</strong>
                  <span>Acesse diretamente pela rota oficial <code>/spotify</code> ou inicie a sessão prática de avaliação em <code>/spotify/rewards</code>.</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-5 border border-indigo-100 text-xs text-indigo-950">
              <strong className="font-bold block mb-1">Proteção e Privacidade</strong>
              <p className="text-indigo-800 leading-relaxed">
                Todas as mensagens e dados encaminhados ao suporte são tratados sob rígidos padrões de confidencialidade e criptografia SSL.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 bg-white border-t border-slate-200 text-xs text-slate-500 text-center">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>&copy; {new Date().getFullYear()} Next Offer Spot LLC. Todos os direitos reservados.</span>
          <div className="flex items-center gap-4 text-slate-600 font-medium">
            <Link href="/" className="hover:text-indigo-600">Página Inicial</Link>
            <span>•</span>
            <Link href="/politicasdeprivacidade" className="hover:text-indigo-600">Políticas de Privacidade</Link>
            <span>•</span>
            <Link href="/spotify" className="hover:text-indigo-600">Oferta Spotify</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
