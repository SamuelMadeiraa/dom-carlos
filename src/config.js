/**
 * Bloco único de configuração da barbearia.
 *
 * Para adaptar o sistema a um cliente novo, é aqui que se mexe — o resto do
 * site lê tudo daqui (inclusive os textos de horário, que são montados a
 * partir de `expediente`, sem repetir hora em lugar nenhum).
 *
 * Cliente atual: Don Carlos Barbearia (São José/SC).
 */
export const CONFIG = {
  marca: { parte1: 'Don', parte2: 'Carlos', sub: 'Barbearia · Desde 2022' },
  tagline: 'Barbearia clássica · Atendimento por hora marcada',
  titulo: ['Corte de rei,', 'tratamento', 'de Don Carlos.'],
  /* qual pedaço do título recebe o destaque visual (índice do array acima) */
  tituloDestaque: 1,
  sub:
    'Navalha, toalha quente e acabamento no capricho. Escolha o serviço, o profissional e o horário — a cadeira já fica reservada no seu nome.',
  sobre:
    'Barbearia clássica no Sertão do Maruim desde 2022. Corte, barba e acabamento com a atenção que o serviço pede.',

  /* Endereço e cidade são opcionais: em branco, a seção some sozinha. */
  cidade: 'São José/SC',
  endereco: 'R. Cristina, R. José Mathias Zimmermann, 106',
  bairro: 'Sertão do Maruim · São José - SC · 88122-110',
  /* usado na busca do Google Maps (iframe e link do botão) */
  enderecoMapa:
    'R. Cristina, R. José Mathias Zimmermann, 106 - Sertão do Maruim, São José - SC, 88122-110',

  whatsappExibicao: '(48) 9662-2872',
  whatsappNumero: '554896622872', // internacional, só números
  instagram: 'doncarlos.barbearia', // vazio esconde o link

  pagamento: 'Dinheiro, Pix e cartão',
  toleranciaMin: 10,

  senhaAdmin: 'barber123',
  mostrarSenhaNaTela: true, // false ao entregar para o cliente

  chaveArmazenamento: 'doncarlos-pro-agendamentos-v1',
  intervaloMin: 30, // de quantos em quantos minutos abre horário

  /* [horaInicio, horaFim] ou null = fechado. 0 = domingo … 6 = sábado */
  expediente: { 0: null, 1: [9, 20], 2: [9, 20], 3: [9, 20], 4: [9, 20], 5: [9, 20], 6: [9, 17] },
}

export const SERVICOS = [
  {
    id: 'corte',
    nome: 'Corte Masculino',
    preco: 45,
    dur: 40,
    desc: 'Máquina, tesoura e acabamento na navalha. Inclui lavagem e finalização.',
    icone: 'tesoura',
  },
  {
    id: 'barba',
    nome: 'Barba Terapia',
    preco: 35,
    dur: 30,
    desc: 'Toalha quente, óleo, navalha e balm calmante. O ritual completo.',
    icone: 'navalha',
  },
  {
    id: 'combo',
    nome: 'Corte + Barba',
    preco: 70,
    dur: 70,
    desc: 'O combo da casa: corte completo mais barba terapia com desconto.',
    icone: 'coroa',
    destaque: true,
  },
  {
    id: 'infantil',
    nome: 'Corte Infantil',
    preco: 35,
    dur: 30,
    desc: 'Para os pequenos até 10 anos, com toda a paciência do mundo.',
    icone: 'pente',
  },
  {
    id: 'pezinho',
    nome: 'Pezinho / Sobrancelha',
    preco: 20,
    dur: 15,
    desc: 'Manutenção rápida do acabamento, pezinho e design de sobrancelha.',
    icone: 'poste',
  },
  {
    id: 'platinado',
    nome: 'Platinado',
    preco: 150,
    dur: 120,
    desc: 'Descoloração global com matização e tratamento pós-química.',
    icone: 'maquina',
  },
]

export const BARBEIROS = [
  {
    id: 'carlos',
    nome: 'Don Carlos',
    esp: 'Clássico & navalha',
    bio: 'Dono da casa. 6 anos de estrada, especialista em degradê e barba desenhada.',
  },
  {
    id: 'rafa',
    nome: 'Rafa',
    esp: 'Degradê & freestyle',
    bio: 'Mão leve na máquina. Referência em fade, navalhado e desenhos.',
  },
  {
    id: 'leo',
    nome: 'Léo',
    esp: 'Química & platinado',
    bio: 'Certificado em coloração. Cuida dos platinados e das barbas mais fechadas.',
  },
]

export const STATUS = {
  pend: { lbl: 'Pendente', cls: 'pend' },
  conf: { lbl: 'Confirmado', cls: 'conf' },
  concl: { lbl: 'Concluído', cls: 'concl' },
  canc: { lbl: 'Cancelado', cls: 'canc' },
}

/* Escala do ouro da marca, do mais claro ao mais queimado, para os gráficos. */
export const TONS = ['#f0d98a', '#e3c25c', '#c9a227', '#b08d1c', '#8a6d15', '#6f5810']

const DIAS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
const DIAS_CURTO = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

/**
 * Agrupa dias seguidos com o mesmo expediente: "Ter a Sex · 9h às 20h".
 * Os dias abertos vêm primeiro; os fechados fecham a lista.
 */
export function gruposExpediente() {
  const ordem = [1, 2, 3, 4, 5, 6, 0]
  const grupos = []

  ordem.forEach((d) => {
    const faixa = CONFIG.expediente[d]
    const texto = faixa ? `${faixa[0]}h às ${faixa[1]}h` : 'Fechado'
    const ultimo = grupos[grupos.length - 1]
    if (ultimo && ultimo.texto === texto) ultimo.dias.push(d)
    else grupos.push({ dias: [d], texto, aberto: !!faixa })
  })

  grupos.sort((a, b) => (b.aberto ? 1 : 0) - (a.aberto ? 1 : 0))

  return grupos.map((g) => ({
    aberto: g.aberto,
    texto: g.texto,
    label:
      g.dias.length === 1
        ? DIAS[g.dias[0]]
        : g.dias.length === 2
          ? `${DIAS_CURTO[g.dias[0]]} e ${DIAS_CURTO[g.dias[1]]}`
          : `${DIAS_CURTO[g.dias[0]]} a ${DIAS_CURTO[g.dias[g.dias.length - 1]]}`,
  }))
}

export const nomeMarca = () => `${CONFIG.marca.parte1} ${CONFIG.marca.parte2}`
export const servicoPor = (id) => SERVICOS.find((s) => s.id === id)
export const barbeiroPor = (id) => BARBEIROS.find((b) => b.id === id)

/* --------------------------------------------------------------- mapa */
/* O endereço só vira mapa se estiver preenchido — sem chave de API: o Google
   aceita a busca simples no iframe com `output=embed`. */
const buscaMapa = encodeURIComponent(CONFIG.enderecoMapa || '')
export const mapaEmbed = CONFIG.enderecoMapa
  ? `https://www.google.com/maps?q=${buscaMapa}&hl=pt-BR&z=17&output=embed`
  : ''
export const mapaLink = CONFIG.enderecoMapa
  ? `https://www.google.com/maps/search/?api=1&query=${buscaMapa}`
  : ''
