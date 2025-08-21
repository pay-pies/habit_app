import { Text, View, StyleSheet} from "react-native";
import {Button} from "react-native-paper";
import { useAuth } from "@/lib/auth-context";

export default function Index() {
  const {signOut} = useAuth();
  return (
    <View style={styles.view}>
      <Text>Edit app/index.tsx to edit this screen.</Text>
      <Button mode="text" onPress={signOut} icon="logout">
        <Text>Sign Out</Text>
        </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  view:{
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    }
})