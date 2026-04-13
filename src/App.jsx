import { useState, useRef, useEffect, useCallback } from "react";
import { cloudSave, cloudLoad, cloudList } from "./firebase.js";

const YEAR = new Date().getFullYear();

const TEMPLATES = [
  { id: "mae", label: "Mãe", emoji: "👩", bg: "#fdf2f8", border: "#f0abcb", desc: "As histórias e memórias da sua mãe" },
  { id: "pai", label: "Pai", emoji: "👨", bg: "#eff6ff", border: "#93c5fd", desc: "As histórias e memórias do seu pai" },
  { id: "avos", label: "Avós", emoji: "👴👵", bg: "#f0fdf4", border: "#86efac", desc: "A sabedoria e história dos seus avós" },
  { id: "filhos", label: "Filhos", emoji: "🧒", bg: "#fffbeb", border: "#fcd34d", desc: "O mundo pelos olhos da criança" },
  { id: "eu", label: "Você mesmo", emoji: "💌", bg: "#faf5ff", border: "#c4b5fd", desc: "Uma carta para o seu eu do futuro" },
];

const CHAPTERS = {
  mae: [
    { id: "infancia", title: "Infância e Crescimento", emoji: "🌱", questions: ["Onde você nasceu e como era crescer lá?","Qual é a sua memória mais antiga?","O que você mais gostava de fazer quando criança?","Com quem você era mais próxima na família quando pequena?","Como era a escola para você?"] },
    { id: "juventude", title: "Juventude e Momentos Marcantes", emoji: "✨", questions: ["Quais eram seus sonhos e ambições quando jovem?","Qual foi o seu primeiro emprego e o que achou dele?","Qual momento da sua juventude você jamais esquecerá?","Onde você morava e como era um dia típico?","Quem eram as pessoas mais importantes na sua vida nessa época?"] },
    { id: "amor", title: "Amor, Família e Amizades", emoji: "❤️", questions: ["Como você conheceu o amor da sua vida? O que você sentiu na primeira vez que o viu?","Houve um momento na sua vida em que o amor te surpreendeu — de um jeito que você não esperava?","Qual foi a coisa mais difícil que você já fez por amor?","Tem alguém que você perdeu — por distância, desentendimento ou pela vida — que ainda ocupa um lugar no seu coração?","O que você aprendeu sobre amor que só a vida, com o tempo, pode ensinar?","Como você quer que seus filhos e as pessoas que você ama se lembrem de você?"] },
    { id: "hoje", title: "A Vida Hoje", emoji: "🌍", questions: ["Como seria um dia perfeito para você hoje?","Do que você mais se orgulha na sua vida?","O que você ainda quer fazer ou viver?","O que mais mudou em você ao longo dos anos?","O que te traz mais alegria agora?"] },
    { id: "futuro", title: "Palavras para o Futuro", emoji: "💌", questions: ["Qual é a coisa mais importante que você aprendeu na vida até agora?","Tem algum sonho que você ainda quer realizar?","Como você imagina que o mundo vai estar daqui a 10 anos?","Como você acha que a sua própria vida vai estar daqui a 10 anos?","Se pudesse dar um conselho para sua versão mais jovem, qual seria?","Tem algo que você sempre quis dizer para a sua família?"] },
  ],
  pai: [
    { id: "infancia", title: "Infância e Crescimento", emoji: "🌱", questions: ["Onde você nasceu e como era a sua cidade ou bairro?","Qual é a memória mais antiga que você tem?","O que você mais gostava de fazer quando criança?","Como era a sua relação com seu pai e sua mãe?","Como foi a escola — teve algum professor que te marcou?"] },
    { id: "juventude", title: "Juventude e Escolhas", emoji: "✨", questions: ["O que você queria ser quando crescesse?","Como foi seu primeiro trabalho?","Qual decisão da sua juventude mais mudou o rumo da sua vida?","Quais eram seus hobbies e paixões quando jovem?","Quem foram as pessoas que mais te influenciaram nessa época?"] },
    { id: "amor", title: "Amor, Família e Amizades", emoji: "❤️", questions: ["Como você conheceu a mãe dos seus filhos?","O que significa para você ser pai?","Qual foi o momento mais marcante que você viveu com sua família?","Tem alguma amizade que durou a vida inteira?","O que você aprendeu sobre amor ao longo dos anos?"] },
    { id: "hoje", title: "A Vida Hoje", emoji: "🌍", questions: ["Como é a sua rotina hoje e o que você mais valoriza nela?","Do que você mais se orgulha na sua trajetória?","Tem algo que você ainda quer fazer ou conquistar?","Como você vê o mundo hoje comparado a quando era jovem?","O que te dá mais energia e alegria atualmente?"] },
    { id: "futuro", title: "Palavras para o Futuro", emoji: "💌", questions: ["Qual é a lição mais valiosa que a vida te ensinou?","Tem um sonho que ainda não realizou e não quer abandonar?","Como você imagina o mundo daqui a 10 anos?","O que você espera para a sua própria vida nos próximos anos?","O que você gostaria de dizer para seus filhos que talvez nunca tenha dito?"] },
  ],
  avos: [
    { id: "origem", title: "Origens e Raízes", emoji: "🌳", questions: ["De onde vem a sua família?","Como era a vida quando você era criança?","Quais tradições da sua família você guarda até hoje?","Qual é a história mais antiga que você conhece da sua família?","Tem algum lugar da sua infância que você nunca esqueceu?"] },
    { id: "vida", title: "Uma Vida Vivida", emoji: "✨", questions: ["Qual foi o período mais feliz da sua vida?","Qual foi o momento mais difícil que você enfrentou e como superou?","O que o trabalho significou para você ao longo da vida?","Qual conquista te enche mais de orgulho?","Se pudesse voltar e mudar alguma coisa, o que seria?"] },
    { id: "amor", title: "Amor e Família", emoji: "❤️", questions: ["Como foi a história do seu grande amor?","O que significa para você ver seus filhos e netos crescerem?","Qual memória com sua família é a mais preciosa para você?","O que você aprendeu sobre relacionamentos que só o tempo pode ensinar?","Como você quer ser lembrado pelos seus netos?"] },
    { id: "sabedoria", title: "Sabedoria e Conselhos", emoji: "🌿", questions: ["Qual é o conselho mais importante que você daria para um jovem hoje?","O que o mundo perdeu que antes tinha e era valioso?","Qual é a sua filosofia de vida?","O que você ainda quer viver ou experienciar?","Que mensagem você deixaria para as próximas gerações?"] },
  ],
  filhos: [
    { id: "quem", title: "Quem sou eu", emoji: "🌟", questions: ["Qual é o seu nome completo e quantos anos você tem?","Qual é a sua cor favorita e por quê?","O que você mais gosta de fazer nas horas livres?","Qual é a sua comida favorita?","Se você fosse um animal, qual seria?"] },
    { id: "escola", title: "Escola e Amigos", emoji: "📚", questions: ["Qual é a sua matéria favorita na escola?","Quem é o seu melhor amigo ou melhor amiga?","O que você mais gosta de fazer na hora do recreio?","Tem alguma coisa na escola que você não gosta?","O que você quer aprender que ainda não aprendeu?"] },
    { id: "sonhos", title: "Sonhos e Imaginação", emoji: "🌈", questions: ["O que você quer ser quando crescer?","Se você pudesse ter um superpoder, qual seria?","Qual é o lugar mais legal que você já foi ou quer ir?","Se você pudesse mudar uma coisa no mundo, o que mudaria?","Qual é a coisa mais importante para você na vida?"] },
    { id: "familia", title: "Família e Amor", emoji: "❤️", questions: ["O que você mais gosta de fazer com a sua família?","Qual é a memória favorita que você tem com sua mãe ou pai?","O que significa família para você?","Tem alguém na sua família que você admira muito? Por quê?","O que você quer falar para as pessoas que você ama?"] },
  ],
  eu: [
    { id: "agora", title: "Quem sou eu agora", emoji: "🪞", questions: ["Como você se descreveria hoje?","O que está ocupando mais sua cabeça e seu coração agora?","Quais são as suas maiores alegrias e os seus maiores medos hoje?","Como está a sua saúde física e emocional?","O que você mais valoriza na sua vida atual?"] },
    { id: "sonhos", title: "Sonhos e Objetivos", emoji: "🎯", questions: ["Quais são os seus três maiores sonhos ou objetivos para os próximos anos?","Tem algo que você sempre quis fazer mas ainda não teve coragem?","Como você imagina a sua vida daqui a 10 anos?","Que tipo de pessoa você quer se tornar?","O que você está fazendo hoje para chegar onde quer estar?"] },
    { id: "mundo", title: "O Mundo ao seu Redor", emoji: "🌍", questions: ["Como você vê o mundo hoje?","Qual é a causa ou valor que mais importa para você?","Como você acha que o mundo vai estar em 10 anos?","Qual tecnologia ou ideia você acha que vai mudar tudo?","O que você espera para a humanidade no futuro?"] },
    { id: "carta", title: "Carta para o Futuro", emoji: "💌", questions: ["O que você quer dizer para a versão de você que vai ler essa carta?","O que você espera que tenha acontecido na sua vida quando reler isso?","Qual é o maior conselho que o seu eu de hoje daria para o seu eu do futuro?","O que você não quer ter perdido ou abandonado ao longo do caminho?","Termine com uma frase que represente quem você é agora."] },
  ],
};

const LAYOUTS = [
  { id: "warm", label: "🌸 Quente e Aconchegante", coverBg: "#f5e6d3", coverAccent: "#c8826a", coverText: "#3d1f0f", bodyBg: "#fffaf6", bodyText: "#3d2b1f", accentColor: "#c8826a", borderColor: "#e8c9b5", chapterBg: "#fdf0e8", font: "Georgia, serif", divider: "#e8c9b5" },
  { id: "elegant", label: "🖤 Elegante e Minimalista", coverBg: "#1a1a1a", coverAccent: "#c9a84c", coverText: "#f5f0e8", bodyBg: "#ffffff", bodyText: "#1a1a1a", accentColor: "#c9a84c", borderColor: "#e0e0e0", chapterBg: "#f9f9f9", font: "Palatino, serif", divider: "#c9a84c" },
  { id: "colorful", label: "🌈 Colorido e Alegre", coverBg: "#4f46e5", coverAccent: "#f59e0b", coverText: "#ffffff", bodyBg: "#fafafa", bodyText: "#1e1b4b", accentColor: "#4f46e5", borderColor: "#c7d2fe", chapterBg: "#eef2ff", font: "Trebuchet MS, sans-serif", divider: "#818cf8" },
];

function slugify(s) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
function makeKey(tId, name, yr) { return `memorias:${tId}:${slugify(name)}:${yr}`; }

function VoiceButton({ onTranscript }) {
  const [listening, setListening] = useState(false);
  const recRef = useRef(null);
  const toggle = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) { alert("Use o Chrome para gravar voz."); return; }
    if (listening) { recRef.current?.stop(); setListening(false); return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR(); rec.continuous = true; rec.interimResults = false; rec.lang = "pt-BR";
    rec.onresult = (e) => onTranscript(Array.from(e.results).map(r => r[0].transcript).join(" "));
    rec.onerror = () => setListening(false); rec.onend = () => setListening(false);
    rec.start(); recRef.current = rec; setListening(true);
  };
  return (
    <button onClick={toggle} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 20, background: listening ? "#fce7f3" : "#f3f0ff", border: `1.5px solid ${listening ? "#ec4899" : "#a78bfa"}`, color: listening ? "#be185d" : "#6d28d9", cursor: "pointer", fontSize: 13, fontWeight: 500 }}>
      {listening ? "⏹ Parar" : "🎙 Gravar voz"}
    </button>
  );
}

function PhotoAttach({ photos, onChange }) {
  const ref = useRef();
  const add = (e) => Array.from(e.target.files).forEach(f => { const r = new FileReader(); r.onload = ev => onChange([...photos, { src: ev.target.result, name: f.name }]); r.readAsDataURL(f); });
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: photos.length ? 8 : 0 }}>
        {photos.map((p, i) => (
          <div key={i} style={{ position: "relative" }}>
            <img src={p.src} alt="" style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 10, border: "1.5px solid #e9d5ff" }} />
            <button onClick={() => onChange(photos.filter((_, j) => j !== i))} style={{ position: "absolute", top: -6, right: -6, width: 20, height: 20, borderRadius: "50%", background: "#f43f5e", border: "none", color: "#fff", fontSize: 11, cursor: "pointer" }}>✕</button>
          </div>
        ))}
      </div>
      <button onClick={() => ref.current.click()} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 20, background: "#f0fdf4", border: "1.5px solid #86efac", color: "#15803d", cursor: "pointer", fontSize: 13, fontWeight: 500 }}>
        📷 Adicionar foto
      </button>
      <input ref={ref} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={add} />
    </div>
  );
}

function PrintPreview({ answers, subject, templateId, year, layout, onClose }) {
  const chapters = CHAPTERS[templateId] || [];
  const tpl = TEMPLATES.find(t => t.id === templateId);
  const L = layout;
  const isEu = templateId === "eu";
  return (
    <div style={{ padding: "16px 0" }}>
      <style>{`@media print { body * { visibility: hidden !important; } #print-area, #print-area * { visibility: visible !important; } #print-area { position: absolute; left: 0; top: 0; width: 100%; } .no-print { display: none !important; } }`}</style>
      <div className="no-print" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, gap: 10 }}>
        <button onClick={onClose} style={{ padding: "8px 18px", borderRadius: 20, background: "#f3f0ff", border: "1.5px solid #a78bfa", color: "#6d28d9", cursor: "pointer", fontWeight: 500, fontSize: 14 }}>← Voltar</button>
        <button onClick={() => window.print()} style={{ padding: "8px 24px", borderRadius: 20, background: "#7c3aed", border: "none", color: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 14 }}>🖨 Imprimir / PDF</button>
      </div>
      <div id="print-area" style={{ fontFamily: L.font, background: L.bodyBg, borderRadius: 16, overflow: "hidden", border: `1px solid ${L.borderColor}` }}>
        <div style={{ background: L.coverBg, padding: "60px 40px", textAlign: "center", minHeight: 260, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 60, height: 4, background: L.coverAccent, borderRadius: 2, marginBottom: 28 }} />
          <p style={{ fontSize: 12, letterSpacing: 4, textTransform: "uppercase", color: L.coverAccent, margin: "0 0 14px", fontWeight: 600 }}>{isEu ? "Carta para o Futuro" : tpl?.label}</p>
          <h1 style={{ fontSize: 34, fontWeight: 700, color: L.coverText, margin: "0 0 14px", lineHeight: 1.2 }}>{isEu ? "Para o meu eu do futuro" : `A História de ${subject}`}</h1>
          <div style={{ width: 40, height: 2, background: L.coverAccent, borderRadius: 2, margin: "14px 0" }} />
          <p style={{ fontSize: 15, color: L.coverAccent, margin: 0, letterSpacing: 2 }}>{year}</p>
        </div>
        <div style={{ padding: "40px 40px 60px" }}>
          {chapters.map((ch, ci) => {
            const hasContent = ch.questions.some((_, qi) => answers[ch.id]?.[qi]?.text || answers[ch.id]?.[qi]?.photos?.length);
            if (!hasContent) return null;
            return (
              <div key={ch.id} style={{ marginBottom: 44 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22, paddingBottom: 10, borderBottom: `2px solid ${L.divider}` }}>
                  <div style={{ width: 34, height: 34, borderRadius: "50%", background: L.chapterBg, border: `1.5px solid ${L.borderColor}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>{ch.emoji}</div>
                  <h2 style={{ fontSize: 19, fontWeight: 700, color: L.accentColor, margin: 0 }}>{ch.title}</h2>
                  <span style={{ fontSize: 11, color: L.bodyText, opacity: 0.35, marginLeft: "auto" }}>Capítulo {ci + 1}</span>
                </div>
                {ch.questions.map((q, qi) => {
                  const ans = answers[ch.id]?.[qi];
                  if (!ans?.text && !ans?.photos?.length) return null;
                  return (
                    <div key={qi} style={{ marginBottom: 28, paddingBottom: 24, borderBottom: `1px solid ${L.borderColor}` }}>
                      <p style={{ fontSize: 13, fontStyle: "italic", color: L.accentColor, margin: "0 0 10px", opacity: 0.85 }}>{q}</p>
                      {ans.text && <p style={{ fontSize: 15, color: L.bodyText, lineHeight: 1.8, margin: "0 0 12px", paddingLeft: 14, borderLeft: `3px solid ${L.divider}` }}>{ans.text}</p>}
                      {ans.photos?.length > 0 && <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 8 }}>{ans.photos.map((p, pi) => <div key={pi} style={{ border: `1px solid ${L.borderColor}`, borderRadius: 8, overflow: "hidden" }}><img src={p.src} alt="" style={{ height: 120, display: "block", objectFit: "cover" }} /></div>)}</div>}
                    </div>
                  );
                })}
              </div>
            );
          })}
          <div style={{ textAlign: "center", marginTop: 36, paddingTop: 20, borderTop: `1px solid ${L.borderColor}` }}>
            <p style={{ fontSize: 11, color: L.bodyText, opacity: 0.35, letterSpacing: 2, textTransform: "uppercase" }}>Memórias da Família · {year}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function LayoutPicker({ onSelect, onBack }) {
  return (
    <div style={{ maxWidth: 460, margin: "0 auto", padding: "24px 16px" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#7c3aed", marginBottom: 20, padding: 0 }}>← Voltar</button>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 34, marginBottom: 8 }}>🎨</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#4c1d95", margin: "0 0 4px" }}>Escolha o layout</h2>
        <p style={{ color: "#6b7280", fontSize: 13, margin: 0 }}>Clique para ver a prévia e imprimir</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {LAYOUTS.map(L => (
          <button key={L.id} onClick={() => onSelect(L)} style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", borderRadius: 14, border: "1.5px solid #e9d5ff", cursor: "pointer", textAlign: "left", background: "#faf5ff" }}>
            <div style={{ width: 48, height: 48, borderRadius: 10, background: L.coverBg, border: `2px solid ${L.coverAccent}`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 24, height: 3, background: L.coverAccent, borderRadius: 2 }} />
            </div>
            <div>
              <p style={{ fontWeight: 600, color: "#1f1335", fontSize: 14, margin: 0 }}>{L.label}</p>
              <p style={{ color: "#6b7280", fontSize: 12, margin: "3px 0 0", fontFamily: L.font }}>{L.id === "warm" ? "Tons quentes, tipografia clássica" : L.id === "elegant" ? "Preto, branco e toques dourados" : "Cores vibrantes e modernas"}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function BookView({ answers, subject, templateId, year, onClose, onPrint }) {
  const chapters = CHAPTERS[templateId] || [];
  const tpl = TEMPLATES.find(t => t.id === templateId);
  return (
    <div style={{ padding: "20px 0" }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ fontSize: 38, marginBottom: 8 }}>{tpl?.emoji}</div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#4c1d95", margin: "0 0 4px" }}>{templateId === "eu" ? "Carta para o Futuro" : `A História de ${subject}`}</h1>
        <p style={{ color: "#7c3aed", fontSize: 13 }}>{year}</p>
      </div>
      {chapters.map(ch => {
        const has = ch.questions.some((_, qi) => answers[ch.id]?.[qi]?.text || answers[ch.id]?.[qi]?.photos?.length);
        if (!has) return null;
        return (
          <div key={ch.id} style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, borderBottom: "2px solid #ede9fe", paddingBottom: 8 }}>
              <span style={{ fontSize: 16 }}>{ch.emoji}</span>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: "#4c1d95", margin: 0 }}>{ch.title}</h2>
            </div>
            {ch.questions.map((q, qi) => {
              const ans = answers[ch.id]?.[qi];
              if (!ans?.text && !ans?.photos?.length) return null;
              return (
                <div key={qi} style={{ marginBottom: 18, paddingLeft: 12, borderLeft: "3px solid #c4b5fd" }}>
                  <p style={{ fontStyle: "italic", color: "#6d28d9", fontSize: 12, margin: "0 0 5px" }}>{q}</p>
                  {ans.text && <p style={{ color: "#1f1335", fontSize: 14, lineHeight: 1.7, margin: "0 0 8px" }}>{ans.text}</p>}
                  {ans.photos?.length > 0 && <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{ans.photos.map((p, pi) => <img key={pi} src={p.src} alt="" style={{ height: 80, borderRadius: 8, objectFit: "cover", border: "1.5px solid #e9d5ff" }} />)}</div>}
                </div>
              );
            })}
          </div>
        );
      })}
      <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 24, flexWrap: "wrap" }}>
        <button onClick={onClose} style={{ padding: "10px 20px", borderRadius: 20, background: "#f3f0ff", border: "1.5px solid #a78bfa", color: "#6d28d9", cursor: "pointer", fontWeight: 500, fontSize: 13 }}>← Voltar</button>
        <button onClick={onPrint} style={{ padding: "10px 20px", borderRadius: 20, background: "#7c3aed", border: "none", color: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>📄 Escolher layout e imprimir</button>
      </div>
    </div>
  );
}

function FillScreen({ templateId, subject, year, cloudKey, onBack }) {
  const [answers, setAnswersState] = useState({});
  const [activeChapter, setActiveChapter] = useState(0);
  const [screen, setScreen] = useState("fill");
  const [selectedLayout, setSelectedLayout] = useState(null);
  const [saveStatus, setSaveStatus] = useState("idle");
  const [shareMsg, setShareMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const saveTimer = useRef(null);
  const chapters = CHAPTERS[templateId] || [];
  const tpl = TEMPLATES.find(t => t.id === templateId);
  const isEu = templateId === "eu";

  useEffect(() => {
    cloudLoad(cloudKey).then(data => {
      if (data?.answers) setAnswersState(data.answers);
      setLoading(false);
    });
  }, [cloudKey]);

  const saveToCloud = useCallback(async (ans) => {
    setSaveStatus("saving");
    const ok = await cloudSave(cloudKey, { answers: ans, templateId, subject, year, updatedAt: Date.now() });
    setSaveStatus(ok ? "saved" : "error");
    setTimeout(() => setSaveStatus("idle"), 2500);
  }, [cloudKey, templateId, subject, year]);

  const setAnswer = (chId, qi, field, val) => {
    setAnswersState(prev => {
      const next = { ...prev, [chId]: { ...prev[chId], [qi]: { ...(prev[chId]?.[qi] || {}), [field]: val } } };
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => saveToCloud(next), 1200);
      return next;
    });
  };

  const totalQ = chapters.reduce((s, c) => s + c.questions.length, 0);
  const answeredQ = chapters.reduce((s, c) => s + c.questions.filter((_, qi) => answers[c.id]?.[qi]?.text).length, 0);
  const pct = Math.round((answeredQ / totalQ) * 100);

  const shareLink = () => {
    const url = `${window.location.origin}?livro=${encodeURIComponent(cloudKey)}`;
    if (navigator.clipboard) navigator.clipboard.writeText(url).then(() => setShareMsg("Link copiado! Envie para a pessoa responder."));
    else setShareMsg("Compartilhe: " + url);
    setTimeout(() => setShareMsg(""), 5000);
  };

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 300, gap: 14 }}>
      <div style={{ width: 36, height: 36, border: "3px solid #e9d5ff", borderTop: "3px solid #7c3aed", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <p style={{ color: "#7c3aed", fontSize: 14 }}>A carregar o livro...</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (screen === "print" && selectedLayout) return <PrintPreview answers={answers} subject={subject} templateId={templateId} year={year} layout={selectedLayout} onClose={() => setScreen("book")} />;
  if (screen === "layout") return <LayoutPicker onSelect={L => { setSelectedLayout(L); setScreen("print"); }} onBack={() => setScreen("book")} />;
  if (screen === "book") return <BookView answers={answers} subject={subject} templateId={templateId} year={year} onClose={() => setScreen("fill")} onPrint={() => setScreen("layout")} />;

  const ch = chapters[activeChapter];
  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "16px 16px 40px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, padding: 4, color: "#7c3aed" }}>←</button>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 12, color: "#7c3aed", margin: 0 }}>{tpl?.emoji} {tpl?.label} · {year}</p>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: "#1f1335", margin: 0 }}>{isEu ? "Carta para o Futuro" : subject}</h2>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end", marginBottom: 3 }}>
            {saveStatus === "saving" && <span style={{ fontSize: 11, color: "#a78bfa" }}>A guardar...</span>}
            {saveStatus === "saved" && <span style={{ fontSize: 11, color: "#15803d" }}>✓ Guardado</span>}
            {saveStatus === "error" && <span style={{ fontSize: 11, color: "#e11d48" }}>Erro ao guardar</span>}
            <span style={{ fontSize: 11, color: "#6b7280" }}>{pct}%</span>
          </div>
          <div style={{ width: 72, height: 5, background: "#ede9fe", borderRadius: 6, overflow: "hidden" }}>
            <div style={{ width: `${pct}%`, height: "100%", background: "#7c3aed", borderRadius: 6, transition: "width 0.4s" }} />
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        {chapters.map((c, i) => {
          const done = c.questions.filter((_, qi) => answers[c.id]?.[qi]?.text).length;
          return (
            <button key={c.id} onClick={() => setActiveChapter(i)} style={{ padding: "5px 11px", borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: "pointer", border: "1.5px solid", background: i === activeChapter ? "#7c3aed" : done === c.questions.length ? "#f0fdf4" : "#faf5ff", borderColor: i === activeChapter ? "#7c3aed" : done === c.questions.length ? "#86efac" : "#e9d5ff", color: i === activeChapter ? "#fff" : done === c.questions.length ? "#15803d" : "#6d28d9" }}>
              {c.emoji} {c.title}
            </button>
          );
        })}
      </div>
      <div style={{ background: "#faf5ff", borderRadius: 16, padding: "20px 16px", marginBottom: 20, border: "1.5px solid #e9d5ff" }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#4c1d95", margin: "0 0 18px", display: "flex", alignItems: "center", gap: 8 }}>
          <span>{ch.emoji}</span>{ch.title}
        </h3>
        {ch.questions.map((q, qi) => {
          const ans = answers[ch.id]?.[qi] || {};
          return (
            <div key={qi} style={{ marginBottom: 26, paddingBottom: 22, borderBottom: qi < ch.questions.length - 1 ? "1px solid #e9d5ff" : "none" }}>
              <p style={{ fontWeight: 500, color: "#1f1335", fontSize: 14, margin: "0 0 10px", lineHeight: 1.5 }}>
                <span style={{ color: "#a78bfa", fontWeight: 700, marginRight: 6 }}>{qi + 1}.</span>{q}
              </p>
              <textarea value={ans.text || ""} onChange={e => setAnswer(ch.id, qi, "text", e.target.value)}
                placeholder="Escreva sua resposta aqui..." rows={3}
                style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #c4b5fd", fontSize: 14, lineHeight: 1.6, resize: "vertical", background: "#fff", fontFamily: "inherit", marginBottom: 10 }} />
              <VoiceButton onTranscript={t => setAnswer(ch.id, qi, "text", (ans.text ? ans.text + " " : "") + t)} />
              <PhotoAttach photos={ans.photos || []} onChange={p => setAnswer(ch.id, qi, "photos", p)} />
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {!isEu && <button onClick={shareLink} style={{ flex: 1, minWidth: 110, padding: "12px 12px", borderRadius: 12, background: "#f3f0ff", border: "1.5px solid #a78bfa", color: "#6d28d9", cursor: "pointer", fontWeight: 500, fontSize: 13 }}>🔗 Compartilhar</button>}
          <button onClick={() => setScreen("book")} style={{ flex: 1, minWidth: 110, padding: "12px 12px", borderRadius: 12, background: "#f3f0ff", border: "1.5px solid #a78bfa", color: "#6d28d9", cursor: "pointer", fontWeight: 500, fontSize: 13 }}>📖 Ver livro</button>
          <button onClick={() => setScreen("layout")} style={{ flex: 1, minWidth: 110, padding: "12px 12px", borderRadius: 12, background: "#7c3aed", border: "none", color: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>📄 Imprimir</button>
        </div>
        {shareMsg && <div style={{ padding: "10px 14px", background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: 10, fontSize: 13, color: "#15803d" }}>✓ {shareMsg}</div>}
        <p style={{ fontSize: 11, color: "#9ca3af", textAlign: "center", margin: 0 }}>☁️ Guardado automaticamente na nuvem.</p>
      </div>
    </div>
  );
}

function YearEntry({ templateId, tpl, onStart, onBack }) {
  const isEu = templateId === "eu";
  const [name, setName] = useState("");
  const [year, setYear] = useState(String(YEAR));
  const [savedEntries, setSavedEntries] = useState([]);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const years = Array.from({ length: 11 }, (_, i) => String(YEAR - 5 + i));

  useEffect(() => {
    cloudList(`memorias:${templateId}:`).then(keys => {
      setSavedEntries(keys.map(k => { const p = k.replace(`memorias:${templateId}:`, "").split(":"); return { slug: p[0], year: p[1], key: k }; }));
      setLoadingEntries(false);
    });
  }, [templateId]);

  const start = (n, y) => { const key = makeKey(templateId, n, y); onStart(n, y, key); };

  return (
    <div style={{ maxWidth: 440, margin: "0 auto", padding: "24px 16px" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#7c3aed", marginBottom: 20, padding: 0 }}>← Voltar</button>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 42, marginBottom: 8 }}>{tpl.emoji}</div>
        <h2 style={{ fontSize: 21, fontWeight: 700, color: "#4c1d95", margin: "0 0 5px" }}>{tpl.label}</h2>
        <p style={{ color: "#6d28d9", fontSize: 13, margin: 0 }}>{tpl.desc}</p>
      </div>
      {!isEu && <div style={{ marginBottom: 14 }}><p style={{ fontSize: 14, color: "#374151", marginBottom: 6 }}>Nome da pessoa</p><input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Mãe, Vovó Rosa..." style={{ width: "100%", boxSizing: "border-box", padding: "12px 14px", borderRadius: 12, border: "1.5px solid #c4b5fd", fontSize: 15, background: "#faf5ff" }} /></div>}
      <div style={{ marginBottom: 20 }}><p style={{ fontSize: 14, color: "#374151", marginBottom: 6 }}>Ano</p><select value={year} onChange={e => setYear(e.target.value)} style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1.5px solid #c4b5fd", fontSize: 15, background: "#faf5ff", color: "#1f1335" }}>{years.map(y => <option key={y} value={y}>{y}</option>)}</select></div>
      <button onClick={() => start(isEu ? "Eu" : name, year)} disabled={!isEu && !name.trim()} style={{ width: "100%", padding: "14px", borderRadius: 12, background: (isEu || name.trim()) ? "#7c3aed" : "#e5e7eb", border: "none", color: (isEu || name.trim()) ? "#fff" : "#9ca3af", fontSize: 16, fontWeight: 600, cursor: (isEu || name.trim()) ? "pointer" : "default" }}>
        Começar {year} →
      </button>
      {!loadingEntries && savedEntries.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 10 }}>☁️ Livros guardados na nuvem</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {savedEntries.map((s, i) => (
              <button key={i} onClick={() => start(s.slug, s.year)} style={{ padding: "10px 14px", borderRadius: 10, background: "#f3f0ff", border: "1.5px solid #e9d5ff", color: "#4c1d95", cursor: "pointer", textAlign: "left", fontSize: 14, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span>{isEu ? "💌 Carta" : s.slug} · {s.year}</span>
                <span style={{ fontSize: 11, color: "#a78bfa" }}>Continuar →</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState("home");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [subject, setSubject] = useState("");
  const [year, setYear] = useState(String(YEAR));
  const [cloudKey, setCloudKey] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const livro = params.get("livro");
    if (livro) {
      const parts = livro.split(":");
      if (parts.length === 4) {
        setSelectedTemplate(parts[1]);
        setSubject(parts[2]);
        setYear(parts[3]);
        setCloudKey(livro);
        setScreen("fill");
      }
    }
  }, []);

  if (screen === "home") return (
    <div style={{ maxWidth: 500, margin: "0 auto", padding: "32px 16px" }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 48, marginBottom: 10 }}>📖</div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#4c1d95", margin: "0 0 8px" }}>Memórias da Família</h1>
        <p style={{ color: "#6d28d9", fontSize: 14, lineHeight: 1.6, margin: "0 0 6px" }}>Guarde as histórias de quem você ama — para sempre.</p>
        <p style={{ fontSize: 12, color: "#a78bfa", margin: 0 }}>☁️ Tudo guardado na nuvem, acessível de qualquer dispositivo</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {TEMPLATES.map(t => (
          <button key={t.id} onClick={() => { setSelectedTemplate(t.id); setScreen("entry"); }} style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", borderRadius: 14, background: t.bg, border: `1.5px solid ${t.border}`, cursor: "pointer", textAlign: "left" }}>
            <span style={{ fontSize: 28 }}>{t.emoji}</span>
            <div>
              <p style={{ fontWeight: 600, color: "#1f1335", fontSize: 15, margin: 0 }}>{t.label}</p>
              <p style={{ color: "#6b7280", fontSize: 13, margin: 0 }}>{t.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  if (screen === "entry") {
    const tpl = TEMPLATES.find(t => t.id === selectedTemplate);
    return <YearEntry templateId={selectedTemplate} tpl={tpl} onStart={(name, yr, key) => { setSubject(name); setYear(yr); setCloudKey(key); setScreen("fill"); }} onBack={() => setScreen("home")} />;
  }

  if (screen === "fill") return <FillScreen templateId={selectedTemplate} subject={subject} year={year} cloudKey={cloudKey} onBack={() => setScreen("entry")} />;
}
