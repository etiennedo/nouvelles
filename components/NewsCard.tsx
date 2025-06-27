import React from 'react';
import { View, Text, Image, StyleSheet, Pressable, Linking, Platform } from 'react-native';

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

  return (
    <View style={styles.card}>
      {/* Image and Image Credit Section (now at the top) */}
      {imageUrl && ( // Only render if an image URL exists
        <View style={styles.topImageSection}>
          <View style={styles.imageWrapper}>
            <Image
              source={{ uri: imageUrl }}
              style={styles.image}
              resizeMode="cover"
            />
          </View>
          {imageCredit && (
            <Text style={styles.imageCredit}>{imageCredit}</Text>
          )}
        </View>
      )}
      {/* Fallback for no image, if you still want a placeholder */}
      {!imageUrl && (
        <View style={styles.noImagePlaceholder}>
          <Text style={styles.noImageText}>📰</Text>
        </View>
      )}


      {/* Content Section (title, meta, summary) */}
      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Pressable onPress={handleLinkPress}>
            <Text style={styles.title}>{title}</Text>
          </Pressable>
        </View>
        <Text style={styles.meta}>
          {mainSource} — {publicationCount} publication{publicationCount > 1 ? 's en parlent' : ' en parle'} | {formatTime(earliestDate)}
        </Text>
        <Text style={styles.summary}>{summary}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#000', // bg-black
    borderRadius: 12, // rounded-xl
    padding: 20, // p-5
    marginHorizontal: 16, // Added horizontal margin for spacing
    marginVertical: 8, // my-4 (half of 4 is 2, so 8 for top/bottom)
    flexDirection: 'column', // Changed to column for image on top
    alignItems: 'stretch', // Stretch to fill width
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5, // shadow-md
  },
  topImageSection: {
    alignItems: 'center', // Center the image horizontally
    marginBottom: 15, // Space between image and text content
  },
  imageWrapper: {
    width: '100%', // Make image span full width of the card
    height: 200, // Fixed height for a consistent look
    backgroundColor: '#333', // bg-gray-800
    borderRadius: 8, // rounded-lg
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
    height: 100, // Slightly smaller placeholder
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
    marginTop: 8, // Space between image and credit
    fontStyle: 'italic',
    textAlign: 'center',
    width: '100%',
  },
  content: {
    // No flex: 1 needed here as it's a column layout
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