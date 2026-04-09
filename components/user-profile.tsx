"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { type UserData, getUserData, updateUserData, deleteUserData, exportUserData } from "@/lib/user-data"
import { useNotifications } from "@/hooks/use-notifications"
import { emailService } from "@/lib/email-service"
import { useAuth } from "@/contexts/auth-context"
import { Mail, Calendar, Edit3, Save, X, Camera, Download, Trash2, Shield, Star, Lock } from "lucide-react"

export function UserProfile() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    bio: "",
    location: "",
  })
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const { success, info, warning, error } = useNotifications()
  const { user } = useAuth()

  useEffect(() => {
    const data = getUserData()
    setUserData(data)
    setEditForm({
      name: data.profile.name,
      email: data.profile.email,
      bio: data.profile.bio || "",
      location: data.profile.location || "",
    })
  }, [])

  const handleSave = async () => {
    if (!userData || !user) return

    const updatedData = {
      ...userData,
      profile: {
        ...userData.profile,
        ...editForm,
        updatedAt: new Date().toISOString(),
      },
    }

    updateUserData(updatedData)
    setUserData(updatedData)
    setIsEditing(false)

    // Collect changes for email notification
    const changes = []
    if (editForm.name !== userData.profile.name) {
      changes.push(`Name updated to: ${editForm.name}`)
    }
    if (editForm.email !== userData.profile.email) {
      changes.push(`Email updated to: ${editForm.email}`)
    }
    if (editForm.bio !== (userData.profile.bio || "")) {
      changes.push("Bio information updated")
    }
    if (editForm.location !== (userData.profile.location || "")) {
      changes.push(`Location updated to: ${editForm.location}`)
    }

    // Send email notification if there are changes
    if (changes.length > 0) {
      await emailService.sendPreferencesUpdatedEmail(user.email, user.name, changes)
    }

    success("Profile Updated!", "Your profile information has been successfully updated.")
  }

  const handlePasswordChange = async () => {
    if (!user) return

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      error("Missing Information", "Please fill in all password fields.")
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      error("Password Mismatch", "New password and confirmation do not match.")
      return
    }

    if (passwordForm.newPassword.length < 6) {
      error("Weak Password", "Password must be at least 6 characters long.")
      return
    }

    // In a real app, you'd validate the current password
    // For demo purposes, we'll simulate success
    await emailService.sendPasswordChangedEmail(user.email, user.name)

    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    })
    setIsChangingPassword(false)

    success("Password Changed!", "Your password has been updated successfully. Check your email for confirmation.")
  }

  const handleCancel = () => {
    if (!userData) return
    setEditForm({
      name: userData.profile.name,
      email: userData.profile.email,
      bio: userData.profile.bio || "",
      location: userData.profile.location || "",
    })
    setIsEditing(false)

    info("Changes Cancelled", "Your profile changes have been discarded.")
  }

  const handleExport = () => {
    exportUserData()
    success("Data Exported!", "Your account data has been downloaded to your device.")
  }

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      deleteUserData()
      warning("Account Deleted", "Your account has been permanently deleted. You will be redirected to the home page.")
      setTimeout(() => {
        window.location.href = "/"
      }, 3000)
    }
  }

  if (!userData) return <div>Loading...</div>

  const joinDate = new Date(userData.profile.createdAt).toLocaleDateString()
  const stats = {
    storiesRead: userData.readingHistory.length,
    bookmarked: userData.bookmarks.length,
    comments: userData.interactions.comments.length,
    likes: userData.interactions.likes.length,
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Your Profile</h1>
          <p className="text-gray-600 dark:text-gray-300">Manage your personal information and preferences</p>
        </div>
        {!isEditing && !isChangingPassword && (
          <div className="flex gap-2">
            <Button
              onClick={() => setIsChangingPassword(true)}
              variant="outline"
              className="border-orange-200 text-orange-600 hover:bg-orange-50"
            >
              <Lock className="w-4 h-4 mr-2" />
              Change Password
            </Button>
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-2">
          <Card className="border-orange-200 dark:border-gray-600">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-pink-50 dark:from-gray-700 dark:to-gray-600">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="w-20 h-20 border-4 border-white shadow-lg">
                    <AvatarImage src={userData.profile.avatar || "/placeholder.svg"} alt={userData.profile.name} />
                    <AvatarFallback className="bg-gradient-to-r from-orange-500 to-pink-600 text-white text-xl">
                      {userData.profile.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button
                      size="sm"
                      className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 bg-orange-500 hover:bg-orange-600"
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <div className="flex-1">
                  {isEditing ? (
                    <div className="space-y-2">
                      <Input
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        placeholder="Your name"
                        className="font-semibold text-lg"
                      />
                      <Input
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        placeholder="Your email"
                        type="email"
                      />
                    </div>
                  ) : (
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 dark:text-white truncate">
                        {userData.profile.name}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-300 flex items-center gap-2 truncate">
                        <Mail className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{userData.profile.email}</span>
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1">
                        <Calendar className="w-4 h-4" />
                        Member since {joinDate}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {isChangingPassword ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Change Password</h3>
                  <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      placeholder="Enter current password"
                    />
                  </div>
                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      placeholder="Enter new password"
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      placeholder="Confirm new password"
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button onClick={handlePasswordChange} className="bg-green-600 hover:bg-green-700">
                      <Save className="w-4 h-4 mr-2" />
                      Update Password
                    </Button>
                    <Button variant="outline" onClick={() => setIsChangingPassword(false)}>
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <Label htmlFor="bio" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Bio
                    </Label>
                    {isEditing ? (
                      <textarea
                        id="bio"
                        value={editForm.bio}
                        onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                        placeholder="Tell us about yourself..."
                        className="w-full mt-1 p-3 border border-gray-300 dark:border-gray-600 rounded-md resize-none h-20 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    ) : (
                      <p className="text-gray-600 dark:text-gray-300 mt-1 break-words">
                        {userData.profile.bio || "No bio added yet. Share something about yourself!"}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="location" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Location
                    </Label>
                    {isEditing ? (
                      <Input
                        id="location"
                        value={editForm.location}
                        onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                        placeholder="Your location"
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-gray-600 dark:text-gray-300 mt-1 truncate">
                        {userData.profile.location || "Location not specified"}
                      </p>
                    )}
                  </div>

                  {isEditing && (
                    <div className="flex gap-3 pt-4">
                      <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                      <Button variant="outline" onClick={handleCancel}>
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Stats & Actions */}
        <div className="space-y-6">
          {/* Stats Card */}
          <Card className="border-orange-200 dark:border-gray-600">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Your Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.storiesRead}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Stories Read</div>
                </div>
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.bookmarked}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Bookmarked</div>
                </div>
                <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.comments}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Comments</div>
                </div>
                <div className="text-center p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">{stats.likes}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Likes Given</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions Card */}
          <Card className="border-orange-200 dark:border-gray-600">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                Account Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                onClick={handleExport}
                className="w-full justify-start border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-400 bg-transparent"
              >
                <Download className="w-4 h-4 mr-2" />
                Export My Data
              </Button>
              <Button
                variant="outline"
                onClick={handleDelete}
                className="w-full justify-start border-red-200 text-red-600 hover:bg-red-50 dark:border-red-600 dark:text-red-400 bg-transparent"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
