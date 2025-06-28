import React from 'react';
import { View, Text, Image, StyleSheet, Pressable, Linking, Platform, ImageBackground } from 'react-native';
import { BlurView } from 'expo-blur';

export interface Article {
  pubDate?: string;
  source?: string;
  link?: string;
  image?: string;
  [key: string]: unknown;
}

export interface NewsCardProps {
  title: string;
  summary: string;
  earliestDate: string;
  publicationCount: number;
  mainSource: string;
  mainSourceLink: string;
  imageCredit?: string;
  imageUrl?: string | null;
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit', hour12: false });
}

const NewsCard: React.FC<NewsCardProps> = ({
  title,
  summary,
  earliestDate,
  publicationCount,
  mainSource,
  mainSourceLink,
  imageCredit,
  imageUrl,
}) => {
  const handleLinkPress = () => {
    if (mainSourceLink) {
      Linking.openURL(mainSourceLink).catch(err => console.error('Failed to open URL:', err));
    }
  };

  const CardContainer = imageUrl ? ImageBackground : View;
  const cardContainerProps = imageUrl
    ? {
        source: { uri: imageUrl },
        style: [styles.card, styles.cardWithImage],
        imageStyle: styles.cardImageBackground,
        testID: 'card',
      }
    : { style: styles.card, testID: 'card' };

  return (
    <CardContainer {...cardContainerProps}>
      {/* Content Section with Blur if imageUrl */}
      {imageUrl ? (
        <View style={styles.blurWrapper}>
          <BlurView intensity={50} tint="dark" style={styles.blurContent}>
            <View style={styles.content} className="content" testID="content">
              <View style={styles.titleContainer} className="title-container" testID="title-container">
                <Pressable onPress={handleLinkPress} className="link-pressable" testID="link-pressable">
                  <Text style={styles.title} className="title" testID="title">{title}</Text>
                </Pressable>
              </View>
              <Text style={styles.meta} className="meta" testID="meta">
                {mainSource} — {publicationCount} publication{publicationCount > 1 ? 's en parlent' : ' en parle'} | {formatTime(earliestDate)}
              </Text>
              <Text style={styles.summary} className="summary" testID="summary">{summary}</Text>
              {imageCredit && (
                <Text style={styles.imageCredit} className="image-credit" testID="image-credit">
                  {imageCredit}
                </Text>
              )}
            </View>
          </BlurView>
        </View>
      ) : (
        <>
          <View style={styles.content} className="content" testID="content">
            <View style={styles.titleContainer} className="title-container" testID="title-container">
              <Pressable onPress={handleLinkPress} className="link-pressable" testID="link-pressable">
                <Text style={styles.title} className="title" testID="title">{title}</Text>
              </Pressable>
            </View>
            <Text style={styles.meta} className="meta" testID="meta">
              {mainSource} — {publicationCount} publication{publicationCount > 1 ? 's en parlent' : ' en parle'} | {formatTime(earliestDate)}
            </Text>
            <Text style={styles.summary} className="summary" testID="summary">{summary}</Text>
          </View>
          <View style={styles.noImagePlaceholder} className="no-image-placeholder" testID="no-image-placeholder">
            <Text style={styles.noImageText} className="no-image-text" testID="no-image-text">📰</Text>
          </View>
        </>
      )}
    </CardContainer>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#000',
    borderRadius: 12,
    padding: 20,
    marginVertical: 20,
    flexDirection: 'column',
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    minHeight: 600,
    overflow: 'hidden',
  },
  cardWithImage: {
    padding: 0,
    justifyContent: 'flex-end',
  },
  cardImageBackground: {
    resizeMode: 'cover',
    borderRadius: 12,
  },
  blurWrapper: {
    width: '100%',
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 32,
  },
  blurContent: {
    borderRadius: 16,
    overflow: 'hidden',
    width: '92%',
    alignSelf: 'center',
    padding: 0,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 12,
  },
  topImageSection: {
    alignItems: 'center',
    marginBottom: 15,
  },
  imageWrapper: {
    width: '100%',
    height: 200,
    backgroundColor: '#333',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  noImagePlaceholder: {
    width: '100%',
    height: 100,
    backgroundColor: '#333',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  noImageText: {
    fontSize: 40,
    color: '#888',
  },
  imageCredit: {
    fontSize: 10,
    color: '#888',
    marginTop: 8,
    fontStyle: 'italic',
    textAlign: 'center',
    width: '100%',
  },
  content: {
    zIndex: 2,
    padding: 20,
  },
  titleContainer: {
    marginBottom: 4,
  },
  title: {
    color: '#add8e6',
    fontWeight: 'bold',
    fontSize: 18,
  },
  meta: {
    fontSize: 12,
    color: '#aaa',
    marginBottom: 4,
  },
  summary: {
    fontSize: 16,
    marginTop: 8,
    color: '#fff',
  },
});

export default NewsCard;
