import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Database,
  Eye,
  FileText,
  Lock,
  Mail,
  Scale,
  Shield,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import Link from 'next/link';

export default function PoliticasDePrivacidadePage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Banner */}
      <aside className="bg-slate-900 text-slate-300 text-xs py-2 px-4 text-center">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-2">
          <Shield size={13} className="text-emerald-400" />
          <span>Diretrizes Oficiais de Privacidade e Proteção de Dados • Next Offer Spot Network</span>
        </div>
      </aside>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-md shadow-indigo-600/25">
              NOS
            </div>
            <div>
              <span className="font-black text-slate-900 text-base block leading-none">Next Offer Spot</span>
              <span className="text-[10px] text-slate-500 font-medium">Políticas de Privacidade</span>
            </div>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Voltar ao Início</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* Document Header */}
        <div className="bg-white rounded-2xl p-6 sm:p-10 border border-slate-200 shadow-xs mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider mb-4">
            <FileText size={14} className="text-slate-600" />
            <span>Documento Legal Oficial</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-3">
            Políticas de Privacidade e Tratamento de Dados
          </h1>

          <p className="text-xs text-slate-500 mb-6 font-medium">
            Última atualização: {new Date().toLocaleDateString('pt-BR', { month: 'long', day: 'numeric', year: 'numeric' })} • Versão 3.2
          </p>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            A <strong>Next Offer Spot LLC</strong> valoriza a segurança, privacidade e transparência na gestão dos dados de todos os usuários, avaliadores e visitantes de nossa plataforma central e dos portais de parceiros afiliados (incluindo o programa de avaliação musical <em>Spotify Rewards</em>). Este documento detalha como coletamos, processamos, armazenamos e protegemos suas informações pessoais.
          </p>
        </div>

        {/* Policy Sections */}
        <div className="space-y-6">
          {/* Section 1 */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Database size={20} className="text-indigo-600" />
              <span>1. Informações que Coletamos</span>
            </h2>
            <div className="text-slate-600 text-xs sm:text-sm leading-relaxed space-y-2">
              <p>Podemos coletar e processar os seguintes tipos de informações:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
                <li>
                  <strong>Dados de Identificação e Cadastro:</strong> Nome completo, endereço de e-mail e identificadores fornecidos voluntariamente durante a sessão de avaliação ou envio de tickets de suporte.
                </li>
                <li>
                  <strong>Dados Técnicos de Navegação:</strong> Endereço IP, tipo de navegador, sistema operacional, parâmetros de rastreamento de campanhas de publicidade (como <em>fbclid</em>, identificadores de anúncios) e dados de cliques para fins de atribuição de comissão e segurança antifraude.
                </li>
                <li>
                  <strong>Respostas e Feedbacks de Avaliação:</strong> Preferências musicais, notas e respostas fornecidas nos módulos de teste de faixas sonoras das gravadoras parceiras.
                </li>
              </ul>
            </div>
          </div>

          {/* Section 2 */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Eye size={20} className="text-indigo-600" />
              <span>2. Finalidade do Tratamento de Dados</span>
            </h2>
            <div className="text-slate-600 text-xs sm:text-sm leading-relaxed space-y-2">
              <p>Os dados coletados são utilizados estritamente para:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
                <li>Permitir a navegação no catálogo central e no funil interativo de atendimento;</li>
                <li>Vincular e reservar comissões e recibos emitidos ao respectivo protocolo de atendimento do usuário;</li>
                <li>Prevenir fraudes, bots automatizados, acessos duplicados e garantir a conformidade com as diretrizes das gravadoras parceiras;</li>
                <li>Atender solicitações e dúvidas abertas através da nossa central de suporte.</li>
              </ul>
            </div>
          </div>

          {/* Section 3 */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Lock size={20} className="text-indigo-600" />
              <span>3. Segurança e Criptografia das Informações</span>
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-3">
              Implementamos medidas rigorosas de segurança técnica e organizacional, incluindo criptografia SSL de 256 bits, firewalls e controle estrito de acesso para proteger seus dados contra perda, acesso não autorizado, divulgação ou destruição.
            </p>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Não vendemos, não alugamos e não comercializamos dados pessoais com terceiros para fins de spam ou marketing não solicitado.
            </p>
          </div>

          {/* Section 4 */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Scale size={20} className="text-indigo-600" />
              <span>4. Direitos do Titular dos Dados (LGPD e GDPR)</span>
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-3">
              Em consonância com a Lei Geral de Proteção de Dados (LGPD - Brasil) e com o Regulamento Geral de Proteção de Dados (GDPR), você tem direito a:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-slate-700">
              <li>Confirmar a existência de tratamento e acessar seus dados cadastrados;</li>
              <li>Solicitar a correção de dados incompletos ou inexatos;</li>
              <li>Requerer a eliminação ou anonimização de dados desnecessários;</li>
              <li>Revogar o consentimento previamente fornecido.</li>
            </ul>
          </div>

          {/* Section 5 */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Mail size={20} className="text-indigo-600" />
              <span>5. Canal de Contato com o Encarregado de Dados (DPO)</span>
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-3">
              Caso você tenha qualquer dúvida sobre esta Política de Privacidade, ou deseje exercer seus direitos de titular de dados, entre em contato com nosso departamento responsável:
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-700 space-y-1">
              <p><strong>Encarregado de Dados (DPO):</strong> Compliance &amp; Privacy Office</p>
              <p><strong>E-mail:</strong> privacidade@nextofferspot.com</p>
              <p><strong>Canal Geral:</strong> <Link href="/suporte" className="text-indigo-600 underline font-semibold">Página de Suporte ao Usuário</Link></p>
              <p><strong>Entidade Operadora:</strong> Next Offer Spot LLC</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 bg-white border-t border-slate-200 text-xs text-slate-500 text-center">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>&copy; {new Date().getFullYear()} Next Offer Spot LLC. Todos os direitos reservados.</span>
          <div className="flex items-center gap-4 text-slate-600 font-medium">
            <Link href="/" className="hover:text-indigo-600">Página Inicial</Link>
            <span>•</span>
            <Link href="/suporte" className="hover:text-indigo-600">Suporte</Link>
            <span>•</span>
            <Link href="/spotify" className="hover:text-indigo-600">Programa Spotify</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
