import React, { useEffect, useState } from "react"
import authService from "../../services/authService"
import toast from "react-hot-toast"
import PageHeader from "../../components/common/PageHeader"
import Button from "../../components/common/Button"
import Spinner from "../../components/common/Spinner"
import { User, Mail, Lock } from "lucide-react"
import Input from "../../components/common/Input"

const ProfilePage = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)

  const [form, setForm] = useState({
    name: "",
    email: "",
    avatar: null
  })

  const [preview, setPreview] = useState(null)

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })

  ////////////////////////////////////////////////////////
  // Fetch Profile
  ////////////////////////////////////////////////////////

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await authService.getProfile()
        setUser(data)
        setForm({ name: data.name, email: data.email })
        setPreview(data.avatar || null)
      } catch {
        toast.error("Failed to load profile")
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  ////////////////////////////////////////////////////////
  // Avatar Preview
  ////////////////////////////////////////////////////////

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    setForm({ ...form, avatar: file })
    setPreview(URL.createObjectURL(file))
  }

  ////////////////////////////////////////////////////////
  // Update Profile
  ////////////////////////////////////////////////////////

  const handleUpdate = async (e) => {
    e.preventDefault()

    if (!form.name.trim()) {
      return toast.error("Name is required")
    }

    try {
      setSaving(true)
      const updated = await authService.updateProfile(form)
      setUser(updated)
      toast.success("Profile updated successfully")
    } catch {
      toast.error("Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  ////////////////////////////////////////////////////////
  // Password Strength
  ////////////////////////////////////////////////////////

  const getPasswordStrength = () => {
    const { newPassword } = passwordData
    if (newPassword.length < 6) return "Weak"
    if (newPassword.length < 10) return "Medium"
    return "Strong"
  }

  ////////////////////////////////////////////////////////
  // Change Password
  ////////////////////////////////////////////////////////

  const handleChangePassword = async (e) => {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error("Passwords do not match")
    }

    try {
      setChangingPassword(true)
      await authService.changePassword(passwordData)
      toast.success("Password changed successfully")
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      })
    } catch (err) {
      toast.error(err?.error || "Failed to change password")
    } finally {
      setChangingPassword(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    )
  }

  return (
  <div className="min-h-screen bg-slate-50 py-14 px-6">

    <div className="max-w-5xl mx-auto space-y-12">

      <PageHeader title="Profile Settings" />

      {/* Account Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-10 hover:shadow-md transition duration-300">

        <h3 className="text-2xl font-semibold text-slate-800 mb-8">
          Account Information
        </h3>

        <form onSubmit={handleUpdate} className="grid md:grid-cols-3 gap-10">

          {/* Avatar */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-32 h-32 rounded-full overflow-hidden border border-slate-300 shadow-sm">
              {preview ? (
                <img
                  src={preview}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                  <User size={40} />
                </div>
              )}
            </div>

            <label className="cursor-pointer text-sm font-medium text-indigo-600 hover:text-indigo-700 transition">
              Change Avatar
              <Input
                type="file"
                accept="image/*"
                hidden
                onChange={handleAvatarChange}
              />
            </label>
          </div>

          {/* Form Fields */}
          <div className="md:col-span-2 space-y-6">

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Name
              </label>
              <Input
                type="text"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl
                           focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                           transition duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Email
              </label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl
                           focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                           transition duration-200"
              />
            </div>

            <Button type="submit" disabled={saving}>
              {saving ? "Saving Changes..." : "Save Changes"}
            </Button>

          </div>
        </form>
      </div>

      {/* Password Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-10 hover:shadow-md transition duration-300">

        <h3 className="text-2xl font-semibold text-slate-800 mb-8">
          Change Password
        </h3>

        <form onSubmit={handleChangePassword} className="space-y-6 max-w-xl">

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Current Password
            </label>
            <Input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  currentPassword: e.target.value
                })
              }
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl
                         focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                         transition duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              New Password
            </label>
            <Input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  newPassword: e.target.value
                })
              }
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl
                         focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                         transition duration-200"
            />

            {passwordData.newPassword && (
              <p className="text-sm mt-2 text-slate-500">
                Strength:
                <span className="ml-2 font-medium text-indigo-600">
                  {getPasswordStrength()}
                </span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Confirm New Password
            </label>
            <Input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  confirmPassword: e.target.value
                })
              }
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl
                         focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                         transition duration-200"
            />
          </div>

          <Button type="submit" disabled={changingPassword}>
            {changingPassword ? "Updating Password..." : "Update Password"}
          </Button>

        </form>
      </div>

    </div>
  </div>
)
}

export default ProfilePage