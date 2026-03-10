import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F78FCF", // bubblegum gradient base
  },

  card: {
    width: 450,
    backgroundColor: "#fff",
    padding: 40,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },

  title: {
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
    color: "#FF69B4",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
  },

  input: {
    width: "100%",
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 14,
    marginBottom: 20,
    fontSize: 16,
  },

  button: {
    width: "100%",
    paddingVertical: 16,
    backgroundColor: "#FF69B4",
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
  },

  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});