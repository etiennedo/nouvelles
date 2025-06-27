import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Platform,
} from 'react-native';
import NewsCard, { Article } from '../components/NewsCard';

// Import your JSON data directly
import rawNewsData from '../assets/json/news_grouped.json';

// Define the structure of your news group, including the top-level 'image'
interface NewsGroup {
  title: string;
  summary: string;
  image?: string; // Add the optional top-level image field
  articles: Article[];
}

// Utility functions (from previous example, remain the same)
function getEarliestArticle(articles: Article[]): Article | undefined {
  return articles
    .filter(a => a.pubDate)
    .map(a => ({ ...a, date: new Date(a.pubDate as string) }))
    .filter(a => !isNaN((a as any).date))
    .sort((a, b) => ((a as any).date - (b as any).date))[0];
}

function getImageInfoFromArticles( // Renamed to clarify its purpose
  articles: Article[],
  mainSource?: string
): { imageCredit?: string; imageUrl: string | null; imageSource?: string } {
  // Try to find an image from the main source first
  const prioritized = articles.find(a => a.image && a.source === mainSource);
  if (prioritized) {
    return {
      imageCredit: `Image: ${prioritized.source}`,
      imageUrl: prioritized.image ?? null,
      imageSource: prioritized.source,
    };
  }
  // Otherwise, fallback to any image
  const fallback = articles.find(a => a.image);
  if (fallback) {
    return {
      imageCredit: `Image: ${fallback.source}`,
      imageUrl: fallback.image ?? null,
      imageSource: fallback.source,
    };
  }
  return { imageCredit: undefined, imageUrl: null, imageSource: undefined };
}

const ITEMS_PER_LOAD = 10;

const NewsListScreen: React.FC = () => {
  const [news, setNews] = useState<NewsGroup[]>([]);
  const [loadedCount, setLoadedCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMoreNews = useCallback(() => {
    if (loading || !hasMore) return;

    setLoading(true);
    setTimeout(() => {
      const startIndex = loadedCount;
      const endIndex = startIndex + ITEMS_PER_LOAD;
      const nextNews = (rawNewsData as NewsGroup[]).slice(startIndex, endIndex);

      setNews(prevNews => [...prevNews, ...nextNews]);
      setLoadedCount(prevCount => prevCount + nextNews.length);
      setHasMore(nextNews.length === ITEMS_PER_LOAD && endIndex < rawNewsData.length);
      setLoading(false);
    }, Platform.OS === 'web' ? 0 : 500);
  }, [loading, hasMore, loadedCount]);

  useEffect(() => {
    loadMoreNews();
  }, []);

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  };

  const renderItem = ({ item }: { item: NewsGroup }) => {
    const earliest = getEarliestArticle(item.articles);

    // --- MODIFICATION HERE ---
    let finalImageUrl: string | null = null;
    let finalImageCredit: string | undefined = undefined;

    // 1. Prioritize the top-level group image
    if (item.image) {
      finalImageUrl = item.image;
      // You might want a generic credit or 'Image: Group' if source isn't explicit
      // For now, let's just not set credit if it's from the group, unless you add a group-level credit field.
      // Or, you can try to derive a source from the first article if the group has an image.
      const firstArticleWithImage = item.articles.find(a => a.image === item.image && a.source);
      if (firstArticleWithImage) {
        finalImageCredit = `Image: ${firstArticleWithImage.source}`;
      } else if (item.articles[0]?.source) { // Fallback to first article's source if no specific image match
        finalImageCredit = `Image: ${item.articles[0].source}`;
      } else {
        finalImageCredit = 'Image: Source multiple'; // Generic if no clear source for group image
      }

    } else {
      // 2. Fallback to image from articles if no top-level group image
      const { imageCredit, imageUrl } = getImageInfoFromArticles(item.articles, earliest?.source);
      finalImageUrl = imageUrl;
      finalImageCredit = imageCredit;
    }
    // --- END MODIFICATION ---

    return (
      <NewsCard
        title={item.title}
        summary={item.summary}
        earliestDate={earliest?.pubDate || ''}
        publicationCount={item.articles.length}
        mainSource={earliest?.source || ''}
        mainSourceLink={earliest?.link || '#'}
        imageCredit={finalImageCredit} // Use the final derived credit
        imageUrl={finalImageUrl}     // Use the final derived URL
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.header}>Dernières nouvelles</Text>
        <FlatList
          data={news}
          renderItem={renderItem}
          keyExtractor={(item, index) => item.title + index}
          contentContainerStyle={styles.listContentContainer}
          onEndReached={loadMoreNews}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#242424',
  },
  container: {
    flex: 1,
    maxWidth: Platform.OS === 'web' ? 768 : '100%',
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 32,
    color: '#fff',
  },
  listContentContainer: {
    paddingBottom: 20,
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});

export default NewsListScreen;