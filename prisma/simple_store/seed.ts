import { config } from 'dotenv';
config({ path: '.env.dev', override: false });
config({ path: '.env',     override: false });

import {
  PrismaClient,
  DiscountType,
  OrderStatus,
  ProductType,
  Level,
  FormatType,
} from '../../src/generated/simple-store';
import { PrismaPg } from '@prisma/adapter-pg';

const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL manquant — vérifie ton .env.dev');

const schema = new URL(url).searchParams.get('schema') ?? undefined;
const adapter = new PrismaPg({ connectionString: url }, schema ? { schema } : undefined);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding Simple Store — Formations & Livres…');

  const [catAngular, catNestJS, catTypeScript, catArchitecture, catPerf, catBonus] =
    await Promise.all([
      prisma.category.upsert({ where: { slug: 'angular' }, update: {}, create: { name: 'Angular', slug: 'angular', icon: '🔺', description: 'Le framework front-end de Google', position: 1 } }),
      prisma.category.upsert({ where: { slug: 'nestjs' }, update: {}, create: { name: 'NestJS', slug: 'nestjs', icon: '🐈', description: 'API Node.js scalable et structurée', position: 2 } }),
      prisma.category.upsert({ where: { slug: 'typescript' }, update: {}, create: { name: 'TypeScript', slug: 'typescript', icon: '🔷', description: 'JavaScript avec les super-pouvoirs', position: 3 } }),
      prisma.category.upsert({ where: { slug: 'architecture' }, update: {}, create: { name: 'Architecture', slug: 'architecture', icon: '🏛️', description: 'Clean Architecture, DDD, patterns avancés', position: 4 } }),
      prisma.category.upsert({ where: { slug: 'performance' }, update: {}, create: { name: 'Performance Web', slug: 'performance', icon: '⚡', description: 'SSR, Core Web Vitals, optimisation', position: 5 } }),
      prisma.category.upsert({ where: { slug: 'bonus' }, update: {}, create: { name: 'Bonus & Guides', slug: 'bonus', icon: '🎁', description: 'Guides PDF et ressources pratiques', position: 6 } }),
    ]);
  console.log('✅ 6 catégories');

  const p1 = await prisma.product.upsert({
    where: { slug: 'angular-19-guide-ultime' }, update: {},
    create: {
      name: 'Angular 19 — Le Guide Ultime', slug: 'angular-19-guide-ultime',
      shortDesc: 'Le livre de référence pour maîtriser Angular 19 de A à Z.',
      description: 'Plus de 600 pages couvrant tout Angular 19 : Standalone Components, Signals, SSR, State Management, tests, performances et déploiement.',
      price: 4900, originalPrice: 6900,
      imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80',
      author: 'Jean Moket', level: Level.ALL_LEVELS, type: ProductType.BOOK, isDigital: true,
      totalPages: 620,
      includes: ['PDF HD + EPUB', 'Mises à jour incluses', 'Projets sources GitHub', 'Accès Discord communauté'],
      tags: ['angular', 'signals', 'ssr', 'standalone', 'rxjs'],
      rating: 4.9, reviewCount: 214, salesCount: 1840,
      isFeatured: true, isBestseller: true, categoryId: catAngular.id,
      formats: { create: [
        { type: FormatType.PDF,           label: 'PDF + EPUB',                 priceAdjustment: 0,    isDefault: true },
        { type: FormatType.PHYSICAL,      label: 'Version papier',             priceAdjustment: 3000 },
        { type: FormatType.BUNDLE_FORMAT, label: 'PDF + Papier + Discord VIP', priceAdjustment: 5000 },
      ]},
    },
  });

  const p2 = await prisma.product.upsert({
    where: { slug: 'ssr-performance-angular' }, update: {},
    create: {
      name: 'SSR & Performance Angular', slug: 'ssr-performance-angular',
      shortDesc: 'Maîtrisez Angular Universal, l\'hydration partielle et les Core Web Vitals.',
      description: 'Formation complète sur le rendu côté serveur avec Angular 19. Hydration partielle, @defer, TransferState, optimisation LCP/CLS/FID.',
      price: 5900,
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
      author: 'Jean Moket', level: Level.ADVANCED, type: ProductType.FORMATION, isDigital: true,
      duration: '14h30', totalChapters: 42,
      includes: ['Accès à vie', 'Mises à jour incluses', 'Projet fil rouge', 'Certificat', 'Discord'],
      tags: ['ssr', 'angular-universal', 'performance', 'hydration'],
      rating: 4.8, reviewCount: 96, salesCount: 720,
      isFeatured: true, isNew: true, categoryId: catPerf.id,
      formats: { create: [
        { type: FormatType.VIDEO,         label: 'Accès vidéo à vie',           priceAdjustment: 0,    isDefault: true },
        { type: FormatType.BUNDLE_FORMAT, label: 'Vidéo + PDF récap + Sources', priceAdjustment: 2000 },
      ]},
    },
  });

  const p3 = await prisma.product.upsert({
    where: { slug: 'nestjs-api-rest-zero-to-hero' }, update: {},
    create: {
      name: 'NestJS — API REST de A à Z', slug: 'nestjs-api-rest-zero-to-hero',
      shortDesc: 'Construisez une API production-ready avec NestJS, Prisma et PostgreSQL.',
      description: 'Formation pratique : architecture modulaire NestJS, Prisma 7, JWT, rôles, Stripe, Docker, CI/CD GitHub Actions.',
      price: 4900, originalPrice: 6500,
      imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
      author: 'Jean Moket', level: Level.INTERMEDIATE, type: ProductType.FORMATION, isDigital: true,
      duration: '12h00', totalChapters: 38,
      includes: ['Accès à vie', 'Code source complet', 'Certificat', 'Support email 30j'],
      tags: ['nestjs', 'prisma', 'postgresql', 'jwt', 'docker', 'stripe'],
      rating: 4.7, reviewCount: 143, salesCount: 980,
      isFeatured: true, isBestseller: true, categoryId: catNestJS.id,
      formats: { create: [
        { type: FormatType.VIDEO, label: 'Accès vidéo à vie', priceAdjustment: 0, isDefault: true },
      ]},
    },
  });

  const p4 = await prisma.product.upsert({
    where: { slug: 'typescript-avance' }, update: {},
    create: {
      name: 'TypeScript Avancé — Maîtrisez le type system', slug: 'typescript-avance',
      shortDesc: 'Generics, Utility Types, Template Literal, Conditional Types… enfin expliqués clairement.',
      description: 'Guide PDF de 120 pages couvrant le type system TypeScript en profondeur. Exemples concrets tirés de projets Angular réels.',
      price: 1900,
      imageUrl: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&q=80',
      author: 'Jean Moket', level: Level.INTERMEDIATE, type: ProductType.GUIDE, isDigital: true,
      totalPages: 120,
      includes: ['PDF HD', 'Cheat sheet TypeScript', 'Exercices corrigés'],
      tags: ['typescript', 'generics', 'utility-types', 'type-system'],
      rating: 4.6, reviewCount: 67, salesCount: 430, categoryId: catTypeScript.id,
      formats: { create: [
        { type: FormatType.PDF, label: 'PDF HD', priceAdjustment: 0, isDefault: true },
      ]},
    },
  });

  const p5 = await prisma.product.upsert({
    where: { slug: 'architecture-angular-entreprise' }, update: {},
    create: {
      name: 'Architecture Angular en Entreprise', slug: 'architecture-angular-entreprise',
      shortDesc: 'Scalabilité, monorepo, micro-frontends : construisez des apps qui tiennent dans la durée.',
      description: 'Formation + livre : Clean Architecture, DDD, Module Federation, Nx monorepo, tests. Retours d\'expérience de missions en grands groupes.',
      price: 12900, originalPrice: 16900,
      imageUrl: 'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=800&q=80',
      author: 'Jean Moket', level: Level.ADVANCED, type: ProductType.BUNDLE, isDigital: true,
      duration: '18h00', totalChapters: 54, totalPages: 280,
      includes: ['Formation vidéo 18h', 'Livre PDF 280p', 'Templates Nx', 'Accès à vie', 'Certificat', 'Discord VIP'],
      tags: ['architecture', 'ddd', 'nx', 'module-federation', 'clean-arch', 'angular'],
      rating: 4.9, reviewCount: 58, salesCount: 310,
      isFeatured: true, categoryId: catArchitecture.id,
      formats: { create: [
        { type: FormatType.BUNDLE_FORMAT, label: 'Formation + Livre (tout inclus)', priceAdjustment: 0,     isDefault: true },
        { type: FormatType.VIDEO,         label: 'Formation vidéo seule',           priceAdjustment: -4000 },
        { type: FormatType.PDF,           label: 'Livre PDF seul',                  priceAdjustment: -9000 },
      ]},
    },
  });

  const p6 = await prisma.product.upsert({
    where: { slug: 'migration-angularjs-angular' }, update: {},
    create: {
      name: 'Migration AngularJS → Angular — Le Guide Terrain', slug: 'migration-angularjs-angular',
      shortDesc: 'Stratégie, pièges à éviter et retours d\'expérience réels sur des migrations en prod.',
      description: 'Guide PDF basé sur des migrations réelles : NgUpgrade, routing hybride, tests pendant la migration. Tout ce que la doc officielle ne dit pas.',
      price: 2900,
      imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80',
      author: 'Jean Moket', level: Level.INTERMEDIATE, type: ProductType.GUIDE, isDigital: true,
      totalPages: 95,
      includes: ['PDF HD', 'Checklist de migration', 'Script d\'audit AngularJS', 'Mises à jour'],
      tags: ['angularjs', 'migration', 'ngupgrade', 'angular'],
      rating: 4.8, reviewCount: 39, salesCount: 215,
      isNew: true, categoryId: catAngular.id,
      formats: { create: [
        { type: FormatType.PDF, label: 'PDF HD', priceAdjustment: 0, isDefault: true },
      ]},
    },
  });

  const p7 = await prisma.product.upsert({
    where: { slug: 'signals-state-management-angular' }, update: {},
    create: {
      name: 'Signals & State Management Angular', slug: 'signals-state-management-angular',
      shortDesc: 'Quand utiliser Signals, NgRx, NGXS ou une simple façade ? Enfin une réponse claire.',
      description: 'Formation vidéo : Signals vs RxJS vs NgRx, migration depuis NgRx vers Signals, tests. Exemples sur une app e-commerce complète.',
      price: 3900,
      imageUrl: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80',
      author: 'Jean Moket', level: Level.INTERMEDIATE, type: ProductType.FORMATION, isDigital: true,
      duration: '8h45', totalChapters: 27,
      includes: ['Accès à vie', 'Code source', 'Certificat'],
      tags: ['signals', 'ngrx', 'state-management', 'rxjs', 'angular'],
      rating: 4.7, reviewCount: 81, salesCount: 540, categoryId: catAngular.id,
      formats: { create: [
        { type: FormatType.VIDEO,         label: 'Accès vidéo à vie',       priceAdjustment: 0,    isDefault: true },
        { type: FormatType.BUNDLE_FORMAT, label: 'Vidéo + Guide PDF récap', priceAdjustment: 1000 },
      ]},
    },
  });

  const p8 = await prisma.product.upsert({
    where: { slug: 'angular-nestjs-stack-complete' }, update: {},
    create: {
      name: 'Angular + NestJS — Stack Complète', slug: 'angular-nestjs-stack-complete',
      shortDesc: 'Le pack ultime : front Angular 19 + API NestJS + déploiement. Du zéro au prod.',
      description: 'Le pack le plus complet du catalogue. Angular 19 SSR + NestJS + Prisma + Stripe + Docker + CI/CD. 40h de contenu, 3 certifications.',
      price: 19900, originalPrice: 29700,
      imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80',
      author: 'Jean Moket', level: Level.ALL_LEVELS, type: ProductType.BUNDLE, isDigital: true,
      duration: '40h00', totalChapters: 120,
      includes: ['Angular 19 (14h)', 'NestJS (12h)', 'SSR & Perf (14h)', 'Tous les projets sources', 'Accès à vie', '3 certificats', 'Discord VIP'],
      tags: ['angular', 'nestjs', 'fullstack', 'ssr', 'stripe', 'docker'],
      rating: 5.0, reviewCount: 22, salesCount: 88,
      isFeatured: true, isNew: true, categoryId: catArchitecture.id,
      formats: { create: [
        { type: FormatType.BUNDLE_FORMAT, label: 'Pack complet — tout inclus', priceAdjustment: 0, isDefault: true },
      ]},
    },
  });

  const products = [p1, p2, p3, p4, p5, p6, p7, p8];
  console.log(`✅ ${products.length} produits`);

  // Reviews
  const reviewData = [
    { productId: p1.id, reviews: [
      { authorName: 'Karim B.', authorTitle: 'Tech Lead chez BNP Paribas', rating: 5, title: 'La référence absolue', body: 'J\'ai lu beaucoup de livres Angular. Celui-ci est de loin le plus complet et le plus à jour. Les exemples sur les Signals et le SSR sont excellents.', isVerified: true },
      { authorName: 'Sophie L.', authorTitle: 'Senior Dev Angular', rating: 5, title: 'Idéal pour passer au niveau supérieur', body: 'La section architecture m\'a vraiment ouvert les yeux. Très bien écrit, jamais ennuyeux.', isVerified: true },
      { authorName: 'Thomas R.', authorTitle: 'Développeur Fullstack', rating: 4, title: 'Très bon, quelques coquilles', body: 'Contenu excellent sur le fond. Quelques petites coquilles dans les exemples de code mais rien de bloquant.', isVerified: true },
    ]},
    { productId: p2.id, reviews: [
      { authorName: 'Amina D.', authorTitle: 'Lead Dev chez Société Générale', rating: 5, title: 'LCP passé de 4.2s à 0.9s', body: 'J\'ai appliqué les techniques sur notre app Angular interne. LCP divisé par 4, TBT amélioré de 80%. Mon manager était bluffé.', isVerified: true },
      { authorName: 'Lucas M.', authorTitle: 'Freelance Angular', rating: 5, title: 'Meilleure formation SSR du marché', body: 'La partie sur l\'hydration partielle et @defer est une révélation. Rien d\'aussi complet ailleurs.', isVerified: true },
      { authorName: 'Yuki T.', authorTitle: 'Développeur Angular 6 ans XP', rating: 4, title: 'Top mais points manquants sur edge', body: 'Très bien pour la théorie. J\'aurais aimé plus de contenu sur Cloudflare Workers. Le reste est parfait.', isVerified: false },
    ]},
    { productId: p3.id, reviews: [
      { authorName: 'Pierre G.', authorTitle: 'CTO d\'une startup SaaS', rating: 5, title: 'On a refait toute notre API avec', body: 'On venait d\'Express sans structure. Avec cette formation, on a migré vers NestJS en 3 semaines.', isVerified: true },
      { authorName: 'Sarah K.', authorTitle: 'Développeuse Backend Node.js', rating: 5, title: 'Prisma 7 bien couvert', body: 'Tout est à jour. La partie sur les adapters et le multi-schéma est particulièrement utile.', isVerified: true },
      { authorName: 'Marc D.', authorTitle: 'Freelance Full-stack', rating: 4, title: 'Très bon rapport qualité/prix', body: 'Formation dense et pratique. La partie Stripe est excellente. Les tests mériteraient plus de contenu.', isVerified: true },
    ]},
    { productId: p4.id, reviews: [
      { authorName: 'Léa F.', authorTitle: 'Angular Dev 2 ans XP', rating: 5, title: 'Enfin les generics expliqués clairement', body: 'Ce guide m\'a tout déblocqué en une soirée. Les exercices corrigés sont indispensables.', isVerified: true },
      { authorName: 'Romain H.', authorTitle: 'Tech Lead TypeScript', rating: 5, title: 'La cheat sheet seule vaut le prix', body: 'Contenu très dense pour le prix. Les Conditional Types et Template Literals enfin maîtrisés.', isVerified: false },
      { authorName: 'Claire M.', authorTitle: 'Dev Frontend Senior', rating: 4, title: 'Bon guide, un peu court sur les decorators', body: 'La partie type system est excellente. Un peu plus sur les decorators aurait été bien.', isVerified: true },
    ]},
    { productId: p5.id, reviews: [
      { authorName: 'Nicolas B.', authorTitle: 'Architecte logiciel 10 ans XP', rating: 5, title: 'Le meilleur investissement de l\'année', body: 'J\'ai appliqué l\'architecture sur 3 projets. Résultat : bugs divisés par 3, équipes qui comprennent le code.', isVerified: true },
      { authorName: 'Fatima Z.', authorTitle: 'Lead Dev Front CAC40', rating: 5, title: 'Module Federation appliqué directement', body: 'Les exemples avec Nx sont directement applicables. Monorepo mis en place en suivant la formation.', isVerified: true },
      { authorName: 'David L.', authorTitle: 'Senior Angular Consultant', rating: 5, title: 'Retours terrain inestimables', body: 'Les retours d\'expérience réels sur des migrations de grands groupes font la différence. Du concret à chaque chapitre.', isVerified: true },
    ]},
    { productId: p6.id, reviews: [
      { authorName: 'Julien P.', authorTitle: 'Tech Lead en mission migration', rating: 5, title: 'Sauve des vies en mission', body: 'Je suis en migration sur une app de 400 composants. Ce guide m\'a évité 3 semaines d\'erreurs.', isVerified: true },
      { authorName: 'Hana M.', authorTitle: 'Dev Angular 4 ans XP', rating: 5, title: 'Honnête et pragmatique', body: 'Pas de bullshit, que du terrain. Le script d\'audit AngularJS est un bijou.', isVerified: true },
      { authorName: 'Antoine R.', authorTitle: 'Consultant indépendant', rating: 4, title: 'Bon guide, plus de NgRx aurait été bien', body: 'Très utile pour la stratégie. J\'aurais aimé plus sur la migration du state management.', isVerified: false },
    ]},
    { productId: p7.id, reviews: [
      { authorName: 'Emma T.', authorTitle: 'Dev Angular chez une fintech', rating: 5, title: 'Signals clairement démystifiés', body: 'Cette formation m\'a donné les clés pour décider selon le contexte. Exactement ce qu\'il me fallait.', isVerified: true },
      { authorName: 'Bastien G.', authorTitle: 'Lead Dev Front 7 ans XP', rating: 5, title: 'La comparaison avec RxJS est brillante', body: 'Le chapitre comparant Signals et RxJS est le meilleur contenu que j\'ai vu sur le sujet.', isVerified: true },
      { authorName: 'Chris V.', authorTitle: 'Angular Dev freelance', rating: 4, title: 'Très bien, plus d\'exemples souhaités', body: 'Formation claire. Quelques chapitres auraient gagné à avoir plus d\'exemples concrets.', isVerified: true },
    ]},
    { productId: p8.id, reviews: [
      { authorName: 'Marion D.', authorTitle: 'Reconversion dev, 0 XP au départ', rating: 5, title: 'De zéro à déployé en 3 mois', body: '3 mois plus tard j\'ai une app complète déployée et je recherche mon premier poste. Merci Jean.', isVerified: true },
      { authorName: 'Kevin S.', authorTitle: 'Senior Full-stack Dev', rating: 5, title: 'Le seul pack qui couvre vraiment tout', body: 'La cohérence entre les formations (même projet fil rouge) est un vrai plus.', isVerified: true },
      { authorName: 'Lola B.', authorTitle: 'Dev React reconvertie Angular', rating: 5, title: 'Honnête sur les différences React/Angular', body: 'Jean ne survend pas Angular, il explique les différences honnêtement. Formation exceptionnelle.', isVerified: true },
    ]},
  ];

  for (const { productId, reviews } of reviewData) {
    for (const r of reviews) {
      await prisma.review.create({ data: { productId, ...r } });
    }
  }
  console.log(`✅ ${reviewData.length * 3} reviews`);

  await Promise.all([
    prisma.promoCode.upsert({ where: { code: 'ANGULAR2026' }, update: {}, create: { code: 'ANGULAR2026', description: '20% sur toute la boutique', discountType: DiscountType.PERCENT, discountValue: 20, isActive: true } }),
    prisma.promoCode.upsert({ where: { code: 'BIENVENUE' }, update: {}, create: { code: 'BIENVENUE', description: '20€ à partir de 49€', discountType: DiscountType.FIXED_AMOUNT, discountValue: 2000, minOrderAmount: 4900, isActive: true } }),
    prisma.promoCode.upsert({ where: { code: 'BUNDLE50' }, update: {}, create: { code: 'BUNDLE50', description: '50% packs — expiré', discountType: DiscountType.PERCENT, discountValue: 50, isActive: false, expiresAt: new Date('2025-12-31') } }),
  ]);
  console.log('✅ 3 codes promo');

  await prisma.order.upsert({
    where: { orderNumber: 'SS-2026-00001' }, update: {},
    create: {
      orderNumber: 'SS-2026-00001', accessCode: 'AXGT7KD3PQ',
      status: OrderStatus.DELIVERED,
      customerEmail: 'alice.martin@gmail.com', customerFirstName: 'Alice', customerLastName: 'Martin',
      hasPhysicalItems: false, subtotal: 4900, total: 4900,
      paidAt: new Date('2026-04-10'), deliveredAt: new Date('2026-04-10'),
      items: { create: [{ productId: p1.id, productName: p1.name, productImage: p1.imageUrl, formatLabel: 'PDF + EPUB', isDigital: true, downloadUrl: 'https://cdn.jeanmoket.dev/dl/angular-19-guide-ultime.pdf', unitPrice: 4900, quantity: 1, totalPrice: 4900 }] },
    },
  });

  await prisma.order.upsert({
    where: { orderNumber: 'SS-2026-00002' }, update: {},
    create: {
      orderNumber: 'SS-2026-00002', accessCode: 'BRNM2WLP8X',
      status: OrderStatus.PAID,
      customerEmail: 'thomas.devaud@outlook.fr', customerFirstName: 'Thomas', customerLastName: 'Devaud',
      hasPhysicalItems: false, subtotal: 19900, discountAmount: 3980, total: 15920, promoCodeSnapshot: 'ANGULAR2026',
      paidAt: new Date(),
      items: { create: [{ productId: p8.id, productName: p8.name, productImage: p8.imageUrl, formatLabel: 'Pack complet', isDigital: true, unitPrice: 19900, quantity: 1, totalPrice: 19900 }] },
    },
  });
  console.log('✅ 2 commandes exemple');
  console.log('\n🎉 Seed terminé !');
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
