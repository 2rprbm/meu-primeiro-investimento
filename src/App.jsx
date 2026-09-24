import { useEffect, useMemo, useState } from "react";
import { chapters, tenant } from "./config";
import { learningStore } from "./scorm";

const moneySteps = [
  {
    icon: "🥕",
    title: "Alguém produz",
    text: "Uma pessoa planta, cria ou prepara algo.",
  },
  {
    icon: "🛍️",
    title: "Outra pessoa escolhe",
    text: "Ela decide se aquilo é importante para ela.",
  },
  {
    icon: "🪙",
    title: "O dinheiro facilita",
    text: "Ele ajuda a trocar trabalho por coisas e serviços.",
  },
];

const sortItems = [
  { id: "agua", icon: "💧", label: "Água", answer: "preciso" },
  { id: "brinquedo", icon: "🛹", label: "Skate novo", answer: "quero" },
  { id: "comida", icon: "🍎", label: "Comida", answer: "preciso" },
  { id: "adesivos", icon: "🌈", label: "Adesivos", answer: "quero" },
];

const quiz = [
  {
    question: "Lia ganhou R$ 10 e quer um livro de R$ 15. O que ela pode fazer?",
    options: ["Guardar e completar depois", "Comprar sem pagar", "Desistir para sempre"],
    answer: 0,
  },
  {
    question: "Antes de comprar, uma escolha esperta é...",
    options: ["Pegar a primeira coisa", "Pensar se preciso", "Gastar tudo depressa"],
    answer: 1,
  },
];

function App() {
  const restored = useMemo(() => learningStore.load(), []);
  const [chapter, setChapter] = useState(
    Math.min(restored.chapter ?? 0, chapters.length - 1),
  );
  const [stars, setStars] = useState(restored.stars ?? 0);
  const [completed, setCompleted] = useState(restored.completed ?? []);
  const [rewards, setRewards] = useState(restored.rewards ?? []);
  const [menuOpen, setMenuOpen] = useState(false);
  const [name, setName] = useState(restored.name ?? "");
  const [toast, setToast] = useState("");

  const progress = Math.round(((chapter + 1) / chapters.length) * 100);

  useEffect(() => {
    learningStore.initialize();
    const finish = () => learningStore.finish();
    window.addEventListener("beforeunload", finish);
    return () => window.removeEventListener("beforeunload", finish);
  }, []);

  useEffect(() => {
    learningStore.save({
      chapter,
      stars,
      completed,
      rewards,
      name,
    });
  }, [chapter, stars, completed, rewards, name]);

  const earnReward = (id, amount = 1) => {
    if (rewards.includes(id)) return;
    setRewards((current) => [...current, id]);
    setStars((current) => current + amount);
    setToast(amount > 1 ? `Você ganhou ${amount} estrelas!` : "Você ganhou 1 estrela!");
    window.setTimeout(() => setToast(""), 2400);
  };

  const goTo = (index) => {
    setChapter(index);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goNext = () => {
    if (chapter > 0) {
      setCompleted((current) =>
        current.includes(chapter) ? current : [...current, chapter],
      );
    }
    if (chapter < chapters.length - 1) goTo(chapter + 1);
  };

  return (
    <div
      className="app"
      style={{
        "--primary": tenant.colors.primary,
        "--secondary": tenant.colors.secondary,
        "--accent": tenant.colors.accent,
      }}
    >
      <Header
        stars={stars}
        progress={progress}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
      />

      <SideMenu
        open={menuOpen}
        chapter={chapter}
        completed={completed}
        goTo={goTo}
        close={() => setMenuOpen(false)}
      />

      <main id="conteudo">
        {chapter === 0 && (
          <Welcome name={name} setName={setName} onStart={() => goTo(1)} />
        )}
        {chapter === 1 && <MoneyLesson earnReward={earnReward} />}
        {chapter === 2 && <ChoicesLesson earnReward={earnReward} />}
        {chapter === 3 && <DreamsLesson earnReward={earnReward} name={name} />}
      </main>

      <BottomNavigation chapter={chapter} goTo={goTo} goNext={goNext} />

      {toast && (
        <div className="toast" role="status">
          <span>⭐</span> {toast}
        </div>
      )}
    </div>
  );
}

function Header({ stars, progress, menuOpen, setMenuOpen }) {
  return (
    <header className="topbar">
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <button
        className="menu-button"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label={menuOpen ? "Fechar sumário" : "Abrir sumário"}
        aria-expanded={menuOpen}
      >
        <span />
        <span />
        <span />
      </button>
      <div className="brand">
        <div className="brand-mark" aria-hidden="true">
          <span>↗</span>
        </div>
        <div>
          <strong>{tenant.brandName}</strong>
          <small>
            {tenant.partnerLabel} <b>{tenant.partnerName}</b>
          </small>
        </div>
      </div>
      <div className="header-progress" aria-label={`${progress}% concluído`}>
        <div className="progress-label">
          <span>Sua jornada</span>
          <b>{progress}%</b>
        </div>
        <div className="progress-track">
          <i style={{ width: `${progress}%` }} />
        </div>
      </div>
      <div className="star-counter" title="Estrelas conquistadas">
        <span>⭐</span>
        <b>{stars}</b>
      </div>
      <div className="partner-logo" aria-label={`Logo ${tenant.partnerName}`}>
        {tenant.initials}
      </div>
    </header>
  );
}

function SideMenu({ open, chapter, completed, goTo, close }) {
  return (
    <>
      <button
        className={`menu-backdrop ${open ? "is-open" : ""}`}
        onClick={close}
        aria-label="Fechar sumário"
        tabIndex={open ? 0 : -1}
      />
      <aside className={`side-menu ${open ? "is-open" : ""}`} aria-hidden={!open}>
        <div className="menu-heading">
          <div>
            <small>Livro 1 · 1º ano</small>
            <h2>Minha jornada</h2>
          </div>
          <button onClick={close} aria-label="Fechar">
            ×
          </button>
        </div>
        <nav aria-label="Sumário do livro">
          {chapters.map((item, index) => (
            <button
              key={item.id}
              className={chapter === index ? "active" : ""}
              onClick={() => goTo(index)}
            >
              <span className="menu-icon">{item.icon}</span>
              <span>
                <small>{item.eyebrow}</small>
                <b>{item.shortTitle}</b>
                <em>{item.minutes} min</em>
              </span>
              <i>{completed.includes(index) ? "✓" : index + 1}</i>
            </button>
          ))}
        </nav>
        <div className="menu-tip">
          <span>💬</span>
          <p>
            <b>Dica para os adultos</b>
            Conversem sobre as descobertas depois de cada aula.
          </p>
        </div>
      </aside>
    </>
  );
}

function Welcome({ name, setName, onStart }) {
  const [draftName, setDraftName] = useState(name);

  const start = (event) => {
    event.preventDefault();
    setName(draftName.trim());
    onStart();
  };

  return (
    <section className="welcome page">
      <div className="welcome-copy">
        <div className="book-pill">
          <span>📗</span> Livro 1 · 1º ano
        </div>
        <p className="eyebrow">Olá, pequeno explorador!</p>
        <h1>
          Toda grande ideia
          <br />
          começa com um <em>primeiro passo.</em>
        </h1>
        <p className="lead">
          Prepare-se para descobrir como fazer boas escolhas, cuidar do que
          você tem e transformar sonhos em planos.
        </p>
        <form className="name-card" onSubmit={start}>
          <label htmlFor="student-name">Como podemos chamar você?</label>
          <div>
            <input
              id="student-name"
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              placeholder="Digite seu primeiro nome"
              maxLength={24}
            />
            <button type="submit">
              Começar aventura <span>→</span>
            </button>
          </div>
          <small>Você também pode começar sem escrever o nome.</small>
        </form>
      </div>
      <div className="welcome-art" aria-label="Criança descobrindo um caminho de moedas">
        <span className="spark spark-one">✦</span>
        <span className="spark spark-two">✦</span>
        <div className="sun">☀</div>
        <div className="cloud cloud-one" />
        <div className="cloud cloud-two" />
        <div className="hill hill-back" />
        <div className="hill hill-front" />
        <div className="coin coin-one">$</div>
        <div className="coin coin-two">$</div>
        <div className="coin coin-three">$</div>
        <div className="kid">
          <div className="kid-hair" />
          <div className="kid-head">•‿•</div>
          <div className="kid-body">↗</div>
          <div className="kid-legs">╱ ╲</div>
        </div>
        <div className="sign">SONHOS →</div>
      </div>
      <div className="floating-note">
        <span>💡</span>
        <p>
          <b>Você sabia?</b> Escolher também é uma forma de cuidar!
        </p>
      </div>
    </section>
  );
}

function LessonHeader({ number, title, text, icon, color }) {
  return (
    <div className={`lesson-hero ${color}`}>
      <div>
        <span className="lesson-number">Aula {number} de 3</span>
        <h1>{title}</h1>
        <p>{text}</p>
        <div className="goal">
          <span>🎯</span>
          <p>
            <b>Nossa missão</b>
            Aprender brincando e explicar a descoberta com suas palavras.
          </p>
        </div>
      </div>
      <div className="hero-icon" aria-hidden="true">
        {icon}
        <i>✦</i>
      </div>
    </div>
  );
}

function MoneyLesson({ earnReward }) {
  const [openStep, setOpenStep] = useState(0);
  const [answers, setAnswers] = useState({});

  const answer = (item, value) => {
    if (answers[item.id]) return;
    const correct = item.answer === value;
    const next = { ...answers, [item.id]: correct ? "correct" : "wrong" };
    setAnswers(next);
    if (correct) earnReward(`sort-${item.id}`);
  };

  return (
    <section className="lesson page">
      <LessonHeader
        number="1"
        title="Para que serve o dinheiro?"
        text="O dinheiro não nasce no caixa eletrônico. Vamos seguir suas pistas?"
        icon="🪙"
        color="purple"
      />

      <section className="content-section">
        <div className="section-title">
          <span>01</span>
          <div>
            <small>Descubra</small>
            <h2>Uma ferramenta para trocar</h2>
          </div>
        </div>
        <p className="intro-text">
          Há muito tempo, as pessoas trocavam objetos diretamente. Hoje usamos
          o dinheiro para facilitar essas trocas. Toque nos cartões:
        </p>
        <div className="step-cards">
          {moneySteps.map((step, index) => (
            <button
              key={step.title}
              className={openStep === index ? "open" : ""}
              onClick={() => setOpenStep(index)}
            >
              <span>{step.icon}</span>
              <small>Passo {index + 1}</small>
              <b>{step.title}</b>
              <p>{step.text}</p>
              <i>{openStep === index ? "✓" : "+"}</i>
            </button>
          ))}
        </div>
      </section>

      <Activity title="Preciso ou quero?" subtitle="Pense antes de escolher">
        <p>
          Algumas coisas são necessárias para viver bem. Outras são desejos
          legais, mas podem esperar. Escolha uma resposta para cada item.
        </p>
        <div className="sort-grid">
          {sortItems.map((item) => (
            <div className={`sort-card ${answers[item.id] ?? ""}`} key={item.id}>
              <span>{item.icon}</span>
              <b>{item.label}</b>
              {!answers[item.id] ? (
                <div>
                  <button onClick={() => answer(item, "preciso")}>Preciso</button>
                  <button onClick={() => answer(item, "quero")}>Eu quero</button>
                </div>
              ) : (
                <small>
                  {answers[item.id] === "correct"
                    ? "Muito bem! +1 ⭐"
                    : `Quase! É algo que eu ${item.answer === "quero" ? "quero" : "preciso"}.`}
                </small>
              )}
            </div>
          ))}
        </div>
      </Activity>
    </section>
  );
}

function ChoicesLesson({ earnReward }) {
  const [selected, setSelected] = useState([]);
  const budget = 10;
  const products = [
    { id: "lanche", icon: "🥪", name: "Lanche", price: 6 },
    { id: "caderno", icon: "📒", name: "Caderno", price: 5 },
    { id: "bola", icon: "⚽", name: "Bola", price: 9 },
    { id: "doce", icon: "🍭", name: "Doce", price: 3 },
  ];
  const spent = products
    .filter((product) => selected.includes(product.id))
    .reduce((sum, product) => sum + product.price, 0);

  const toggle = (product) => {
    const isSelected = selected.includes(product.id);
    if (!isSelected && spent + product.price > budget) return;
    const next = isSelected
      ? selected.filter((id) => id !== product.id)
      : [...selected, product.id];
    setSelected(next);
    if (next.length && spent + (isSelected ? -product.price : product.price) <= budget) {
      earnReward("budget-choice", 2);
    }
  };

  return (
    <section className="lesson page">
      <LessonHeader
        number="2"
        title="Escolhas espertas"
        text="Quando escolhemos uma coisa, às vezes precisamos deixar outra para depois."
        icon="💡"
        color="orange"
      />
      <section className="content-section story-section">
        <div className="speech-avatar">👧🏽</div>
        <div className="speech">
          <small>Uma história de escolha</small>
          <p>
            “Oi! Eu sou a <b>Lia</b>. Tenho <b>R$ 10</b> e fiz uma lista do que
            encontrei na lojinha. Você me ajuda a escolher sem gastar mais do
            que eu tenho?”
          </p>
        </div>
      </section>
      <Activity title="A lojinha da Lia" subtitle="Monte uma boa escolha">
        <div className="wallet">
          <span>👛</span>
          <p>
            Dinheiro da Lia <b>R$ {budget - spent}</b>
          </p>
          <div className="wallet-track">
            <i style={{ width: `${(spent / budget) * 100}%` }} />
          </div>
        </div>
        <div className="shop-grid">
          {products.map((product) => {
            const chosen = selected.includes(product.id);
            const unavailable = !chosen && spent + product.price > budget;
            return (
              <button
                key={product.id}
                className={chosen ? "chosen" : ""}
                onClick={() => toggle(product)}
                disabled={unavailable}
              >
                <span>{product.icon}</span>
                <b>{product.name}</b>
                <em>R$ {product.price}</em>
                <i>{chosen ? "✓ escolhido" : unavailable ? "não cabe" : "+ escolher"}</i>
              </button>
            );
          })}
        </div>
        <div className="choice-feedback">
          <span>{spent <= budget && selected.length ? "🎉" : "🧠"}</span>
          <p>
            <b>{selected.length ? "Sua escolha cabe no bolso!" : "Sua vez!"}</b>
            {selected.length
              ? ` Lia gastará R$ ${spent} e ainda terá R$ ${budget - spent}.`
              : " Escolha um ou mais itens. O total não pode passar de R$ 10."}
          </p>
        </div>
      </Activity>
      <div className="think-card">
        <span>💭</span>
        <p>
          <b>Pare, pense, escolha.</b> Uma boa escolha não é sempre a mais
          barata: é a que combina com o que precisamos e podemos pagar.
        </p>
      </div>
    </section>
  );
}

function DreamsLesson({ earnReward, name }) {
  const [saved, setSaved] = useState(0);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState([]);
  const goal = 20;

  const addCoin = () => {
    const next = Math.min(goal, saved + 2);
    setSaved(next);
    if (next === goal) earnReward("savings-goal", 3);
  };

  const chooseAnswer = (option) => {
    if (quizAnswers[quizIndex] !== undefined) return;
    const next = [...quizAnswers];
    next[quizIndex] = option;
    setQuizAnswers(next);
    if (option === quiz[quizIndex].answer) earnReward(`quiz-${quizIndex}`, 2);
  };

  return (
    <section className="lesson page">
      <LessonHeader
        number="3"
        title="Guardar para realizar"
        text="Um sonho fica mais perto quando ganha um plano e um pouquinho de paciência."
        icon="🐷"
        color="green"
      />
      <section className="content-section saving-story">
        <div>
          <div className="section-title">
            <span>03</span>
            <div>
              <small>Planeje</small>
              <h2>Um pouquinho de cada vez</h2>
            </div>
          </div>
          <p className="intro-text">
            Guardar não é esconder dinheiro para sempre. É escolher não gastar
            agora para usar em algo importante depois.
          </p>
          <ul className="mini-steps">
            <li><i>1</i><span><b>Escolha um sonho</b>Algo que você deseja realizar.</span></li>
            <li><i>2</i><span><b>Descubra o valor</b>Quanto será preciso guardar?</span></li>
            <li><i>3</i><span><b>Faça um plano</b>Guarde um pouco e acompanhe.</span></li>
          </ul>
        </div>
        <div className="dream-bubble">
          <span>🚲</span>
          <p>Meu sonho pode virar um plano!</p>
        </div>
      </section>

      <Activity title="Encha o cofrinho" subtitle="Cada moeda conta">
        <div className="piggy-game">
          <div className="piggy-wrap">
            <button
              className="falling-coin"
              onClick={addCoin}
              disabled={saved === goal}
              aria-label="Adicionar dois reais ao cofrinho"
            >
              + R$ 2
            </button>
            <div className={`piggy ${saved === goal ? "celebrate" : ""}`}>🐷</div>
            <small>Toque na moeda para guardar</small>
          </div>
          <div className="goal-panel">
            <span>Meta: uma mochila 🎒</span>
            <strong>R$ {saved} <small>de R$ {goal}</small></strong>
            <div className="goal-track">
              <i style={{ width: `${(saved / goal) * 100}%` }} />
            </div>
            <p>
              {saved === goal
                ? "Conseguiu! Paciência e constância levaram você até a meta."
                : `Faltam R$ ${goal - saved}. Continue!`}
            </p>
          </div>
        </div>
      </Activity>

      <Activity title="Desafio final" subtitle="Mostre o que descobriu">
        <div className="quiz">
          <div className="quiz-top">
            <span>Pergunta {quizIndex + 1} de {quiz.length}</span>
            <div>{quiz.map((_, index) => <i key={index} className={index <= quizIndex ? "active" : ""} />)}</div>
          </div>
          <h3>{quiz[quizIndex].question}</h3>
          <div className="quiz-options">
            {quiz[quizIndex].options.map((option, index) => {
              const answered = quizAnswers[quizIndex] !== undefined;
              const correct = quiz[quizIndex].answer === index;
              return (
                <button
                  key={option}
                  onClick={() => chooseAnswer(index)}
                  className={answered ? (correct ? "correct" : quizAnswers[quizIndex] === index ? "wrong" : "") : ""}
                  disabled={answered}
                >
                  <i>{String.fromCharCode(65 + index)}</i>{option}
                  {answered && correct && <span>✓</span>}
                </button>
              );
            })}
          </div>
          {quizAnswers[quizIndex] !== undefined && (
            <div className="quiz-feedback">
              <p>
                {quizAnswers[quizIndex] === quiz[quizIndex].answer
                  ? "⭐ Isso aí! Você pensou como um planejador."
                  : "Quase! Observe a resposta marcada em verde."}
              </p>
              {quizIndex < quiz.length - 1 ? (
                <button onClick={() => setQuizIndex(quizIndex + 1)}>Próxima pergunta →</button>
              ) : (
                <strong>Parabéns, {name || "explorador"}! Jornada concluída. 🎉</strong>
              )}
            </div>
          )}
        </div>
      </Activity>
    </section>
  );
}

function Activity({ title, subtitle, children }) {
  return (
    <section className="activity">
      <div className="activity-heading">
        <div className="activity-icon">✦</div>
        <div>
          <small>{subtitle}</small>
          <h2>{title}</h2>
        </div>
        <span>ATIVIDADE</span>
      </div>
      <div className="activity-body">{children}</div>
    </section>
  );
}

function BottomNavigation({ chapter, goTo, goNext }) {
  return (
    <footer className="bottom-nav">
      <button onClick={() => goTo(chapter - 1)} disabled={chapter === 0}>
        <span>←</span>
        <small>Voltar</small>
      </button>
      <div>
        {chapters.map((item, index) => (
          <button
            key={item.id}
            className={chapter === index ? "active" : ""}
            onClick={() => goTo(index)}
            aria-label={`Ir para ${item.shortTitle}`}
          />
        ))}
      </div>
      <button onClick={goNext} disabled={chapter === chapters.length - 1}>
        <small>Continuar</small>
        <span>→</span>
      </button>
    </footer>
  );
}

export default App;
