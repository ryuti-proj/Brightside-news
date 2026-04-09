"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { type UserData, getUserData, addMoodEntry } from "@/lib/user-data"
import { Heart, TrendingUp, Calendar, Plus, Smile } from "lucide-react"

export function UserMoodTracker() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [showAddEntry, setShowAddEntry] = useState(false)
  const [newEntry, setNewEntry] = useState({
    beforeReading: 3,
    afterReading: 3,
    notes: "",
  })

  useEffect(() => {
    const data = getUserData()
    setUserData(data)
  }, [])

  const handleAddEntry = () => {
    addMoodEntry(newEntry)
    const updatedData = getUserData()
    setUserData(updatedData)
    setNewEntry({ beforeReading: 3, afterReading: 3, notes: "" })
    setShowAddEntry(false)
  }

  if (!userData) return <div>Loading...</div>

  const averageImprovement =
    userData.moodEntries.length > 0
      ? userData.moodEntries.reduce((sum, entry) => sum + entry.improvement, 0) / userData.moodEntries.length
      : 0

  const totalEntries = userData.moodEntries.length
  const positiveEntries = userData.moodEntries.filter((entry) => entry.improvement > 0).length

  const moodEmojis = ["😢", "😔", "😐", "😊", "😄"]
  const moodLabels = ["Very Sad", "Sad", "Neutral", "Happy", "Very Happy"]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Mood Tracker</h1>
          <p className="text-gray-600 dark:text-gray-300">Track how positive news affects your wellbeing</p>
        </div>
        <Button
          onClick={() => setShowAddEntry(true)}
          className="bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Log Mood
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-orange-200 dark:border-gray-600">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800 dark:text-white">+{averageImprovement.toFixed(1)}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Average Improvement</div>
          </CardContent>
        </Card>
        <Card className="border-orange-200 dark:border-gray-600">
          <CardContent className="p-4 text-center">
            <Heart className="w-8 h-8 text-pink-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800 dark:text-white">{totalEntries}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Total Entries</div>
          </CardContent>
        </Card>
        <Card className="border-orange-200 dark:border-gray-600">
          <CardContent className="p-4 text-center">
            <Smile className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800 dark:text-white">
              {totalEntries > 0 ? Math.round((positiveEntries / totalEntries) * 100) : 0}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Positive Impact</div>
          </CardContent>
        </Card>
      </div>

      {/* Add Entry Modal */}
      {showAddEntry && (
        <Card className="border-orange-200 dark:border-gray-600 bg-gradient-to-r from-orange-50 to-pink-50 dark:from-gray-700 dark:to-gray-600">
          <CardHeader>
            <CardTitle>Log Your Mood</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">How did you feel before reading?</Label>
              <div className="flex gap-2 justify-center">
                {moodEmojis.map((emoji, index) => (
                  <Button
                    key={index}
                    variant={newEntry.beforeReading === index + 1 ? "default" : "outline"}
                    className="w-12 h-12 text-2xl p-0"
                    onClick={() => setNewEntry((prev) => ({ ...prev, beforeReading: index + 1 }))}
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
              <p className="text-center text-sm text-gray-600 dark:text-gray-300 mt-1">
                {moodLabels[newEntry.beforeReading - 1]}
              </p>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">How do you feel after reading?</Label>
              <div className="flex gap-2 justify-center">
                {moodEmojis.map((emoji, index) => (
                  <Button
                    key={index}
                    variant={newEntry.afterReading === index + 1 ? "default" : "outline"}
                    className="w-12 h-12 text-2xl p-0"
                    onClick={() => setNewEntry((prev) => ({ ...prev, afterReading: index + 1 }))}
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
              <p className="text-center text-sm text-gray-600 dark:text-gray-300 mt-1">
                {moodLabels[newEntry.afterReading - 1]}
              </p>
            </div>

            <div>
              <Label htmlFor="notes" className="text-sm font-medium mb-2 block">
                Notes (optional)
              </Label>
              <Textarea
                id="notes"
                value={newEntry.notes}
                onChange={(e) => setNewEntry((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="What made you feel this way? Any specific stories that stood out?"
                className="h-20"
              />
            </div>

            <div className="flex gap-3">
              <Button onClick={handleAddEntry} className="bg-green-600 hover:bg-green-700">
                Save Entry
              </Button>
              <Button variant="outline" onClick={() => setShowAddEntry(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mood History */}
      <Card className="border-orange-200 dark:border-gray-600">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            Recent Mood Entries
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userData.moodEntries.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">No mood entries yet</h3>
              <p className="text-gray-500 dark:text-gray-400">Start tracking how positive news affects your mood!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {userData.moodEntries.slice(0, 10).map((entry) => (
                <div key={entry.id} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-center">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      {new Date(entry.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{moodEmojis[entry.beforeReading - 1]}</span>
                      <span className="text-gray-400">→</span>
                      <span className="text-2xl">{moodEmojis[entry.afterReading - 1]}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Mood Change:</span>
                      <span
                        className={`text-sm font-bold ${
                          entry.improvement > 0
                            ? "text-green-600 dark:text-green-400"
                            : entry.improvement < 0
                              ? "text-red-600 dark:text-red-400"
                              : "text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        {entry.improvement > 0 ? "+" : ""}
                        {entry.improvement}
                      </span>
                    </div>
                    {entry.notes && <p className="text-sm text-gray-600 dark:text-gray-300 italic">"{entry.notes}"</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
