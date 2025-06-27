// group-news-advanced.js
import fs from 'fs/promises';

const INPUT_PATH = './assets/json/news.json';
const OUTPUT_PATH = './assets/json/news_grouped.json';
const DEFAULT_THRESHOLD = 0.65; // Seuil ajusté pour le nouveau calcul de similarité.

// Le set de stopwords reste le même, il est bien adapté.
const STOPWORDS = new Set([
  "le", "la", "les", "un", "une", "à", "de", "en", "au", "aux",
  "est", "sur", "dans", "alors", "quand", "et", "par", "avec",
  "du", "des", "ce", "cet", "cette", "qui", "pour", "se", "sa", "son", "leur",
  "l", "d", "s", "ne", "pas", "plus", "moins", "comme", "ici", "selon", "dit"
]);

/**
 * Normalise un texte pour l'analyse :
 * - Minuscules
 * - Suppression des accents et de la ponctuation
 * - Suppression des mots vides (stopwords)
 */
function normalize(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Suppression des accents
    .replace(/[^a-z0-9\s]/gi, '') // Suppression de la ponctuation
    .split(/\s+/)
    .filter(word => word && !STOPWORDS.has(word))
    .join(' ');
}

/**
 * Calcule le coefficient de chevauchement (Overlap Coefficient) entre deux chaînes de caractères.
 * C'est plus adapté que Jaccard quand un texte peut être un sous-ensemble de l'autre.
 * Formule : |A ∩ B| / min(|A|, |B|)
 */
function getOverlapSimilarity(textA, textB) {
  const wordsA = new Set(textA.split(/\s+/));
  const wordsB = new Set(textB.split(/\s+/));

  const intersection = new Set([...wordsA].filter(x => wordsB.has(x)));
  const minSize = Math.min(wordsA.size, wordsB.size);

  return minSize === 0 ? 0 : intersection.size / minSize;
}


/**
 * Lit le seuil à partir des arguments de la ligne de commande ou utilise la valeur par défaut.
 */
function parseThreshold() {
  const arg = process.argv.find(arg => arg.startsWith('--threshold='));
  if (!arg) return DEFAULT_THRESHOLD;
  const value = parseFloat(arg.split('=')[1]);
  return isNaN(value) ? DEFAULT_THRESHOLD : value;
}

/**
 * Fonction principale pour regrouper les articles similaires.
 */
async function groupSimilarNews() {
  try {
    const raw = await fs.readFile(INPUT_PATH, 'utf-8');
    const articles = JSON.parse(raw);
    const totalArticles = articles.length;
    const threshold = parseThreshold();

    // --- Étape 1: Pré-calculer le texte normalisé pour chaque article (performance) ---
    // On se concentre sur le titre, qui est un signal plus fort et moins bruyant.
    const normalizedArticles = articles.map(article => ({
      ...article,
      normalizedTitle: normalize(article.title)
    }));

    // --- Étape 2: Construire le graphe de similarité ---
    // On crée une liste d'adjacence où chaque article est un nœud
    // et un lien existe si la similarité > seuil.
    const adj = new Array(totalArticles).fill(0).map(() => []);
    for (let i = 0; i < totalArticles; i++) {
      for (let j = i + 1; j < totalArticles; j++) {
        const similarity = getOverlapSimilarity(
          normalizedArticles[i].normalizedTitle,
          normalizedArticles[j].normalizedTitle
        );

        if (similarity >= threshold) {
          adj[i].push(j);
          adj[j].push(i);
        }
      }
    }

    // --- Étape 3: Trouver les composantes connexes (les groupes) via un parcours en profondeur (DFS) ---
    const groups = [];
    const visited = new Set();

    for (let i = 0; i < totalArticles; i++) {
      if (!visited.has(i)) {
        const currentGroupIndices = [];
        const stack = [i]; // Utilisation d'une pile pour un DFS itératif
        visited.add(i);

        while (stack.length > 0) {
          const u = stack.pop();
          currentGroupIndices.push(u);

          for (const v of adj[u]) {
            if (!visited.has(v)) {
              visited.add(v);
              stack.push(v);
            }
          }
        }
        groups.push(currentGroupIndices);
      }
    }

    // --- Étape 4: Formater les groupes pour le fichier JSON de sortie ---
    const formattedGroups = groups.map(indices => {
      const clusterArticles = indices.map(index => articles[index]);

      // Choisir le titre le plus long comme titre représentatif du groupe.
      // C'est souvent le plus descriptif.
      const representativeArticle = clusterArticles.reduce((longest, current) => {
        return current.title.length > longest.title.length ? current : longest;
      }, clusterArticles[0]);

      // Trier les articles du groupe par date de publication (le plus récent en premier)
      clusterArticles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
      
      return {
        title: representativeArticle.title,
        summary: representativeArticle.description,
        // --- AJOUTEZ CETTE LIGNE POUR INCLURE L'IMAGE ---
        image: representativeArticle.image, // Assurez-vous que votre JSON d'entrée a bien une propriété 'image' pour les articles
        articles: clusterArticles,
      };
    });

    // On trie les groupes eux-mêmes pour que les plus gros groupes (plus d'articles) apparaissent en premier
    formattedGroups.sort((a, b) => b.articles.length - a.articles.length);

    await fs.writeFile(OUTPUT_PATH, JSON.stringify(formattedGroups, null, 2));

    console.log(`✅ ${totalArticles} articles analysés et regroupés en ${groups.length} sujets (seuil: ${threshold})`);
  } catch (error) {
    console.error("Une erreur est survenue lors du regroupement des nouvelles :", error);
  }
}

groupSimilarNews();
