import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { API_URL } from "./src/config";

export default function App() {
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then((res) => res.json())
      .then((data) => setStatus(data.status))
      .catch(console.error);
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Backend Status: {status}</Text>
    </View>
  );
}
