import { useEffect, useMemo, useState } from "react";
import { availableClasses, shopItems, tenant, yearChapters } from "./config";
import { learningStore } from "./scorm";

const heroes = [
  {
    id: "luna",
    name: "Luna",
    title: "Guardiã das escolhas",
    face: "👧🏽",
    color: "#d96947",
  },
  {
    id: "leo",
    name: "Leo",
    title: "Guardião dos planos",
    face: "👦🏽",
    color: "#34755f",
  },
];

const lessonById = Object.fromEntries(
  availableClasses.flatMap((courseClass) =>
    courseClass.lessons.map((lesson, lessonIndex) => [
      lesson.id,
      { ...lesson, lessonIndex, classNumber: courseClass.number },
    ]),
  ),
);

function JourneyApp() {
  const restored = useMemo(() => learningStore.load(), []);
  const [profile, setProfile] = useState(
    restored.profile ?? {
      name: restored.name ?? "",
      nickname: "",
      hero: "",
    },
  );
  const [view, setView] = useState(
    restored.profile?.name && restored.profile?.hero ? "map" : "welcome",
  );
  const [selectedClass, setSelectedClass] = useState(restored.selectedClass ?? 1);
  const [selectedLesson, setSelectedLesson] = useState("dinheiro");
  const [completedLessons, setCompletedLessons] = useState(
    restored.completedLessons ?? [],
  );
  const [coins, setCoins] = useState(restored.coins ?? 0);
  const [inventory, setInventory] = useState(restored.inventory ?? []);
  const [equipped, setEquipped] = useState(restored.equipped ?? {});
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState("");

  const completedClasses = availableClasses
    .filter((courseClass) =>
      courseClass.lessons.every((lesson) => completedLessons.includes(lesson.id)),
    )
    .map((courseClass) => courseClass.number);

  useEffect(() => {
    learningStore.initialize();
    return () => learningStore.finish();
  }, []);

  useEffect(() => {
    learningStore.save({
      profile,
      selectedClass,
      completedLessons,
      coins,
      inventory,
      equipped,
      chapter: completedClasses.length,
      stars: coins,
    });
  }, [
    profile,
    selectedClass,
    completedLessons,
    coins,
    inventory,
    equipped,
    completedClasses.length,
  ]);

  const navigate = (nextView) => {
    setView(nextView);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openClass = (classNumber) => {
    if (classNumber > 2) {
      showToast("Essa trilha será aberta em uma próxima etapa! 🔒");
      return;
    }
    setSelectedClass(classNumber);
    navigate("class");
  };

  const openLesson = (lessonId) => {
    setSelectedLesson(lessonId);
    navigate("lesson");
  };

  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  };

  const completeLesson = (lessonId) => {
    if (!completedLessons.includes(lessonId)) {
      const lesson = lessonById[lessonId];
      const courseClass = availableClasses.find(
        (item) => item.number === lesson.classNumber,
      );
      const nextCompleted = [...completedLessons, lessonId];
      const finishedClass = courseClass.lessons.every(
        (item) => nextCompleted.includes(item.id),
      );
      const reward = finishedClass ? 35 : 10;
      setCompletedLessons(nextCompleted);
      setCoins((current) => current + reward);
      showToast(
        finishedClass
          ? "Aula completa! +10 moedas e um baú com 25 extras! 🎁"
          : `Lição concluída: +${reward} moedas! 🪙`,
      );
    }
    navigate("class");
  };

  const buyItem = (item) => {
    if (inventory.includes(item.id)) {
      setEquipped((current) => ({ ...current, [item.slot]: item.id }));
      showToast(`${item.name} equipado!`);
      return;
    }
    if (coins < item.price) {
      showToast("Você ainda não tem moedas suficientes.");
      return;
    }
    setCoins((current) => current - item.price);
    setInventory((current) => [...current, item.id]);
    setEquipped((current) => ({ ...current, [item.slot]: item.id }));
    showToast(`${item.name} agora é seu! ✨`);
  };

  const sellItem = (item) => {
    setCoins((current) => current + item.price);
    setInventory((current) => current.filter((id) => id !== item.id));
    setEquipped((current) => {
      const next = { ...current };
      if (next[item.slot] === item.id) delete next[item.slot];
      return next;
    });
    showToast(`${item.name} voltou para a banca. +${item.price} moedas.`);
  };

  const hero = heroes.find((item) => item.id === profile.hero) ?? heroes[0];
  const progress = Math.round((completedClasses.length / 36) * 100);

  return (
    <div
      className="journey-app"
      style={{
        "--primary": tenant.colors.primary,
        "--secondary": tenant.colors.secondary,
        "--accent": tenant.colors.accent,
      }}
    >
      {view !== "welcome" && (
        <JourneyHeader
          profile={profile}
          hero={hero}
          coins={coins}
          progress={progress}
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          navigate={navigate}
        />
      )}

      {view !== "welcome" && (
        <JourneyMenu
          open={menuOpen}
          close={() => setMenuOpen(false)}
          navigate={navigate}
          profile={profile}
          hero={hero}
          completedLessons={completedLessons}
        />
      )}

      <main id="conteudo">
        {view === "welcome" && (
          <AdventureWelcome
            initialProfile={profile}
            onStart={(nextProfile) => {
              setProfile(nextProfile);
              navigate("map");
            }}
          />
        )}
        {view === "map" && (
          <JourneyMap
            profile={profile}
            hero={hero}
            completedClasses={completedClasses}
            openClass={openClass}
          />
        )}
        {view === "class" && (
          <ClassOverview
            courseClass={availableClasses.find(
              (item) => item.number === selectedClass,
            )}
            completedLessons={completedLessons}
            openLesson={openLesson}
            back={() => navigate("map")}
          />
        )}
        {view === "lesson" && (
          <LessonScreen
            lesson={lessonById[selectedLesson]}
            isCompleted={completedLessons.includes(selectedLesson)}
            complete={() => completeLesson(selectedLesson)}
            back={() => navigate("class")}
          />
        )}
        {view === "shop" && (
          <AdventureShop
            hero={hero}
            profile={profile}
            coins={coins}
            inventory={inventory}
            equipped={equipped}
            buyItem={buyItem}
            sellItem={sellItem}
            back={() => navigate("map")}
          />
        )}
        {view === "hero" && (
          <HeroRoom
            hero={hero}
            profile={profile}
            equipped={equipped}
            inventory={inventory}
            navigate={navigate}
          />
        )}
      </main>

      {toast && (
        <div className="journey-toast" role="status">
          {toast}
        </div>
      )}
    </div>
  );
}

function JourneyHeader({
  profile,
  hero,
  coins,
  progress,
  menuOpen,
  setMenuOpen,
  navigate,
}) {
  return (
    <header className="journey-header">
      <button
        className="journey-menu-button"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Abrir menu"
      >
        <span />
        <span />
        <span />
      </button>
      <button className="journey-brand" onClick={() => navigate("map")}>
        <span className="journey-brand-mark">↗</span>
        <span>
          <b>{tenant.brandName}</b>
          <small>Livro 1 · A jornada começa</small>
        </span>
      </button>
      <div className="journey-progress">
        <span>
          Jornada anual <b>{progress}%</b>
        </span>
        <div>
          <i style={{ width: `${progress}%` }} />
        </div>
      </div>
      <button className="coin-wallet" onClick={() => navigate("shop")}>
        <span>🪙</span>
        <b>{coins}</b>
        <small>Loja</small>
      </button>
      <button className="mini-hero" onClick={() => navigate("hero")}>
        <span>{hero.face}</span>
        <small>{profile.nickname || profile.name}</small>
      </button>
    </header>
  );
}

function JourneyMenu({ open, close, navigate, profile, hero, completedLessons }) {
  return (
    <>
      <button
        className={`journey-backdrop ${open ? "open" : ""}`}
        onClick={close}
        aria-label="Fechar menu"
      />
      <aside className={`journey-menu ${open ? "open" : ""}`}>
        <div className="journey-menu-profile">
          <span>{hero.face}</span>
          <div>
            <small>Explorador(a)</small>
            <b>{profile.nickname || profile.name}</b>
            <em>{completedLessons.length} de 144 lições</em>
          </div>
          <button onClick={close}>×</button>
        </div>
        <nav>
          <button onClick={() => navigate("map")}>
            <span>🗺️</span><b>Mapa da jornada</b><i>→</i>
          </button>
          <button onClick={() => navigate("hero")}>
            <span>🧙</span><b>Meu personagem</b><i>→</i>
          </button>
          <button onClick={() => navigate("shop")}>
            <span>🏪</span><b>Banca de itens</b><i>→</i>
          </button>
        </nav>
        <div className="journey-menu-note">
          <span>📚</span>
          <p><b>36 aulas · 144 lições</b>Uma aventura para todo o ano letivo.</p>
        </div>
      </aside>
    </>
  );
}

function AdventureWelcome({ initialProfile, onStart }) {
  const [name, setName] = useState(initialProfile.name);
  const [nickname, setNickname] = useState(initialProfile.nickname);
  const [selectedHero, setSelectedHero] = useState(initialProfile.hero);
  const [error, setError] = useState("");

  const submit = (event) => {
    event.preventDefault();
    if (!name.trim()) {
      setError("Escreva seu nome para começar a jornada.");
      return;
    }
    if (!selectedHero) {
      setError("Escolha quem vai acompanhar você nesta aventura.");
      return;
    }
    onStart({
      name: name.trim(),
      nickname: nickname.trim() || name.trim(),
      hero: selectedHero,
    });
  };

  return (
    <section className="adventure-welcome">
      <div className="welcome-sky">
        <span className="welcome-cloud cloud-a">☁</span>
        <span className="welcome-cloud cloud-b">☁</span>
        <span className="welcome-bird">⌁</span>
        <div className="welcome-castle">🏰</div>
        <div className="welcome-mountain mountain-a" />
        <div className="welcome-mountain mountain-b" />
        <div className="welcome-road" />
        <span className="road-coin coin-a">🪙</span>
        <span className="road-coin coin-b">🪙</span>
        <span className="road-coin coin-c">🪙</span>
      </div>
      <div className="welcome-panel">
        <div className="welcome-seal">Livro 1 · ciclo inicial</div>
        <p className="welcome-kicker">Uma aventura de educação financeira</p>
        <h1>
          O mapa dos
          <span>pequenos tesouros</span>
        </h1>
        <p>
          Há 36 desafios entre você e o Castelo das Conquistas. Aprenda,
          ganhe moedas e equipe seu personagem pelo caminho.
        </p>
        <form onSubmit={submit} className="adventure-form">
          <label htmlFor="real-name">
            <span>1</span>
            Qual é o seu nome?
          </label>
          <input
            id="real-name"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setError("");
            }}
            placeholder="Meu nome é..."
            maxLength={28}
            required
          />
          <label htmlFor="nickname">
            <span>2</span>
            Nome do personagem <small>(pode ser o seu)</small>
          </label>
          <input
            id="nickname"
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
            placeholder={name || "Como será chamado na aventura?"}
            maxLength={20}
          />
          <fieldset>
            <legend><span>3</span> Escolha seu personagem</legend>
            <div className="hero-choices">
              {heroes.map((hero) => (
                <button
                  type="button"
                  key={hero.id}
                  className={selectedHero === hero.id ? "selected" : ""}
                  onClick={() => {
                    setSelectedHero(hero.id);
                    setError("");
                  }}
                  style={{ "--hero-color": hero.color }}
                >
                  <span>{hero.face}</span>
                  <b>{hero.name}</b>
                  <small>{hero.title}</small>
                  <i>{selectedHero === hero.id ? "✓" : ""}</i>
                </button>
              ))}
            </div>
          </fieldset>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="start-journey" type="submit">
            Abrir meu mapa <span>→</span>
          </button>
        </form>
      </div>
    </section>
  );
}

function JourneyMap({ profile, hero, completedClasses, openClass }) {
  return (
    <section className="map-page">
      <header className="map-intro">
        <div>
          <p>Capítulo 1 · Primeiros passos</p>
          <h1>O mapa da sua jornada</h1>
          <span>
            Olá, <b>{profile.nickname || profile.name}</b>! Cada aula completa
            move você mais perto do grande troféu.
          </span>
        </div>
        <div className="map-legend">
          <span><i className="done" /> Concluída</span>
          <span><i className="open" /> Disponível</span>
          <span><i className="locked" /> Em breve</span>
        </div>
      </header>

      <div className="world-map">
        <div className="map-decoration deco-cloud">☁</div>
        <div className="map-decoration deco-tree">🌲</div>
        <div className="map-decoration deco-lake">≈</div>
        <div className="map-decoration deco-castle">🏆</div>
        <svg className="map-path" viewBox="0 0 1000 550" preserveAspectRatio="none" aria-hidden="true">
          <path d="M70,455 C170,370 260,500 350,395 S520,255 615,345 S760,410 820,270 S880,120 940,85" />
        </svg>
        <div className="map-nodes">
          {Array.from({ length: 36 }, (_, index) => {
            const classNumber = index + 1;
            const available = classNumber <= 2;
            const done = completedClasses.includes(classNumber);
            const row = Math.floor(index / 6);
            const column = index % 6;
            const left = row % 2 === 0
              ? 8 + column * 16.5
              : 90 - column * 16.5;
            const top = 86 - row * 14.5;
            return (
              <button
                key={classNumber}
                className={`map-node ${done ? "done" : available ? "available" : "locked"}`}
                style={{ left: `${left}%`, top: `${top}%` }}
                onClick={() => openClass(classNumber)}
                aria-label={`Aula ${classNumber}${available ? "" : ", em breve"}`}
              >
                {done ? "✓" : available ? classNumber : "🔒"}
                {classNumber === Math.min(completedClasses.length + 1, 2) && (
                  <span className="map-hero" title={profile.nickname || profile.name}>
                    {hero.face}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <button className="map-start-card" onClick={() => openClass(1)}>
          <span>🪙</span>
          <small>Aula 1</small>
          <b>O mistério das moedas</b>
          <em>{completedClasses.includes(1) ? "Revisar aula" : "Começar aventura →"}</em>
        </button>
        <button className="map-class-two" onClick={() => openClass(2)}>
          <span>🥖</span>
          <div><small>Aula 2</small><b>De onde vêm as coisas?</b></div>
        </button>
      </div>

      <div className="chapter-roadmap">
        <h2>Os 6 capítulos da aventura</h2>
        <div>
          {yearChapters.map((chapter, index) => (
            <article key={chapter.id} style={{ "--chapter-color": chapter.color }}>
              <span>{chapter.icon}</span>
              <small>Capítulo {index + 1}</small>
              <b>{chapter.title}</b>
              <p>{chapter.subtitle}</p>
              <em>Aulas {chapter.classes[0]}–{chapter.classes.at(-1)}</em>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ClassOverview({ courseClass, completedLessons, openLesson, back }) {
  const done = courseClass.lessons.filter((lesson) =>
    completedLessons.includes(lesson.id),
  ).length;

  return (
    <section className="class-page">
      <button className="page-back" onClick={back}>← Voltar ao mapa</button>
      <div className="class-banner">
        <div>
          <span>Capítulo 1 · Aula {courseClass.number} de 36</span>
          <h1>{courseClass.title}</h1>
          <p>{courseClass.description}</p>
          <div className="class-progress">
            <i style={{ width: `${(done / 4) * 100}%` }} />
          </div>
          <small>{done} de 4 lições concluídas</small>
        </div>
        <div className="class-banner-icon">{courseClass.icon}</div>
      </div>
      <div className="lesson-grid">
        {courseClass.lessons.map((lesson, index) => {
          const completed = completedLessons.includes(lesson.id);
          return (
            <button
              key={lesson.id}
              className={completed ? "completed" : ""}
              onClick={() => openLesson(lesson.id)}
            >
              <span className="lesson-order">{completed ? "✓" : index + 1}</span>
              <span className="lesson-card-icon">{lesson.icon}</span>
              <small>Lição {index + 1} · {lesson.minutes} min</small>
              <b>{lesson.title}</b>
              <p>{lessonSummary[lesson.id]}</p>
              <em>{completed ? "Rever lição" : "Começar"} →</em>
            </button>
          );
        })}
      </div>
      <div className="class-reward">
        <span>🎁</span>
        <p><b>Baú da aula</b>Conclua as 4 lições e ganhe 25 moedas extras.</p>
        <i>{done}/4</i>
      </div>
    </section>
  );
}

const lessonSummary = {
  dinheiro: "Entenda por que usamos moedas e notas nas trocas.",
  "preciso-quero": "Aprenda a diferenciar necessidades e desejos.",
  escolhas: "Ajude Lia a fazer uma escolha que cabe no bolso.",
  guardar: "Descubra como um pouco de cada vez vira conquista.",
  trabalho: "Conheça pessoas que trabalham e ajudam a comunidade.",
  "caminho-pao": "Siga o caminho do trigo até chegar à nossa mesa.",
  cuidar: "Veja como cuidar das coisas evita desperdícios.",
  "missao-casa": "Leve a descoberta para casa com uma missão em família.",
};

function LessonScreen({ lesson, isCompleted, complete, back }) {
  return (
    <section className="lesson-screen">
      <button className="page-back" onClick={back}>← Voltar para a aula</button>
      <header className="lesson-screen-header">
        <div>
          <span>Aula {lesson.classNumber} · Lição {lesson.lessonIndex + 1} de 4</span>
          <h1>{lesson.title}</h1>
          <p>{lessonSummary[lesson.id]}</p>
        </div>
        <i>{lesson.icon}</i>
      </header>
      <div className="lesson-content">
        {lesson.id === "dinheiro" && <MoneyContent />}
        {lesson.id === "preciso-quero" && <NeedsContent />}
        {lesson.id === "escolhas" && <ChoiceContent />}
        {lesson.id === "guardar" && <SavingContent />}
        {lesson.id === "trabalho" && <WorkContent />}
        {lesson.id === "caminho-pao" && <BreadContent />}
        {lesson.id === "cuidar" && <CareContent />}
        {lesson.id === "missao-casa" && <HomeMissionContent />}
      </div>
      <div className="complete-lesson">
        <span>{isCompleted ? "✅" : "🪙"}</span>
        <div>
          <small>{isCompleted ? "Lição concluída" : "Recompensa"}</small>
          <b>{isCompleted ? "Você já conquistou esta etapa!" : "Ganhe 10 moedas"}</b>
        </div>
        <button onClick={complete}>
          {isCompleted ? "Voltar para a aula" : "Concluir lição →"}
        </button>
      </div>
    </section>
  );
}

function LearningBlock({ tag, title, icon, children }) {
  return (
    <section className="learning-block">
      <header><span>{icon}</span><div><small>{tag}</small><h2>{title}</h2></div></header>
      {children}
    </section>
  );
}

function MoneyContent() {
  const [active, setActive] = useState(0);
  const steps = [
    ["🥕", "Alguém produz", "Uma pessoa usa tempo e habilidade para produzir algo."],
    ["🛍️", "Outra pessoa escolhe", "Ela pensa se precisa ou deseja aquilo."],
    ["🪙", "O dinheiro ajuda", "Moedas e notas facilitam a troca entre as pessoas."],
  ];
  return (
    <>
      <LearningBlock tag="Descubra" title="Uma ferramenta para trocar" icon="🔎">
        <p>O dinheiro não nasce no caixa eletrônico. Ele representa trabalho e ajuda as pessoas a fazer trocas.</p>
        <div className="storybook-tabs">
          {steps.map((step, index) => (
            <button key={step[1]} className={active === index ? "active" : ""} onClick={() => setActive(index)}>
              <span>{step[0]}</span><b>{step[1]}</b><small>{active === index ? step[2] : "Toque para descobrir"}</small>
            </button>
          ))}
        </div>
      </LearningBlock>
      <Callout icon="💬" title="Conte com suas palavras">
        Se você tivesse uma moeda, por qual coisa importante gostaria de trocá-la?
      </Callout>
    </>
  );
}

function NeedsContent() {
  const items = [
    ["💧", "Água", "preciso"], ["🛹", "Skate novo", "quero"],
    ["🍎", "Comida", "preciso"], ["🌈", "Adesivos", "quero"],
  ];
  const [answers, setAnswers] = useState({});
  return (
    <LearningBlock tag="Jogue" title="Preciso ou quero?" icon="⚖️">
      <p>Precisamos de algumas coisas para viver e crescer. Desejos são legais, mas geralmente podem esperar.</p>
      <div className="needs-game">
        {items.map(([icon, label, answer]) => (
          <article key={label} className={answers[label] ? (answers[label] === answer ? "right" : "wrong") : ""}>
            <span>{icon}</span><b>{label}</b>
            {!answers[label] ? (
              <div><button onClick={() => setAnswers({ ...answers, [label]: "preciso" })}>Preciso</button><button onClick={() => setAnswers({ ...answers, [label]: "quero" })}>Eu quero</button></div>
            ) : (
              <small>{answers[label] === answer ? "Acertou! 🎉" : `Quase! É algo que eu ${answer}.`}</small>
            )}
          </article>
        ))}
      </div>
    </LearningBlock>
  );
}

function ChoiceContent() {
  const products = [
    ["🥪", "Lanche", 6], ["📒", "Caderno", 5], ["⚽", "Bola", 9], ["🍭", "Doce", 3],
  ];
  const [selected, setSelected] = useState([]);
  const spent = selected.reduce((sum, index) => sum + products[index][2], 0);
  const toggle = (index) => {
    if (selected.includes(index)) setSelected(selected.filter((item) => item !== index));
    else if (spent + products[index][2] <= 10) setSelected([...selected, index]);
  };
  return (
    <LearningBlock tag="Desafio" title="A lojinha da Lia" icon="🛒">
      <div className="story-dialogue"><span>👧🏽</span><p>Tenho <b>R$ 10</b>. Você me ajuda a escolher sem gastar mais do que tenho?</p></div>
      <div className="budget-bar"><span>Na carteira</span><b>R$ {10 - spent}</b><i><em style={{ width: `${spent * 10}%` }} /></i></div>
      <div className="choice-products">
        {products.map(([icon, label, price], index) => (
          <button key={label} className={selected.includes(index) ? "selected" : ""} onClick={() => toggle(index)} disabled={!selected.includes(index) && spent + price > 10}>
            <span>{icon}</span><b>{label}</b><small>R$ {price}</small><i>{selected.includes(index) ? "✓ escolhido" : "+ escolher"}</i>
          </button>
        ))}
      </div>
    </LearningBlock>
  );
}

function SavingContent() {
  const [saved, setSaved] = useState(0);
  return (
    <LearningBlock tag="Experimente" title="Um pouquinho de cada vez" icon="🐷">
      <p>Guardar é escolher não gastar agora para realizar algo importante depois.</p>
      <div className="saving-game">
        <div><button onClick={() => setSaved(Math.min(20, saved + 2))} disabled={saved === 20}>+ R$ 2</button><span>🐷</span><small>Toque na moeda</small></div>
        <section><small>Meta: mochila 🎒</small><b>R$ {saved} <em>de R$ 20</em></b><i><span style={{ width: `${saved * 5}%` }} /></i><p>{saved === 20 ? "Conseguiu! Sua paciência virou conquista." : `Faltam R$ ${20 - saved}. Continue!`}</p></section>
      </div>
    </LearningBlock>
  );
}

function WorkContent() {
  const jobs = [
    ["🧑‍🌾", "Agricultora", "Cultiva alimentos", "🌽"],
    ["🧑‍🍳", "Cozinheiro", "Prepara refeições", "🍲"],
    ["🚌", "Motorista", "Leva pessoas", "🛣️"],
    ["🧑‍⚕️", "Médica", "Cuida da saúde", "🩺"],
  ];
  const [open, setOpen] = useState(null);
  return (
    <>
      <LearningBlock tag="Conheça" title="Trabalho transforma o mundo" icon="🛠️">
        <p>As pessoas recebem dinheiro ao oferecer seu tempo, conhecimento ou habilidade. Todo trabalho honesto ajuda alguém.</p>
        <div className="job-cards">
          {jobs.map((job, index) => (
            <button key={job[1]} onClick={() => setOpen(index)} className={open === index ? "open" : ""}>
              <span>{job[0]}</span><b>{job[1]}</b><small>{open === index ? `${job[3]} ${job[2]}` : "O que faz?"}</small>
            </button>
          ))}
        </div>
      </LearningBlock>
      <Callout icon="🌟" title="Importante">
        Trabalho não é somente ter emprego. Cuidar, criar, ensinar e consertar também são trabalhos.
      </Callout>
    </>
  );
}

function BreadContent() {
  const stages = [
    ["🌾", "Plantio", "A agricultora planta e cuida do trigo."],
    ["🚜", "Colheita", "O trigo maduro é colhido no campo."],
    ["🏭", "Moinho", "Os grãos viram farinha."],
    ["🧑‍🍳", "Padaria", "A farinha vira massa e depois pão."],
    ["🥖", "Nossa mesa", "O pão chega à loja e pode ser comprado."],
  ];
  const [stage, setStage] = useState(0);
  return (
    <LearningBlock tag="Investigue" title="A grande viagem do pão" icon="🥖">
      <p>Antes de chegar à nossa mesa, cada produto passa pelo trabalho de muitas pessoas.</p>
      <div className="process-carousel">
        <button onClick={() => setStage(Math.max(0, stage - 1))} disabled={stage === 0}>←</button>
        <article><span>{stages[stage][0]}</span><small>Etapa {stage + 1} de 5</small><h3>{stages[stage][1]}</h3><p>{stages[stage][2]}</p></article>
        <button onClick={() => setStage(Math.min(4, stage + 1))} disabled={stage === 4}>→</button>
      </div>
      <div className="process-dots">{stages.map((_, index) => <button key={index} className={index === stage ? "active" : ""} onClick={() => setStage(index)} />)}</div>
    </LearningBlock>
  );
}

function CareContent() {
  const cases = [
    { icon: "✏️", text: "O lápis perdeu a ponta.", choices: ["Apontar e continuar", "Jogar fora"], answer: 0 },
    { icon: "🧸", text: "O ursinho abriu a costura.", choices: ["Pedir ajuda para consertar", "Comprar outro"], answer: 0 },
    { icon: "💧", text: "A torneira ficou pingando.", choices: ["Avisar um adulto", "Deixar assim"], answer: 0 },
  ];
  const [current, setCurrent] = useState(0);
  const [answer, setAnswer] = useState(null);
  const next = () => {
    setCurrent((value) => Math.min(cases.length - 1, value + 1));
    setAnswer(null);
  };
  return (
    <LearningBlock tag="Decida" title="Cuidar faz durar" icon="🧸">
      <p>Cuidar, consertar e evitar desperdício protege a natureza e o dinheiro da família.</p>
      <div className="care-challenge">
        <span>{cases[current].icon}</span><small>Situação {current + 1} de 3</small><h3>{cases[current].text}</h3>
        <div>{cases[current].choices.map((choice, index) => <button key={choice} onClick={() => setAnswer(index)} className={answer !== null ? (index === cases[current].answer ? "right" : answer === index ? "wrong" : "") : ""}>{choice}</button>)}</div>
        {answer !== null && <p>{answer === 0 ? "Boa escolha! Cuidar evita uma compra desnecessária. 🌱" : "Podemos tentar cuidar ou consertar primeiro."}{current < 2 && <button onClick={next}>Próxima →</button>}</p>}
      </div>
    </LearningBlock>
  );
}

function HomeMissionContent() {
  const [checked, setChecked] = useState([]);
  const tasks = [
    "Escolha um objeto da sua casa que precisa de cuidado.",
    "Converse com um adulto sobre como fazer esse objeto durar.",
    "Desenhe ou escreva o que vocês fizeram.",
    "Conte a descoberta para a turma na próxima aula.",
  ];
  return (
    <>
      <LearningBlock tag="Lição de casa" title="Missão: guardião da casa" icon="🏠">
        <div className="mission-letter">
          <span>📜</span>
          <div><small>Mensagem para a família</small><p>Esta semana, a criança vai observar como o cuidado pode evitar desperdícios. Acompanhe a missão sem fazer por ela.</p></div>
        </div>
        <div className="mission-checklist">
          {tasks.map((task, index) => (
            <button key={task} className={checked.includes(index) ? "checked" : ""} onClick={() => setChecked(checked.includes(index) ? checked.filter((item) => item !== index) : [...checked, index])}>
              <i>{checked.includes(index) ? "✓" : index + 1}</i><span>{task}</span>
            </button>
          ))}
        </div>
      </LearningBlock>
      <Callout icon="🏫" title="Conexão com a escola">
        A turma pode montar uma exposição chamada “Cuidar é valorizar”, com desenhos dos objetos cuidados em casa.
      </Callout>
    </>
  );
}

function Callout({ icon, title, children }) {
  return <aside className="lesson-callout"><span>{icon}</span><p><b>{title}</b>{children}</p></aside>;
}

function Avatar({ hero, equipped, large = false }) {
  const equippedItems = Object.values(equipped)
    .map((id) => shopItems.find((item) => item.id === id))
    .filter(Boolean);
  return (
    <div className={`avatar-stage ${large ? "large" : ""}`}>
      <div className="avatar-glow" />
      <span className="avatar-face">{hero.face}</span>
      {equippedItems.map((item, index) => (
        <span key={item.id} className={`avatar-item slot-${item.slot}`} style={{ "--item-index": index }}>{item.icon}</span>
      ))}
    </div>
  );
}

function AdventureShop({ hero, profile, coins, inventory, equipped, buyItem, sellItem, back }) {
  return (
    <section className="shop-page">
      <button className="page-back" onClick={back}>← Voltar ao mapa</button>
      <header className="shop-header">
        <div><p>Banca do Bosque</p><h1>Itens de aventura</h1><span>Use suas moedas com calma. Você pode vender um item pelo mesmo valor quando quiser trocar.</span></div>
        <div className="shop-balance"><span>🪙</span><small>Seu saldo</small><b>{coins}</b></div>
      </header>
      <div className="shop-layout">
        <aside><Avatar hero={hero} equipped={equipped} large /><h2>{profile.nickname || profile.name}</h2><p>Toque em um item seu para equipar.</p></aside>
        <div className="shop-items">
          {shopItems.map((item) => {
            const owned = inventory.includes(item.id);
            const isEquipped = equipped[item.slot] === item.id;
            return (
              <article key={item.id} className={isEquipped ? "equipped" : ""}>
                <span>{item.icon}</span><small>{slotName[item.slot]}</small><h3>{item.name}</h3>
                <b>🪙 {item.price}</b>
                <button onClick={() => buyItem(item)}>{isEquipped ? "Equipado ✓" : owned ? "Equipar" : "Comprar"}</button>
                {owned && <button className="sell" onClick={() => sellItem(item)}>Vender por {item.price}</button>}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const slotName = {
  head: "Cabeça",
  body: "Roupa",
  feet: "Pés",
  neck: "Colar",
  hand: "Acessório",
};

function HeroRoom({ hero, profile, equipped, inventory, navigate }) {
  return (
    <section className="hero-room">
      <button className="page-back" onClick={() => navigate("map")}>← Voltar ao mapa</button>
      <div className="hero-room-card">
        <Avatar hero={hero} equipped={equipped} large />
        <div><small>Meu personagem</small><h1>{profile.nickname || profile.name}</h1><p>{hero.title}</p><span>{inventory.length} itens conquistados</span><button onClick={() => navigate("shop")}>Visitar a banca 🏪</button></div>
      </div>
    </section>
  );
}

export default JourneyApp;
