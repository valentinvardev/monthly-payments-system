import { cookies } from "next/headers";

export type Locale = "es" | "en" | "pt";

export const LOCALE_COOKIE = "studio_lang";

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const v = store.get(LOCALE_COOKIE)?.value;
  return v === "en" || v === "pt" ? v : "es";
}

// Textos de la landing. Las claves son las mismas en los tres idiomas y
// `t(locale)` devuelve el mapa entero, así los componentes leen `s.heroTitle`.
//
// Voz: SurCodia es el servicio y Valentín quien lo hace, en primera persona
// del singular. Nunca "agencia", "equipo" ni "hacemos páginas web": lo que se
// vende es lo que cambia en la operación del cliente. Sin guiones largos.
const STRINGS = {
  es: {
    navService: "Servicio",
    navMethod: "Cómo trabajo",
    navCases: "Casos",
    navContact: "Contacto",
    navClients: "Acceso clientes",
    navPanel: "Mi panel",

    heroRole: "Product engineer en",
    heroTitle: "Encuentro dónde tu empresa pierde tiempo o plata, y construyo la solución.",
    heroSub:
      "SurCodia es cómo trabajo con empresas: entro a tu operación, mido cómo funciona de verdad y la mejoro con software e IA.",
    heroCta: "Pedir un diagnóstico",
    heroCtaB: "Ver casos",
    heroOffer: "Empieza con un diagnóstico corto: una reunión y tres mejoras con impacto.",

    diagTitle: "Así se ve un diagnóstico",
    diagCompany: "Distribuidora mayorista, 40 personas",
    diag1Area: "Pedidos por WhatsApp",
    diag1Finding: "Se cargan a mano al sistema, uno por uno.",
    diag1Impact: "18 h por mes",
    diag2Area: "Cobranzas",
    diag2Finding: "Los recordatorios salen cuando alguien se acuerda.",
    diag2Impact: "+9 % en fecha",
    diag3Area: "Presupuestos",
    diag3Finding: "Tardan tres días y dependen de una sola persona.",
    diag3Impact: "de 3 días a 4 h",
    diagNote: "Es un ejemplo. El tuyo sale de tu operación real.",

    serviceEyebrow: "Qué cambia",
    serviceTitle: "Lo que cambia en tu empresa.",
    serviceIntro:
      "Cada trabajo empieza por un número: cuántas horas, cuánta plata o cuántos errores cuesta hoy un proceso. Y termina cuando ese número se movió.",
    outcome1Title: "Reducir costos",
    outcome1Body:
      "Encuentro el trabajo manual que no hace falta y lo saco del medio. Las horas vuelven a lo que sí importa.",
    outcome2Title: "Mejorar la rentabilidad",
    outcome2Body:
      "Cobros atrasados, errores de carga, descuentos sin control. Plata que se escapa sin que nadie la vea: la mido y la recupero.",
    outcome3Title: "Automatizar procesos",
    outcome3Body:
      "Lo repetitivo pasa a hacerse solo, con IA donde rinde y una persona revisando lo que importa.",
    outcome4Title: "Resolver cuellos de botella",
    outcome4Body:
      "Encuentro el paso donde todo espera, con datos y no con intuición, y lo destrabo.",

    methodEyebrow: "Cómo trabajo",
    methodTitle: "Primero mido. Después construyo.",
    methodStart: "Empezá acá",
    step1Title: "Diagnóstico corto",
    step1Body:
      "Una reunión sobre tu operación y tres mejoras con impacto, ordenadas por lo que valen. Es el punto de partida y no te compromete a nada más.",
    step2Title: "Prueba piloto",
    step2Body:
      "Tomo una mejora y la pongo a andar al lado de lo que ya tenés, sin frenar nada, y comparo las dos con números.",
    step3Title: "Puesta en marcha",
    step3Body: "Lo que funcionó pasa a producción de a poco, con tu gente preparada para usarlo.",
    step4Title: "Traspaso",
    step4Body:
      "Te quedás con el proceso, la documentación y el registro de cada paso. No dependés de mí para operar.",
    methodCta: "Empezar por el diagnóstico",

    casesEyebrow: "Casos",
    casesTitle: "Dos operaciones reales.",
    caseCta: "Ver el caso",
    caseHalleyTag: "Halley Audiovisual",
    caseHalleyTitle: "Cobrarle a 2.000 familias sin perseguir a ninguna.",
    caseHalleyBody:
      "Una productora de egresados con 27 colegios y planes de cuotas de dos o tres años. Construí el sistema para que la cobranza, la conciliación de pagos y la entrega del material corran solas.",
    caseHalleyF1: "colegios",
    caseHalleyV2: "~2.000",
    caseHalleyF2: "estudiantes",
    caseHalleyF3: "medios de pago",
    caseSsTag: "Stealth Seller",
    caseSsTitle: "Un producto que crece al ritmo de lo que piden sus usuarios.",
    caseSsBody:
      "Plataforma de investigación de productos para revendedores de Amazon. Trabajo ahí como product engineer: entiendo cómo decide el vendedor y lo convierto en funciones nuevas en días, con agentes de IA en el desarrollo.",
    caseSsF1: "tiendas por cuenta, como máximo",
    caseSsV2: "IA",
    caseSsF2: "ganancia y ROI",
    caseSsV3: "Stock",
    caseSsF3: "en retailers",

    projectsEyebrow: "Otros productos",
    projectsTitle: "Productos que construí de punta a punta.",
    projectsVisit: "Visitar",
    drawerHighlights: "Puntos clave",
    drawerStack: "Stack",
    drawerCode: "Código",

    aboutEyebrow: "Quién hace el trabajo",
    aboutTitle: "Con quién vas a trabajar.",
    aboutP1:
      "Soy Valentín Varela, ingeniero de software con mirada de negocio. Trabajo como product engineer en Stealth Seller, y con SurCodia hago lo mismo para empresas: entro a la operación, encuentro dónde se pierde tiempo o plata, y construyo la solución.",
    aboutP2:
      "No hay intermediarios. Quien hace el diagnóstico es quien escribe el código y te lo entrega funcionando.",
    aboutCta: "Conocé más sobre mí",

    contactEyebrow: "Contacto",
    contactTitle: "¿Qué proceso te está costando más?",
    contactSub:
      "Pedí el diagnóstico: una reunión y tres mejoras con impacto. Te respondo en el día.",

    footerLogin: "Acceso clientes",
    footerRights: "Hecho en el sur",
  },
  en: {
    navService: "Service",
    navMethod: "How I work",
    navCases: "Case studies",
    navContact: "Contact",
    navClients: "Client login",
    navPanel: "My panel",

    heroRole: "Product engineer at",
    heroTitle: "I find where your company loses time or money, and I build the fix.",
    heroSub:
      "SurCodia is how I work with companies: I step into your operation, measure how it really runs and improve it with software and AI.",
    heroCta: "Request a diagnosis",
    heroCtaB: "See case studies",
    heroOffer: "It starts with a short diagnosis: one meeting and three improvements with real impact.",

    diagTitle: "What a diagnosis looks like",
    diagCompany: "Wholesale distributor, 40 people",
    diag1Area: "WhatsApp orders",
    diag1Finding: "Typed into the system by hand, one by one.",
    diag1Impact: "18 h a month",
    diag2Area: "Collections",
    diag2Finding: "Reminders go out when someone remembers.",
    diag2Impact: "+9% on time",
    diag3Area: "Quotes",
    diag3Finding: "They take three days and depend on one person.",
    diag3Impact: "3 days to 4 h",
    diagNote: "This is an example. Yours comes from your real operation.",

    serviceEyebrow: "What changes",
    serviceTitle: "What changes in your company.",
    serviceIntro:
      "Every job starts with a number: how many hours, how much money or how many errors a process costs today. It ends when that number has moved.",
    outcome1Title: "Cut costs",
    outcome1Body:
      "I find the manual work nobody needs and take it out of the way. The hours go back to what matters.",
    outcome2Title: "Improve profitability",
    outcome2Body:
      "Late collections, entry errors, discounts nobody controls. Money that leaks without anyone seeing it: I measure it and win it back.",
    outcome3Title: "Automate processes",
    outcome3Body:
      "The repetitive work runs on its own, with AI where it pays off and a person reviewing what matters.",
    outcome4Title: "Clear bottlenecks",
    outcome4Body:
      "I find the step where everything waits, with data rather than hunches, and unblock it.",

    methodEyebrow: "How I work",
    methodTitle: "First I measure. Then I build.",
    methodStart: "Start here",
    step1Title: "Short diagnosis",
    step1Body:
      "One meeting about your operation and three improvements with real impact, ranked by what they are worth. It is the starting point and commits you to nothing else.",
    step2Title: "Pilot",
    step2Body:
      "I take one improvement and run it alongside what you already have, without stopping anything, and compare the two with numbers.",
    step3Title: "Rollout",
    step3Body: "What worked goes live gradually, with your people ready to run it.",
    step4Title: "Handover",
    step4Body:
      "You keep the process, the documentation and a record of every step. You don't depend on me to operate it.",
    methodCta: "Start with the diagnosis",

    casesEyebrow: "Case studies",
    casesTitle: "Two real operations.",
    caseCta: "Read the case (in Spanish)",
    caseHalleyTag: "Halley Audiovisual",
    caseHalleyTitle: "Collecting from 2,000 families without chasing a single one.",
    caseHalleyBody:
      "A graduation-video producer working with 27 schools and instalment plans of two or three years. I built the system so collections, payment matching and the release of the final material run on their own.",
    caseHalleyF1: "schools",
    caseHalleyV2: "~2,000",
    caseHalleyF2: "students",
    caseHalleyF3: "payment methods",
    caseSsTag: "Stealth Seller",
    caseSsTitle: "A product that grows at the pace its users ask for.",
    caseSsBody:
      "A product research platform for Amazon resellers. I work there as a product engineer: I learn how a seller decides and turn it into new features in days, with AI agents in the development workflow.",
    caseSsF1: "stores per account, at most",
    caseSsV2: "AI",
    caseSsF2: "profit and ROI",
    caseSsV3: "Stock",
    caseSsF3: "at retailers",

    projectsEyebrow: "Other products",
    projectsTitle: "Products I built end to end.",
    projectsVisit: "Visit",
    drawerHighlights: "Highlights",
    drawerStack: "Stack",
    drawerCode: "Code",

    aboutEyebrow: "Who does the work",
    aboutTitle: "Who you'll work with.",
    aboutP1:
      "I'm Valentín Varela, a software engineer with a business eye. I work as a product engineer at Stealth Seller, and with SurCodia I do the same for companies: I step into the operation, find where time or money is lost, and build the fix.",
    aboutP2:
      "No middlemen. The person who runs the diagnosis is the one who writes the code and hands it over working.",
    aboutCta: "More about me",

    contactEyebrow: "Contact",
    contactTitle: "Which process is costing you the most?",
    contactSub:
      "Request the diagnosis: one meeting and three improvements with real impact. I reply the same day.",

    footerLogin: "Client login",
    footerRights: "Made in the south",
  },
  pt: {
    navService: "Serviço",
    navMethod: "Como trabalho",
    navCases: "Casos",
    navContact: "Contato",
    navClients: "Acesso de clientes",
    navPanel: "Meu painel",

    heroRole: "Product engineer na",
    heroTitle: "Encontro onde sua empresa perde tempo ou dinheiro, e construo a solução.",
    heroSub:
      "A SurCodia é como eu trabalho com empresas: entro na sua operação, meço como ela funciona de verdade e melhoro com software e IA.",
    heroCta: "Pedir um diagnóstico",
    heroCtaB: "Ver casos",
    heroOffer: "Começa com um diagnóstico curto: uma reunião e três melhorias com impacto.",

    diagTitle: "Assim é um diagnóstico",
    diagCompany: "Distribuidora atacadista, 40 pessoas",
    diag1Area: "Pedidos por WhatsApp",
    diag1Finding: "São digitados à mão no sistema, um por um.",
    diag1Impact: "18 h por mês",
    diag2Area: "Cobrança",
    diag2Finding: "Os lembretes saem quando alguém lembra.",
    diag2Impact: "+9 % em dia",
    diag3Area: "Orçamentos",
    diag3Finding: "Levam três dias e dependem de uma só pessoa.",
    diag3Impact: "de 3 dias para 4 h",
    diagNote: "É um exemplo. O seu vem da sua operação real.",

    serviceEyebrow: "O que muda",
    serviceTitle: "O que muda na sua empresa.",
    serviceIntro:
      "Todo trabalho começa com um número: quantas horas, quanto dinheiro ou quantos erros um processo custa hoje. E termina quando esse número muda.",
    outcome1Title: "Reduzir custos",
    outcome1Body:
      "Encontro o trabalho manual que não precisa existir e tiro do caminho. As horas voltam para o que importa.",
    outcome2Title: "Melhorar a rentabilidade",
    outcome2Body:
      "Cobranças atrasadas, erros de digitação, descontos sem controle. Dinheiro que escapa sem ninguém ver: eu meço e recupero.",
    outcome3Title: "Automatizar processos",
    outcome3Body:
      "O repetitivo passa a rodar sozinho, com IA onde rende e uma pessoa revisando o que importa.",
    outcome4Title: "Resolver gargalos",
    outcome4Body:
      "Encontro a etapa onde tudo espera, com dados e não com intuição, e destravo.",

    methodEyebrow: "Como trabalho",
    methodTitle: "Primeiro eu meço. Depois construo.",
    methodStart: "Comece aqui",
    step1Title: "Diagnóstico curto",
    step1Body:
      "Uma reunião sobre a sua operação e três melhorias com impacto, ordenadas pelo que valem. É o ponto de partida e não compromete você com mais nada.",
    step2Title: "Piloto",
    step2Body:
      "Pego uma melhoria e coloco para rodar ao lado do que você já tem, sem parar nada. A comparação é feita com números.",
    step3Title: "Implantação",
    step3Body: "O que funcionou entra em produção aos poucos, com o seu pessoal preparado para usar.",
    step4Title: "Entrega",
    step4Body:
      "Você fica com o processo, a documentação e o registro de cada etapa. Não depende de mim para operar.",
    methodCta: "Começar pelo diagnóstico",

    casesEyebrow: "Casos",
    casesTitle: "Duas operações reais.",
    caseCta: "Ver o caso (em espanhol)",
    caseHalleyTag: "Halley Audiovisual",
    caseHalleyTitle: "Cobrar 2.000 famílias sem correr atrás de nenhuma.",
    caseHalleyBody:
      "Uma produtora de formaturas com 27 escolas e planos de parcelas de dois ou três anos. Construí o sistema para que a cobrança, a conciliação dos pagamentos e a entrega do material rodem sozinhas.",
    caseHalleyF1: "escolas",
    caseHalleyV2: "~2.000",
    caseHalleyF2: "estudantes",
    caseHalleyF3: "meios de pagamento",
    caseSsTag: "Stealth Seller",
    caseSsTitle: "Um produto que cresce no ritmo do que os usuários pedem.",
    caseSsBody:
      "Plataforma de pesquisa de produtos para revendedores da Amazon. Trabalho lá como product engineer: entendo como o vendedor decide e transformo isso em funcionalidades novas em dias, com agentes de IA no desenvolvimento.",
    caseSsF1: "lojas por conta, no máximo",
    caseSsV2: "IA",
    caseSsF2: "lucro e ROI",
    caseSsV3: "Estoque",
    caseSsF3: "nos varejistas",

    projectsEyebrow: "Outros produtos",
    projectsTitle: "Produtos que construí de ponta a ponta.",
    projectsVisit: "Visitar",
    drawerHighlights: "Destaques",
    drawerStack: "Stack",
    drawerCode: "Código",

    aboutEyebrow: "Quem faz o trabalho",
    aboutTitle: "Com quem você vai trabalhar.",
    aboutP1:
      "Sou Valentín Varela, engenheiro de software com olhar de negócio. Trabalho como product engineer na Stealth Seller, e com a SurCodia faço o mesmo para empresas: entro na operação, encontro onde se perde tempo ou dinheiro, e construo a solução.",
    aboutP2:
      "Sem intermediários. Quem faz o diagnóstico é quem escreve o código e entrega funcionando.",
    aboutCta: "Saiba mais sobre mim",

    contactEyebrow: "Contato",
    contactTitle: "Qual processo está custando mais caro?",
    contactSub:
      "Peça o diagnóstico: uma reunião e três melhorias com impacto. Respondo no mesmo dia.",

    footerLogin: "Acesso de clientes",
    footerRights: "Feito no sul",
  },
} as const;

export type StudioStrings = Record<keyof (typeof STRINGS)["es"], string>;

export function t(locale: Locale): StudioStrings {
  return STRINGS[locale];
}
