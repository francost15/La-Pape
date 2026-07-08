import { StyleSheet } from "react-native";
import { PILL_H, PILL_W } from "./constants";

export const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  island: {
    borderRadius: 28,
    borderCurve: "continuous",
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  tabsRowWrapper: {
    flex: 1,
    position: "relative",
    flexDirection: "row",
    height: PILL_H, // Constraint to exactly contain the pill
  },
  slidingPill: {
    position: "absolute",
    left: 0,
    top: 0,
    width: PILL_W,
    height: PILL_H,
    borderRadius: PILL_H / 2, // Perfect pill curve
  },
  tabsRow: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: PILL_H, // Exactly spans the wrapper height
  },
  tabItemInner: {
    alignItems: "center",
    justifyContent: "center",
  },
  pcBadge: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    borderCurve: "continuous",
  },
  pcBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
});
