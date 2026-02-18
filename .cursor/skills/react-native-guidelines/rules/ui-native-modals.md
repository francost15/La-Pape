---
title: Use Native Modals Over JS-Based Bottom Sheets
impact: HIGH
impactDescription: Native performance, gestures, accessibility
tags: ui, modals, formsheet
---

## Use Native Modals Over JS-Based Bottom Sheets

Use `<Modal presentationStyle="formSheet">` or React Navigation v7 form sheet. Avoid JS bottom sheet libraries.

**Incorrect:**

```tsx
<BottomSheet ref={sheetRef} snapPoints={['50%', '90%']}>...</BottomSheet>
```

**Correct:**

```tsx
<Modal visible={visible} presentationStyle="formSheet" animationType="slide" onRequestClose={...}>
  <View>...</View>
</Modal>
```

**Correct: React Navigation**

```tsx
<Stack.Screen name="Details" options={{ presentation: 'formSheet', sheetAllowedDetents: 'fitToContents' }} />
```
