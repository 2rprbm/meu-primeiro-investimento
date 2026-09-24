export const tenant = {
  brandName: "Meu Primeiro Investimento",
  partnerName: "Escola Sementinha",
  partnerLabel: "uma jornada com",
  initials: "ES",
  colors: {
    primary: "#1f5c4a",
    secondary: "#d7653b",
    accent: "#e6a825",
  },
};

export const yearChapters = [
  {
    id: "primeiros-passos",
    title: "Primeiros passos",
    subtitle: "Dinheiro, escolhas e cuidado",
    icon: "🌱",
    color: "#72a96b",
    classes: [1, 2, 3, 4, 5, 6],
  },
  {
    id: "escolhas",
    title: "Escolhas conscientes",
    subtitle: "Necessidades, desejos e prioridades",
    icon: "🧭",
    color: "#e5a52e",
    classes: [7, 8, 9, 10, 11, 12],
  },
  {
    id: "planejar",
    title: "Planejar e guardar",
    subtitle: "Metas, tempo e pequenos planos",
    icon: "🏕️",
    color: "#d86a42",
    classes: [13, 14, 15, 16, 17, 18],
  },
  {
    id: "comunidade",
    title: "Nossa comunidade",
    subtitle: "Trabalho, cooperação e projetos",
    icon: "🏘️",
    color: "#4c8cac",
    classes: [19, 20, 21, 22, 23, 24],
  },
  {
    id: "empreender",
    title: "Pequenos empreendedores",
    subtitle: "Ideias, custos e organização",
    icon: "🛠️",
    color: "#80639d",
    classes: [25, 26, 27, 28, 29, 30],
  },
  {
    id: "conquista",
    title: "A grande conquista",
    subtitle: "Projeto final e celebração",
    icon: "🏆",
    color: "#c58b22",
    classes: [31, 32, 33, 34, 35, 36],
  },
];

export const availableClasses = [
  {
    number: 1,
    title: "O mistério das moedas",
    description: "Descubra para que serve o dinheiro e como fazer escolhas.",
    icon: "🪙",
    lessons: [
      { id: "dinheiro", title: "Para que serve o dinheiro?", icon: "🔎", minutes: 10 },
      { id: "preciso-quero", title: "Preciso ou quero?", icon: "⚖️", minutes: 10 },
      { id: "escolhas", title: "Escolhas espertas", icon: "💡", minutes: 12 },
      { id: "guardar", title: "Guardar para realizar", icon: "🐷", minutes: 12 },
    ],
  },
  {
    number: 2,
    title: "De onde vêm as coisas?",
    description: "Conheça o trabalho, o caminho dos produtos e o valor do cuidado.",
    icon: "🥖",
    lessons: [
      { id: "trabalho", title: "Dinheiro vem do trabalho", icon: "🧑‍🍳", minutes: 10 },
      { id: "caminho-pao", title: "A viagem do pão", icon: "🌾", minutes: 10 },
      { id: "cuidar", title: "Cuidar também economiza", icon: "🧸", minutes: 10 },
      { id: "missao-casa", title: "Missão em família", icon: "🏠", minutes: 12 },
    ],
  },
];

export const shopItems = [
  { id: "coroa-folhas", name: "Coroa de folhas", slot: "head", icon: "🌿", price: 15 },
  { id: "elmo-bronze", name: "Elmo de bronze", slot: "head", icon: "🪖", price: 30 },
  { id: "coroa-real", name: "Coroa real", slot: "head", icon: "👑", price: 55 },
  { id: "capa-verde", name: "Capa da floresta", slot: "body", icon: "🧥", price: 20 },
  { id: "armadura", name: "Armadura solar", slot: "body", icon: "🛡️", price: 45 },
  { id: "botas", name: "Botas ligeiras", slot: "feet", icon: "🥾", price: 20 },
  { id: "colar", name: "Colar da coragem", slot: "neck", icon: "📿", price: 25 },
  { id: "anel", name: "Anel do planejamento", slot: "hand", icon: "💍", price: 60 },
];
