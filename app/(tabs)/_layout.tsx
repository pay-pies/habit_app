import { Tabs } from "expo-router";
import Ionicons from '@expo/vector-icons/Ionicons';

export default function TabsLayout() {
  return (
      <Tabs screenOptions={{headerStyle: {
      backgroundColor: "f5f5f5"}, 
      headerShadowVisible: false,
      tabBarStyle: {
        backgroundColor: "f5f5f5",
        borderTopWidth: 0,
        elevation: 0,
        shadowOpacity: 0,

        }}}>
      <Tabs.Screen name="index" options={{title: "Home", tabBarIcon: ({color, focused}) => {
        return focused ? (
        <Ionicons name="home" size={24} color={color} />
        ) : (
        <Ionicons name="home-outline" size={24} color={color} />)
      }}}/>
      <Tabs.Screen name="login" options={{title: "Login" }}/>
    </Tabs>
  );
}
