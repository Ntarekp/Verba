import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { GlassCard } from './GlassCard';
import { rounded, spacing, typography } from '../styles/theme';

export type CollectionType = 'Favorites' | 'Academic' | 'Travel';

interface CollectionPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (collection: CollectionType) => void;
  currentCollection?: CollectionType;
}

const COLLECTIONS: { id: CollectionType; label: string; icon: string }[] = [
  { id: 'Favorites', label: 'Favorites', icon: 'star' },
  { id: 'Academic', label: 'Academic', icon: 'school' },
  { id: 'Travel', label: 'Travel', icon: 'flight' },
];

export const CollectionPicker: React.FC<CollectionPickerProps> = ({
  visible,
  onClose,
  onSelect,
  currentCollection,
}) => {
  const { themeColors, fontSizeMultiplier } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.content}>
              <GlassCard style={styles.card} padding={spacing.stackMd}>
                <View style={styles.header}>
                  <Text
                    style={[
                      styles.title,
                      { color: themeColors.onSurface, fontSize: 18 * fontSizeMultiplier },
                    ]}
                  >
                    Select Collection
                  </Text>
                  <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <MaterialIcons name="close" size={24} color={themeColors.outline} />
                  </TouchableOpacity>
                </View>

                <View style={styles.list}>
                  {COLLECTIONS.map((item) => {
                    const isSelected = currentCollection === item.id;
                    return (
                      <TouchableOpacity
                        key={item.id}
                        style={[
                          styles.item,
                          {
                            backgroundColor: isSelected
                              ? themeColors.primary + '15'
                              : 'transparent',
                            borderColor: isSelected
                              ? themeColors.primary
                              : themeColors.outlineVariant + '30',
                          },
                        ]}
                        onPress={() => {
                          onSelect(item.id);
                          onClose();
                        }}
                      >
                        <View
                          style={[
                            styles.iconBox,
                            { backgroundColor: isSelected ? themeColors.primary : themeColors.surfaceVariant },
                          ]}
                        >
                          <MaterialIcons
                            name={item.icon as any}
                            size={20}
                            color={isSelected ? '#fff' : themeColors.onSurfaceVariant}
                          />
                        </View>
                        <Text
                          style={[
                            styles.itemLabel,
                            {
                              color: isSelected ? themeColors.primary : themeColors.onSurface,
                              fontWeight: isSelected ? '700' : '500',
                            },
                          ]}
                        >
                          {item.label}
                        </Text>
                        {isSelected && (
                          <MaterialIcons
                            name="check-circle"
                            size={22}
                            color={themeColors.primary}
                            style={styles.check}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </GlassCard>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 28, 48, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.containerPadding,
  },
  content: {
    width: '100%',
    maxWidth: 400,
  },
  card: {
    borderRadius: rounded.xl,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.stackMd,
  },
  title: {
    fontFamily: 'Inter',
    fontWeight: '700',
  },
  list: {
    gap: 10,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: rounded.lg,
    borderWidth: 1,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemLabel: {
    fontFamily: 'Inter',
    fontSize: 16,
    flex: 1,
  },
  check: {
    marginLeft: 8,
  },
});
