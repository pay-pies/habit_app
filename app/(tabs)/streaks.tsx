import {View, StyleSheet} from 'react-native';
import {useState, useEffect} from 'react'
import {Habit, HabitCompletion} from '@/types/databases.type';
import {useAuth} from '@/lib/auth-context';
import {client, databases, RealTimeResponse, DATABASE_ID, COMPLETIONS_COLLECTION_ID, HABIT_COLLECTION_ID} from '@/lib/appwrite'
import {Query} from 'react-native-appwrite'
import {Card, Text} from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import React from 'react';
import {ScrollView} from 'react-native-gesture-handler';

export default function StreaksScreen() {
    const [habits, setHabits] = useState<Habit[]>([]);
    const [completedHabits, setCompletedHabits] = useState<HabitCompletion[]>([]);
    const {user} = useAuth()
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
        
          const fetchCompletions = async () => {
            try{
              const response = await databases.listDocuments<HabitCompletion>(
                DATABASE_ID, 
                COMPLETIONS_COLLECTION_ID,
                [Query.equal("user-id", user?.$id ?? "")]
              );
              const completions = response.documents as HabitCompletion[]
              setCompletedHabits(completions);
            } catch (error) {
              console.error(error);
            }
          };
    useEffect(() => {
        if (user) {
          const habitsChannel = `databases.${DATABASE_ID}.collections.${HABIT_COLLECTION_ID}.documents`
              const habitsSubscription = client.subscribe(
                habitsChannel,
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
                const completionsChannel = `databases.${DATABASE_ID}.collections.${COMPLETIONS_COLLECTION_ID}.documents`
              const completionsSubscription = client.subscribe(
                completionsChannel,
                (response: RealTimeResponse) => {
                  if (response.events.includes(
                    "databases.*.collections.*.documents.*.create"
                  )
                ) {
                    fetchCompletions()
                  } 
                }
              );
                fetchHabits();
                fetchCompletions();
                return () => {
                  habitsSubscription();
                  completionsSubscription();
                }
              }
              }, [user]);
          
            useFocusEffect(
              React.useCallback(() => {
                if (user) fetchHabits();
              }, [user])
            );
          
          fetchHabits();
          fetchCompletions();
          // return () => {
          //   habitsSubscription();
          //   completionsSubscription();
          // };
        

          interface StreakData {
            streak: number;
            bestStreak: number;
            total: number;
          }

          const getStreakData = (habitId:string): StreakData => {
            const habitCompletion = completedHabits?.filter(
              (c) => c["habit-id"] === habitId
            ).sort((a,b) => 
              new Date(a["completed-at"]).getTime() - 
              new Date(b["completed-at"]).getTime()
            );

            if (habitCompletion?.length === 0) {
              return {streak: 0, bestStreak: 0, total: 0};
          }
          let streak = 0;
          let bestStreak = 0;
          let total = habitCompletion.length;

          let lastDate: Date | null = null;
          let currentStreak = 0;

          habitCompletion?.forEach((c) => {
            const date = new Date(c["completed-at"]);
            if (lastDate){
              const diff = (date.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
              if (diff <= 1.5) {
                currentStreak += 1;
              } else{
                currentStreak = 1;
              }
            } else{
              currentStreak = 1;
            }
            if (currentStreak > bestStreak) bestStreak = currentStreak;
              streak = currentStreak;
              lastDate = date;

          })

          return {streak, bestStreak, total};
        };

        const habitStreaks = habits.map((habit) => {
          const {streak, bestStreak, total} = getStreakData(habit.$id);
          return{
            habit,
            bestStreak,
            streak,
            total,
          }
        });

        const rankedHabits = habitStreaks.sort((a,b) => b.bestStreak - a.bestStreak);
        const badgeStyles = [styles.badge1, styles.badge2, styles.badge3];
    return(
        <View style={styles.container}>
            {rankedHabits.length > 0 && (
              <View style={styles.rankingContainer}>
                <Text style={styles.rankingTitle}>🏆 Top Streaks</Text>
                {rankedHabits.slice(0, 3).map((item, key) => (
                  <View key={key} style={styles.rankingRow}>
                    <View style={[styles.rankingBadge, badgeStyles[key]]}>
                      <Text style={styles.rankingBadgeText}>{key + 1}</Text>
                    </View>
                    <Text style={styles.rankingHabit}>{item.habit.title}</Text>
                    <Text style={styles.rankingStreak}>{item.bestStreak}</Text>
                  </View>
                ))}
              </View>
            )}
            {habits.length === 0 ? (
               <View>
                <Text>No habits yet. Add your first habit!</Text>
               </View>
            ) : (
              <ScrollView>
              {rankedHabits.map(({habit, streak, bestStreak, total}, key) => (
                (<Card key={key} style={[styles.card, key === 0 && styles.firstCard]}>

                  <Card.Content>
                    <Text variant="titleMedium" style={styles.habitTitle}>{habit.title}</Text>
                    <Text style={styles.habitDescription}>{habit.description}</Text>
                    <View style={styles.statsRow}>
                      <View style={styles.streakBadge}>
                        <Text style={styles.badgeText}>🔥 {streak}</Text>
                        <Text style={styles.badgeLabel}>Current</Text>
                      </View>
                      <View style={styles.bestBadge}>
                        <Text style={styles.badgeText}>🏅 {bestStreak}</Text>
                        <Text style={styles.badgeLabel}>Best</Text>
                      </View>
                      <View style={styles.totalBadge}>
                        <Text style={styles.badgeText}>✅ {total}</Text>
                        <Text style={styles.badgeLabel}>Total</Text>
                      </View>
                    </View>
                  </Card.Content>
                </Card>
              )
              ))}
              </ScrollView>
            )}

        </View>
    );
  }

const styles = StyleSheet.create({
  container:{
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  card:{
    marginBottom: 18,
    borderRadius: 18,
    backgroundColor: "#fff",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: "#f0f0f0"
  },
  firstCard:{
    borderWidth: 2,
    borderColor: "#7c4dff",
  },
  habitTitle:{
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 2,
  },
  habitDescription:{
    color: "#6c6c80",
    marginBottom: 8,
  },
  statsRow:{
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    marginTop: 8,
  },
  streakBadge:{
    backgroundColor: "#fff3e0",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: "center",
    minWidth: 60,
  },
  bestBadge:{
    backgroundColor: "#fffde7",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: "center",
    minWidth: 60,
  },
  totalBadge:{
    backgroundColor: "#e8f5e9",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: "center",
    minWidth: 60,
  },
  badgeText:{
    fontWeight: "bold",
    fontSize: 15,
    color: "#22223b",
  },
  badgeLabel:{
    fontWeight: "500",
    fontSize: 11,
    color: "#888",
    marginTop: 2,
  },
  rankingContainer:{
    marginBottom: 24,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  rankingTitle:{
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 12,
    color: "#7c4dff",
    letterSpacing: 0.5,
  },
  rankingRow:{
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0", 
    paddingBottom: 8,
  },
  rankingBadge:{
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    backgroundColor: "#e0e0e0",
  },
  badge1:{
    backgroundColor: "#ffd700",
  },
  badge2:{
    backgroundColor: "#c0c0c0",
  },
  badge3:{
    backgroundColor: "#cd7f32",
  },
  rankingBadgeText:{
    fontWeight: "bold",
    color: "#fff",
    fontSize: 15,
  },
  rankingHabit:{
    flex: 1,
    fontSize: 15,
    color: "#333",
    fontWeight: "600",
  },
  rankingStreak:{
    fontSize: 14,
    color: "#7c4dff",
    fontWeight: "bold",
  },
});