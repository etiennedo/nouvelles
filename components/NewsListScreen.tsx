import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Dimensions,
  SafeAreaView
} from 'react-native';
import NewsCard, { Article } from '../components/NewsCard';

// Import your JSON data directly
import rawNewsData from '../assets/json/news_grouped.json';

// Define the structure of your news group, including the top-level 'image'
interface NewsGroup {
  title: string;
  summary: string;
  image?: string;
  articles: Article[];
}

// Utility to find earliest article
function getEarliestArticle(articles: Article[]): Article | undefined {
  return articles
    .filter(a => a.pubDate)
    .map(a => ({ ...a, date: new Date(a.pubDate as string) }))
    .filter(a => !isNaN((a as any).date))
    .sort((a, b) => ((a as any).date - (b as any).date))[0];
}

// Utility to pick an image
function getImageInfoFromArticles(
  articles: Article[],
  mainSource?: string
): { imageCredit?: string; imageUrl: string | null } {
  const prioritized = articles.find(a => a.image && a.source === mainSource);
  if (prioritized) return { imageCredit: `Image: ${prioritized.source}`, imageUrl: prioritized.image || null };
  const fallback = articles.find(a => a.image);
  if (fallback) return { imageCredit: `Image: ${fallback.source}`, imageUrl: fallback.image || null };
  return { imageCredit: undefined, imageUrl: null };
}

const ITEMS_PER_LOAD = 10;
const HEADER_SPACE = 100;
const { height: windowHeight } = Dimensions.get('window');
const CARD_HEIGHT = windowHeight - HEADER_SPACE;

const NewsListScreen: React.FC = () => {
  const [news, setNews] = useState<NewsGroup[]>([]);
  const [loaded, setLoaded] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;
    setLoading(true);
    setTimeout(() => {
      const next = (rawNewsData as NewsGroup[]).slice(loaded, loaded + ITEMS_PER_LOAD);
      setNews(prev => [...prev, ...next]);
      setLoaded(prev => prev + next.length);
      setHasMore(next.length === ITEMS_PER_LOAD && loaded + ITEMS_PER_LOAD < rawNewsData.length);
      setLoading(false);
    }, Platform.OS === 'web' ? 0 : 500);
  }, [loading, hasMore, loaded]);

  useEffect(() => { loadMore(); }, []);


  const renderItem = ({ item }: { item: NewsGroup }) => {
    const earliest = getEarliestArticle(item.articles);
    const { imageCredit, imageUrl } = item.image
      ? { imageCredit: `Image: ${item.articles[0]?.source}`, imageUrl: item.image }
      : getImageInfoFromArticles(item.articles, earliest?.source);

    return (
      <View
        className="card-wrapper"
        style={styles.cardWrapper}
        testID="card-wrapper"
      >
        <NewsCard
          title={item.title}
          summary={item.summary}
          earliestDate={earliest?.pubDate || ''}
          publicationCount={item.articles.length}
          mainSource={earliest?.source || ''}
          mainSourceLink={earliest?.link || '#'}
          imageCredit={imageCredit}
          imageUrl={imageUrl}
        />
      </View>
    );
  };

  return (
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.container} className="container" testID="container">
            <Text style={styles.header} className="header" testID="header">Dernières nouvelles</Text>
            <View className="list-wrapper" testID="list-wrapper" style={{ height: CARD_HEIGHT }}>
              <FlatList
                className="news-list"
                testID="news-list"
                style={{ height: CARD_HEIGHT, borderRadius: 12 }}
                contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
                data={news}
                renderItem={renderItem}
                keyExtractor={(item, idx) => item.title + idx}
                getItemLayout={(_, index) => ({ length: CARD_HEIGHT, offset: CARD_HEIGHT * index, index })}
                initialScrollIndex={0}
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={loading ? <ActivityIndicator style={{ margin: 20 }} size="large" color="#007bff" /> : null}
                pagingEnabled
                snapToInterval={650}
                snapToAlignment="start"
                decelerationRate="fast"
                disableIntervalMomentum={true}
                showsVerticalScrollIndicator={false}
                initialNumToRender={ITEMS_PER_LOAD}
              />
            </View>
          </View>
        </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#242424',
  },
  cardWrapper: {
    height: 650,
    justifyContent: 'flex-start',
    backgroundColor: '#242424',
    maxWidth: 768,
  },
  container: {
    maxWidth:'100%',
    alignSelf: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 16,
    backgroundColor: '#242424',
  },
  header: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', color: '#fff', marginVertical: 20 },
});

export default NewsListScreen;
