import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, Image, FlatList, StyleSheet } from 'react-native';
import { AVATARS, getAvatarUrl } from '@shared/avatars.js';
import { colors } from '../theme/colors.js';

const AVATAR_COLORS = [
  '#38bdf8', '#34d399', '#a78bfa', '#f472b6',
  '#fbbf24', '#60a5fa', '#a3e635', '#e879f9',
  '#fb923c', '#f87171', '#14b8a6', '#6366f1',
];

function AvatarImage({ avatarId, label, storageBucket, size = 48 }) {
  const [error, setError] = useState(false);
  const colorIndex = AVATARS.findIndex(a => a.id === avatarId);
  const bgColor = AVATAR_COLORS[colorIndex >= 0 ? colorIndex : 0];

  if (error || !storageBucket) {
    return (
      <View style={[styles.avatarFallback, { width: size, height: size, borderRadius: size / 2, backgroundColor: bgColor }]}>
        <Text style={[styles.avatarFallbackText, { fontSize: size * 0.4 }]}>
          {label.charAt(0).toUpperCase()}
        </Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri: getAvatarUrl(avatarId, storageBucket) }}
      style={[styles.avatarImage, { width: size, height: size, borderRadius: size / 2 }]}
      onError={() => setError(true)}
    />
  );
}

export default function AvatarSelector({ isOpen, onClose, currentAvatarId, onSelect, storageBucket }) {
  const [selected, setSelected] = useState(currentAvatarId);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (selected === currentAvatarId) {
      onClose();
      return;
    }
    setSaving(true);
    await onSelect(selected);
    setSaving(false);
    onClose();
  };

  const renderAvatar = ({ item }) => {
    const isSelected = selected === item.id;
    return (
      <TouchableOpacity
        onPress={() => setSelected(item.id)}
        activeOpacity={0.7}
        style={[styles.avatarItem, isSelected && styles.avatarItemSelected]}
      >
        <AvatarImage avatarId={item.id} label={item.label} storageBucket={storageBucket} />
        <Text style={styles.avatarLabel}>{item.label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Choose Avatar</Text>

          <FlatList
            data={AVATARS}
            renderItem={renderAvatar}
            keyExtractor={item => item.id}
            numColumns={4}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.grid}
            scrollEnabled={false}
          />

          <View style={styles.buttons}>
            <TouchableOpacity onPress={onClose} style={styles.cancelButton} activeOpacity={0.7}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              disabled={saving}
              style={[styles.saveButton, saving && { opacity: 0.5 }]}
              activeOpacity={0.7}
            >
              <Text style={styles.saveText}>{saving ? '...' : 'Save'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.gray900,
    textAlign: 'center',
    marginBottom: 16,
  },
  grid: {
    gap: 8,
  },
  row: {
    gap: 8,
    justifyContent: 'center',
  },
  avatarItem: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
    borderRadius: 12,
    backgroundColor: colors.gray50,
    gap: 4,
  },
  avatarItemSelected: {
    backgroundColor: '#f0f9ff',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallbackText: {
    fontWeight: '700',
    color: colors.white,
  },
  avatarLabel: {
    fontSize: 10,
    color: colors.gray500,
    fontWeight: '500',
  },
  buttons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.gray100,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray500,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  saveText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },
});
