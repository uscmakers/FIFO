import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F78FCF",
  },

  card: {
    width: 500,
    backgroundColor: "#fff",
    padding: 50,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 12,
  },

  title: {
    fontSize: 34,
    fontWeight: "700",
    textAlign: "center",
    color: "#FF69B4",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 40,
  },

  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },

  input: {
    width: "100%",
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 16,
    marginBottom: 25,
    fontSize: 16,
  },

  button: {
    width: "100%",
    paddingVertical: 18,
    backgroundColor: "#FF69B4",
    borderRadius: 16,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});