'use client'

import { useState, useTransition, useRef } from 'react'
import { updateProfile, changePassword } from './actions'

interface Profile {
  username: string
  bio: string | null
  avatar: string | null
  email: string
  created_at: string
}

export default function ProfileForm({ profile }: { profile: Profile }) {
  const [avatarUrl, setAvatarUrl] = useState(
    profile.avatar?.startsWith('http')
      ? profile.avatar
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.username)}&background=fb923c&color=fff&size=128`
  )
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [profileMsg, setProfileMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [pwMsg, setPwMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [isPendingProfile, startProfile] = useTransition()
  const [isPendingPw, startPw] = useTransition()
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      setUploadError('Ảnh không được vượt quá 2MB')
      return
    }
    setUploadError(null)
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const json = await res.json()
    setUploading(false)
    if (json.error) { setUploadError(json.error); return }
    setAvatarUrl(json.url)
  }

  function handleProfileSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setProfileMsg(null)
    const fd = new FormData(e.currentTarget)
    fd.set('avatar', avatarUrl)
    startProfile(async () => {
      const result = await updateProfile(fd)
      setProfileMsg(result.error
        ? { type: 'err', text: result.error }
        : { type: 'ok', text: 'Cập nhật thành công' }
      )
    })
  }

  function handlePwSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPwMsg(null)
    const fd = new FormData(e.currentTarget)
    if (fd.get('newPassword') !== fd.get('confirmPassword')) {
      setPwMsg({ type: 'err', text: 'Mật khẩu xác nhận không khớp' })
      return
    }
    startPw(async () => {
      const result = await changePassword(fd)
      setPwMsg(result.error
        ? { type: 'err', text: result.error }
        : { type: 'ok', text: 'Đổi mật khẩu thành công' }
      )
      if (!result.error) (e.target as HTMLFormElement).reset()
    })
  }

  return (
    <div className="space-y-8">
      {/* Avatar + thông tin cơ bản */}
      <div className="bg-white rounded-[2rem] p-8 shadow-sm">
        <h2 className="text-lg font-bold mb-6">Thông tin cá nhân</h2>

        {/* Avatar upload */}
        <div className="flex items-center gap-6 mb-8">
          <div className="relative">
            <img src={avatarUrl} alt="avatar" className="w-24 h-24 rounded-full object-cover border-4 border-orange-100" />
            {uploading && (
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                <i className="fa fa-spinner fa-spin text-white"></i>
              </div>
            )}
          </div>
          <div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="bg-orange-50 hover:bg-orange-100 text-orange-600 font-medium px-4 py-2 rounded-xl text-sm transition"
            >
              <i className="fa fa-camera mr-2"></i>
              {uploading ? 'Đang tải...' : 'Đổi ảnh đại diện'}
            </button>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG. Tối đa 2MB</p>
            {uploadError && <p className="text-xs text-red-500 mt-1">{uploadError}</p>}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              value={profile.email}
              disabled
              className="w-full bg-gray-100 rounded-xl px-4 py-3 text-gray-400 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tên người dùng</label>
            <input
              name="username"
              defaultValue={profile.username}
              required
              className="w-full bg-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Giới thiệu bản thân</label>
            <textarea
              name="bio"
              defaultValue={profile.bio ?? ''}
              rows={4}
              placeholder="Chia sẻ đôi điều về bạn..."
              className="w-full bg-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
            />
          </div>

          {profileMsg && (
            <p className={`text-sm ${profileMsg.type === 'ok' ? 'text-green-600' : 'text-red-500'}`}>
              {profileMsg.type === 'ok' ? <i className="fa fa-check mr-1"></i> : <i className="fa fa-times mr-1"></i>}
              {profileMsg.text}
            </p>
          )}

          <button
            type="submit"
            disabled={isPendingProfile || uploading}
            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold px-6 py-3 rounded-xl transition"
          >
            {isPendingProfile ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </form>
      </div>

      {/* Đổi mật khẩu */}
      <div className="bg-white rounded-[2rem] p-8 shadow-sm">
        <h2 className="text-lg font-bold mb-6">Đổi mật khẩu</h2>
        <form onSubmit={handlePwSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu mới</label>
            <input
              name="newPassword"
              type="password"
              required
              minLength={6}
              placeholder="Tối thiểu 6 ký tự"
              className="w-full bg-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Xác nhận mật khẩu mới</label>
            <input
              name="confirmPassword"
              type="password"
              required
              placeholder="••••••••"
              className="w-full bg-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {pwMsg && (
            <p className={`text-sm ${pwMsg.type === 'ok' ? 'text-green-600' : 'text-red-500'}`}>
              {pwMsg.type === 'ok' ? <i className="fa fa-check mr-1"></i> : <i className="fa fa-times mr-1"></i>}
              {pwMsg.text}
            </p>
          )}

          <button
            type="submit"
            disabled={isPendingPw}
            className="bg-gray-800 hover:bg-gray-900 disabled:opacity-60 text-white font-bold px-6 py-3 rounded-xl transition"
          >
            {isPendingPw ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
          </button>
        </form>
      </div>
    </div>
  )
}
