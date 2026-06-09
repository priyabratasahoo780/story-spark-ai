import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Globe, GitPullRequest, Users, Sparkles, Trophy, Zap, ExternalLink, Code2 } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface Contributor {
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
}

export default function ContributorsComponent() {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [loading, setLoading] = useState(true);
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          "https://api.github.com/repos/ronisarkarexe/story-spark-ai/contributors"
        );
        const data: Contributor[] = await res.json();
        const sorted = data
          .filter((c) => c.contributions > 0)
          .sort((a, b) => b.contributions - a.contributions);
        setContributors(sorted);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const top = contributors[0];
  const totalContributions = contributors.reduce((sum, c) => sum + c.contributions, 0);
  const totalPRs = contributors.reduce((acc, c) => acc + c.contributions, 0);

  const maxContributions = contributors.length
    ? Math.max(...contributors.map((c) => c.contributions))
    : 1;

  // Particle background component (simplified for brevity)
  const ParticleField = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      let animId: number;
      const particles: { x: number; y: number; vx: number; vy: number; size: number; opacity: number; hue: number }[] = [];
      const resize = () => {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = canvas.offsetWidth * dpr;
        canvas.height = canvas.offsetHeight * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      };
      resize();
      window.addEventListener("resize", resize);
      for (let i = 0; i < 50; i++) {
        particles.push({
          x: Math.random() * canvas.offsetWidth,
          y: Math.random() * canvas.offsetHeight,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          size: Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.4 + 0.1,
          hue: Math.random() * 60 + 220,
        });
      }
      const draw = () => {
        const w = canvas.offsetWidth;
        const h = canvas.offsetHeight;
        ctx.clearRect(0, 0, w, h);
        particles.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0) p.x = w;
          if (p.x > w) p.x = 0;
          if (p.y < 0) p.y = h;
          if (p.y > h) p.y = 0;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${p.hue}, 80%, 70%, ${p.opacity})`;
          ctx.fill();
        });
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 100) {
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.strokeStyle = `hsla(240, 60%, 70%, ${0.06 * (1 - dist / 100)})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        }
        animId = requestAnimationFrame(draw);
      };
      draw();
      return () => {
        cancelAnimationFrame(animId);
        window.removeEventListener("resize", resize);
      };
    }, []);
    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.5 }} />;
  };

  const AnimatedCounter = ({ value, suffix = "" }: { value: number; suffix?: string }) => {
    const ref = useRef<HTMLSpanElement>(null);
    const hasAnimated = useRef(false);
    useEffect(() => {
      if (!ref.current || hasAnimated.current || value === 0) return;
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const obj = { val: 0 };
          gsap.to(obj, {
            val: value,
            duration: 2,
            ease: "power2.out",
            onUpdate: () => {
              if (ref.current) {
                ref.current.textContent = Math.round(obj.val) + suffix;
              }
            },
          });
          observer.disconnect();
        }
      }, { threshold: 0.3 });
      observer.observe(ref.current);
      return () => observer.disconnect();
    }, [value, suffix]);
    return <span ref={ref}>0{suffix}</span>;
  };

  const ContributorCard = ({ contributor, index }: { contributor: Contributor; index: number }) => {
    const cardRef = useRef<HTMLAnchorElement>(null);
    const glowRef = useRef<HTMLDivElement>(null);
    const barRef = useRef<HTMLDivElement>(null);
    const hasBarAnimated = useRef(false);
    const rankColors = [
      { glow: "rgba(251,191,36,0.3)", badge: "bg-gradient-to-r from-amber-400 to-yellow-500", label: "🏅", borderColor: "rgba(251,191,36,0.4)" },
      { glow: "rgba(148,163,184,0.3)", badge: "bg-gradient-to-r from-slate-300 to-gray-400", label: "🥈", borderColor: "rgba(148,163,184,0.3)" },
      { glow: "rgba(251,146,60,0.25)", badge: "bg-gradient-to-r from-orange-400 to-amber-600", label: "🥉", borderColor: "rgba(251,146,60,0.3)" },
    ];
    const isTop3 = index < 3;
    const rank = isTop3 ? rankColors[index] : null;
    const barWidth = `${Math.min((contributor.contributions / Math.max(maxContributions, 1)) * 100, 100)}%`;

    useEffect(() => {
      if (!barRef.current || hasBarAnimated.current) return;
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting && !hasBarAnimated.current) {
          hasBarAnimated.current = true;
          gsap.to(barRef.current, { width: barWidth, duration: 1.2, ease: "power2.out", delay: 0.3 + index * 0.05 });
          observer.disconnect();
        }
      }, { threshold: 0.2 });
      observer.observe(barRef.current);
      return () => observer.disconnect();
    }, [barWidth, index]);

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
      const card = cardRef.current;
      const glow = glowRef.current;
      if (!card || !glow) return;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;
      gsap.to(card, { rotateX, rotateY, duration: 0.3, ease: "power2.out", transformPerspective: 800 });
      gsap.to(glow, { x: x - 100, y: y - 100, opacity: 0.8, duration: 0.3 });
    }, []);

    const handleMouseLeave = useCallback(() => {
      const card = cardRef.current;
      const glow = glowRef.current;
      if (!card || !glow) return;
      gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.5, ease: "elastic.out(1, 0.5)" });
      gsap.to(glow, { opacity: 0, duration: 0.4 });
    }, []);

    return (
      <a
        ref={cardRef}
        href={contributor.html_url}
        target="_blank"
        rel="noopener noreferrer"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="group relative flex flex-col items-center text-center rounded-3xl p-7 will-change-transform"
        style={{
          background: isTop3
            ? `linear-gradient(135deg, rgba(15,23,42,0.9) 0%, rgba(30,27,75,0.7) 50%, rgba(15,23,42,0.9) 100%)`
            : `linear-gradient(135deg, rgba(15,23,42,0.8) 0%, rgba(20,20,50,0.5) 100%)`,
          border: `1px solid ${isTop3 ? rank!.borderColor : "rgba(148,163,184,0.08)"}`,
          transformStyle: "preserve-3d",
          transition: "box-shadow 0.3s ease",
        }}
      >
        <div ref={glowRef} className="pointer-events-none absolute w-[200px] h-[200px] rounded-full opacity-0" style={{
          background: isTop3 ? `radial-gradient(circle, ${rank!.glow}, transparent 70%)` : "radial-gradient(circle, rgba(99,102,241,0.2), transparent 70%)",
          filter: "blur(25px)",
        }} />
        {isTop3 && (
          <div className={`absolute -top-3 -right-3 ${rank!.badge} text-slate-950 rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg shadow-lg z-10`}>{rank!.label}</div>
        )}
        <div className="relative mb-5" style={{ transform: "translateZ(30px)" }}>
          <div className={`absolute inset-[-4px] rounded-full transition-opacity duration-500 ${isTop3 ? "opacity-40 group-hover:opacity-70" : "opacity-0 group-hover:opacity-30"}`} style={{ background: isTop3 ? rank!.glow : "rgba(99,102,241,0.4)", filter: "blur(12px)" }} />
          <img src={contributor.avatar_url} alt={contributor.login} className="relative h-24 w-24 rounded-full object-cover border-2 border-white/10 transition-all duration-500 group-hover:border-white/30 group-hover:scale-110" />
          <div className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#0c1222]"><div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" /></div>
        </div>
        <h3 className="text-lg font-bold text-white mb-1 transition-colors group-hover:text-indigo-300" style={{ transform: "translateZ(20px)" }}>@{contributor.login}</h3>
        <div className="w-full mt-3 mb-4" style={{ transform: "translateZ(15px)" }}>
          <div className="flex justify-between text-xs text-slate-500 mb-1.5"><span>Contributions</span><span className="text-indigo-400 font-semibold">{contributor.contributions}</span></div>
          <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden"><div ref={barRef} className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500" style={{ width: "0%" }} /></div>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500 group-hover:text-indigo-400 transition-all duration-300" style={{ transform: "translateZ(10px)" }}>
          <ExternalLink size={14} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          <span>View Profile</span>
        </div>
      </a>
    );
  };

  // Main component render
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020617] text-white">
      <ParticleField />
      {/* Ambient Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.15),transparent_50%)]" />
      <div className="absolute top-0 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-indigo-500/10 blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        {/* HERO */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-white/10 bg-white/5 text-blue-300 text-sm backdrop-blur-xl">
            <Sparkles size={14} /> Open Source Contributors
          </div>
          <h1 className="mt-8 text-5xl md:text-7xl font-black tracking-tight">Meet the <span className="block bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">Builders</span></h1>
          <p className="mt-6 text-slate-400 max-w-2xl mx-auto">Every commit shapes the future of StorySpark AI.</p>
        </motion.div>

        {/* TOP CONTRIBUTOR */}
        {top && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="mt-16 flex justify-center">
            <div className="relative w-full max-w-md group">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-yellow-400/10 via-blue-500/10 to-indigo-500/10 blur-2xl opacity-70 group-hover:opacity-100 transition" />
              <div className="relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl p-8 text-center overflow-hidden">
                <Trophy className="mx-auto text-yellow-400 mb-4" />
                <img src={top.avatar_url} className="h-28 w-28 mx-auto rounded-full border-4 border-yellow-400/30 transition-transform group-hover:scale-105" />
                <h2 className="mt-4 text-2xl font-bold">{top.login}</h2>
                <p className="text-slate-400 text-sm">Top Contributor</p>
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-400/10 text-yellow-300 border border-yellow-400/20"><Zap size={14} />{top.contributions} contributions</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* STATS */}
        <div className="grid md:grid-cols-3 gap-6 mt-20">
          {[{ icon: Users, label: "Contributors", value: contributors.length }, { icon: GitPullRequest, label: "Total Contributions", value: totalContributions }, { icon: Globe, label: "Global Reach", value: "Worldwide" }].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} whileHover={{ y: -6 }} className="relative p-7 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden group">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-blue-500/10 to-indigo-500/10" />
              <s.icon className="text-blue-400 mb-3" />
              <p className="text-slate-400 text-sm">{s.label}</p>
              <h3 className="text-3xl font-bold mt-2">{s.value}</h3>
            </motion.div>
          ))}
        </div>

        {/* CONTRIBUTORS GRID */}
        <div className="mt-24 grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading ? Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-72 rounded-2xl bg-white/5 animate-pulse border border-white/10" />
          )) : contributors.map((c, i) => (
            <ContributorCard key={c.login} contributor={c} index={i} />
          ))}
        </div>

        {/* CTA */}
        <div ref={ctaRef} className="mt-24 md:mt-32">
          <div className="cta-container relative rounded-3xl p-10 md:p-14 overflow-hidden text-center" style={{ background: "linear-gradient(135deg, rgba(30,27,75,0.6) 0%, rgba(15,23,42,0.8) 100%", border: "1px solid rgba(129,140,248,0.15)" }}>
            <div className="cta-orb absolute top-6 left-10 w-20 h-20 rounded-full bg-indigo-500/10 blur-2xl" />
            <div className="cta-orb absolute bottom-8 right-14 w-28 h-28 rounded-full bg-purple-500/10 blur-2xl" />
            <div className="cta-orb absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-fuchsia-500/5 blur-3xl" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/5 px-4 py-1.5 text-sm text-indigo-300 mb-6"><Globe size={14} />Join the community</div>
              <h3 className="text-3xl md:text-5xl font-black text-white mb-5">Ready to <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg, #818cf8, #e879f9)" }}>Contribute</span>?</h3>
              <p className="text-slate-400 text-lg max-w-xl mx-auto mb-10 leading-relaxed">Fork the repo, pick an issue, and make your first PR. Every line of code makes a difference.</p>
              <a href="https://github.com/ronisarkarexe/story-spark-ai" target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-white text-lg transition-all duration-300 hover:scale-105" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7)", boxShadow: "0 8px 32px rgba(99,102,241,0.3)" }}>
                <Code2 size={20} className="transition-transform duration-300 group-hover:rotate-12" />Start Contributing<ExternalLink size={16} className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
