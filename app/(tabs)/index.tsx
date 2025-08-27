import {ScrollView, View, StyleSheet} from "react-native";
import {Button, Text, Surface} from "react-native-paper";
import { useAuth } from "@/lib/auth-context";
import {DATABASE_ID, databases, HABIT_COLLECTION_ID, COMPLETIONS_COLLECTION_ID, client, RealTimeResponse} from '@/lib/appwrite';
import {Query, ID} from 'react-native-appwrite';
import {useState, useEffect, useRef} from 'react';
import {Habit, HabitCompletion} from '@/types/databases.type';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {Swipeable} from "react-native-gesture-handler";
import {useFocusEffect} from "@react-navigation/native";
import React from "react";

export default function Index() {
  const {signOut, user} = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completedHabits, setCompletedHabits] = useState<string[]>();
  const swipeableRefs = useRef<{[key: string]: Swipeable | null}>({})
  useEffect(() => {
    if (user) {
    const channel = `databases.${DATABASE_ID}.collections.${HABIT_COLLECTION_ID}.documents`
    const habitsSubscription = client.subscribe(
      channel,
      (response: RealTimeResponse) => {
        if (response.events.includes(
          "databases.*.collections.*.documents.*.create"
        )
      ) {
          fetchHabits()
        } else if (
          response.events.includes(
            "databases.*.collections.*.documents.*.update"
        )
      ) {
        fetchHabits()
        } else if (
          response.events.includes(
            "databases.*.collections.*.documents.*.delete"
        )
      ) {
        fetchHabits()
        }
      }
    );
      fetchHabits();
      fetchTodayCompletions();
      return () => {
        habitsSubscription();
      }
    }
    }, [user]);

  useFocusEffect(
    React.useCallback(() => {
      if (user) fetchHabits();
    }, [user])
  );

  const fetchHabits = async () => {
    try{
      const response = await databases.listDocuments<Habit>(
        DATABASE_ID, 
        HABIT_COLLECTION_ID,
        [Query.equal("user-id", user?.$id ?? "")]
      );
      setHabits(response.documents as Habit[]);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTodayCompletions = async () => {
    try{
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const response = await databases.listDocuments<HabitCompletion>(
        DATABASE_ID, 
        COMPLETIONS_COLLECTION_ID,
        [
          Query.equal("user-id", user?.$id ?? ""), 
          Query.greaterThanEqual("completed-at", today.toISOString()),
        ]
      );
      // console.log(response.documents);
      const completions = response.documents as HabitCompletion[]
      setCompletedHabits(completions.map((c) => c["habit-id"]));
    } catch (error) {
      console.error(error);
    }
  };
  const handleDeleteHabit = async (id: string) => {
    try{
      await databases.deleteDocument(DATABASE_ID, HABIT_COLLECTION_ID, id);
      fetchHabits();
    } catch (error){
      console.error(error);
    }
  };
  const handleCompleteHabit = async (id: string) => {
    if (!user || completedHabits?.includes(id)) return;
    try{
      const currentDate = new Date().toISOString()
      await databases.createDocument(
        DATABASE_ID, 
        COMPLETIONS_COLLECTION_ID, 
        ID.unique(),
        {
          "habit-id": id,
          "user-id": user.$id,
          "completed-at": currentDate,
        }
      )
      fetchHabits();
      const habit = habits?.find((h) => h.$id === id)
      if (!habit) return;
      await databases.updateDocument(DATABASE_ID, HABIT_COLLECTION_ID, id, {
        "streak-count": habit["streak-count"] + 1,
        "last-completed": currentDate,
      });
      fetchHabits();
    } catch (error){
      console.error(error);
    }
  };
  const renderRightActions = () => (
    <View style={styles.swipeActionRight}>
      <MaterialCommunityIcons 
        name="check-circle-outline" 
        size={32} 
        color={"#fff"}
        />
    </View>
  );
  const renderLeftActions = () => (
    <View style={styles.swipeActionLeft}>
      <MaterialCommunityIcons 
        name="trash-can-outline" 
        size={32} 
        color={"#fff"}
        />
    </View>
  );
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall"  style={styles.title}>Today's Habits</Text>
        <Button mode="text" onPress={signOut} icon="logout">
        <Text>Sign Out</Text>
        </Button>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {habits?.length === 0 ? (

          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No habits yet. Add your first habit!</Text>
          </View>
        ) : (
            habits?.map((habit, key) => (
              <Swipeable ref={(ref) => {
                swipeableRefs.current[habit.$id] = ref
                
              }}
              key={key}
              overshootLeft={false}
              overshootRight={false}
              renderLeftActions={renderLeftActions}
              renderRightActions={renderRightActions}
              onSwipeableOpen={(direction) => {
                if (direction === "left"){
                  handleDeleteHabit(habit.$id);
                } else if (direction === "right"){
                  handleCompleteHabit(habit.$id);
                }

                swipeableRefs.current[habit.$id]?.close()
              }}
            >
                <Surface style={styles.card} elevation={0}>
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{habit.title}</Text> 
                    <Text style={styles.cardDescription}>{habit.description}</Text> 
                    <View style={styles.cardFooter}>
                      <View style={styles.streakBadge}>
                        <MaterialCommunityIcons 
                          name="fire" 
                          size={18} 
                          color={"#ff9800"}/>
                        <Text style={styles.streakText}>{habit["streak-count"]} day streak</Text>
                      </View>
                      <View style={styles.frequencyBadge}>
                        <Text style={styles.frequencyText}>
                          {habit.frequency.charAt(0).toUpperCase() + 
                          habit.frequency.slice(1)}
                        </Text>
                      </View>
                    </View>
                  </View>
              </Surface>
            </Swipeable>
            ))
          )}
        </ScrollView>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container:{
      flex: 1,
      padding: 16,
      backgroundColor: "#f5f5f5"
    },
  header:{
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title:{
    fontWeight: "bold",
  },
  card:{
    marginBottom: 18,
    borderRadius: 18,
    backgroundColor: "#f7f2fa",
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4
  },
  cardContent:{
    padding: 20,
  },
  cardTitle:{
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#22223b"
  },
  cardDescription:{
    fontSize: 15,
    marginBottom: 16,
    color: "#6c6c80"
  },
  cardFooter:{
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  streakBadge:{
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff2e0",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  streakText:{
    marginLeft: 6,
    color: "#ff9800",
    fontWeight: "bold",
    fontSize: 14,
  },
  frequencyBadge:{
    backgroundColor: "#ede7f6",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  frequencyText:{
    color: "#7c4dff",
    fontWeight: "bold",
    fontSize: 14,
  },
  emptyState:{
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyStateText:{
    color: "#666666",

  },
  swipeActionLeft:{
    justifyContent: "center",
    alignItems: "flex-start",
    flex: 1,
    backgroundColor: "#e53935",
    borderRadius: 18,
    marginBottom: 18,
    marginTop: 2,
    paddingLeft: 16,
  },
  swipeActionRight:{
    justifyContent: "center",
    alignItems: "flex-end",
    flex: 1,
    backgroundColor: "#4caf50",
    borderRadius: 18,
    marginBottom: 18,
    marginTop: 2,
    paddingRight: 16,
  }

})