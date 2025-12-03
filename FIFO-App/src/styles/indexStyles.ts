import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 25,
  },
  error: {
    color: "red",
    marginBottom: 10,
    fontSize: 14,
    textAlign: "center",
  },
  input: {
    width: "100%",
    padding: 14,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    width: "100%",
    paddingVertical: 14,
    backgroundColor: "#FF69B4",
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});
