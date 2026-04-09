import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eee",
  },

  header: {
    backgroundColor: "#F062A5",
    paddingTop: 60,
    paddingBottom: 18,
    paddingHorizontal: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerLeft: {
    flex: 1,
    paddingRight: 12,
  },

  headerTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
  },

  headerEmail: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    marginTop: 4,
  },

  headerButtons: {
    flexDirection: "row",
    gap: 10,
  },

  headerButton: {
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    minWidth: 72,
    alignItems: "center",
  },

  headerButtonText: {
    color: "#F062A5",
    fontWeight: "800",
    fontSize: 15,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  listShell: {
    flex: 1,
    alignItems: "center",
  },

  list: {
    alignSelf: "center",
  },

  cardWrapper: {
    flexGrow: 0,
    paddingLeft: 5,
    paddingRight: 5,
    paddingBottom: 10,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    position: "relative",
    width: "100%",
    height: "100%",
    overflow: "hidden",
    padding: 0,
  },

  image: {
    width: "100%",
    height: 130,
    resizeMode: "cover",
  },

  cardTextArea: {
    paddingHorizontal: 10,
    paddingTop: 20,
    paddingBottom: 10,
    flex: 1,
  },

  productName: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 0,
  },

  productBrand: {
    fontSize: 13,
    color: "#777",
    textAlign: "center",
    marginTop: 4,
  },

  expiration: {
    fontSize: 14,
    color: "#F062A5",
    textAlign: "center",
    marginTop: 4,
    fontWeight: "600",
  },

  actionRow: {
    position: "absolute",
    top: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    zIndex: 10,
  },

  edit: {
    padding: 2,
  },

  editText: {
    fontSize: 18,
  },

  delete: {
    padding: 2,
  },

  deleteText: {
    fontSize: 18,
  },

  fabRow: {
    position: "absolute",
    bottom: 30,
    right: 30,
    flexDirection: "row",
    gap: 10,
  },

  fab: {
    backgroundColor: "#F062A5",
    width: 66,
    height: 66,
    borderRadius: 33,
    justifyContent: "center",
    alignItems: "center",
  },

  magicFab: {
    backgroundColor: "#FFB7D5",
    width: 66,
    height: 66,
    borderRadius: 33,
    justifyContent: "center",
    alignItems: "center",
  },

  fabEmoji: {
    fontSize: 26,
  },

  manualOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 18,
  },

  manualModalContent: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 10,
  },

  manualTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#F062A5",
    textAlign: "center",
    marginBottom: 18,
  },

  manualInput: {
    width: "100%",
    padding: 14,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    marginBottom: 14,
    fontSize: 16,
    backgroundColor: "#fff",
  },

  manualButtonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 6,
  },

  manualButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  manualCancelButton: {
    backgroundColor: "#eee",
  },

  manualSubmitButton: {
    backgroundColor: "#F062A5",
  },

  manualCancelText: {
    fontWeight: "800",
    color: "#333",
  },

  manualSubmitText: {
    fontWeight: "800",
    color: "#fff",
  },

  recipeOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 18,
  },

  recipeModalContent: {
    width: "100%",
    maxWidth: 420,
    maxHeight: "80%",
    backgroundColor: "#fff",
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 10,
  },

  recipeLoadingContainer: {
    paddingVertical: 30,
    alignItems: "center",
    justifyContent: "center",
  },

  recipeLoadingText: {
    marginTop: 12,
    color: "#666",
    fontSize: 15,
    textAlign: "center",
  },

  recipeHeader: {
    alignItems: "center",
    marginBottom: 12,
  },

  recipeHeaderEmoji: {
    fontSize: 30,
    marginBottom: 6,
  },

  recipeTitleText: {
    fontSize: 22,
    fontWeight: "800",
    color: "#F062A5",
    textAlign: "center",
  },

  recipeMeta: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
    marginBottom: 14,
  },

  recipeSection: {
    backgroundColor: "#FFF7FB",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },

  recipeSectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#222",
    marginBottom: 10,
  },

  recipeLineRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },

  recipeBullet: {
    fontSize: 16,
    color: "#F062A5",
    marginRight: 8,
    lineHeight: 22,
  },

  recipeLineText: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    lineHeight: 21,
  },

  recipeQty: {
    fontWeight: "700",
    color: "#F062A5",
  },

  recipeStepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },

  stepNumberCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#F062A5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    marginTop: 2,
  },

  recipeStepNumber: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 13,
  },

  recipeStepText: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    lineHeight: 21,
  },

  closeRecipeButton: {
    marginTop: 6,
    backgroundColor: "#F062A5",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },

  closeRecipeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
});