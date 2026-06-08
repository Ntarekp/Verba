import React, { useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Animated, 
  PanResponder, 
  Dimensions 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SearchHistoryItem } from '../models/DictionaryTypes';
import { useTheme } from '../context/ThemeContext';
import { rounded, spacing, typography } from '../styles/theme';

interface HistoryItemProps {
  item: SearchHistoryItem;
  onSelect: () => void;
  onDelete: () => void;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = -40;
const BUTTON_WIDTH = -80; // Swipe limit to reveal delete button

export const HistoryItem: React.FC<HistoryItemProps> = ({ item, onSelect, onDelete }) => {
  const { themeColors, fontSizeMultiplier } = useTheme();
  const position = useRef(new Animated.Value(0)).current;
  const isSwiped = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only trigger responder for horizontal movements
        return Math.abs(gestureState.dx) > 5 && Math.abs(gestureState.dy) < 10;
      },
      onPanResponderGrant: () => {
        position.setOffset(isSwiped.current ? BUTTON_WIDTH : 0);
        position.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        // Restrict swipe right, and restrict swipe left beyond limits
        let newX = gestureState.dx;
        const currentOffset = isSwiped.current ? BUTTON_WIDTH : 0;
        const totalX = currentOffset + newX;
        
        if (totalX > 0) {
          position.setValue(-currentOffset); // cap swipe right at 0
        } else if (totalX < BUTTON_WIDTH - 20) {
          // Add friction if pulled past delete button
          const excess = totalX - BUTTON_WIDTH;
          position.setValue(BUTTON_WIDTH + excess * 0.3 - currentOffset);
        } else {
          position.setValue(newX);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        position.flattenOffset();
        const finalX = gestureState.dx + (isSwiped.current ? BUTTON_WIDTH : 0);

        if (finalX < SWIPE_THRESHOLD) {
          // Snap open
          Animated.spring(position, {
            toValue: BUTTON_WIDTH,
            useNativeDriver: true,
            bounciness: 4,
          }).start();
          isSwiped.current = true;
        } else {
          // Snap closed
          Animated.spring(position, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 4,
          }).start();
          isSwiped.current = false;
        }
      },
    })
  ).current;

  const handlePressCard = () => {
    if (isSwiped.current) {
      // If swiped, close it first
      Animated.spring(position, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
      isSwiped.current = false;
    } else {
      onSelect();
    }
  };

  const handleDelete = () => {
    Animated.timing(position, {
      toValue: -SCREEN_WIDTH,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onDelete();
    });
  };

  const getPosBadgeBorderColor = () => {
    switch (item.partOfSpeech.toLowerCase()) {
      case 'noun':
        return themeColors.secondary + '40';
      case 'verb':
        return themeColors.tertiary + '40';
      case 'adjective':
      case 'adj':
      default:
        return themeColors.primary + '40';
    }
  };

  const getPosBadgeTextColor = () => {
    switch (item.partOfSpeech.toLowerCase()) {
      case 'noun':
        return themeColors.secondary;
      case 'verb':
        return themeColors.tertiary;
      case 'adjective':
      case 'adj':
      default:
        return themeColors.primary;
    }
  };

  const formattedPos = 
    item.partOfSpeech.toLowerCase() === 'adjective' ? 'Adj' :
    item.partOfSpeech.toLowerCase() === 'adverb' ? 'Adv' :
    item.partOfSpeech.charAt(0).toUpperCase() + item.partOfSpeech.slice(1, 3);

  return (
    <View style={styles.container}>
      {/* Background Delete Action Layer */}
      <View style={[styles.deleteBackground, { backgroundColor: themeColors.error }]}>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete} activeOpacity={0.8}>
          <MaterialIcons name="delete" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Foreground Interactive Card Layer */}
      <Animated.View
        style={[
          styles.cardForeground,
          {
            backgroundColor: themeColors.surfaceContainerLowest,
            borderColor: themeColors.outlineVariant + '30',
            transform: [{ translateX: position }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity 
          style={styles.cardContent} 
          onPress={handlePressCard}
          activeOpacity={0.9}
        >
          <View style={styles.row}>
            <View style={[styles.iconBox, { backgroundColor: themeColors.surfaceContainerLow }]}>
              <MaterialIcons name="history" size={22} color={themeColors.outline} />
            </View>

            <View style={styles.textColumn}>
              <View style={styles.wordHeader}>
                <Text style={[
                  styles.wordText, 
                  { color: themeColors.onSurface, fontSize: typography.buttonText.fontSize * fontSizeMultiplier }
                ]}>
                  {item.word}
                </Text>
                
                <View style={[
                  styles.badge, 
                  { borderColor: getPosBadgeBorderColor() }
                ]}>
                  <Text style={[
                    styles.badgeText, 
                    { color: getPosBadgeTextColor(), fontSize: 10 }
                  ]}>
                    {formattedPos}
                  </Text>
                </View>
              </View>

              <Text 
                style={[
                  styles.definitionSummary, 
                  { color: themeColors.onSurfaceVariant, fontSize: typography.caption.fontSize * fontSizeMultiplier }
                ]}
                numberOfLines={1}
              >
                {item.definitionSummary}
              </Text>
            </View>

            <TouchableOpacity style={styles.searchButton} onPress={onSelect} activeOpacity={0.7}>
              <MaterialIcons name="search" size={20} color={themeColors.primary} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 80,
    position: 'relative',
    marginBottom: 8,
    borderRadius: rounded.lg,
    overflow: 'hidden',
  },
  deleteBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'flex-end',
    borderRadius: rounded.lg,
    zIndex: 0,
  },
  deleteButton: {
    width: 80,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardForeground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 1,
    borderRadius: rounded.lg,
    zIndex: 1,
    shadowColor: '#0b1c30',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  wordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  wordText: {
    fontFamily: 'Inter',
    fontWeight: '700',
  },
  badge: {
    borderWidth: 1,
    borderRadius: rounded.sm,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  badgeText: {
    fontFamily: 'Inter',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  definitionSummary: {
    fontFamily: 'Inter',
    opacity: 0.9,
  },
  searchButton: {
    padding: 8,
  },
});
